
$(document).on("serverScheduleChange", function(e, newTransactionIndices){
    $.each(newTransactionIndices, function(index, i){
        var t = transactions[i];
        //type: event type, uid: user who made the change, data: object
        console.log("Server Changed", i, t, t.type);
        if (t.type == "lock"){
            handlePollingLock(t);
        } else if (t.type == "unschedule"){
            handlePollingUnschedule(t);
        } else if (t.type == "schedule"){
            handlePollingSchedule(t);
        } else if (t.type == "swap"){
            handlePollingSwap(t);
        } else if (t.type == "move"){
            handlePollingMove(t);
        }

    });

});

function handlePollingLock(t){
    // TODO: lock needs to get id in t.data.ida
    console.log(schedule[t.data.date][t.data.time][t.data.room]);
    var id = null;
    for (s in schedule[t.data.date][t.data.time][t.data.room]){
        id = s;
    }    
    var $cell = findCellByID(id);
    if ($cell == null || typeof $cell === "undefined")
        return;

    var isLocked = $cell.hasClass("locked")? true: false;
    var action = "locked";
    if (isLocked){
        $cell.removeClass("locked");
        action = "unlocked";
    } else {
        $cell.addClass("locked");
    }

    $cell.effect("highlight", {color: "yellow"}, 10000);

    if(id in allSessions){
        //lockSlot(allSessions[id].date, allSessions[id].time, allSessions[id].room);
        // $cell.data('popover').options.content = function(){
        //     return getSessionDetail("scheduled", allSessions[id]);
        // };

        $("#list-history").prepend("<li>USER " + action + ": " 
            + "<a href='#' class='history-link' data-session-id='" + id + "'>" + allSessions[id].title + "</a></li>");

    } else {
        //lockSlot($session.data("date"), $session.data("time"), $session.data("room"));
        // $cell.data('popover').options.content = function(){
        //     return getSessionDetail("empty", new slot($cell.data("date"), $cell.data("time"), $cell.data("room"), null));
        // };

        $("#list-history").prepend("<li>USER " + action + ": "
           + "<a href='#' class='history-link' data-slot-date='" +
           $session.data("date") + 
           "' data-slot-time='" + $session.data("time") + 
           "' data-slot-room='" + $session.data("room") + 
           "'>" 
           + $cell.data("date") + ", " + $cell.data("time") + ", " + $cell.data("room") + "</a></li>");
    }
            
}

function handlePollingUnschedule(t){
    var id = t.data.id;
    var $cell = findCellByID(id);
    if ($cell == null || typeof $cell === "undefined")
        return;

    $("#list-history").prepend("<li>USER unscheduled: " 
        + "<a href='#' class='history-link' data-session-id='" + id + "'>" + allSessions[id].title + "</a></li>");

    $cell.effect("highlight", {color: "yellow"}, 10000);

    // the frontend unschedule session
    VisualOps.unschedule(allSessions[id]);
    // the backend unschedule session
    //unscheduleSession(allSessions[id]);

    //$(".selected").removeClass("selected");
    Statusbar.display("Polling: Unschedule successful");
    postPollingMove();
}

function postPollingMove(){
    updateUnscheduledCount();
    // the backend conflicts update
    getAllConflicts();
    clearConflictDisplay();
    // the frontend conflicts update: the row view of conflicts.
    updateConflicts();

}

function handlePollingSchedule(t){
    var id = t.data.id;
    var $cell = findCellByID(id);
    if ($cell == null || typeof $cell === "undefined")
        return;

    $("#list-history").prepend("<li>USER scheduled: " 
        + "<a href='#' class='history-link' data-session-id='" + id + "'>" + allSessions[id].title + "</a></li>");

    $cell.effect("highlight", {color: "yellow"}, 10000);


        $emptySlot = findCellByDateTimeRoom(t.data.date, t.data.time, t.data.room);

//        id = getID($session);
        //console.log($session, $emptySlot, id);

        // the backend scheduling
//        console.log("SCHEDULE", id, "into", $emptySlot.data("date"), $emptySlot.data("time"), $emptySlot.data("room"));
//        scheduleSession(allSessions[id], $emptySlot.data("date"), $emptySlot.data("time"), $emptySlot.data("room"));

        // the frontend scheduling: backend should be called first to have the updated allSessions[id] information
        //VisualOps.scheduleSessionCell(id, $emptySlot, $session);
        VisualOps.scheduleUnscheduled(allSessions[id], $emptySlot);

//        postMove();
        Statusbar.display("Polling: Scheduling successful");    
        postPollingMove();
}

function handlePollingSwap(t){
    var src_id = t.data.s1id;
    var dst_id = t.data.s2id;
    var $src_cell = findCellByID(src_id);
    if ($src_cell == null || typeof $src_cell === "undefined")
        return;
    var $dst_cell = findCellByID(dst_id);
    if ($dst_cell == null || typeof $dst_cell === "undefined")
        return;

    $("#list-history").prepend("<li>USER swapped: " 
       + "<a href='#' class='history-link' data-session-id='" + src_id + "'>" + allSessions[src_id].title 
       + "</a> and <a href='#' class='history-link' data-session-id='" + dst_id + "'>" + allSessions[dst_id].title + "</a></li>");

    $src_cell.effect("highlight", {color: "yellow"}, 10000);
    $dst_cell.effect("highlight", {color: "yellow"}, 10000);

/*
        var $source = $(".move-src-selected").first();
        var src_id = getID($source);
        var dst_id = $(this).data("session-id");


            $("#list-history").prepend("<li>swapped: " 
                   + "<a href='#' class='history-link' data-session-id='" + src_id + "'>" + allSessions[src_id].title 
                   + "</a> and <a href='#' class='history-link' data-session-id='" + dst_id + "'>" + allSessions[dst_id].title + "</a></li>");
            // the frontend swap
            VisualOps.swap(allSessions[src_id], allSessions[dst_id]);
            // the backend swap
            swapSessions(allSessions[src_id], allSessions[dst_id]);            
        
*/
        VisualOps.swap(allSessions[src_id], allSessions[dst_id]);
        Statusbar.display("Polling: Swap successful");
        postPollingMove();
        
}

