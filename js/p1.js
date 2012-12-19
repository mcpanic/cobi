

    // Locate an empty session by its date, time, and room
    // Returns null when there is no such cell that's empty.
    function findCellByDateTimeRoom(cellDate, cellTime, cellRoom){
        var cell = null;
        $("#program .empty").each(function(){
            //console.log($(this).data("date"), $(this).data("time"), typeof $(this).data("room"), typeof cellRoom, $(this).data("room") == cellRoom, $(this).data("room") === cellRoom);
            if ($(this).data("date") == cellDate && $(this).data("time") == cellTime  && $(this).data("room") == cellRoom)
                cell = $(this);
        });
        return cell;
    }

    // return a frontend cell with given ID
    function findCellByID(id) {
        return $("#session-" + id); 
        /*
        $cell = null;
        $(".slot:not('.unavailable')").each(function(){
            if ($(this).attr("id").substr(8) == id)
                $cell = $(this);
        });
        return $cell;
        */
    }

     // Getting html for session details with individual paper info
     function getSessionDetail(type, session){
    	 // HQ: locked sessions get only a locked button
    	 var isLocked = false;
    	 if (type != "unscheduled" && typeof session !== "undefined" && session != null){
    	     //console.log(session);
    	     isLocked = scheduleSlots[session.date][session.time][session.room]['locked'];
    	 }

    	 var html = ""; 
    	 if(isLocked){
    	     html += "  <button class='btn btn-inverse button-unlock'>Unlock it</button> ";
    	 }else{
    	     var lockButton = "  <button class='btn btn-inverse button-lock'>Lock it</button> ";

    	     if (type == "scheduled") {
    		 html += "<button class='btn btn-info button-propose-swap'>Propose Swaps</button>"
    		     + "  <button class='btn btn-danger button-unschedule'>Unschedule</button> "
    		     + lockButton;
    	     } else if (type == "unscheduled") {
    		 html += "<button class='btn btn-info button-propose-unscheduled'>Propose Schedule</button>";
    	     } else if (type == "empty") {
    		 html += "<button class='btn btn-info button-propose-empty'>Propose Schedule</button>"
    		     + lockButton;
    	     }
    	 }

    	 if (typeof session !== "undefined" && session != null && typeof session.submissions !== "undefined" && session.submissions != null) {
    	     html += " <ul class='list-submissions'>";
    	     $.each(session.submissions, function(index, submission){
    		     html += "<li class='submission'><strong>" + submission.type + "</strong>: " 
                             + displayAuthors(submission.authors) + "<br>"
                             + "<strong>" + submission.title + "</strong></li>";
    		     
    		 });
    	     html += "</ul>";
    	 }
    	 return html;
     }



     // For each session item, display the session information
    function getSessionCell(type, session, slotDate, slotTime, slotRoom){
		var slotDate = typeof slotDate !== "undefined" ? slotDate : null;
        var slotTime = typeof slotTime !== "undefined" ? slotTime : null;
        var slotRoom = typeof slotRoom !== "undefined" ? slotRoom : null;
        var cell = document.createElement('td');
        $(cell).addClass("cell slot")
            .append("<div class='title'/><div class='display'/>");
        // console.log("session", typeof session);

        // Empty Session
		 if (type == "empty" || session == -1){
                console.log("empty", slotDate, slotTime, slotRoom);
                var detail = document.createElement("div");
                $(detail).hide()
                     .addClass("detail")
                     .html(getSessionDetail(type, session));
                // TODO: how to easily get day, time, room info
                $(cell)
                     //.attr("id", "session-" + session.id)
                     //.data("session-id", session.id)
                     .addClass("empty")
                     .append($(detail))
                     .data("date", slotDate)
                     .data("time", slotTime)
                     .data("room", slotRoom)
                     .html("<i class='icon-plus'></i>");

           // Unavailable / Locked Session                         
            } else if (type == "unavailable" || session == "") {
                //console.log("unavailable");
                $(cell).addClass("unavailable");
           
           // Scheduled / Unscheduled Session
            } else {
                if(type !== "unscheduled" && scheduleSlots[session.date][session.time][session.room]['locked'])
                    $(cell).addClass("locked");

                var detail = document.createElement("div");
                $(detail).hide()
                     .addClass("detail")
                     .html(getSessionDetail(type, session));
		 	
                $(cell).attr("id", "session-" + session.id)
                     .addClass(type)
                     .data("session-id", session.id)
                     .append($(detail));
                
                if (typeof session.title !== "undefined")
                     $(cell).find(".title").html(session.title);
                
		 } 
		 return cell;
    }

     function displayAuthors(authors){
          var html = "";         
          $.each(authors, function(i, author){
               html += author.firstName + " " + author.lastName + ", ";
          }); 
          return html;
     }

     // Given an array of "conflicts", display the palette and count for each constraint in the "element"
     // Can be used both for individual sessions and entire rows
     function displayConflicts(conflicts, element){
          if (typeof conflicts === "undefined")
               return;
          element.html("");
          var conflicts_array = conflicts.map(function(co) {return co.type});
          
          // for each constraint, count and add a modal dialog with descriptions
          $.each(constraints_list, function(index, conflict){
               var filtered_array = conflicts_array.filter(function(x){return x==conflict.type});
               if (filtered_array.length > 0) {
                    var html = "";
                    var i;
                    for (i=0; i<filtered_array.length; i++) {
                         html += "<span class='conflict-display'></span>";
                    }
                    var $palette = $(html).css("background-color", conflict.color);
                    element.append(filtered_array.length).append($palette);
                    var palette_title = "Conflicts: " + conflict.label;
                    var palette_content = conflicts.map(function(co) {
                         if (co.type == conflict.type)
                              return "<li>"+co.description+"</li>";
                    }).join("");
                    $palette.popover({
                         html:true,
                         placement: "bottom",
                         trigger: "hover",
                         title:function(){
                              return palette_title;
                         },
                         content:function(){
                              return palette_content;
                         }
                    });
                    //$palette.popover();           
               }
          });
     }

     function displayConflictPreviewHTML(netCount) {
        var html = "";
        for (var i=0; i<Math.abs(netCount); i++) {
            if (netCount > 0)
                html += "<span class='conflict-preview-added'>+</span>";
            else
                html += "<span class='conflict-preview-removed'>-</span>";
        }
        return html;
     }

     function displayConflictFullHTML(ment, input_array, conflict, sign) {
        if (input_array === null)
            return "";
        var html = ment;
        var filtered_array = input_array == null? []: input_array.filter(function(x){return x.type==conflict.type});
        for (var i=0; i<filtered_array.length; i++) {
            html += "<span class='conflict-preview-display'>" + sign + "</span>";
        }
        return html;
     }

     function getConflictLength(input_array, conflict) {
        var filtered_array = input_array == null? []: input_array.filter(function(x){return x.type==conflict.type});
        return filtered_array.length;
     }

     // Given a list of added and removed conflicts with a swap candidate,
     // display the preview to help make the decision to do the swap.
     function displayFullConflicts(swapValues, element){
          if (typeof swapValues === "undefined")
               return;

            var $session = $(".selected").first();
            var id = getID($session);  

          element.append("<div class='conflicts'/>");

          
          var filtered_array = [];          
          
          // for each constraint, count and add a modal dialog with descriptions
          $.each(constraints_list, function(index, conflict){  
            var html = displayConflictFullHTML("Added to source", swapValues.addedSrc, conflict, "+")
                + displayConflictFullHTML("Added to destination", swapValues.addedDest, conflict, "+")
                + displayConflictFullHTML("Removed from source", swapValues.removedSrc, conflict, "-")
                + displayConflictFullHTML("Removed from destination", swapValues.removedDest, conflict, "-");

            var netCount = getConflictLength(swapValues.addedSrc, conflict) + getConflictLength(swapValues.addedDest, conflict) 
                        - getConflictLength(swapValues.removedSrc, conflict) - getConflictLength(swapValues.removedDest, conflict);

            var $palette = $(html).css("background-color", conflict.color);
            var netCountClass = "conflict-netcount-added";
            if (netCount < 0)
                netCountClass = "conflict-netcount-removed";

            var ment = "";
            if (netCount > 0)
                ment += conflict.type + ": " + netCount + " conflicts will be resolved.";
            else
                ment += conflict.type + ": " + (-1)*netCount + " conflicts will be added.";

            element.find(".conflicts")
                .append("<div class='swap-total'>" + ment + "</div>")
                .append("<div class='conflict-type-preview'/>")
                .append("<span class='" + netCountClass + "'>" + addSign(netCount) + "</span>")
                .append($palette);             
          });
     }


     // Given a list of added and removed conflicts with a swap candidate,
     // display the preview to help make the decision to do the swap.
     function displayPreviewConflicts(swapValues, element){
          if (typeof swapValues === "undefined")
               return;
          element.html("");/*.append("<div class='swap-total'>" + addSign(swapValues.value) + "</div>")*/
          
          var filtered_array = [];          
          
          // for each constraint, count and add a modal dialog with descriptions
          $.each(constraints_list, function(index, conflict){  

            var netCount = getConflictLength(swapValues.addedSrc, conflict) + getConflictLength(swapValues.addedDest, conflict) 
                        - getConflictLength(swapValues.removedSrc, conflict) - getConflictLength(swapValues.removedDest, conflict);

            var $palette = $(displayConflictPreviewHTML(netCount)).css("background-color", conflict.color);
            var netCountClass = "conflict-netcount-added";
            if (netCount < 0)
                netCountClass = "conflict-netcount-removed";
            element.append("<div class='conflict-type-preview'/>")
                .append("<span class='" + netCountClass + "'>" + addSign(netCount) + "</span>")
                .append($palette);             
          });
     }

     // Refresh conflicts information display.
     // Called after an interaction occurs that affects conflicts. (swap, unschedule, schedule)
     function updateConflicts(){
          // Lazy operation: only run when the view mode is conflicts
          if (Sidebar.getActiveOptions("view-options").indexOf("conflicts") === -1)
               return;
          $(".slot").each(function(){
               var id = getID($(this));
               if (id !== -1)
                    displayConflicts(conflictsBySession[id], $(this).find(".display"));
          });
          
     }

     // Display textually the slot title. (slot data structure)
     // When session exists: Name of the session
     // When session is empty: show date, time, room
     function displaySlotTitle(slot) {
          if (slot.session === null) {
               return slot.date + " " + slot.time + " " + slot.room;
          } else {
               return allSessions[slot.session].title;
          }
     }

     // Display textually the session title.
     // When session exists: Name of the session
     // When session is empty: show date, time, room
     function displaySessionTitle(session) {
          if (session.hasClass("empty")) {
               return session.data("date") + " " + session.data("time") + " " + session.data("room");
          } else {
               console.log(session);
               return allSessions[getID(session)].title;
          }
     }

    // Update the unscheduled session count just by looking at the DOM nodes, not the database
     function updateUnscheduledCount(){
          var count = $("#unscheduled .slot").length;
          $("#unscheduled-count").html(count);
     }


     // Display the unscheduled panel
     function displayUnscheduled(){
          keys(unscheduled).map(function(id){
               var cell = getSessionCell("unscheduled", allSessions[id]);
               $("#unscheduled").append(cell);         
          });
          updateUnscheduledCount();
     }

     // Display all scheduled sessions in the main grid
     function displayScheduled(){
          var orderedDates = keys(schedule).sort(function(a,b) {return new Date(a) - new Date(b);});
          var orderedRooms = keys(allRooms).sort(function(a,b) {return allRooms[a] - allRooms[b];});

          var i, cell;
          // Table Header
          var table = document.createElement('table'); 
          var header = document.createElement('tr');
          var firstcell = $(document.createElement('td')).addClass("cell").append("<div>Time</div>");
          //var secondcell = $(document.createElement('td')).addClass("cell").append("<div>Conflicts</div>");
          $(header).addClass("header-row").append(firstcell); //.append(secondcell);
          for(var i = 0; i < orderedRooms.length; i++){
               var cell = document.createElement('td');
               $(cell).addClass("cell").append("<div>" + orderedRooms[i] + "</div>");
               $(header).append(cell);
          }
          $("#program").append(header);

          // Main content
          $.each(orderedDates, function(index, date){
            var orderedTimes = keys(schedule[date]).sort(function(a,b) {return a > b;});
            $.each(orderedTimes, function(index2, time){

                var row = document.createElement('tr');
                var slot = document.createElement('td');
//              var conflicts = document.createElement('td');
                $(slot).addClass("cell header-col").append(shortenDate(date) + " " + time);
                $(row).append(slot);
                //console.log(date, time);
                $.each(orderedRooms, function(index3, room){
                    var sessions = schedule[date][time][room];
                    //console.log(schedule[date][time][room]);
                    // if this room has an associated session, display it.
                    if (typeof sessions !== "undefined") {

                        if (keys(sessions).length === 0){
                            cell = getSessionCell("empty", null, date, time, room)
                        } else {
                            $.each(sessions, function(id, session){
                                cell = getSessionCell("scheduled", session, date, time, room);
                            });
                        }
                    } else { // otherwise, mark it unavailable.
                        cell = getSessionCell("unavailable", null);
                    }
                    $(row).append(cell);                    
                });

                $('#program').append(row);

            });
          });
  
     }

    $(document).ready(function() {
        $("body").addClass("loading"); 
        Statusbar.initialize(); 
	    
        // triggered once initialize is complete
	      // initialize() is async, thus the bind
	      $(document).bind("fullyLoaded", function(){
            displayScheduled();
            displayUnscheduled();
            Sidebar.initialize(); 
            // default is view mode.
            ViewMode.initialize();      
            Statusbar.display("Select a session for scheduling options and more information.");
            $("body").removeClass("loading"); 
		    });
	      initialize();
	    
	    // test: swapping leveraging the crowd with madness
	    // swapSchedule(schedule["May 7, 2012"]["11:30"]["Ballroom F"]["117"],
	    //				  schedule["May 10, 2012"]["08:30"]["Ballroom D"]["223"]);
	    //		     alert(JSON.stringify(schedule["May 7, 2012"]["11:30"]["Ballroom F"]));
	    //		     alert(JSON.stringify(schedule["May 10, 2012"]["08:30"]["Ballroom D"]));
	     
	     // test: checking that personas got attached to sessions and print out full persona names
	    // for(var s in schedule["May 7, 2012"]["11:30"]["Ballroom F"]){
	    //  	 console.log(JSON.stringify(keys(allSessions[s]["personas"]).map(function(x) {return personaHash[x]})));
	    // }

	     // test: find all sesions with conflicts
	     	  //    for(var s1 in allSessions){
	     		 // for(var s2 in allSessions){
	     		 //     if(authorConflictsAmongSessions[s1][s2].length > 0){
	     			//  	console.log(JSON.stringify(authorConflictsAmongSessions[s1][s2]));
	     			//  return;
	     		 //     }
	     		 // }
	     	  //    }
	     // test: checking author conflict finding
	     //	alert(JSON.stringify(computeAuthorConflicts(allSessions["117"], allSessions["47"])));
	     //	     	alert(JSON.stringify(computePersonaConflicts(allSessions["117"], allSessions["47"])));
	     
	     
	     // test: how many conflicts are caused by a session
	     //alert(calculateNumConflictsCausedBy(allSessions["39"]));

	});


