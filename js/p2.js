
     var allRooms = [];

     function keys(obj){
       var keys = [];

       for(var key in obj){
		   if(obj.hasOwnProperty(key)){
		       keys.push(key);
		   }
       }
       return keys;
     }

     function getAllRooms(){
		 var rooms = {};
		 var index = 0;
		 for(var day in sessions){
		     for(var time in sessions[day]){
			 for(var room in sessions[day][time]){
			     if(room in rooms){
			     }else{
				 rooms[room] = index;
				 index++;
			     }
			 }
		     }
		 }
	 	return rooms;
     }

// Reads the program into a schedule matrix (timeslots x rooms) and prints out a table
     function makeProgram(){
		 var scheduleMatrix = [];
		 var rooms = allRooms;
		 var numRooms = keys(rooms).length;
		 
		 var days = keys(sessions).sort(function(a,b) {
			 return parseInt(a.split(' ')[1]) - parseInt(b.split(' ')[1])
		     });
		 for(var i = 0; i < days.length; i++) {
		     var day = days[i];
		     for(var time in sessions[day]){
				 var sessionsAtTime = [day, time];
				 for(var j = 0; j < numRooms; j++){
				     sessionsAtTime.push("");
				 }   
				 for(var room in sessions[day][time]){
				     for(var ses in sessions[day][time][room]){
					 sessionsAtTime[rooms[room]+2] = sessions[day][time][room][ses];
				     }
				 }
				 scheduleMatrix.push(sessionsAtTime);
		     }
		 }
	 	return scheduleMatrix;
     }


     // Getting html for session details with individual paper info
     function getSessionDetail(submissions){
     	var html = "<button class='btn btn-info button-propose-swap'>Propose Swaps</button>"
     		+ "<button class='btn btn-danger button-unschedule'>Unschedule</button>";
     	$.each(submissions, function(index, submission){
     		html += "<div class='submission'><strong>" + submission.type + "</strong>: " + submission.title + "</div>";
     	});

     	return html;
     }

     function getSessionNumSubmissions(submissions){
     	var key, count = 0;
     	for (key in submissions){
     		count++;
     	}
     	return count;
     }

     function displayProgram(schedule){
		 var table = document.createElement('table');
		 
		 var orderedRooms = keys(allRooms).sort(function(a,b) { return allRooms[a] - allRooms[b];});
		 
		 var header = document.createElement('tr');
		 // leave one empty for 1st column
		 var firstcell = document.createElement('td');
		 var secondcell = document.createElement('td');
		 $(firstcell).text("Time");
		 $(secondcell).text("Violations");
		 $(header).append(firstcell);
		 $(header).append(secondcell);
		 for(var i = 0; i < orderedRooms.length; i++){
		     var cell = document.createElement('td');
		     $(cell).append(orderedRooms[i]);
		     $(cell).addClass("cell");
		     $(header).append(cell);
		 }
		 $("#program").append(header);

		 for(var i = 0; i < schedule.length; i++){
		     var row = document.createElement('tr');
		     var slot = document.createElement('td');
		     var violations = document.createElement('td');
		     $(slot).append(schedule[i][1]); // schedule[i][0]: full date. schedule[i][1]: time
		     $(row).append(slot);
		     
		     // getting a random violation for now
		     var violation = constraints_list[Math.floor(Math.random()*constraints_list.length)];
		     var palette = $("<span class='palette'></span>").css("background-color", violation.color);
		     $(violations).append(palette);

		     $(row).append(violations);

		     for(var j = 2; j < schedule[i].length; j++){
			 var cell = document.createElement('td');
			 $(cell).addClass("cell slot");
			 
			 if(schedule[i][j] != ""){
			 	$(cell).data("title", schedule[i][j].title);
			 	$(cell).data("session-type", schedule[i][j].type);
			 	$(cell).data("num-papers", getSessionNumSubmissions(schedule[i][j].submissions));
			 	$(cell).data("awards", schedule[i][j].hasAward);
			 	$(cell).data("honorable-mentions", schedule[i][j].hasHonorableMention);
			 	$(cell).data("duration", 80);
			 	// getting a random persona for now
			 	var persona = personas_list[Math.floor(Math.random()*personas_list.length)];
			 	$(cell).data("persona", persona.id);

			 	// default view: session type
			    $(cell).html(schedule[i][j].type);
			    
			    var detail = document.createElement("div");
			    $(detail).hide();
			    $(detail).addClass("detail").html(getSessionDetail(schedule[i][j].submissions));
			    $(cell).append($(detail));
			 } else {
			 	$(cell).addClass("empty");
			 }

			 $(row).append(cell);
		     }
		 	$('#program').append(row);
		 }

     }

     $("body").on("click", ".popover .button-propose-swap", function(){
		var $session = $(".selected").first();
     	$("#list-history").append("<li>swapped: " + $session.data("title") + "</li>");
     });

     $("body").on("click", ".popover .button-unschedule", function(){
     	var $session = $(".selected").first();
     	$("#list-history").append("<li>unscheduled: " + $session.data("title") + "</li>");

     	//var $cloned_session = $session.clone();
     	var $cloned_session = $session.clone(true, true);
     	//$cloned_session = $.extend({}, $cloned_session)
     	// not using clone(true) because it copies the events as well. Manually copy data
     	$session.removeClass("selected").popover("hide").addClass("empty").html("");
     	$cloned_session.removeClass("selected");
     	$("#unscheduled").append($cloned_session);

     });

     // Event handler for clicking an individual session
     $("#unscheduled").on("click", ".slot", function(){
     	// detect if the currently selected item is selected again.
     	var $selection = $("#unscheduled .selected");
     	var isSelected = $selection[0] == $(this)[0];
     	$selection.removeClass("selected").popover("hide");

     	// if reselected, do nothing.
     	if (isSelected)
     		return;

     	$(this).addClass("selected");
     	$(this).popover({
     		html:true,
     		title:function(){
     			return $(this).data("title");
     		},
     		content:function(){
     			return $(this).find(".detail").html();
     		}
     	});
     	$(this).popover("show");
     });

     // Event handler for clicking an individual session
     $("#program").on("click", ".slot", function(){
     	// detect if the currently selected item is selected again.
     	var $selection = $("#program .selected");
     	var isSelected = $selection[0] == $(this)[0];
     	$selection.removeClass("selected").popover("hide");

     	// if reselected, do nothing.
     	if (isSelected)
     		return;

     	$(this).addClass("selected");
     	$(this).popover({
     		html:true,
               placement: "bottom",
     		title:function(){
     			return $(this).data("title");
     		},
     		content:function(){
     			return $(this).find(".detail").html();
     		}
     	});
     	$(this).popover("show");
     });

     // Event handler for clicking an individual session
     $("#program").on("mouseover", ".slot", function(){
          // detect if the currently selected item is selected again.
          //var $selection = $("#program .selected");
          //var isSelected = $selection[0] == $(this)[0];
          //$selection.removeClass("selected").popover("hide");

          // if reselected, do nothing.
          //if (isSelected)
          //     return;

          //$(this).addClass("hovered");
          $(this).popover({
               html:true,
               trigger: "hover",
               title:function(){
                    return $(this).data("title");
               },
               content:function(){
                    return $(this).find(".detail").html();
               }
          });
          $(this).popover("show");
     });

     // Upon selecting a view option, change the view
     $("#list-view-options").on("click", "li a", function(){
     	switch($(this).parent().data("type")){
     		case "session-type":
     			$(".slot:not('.empty')").each(function(index, item){
     				$(item).html($(item).data("session-type"));
     			});
     		break;
     		case "num-papers":
     			$(".slot:not('.empty')").each(function(index, item){
     				$(item).html($(item).data("num-papers"));
     			});
     		break;
     		case "duration":
     			$(".slot:not('.empty')").each(function(index, item){
     				$(item).html($(item).data("duration"));
     			});
     		break;
     		case "awards":
     			$(".slot:not('.empty')").each(function(index, item){
     				if ($(item).data("awards"))
     					$(item).html("Y");
     				else
     					$(item).html("N");
     			});
     		break;
     		case "honorable-mentions":
     			$(".slot:not('.empty')").each(function(index, item){
     				if ($(item).data("honorable-mentions"))
     					$(item).html("Y");
     				else
     					$(item).html("N");
     			});     		     		
     		break;
     		case "persona":
     			$(".slot:not('.empty')").each(function(index, item){
     				$(item).html($(item).data("persona"));
     			});
     		break;
     		default:
     		break;
     	}
     });

