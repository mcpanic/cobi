var ViewMode = function() {
    var isOn = false;

    // Initialize the view mode 
    function initialize(){
        isOn = true;
        //MoveMode.destroy();
        $(".main").addClass("view-mode");
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
        $("body").on("click", ".popover .button-propose-scheduled", {type: "scheduled"}, proposeHandler);
        $("body").on("click", ".popover .button-propose-unscheduled", {type: "unscheduled"}, proposeHandler);
        $("body").on("click", ".popover .button-propose-empty", {type: "empty"}, proposeHandler);
        $("body").on("click", ".popover .button-lock", lockHandler);
        $("body").on("click", ".popover .button-unlock", unlockHandler);

        // paper-level operations
        $("body").on("click", ".slot-paper", paperSlotClickHandler);
        $("body").on("click", ".popover .button-paper-reorder", paperReorderHandler);
        $("body").on("click", ".popover .button-paper-unschedule", paperUnscheduleHandler);
        $("body").on("click", ".popover .button-paper-propose-scheduled", {type: "paper-scheduled"}, proposeHandler);
        $("body").on("click", ".popover .button-paper-propose-unscheduled", {type: "paper-unscheduled"}, proposeHandler);
        $("body").on("click", ".popover .button-paper-propose-empty", {type: "paper-empty"}, proposeHandler);
    }

     // Event handler for clicking an individual paper (only in the unscheduled panel)
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
        var submissionType = (submission.type == "paper") ? submission.subtype : submission.type;

        $(this).addClass("selected");
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
                if ($(this).hasClass("empty")){
                    console.log("impossible");
                    //return getSubmissionDetail("view", "empty", new slot($(this).attr("data-date"), $(this).attr("data-time"), $(this).attr("data-room"), null));
                } else if ($(this).hasClass("unscheduled")){
                    return getSubmissionDetail("view", "unscheduled", submission);
                } else{
                    console.log("impossible");
                    //return getSubmissionDetail("view", "scheduled", submission);
                }
           }
        });
        $(this).popover("show");          
    }

    function paperReorderHandler(event){
        var $session = $(".selected").first();
        var id = getID($session);  
        var $list = $(this).find("~ .list-submissions");
        $list.sortable();
        if ($(this).html() == "Reorder"){
            $(this).html("Save Order");
            $list.sortable("enable").disableSelection();
            $list.attr("data-paper-order", _readPaperOrder($list).join());
            //console.log($list.attr("data-paper-order"));
            $list.find("li .reorder-icon").addClass("icon-align-justify");
        } else {
            $(this).html("Reorder");
            $list.sortable("disable").enableSelection();
            $list.find("li .reorder-icon").removeClass("icon-align-justify");

            var oldOrder = $list.attr("data-paper-order").split(",");
            var newOrder = _readPaperOrder($list);
            //console.log("Reordering: NEW", newOrder, "OLD", $list.attr("data-paper-order").split(","));
            // save only when the order changed
            if (!arraysEqual(oldOrder, newOrder)){
                // backend reorder (current session, new order, old order)
                reorderPapers(allSessions[id], newOrder, oldOrder);
                $list.attr("data-paper-order", newOrder.join());   
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
        // the backend unschedule paper
        unschedulePaper(allSessions[id], allSubmissions[pid]);
    }

    // When move is request, forward this request to MoveMode.
    // This is the only way to switch modes from ViewMode to MoveMode.
    function proposeHandler(event){       
        var pid = "";
        if (event.data.type == "paper-scheduled" || event.data.type == "paper-unscheduled")
            pid = $(this).parent().attr("id");

        //console.log("pid", pid);
        // Don't need the actual target information because .selected detects this.
        MoveMode.initialize(event.data.type, pid);
    }

    // When the unschedule button is clicked. Move the item to the unscheduled workspace.
    function unscheduleHandler(){
        var $session = $(".selected").first();
        var id = getID($session);
        if (id === -1)
            return;
        // the backend unschedule session
        unscheduleSession(allSessions[id]);  
    }


    // HQ: Handles a lock request
    function lockHandler(){
        var $session = $(".selected").first();
        var id = getID($session);  
        var date, time, room; 
        if(id in allSessions){
            lockSlot(allSessions[id].date, allSessions[id].time, allSessions[id].room);
        } else {
            lockSlot($session.attr("data-date"), $session.attr("data-time"), $session.attr("data-room"));
        }
    }

    // HQ: handle an unlock request
    function unlockHandler(){
        var $session = $(".selected").first();
        var id = getID($session);  
        if(id in allSessions){
            unlockSlot(allSessions[id].date, allSessions[id].time, allSessions[id].room);
        }else{
            unlockSlot($session.attr("data-date"), $session.attr("data-time"), $session.attr("data-room"));
        }
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
                    return "<strong> Empty slot </strong> " 
                        + " <a class='close popover-close' data-dismiss='clickover' " 
                        + "data-date='"+$(this).attr("data-date")+"' data-time='"+$(this).attr("data-time")+"' data-room='"+$(this).attr("data-room")
                        + "' href='#''>&times;</a>";
                else
                    return "<strong>[" + session.venue + "] " + session.title + "</strong> "
                        + "<a class='close popover-close' data-dismiss='clickover' data-session-id='" + id 
                        + "' href='#''>&times;</a>";            
            },
            content:function(){
                if ($(this).hasClass("empty")){
                    return getSessionDetail("view", "empty", new slot($(this).attr("data-date"), $(this).attr("data-time"), $(this).attr("data-room"), null));
                } else if ($(this).hasClass("unscheduled")){
                    return getSessionDetail("view", "unscheduled", session);
                } else{
                    return getSessionDetail("view", "scheduled", session);
                }
            }
        });
        $(this).popover("show");          
    }


    // Reset any change created in this view mode
    function destroy(){
        isOn = false;

        $("body").off("click", ".slot", slotClickHandler); 
        $("body").off("click", ".popover .button-unschedule", unscheduleHandler); 
        $("body").off("click", ".popover .button-propose-scheduled", proposeHandler);
        $("body").off("click", ".popover .button-propose-unscheduled", proposeHandler);
        $("body").off("click", ".popover .button-propose-empty", proposeHandler);
        $("body").off("click", ".popover .button-lock", lockHandler);
        $("body").off("click", ".popover .button-unlock", unlockHandler);  

        $("body").off("click", ".slot-paper", paperSlotClickHandler);
        $("body").off("click", ".popover .button-paper-reorder", paperReorderHandler);  
        $("body").off("click", ".popover .button-paper-unschedule", paperUnscheduleHandler);  
        $("body").off("click", ".popover .button-paper-propose-scheduled", proposeHandler);
        $("body").off("click", ".popover .button-paper-propose-unscheduled", proposeHandler);
        $("body").off("click", ".popover .button-paper-propose-empty", proposeHandler);

        $(".slot").popover("destroy");   
        $(".slot-paper").popover("destroy");    

        $(".main").removeClass("view-mode");    
    }

    return {
        isOn: isOn,
        initialize: initialize,
        destroy: destroy
    };
}();     