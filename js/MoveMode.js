var MoveMode = function() {
    var isOn = false;
    var type = "";
    var paperId = "";

    // Initialize the view mode 
    function initialize(moveType, pid){
        //console.log("PaperID", pid, pid == "");
        // If already on, do not register multiple events
        if (!MoveMode.isOn){
            MoveMode.isOn = true;
            type = moveType;
            paperId = pid;
            ViewMode.destroy();
            $(".main").addClass("move-mode");
            Conflicts.clearConflictDisplay();
            $("#list-view-options li a").first().trigger("click");
            bindEvents();
            runPropose();
        }
    }

    // Add event handlers to each sidebar item
    function bindEvents(){
        $("body").on("click", ".slot", slotClickHandler);
        $("body").on("click", ".slot-paper", paperSlotClickHandler);
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

    function getCancelButtonHTML(){
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
        //console.log("slotClick", $selection[0] == $(this)[0], $(this).hasClass("unavailable"), !$(this).hasClass("proposed-swap"));
        // if reselected, do nothing.
        if ($selection[0] == $(this)[0])
           return;
        // do nothing for unavailable slots
        if ($(this).hasClass("unavailable"))
           return;
        // if not proposed, do nothing. But only when myself is not selected again.
        if (!$(this).hasClass("move-src-selected") && !$(this).hasClass("proposed-swap"))
            return;

        var id = getID($(this));
        var session = allSessions[id];
        $(this).addClass("move-dst-selected");
        $(this).popover({
            html:true,
            placement: "bottom",
            trigger: "manual",
            title:function(){
                if ($(this).hasClass("empty"))
                    return "Empty slot " 
                        + " <a class='close popover-close' data-dismiss='clickover' " 
                        + "data-date='"+$(this).attr("data-date")+"' data-time='"+$(this).attr("data-time")+"' data-room='"+$(this).attr("data-room")
                        + "' href='#''>&times;</a>";
                else
                    return "<strong>[" + session.venue + "] " + session.title + "</strong> "                       
                        + "<a class='close popover-close' data-dismiss='clickover' data-session-id='" + id 
                        + "' href='#''>&times;</a>";
            },
            content:function(){
                //var id = $(this).data("session-id");
                //console.log(id);
                
                var html = "";
                if ($(this).hasClass("move-src-selected")) {
                    console.log("slotClickHandler: move-src-selected");                   
                    html += "<div class='alert alert-info'><strong>Select another session to schedule this session.</strong></div>" + getCancelButtonHTML();
                    if (id !== -1)
                        html += getSubmissionList("move", session, type);

                // } else if ($(this).find(".title").hasClass("locked")) {
                //     console.log("slotClickHandler: locked");                  
                //     html +=  "<strong>This is a locked session. Unlock to change the schedule.</strong><br>" + getCancelButtonHTML();
                //     if (id !== -1)
                //         html += getSubmissionList("move", session, type);

                } else if (type == "scheduled" || type == "unscheduled" || type == "empty"){
                    if ($(this).hasClass("scheduled")){
                        html += getSessionDetail("move", "scheduled", session, type);
                    } else if ($(this).hasClass("unscheduled")){
                        html += getSessionDetail("move", "unscheduled", session, type);
                    } else if ($(this).hasClass("empty")) {
                        html += getSessionDetail("move", "empty", new slot($(this).attr("data-date"), $(this).attr("data-time"), $(this).attr("data-room"), null), type);
                    } else {
                        console.log("impossible");
                    }
                } else if (type == "paper-scheduled" || type == "paper-unscheduled" || type == "paper-empty"){
                    if ($(this).hasClass("scheduled")){
                        html += getSessionDetail("paperMove", "scheduled", session, type);
                    } else if ($(this).hasClass("unscheduled")){
                        html += getSessionDetail("paperMove", "unscheduled", session, type);
                    } else if ($(this).hasClass("empty")) {
                        html += getSessionDetail("paperMove", "empty", new slot($(this).attr("data-date"), $(this).attr("data-time"), $(this).attr("data-room"), null), type);
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

     // Event handler for clicking an individual paper (only in the unscheduled panel)
    function paperSlotClickHandler(){
        console.log("MM.paperSlotClickHandler");

        var $selection = $(".move-dst-selected");
        $(".move-dst-selected").removeClass("move-dst-selected").popover("hide");   
        console.log("slotClick", $selection[0] == $(this)[0], $(this).hasClass("unavailable"), typeof $(this).attr("data-proposed-swap-paper") === "undefined");
        // if reselected, do nothing.
        if ($selection[0] == $(this)[0])
           return;
        // do nothing for unavailable slots
        if ($(this).hasClass("unavailable"))
           return;
        // if not proposed, do nothing. But only when myself is not selected again.
        //if (!$(this).hasClass("move-src-selected") && !$(this).hasClass("proposed-swap"))
        if (!$(this).hasClass("move-src-selected") && typeof $(this).attr("data-proposed-swap-paper") === "undefined")
            return;

        var id = $(this).attr("id");
        var submission = allSubmissions[id];
        var submissionType = (submission.type == "paper") ? submission.subtype : submission.type;

        $(this).addClass("move-dst-selected");
        $(this).popover({
          html:true,
          placement: "bottom",
          trigger: "manual",
           title:function(){
                if ($(this).hasClass("empty"))
                    return "Empty slot " 
                        + " <a class='close popover-close' data-dismiss='clickover' " 
                        + "data-date='"+$(this).attr("data-date")+"' data-time='"+$(this).attr("data-time")+"' data-room='"+$(this).attr("data-room")
                        + "' href='#''>&times;</a>";
                else
                    return "<strong>[" + submissionType + "]</strong> " + submission.title                         
                        + "<a class='close popover-close' data-dismiss='clickover' data-session-id='" + id 
                        + "' href='#''>&times;</a>";            
           },
           content:function(){
                var html = "";
                console.log($(this));
                if ($(this).hasClass("move-src-selected")) {
                    console.log("paperSlotClickHandler: move-src-selected");                   
                    html += "<strong>Select another session to schedule this session.</strong><br>" + getCancelButtonHTML();
                    if (id !== -1)
                        html += getSubmissionDetail("move", "unscheduled", submission, type);

                } else if ($(this).find(".title").hasClass("locked")) {
                    console.log("paperSlotClickHandler: locked");                  
                    html +=  "<strong>This is a locked session. Unlock to change the schedule.</strong><br>" + getCancelButtonHTML();
                    if (id !== -1)
                        html += getSubmissionDetail("move", "unscheduled", submission, type);

                } else if ($(this).hasClass("empty")){
                    console.log("impossible");
                    //html += getSubmissionDetail("paperMove", "empty", new slot($(this).data("date"), $(this).data("time"), $(this).data("room"), null), type);
                } else if ($(this).hasClass("unscheduled")){
                    console.log("paperSlotClickHandler: unscheduled");   
                    html += getSubmissionDetail("paperMove", "unscheduled", submission, type, null);
                } else if ($(this).hasClass("scheduled")) {
                    console.log("impossible");
                    //html += getSubmissionDetail("paperMove", "scheduled", submission, type);
                } else
                    console.log("impossible");
                return html;
           }
        });
        $(this).popover("show");          
    }

    // Handle a propose (swap, unschedule, schedule) request
    function runPropose(){
        var $session = $(".selected").first();
        var id = getID($session);  
        var recommendedSpecialList = [];
        var recommendedScheduledList = [];
        var numSpecialRecommended = 2; // we want to ensure at most 2 empty and unscheduled recommendations out of 5.
        var numScheduledRecommended = 5; // we want to ensure at most 5 empty and unscheduled recommendations out of 5.
        var numRecommended = 5; // total number of recommendations

        var swapValues; 
        if (type === "scheduled") {
            var tempArray = proposeSlotAndSwap(allSessions[id]);
            swapValues = tempArray.slotValue.concat(tempArray.swapValue);
	    	    for(i in tempArray.swapValue){
			if(tempArray.swapValue[i].target.session == 's249'){
			    console.log("look here");
			    console.log(tempArray.swapValue[i]);
			}
		    }

        } else if (type === "unscheduled") {
            var tempArray = proposeSlotAndSwap(allSessions[id]);
            swapValues = tempArray.slotValue.concat(tempArray.swapValue);
        } else if (type === "empty") {
            var tempArray = proposeSessionForSlot($session.attr("data-date"), $session.attr("data-time"), $session.attr("data-room"));
            swapValues = tempArray.scheduleValue.concat(tempArray.unscheduleValue);
        } else if (type === "paper-scheduled") {
            var tempArray = proposePaperSessionAndSwap(allSubmissions[paperId]);
            swapValues = tempArray.sessionValue.concat(tempArray.swapValue);
        } else if (type === "paper-unscheduled") {
            var tempArray = proposePaperSessionAndSwap(allSubmissions[paperId]);
            swapValues = tempArray.sessionValue.concat(tempArray.swapValue);
        } else if (type === "paper-empty") {
            var tempArray = proposePaperForSession(allSessions[id]);
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

        var $cell = null;
        for(var i = 0; i < swapValues.length; i++){    
            //console.log("SWAP", swapValues[i]);   

            // empty session candidate
            if (swapValues[i].target.session === null){
                if (typeof swapValues[i].target.date !== "undefined" && typeof swapValues[i].target.time !== "undefined" && typeof swapValues[i].target.room !== "undefined"){
                    $cell = findCellByDateTimeRoom(swapValues[i].target.date, swapValues[i].target.time, swapValues[i].target.room);
                    $cell.addClass("proposed-swap"); //.data("title", "Empty slot");
                    if (numSpecialRecommended > 0){
                        recommendedSpecialList.push($cell);
                        numSpecialRecommended--;
                    }
                }

                var submission = swapValues[i].target.paper;   
                // Paper-level unscheduled candidate exists: session null, submission id
                if (typeof submission !== "undefined") {                    
                        $("#"+submission).attr("data-proposed-swap-paper", "true").addClass("proposed-swap");
                        console.log("runPropose: unscheduled");   
                }   
            // non-empty session candidate
            } else {
                var session = swapValues[i].target.session;
                var submission = swapValues[i].target.paper;
                $cell = findCellByID(swapValues[i].target.session);
                $cell.addClass("proposed-swap"); //.data("title", allSessions[swapValues[i].target.session].title);
                if ($cell.hasClass("unscheduled")) {
                    if (numSpecialRecommended > 0){
                        recommendedSpecialList.push($cell);
                        numSpecialRecommended--;
                    }
                } else {
                    if (numScheduledRecommended > 0){
                        recommendedScheduledList.push($cell);
                        numScheduledRecommended--;
                    }                   
                }
                // Paper-level empty or scheduled candidate exists
                if (typeof submission !== "undefined") {                    
                    // store currently inserted paper-level proposals
                    var curList = typeof $cell.attr("data-proposed-swap-paper") === "undefined" ? "" : $cell.attr("data-proposed-swap-paper");
                    curList += "," + submission;

                    // if (submission == null)
                    //     console.log("runPropose: empty");
                    // else 
                    //     console.log("runPropose: scheduled");
                    $cell.attr("data-proposed-swap-paper", curList);                                       
                }
            }
            //console.log(swapValues[i]);
            Conflicts.displayPreviewConflicts(swapValues[i], $cell.find(".conflicts"));
            // console.log(outerHTML($cell.find(".conflicts")));
            $cell.find(".display").html($cell.find(".conflicts").html());
            Conflicts.displayFullConflicts(swapValues[i], $cell.find(".detail"));
        }


        // Mark the current selection, which is the source session
        $session.addClass("move-src-selected");

        if (type.indexOf("paper") === -1) {
            var numAssigned = 0;
            $(document).trigger("addMoveStatus", [id]);
            // specials (unscheduled, empty) first because they have the priority
            $.each(recommendedSpecialList, function(index, rec) {
                if (numAssigned < numRecommended) {
                    if (type == "scheduled" && $(rec).hasClass("empty")){ // for move (target is empty), we don't recommend empty sessions

                    } else {
                        $(rec).addClass("recommended");
                        numAssigned++;    
                    }
                    
                }                
            });  
            // scheduled sessions until numRecommended is met        
            $.each(recommendedScheduledList, function(index, rec) {
                if (numAssigned < numRecommended) {
                    $(rec).addClass("recommended");
                    numAssigned++;
                }                
            });

        } else
            $(document).trigger("addPaperMoveStatus", [id, paperId]);

    }

/******************************
 * Session level operations
 ******************************/

    $("body").on("click", ".popover #swap-button", function(){  
        $(this).click(false);     // avoiding multiple clicks            
        var $source = $(".move-src-selected").first();
        var src_id = getID($source);
        var dst_id = $(this).attr("data-session-id");

        // the backend swap
        swapSessions(allSessions[src_id], allSessions[dst_id]);            
    });

    $("body").on("click", ".popover #swap-with-unscheduled-button", function(){  
        $(this).click(false);     // avoiding multiple clicks            
        var scheduledId = -1;
        var unscheduledId = -1;

        // src: unscheduled, dst: scheduled
        if ($(".move-src-selected").first().hasClass("unscheduled")) {
            unscheduledId = getID($(".move-src-selected").first());
            scheduledId = $(this).attr("data-session-id");
        // src: scheduled, dst: unscheduled [NOT SUPPORTED]
        } else {
            return;
        }

        // the backend swap with unscheduled
        swapWithUnscheduledSession(allSessions[unscheduledId], allSessions[scheduledId]);
    });

    $("body").on("click", ".popover #move-button", function(){  
        $(this).click(false);     // avoiding multiple clicks            
        var $session = null;     // session to schedule
        var $emptySlot = null;   // empty slot into which the session is going
        var id = -1;

        // src: scheduled, dst: empty
        if (typeof $(this).attr("data-session-id") === "undefined") {   
           $session = $(".move-src-selected").first();
           $emptySlot = findCellByDateTimeRoom($(this).attr("data-date"), $(this).attr("data-time"), $(this).attr("data-room"));

        // src: empty, dst: scheduled
        } else { 
           var session_id = $(this).attr("data-session-id");
           $session = findCellByID(session_id);
           $emptySlot = $(".move-src-selected").first();
        }

        id = getID($session);          
        var oldDate = allSessions[id].date;
        var oldTime = allSessions[id].time;
        var oldRoom = allSessions[id].room;

        // the backend move
        scheduleSession(allSessions[id], $emptySlot.attr("data-date"), $emptySlot.attr("data-time"), $emptySlot.attr("data-room"));
    });

    $("body").on("click", ".popover #schedule-button", function(){  
        $(this).click(false);     // avoiding multiple clicks            
        var $session = null;     // session to schedule
        var $emptySlot = null;   // empty slot into which the session is going
        var id = -1;

        // src: unscheduled, dst: empty
        if (typeof $(this).attr("data-session-id") === "undefined") {   
           $session = $(".move-src-selected").first();
           $emptySlot = findCellByDateTimeRoom($(this).attr("data-date"), $(this).attr("data-time"), $(this).attr("data-room"));
           //console.log("case1", $session, $emptySlot, $(this), $(this).attr("data-date"), $(this).attr("data-time"), $(this).attr("data-room"));
        // src: empty, dst: unscheduled
        } else { 
           var session_id = $(this).attr("data-session-id");
           $session = findCellByID(session_id);
           $emptySlot = $(".move-src-selected").first();
           //console.log("case2", $session, $emptySlot);
        }

        id = getID($session);
        // the backend scheduling
        console.log("SCHEDULE", id, "into", $emptySlot.attr("data-date"), $emptySlot.attr("data-time"), $emptySlot.attr("data-room"));
        scheduleSession(allSessions[id], $emptySlot.attr("data-date"), $emptySlot.attr("data-time"), $emptySlot.attr("data-room"));
    });


/******************************
 * Paper level operations
 ******************************/

    $("body").on("click", ".popover .button-paper-swap", function(){  
        $(this).click(false);     // avoiding multiple clicks                    
        var src_id = paperId;
        var dst_id = $(this).parent().attr("id");

        // the backend swap
        swapPapers(allSessions[allSubmissions[src_id].session], allSubmissions[src_id], allSessions[allSubmissions[dst_id].session], allSubmissions[dst_id]);            
    }); 

    $("body").on("click", ".popover .button-paper-swap-with-unscheduled", function(){  
        $(this).click(false);     // avoiding multiple clicks            
        var scheduledId = -1;
        var unscheduledId = -1;

        // src: unscheduled, dst: scheduled
        if ($(".move-src-selected").first().hasClass("unscheduled")) {
            unscheduledId = paperId;
            scheduledId = $(this).parent().attr("id");
        // src: scheduled, dst: unscheduled [NOT SUPPORTED]
        } else {
            return;
        }

        // the backend swap with unscheduled
        swapWithUnscheduledPaper(allSubmissions[unscheduledId], allSessions[allSubmissions[scheduledId].session], allSubmissions[scheduledId]);
    });

    $("body").on("click", ".popover .button-paper-move", function(){  
        $(this).click(false);     // avoiding multiple clicks            
        var scheduledId = -1;
        var emptySessionId = -1;   // empty slot into which the session is going
        // src: scheduled, dst: empty
        if (paperId != "") {   
            scheduledId = paperId;
            emptySessionId = getID($(".move-dst-selected").first());
        // src: empty, dst: scheduled
        } else { 
            scheduledId = $(this).parent().attr("id");
            emptySessionId = getID($(".move-src-selected").first());
        }     

        // the backend move
        movePaper(allSessions[allSubmissions[scheduledId].session], allSubmissions[scheduledId], allSessions[emptySessionId]);
    });

    $("body").on("click", ".popover .button-paper-schedule", function(){  
        $(this).click(false);     // avoiding multiple clicks               
        var emptySessionId = -1;
        var unscheduledPaperId = -1;

        // src: unscheduled, dst: empty
        if (paperId != "") {   
            unscheduledPaperId = paperId;
            emptySessionId = getID($(".move-dst-selected").first());

        // src: empty, dst: unscheduled
        } else { 
            unscheduledPaperId = $(".move-dst-selected").first().attr("id");
            emptySessionId = getID($(".move-src-selected").first());
        }
        // the backend scheduling
        schedulePaper(allSessions[emptySessionId], allSubmissions[unscheduledPaperId]);

    });

    // clicking the 'cancel swap' link while swap in progress.
    // should return to the clean state with no selection and proposals.
    $("body").on("click", ".move-cancel-button", function(){
        $(this).click(false);     // avoiding multiple clicks               
        destroy();
        Statusbar.display("Select a session for scheduling options and more information.");    
    });

    // Reset any change created in this view mode
    function destroy(){
        MoveMode.isOn = false;
        type = "";
        // TOOD: check all the other things the swapping mode has created and reset/undo them.
        
        $("#unscheduled-papers .slot-paper").removeAttr("data-proposed-swap-paper");
        $("#program .slot").removeAttr("data-proposed-swap-paper");

        $(".recommended").removeClass("recommended");
        $(".selected").removeClass("selected");
        $(".move-src-selected").removeClass("move-src-selected");
        $(".move-dst-selected").removeClass("move-dst-selected");
        $(".proposed-swap").removeClass("proposed-swap"); 
        $(".proposed-swap-paper").removeClass("proposed-swap-paper");   
        // $(".highlight").removeClass("highlight");          
        //$("#statusbar .swap-preview-link").popover("destroy");
        $("body").off("click", ".slot", slotClickHandler); 
        $("body").off("click", ".slot-paper", paperSlotClickHandler);     
        $(".slot").popover("destroy");  
        $(".slot-paper").popover("destroy");  

        // Everything is done, so now go back to ViewMode.
        $(".main").removeClass("move-mode");
        ViewMode.initialize();
    }

    return {
        isOn: isOn,
        initialize: initialize,
        getCancelButtonHTML: getCancelButtonHTML,
        destroy: destroy
    };
}();     