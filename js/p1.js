

     // Temp function to remove buttons from the detail html.
     // TODO: replace with something more reasonable and scalable.
     function trimButtons(html){
          var result = $(html).find("button").hide();
          console.log(result);
          return $(html).find("button").hide().html();
     }

     function getAuthorDisplay(authors){
          var html = "";         
          $.each(authors, function(i, author){
               html += author.firstName + " " + author.lastName + ", ";
          }); 
          return html;
     }

     // Getting html for session details with individual paper info
     function getSessionDetail(type, session){
     	var html = ""; 
          if (type == "scheduled") {
               html += "<button class='btn btn-info button-propose-swap'>Propose Swaps</button>"
                    + "  <button class='btn btn-danger button-unschedule'>Unschedule</button> ";
          } else if (type == "unscheduled") {
               html += "<button class='btn btn-info button-propose-unscheduled'>Propose Schedule</button>";
          } else if (type == "empty") {
               html += "<button class='btn btn-info button-propose-empty'>Propose Schedule</button>";
          }

          if (typeof session !== "undefined" && session != null && typeof session.submissions !== "undefined" && session.submissions != null) {
               html += " <ul class='list-submissions'>";
               $.each(session.submissions, function(index, submission){
                    html += "<li class='submission'><strong>" + submission.type + "</strong>: " 
                         + getAuthorDisplay(submission.authors) + "<br>"
                         + "<strong>" + submission.title + "</strong></li>";

               });
               html += "</ul>";
          }
     	return html;
     }


     // Visually swap two session cells
     function swapSessionCell(id1, id2){
          swapNodes($("#program #session-" + id1)[0], $("#program #session-" + id2)[0]);
          $("#program #session-" + id1).css("background-color", "white").effect("highlight", {color: "yellow"}, 10000);
          $("#program #session-" + id2).css("background-color", "white").effect("highlight", {color: "yellow"}, 10000);

          /*
     	var $org1 = $("#program #session-" + id1);
     	var $org2 = $("#program #session-" + id2);
     	var $session1 = $("#program #session-" + id1).clone();
     	var $session2 = $("#program #session-" + id2).clone();
     	
     	console.log($session1, $session2);
     	$session1.css("background-color", "white").effect("highlight", {color: "yellow"}, 10000);
     	$session2.css("background-color", "white").effect("highlight", {color: "yellow"}, 10000);
     	$org1.replaceWith($session2);
     	$org2.replaceWith($session1);
          */
     }

     // move the session of id into cell
     function scheduleSessionCell(id, $emptySlot, $curSession){
          var session = getSessionCell("scheduled", allSessions[id]);
          //swapNodes(session, $cell[0]);
          $emptySlot.replaceWith($(session));
          $(session).css("background-color", "white").effect("highlight", {color: "yellow"}, 10000)
          $curSession.remove();
          
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
                    console.log("unavailable");
                    $(cell).addClass("unavailable");
               
               // Scheduled / Unscheduled Session
                } else {
                    var detail = document.createElement("div");
                    $(detail).hide()
                         .addClass("detail")
                         .html(getSessionDetail(type, session));
			 	
                    $(cell).attr("id", "session-" + session.id)
                         .data("session-id", session.id)
                         .append($(detail));
                    
                    if (typeof session.title !== "undefined")
                         $(cell).find(".title").html(session.title);
                    
                    // default view: conflicts
                    displayConflicts(conflictsBySession[session.id], $(cell).find(".display"));
                    //$(cell).find(".display").html(session.type);
			 } 
			 return cell;
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

     // Refresh conflicts information display.
     // Called after an interaction occurs that affects conflicts. (swap, unschedule, schedule)
     function updateConflicts(){
          // Lazy operation: only run when the view mode is conflicts
          if (getActiveOptions("view-options").indexOf("conflicts") === -1)
               return;
          $(".slot").each(function(){
               var id = getID($(this));
               if (id !== -1)
                    displayConflicts(conflictsBySession[id], $(this).find(".display"));
          });
          
     }

     function getLength(item) {
          if (item === null || typeof item === "undefined")
               return 0;
          else 
               return item.length;
     }

     // for each conflict preview tpe (addedSrc, removedSrc, addedDest, removedDest),
     // display appropriate message
     function displayPreviewByType(type, item) {
          var html = "";
          var length = getLength(item);
          var typeMessage = "";
          if (type === "addedSrc") 
               typeMessage = " conflicts added to source session";
          else if (type === "removedSrc")
               typeMessage = " conflicts removed from source session";
          else if (type === "addedDest")
               typeMessage = " conflicts added to this session";
          else if (type === "removedDest")
               typeMessage = " conflicts removed to this session";
          
          html = "<h5>" + length + typeMessage + "</h5>"
          if (length > 0) 
               item.map(function(co) {return html + "<li>" + co.description + "</li>";})         
          else
               return html;
     }

     function getPreviewSwap(swap){
          //var $session = $(".selected").first();
          //var id = getID($session);
          //var session = allSessions[id];
          //console.log(session.title);      

          //var swapValues = proposeSwap(allSessions[id]);
          var html = "";
          html += "<h4>Overall, " + swap.value
               + " conflicts will be resolved.</h4>" 
               + displayPreviewByType("addedSrc", swap.addedSrc)
               + displayPreviewByType("removedSrc", swap.removedSrc)
               + displayPreviewByType("addedDest", swap.addedDest)
               + displayPreviewByType("removedDest", swap.removedDest);
               //console.log(html);
          return html;
     }

     // Locate an empty session by its date, time, and room
     // Returns null when there is no such cell that's empty.
     function getCellByDateTimeRoom(cellDate, cellTime, cellRoom){
          var cell = null;
          $("#program .empty").each(function(){
               if ($(this).data("date") === cellDate && $(this).data("time") === cellTime  && $(this).data("room") === cellRoom)
                    cell = $(this);
          });
          return cell;
     }

     // Display textually the slot title. (slot data structure)
     // When session exists: Name of the session
     // When session is empty: show date, time, room
     function displaySlotTitle(slot) {
          if (slot.session === null) {
               return slot.day + " " + slot.time + " " + slot.room;
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


     // For proposed swap options, display the right popover
     function renderProposedSwap(type){

          $(".proposed-swap").popover("destroy");
          $(".proposed-swap").popover({
               html:true,
               placement: "bottom",
               trigger: "click",
/*               title:function(){
                    return allSessions[$(this).data("session-id")].title;
               },
*/               content:function(){
                    var id = $(this).data("session-id");
                    if (typeof id === "undefined") {
                         console.log("renderProposedSwap: case1");
                         return "<button class='btn btn-primary' id='schedule-button'" 
                         + "data-date='"+$(this).data("date")+"' data-time='"+$(this).data("time")+"' data-room='"+$(this).data("room")
                         +"'>Schedule in this slot</button><br>";
                         
                    } else { 
                         if (type === "swap") {
                              console.log("renderProposedSwap: case2");
                              return "<button class='btn btn-primary' id='swap-button' data-session-id='" + id 
                              + "'>Swap with this session</button><br>"
                              + $(this).find(".detail ul")[0].outerHTML;
                         } else { // unscheduled session
                              console.log("renderProposedSwap: case3");
                              return "<button class='btn btn-primary' id='schedule-button' data-session-id='" + id 
                              + "'>Schedule this session</button><br>"
                              + $(this).find(".detail ul")[0].outerHTML;
                         }
                    }
               }
          });
     }

     // Handle a propose (swap, unschedule, schedule) request
     function proposeHandler(event){
          var $session = $(".selected").first();
          var id = getID($session);  
          
          var swapValues; 
          if (event.data.type === "swap")
               swapValues = proposeSwap(allSessions[id]);
          else if (event.data.type === "unscheduled") {
               console.log("unscheduled", id);
               swapValues = proposeSlot(allSessions[id]);
          }
          else if (event.data.type === "empty") {
               console.log($session, $session.data(), $session.data("date"), event.data.type, event.target);
               console.log($session.data("date"), $session.data("time"), $session.data("room"), schedule[$session.data("date")][$session.data("time")][$session.data("room")]);
               swapValues = proposeUnscheduledSessionForSlot($session.data("date"), $session.data("time"), $session.data("room"));
          } else {
               return;
          }

          // Now display each candidate 
          swapValues.sort(function(a, b) {
		  if(scheduleSlots[a.target.day][a.target.time][a.target.room]['locked']){
		      return 1;
		  } else {return b.value - a.value;}});

          //console.log(JSON.stringify(swapValues));
          var count = Math.min(swapValues.length, 5);
          var swapContent = "";
          for(var i = 0; i < count; i++){    
               // empty candidate
               if (swapValues[i].target.session === null){
                    var $cell = getCellByDateTimeRoom(swapValues[i].target.day, swapValues[i].target.time, swapValues[i].target.room);
                    $cell.addClass("proposed-swap").data("title", "Empty slot");
                    swapContent += "<li data-rank-order='" + i + "' data-date='"+swapValues[i].target.day+"' data-time='"+swapValues[i].target.time+"' data-room='"+swapValues[i].target.room+"'>" 
                    + "<a href='#' class='swap-preview-link'>[preview]</a> "
			+ "adding " + (-1*swapValues[i].value)  
                    + ": <a href='#' class='swap-review-link'>" + displaySlotTitle(swapValues[i].target) + "</a>" 
                    + "</li>";                    

               // non-empty candidate
               } else {
                    $("#session-" + swapValues[i].target.session)
                         .addClass("proposed-swap")
                         .data("title", allSessions[swapValues[i].target.session].title);
                    swapContent += "<li data-session-id='" + swapValues[i].target.session + "' data-rank-order='" + i + "'>" //+ swapValues[i] 
                    + "<a href='#' class='swap-preview-link'>[preview]</a> "
                    + "resolving " + swapValues[i].value  
                    + ": <a href='#' class='swap-review-link'>" + displaySlotTitle(swapValues[i].target) + "</a>" 
                    + "</li>";
               }
          }

          // For proposed slots, add a new popover
          $session.addClass("swap-selected");
          $session.popover("hide");

          renderProposedSwap(event.data.type);


          // Display at the top alert box the full information about this proposal
          var alert_html = "";
          alert_html = "<div class='alert'>"
          //+ "<button type='button' class='close' data-dismiss='alert'>×</button>"
          + "<strong>Swap in progress</strong>. Click one of the proposed sessions in <span class='palette'>&nbsp;</span> to switch sessions, " 
          + "or <button class='btn' type='button' id='swap-review-cancel-link'>cancel swap</button>."
          + "<div class='row'>";

          if (id === -1)
               alert_html += "<div class='span3 src-display' data-date='"+$session.data("date")+"' data-time='"+$session.data("time")+"' data-room='"+$session.data("room")+"'>" 
          else
               alert_html += "<div class='span3 src-display' data-session-id='" + id + "'>";

          alert_html += "selected session:<br> <a href='#' class='swap-review-link'>" + displaySessionTitle($session) + "</a></div>"
                    + "<div class='span6'>" + swapContent + "</div>"
                    + "</div></div>";
        
          $("#alert").html(alert_html);
          $("#alert .palette").css("background-color", "#FF8C00");

          // Now attach popovers for preview
          $("#alert .swap-preview-link").popover({
               html:true,
               placement: "bottom",
               trigger: "click",
               title:function(){
                    return "Preview swap results";
               },
               content:function(){
                    var rank = $(this).parent().data("rank-order");
                    return getPreviewSwap(swapValues[rank]);
               }
          });
     }

     $("body").on("click", ".popover .button-propose-swap", {type: "swap"}, proposeHandler);
     $("body").on("click", ".popover .button-propose-unscheduled", {type: "unscheduled"}, proposeHandler);
     $("body").on("click", ".popover .button-propose-empty", {type: "empty"}, proposeHandler);

/*
     $("#alert").on("click", ".swap-preview-link", function(){
          return false;
     });
*/
     $("#alert").on("click", ".swap-review-link", function(){
          var id = $(this).parent().data("session-id");
          $(this).toggleClass("view-option-active");
          console.log(id, $(this).parent().data("date"));     
          var cell = null;
          if (typeof id === "undefined")
               cell = getCellByDateTimeRoom($(this).parent().data("date"), $(this).parent().data("time"), $(this).parent().data("room"));
          else
               cell = $("#session-" + id)

          $(cell).toggleClass("highlight").popover("toggle");
          return false;
     });


     // Back to the default interaction.
     // Used to cancel any effect of the swapping mode
     function restoreDefaultInteraction(){
          // TOOD: check all the other things the swapping mode has created and reset/undo them.

          //$(".selected").hide();
          $(".selected").removeClass("selected");
          $(".swap-selected").removeClass("swap-selected");
          $("#alert .swap-preview-link").popover("destroy");
          // remove any popover and reinitiate default popover
          $(".proposed-swap").popover("destroy");
          // TODO: restore default popover

          $(".proposed-swap").removeClass("proposed-swap");   
          $(".highlight").removeClass("highlight");  

     }

     // clicking the 'swap' button from one of the proposed swaps.
     // should perform swap and return to the clean state with no selection and proposals.
     $("body").on("click", ".popover #swap-button", function(){
     	     	
     	var $source = $(".swap-selected").first();
          var src_id = getID($source);
     	var dst_id = $(this).data("session-id");

          /*
     	$(".proposed-swap").popover("destroy");
          $(".proposed-swap").popover({
              html:true,
              placement: "bottom",
              trigger: "manual",
               title:function(){
                    return allSessions[$(this).data("session-id")].title;
               },
               content:function(){
                    return $(this).find(".detail").html();
               }
          });
          */

          restoreDefaultInteraction();
          displayAlert("Swap successful");

          $("#list-history").prepend("<li>swapped: " 
               + "<a href='#' class='history-link' data-session-id='" + src_id + "'>" + allSessions[src_id].title 
               + "</a> and <a href='#' class='history-link' data-session-id='" + dst_id + "'>" + allSessions[dst_id].title + "</a></li>");
          // the frontend swap
          swapSessionCell(src_id, dst_id);

          // the backend swap
          swapSessions(allSessions[src_id], allSessions[dst_id]);

          // the backend conflicts update
          getAllConflicts();
          // the frontend conflicts update: the row view of conflicts.
          updateConflicts();
     });	


     // clicking the 'schedule' button from one of the proposed swaps. - for empty or unscheduled sessions
     // should perform scheduling and return to the clean state with no selection and proposals.
     $("body").on("click", ".popover #schedule-button", function(){
          var $session = null;     // session to schedule
          var $emptySlot = null;   // empty slot into shich the session is going
          var id = -1;
          
          // empty slot is the target
          // unscheduled session is the source
          console.log(typeof $(this).data("session-id"), $(this).data("date"), $(this).data("time"), $(this).data("room"));
          if (typeof $(this).data("session-id") === "undefined") {   
               $session = $(".swap-selected").first();
               $emptySlot = getCellByDateTimeRoom($(this).data("date"), $(this).data("time"), $(this).data("room"));
          // unscheduled session is the target
          // empty slot is the source
          } else { 
               var session_id = $(this).data("session-id");
               $session = $("#session-" + session_id);
               $emptySlot = $(".swap-selected").first();
          }

          restoreDefaultInteraction();
          displayAlert("Scheduling successful");

          id = getID($session);
          console.log($session, $emptySlot, id);

          $("#list-history").prepend("<li>scheduled: " 
               + "<a href='#' class='history-link' data-session-id='" + id + "'>" + allSessions[id].title 
               + "</a></li>");
          
          // the backend scheduling
          console.log("SCHEDULE", id, "into", $emptySlot.data("date"), $emptySlot.data("time"), $emptySlot.data("room"));
          scheduleSession(allSessions[id], $emptySlot.data("date"), $emptySlot.data("time"), $emptySlot.data("room"), "");

          // the frontend scheduling: backend should be called first to have the updated allSessions[id] information
          scheduleSessionCell(id, $emptySlot, $session);

          updateUnscheduledCount();
          // the backend conflicts update
          getAllConflicts();
          // the frontend conflicts update: the row view of conflicts.
          updateConflicts();
     });  


     // clicking the 'cancel swap' link while swap in progress.
     // should return to the clean state with no selection and proposals.
     // return to original popovers
     $("#alert").on("click", "#swap-review-cancel-link", function(){
          restoreDefaultInteraction();  
          $("#alert").html("");      
     });

     // When the unschedule button is clicked. Move the item to the unscheduled workspace.
     $("body").on("click", ".popover .button-unschedule", function(){
     	var $session = $(".selected").first();
     	var id = getID($session);

          var new_session = getSessionCell("unscheduled", allSessions[id]);
          $("#unscheduled").append(new_session);
     	$session.removeClass("selected").popover("destroy").removeAttr("id").removeData();
          var after = getSessionCell("empty", null, allSessions[id].date, allSessions[id].time, allSessions[id].room);
          // Watch out! jQuery replaceWith returns the original element, not the replaced element.
          $session.replaceWith(after); 
          $(after).popover({
              html:true,
              placement: "bottom",
              trigger: "click",
               title:function(){
                    return "Empty slot";
               },
               content:function(){
                    return getSessionDetail("empty", -1);
               }
          });
          // For now, simply assign date, time, and room info to an empty session
//          // TODO: maybe hook up to an empty session so that data() isn't necessary?
//          $(after).data("date", allSessions[id].date).data("time", allSessions[id].time).data("room", allSessions[id].room);
//          console.log($(after), $(after).data("date"), $(after).data("time"), $(after).data("room"));
          // Unschedule session in the database
          unscheduleSession(allSessions[id]);

          $(".selected").removeClass("selected");
          displayAlert("Unschedule successful");
          $("#list-history").prepend("<li>unschedule: " 
               + "<a href='#' class='history-link' data-session-id='" + id + "'>" + allSessions[id].title + "</a></li>");
/*
          $(new_session).popover({
              html:true,
              placement: "bottom",
              trigger: "click",
               title:function(){
                    return allSessions[id].title;
               },
               content:function(){
                    return getSessionDetail("unscheduled", allSessions[id]);
               }
          });
*/
          updateUnscheduledCount();
          // the backend conflicts update
          getAllConflicts();
          // the frontend conflicts update: the row view of conflicts.
          updateConflicts();          

     });

     function updateUnscheduledCount(){
          var count = $("#unscheduled .slot").length;
          $("#unscheduled-count").html(count);
     }

     // Event handler for clicking an individual session
     $("#unscheduled").on("click", ".slot", function(){
     	// detect if the currently selected item is selected again.
     	var $selection = $("#unscheduled .selected");
     	var isSelected = $selection[0] == $(this)[0];
     	$selection.removeClass("selected"); //.popover("hide");

     	// if reselected, do nothing.
     	if (isSelected)
     		return;
     	var id = getID($(this));
     	$(this).addClass("selected");

          var id = getID($(this));
          var session = allSessions[id];
          $(this).addClass("selected");
          $(this).popover({
              html:true,
              placement: "bottom",
              trigger: "click",
               title:function(){
                    return allSessions[id].title;
               },
               content:function(){
                    return getSessionDetail("unscheduled", allSessions[id]);
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
          // do nothing for unavailable slots
          if ($(this).hasClass("unavailable"))
               return;
               
     	var id = getID($(this));
		var session = allSessions[id];
     	$(this).addClass("selected");
     	$(this).popover({
     	    html:true,
              placement: "bottom",
              trigger: "manual",
     		title:function(){
                    if ($(this).hasClass("empty"))
                         return "Empty slot";
     			else
                         return session.title;
     		},
     		content:function(){
                    if ($(this).hasClass("empty"))
                         return getSessionDetail("empty", -1);
                    else
     			     return $(this).find(".detail").html();
     		}
     	});
     	$(this).popover("show");
     });


     // Display the unscheduled panel
     function displayUnscheduled(){
          keys(unscheduled).map(function(id){
               var cell = getSessionCell("unscheduled", allSessions[id]);
               $("#unscheduled").append(cell); 
               /*
               $(cell).popover({
                   html:true,
                   placement: "bottom",
                   trigger: "click",
                    title:function(){
                         return allSessions[$(this).data("session-id")].title;
                    },
                    content:function(){
                         return $(this).find(".detail").html();
                    }
               });
               */        
          });
            updateUnscheduledCount();
     }

     // Display all scheduled sessions in the main grid
     function displayScheduled(){
          var orderedDates = keys(schedule).sort(function(a,b) {return new Date(a) - new Date(b);});
          var orderedRooms = keys(allRooms).sort(function(a,b) { return allRooms[a] - allRooms[b];});

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
                console.log(date, time);
                $.each(orderedRooms, function(index3, room){
                    var sessions = schedule[date][time][room];
                    console.log(schedule[date][time][room]);
                    // if this room has an associated session, display it.
                    if (typeof sessions !== "undefined") {
                        if (keys(sessions).length === 0)
                            cell = getSessionCell("empty", null, date, time, room)
                        else {
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

/*
     function displayProgram(schedule){
          var orderedRooms = keys(allRooms).sort(function(a,b) { return allRooms[a] - allRooms[b];});
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
          for(var i = 0; i < schedule.length; i++){
               var row = document.createElement('tr');
               var slot = document.createElement('td');
//             var conflicts = document.createElement('td');
               $(slot).addClass("cell").append(shortenDate(schedule[i][0]) + " " + schedule[i][1]); // schedule[i][0]: full date. schedule[i][1]: time
               $(row).append(slot);

               for(var j = 2; j < schedule[i].length; j++){
                    console.log(schedule[i], schedule[i][0], schedule[i][1], schedule[i][2], schedule[i][j].date, schedule[i][j].time, schedule[i][j].room);
                    var cell = getSessionCell("scheduled", schedule[i][j], schedule[i][j].date, schedule[i][j].time, schedule[i][j].room);
                    $(row).append(cell);
               }
               $('#program').append(row);
          }
          updateUnscheduledCount();
     }

    var scheduleMatrix = [];
*/
    $(document).ready(function() {
	    // triggered once initialize is complete
	    // initialize() is async, thus the bind
	    $(document).bind("fullyLoaded", function(){
		    displayScheduled();
		    displayUnscheduled();
		    displayConstraints();
		    displayViewOptions();
		    displayPersonas();          
		    //$('#testers').html("complete...");
		});

	    //$('#testers').html("loading...");
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
	     
	     // test: Proposing a swap
	     	  //    alert(JSON.stringify(proposeSwap(allSessions["39"])));
	     	  //    var swapValues = proposeSwap(allSessions["39"]);
	     	  //    var sortedSwaps = keys(swapValues).sort(function(a, b) {return swapValues[b]- swapValues[a];});
	     	  //    // return top 10 swaps
	     	  //    var output = "Finding good swaps for session 39 (" + allSessions["39"].title + ")\n";
	     	  //    for(var i = 0; i < 10; i++){
	     		 // output += sortedSwaps[i] + " (" + allSessions[sortedSwaps[i]].title + "): " + swapValues[sortedSwaps[i]] + "\n";
	     	  //    }
	     	  //    alert(output);
	     
	     
//        scheduleMatrix = makeProgram();
//        displayProgram(scheduleMatrix);

	});


