
var Polling = function() {
    // Initialize the frontend polling management module 
    function initialize(){
        bindEvents();
    }

    // Add event handlers to each sidebar item
    function bindEvents(){
        //$(document).on("serverScheduleChange", scheduleChangeHandler);
        $(document).on("transactionUpdate", transactionUpdateHandler);
    }

    function transactionUpdateHandler(event, t){
        console.log("transaction received", t, t.data);
        //type: event type, uid: user who made the change, data: object
        var isMyChange = t.id == null;

        // TODO: swapWithUnscheduled handler should be added.
            if (t.type == "lock"){
                handlePollingLock(t, isMyChange);
            } else if (t.type == "unlock"){
                handlePollingUnlock(t, isMyChange);
            } else if (t.type == "unschedule"){
                handlePollingUnschedule(t, isMyChange);
            } else if (t.type == "schedule"){
                handlePollingSchedule(t, isMyChange);
            } else if (t.type == "swap"){
                handlePollingSwap(t, isMyChange);
            } else if (t.type == "move"){
                handlePollingMove(t, isMyChange);
            } else if (t.type == "swapWithUnscheduled"){
                handlePollingSwapWithUnscheduled(t, isMyChange);
            } else if (t.type == "reorderPapers"){
                handlePollingReorderPapers(t, isMyChange);
            } else if (t.type == "unschedulePaper"){
                handlePollingUnschedulePaper(t, isMyChange);
            } else if (t.type == "swapPaper"){ 
                handlePollingSwapPaper(t, isMyChange);
            } else if (t.type == "movePaper"){
                handlePollingMovePaper(t, isMyChange);
            } else if (t.type == "swapWithUnscheduledPaper"){
                handlePollingSwapWithUnscheduledPaper(t, isMyChange);
            }     
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

    function handlePollingLock(t, isMyChange){
        var user = isMyChange ? "" : "Anon";
        // TODO: lock needs to get id in t.data.id
        var id = null;
        for (s in schedule[t.data.date][t.data.time][t.data.room]){
            id = s;
        }    
        // empty cells can also be locked or unlocked
        var $cell = (id == null)? findCellByDateTimeRoom(t.data.date, t.data.time, t.data.room): findCellByID(id);
        if ($cell == null || typeof $cell === "undefined")
            return;

        VisualOps.lock($cell);

        if (isMyChange){
            $(".selected").removeClass("selected").popover("hide");
            postPollingMove();
            Statusbar.display("Lock successful");
        } else {
            postPollingMove();   
            if (!MoveMode.isOn)
                Statusbar.display("Polling: Unlock successful");
        }

        if(id in allSessions){
            $(document).trigger("addHistory", [{user: user, type: "lock", id: id}]);
        } else {       
            $(document).trigger("addHistory", [{user: user, type: "lock", date: $cell.attr("data-date"), time: $cell.attr("data-time"), room: $cell.attr("data-room")}]);
        }
    }

    function handlePollingUnlock(t, isMyChange){
        var user = isMyChange ? "" : "Anon";
        // TODO: lock needs to get id in t.data.id
        var id = null;
        for (s in schedule[t.data.date][t.data.time][t.data.room]){
            id = s;
        }    
        // empty cells can also be locked or unlocked
        var $cell = (id == null)? findCellByDateTimeRoom(t.data.date, t.data.time, t.data.room): findCellByID(id);
        if ($cell == null || typeof $cell === "undefined")
            return;

        VisualOps.unlock($cell);

        if (isMyChange){
            $(".selected").removeClass("selected").popover("hide");
            postPollingMove();
            Statusbar.display("Unlock successful");
        } else {
            postPollingMove();   
            if (!MoveMode.isOn)
                Statusbar.display("Polling: Unlock successful");
        }

        if(id in allSessions){
            $(document).trigger("addHistory", [{user: user, type: "unlock", id: id}]);
        } else {       
            $(document).trigger("addHistory", [{user: user, type: "unlock", date: $cell.attr("data-date"), time: $cell.attr("data-time"), room: $cell.attr("data-room")}]);
        }
    }

    function handlePollingUnschedule(t, isMyChange){
        var user = isMyChange ? "" : "Anon";
        var id = t.data.id;
        var $cell = findCellByID(id);
        if ($cell == null || typeof $cell === "undefined")
            return;

        VisualOps.unschedule(allSessions[id], t.data.date, t.data.time, t.data.room);

        if (isMyChange){
            $(".selected").removeClass("selected");
            postPollingMove();
            Statusbar.display("Unschedule successful");
        } else {
            postPollingMove();   
            if (!MoveMode.isOn)
                Statusbar.display("Polling: Unschedule successful");
        }

        $(document).trigger("addHistory", [{user: user, type: "unschedule", id: id}]);
        // $cell.effect("highlight", {color: "yellow"}, 10000);
    }

    function handlePollingSchedule(t, isMyChange){
        var user = isMyChange ? "" : "Anon";
        var id = t.data.id;
        var $cell = findCellByID(id);
        if ($cell == null || typeof $cell === "undefined")
         return;

        $emptySlot = findCellByDateTimeRoom(t.data.date, t.data.time, t.data.room);
        VisualOps.scheduleUnscheduled(allSessions[id], $emptySlot);

        if (isMyChange){
            MoveMode.postMove();
            Statusbar.display("Schedule successful");
        } else{
            postPollingMove();   
            if (!MoveMode.isOn)
                Statusbar.display("Polling: Scheduling successful");    
        }            

        $(document).trigger("addHistory", [{user: user, type: "schedule", id: id}]);
        // $cell.effect("highlight", {color: "yellow"}, 10000);
    }

    function handlePollingSwap(t, isMyChange){
        var user = isMyChange ? "" : "Anon";
        var src_id = t.data.s1id;
        var dst_id = t.data.s2id;
        var $src_cell = findCellByID(src_id);
        if ($src_cell == null || typeof $src_cell === "undefined")
         return;
        var $dst_cell = findCellByID(dst_id);
        if ($dst_cell == null || typeof $dst_cell === "undefined")
         return;

        VisualOps.swap(allSessions[src_id], allSessions[dst_id]);

        if (isMyChange){
            MoveMode.postMove();
            Statusbar.display("Swap successful");
        } else {
            postPollingMove();   
            if (!MoveMode.isOn)
                Statusbar.display("Polling: Swap successful"); 
        }

        $(document).trigger("addHistory", [{user: user, type: "swap", sid: src_id, did: dst_id}]);

        // $src_cell.effect("highlight", {color: "yellow"}, 10000);
        // $dst_cell.effect("highlight", {color: "yellow"}, 10000);
    }

    function handlePollingMove(t, isMyChange){
        var user = isMyChange ? "" : "Anon";
        var id = t.data.id;
        var $cell = findCellByID(id);
        if ($cell == null || typeof $cell === "undefined")
         return;

        $emptySlot = findCellByDateTimeRoom(t.data.tdate, t.data.ttime, t.data.troom);
        VisualOps.swapWithEmpty(allSessions[id], $emptySlot, t.data.sdate, t.data.stime, t.data.sroom);
        if (isMyChange){
            MoveMode.postMove();
            Statusbar.display("Move successful");
        } else {
            postPollingMove();   
            if (!MoveMode.isOn)
                Statusbar.display("Polling: Move successful"); 
        }

        $(document).trigger("addHistory", [{user: user, type: "move", id: id}]);
        // $cell.effect("highlight", {color: "yellow"}, 10000);
    }

    function handlePollingSwapWithUnscheduled(t, isMyChange){
        var user = isMyChange ? "" : "Anon";

        var scheduledId = t.data.s2id;
        var unscheduledId = t.data.s1id;

        VisualOps.swapWithUnscheduled(allSessions[unscheduledId], allSessions[scheduledId]);

        if (isMyChange){
            MoveMode.postMove();
            Statusbar.display("Swap with Unscheduled successful");
        } else {
            postPollingMove();   
            if (!MoveMode.isOn)
                Statusbar.display("Polling: Swap with Unscheduled successful"); 
        }
    }

    function handlePollingReorderPapers(t, isMyChange){
        var user = isMyChange ? "" : "Anon";
        
    }

    function handlePollingUnschedulePaper(t, isMyChange){
        var user = isMyChange ? "" : "Anon";
        
    }

    function handlePollingSwapPaper(t, isMyChange){
        var user = isMyChange ? "" : "Anon";
        
    }

    function handlePollingMovePaper(t, isMyChange){
        var user = isMyChange ? "" : "Anon";
        
    }

    function handlePollingSwapWithUnscheduledPaper(t, isMyChange){
        var user = isMyChange ? "" : "Anon";
        
    }


    return {
        initialize: initialize
    };
}();