function getViolationDetails(){
     var html = "";
     html = "<table class='table table-hover table-striped table-bordered'><tr><td>Author</td><td>Time</td><td>Sessions</td><td>Options</td></tr>"
          + "<tr><td>Robert C. Miller</td><td>Monday 9:00</td><td>Crowdsourcing(room1), Learning Technologies(room3)</td>"
          + "<td><button class='btn btn-info'>Propose solutions</button>  <button class='btn btn-danger'>Ignore</button></td></tr>"
          + "<tr><td>Steven Dow</td><td>Tuesday 10:40</td><td>Design(room2), AI(room4)</td>"
          + "<td><button class='btn btn-info'>Propose solutions</button>  <button class='btn btn-danger'>Ignore</button></td></tr>"
          + "</table>";
     return html;
}

	function displayConstraints(){
     	$.each(constraints_list, function(index, constraint){
     		var item = document.createElement("li");
     		$(item).data("type", constraint.id).html("<h3><a href='#'><span class='palette'></span>" + constraint.label + "</a></h3>");
     		$("#list-constraints").append($(item));
     		$(item).find("span.palette").css("background-color", constraint.color);
               $(item).append("<div class='detail'>" + getViolationDetails() + "</div>");
      	});
	}

     // Populate the View options list
     function displayViewOptions(){
     	$.each(options_list, function(index, option){
     		var item = document.createElement("li");
     		$(item).data("type", option.id).html("<a href='#'>" + option.label + "</a>");
     		$("#list-view-options").append($(item));
      	});
     }

     // Display the persona list
     function displayPersonas(){
     	$.each(personas_list, function(index, persona){
     		var item = document.createElement("li");
      		$(item).data("type", persona.id).html("<a href='#'><span class='palette'></span>" + persona.label + "</a>");
     		$("#list-personas").append($(item));    		
     		$(item).find("span.palette").css("background-color", persona.color);
     	});

     }
     $(document).ready(function() {
     	displayConstraints();

	     allRooms = getAllRooms();
	     var schedule = makeProgram();
	     displayProgram(schedule);
	 });