function handlePollingMove(t){
    var id = t.data.id;
    var $cell = findCellByID(id);
    if ($cell == null || typeof $cell === "undefined")
        return;

    $("#list-history").prepend("<li>USER moved: " 
        + "<a href='#' class='history-link' data-session-id='" + id + "'>" + allSessions[id].title + "</a></li>");

    $cell.effect("highlight", {color: "yellow"}, 10000);

    $emptySlot = findCellByDateTimeRoom(t.data.tdate, t.data.ttime, t.data.troom);

            /*
            // Part 1. Unschedule the source
            $source.removeClass("selected").popover("destroy").removeAttr("id").removeData();
            var after = getSessionCell("empty", null, allSessions[src_id].date, allSessions[src_id].time, allSessions[src_id].room);
            // Watch out! jQuery replaceWith returns the original element, not the replaced element.
            $source.replaceWith(after); 
            // Unschedule session in the database
            unscheduleSession(allSessions[src_id]);
            */
            // Part 2. Schedule the destination
            //var $emptySlot = findCellByDateTimeRoom($(this).data("date"), $(this).data("time"), $(this).data("room"));           
            
            // the backend scheduling
            //scheduleSession(allSessions[src_id], $emptySlot.data("date"), $emptySlot.data("time"), $emptySlot.data("room"));

            // the frontend scheduling
            // shouldn't matter any more: backend should be called first to have the updated allSessions[id] information
            //VisualOps.scheduleSessionCell(src_id, $emptySlot, $source);
            VisualOps.swapWithEmpty(allSessions[id], $emptySlot);

        Statusbar.display("Polling: Moving successful");    
        postPollingMove();
}

/*
$(document).on("slotLocked", function(e, day, time, room){
    console.log("This slot is locked: " + day + " ," + time + ", " + room);
    // No need to anything in the frontend
    //var cell = findCellByDateTimeRoom(day, time, room);
});

$(document).on("slotChange", function(e, day, time, room){
    console.log("Data changed in " + day + " ," + time + ", " + room);
    var cell = findCellByDateTimeRoom(day, time, room);
});

    $(document).on("lockChange", function(e, day, time, room){
        console.log("Slot lock changed in " + day + " ," + time + ", " + room);

        var id = null;
        for (s in schedule[day][time][room]){
            id = s;
        }
        var $cell = findCellByID(id);
        if ($cell == null || typeof $cell === "undefined")
            return;

        if ($cell.hasClass("locked")){
            $("#list-history").prepend("<li>USER unlocked: " 
                + "<a href='#' class='history-link' data-session-id='" + id + "'>" + allSessions[id].title + "</a></li>");
            $cell.removeClass("locked");
        } else {
            $("#list-history").prepend("<li>USER locked: " 
                + "<a href='#' class='history-link' data-session-id='" + id + "'>" + allSessions[id].title + "</a></li>");        
            $cell.addClass("locked");
        }
        $cell.effect("highlight", {color: "yellow"}, 10000);
    });

$(document).on("unscheduledChange", function(e){
    console.log("The unscheduled data has changed.", unscheduled);
    for (s in unscheduled) {
        console.log(s);
    }
});
*/

    // Popover close button interaction
    $("body").on("click", ".popover-close", function(){
        console.log("popover-close", $(this).data("session-id"));
        var $cell = null;
        if (typeof $(this).data("session-id") === "undefined"){
            $cell = findCellByDateTimeRoom($(this).data("date"), $(this).data("time"), $(this).data("room"));
        } else {
            $cell = findCellByID($(this).data("session-id"));
        }
        $cell.trigger("click");
//        $cell.popover("hide");
    });

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

         html += " <div class='conflicts'/>";

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
                     .data("date", slotDate)
                     .data("time", slotTime)
                     .data("room", slotRoom)                     
                     .append($(detail));
                $(cell).find(".title").append("<i class='icon-plus'></i>")     

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
          var days = {
            "Sunday": 0,
            "Monday": 1,
            "Tuesday": 2,
            "Wednesday": 3,
            "Thursday": 4,
            "Friday": 5,
            "Saturday": 6
          }
          //var orderedDates = keys(schedule).sort(function(a,b) {return new Date(a) - new Date(b);});
          //var orderedRooms = keys(allRooms).sort(function(a,b) {return allRooms[a] - allRooms[b];});
          var orderedDates = keys(schedule).sort(function(a,b) {return days[a] - days[b];});
          var orderedRooms = keys(allRooms).sort();

          var i, cell;
          // Table Header
          var table = document.createElement('table'); 
          var header = document.createElement('tr');
          var firstcell = $(document.createElement('td')).addClass("cell header-col").append("<div>Time</div>");
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
            
            var orderedTimes = keys(schedule[date]).sort(function(a,b) {return a - b;});

            $.each(orderedTimes, function(index2, time){

                var row = document.createElement('tr');
                var slot = document.createElement('td');
//              var conflicts = document.createElement('td');
                $(slot).addClass("cell header-col").append(shortenDate(date) + " " + time);
                if (index2 == 0)
                    $(slot).addClass("header-day-border");

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
                    if (index2 == 0)
                        $(cell).addClass("header-day-border");
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
            Searchbox.initialize();
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


