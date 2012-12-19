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
        $("body").on("click", ".popover .button-propose-swap", {type: "swap"}, proposeHandler);
        $("body").on("click", ".popover .button-propose-unscheduled", {type: "unscheduled"}, proposeHandler);
        $("body").on("click", ".popover .button-propose-empty", {type: "empty"}, proposeHandler);

        $("body").on("click", ".popover .button-unschedule", unscheduleHandler);
        $("body").on("click", ".slot", slotClickHandler);
        $("body").on("click", ".popover .button-lock", lockHandler);
        $("body").on("click", ".popover .button-unlock", unlockHandler);
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
        // the frontend unschedule session
        VisualOps.unschedule(allSessions[id]);
        // the backend unschedule session
        unscheduleSession(allSessions[id]);

        $(".selected").removeClass("selected");
        Statusbar.display("Unschedule successful");
        $("#list-history").prepend("<li>unschedule: " 
           + "<a href='#' class='history-link' data-session-id='" + id + "'>" + allSessions[id].title + "</a></li>");

        updateUnscheduledCount();
        // the backend conflicts update
        getAllConflicts();
        // the frontend conflicts update: the row view of conflicts.
        updateConflicts();          

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
                return "Empty slot";
            else
                return session.title;
           },
           content:function(){
                if ($(this).hasClass("empty")){
                     return getSessionDetail("empty", new slot($(this).data("date"), $(this).data("time"), $(this).data("room"), null));
                } else if ($(this).hasClass("unscheduled")){
                     return getSessionDetail("unscheduled", session);
                } else{
                     return $(this).find(".detail").html();
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
        } else {
            lockSlot($session.data("date"), $session.data("time"), $session.data("room"));
            $session.data('popover').options.content = function(){
                // HQ: passing a slot for session (allows for isLocked check)
                return getSessionDetail("empty", new slot($session.data("date"), $session.data("time"), $session.data("room"), null));
            };
        }
        $session.addClass("locked").removeClass("selected").popover("hide");
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
        }else{
        unlockSlot($session.data("date"), $session.data("time"), $session.data("room"));
        $session.data('popover').options.content = function(){
            // HQ: passing a slot for session (allows for isLocked check)
            return getSessionDetail("empty", new slot($session.data("date"), $session.data("time"), $session.data("room"), null));
        };
        }
        $session.removeClass("locked selected").popover("hide");
    }

    // Reset any change created in this view mode
    function destroy(){
        isOn = false;
        $("body").off("click", ".popover .button-propose-swap", proposeHandler);
        $("body").off("click", ".popover .button-propose-unscheduled", proposeHandler);
        $("body").off("click", ".popover .button-propose-empty", proposeHandler);

        $("body").off("click", ".popover .button-unschedule", unscheduleHandler);
        $("body").off("click", ".slot", slotClickHandler);  
        $("body").off("click", ".popover .button-lock", lockHandler);
        $("body").off("click", ".popover .button-unlock", unlockHandler);      

        $(".slot").popover("destroy");        
    }

    return {
        isOn: isOn,
        initialize: initialize,
        destroy: destroy
    };
}();     