
var Sidebar = function() {
     // Initialize the sidebar with a default view 
     function initialize(){
          displayConstraints();
          displayViewOptions();
          displayPersonas();  
          displayCommunities();
          displayHistory();
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
          $("#list-history").on("click", ".history-paper-link", clickHistoryPaperHandler);
          $(".sidebar-fixed").on("click", ".toggle", clickToggle);
          $(".sidebar-fixed").on("click", ".toggle-options", clickHeaderHandler);

          $(document).on("addHistory", addHistoryHandler);
          $(document).on("updateHistoryAccepted", updateHistoryHandler);
          $(document).on("updateHistoryFailed", updateHistoryHandler);
     }

     function updateHistoryHandler(event, t){
          // find the matching localHash
          var $item;
          $("#list-history li").each(function(index, item){
               // console.log($(item).attr("data-local-hash"), t.localHash);
               if (typeof $(item).attr("data-local-hash") !== "undefined" && $(item).attr("data-local-hash") == t.localHash){
                    $item = $(item);
               }
          });
          
          if (typeof $item !== "undefined"){
               if (event.type == "updateHistoryAccepted")
                    $item.find(".status").removeClass("icon-exclamation-sign").addClass("icon-ok");
               else if (event.type == "updateHistoryFailed")
                    $item.find(".status").removeClass("icon-exclamation-sign").addClass("icon-remove");
          }
     }

     function addHistoryHandler(event, t){
          console.log("HISTORY", t);
          // hack that fixes the bug where when history is open with 0 items, prepend doesn't work because height is automatically set to 0px.
          // so force height to be auto when collapsed
          if ($("#list-history").hasClass("in"))
               $("#list-history").css("height", "auto");
          
          if (isTransactionSessionLevel(t))
               displaySessionHistory(t);
          else 
               displayPaperHistory(t);

          var count = $("#history-count").html();
          $("#history-count").html(parseInt(count)+1);
     }

     function displaySessionHistory(t){
          var $link, $li;
          var $statusLabel = isTransactionMyChange(t) ? $("<span/>").addClass("status icon-exclamation-sign") : $("<span/>").addClass("status icon-ok");
          var user = isTransactionMyChange(t) ? "" : getUsernameByUID(t.uid);
          $li = $("<li/>").attr("data-local-hash", t.localHash).append($statusLabel).append(user + " ").append($("<strong/>").wrapInner(typeDisplayList[t.type])).append(": ");
          
          if (t.type.indexOf("swap") !== -1){
               $link = getCellLinkByID(t.data.s1id);
               var $link2 = getCellLinkByID(t.data.s2id);
               $li = $li.append($link).append(" and ").append($link2);    

          } else {
               $link = (typeof t.data.id === "undefined") ? getCellLinkByDateTimeRoom(t.data.date, t.data.time, t.data.room) : getCellLinkByID(t.data.id);
               $li = $li.append($link);
          }

          $("#list-history").prepend($li);
     }

     function displayPaperHistory(t){
          var $link, $li;
          var $statusLabel = isTransactionMyChange(t) ? $("<span/>").addClass("status icon-exclamation-sign") : $("<span/>").addClass("status icon-ok");
          var user = isTransactionMyChange(t) ? "" : getUsernameByUID(t.uid);
          $li = $("<li/>").attr("data-local-hash", t.localHash).append($statusLabel).append(user + " ").append($("<strong/>").wrapInner(typeDisplayList[t.type])).append(": ");
          
          if (t.type.indexOf("swap") !== -1){
               if (t.type == "swapPapers"){
                    $link = getPaperCellLinkByID(t.data.s1id, t.data.p2id);
                    var $link2 = getPaperCellLinkByID(t.data.s2id, t.data.p1id);
                    $li = $li.append($link).append(" and ").append($link2); 
               } else if (t.type == "swapWithUnscheduledPaper"){
                    $link = getPaperCellLinkByID(undefined, t.data.p2id);
                    var $link2 = getPaperCellLinkByID(t.data.s2id, t.data.p1id);
                    $li = $li.append($link).append(" and ").append($link2); 
               }                  

          } else {
               console.log(t.type, t.data);
               if (t.type == "unschedulePaper")
                    $link = getPaperCellLinkByID(undefined, t.data.pid);
               else if (t.type == "schedulePaper")
                    $link = getPaperCellLinkByID(t.data.sid, t.data.pid);
               else if (t.type == "movePaper")
                    $link = getPaperCellLinkByID(t.data.s2id, t.data.p1id);
               else if (t.type == "reorderPapers")
                    $link = getPaperCellLinkByID(t.data.id, "");
               $li = $li.append($link);
          }

          $("#list-history").prepend($li);
     }

     function clickHeaderHandler(){
          //console.log("here", $(this).find("span.toggle-icon"));
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
                    options.push($(this).attr("data-type"));
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
          var selected_constraint = $(this).parent().attr("data-type");
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
          switch($(this).parent().attr("data-type")){
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
                    selected_personas.push($(this).parent().attr("data-type"))
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
                    selected_communities.push($(this).parent().attr("data-type"))
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
          var id = $(this).attr("data-session-id");
          var toggle = true;
          if ($(this).hasClass("view-option-active"))
               toggle = false;

          $("#list-history .view-option-active").removeClass("view-option-active");
          $(".highlight").removeClass("highlight");
          
          var $cell;
          if (typeof id === "undefined") {
	          $cell = findCellByDateTimeRoom($(this).attr("data-slot-date"), $(this).attr("data-slot-time"), $(this).attr("data-slot-room"));
	     }
          else
               $cell = findCellByID(id);

          if (toggle) {
               $(this).addClass("view-option-active");
               $("body").animate({
                    scrollTop:$cell.offset().top - 100
               }, 500);
               //$(document).scrollTop( $(cell).offset().top - 100); 
               $cell.addClass("highlight"); //.popover("toggle");               
          } else {
               $cell.removeClass("highlight");               
          }

          return false;
     } 

     function clickHistoryPaperHandler(){
          var id = $(this).attr("data-session-id");
          var paperId = $(this).attr("data-submission-id");
          var toggle = true;
          if ($(this).hasClass("view-option-active"))
               toggle = false;

          $("#list-history .view-option-active").removeClass("view-option-active");
          $(".highlight").removeClass("highlight");
          
          var $cell;
          if (typeof id === "undefined") {
               //cell = findCellByDateTimeRoom($(this).attr("data-slot-date"), $(this).attr("data-slot-time"), $(this).attr("data-slot-room"));
               $cell = $("#unscheduled-papers #" + paperId);
          }
          else
               $cell = findCellByID(id);

          if (toggle) {
               $(this).addClass("view-option-active");
               $("body").animate({
                    scrollTop:$cell.offset().top - 100
               }, 500);
               //$(document).scrollTop( $(cell).offset().top - 100); 
               $cell.addClass("highlight"); //.popover("toggle");               
          } else {
               $cell.removeClass("highlight");               
          }

          return false;
     } 

     // Display the constraints list
	function displayConstraints(){
     	$.each(constraints_list, function(index, constraint){
     		var item = document.createElement("li");
     		$(item).attr("data-type", constraint.type).html("<a href='#'><span class='palette'></span>" 
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
     		$(item).attr("data-type", option.id).html("<a href='#'>" + option.label + "</a>");
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
      		$(item).attr("data-type", persona).html("<input type='checkbox' class='myCheckbox'> <a href='#'>" + persona + "</a>");
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
               $(item).attr("data-type", community).html("<input type='checkbox' class='myCheckbox'> <a href='#'>" + community + "</a>");
               $("#list-communities").append($(item));              
               //$(item).find("span.palette").css("background-color", color_palette_1[5]);
               //color_index++;
          });
     }

     function displayHistory(){
          $("#history-count").html(0);
     }

     return {
          initialize: initialize,
          getActiveOptions: getActiveOptions
     };
}();
