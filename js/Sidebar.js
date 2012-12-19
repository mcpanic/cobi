
var Sidebar = function() {
     // Initialize the sidebar with a default view 
     function initialize(){
          displayConstraints();
          displayViewOptions();
          displayPersonas();  
          bindEvents();
     }

     // Add event handlers to each sidebar item
     function bindEvents(){
          $("#list-constraints").on("click", "li a", clickConstraintsHandler);          
          $("#list-view-options").on("click", "li a", clickViewOptionsHandler);
          $("#list-personas").on("click", "li a", clickPersonasHandler);
          $("#list-history").on("click", ".history-link", clickHistoryHandler);
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
                         $(item).find(".display").html(session.type);
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
                         $(item).find(".display").html("80");
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

     
     function clickPersonasHandler(){
          var $this = $(this);
          if ($this.parent().hasClass("view-option-active")) {
               $this.parent().removeClass("view-option-active");
               $this.find(".myCheckbox").prop("checked", false);
          } else {
              $this.parent().addClass("view-option-active");
              $this.find(".myCheckbox").prop("checked", true);
         }
          
          // get current selections. allowing multiple selections. 
          var selected_personas = [];
          $("#list-personas li a").each(function(){
               if ($(this).parent().hasClass("view-option-active")) {
                    //console.log($(this).parent().data("type"));
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
               $.each(keys(session.personas), function(index, key){
                    if (selected_personas.indexOf(key) != -1){
                         $(item).css("background-color", color_palette_1[5]);
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
          if (typeof id === "undefined")
               cell = findCellByDateTimeRoom($(this).parent().data("date"), $(this).parent().data("time"), $(this).parent().data("room"));
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
     	$.each(personaHash, function(index, persona){
     		var item = document.createElement("li");
      		$(item).data("type", index).html("<a href='#'><input type='checkbox' class='myCheckbox'> " + persona + "</a>");
     		$("#list-personas").append($(item));    		
     		//$(item).find("span.palette").css("background-color", color_palette_1[5]);
               //color_index++;
     	});
     }

     return {
          initialize: initialize,
          getActiveOptions: getActiveOptions
     };
}();
