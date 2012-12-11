
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
               $(item).css("background-color", "white");
               var id = $(item).attr("id").substr(8);
               var session = allSessions[id];     
               var color = "#FFFFFF"; // default white
               if (toggle)
                    color = $this.find(".palette").css("background-color");
               //session.personas.contains(selected_persona);
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
                    $(".slot:not('.unavailable'):not('.empty')").each(function(index, item){
                         var id = $(item).attr("id").substr(8);
                         $(item).find(".display").html("");
                         displayConflicts(conflictsBySession[id], $(item).find(".display"));
                         //$(item).find(".display").html(conflictsBySession[id]);
                    });
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
          var toggle = true;
          if ($(this).parent().hasClass("view-option-active"))
               toggle = false;
          $("#list-personas .view-option-active").removeClass("view-option-active");
          if (toggle)
              $(this).parent().addClass("view-option-active");
          var selected_persona = $(this).parent().data("type");
          $(".slot:not('.unavailable'):not('.empty')").each(function(index, item){
               $(item).css("background-color", "white");
               var id = $(item).attr("id").substr(8);
               var session = allSessions[id];     
               var color = "#FFFFFF"; // default white
               if (toggle)
                    color = $this.find(".palette").css("background-color");
               //session.personas.contains(selected_persona);
               $.each(keys(session.personas), function(index, key){
                    if (key == selected_persona){
                         $(item).css("background-color", color);
                    }
               });
          });
         return false;
     }


     function clickHistoryHandler(){
          var id = $(this).data("session-id");
          $(this).toggleClass("view-option-active");

          var cell = null;
          if (typeof id === "undefined")
               cell = getCellByDateTimeRoom($(this).parent().data("date"), $(this).parent().data("time"), $(this).parent().data("room"));
          else
               cell = $("#session-" + id)

          $(cell).toggleClass("highlight").popover("toggle");
          return false;
     } 

     // Display the constraints list
	function displayConstraints(){
     	$.each(constraints_list, function(index, constraint){
     		var item = document.createElement("li");
     		$(item).data("type", constraint.type).html("<a href='#'><span class='palette'></span>" + constraint.label + "</a>");
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
          var color_index = 0;
     	$.each(personaHash, function(index, persona){
     		var item = document.createElement("li");
      		$(item).data("type", index).html("<a href='#'><span class='palette'></span>" + persona + "</a>");
     		$("#list-personas").append($(item));    		
     		$(item).find("span.palette").css("background-color", color_palette_1[color_index]);
               color_index++;
     	});
     	/*
     	$.each(personas_list, function(index, persona){
     		var item = document.createElement("li");
      		$(item).data("type", persona.id).html("<a href='#'><span class='palette'></span>" + persona.label + "</a>");
     		$("#list-personas").append($(item));    		
     		$(item).find("span.palette").css("background-color", persona.color);
     	});
		*/
     }

     return {
          initialize: initialize
     };
}();
