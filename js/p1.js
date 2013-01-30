
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

     // Getting html for session details with individual paper info
     function getSessionDetail(type, session){
      var html = ""; 

      console.log(typeof session, session == null);
      if (typeof session !== "undefined" && session != null && typeof session.id !== "undefined" && session.id != null) {
          console.log( typeof session.id, session.id);
          html += "<span id='popover-session-" + session.id + "' class='hidden'/>";
      }

    	 // HQ: locked sessions get only a locked button
    	 var isLocked = false;
    	 if (type != "unscheduled" && typeof session !== "undefined" && session != null){
    	     //console.log(session);
    	     isLocked = scheduleSlots[session.date][session.time][session.room]['locked'];
    	 }

    	 if(isLocked){
    	     html += "  <button class='btn btn-inverse button-unlock'>Unlock</button> ";
    	 } else {
    	     var lockButton = "  <button class='btn btn-inverse button-lock'>Lock</button> ";

    	     if (type == "scheduled") {
    		 html += "<button class='btn btn-info button-propose-swap'>Propose Move</button>"
    		     + "  <button class='btn btn-danger button-unschedule'>Unschedule</button> "
    		     + lockButton;
    	     } else if (type == "unscheduled") {
    		      html += "<button class='btn btn-info button-propose-unscheduled'>Propose Schedule</button>";
    	     } else if (type == "empty") {
    		      html += "<button class='btn btn-info button-propose-empty'>Propose Schedule</button>"
    		     + lockButton;
    	     }

          if (typeof session !== "undefined" && session != null && typeof session.submissions !== "undefined" && session.submissions != null && session.submissions.length > 1) {
               html += " <button class='btn btn-inverse button-paper-reorder'>Reorder</button>";
          }
    	 }

         html += " <div class='conflicts'/>";

    	 if (typeof session !== "undefined" && session != null && typeof session.submissions !== "undefined" && session.submissions != null) {
    	     html += " <ul class='list-submissions'>";
    	     $.each(session.submissions, function(index, submission){
                var type = "";
                if (submission.type == "paper")
                    type = submission.subtype;
                else
                    type = submission.type;
    		     html += "<li class='submission' id='" + submission.id
                         +"'><span class='submission-type'>" + type + "</span> <button class='btn btn-mini button-paper-unschedule'>Unschedule</button> <button class='btn btn-mini button-paper'>Propose Move</button><br>" 
                         + "<strong>" + submission.title + "</strong><br>"
                         + displayAuthors(submission.authors) + "</li>";
    		     
    		 });
    	     html += "</ul>";
    	 }
    	 return html;
     }

     // Getting html for submission details with individual paper info
     function getSubmissionDetail(type, submission){
      var html = ""; 

      console.log(typeof submission, submission == null);
      if (typeof submission !== "undefined" && submission != null && typeof submission.id !== "undefined" && submission.id != null) {
          console.log( typeof submission.id, submission.id);
          html += "<span id='popover-session-" + submission.id + "' class='hidden'/>";
      }

          if (type == "scheduled") {
           html += "<button class='btn btn-info button-propose-swap'>Propose Move</button>"
               + "  <button class='btn btn-danger button-paper-unschedule'>Unschedule</button> ";
          } else if (type == "unscheduled") {
                html += "<button class='btn btn-info button-paper-propose-unscheduled'>Propose Schedule</button>";
          } else if (type == "empty") {
                html += "<button class='btn btn-info button-paper-propose-empty'>Propose Schedule</button>";
          }

         html += " <div class='conflicts'/>";

         html += "<br><strong>Authors</strong>: " + displayAuthors(submission.authors);
      
      return html;
     }

     // For each session item, render session display
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
                //console.log("empty", slotDate, slotTime, slotRoom);
                if(scheduleSlots[slotDate][slotTime][slotRoom]['locked'])
                    $(cell).find(".title").addClass("locked");

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
                    $(cell).find(".title").addClass("locked");

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

     // For each submission item, render submission display, only to be used for the unscheduled papers panel at the top
    function getSubmissionCell(type, submission){
        //var slotDate = typeof slotDate !== "undefined" ? slotDate : null;
        //var slotTime = typeof slotTime !== "undefined" ? slotTime : null;
        //var slotRoom = typeof slotRoom !== "undefined" ? slotRoom : null;
        var cell = document.createElement('td');
        $(cell).addClass("cell slot-paper")
            .append("<div class='title'/><div class='display'/>");
        // console.log("session", typeof session);

        // Empty Session
           if (type == "empty" || submission == -1){
                // //console.log("empty", slotDate, slotTime, slotRoom);
                // if(scheduleSlots[slotDate][slotTime][slotRoom]['locked'])
                //     $(cell).find(".title").addClass("locked");

                // var detail = document.createElement("div");
                // $(detail).hide()
                //      .addClass("detail")
                //      .html(getSessionDetail(type, session));
                // // TODO: how to easily get day, time, room info
                // $(cell)
                //      //.attr("id", "session-" + session.id)
                //      //.data("session-id", session.id)
                //      .addClass("empty")
                //      .data("date", slotDate)
                //      .data("time", slotTime)
                //      .data("room", slotRoom)                     
                //      .append($(detail));
                // $(cell).find(".title").append("<i class='icon-plus'></i>")     
                console.log("empty submission display: not used");
           // Unavailable / Locked Session                         
            } else if (type == "unavailable" || submission == "") {
                //console.log("unavailable");
                //$(cell).addClass("unavailable");
                console.log("unavailable submission display: not used");
           // Scheduled / Unscheduled Session
            } else if (type == "scheduled") {
                console.log("scheduled submission display: not used");
            } else {
                // if(type !== "unscheduled" && scheduleSlots[session.date][session.time][session.room]['locked'])
                //     $(cell).find(".title").addClass("locked");

                // var detail = document.createElement("div");
                // $(detail).hide()
                //      .addClass("detail")
                //      .html(getSessionDetail(type, session));
               
                $(cell).attr("id", "" + submission.id)
                     .addClass(type);
                     //.data("submission-id", submission.id)
                     // .append($(detail));
                
                if (typeof submission.title !== "undefined")
                     $(cell).find(".title").html(submission.title);
                
           } 
           return cell;
    }

     function displayAuthors(authors){
          var html = ""; 
          console.log(authors);       
          $.each(authors, function(i, author){
               html += author.firstName + " " + author.lastName + ", ";
          }); 
          // remove the trailing comma at the end
          return html.slice(0, -2);
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
               //console.log(session);
               return allSessions[getID(session)].title;
          }
     }

    // Update the unscheduled session count just by looking at the DOM nodes, not the database
     function updateUnscheduledCount(){
          count = $("#unscheduled .slot").length;
          $("#unscheduled-count").html(count);

          console.log(unscheduled, unscheduledSubmissions);
          count = $("#unscheduled-papers .slot-paper").length;
          $("#unscheduled-papers-count").html(count);
     }


     // Display the unscheduled panel
     function displayUnscheduled(){
          var cell = null;
          keys(unscheduled).map(function(id){
               cell = getSessionCell("unscheduled", allSessions[id]);
               $("#unscheduled").append(cell);         
          });

          keys(unscheduledSubmissions).map(function(id){
               cell = getSubmissionCell("unscheduled", allSubmissions[id]);
               $("#unscheduled-papers").append(cell);         
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
          var firstcell = $(document.createElement('td')).addClass("cell header-col").append("<div>Room/<br>Time</div>");
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
                // add an extra row for daily borders
                if (index2 == 0) {
                    var borderRow = document.createElement('tr');
                    var borderSlot = document.createElement('td');
                    $(borderSlot).attr("colspan", orderedRooms.length+1).addClass("header-day-border");
                    $(borderRow).append(borderSlot);
                    $('#program').append(borderRow);
                    //$(slot).addClass("header-day-border");
                }
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
                    //if (index2 == 0)
                    //    $(cell).addClass("header-day-border");
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
            Polling.initialize();
            // default is view mode.
            ViewMode.initialize();      
            Statusbar.display("Select a session for scheduling options and more information.");
            $("body").removeClass("loading"); 
        });
        initialize();
	});


