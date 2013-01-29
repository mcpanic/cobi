
var Sidebar = function() {
     // Initialize the sidebar with a default view 
     function initialize(){
          displayConstraints();
          displayViewOptions();
          displayPersonas();  
          displayCommunities();
          bindEvents();
     }

     // Add event handlers to each sidebar item
     function bindEvents(){
          $("#list-constraints").on("click", "li a", clickConstraintsHandler);          
          $("#list-view-options").on("click", "li a", clickViewOptionsHandler);
          $("#list-personas").on("click", "li a", clickPersonasHandler);
          $("#list-personas").on("click", ".myCheckbox", clickCheckboxPersonasHandler); 
          $("#list-communities").on("click", "li a", clickCommunitiesHandler);
          $("#list-communities").on("click", ".myCheckbox", clickCheckboxCommunitiesHandler);          
          $("#list-history").on("click", ".history-link", clickHistoryHandler);
          $(".sidebar-fixed").on("click", ".toggle", clickToggle);
          $(".sidebar-fixed").on("click", ".toggle-options", clickHeaderHandler);
     }

     function clickHeaderHandler(){
          console.log("here", $(this).find("span.toggle-icon"));
          if ($(this).find("span.toggle-icon").hasClass("icon-chevron-right"))
               $(this).find("span.toggle-icon").removeClass("icon-chevron-right").addClass("icon-chevron-down");
          else
               $(this).find("span.toggle-icon").removeClass("icon-chevron-down").addClass("icon-chevron-right");
     }

     function clickToggle(){
          $("#list-" + $(this).attr("id").substring(7)).toggle();
          var text = $(this).text() == "show" ? "hide" : "show";
          $(this).text(text);
     }

     // Return any active options for a given sidebar menu
     // Menu: constraints / view-options / personas
     function getActiveOptions(menu){
          var options = [];
          if ($("#list-" + menu + " .view-option-active").length === 0) 
               return;
          else {
               $("#list-" + menu + " .view-option-active").each(function(){
                    options.push($(this).data("type"));
               });
          }
          return options;
     }


     function clickConstraintsHandler(){
          var $this = $(this);
          var toggle = true;
          if ($(this).parent().hasClass("view-option-active"))
               toggle = false;
          $("#list-constraints .view-option-active").removeClass("view-option-active");
          if (toggle)
              $(this).parent().addClass("view-option-active");
          var selected_constraint = $(this).parent().data("type");
          $(".slot:not('.unavailable'):not('.empty')").each(function(index, item){
               if (isSpecialCell($(item)))
                    return;
               $(item).css("background-color", "");
               var id = $(item).attr("id").substr(8);
               var session = allSessions[id];     
               var color = ""; // default white
               if (toggle)
                    color = $this.find(".palette").css("background-color");
               $.each(conflictsBySession[id], function(index, constraint){
                    if (constraint.type == selected_constraint){
                         $(item).css("background-color", color);
                    }
               });
          });
         return false;          
     }

     function clickViewOptionsHandler(){
          $("#list-view-options .view-option-active").removeClass("view-option-active");
          $(this).parent().addClass("view-option-active");
          switch($(this).parent().data("type")){
               case "session-type":
                    $(".slot:not('.unavailable'):not('.empty')").each(function(index, item){
                         var id = $(item).attr("id").substr(8);
                         var session = allSessions[id];
                         $(item).find(".display").html(session.venue);
                    });
               break;
               case "conflicts":
               /*
                    $(".slot:not('.unavailable'):not('.empty')").each(function(index, item){
                         var id = $(item).attr("id").substr(8);
                         $(item).find(".display").html("");
                         displayConflicts(conflictsBySession[id], $(item).find(".display"));
                         //$(item).find(".display").html(conflictsBySession[id]);
                    });*/
                    updateConflicts();
               break;                 
               case "popularity":
                    $(".slot:not('.unavailable'):not('.empty')").each(function(index, item){
                         var id = $(item).attr("id").substr(8);
                         $(item).find(".display").html(sessionPopularity[id]);
                    });
               break;               
               case "num-papers":
                    $(".slot:not('.unavailable'):not('.empty')").each(function(index, item){
                         var id = $(item).attr("id").substr(8);
                         var session = allSessions[id];
                         $(item).find(".display").html(getSessionNumSubmissions(session.submissions));
                    });
               break;
               case "duration":
                    $(".slot:not('.unavailable'):not('.empty')").each(function(index, item){
			    
                         var id = $(item).attr("id").substr(8);
                         var session = allSessions[id];
			 //$(item).find(".display").html("80");
			 $(item).find(".display").html(getSessionDuration(session.submissions));
			});
               break;
               case "awards":
                    $(".slot:not('.unavailable'):not('.empty')").each(function(index, item){
                         var id = $(item).attr("id").substr(8);
                         var session = allSessions[id];
                         if (session.hasAward)
                              $(item).find(".display").html("<img src='img/best-paper.png' class='icon'/>");
                         else
                              $(item).find(".display").html("");
                    });
               break;
               case "honorable-mentions":
                    $(".slot:not('.unavailable'):not('.empty')").each(function(index, item){
                         var id = $(item).attr("id").substr(8);
                         var session = allSessions[id];                         
                         if (session.hasHonorableMention)
                             $(item).find(".display").html("<img src='img/nominee.png' class='icon'/>");
                         else
                             $(item).find(".display").html(""); 
                    });                           
               break;
               case "persona":
                    $(".slot:not('.unavailable'):not('.empty')").each(function(index, item){
                         var id = $(item).attr("id").substr(8);
                         var session = allSessions[id];
                         $(item).find(".display").html(keys(session.personas).map(function(x) {return personaHash[x]}));
                    });
               break;
               default:
               break;
          }
          return false;     
     }

     function clickCheckboxPersonasHandler(){
          $(this).parent().find("a").trigger("click");
     }
     
     function clickPersonasHandler(event){
          var $this = $(this);
          if ($this.parent().hasClass("view-option-active")) {
               $this.parent().removeClass("view-option-active");
               $this.parent().find(".myCheckbox").prop("checked", false);
          } else {
               $this.parent().addClass("view-option-active");
               $this.parent().find(".myCheckbox").prop("checked", true);
          }
          
          // get current selections. allowing multiple selections. 
          var selected_personas = [];
          $("#list-personas li a").each(function(){
               if ($(this).parent().hasClass("view-option-active")) {
		   // console.log($(this).parent().data("type"));
                    selected_personas.push($(this).parent().data("type"))
               }
                    //arr.splice(arr.indexOf('specific'), 1);
          });
          
          $(".slot:not('.unavailable'):not('.empty')").each(function(index, item){
               if (isSpecialCell($(item)))
                    return;
               $(item).css("background-color", "");
               var id = $(item).attr("id").substr(8);
               var session = allSessions[id];     
	       // HQ: slight changes here
	       if (selected_personas.indexOf(session.personas) != -1){
		   $(item).css("background-color", color_palette_1[5]);
	       }
//                $.each(keys(session.personas), function(index, key){
//                     if (selected_personas.indexOf(key) != -1){
//                          $(item).css("background-color", color_palette_1[5]);
//                     }
//                });
          });
         return false;
     }

     function clickCheckboxCommunitiesHandler(){
          $(this).parent().find("a").trigger("click");
     }
     
     function clickCommunitiesHandler(event){
          var $this = $(this);
          if ($this.parent().hasClass("view-option-active")) {
               $this.parent().removeClass("view-option-active");
               $this.parent().find(".myCheckbox").prop("checked", false);
          } else {
               $this.parent().addClass("view-option-active");
               $this.parent().find(".myCheckbox").prop("checked", true);
          }
          
          // get current selections. allowing multiple selections. 
          var selected_communities = [];
          $("#list-communities li a").each(function(){
               if ($(this).parent().hasClass("view-option-active")) {
                    //console.log($(this).parent().data("type"));
                    selected_communities.push($(this).parent().data("type"))
               }
                    //arr.splice(arr.indexOf('specific'), 1);
          });
          
          $(".slot:not('.unavailable'):not('.empty')").each(function(index, item){
               if (isSpecialCell($(item)))
                    return;
               $(item).css("background-color", "");
               var id = $(item).attr("id").substr(8);
               var session = allSessions[id];     
               $.each(session.coreCommunities, function(index, key){
                    if (selected_communities.indexOf(key) != -1){
                         $(item).css("background-color", color_palette_1[4]);
                    }
               });
          });
         return false;
     }

     function clickHistoryHandler(){
          var id = $(this).data("session-id");
          var toggle = true;
          if ($(this).hasClass("view-option-active"))
               toggle = false;

          $("#list-history .view-option-active").removeClass("view-option-active");
          $(".highlight").removeClass("highlight");
          
          var cell = null;
          if (typeof id === "undefined") {
	          //               cell = findCellByDateTimeRoom($(this).parent().data("date"), $(this).parent().data("time"), $(this).parent().data("room"));
	          cell = findCellByDateTimeRoom($(this).data("slot-date"), $(this).data("slot-time"), $(this).data("slot-room"));
	     }
          else
               cell = findCellByID(id);

          if (toggle) {
               $(this).addClass("view-option-active");
               $("body").animate({
                    scrollTop:$(cell).offset().top - 100
               }, 500);
               //$(document).scrollTop( $(cell).offset().top - 100); 
               $(cell).addClass("highlight"); //.popover("toggle");               
          } else {
               $(cell).removeClass("highlight");               
          }

          return false;
     } 

     // Display the constraints list
	function displayConstraints(){
     	$.each(constraints_list, function(index, constraint){
     		var item = document.createElement("li");
     		$(item).data("type", constraint.type).html("<a href='#'><span class='palette'></span>" 
                    + constraint.label 
                    + "</a>"
                    + " (<span class='count'></span>)"
                    );
     		$("#list-constraints").append($(item));
     		$(item).find("span.palette").css("background-color", constraint.color);
      	});
	}

     // Display the View options list
     function displayViewOptions(){
     	$.each(options_list, function(index, option){
     		var item = document.createElement("li");
     		$(item).data("type", option.id).html("<a href='#'>" + option.label + "</a>");
     		$("#list-view-options").append($(item));
      	});
      	$("#list-view-options li:first-child").addClass("view-option-active");
     }

     // Display the persona list
     function displayPersonas(){
          //var color_index = 0;
	 // HQ: minor changes here
     	$.each(personaList, function(index, persona){
     		var item = document.createElement("li");
      		$(item).data("type", persona).html("<input type='checkbox' class='myCheckbox'> <a href='#'>" + persona + "</a>");
     		$("#list-personas").append($(item));    		
     		//$(item).find("span.palette").css("background-color", color_palette_1[5]);
               //color_index++;
     	});
     }

     // Display the communities list
     function displayCommunities(){
          //var color_index = 0;
	 // HQ: minor changes here;
//           var commList = [];
//           for (id in allSessions){
//                if (allSessions[id].coreCommunities.length > 0)
//                     $.each(allSessions[id].coreCommunities, function(i,v){
//                          commList.push(v);
//                     });
//           }
// //          console.log($.unique(dl));
//           commList = $.unique(commList);
	 var commList = communityList;
          $.each(commList, function(index, community){
               var item = document.createElement("li");
               $(item).data("type", community).html("<input type='checkbox' class='myCheckbox'> <a href='#'>" + community + "</a>");
               $("#list-communities").append($(item));              
               //$(item).find("span.palette").css("background-color", color_palette_1[5]);
               //color_index++;
          });
     }

     return {
          initialize: initialize,
          getActiveOptions: getActiveOptions
     };
}();
