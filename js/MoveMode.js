var MoveMode = function() {
    var isOn = false;
    var type = "";

    // Initialize the view mode 
    function initialize(moveType){
        isOn = true;
        type = moveType;
        ViewMode.destroy();
        clearConflictDisplay();
        bindEvents();
        runPropose();
    }

    // Add event handlers to each sidebar item
    function bindEvents(){
        $("body").on("click", ".slot", slotClickHandler);
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

    function _getCancelButtonHTML(){
        return "  <button class='btn move-cancel-button'>Cancel Move</button>";
    }

    function slotClickHandler(){
        // detect if the currently selected item is selected again.
        //var $selection = $(this).hasClass("unscheduled")? $("#unscheduled .move-dst-selected"): $("#program .move-dst-selected");
        //var $otherSelection = $(this).hasClass("unscheduled")? $("#program .selected"): $("#unscheduled .selected");


        // only one popover at a time? this allows multiple selections possible
        //$selection.removeClass("move-dst-selected").popover("hide");
        //$(".move-dst-selected").removeClass("move-dst-selected").popover("hide");          

        var $selection = $(".move-dst-selected");
        $(".move-dst-selected").removeClass("move-dst-selected").popover("hide");   

        // if reselected, do nothing.
        if ($selection[0] == $(this)[0])
           return;
        // do nothing for unavailable slots
        if ($(this).hasClass("unavailable"))
           return;
        // if not proposed, do nothing
        if (!$(this).hasClass("proposed-swap"))
            return;

        var id = getID($(this));
        var session = allSessions[id];
        $(this).addClass("move-dst-selected");
          
        var id = getID($(this));
        var session = allSessions[id];
        //$(this).addClass("selected");
        console.log(type, id, $(this).hasClass("scheduled"), $(this).hasClass("unscheduled"), $(this).hasClass("empty"));

        $(this).popover({
            html:true,
            placement: "bottom",
            trigger: "manual",
            title:function(){
                if ($(this).hasClass("empty"))
                    return "Empty slot " 
                        + " <a class='close popover-close' data-dismiss='clickover' " 
                        + "data-date='"+$(this).data("date")+"' data-time='"+$(this).data("time")+"' data-room='"+$(this).data("room")
                        + "' href='#''>&times;</a>";
                else
                    return session.title                         
                        + "<a class='close popover-close' data-dismiss='clickover' data-session-id='" + id 
                        + "' href='#''>&times;</a>";
            },
            content:function(){
                //var id = $(this).data("session-id");
                //console.log(id);
                
                var html = "";
                if ($(this).hasClass("move-src-selected")) {
                    console.log("slotClickHandler: move-src-selected");
                    if (id === -1)
                        html += "<strong>Select other sessions to schedule this session.</strong><br>"
                            + _getCancelButtonHTML();
                    else
                      html += "<strong>Select other sessions to schedule this session.</strong><br>"
                            + _getCancelButtonHTML()
                            + $(this).find(".detail ul")[0].outerHTML;

                } else if ($(this).find(".title").hasClass("locked")) {
                    console.log("slotClickHandler: locked");
                    if (id === -1)
                        html +=  "<strong>This is a locked session. Unlock to change the schedule.</strong>";
                    else
                      html +=  "<strong>This is a locked session. Unlock to change the schedule.</strong>"
                      + $(this).find(".detail ul")[0].outerHTML;

                } else if (type == "swap"){
                    if ($(this).hasClass("scheduled")){
                        console.log("src: swap", "dst: scheduled");
                        html +=  "<button class='btn btn-primary' id='swap-button' data-session-id='" + id 
                          + "'>Swap with this session</button>" + _getCancelButtonHTML() + "<br>"
                          + $(this).find(".detail .conflicts")[0].outerHTML
                          + $(this).find(".detail ul")[0].outerHTML;
                    } else if ($(this).hasClass("unscheduled")){
                        console.log("N/A. src: swap", "dst: unscheduled");
                        /*
                        html +=  "<button class='btn btn-primary' id='swap-button' data-session-id='" + id 
                          + "'>Swap with this session</button>" + _getCancelButtonHTML() + "<br>"
                          + $(this).find(".detail .conflicts")[0].outerHTML
                          + $(this).find(".detail ul")[0].outerHTML;
                        */
                    } else if ($(this).hasClass("empty")){
                        console.log("src: swap", "dst: empty");
                        html +=  "<button class='btn btn-primary' id='move-button'" 
                         + "data-date='"+$(this).data("date")+"' data-time='"+$(this).data("time")+"' data-room='"+$(this).data("room")
                         +"'>Move to this slot</button>" + _getCancelButtonHTML() + "<br>"
                         + $(this).find(".detail .conflicts")[0].outerHTML;
                         // empty sessions don't have a submissions list
                         //+ $(this).find(".detail ul")[0].outerHTML;   
                    } else {
                        console.log("impossible");
                    }

                } else if (type == "unscheduled"){
                    if ($(this).hasClass("scheduled")){
                        console.log("src: unscheduled", "dst: scheduled");
                        html +=  "<button class='btn btn-primary' id='swap-with-unscheduled-button' data-session-id='" + id 
                          + "'>Swap with this session</button>" + _getCancelButtonHTML() + "<br>"
                          + $(this).find(".detail .conflicts")[0].outerHTML
                          + $(this).find(".detail ul")[0].outerHTML;                            
                    } else if ($(this).hasClass("unscheduled")){
                        console.log("N/A. src: unscheduled", "dst: unscheduled");
                    } else if ($(this).hasClass("empty")){
                        console.log("src: unscheduled", "dst: empty");
                        html +=  "<button class='btn btn-primary' id='schedule-button'" 
                         + "data-date='"+$(this).data("date")+"' data-time='"+$(this).data("time")+"' data-room='"+$(this).data("room")
                         +"'>Schedule in this slot</button>" + _getCancelButtonHTML() + "<br>"
                         + $(this).find(".detail .conflicts")[0].outerHTML;
                         // empty sessions don't have a submissions list
                         //+ $(this).find(".detail ul")[0].outerHTML;                        
                    } else {
                        console.log("impossible");
                    }

                } else if (type == "empty") {
                    if ($(this).hasClass("scheduled")){
                        console.log("src: empty", "dst: scheduled");
                        html +=  "<button class='btn btn-primary' id='move-button' data-session-id='" + id 
                          + "'>Move this session</button>" + _getCancelButtonHTML() + "<br>"
                          + $(this).find(".detail .conflicts")[0].outerHTML
                          + $(this).find(".detail ul")[0].outerHTML;
                    } else if ($(this).hasClass("unscheduled")){
                        console.log("src: empty", "dst: unscheduled");
                        html +=  "<button class='btn btn-primary' id='schedule-button' data-session-id='" + id 
                          + "'>Schedule this session</button>" + _getCancelButtonHTML() + "<br>"
                          + $(this).find(".detail .conflicts")[0].outerHTML
                          + $(this).find(".detail ul")[0].outerHTML;
                    } else if ($(this).hasClass("empty")){
                        console.log("N/A. src: empty", "dst: empty");
                    } else {
                        console.log("impossible");
                    }
                } else {
                    console.log("impossible");
                } 
                return html;
           }               
          });

          $(this).popover("show");
    }


    // Handle a propose (swap, unschedule, schedule) request
    function runPropose(){
          var $session = $(".selected").first();
          var id = getID($session);  
          
          var swapValues; 
          if (type === "swap") {
            var tempArray = proposeSlotAndSwap(allSessions[id]);
            swapValues = tempArray.slotValue.concat(tempArray.swapValue);
            //console.log(swapValues);
          } else if (type === "unscheduled") {
            //console.log("unscheduled", id);
            var tempArray = proposeSlotAndSwap(allSessions[id]);
            swapValues = tempArray.slotValue.concat(tempArray.swapValue);
            //swapValues = proposeSlot(allSessions[id]);
          } else if (type === "empty") {
            //console.log($session, $session.data(), $session.data("date"), type);
            //console.log($session.data("date"), $session.data("time"), $session.data("room"), schedule[$session.data("date")][$session.data("time")][$session.data("room")]);
	      
            // HQ: trying allowing a schedules session to move there
            //            swapValues = proposeUnscheduledSessionForSlot($session.data("date"), $session.data("time"), $session.data("room"));
            var tempArray = proposeSessionForSlot($session.data("date"), $session.data("time"), $session.data("room"));
            swapValues = tempArray.scheduleValue.concat(tempArray.unscheduleValue);
          } else {
            console.log("ERROR: type unknown");
            return;
          }
	  
          // Now display each candidate 
          swapValues.sort(function(a, b) {
              // HQ: slight edits here to handle locked slots
              if(a.target.date != null && scheduleSlots[a.target.date][a.target.time][a.target.room]['locked']){
                  return 1;
              } else {
                return b.value - a.value;
              }
            });

          //console.log(JSON.stringify(swapValues));
          //var count = Math.min(swapValues.length, 5);
          var swapContent = "";
          var $cell = null;
          for(var i = 0; i < swapValues.length; i++){    
               
               // empty candidate
               if (swapValues[i].target.session === null){
                    $cell = findCellByDateTimeRoom(swapValues[i].target.date, swapValues[i].target.time, swapValues[i].target.room);
                    console.log("runPropose", i, swapValues[i]);
                    $cell.addClass("proposed-swap"); //.data("title", "Empty slot");

                    swapContent += "<li data-rank-order='" + i + "' data-date='"+swapValues[i].target.date+"' data-time='"+swapValues[i].target.time+"' data-room='"+swapValues[i].target.room+"'>" 
                    + "<a href='#' class='swap-preview-link'>[preview]</a> "
                    + "adding " + (-1*swapValues[i].value)  
                    + ": <a href='#' class='swap-review-link'>" + displaySlotTitle(swapValues[i].target) + "</a>" 
                    + "</li>";                    

               // non-empty candidate
               } else {
                    $cell = findCellByID(swapValues[i].target.session);
                    $cell.addClass("proposed-swap"); //.data("title", allSessions[swapValues[i].target.session].title);

                    swapContent += "<li data-session-id='" + swapValues[i].target.session + "' data-rank-order='" + i + "'>" //+ swapValues[i] 
                    + "<a href='#' class='swap-preview-link'>[preview]</a> "
                    + "resolving " + swapValues[i].value  
                    + ": <a href='#' class='swap-review-link'>" + displaySlotTitle(swapValues[i].target) + "</a>" 
                    + "</li>";
               }


              if (i<5)    // display recommended
                  $cell.addClass("recommended");

               //console.log(swapValues[i]);
               displayPreviewConflicts(swapValues[i], $cell.find(".display"));
               displayFullConflicts(swapValues[i], $cell.find(".detail"));
          }

          // For proposed slots, add a new popover
          $session.addClass("move-src-selected");

          // Display at the top alert box the full information about this proposal
          var alert_html = "";
          alert_html = "<strong>Schedule change in progress</strong>. Click any session to schedule. Recommended sessions in <span class='palette'>&nbsp;</span> minimize conflicts. " 
          + " <button class='btn btn-mini move-cancel-button' type='button'>Cancel Move</button>";
//          + "<div class='row'>";
/*
          if (id === -1)
               alert_html += "<div class='span3 src-display' data-date='"+$session.data("date")+"' data-time='"+$session.data("time")+"' data-room='"+$session.data("room")+"'>" 
          else
               alert_html += "<div class='span3 src-display' data-session-id='" + id + "'>";
*/
          //alert_html += "selected session:<br> <a href='#' class='swap-review-link'>" + displaySessionTitle($session) + "</a></div>"
          //          + "<div class='span6'>" + swapContent + "</div>"
          //          + "</div></div>";
        
          Statusbar.display(alert_html);
          $("#statusbar .palette").css("background-color", "#fd8d3c");
/*
          // Now attach popovers for preview
          $("#statusbar .swap-preview-link").popover({
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
*/
    }



/*
     $("#alert").on("click", ".swap-preview-link", function(){
          return false;
     });
*/

/*
     $("#alert").on("click", ".swap-review-link", function(){
          var id = $(this).parent().data("session-id");
          $(this).toggleClass("view-option-active");
          console.log(id, $(this).parent().data("date"));     
          var cell = null;
          if (typeof id === "undefined")
               cell = findCellByDateTimeRoom($(this).parent().data("date"), $(this).parent().data("time"), $(this).parent().data("room"));
          else
               cell = findCellByID(id);

          $(cell).toggleClass("highlight").popover("toggle");
          return false;
     });
*/

$("body").on("click", ".popover #swap-button", function(){  
    var $source = $(".move-src-selected").first();
    var src_id = getID($source);
    var dst_id = $(this).data("session-id");

    // the backend swap
    swapSessions(allSessions[src_id], allSessions[dst_id]);            
    // the frontend swap
    VisualOps.swap(allSessions[src_id], allSessions[dst_id]);  
    $(document).trigger("addHistory", [{user: "", type: "swap", sid: src_id, did: dst_id}]);
    postMove();
    Statusbar.display("Swap successful");
});

$("body").on("click", ".popover #swap-with-unscheduled-button", function(){  
    var scheduledId = -1;
    var unscheduledId = -1;

    // src: unscheduled, dst: scheduled
    if ($(".move-src-selected").first().hasClass("unscheduled")) {
        unscheduledId = getID($(".move-src-selected").first());
        scheduledId = $(this).data("session-id");
    // src: scheduled, dst: unscheduled [NOT SUPPORTED]
    } else {
        return;
    }

    // the backend swap with unscheduled
    swapWithUnscheduledSession(allSessions[unscheduledId], allSessions[scheduledId]);
    // the frontend swap with unscheduled
    VisualOps.swapWithUnscheduled(allSessions[unscheduledId], allSessions[scheduledId]);
    $(document).trigger("addHistory", [{user: "", type: "swap with unscheduled", sid: unscheduledId, did: scheduledId}]);
    postMove();
    Statusbar.display("Swapping with a unscheduled session successful");
});

$("body").on("click", ".popover #move-button", function(){  
    var $session = null;     // session to schedule
    var $emptySlot = null;   // empty slot into which the session is going
    var id = -1;

    // src: scheduled, dst: empty
    if (typeof $(this).data("session-id") === "undefined") {   
       $session = $(".move-src-selected").first();
       $emptySlot = findCellByDateTimeRoom($(this).data("date"), $(this).data("time"), $(this).data("room"));

    // src: empty, dst: scheduled
    } else { 
       var session_id = $(this).data("session-id");
       $session = findCellByID(session_id);
       $emptySlot = $(".move-src-selected").first();
    }

    id = getID($session);          
    var oldDate = allSessions[id].date;
    var oldTime = allSessions[id].time;
    var oldRoom = allSessions[id].room;

    // the backend move
    scheduleSession(allSessions[id], $emptySlot.data("date"), $emptySlot.data("time"), $emptySlot.data("room"));
    // the frontend move
    VisualOps.swapWithEmpty(allSessions[id], $emptySlot, oldDate, oldTime, oldRoom);

    $(document).trigger("addHistory", [{user: "", type: "move", id: id}]);
    postMove();
    Statusbar.display("Move successful");
});

$("body").on("click", ".popover #schedule-button", function(){  
    var $session = null;     // session to schedule
    var $emptySlot = null;   // empty slot into which the session is going
    var id = -1;

    // src: unscheduled, dst: empty
    if (typeof $(this).data("session-id") === "undefined") {   
       $session = $(".move-src-selected").first();
       $emptySlot = findCellByDateTimeRoom($(this).data("date"), $(this).data("time"), $(this).data("room"));

    // src: empty, dst: unscheduled
    } else { 
       var session_id = $(this).data("session-id");
       $session = findCellByID(session_id);
       $emptySlot = $(".move-src-selected").first();
    }

    id = getID($session);
    // the backend scheduling
    console.log("SCHEDULE", id, "into", $emptySlot.data("date"), $emptySlot.data("time"), $emptySlot.data("room"));
    scheduleSession(allSessions[id], $emptySlot.data("date"), $emptySlot.data("time"), $emptySlot.data("room"));
    // the frontend scheduling: backend should be called first to have the updated allSessions[id] information
    VisualOps.scheduleUnscheduled(allSessions[id], $emptySlot);

    $(document).trigger("addHistory", [{user: "", type: "schedule", id: id}]);
    postMove();
    Statusbar.display("Scheduling successful");
});


/*
     // clicking the 'swap' button from one of the proposed swaps.
     // should perform swap and return to the clean state with no selection and proposals.
     $("body").on("click", ".popover #swap-button", function(){               
        var $source = $(".move-src-selected").first();
        var src_id = getID($source);
        var dst_id = $(this).data("session-id");

	//	console.log(src_id);
	//	console.log(dst_id);

        // source is always a scheduled session
        // destination: empty
        // unschedule the source and schedule the destination
        if (typeof dst_id === "undefined") {
            // Part 2. Schedule the destination
            var $emptySlot = findCellByDateTimeRoom($(this).data("date"), $(this).data("time"), $(this).data("room"));           
            var oldDate = allSessions[src_id].date;
            var oldTime = allSessions[src_id].time;
            var oldRoom = allSessions[src_id].room;

            // the backend scheduling
            scheduleSession(allSessions[src_id], $emptySlot.data("date"), $emptySlot.data("time"), $emptySlot.data("room"));
            // the frontend scheduling
            //VisualOps.scheduleSessionCell(src_id, $emptySlot, $source);
            VisualOps.swapWithEmpty(allSessions[src_id], $emptySlot, oldDate, oldTime, oldRoom);
            $(document).trigger("addHistory", [{user: "", type: "move", id: src_id}]);

        // destination: scheduled session (currently no unscheduled session can be swapped)
        } else {
            // the backend swap
            swapSessions(allSessions[src_id], allSessions[dst_id]);            
            // the frontend swap
            VisualOps.swap(allSessions[src_id], allSessions[dst_id]);  
            $(document).trigger("addHistory", [{user: "", type: "swap", sid: src_id, did: dst_id}]);
        }

        postMove();
        Statusbar.display("Swap successful");
     });    


    // clicking the 'schedule' button from one of the proposed swaps. - for empty or unscheduled sessions
    // should perform scheduling and return to the clean state with no selection and proposals.
    $("body").on("click", ".popover #schedule-button", function(){
        var $session = null;     // session to schedule
        var $emptySlot = null;   // empty slot into which the session is going
        var id = -1;

        // empty slot is the target, unscheduled session is the source
        //console.log(typeof $(this).data("session-id"), $(this).data("date"), $(this).data("time"), $(this).data("room"));
        if (typeof $(this).data("session-id") === "undefined") {   
           $session = $(".move-src-selected").first();
           $emptySlot = findCellByDateTimeRoom($(this).data("date"), $(this).data("time"), $(this).data("room"));
        // unscheduled session is the target, empty slot is the source
        } else { 
           var session_id = $(this).data("session-id");
           $session = findCellByID(session_id);
           $emptySlot = $(".move-src-selected").first();
        }

        id = getID($session);
        // the backend scheduling
        console.log("SCHEDULE", id, "into", $emptySlot.data("date"), $emptySlot.data("time"), $emptySlot.data("room"));
        scheduleSession(allSessions[id], $emptySlot.data("date"), $emptySlot.data("time"), $emptySlot.data("room"));
        //console.log(allSessions[id]);
        // the frontend scheduling: backend should be called first to have the updated allSessions[id] information
        //VisualOps.scheduleSessionCell(id, $emptySlot, $session);
        VisualOps.scheduleUnscheduled(allSessions[id], $emptySlot);
        $(document).trigger("addHistory", [{user: "", type: "schedule", id: id}]);
        postMove();
        Statusbar.display("Scheduling successful");
    });  
*/
    // clicking the 'cancel swap' link while swap in progress.
    // should return to the clean state with no selection and proposals.
    $("body").on("click", ".move-cancel-button", function(){
        postMove();
        Statusbar.display("Select a session for scheduling options and more information.");    
    });


    function postMove(){
        updateUnscheduledCount();
        // the backend conflicts update
        getAllConflicts();
        // this erases the preview conflicts display, so necessary
        clearConflictDisplay();
        // the frontend conflicts update: the row view of conflicts.
        updateConflicts();
        destroy();
        ViewMode.initialize();
    }

    // Reset any change created in this view mode
    function destroy(){
        isOn = false;
        type = "";
        // TOOD: check all the other things the swapping mode has created and reset/undo them.
        
        $(".recommended").removeClass("recommended");
        $(".selected").removeClass("selected");
        $(".move-src-selected").removeClass("move-src-selected");
        $(".move-dst-selected").removeClass("move-dst-selected");
        $(".proposed-swap").removeClass("proposed-swap");   
        $(".highlight").removeClass("highlight");          
        //$("#statusbar .swap-preview-link").popover("destroy");
        $("body").off("click", ".slot", slotClickHandler);      
        $(".slot").popover("destroy");  
    }

    return {
        isOn: isOn,
        initialize: initialize,
        destroy: destroy
    };
}();     