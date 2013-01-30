var ViewMode = function() {
    var isOn = false;

    // Initialize the view mode 
    function initialize(){
        isOn = true;
        //MoveMode.destroy();
        bindEvents();
        initDisplay();
    }

    // Display is the bottom portion of the session display, which summarizes conflicts
    function initDisplay(){
        // default is the conflict view
        $("#list-view-options li a").first().trigger("click");
    }

     // Add event handlers to each sidebar item
    function bindEvents(){
        $("body").on("click", ".slot", slotClickHandler);
        $("body").on("click", ".popover .button-unschedule", unscheduleHandler);
        $("body").on("click", ".popover .button-propose-swap", {type: "swap"}, proposeHandler);
        $("body").on("click", ".popover .button-propose-unscheduled", {type: "unscheduled"}, proposeHandler);
        $("body").on("click", ".popover .button-propose-empty", {type: "empty"}, proposeHandler);
        $("body").on("click", ".popover .button-lock", lockHandler);
        $("body").on("click", ".popover .button-unlock", unlockHandler);

        // paper-level operations
        $("body").on("click", ".slot-paper", paperSlotClickHandler);
        $("body").on("click", ".popover .button-paper-reorder", paperReorderHandler);
        $("body").on("click", ".popover .button-paper-unschedule", paperUnscheduleHandler);
        $("body").on("click", ".popover .button-paper-propose-scheduled", {type: "scheduled"}, paperProposeHandler);
        $("body").on("click", ".popover .button-paper-propose-unscheduled", {type: "unscheduled"}, paperProposeHandler);
        $("body").on("click", ".popover .button-paper-propose-empty", {type: "empty"}, paperProposeHandler);
    }

    function _readPaperOrder($list){
        var order = [];
        $.each($list.find("li"), function(index, item){
            order.push(item.id);
        });
        return order;
    }

    function postMove(){
        updateUnscheduledCount();
        // the backend conflicts update
        getAllConflicts();
        // this erases the preview conflicts display, so necessary
        clearConflictDisplay();
        // the frontend conflicts update: the row view of conflicts.
        updateConflicts();
    }


     // Event handler for clicking an individual session
    function paperSlotClickHandler(){
        console.log("VM.slotpaperclick");
        // detect if the currently selected item is selected again.
        //var $selection = $(this).hasClass("unscheduled")? $("#unscheduled .selected"): $("#program .selected");
        //var $otherSelection = $(this).hasClass("unscheduled")? $("#program .selected"): $("#unscheduled .selected");

        // only one popover at a time? this allows multiple selections possible
        //$selection.removeClass("selected").popover("hide");
        var $selection = $(".selected");
        $(".selected").removeClass("selected").popover("hide");          

        // if reselected, do nothing.
        if ($selection[0] == $(this)[0])
           return;
        
        // do nothing for unavailable slots
        if ($(this).hasClass("unavailable"))
           return;

        var id = $(this).attr("id");
        var submission = allSubmissions[id];
        var submissionType = "";
        if (submission.type == "paper")
            submissionType = submission.subtype;
        else 
            submissionType = submission.type;

        $(this).addClass("selected");
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
                    return "<strong>[" + submissionType + "]</strong> " + submission.title                         
                        + "<a class='close popover-close' data-dismiss='clickover' data-session-id='" + id 
                        + "' href='#''>&times;</a>";            
           },
           content:function(){
                if ($(this).hasClass("empty")){
                    return getSubmissionDetail("empty", new slot($(this).data("date"), $(this).data("time"), $(this).data("room"), null));
                } else if ($(this).hasClass("unscheduled")){
                    return getSubmissionDetail("unscheduled", submission);
                } else{
                    return getSubmissionDetail("scheduled", submission);
                    //return $(this).find(".detail").html();
                }
           }
        });
        $(this).popover("show");          
    }

    function paperReorderHandler(event){
        //console.log($(".list-submissions"));
        var $session = $(".selected").first();
        var id = getID($session);  
        var $list = $(this).find("~ .list-submissions");
        // TODO: when popover is gone, move it back to initial stage

        if ($(this).html() == "Reorder"){
            $(this).html("Save Order");
            // TODO: Visual display indicating sortable
            $list.sortable().disableSelection();
            allSessions[id].paperOrder = _readPaperOrder($list);
        } else {
            $(this).html("Reorder");
            // TODO: save order
            $list.sortable("disable").enableSelection();

            // save only when the order changed
            console.log("Reordering: NEW", _readPaperOrder($list), "OLD", allSessions[id].paperOrder);
            if (!arraysEqual(allSessions[id].paperOrder, _readPaperOrder($list))){
                // backend reorder (current session, new order, old order)
                reorderPapers(allSessions[id], _readPaperOrder($list), allSessions[id].paperOrder);
                allSessions[id].paperOrder = _readPaperOrder($list);
                // frontend reorder: nothing

                //$(".selected").removeClass("selected");
                Statusbar.display("Paper reordering successful");
                $(document).trigger("addHistory", [{user: "", type: "paper-reorder", id: id}]);

                postMove();        
            }
        }
    }

    function paperUnscheduleHandler(event){
        var $session = $(".selected").first();
        var id = getID($session);
        if (id === -1)
            return;

        var $paper = $(this).parent();
        var pid = $paper.attr("id");

/*
        // Part 1. Add to the unscheduled pane
        var new_session = getSessionCell("unscheduled", allSessions[id]);
        $("#unscheduled").append(new_session);

        // Part 2. Make the current slot empty.
        $session.removeClass("selected").popover("destroy").removeAttr("id").removeData();
        var after = getSessionCell("empty", null, allSessions[id].date, allSessions[id].time, allSessions[id].room);
        // Watch out! jQuery replaceWith returns the original element, not the replaced element.
        $session.replaceWith(after); 
*/
        var oldDate = allSessions[id].date;
        var oldTime = allSessions[id].time;
        var oldRoom = allSessions[id].room;

        // the backend unschedule paper
        unschedulePaper(allSessions[id], allSubmissions[pid]);

        // the frontend unschedule paper
        //VisualOps.unschedule(allSessions[id], oldDate, oldTime, oldRoom);
        $paper.remove();
        var $cell = getSubmissionCell("unscheduled", allSubmissions[pid]);
        $("#unscheduled-papers").append($cell);

        Statusbar.display("Paper unschedule successful");
        $(document).trigger("addHistory", [{user: "", type: "paper-unschedule", id: id, pid: pid}]);

        postMove(); 
    }

    function paperProposeHandler(event){
        // Don't need the actual target information because .selected detects this.
        PaperMoveMode.initialize(event.data.type);
    }

    // When move is request, forward this request to MoveMode.
    // This is the only way to switch modes from ViewMode to MoveMode.
    function proposeHandler(event){
        // Don't need the actual target information because .selected detects this.
        MoveMode.initialize(event.data.type);
    }

    // When the unschedule button is clicked. Move the item to the unscheduled workspace.
    function unscheduleHandler(){
        var $session = $(".selected").first();
        var id = getID($session);
        if (id === -1)
            return;
/*
        // Part 1. Add to the unscheduled pane
        var new_session = getSessionCell("unscheduled", allSessions[id]);
        $("#unscheduled").append(new_session);

        // Part 2. Make the current slot empty.
        $session.removeClass("selected").popover("destroy").removeAttr("id").removeData();
        var after = getSessionCell("empty", null, allSessions[id].date, allSessions[id].time, allSessions[id].room);
        // Watch out! jQuery replaceWith returns the original element, not the replaced element.
        $session.replaceWith(after); 
*/
        var oldDate = allSessions[id].date;
        var oldTime = allSessions[id].time;
        var oldRoom = allSessions[id].room;

        // the backend unschedule session
        unscheduleSession(allSessions[id]);
        // the frontend unschedule session
        VisualOps.unschedule(allSessions[id], oldDate, oldTime, oldRoom);

        $(".selected").removeClass("selected");
        Statusbar.display("Unschedule successful");
        $(document).trigger("addHistory", [{user: "", type: "unschedule", id: id}]);

        postMove();    
    }

     // Event handler for clicking an individual session
    function slotClickHandler(){
        console.log("VM.slotclick");
        // detect if the currently selected item is selected again.
        //var $selection = $(this).hasClass("unscheduled")? $("#unscheduled .selected"): $("#program .selected");
        //var $otherSelection = $(this).hasClass("unscheduled")? $("#program .selected"): $("#unscheduled .selected");

        // only one popover at a time? this allows multiple selections possible
        //$selection.removeClass("selected").popover("hide");
        var $selection = $(".selected");
        $(".selected").removeClass("selected").popover("hide");          

        // if reselected, do nothing.
        if ($selection[0] == $(this)[0])
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
                    return "Empty slot " 
                        + " <a class='close popover-close' data-dismiss='clickover' " 
                        + "data-date='"+$(this).data("date")+"' data-time='"+$(this).data("time")+"' data-room='"+$(this).data("room")
                        + "' href='#''>&times;</a>";
                else
                    return "<strong>[" + session.venue + "]</strong> " + session.title                         
                        + "<a class='close popover-close' data-dismiss='clickover' data-session-id='" + id 
                        + "' href='#''>&times;</a>";            
           },
           content:function(){
                if ($(this).hasClass("empty")){
                    return getSessionDetail("empty", new slot($(this).data("date"), $(this).data("time"), $(this).data("room"), null));
                } else if ($(this).hasClass("unscheduled")){
                    return getSessionDetail("unscheduled", session);
                } else{
                    return getSessionDetail("scheduled", session);
                    //return $(this).find(".detail").html();
                }
           }
        });
        $(this).popover("show");          
    }

    // HQ: Handles a lock request
    function lockHandler(){
        // TODO: write to history-links
        var $session = $(".selected").first();
        var id = getID($session);  
        var date, time, room; 
        if(id in allSessions){
            lockSlot(allSessions[id].date, allSessions[id].time, allSessions[id].room);
            $session.data('popover').options.content = function(){
                return getSessionDetail("scheduled", allSessions[id]);
            };
            $(document).trigger("addHistory", [{user: "", type: "lock", id: id}]);

        } else {
            lockSlot($session.data("date"), $session.data("time"), $session.data("room"));
            $session.data('popover').options.content = function(){
                // HQ: passing a slot for session (allows for isLocked check)
                return getSessionDetail("empty", new slot($session.data("date"), $session.data("time"), $session.data("room"), null));
            };
            $(document).trigger("addHistory", [{user: "", type: "lock", date: $session.data("date"), time: $session.data("time"), room: $session.data("room")}]);
        }
        $session.removeClass("selected").popover("hide");
        $session.find(".title").addClass("locked");
    }

    // HQ: handle an unlock request
    function unlockHandler(){
        // TODO: write to history-links
        var $session = $(".selected").first();
        var id = getID($session);  
        if(id in allSessions){
            unlockSlot(allSessions[id].date, allSessions[id].time, allSessions[id].room);
            $session.data('popover').options.content = function(){
                return getSessionDetail("scheduled", allSessions[id]);
            };
            $(document).trigger("addHistory", [{user: "", type: "unlock", id: id}]);

        }else{
            unlockSlot($session.data("date"), $session.data("time"), $session.data("room"));
            $session.data('popover').options.content = function(){
                // HQ: passing a slot for session (allows for isLocked check)
                return getSessionDetail("empty", new slot($session.data("date"), $session.data("time"), $session.data("room"), null));
            };
            $(document).trigger("addHistory", [{user: "", type: "unlock", date: $session.data("date"), time: $session.data("time"), room: $session.data("room")}]);
        }

        $session.removeClass("selected").popover("hide");
        $session.find(".title").removeClass("locked");
    }

    // Reset any change created in this view mode
    function destroy(){
        isOn = false;

        $("body").off("click", ".slot", slotClickHandler); 
        $("body").off("click", ".popover .button-unschedule", unscheduleHandler); 
        $("body").off("click", ".popover .button-propose-swap", proposeHandler);
        $("body").off("click", ".popover .button-propose-unscheduled", proposeHandler);
        $("body").off("click", ".popover .button-propose-empty", proposeHandler);
        $("body").off("click", ".popover .button-lock", lockHandler);
        $("body").off("click", ".popover .button-unlock", unlockHandler);  

        $("body").off("click", ".slot-paper", paperSlotClickHandler);
        $("body").off("click", ".popover .button-paper-reorder", paperReorderHandler);  
        $("body").off("click", ".popover .button-paper-unschedule", paperUnscheduleHandler);  
        $("body").off("click", ".popover .button-paper-propose-scheduled", paperProposeHandler);
        $("body").off("click", ".popover .button-paper-propose-unscheduled", paperProposeHandler);
        $("body").off("click", ".popover .button-paper-propose-empty", paperProposeHandler);

        $(".slot").popover("destroy");        
    }

    return {
        isOn: isOn,
        initialize: initialize,
        destroy: destroy
    };
}();     