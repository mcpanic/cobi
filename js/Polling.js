
var Polling = function() {
    // Initialize the frontend polling management module 
    function initialize(){
        bindEvents();
    }

    // Add event handlers to each sidebar item
    function bindEvents(){
        $(document).on("serverScheduleChange", scheduleChangeHandler);
        $(document).on("transactionUpdate", transactionUpdateHandler);
    }

    function transactionUpdateHandler(event, t){
        console.log("transaction received", t, t.data);
        // if uid == my id, changes are local.

        // if uid != my id, changes are remotely made.
        //type: event type, uid: user who made the change, data: object

        // TODO: swapWithUnscheduled handler should be added.
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
        } else if (t.type == "swapWithUnscheduled"){
            handlePollingSwapWithUnscheduled(t);
        } else if (t.type == "reorderPapers"){
            handlePollingReorderPapers(t);
        } else if (t.type == "unschedulePaper"){
            handlePollingUnschedulePaper(t);
        } else if (t.type == "swapPaper"){
            handlePollingSwapPaper(t);
        } else if (t.type == "movePaper"){
            handlePollingMovePaper(t);
        } else if (t.type == "swapWithUnscheduledPaper"){
            handlePollingSwapWithUnscheduledPaper(t);
        }
        postPollingMove();        
    }
/*
    function scheduleChangeHandler(event, newTransactionIndices){
        console.log("data", newTransactionIndices);
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
            postPollingMove();
        });
    }
*/

    function postPollingMove(){
        updateUnscheduledCount();
        // the backend conflicts update
        getAllConflicts();
        clearConflictDisplay();
        // the frontend conflicts update: the row view of conflicts.
        updateConflicts();

    }

    function handlePollingLock(t){
        // TODO: lock needs to get id in t.data.id
        console.log(schedule[t.data.date][t.data.time][t.data.room]);
        var id = null;
        for (s in schedule[t.data.date][t.data.time][t.data.room]){
            id = s;
        }    
        // empty cells can also be locked or unlocked
        var $cell = (id == null)? findCellByDateTimeRoom(t.data.date, t.data.time, t.data.room): findCellByID(id);
        if ($cell == null || typeof $cell === "undefined")
            return;

        var isLocked = $cell.find(".title").hasClass("locked")? true: false;
        var action = "lock";
        if (isLocked){
            $cell.find(".title").removeClass("locked");
            action = "unlock";
        } else {
            $cell.find(".title").addClass("locked");
        }

        if(id in allSessions){
            //lockSlot(allSessions[id].date, allSessions[id].time, allSessions[id].room);
            // $cell.data('popover').options.content = function(){
            //     return getSessionDetail("scheduled", allSessions[id]);
            // };
            $(document).trigger("addHistory", [{user: "USER", type: action, id: id}]);
        } else {
            //lockSlot($session.data("date"), $session.data("time"), $session.data("room"));
            // $cell.data('popover').options.content = function(){
            //     return getSessionDetail("empty", new slot($cell.data("date"), $cell.data("time"), $cell.data("room"), null));
            // };          
            $(document).trigger("addHistory", [{user: "USER", type: action, date: $cell.attr("data-date"), time: $cell.attr("data-time"), room: $cell.attr("data-room")}]);
        }

        $cell.effect("highlight", {color: "yellow"}, 10000);    
        // Statusbar display omitted        
    }

    function handlePollingUnschedule(t){
        var id = t.data.id;
        var $cell = findCellByID(id);
        if ($cell == null || typeof $cell === "undefined")
            return;

        $(document).trigger("addHistory", [{user: "USER", type: "unschedule", id: id}]);
        $cell.effect("highlight", {color: "yellow"}, 10000);

        VisualOps.unschedule(allSessions[id], t.data.date, t.data.time, t.data.room);

        Statusbar.display("Polling: Unschedule successful");
    }

    function handlePollingSchedule(t){
        var id = t.data.id;
        var $cell = findCellByID(id);
        if ($cell == null || typeof $cell === "undefined")
         return;

        $(document).trigger("addHistory", [{user: "USER", type: "schedule", id: id}]);
        $cell.effect("highlight", {color: "yellow"}, 10000);

        $emptySlot = findCellByDateTimeRoom(t.data.date, t.data.time, t.data.room);
        VisualOps.scheduleUnscheduled(allSessions[id], $emptySlot);

        Statusbar.display("Polling: Scheduling successful");    
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

        $(document).trigger("addHistory", [{user: "USER", type: "swap", sid: src_id, did: dst_id}]);

        $src_cell.effect("highlight", {color: "yellow"}, 10000);
        $dst_cell.effect("highlight", {color: "yellow"}, 10000);

        VisualOps.swap(allSessions[src_id], allSessions[dst_id]);
        Statusbar.display("Polling: Swap successful");
    }

    function handlePollingMove(t){
        var id = t.data.id;
        var $cell = findCellByID(id);
        if ($cell == null || typeof $cell === "undefined")
         return;

        $(document).trigger("addHistory", [{user: "USER", type: "move", id: id}]);
        $cell.effect("highlight", {color: "yellow"}, 10000);

        $emptySlot = findCellByDateTimeRoom(t.data.tdate, t.data.ttime, t.data.troom);
        VisualOps.swapWithEmpty(allSessions[id], $emptySlot, t.data.sdate, t.data.stime, t.data.sroom);
        Statusbar.display("Polling: Moving successful");    
    }

    function handlePollingSwapWithUnscheduled(t){

    }

    function handlePollingReorderPapers(t){
        
    }

    function handlePollingUnschedulePaper(t){
        
    }

    function handlePollingSwapPaper(t){
        
    }

    function handlePollingMovePaper(t){
        
    }

    function handlePollingSwapWithUnscheduledPaper(t){
        
    }


    return {
        initialize: initialize
    };
}();
