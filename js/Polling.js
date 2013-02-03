

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
        var isMyChange = isTransactionMyChange(t);

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
        } else if (t.type == "schedulePaper"){
            handlePollingSchedulePaper(t, isMyChange);
        } else if (t.type == "swapPapers"){ 
            handlePollingSwapPaper(t, isMyChange);
        } else if (t.type == "movePaper"){
            handlePollingMovePaper(t, isMyChange);
        } else if (t.type == "swapWithUnscheduledPaper"){
            handlePollingSwapWithUnscheduledPaper(t, isMyChange);
        } else 
            console.log("unsupported transaction detected");

        $(document).trigger("addStatus", [t]); 
        $(document).trigger("addHistory", [t]); 
    }

    function postPollingMove(){
        updateUnscheduledCount();
        // the backend conflicts update
        getAllConflicts();
        clearConflictDisplay();
        // the frontend conflicts update: the row view of conflicts.
        updateConflicts();

    }

/******************************
 * Session level operations
 ******************************/

    function handlePollingLock(t, isMyChange){
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
            // Statusbar.display("Lock successful");
        } else {
            postPollingMove();   
            // if (!MoveMode.isOn)
                // Statusbar.display("Polling: Lock successful");
        }

        // if(id in allSessions){
        //     $(document).trigger("addHistory", [{user: user, level: "session", type: "lock", id: id}]);
        // } else {       
        //     $(document).trigger("addHistory", [{user: user, level: "session", type: "lock", date: $cell.attr("data-date"), time: $cell.attr("data-time"), room: $cell.attr("data-room")}]);
        // }
    }

    function handlePollingUnlock(t, isMyChange){
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
            // Statusbar.display("Unlock successful");
        } else {
            postPollingMove();   
            // if (!MoveMode.isOn)
                // Statusbar.display("Polling: Unlock successful");
        }

        // if(id in allSessions){
        //     $(document).trigger("addHistory", [{user: user, level: "session", type: "unlock", id: id}]);
        // } else {       
        //     $(document).trigger("addHistory", [{user: user, level: "session", type: "unlock", date: $cell.attr("data-date"), time: $cell.attr("data-time"), room: $cell.attr("data-room")}]);
        // }
    }

    function handlePollingUnschedule(t, isMyChange){
        var id = t.data.id;
        var $cell = findCellByID(id);
        if ($cell == null || typeof $cell === "undefined")
            return;

        VisualOps.unschedule(allSessions[id], t.data.date, t.data.time, t.data.room);
        if (isMyChange){
            $(".selected").removeClass("selected");
            postPollingMove();
            // Statusbar.display("Unschedule successful");
        } else {
            postPollingMove();   
            // if (!MoveMode.isOn)
            //     Statusbar.display("Polling: Unschedule successful");
        }

        // $(document).trigger("addHistory", [{user: user, level: "session", type: "unschedule", id: id}]);
        // $cell.effect("highlight", {color: "yellow"}, 10000);
    }

    function handlePollingSchedule(t, isMyChange){
        var id = t.data.id;
        var $cell = findCellByID(id);
        if ($cell == null || typeof $cell === "undefined")
         return;

        $emptySlot = findCellByDateTimeRoom(t.data.date, t.data.time, t.data.room);
        VisualOps.scheduleUnscheduled(allSessions[id], $emptySlot);
        if (isMyChange){
            MoveMode.postMove();
            // Statusbar.display("Schedule successful");
        } else{
            postPollingMove();   
            // if (!MoveMode.isOn)
            //     Statusbar.display("Polling: Scheduling successful");    
        }            

        // $(document).trigger("addHistory", [{user: user, level: "session", type: "schedule", id: id}]);
        // $cell.effect("highlight", {color: "yellow"}, 10000);
    }

    function handlePollingSwap(t, isMyChange){
        var s1id = t.data.s1id;
        var s2id = t.data.s2id;
        var $s1Cell = findCellByID(s1id);
        if ($s1Cell == null || typeof $s1Cell === "undefined")
         return;
        var $s2Cell = findCellByID(s2id);
        if ($s2Cell == null || typeof $s2Cell === "undefined")
         return;

        VisualOps.swap(allSessions[s1id], allSessions[s2id]);
        if (isMyChange){
            MoveMode.postMove();
            // Statusbar.display("Swap successful");
        } else {
            postPollingMove();   
            // if (!MoveMode.isOn)
            //     Statusbar.display("Polling: Swap successful"); 
        }

        // $(document).trigger("addHistory", [{user: user, level: "session", type: "swap", s1id: s1id, s2id: s2id}]);

        // $src_cell.effect("highlight", {color: "yellow"}, 10000);
        // $dst_cell.effect("highlight", {color: "yellow"}, 10000);
    }

    function handlePollingMove(t, isMyChange){
        var id = t.data.id;
        var $cell = findCellByID(id);
        if ($cell == null || typeof $cell === "undefined")
         return;

        $emptySlot = findCellByDateTimeRoom(t.data.tdate, t.data.ttime, t.data.troom);
        VisualOps.swapWithEmpty(allSessions[id], $emptySlot, t.data.sdate, t.data.stime, t.data.sroom);
        if (isMyChange){
            MoveMode.postMove();
            // Statusbar.display("Move successful");
        } else {
            postPollingMove();   
            // if (!MoveMode.isOn)
            //     Statusbar.display("Polling: Move successful"); 
        }

        // $(document).trigger("addHistory", [{user: user, level: "session", type: "move", id: id}]);
        // $cell.effect("highlight", {color: "yellow"}, 10000);
    }

    function handlePollingSwapWithUnscheduled(t, isMyChange){
        var scheduledId = t.data.s2id;
        var unscheduledId = t.data.s1id;

        VisualOps.swapWithUnscheduled(allSessions[unscheduledId], allSessions[scheduledId]);
        if (isMyChange){
            MoveMode.postMove();
            // Statusbar.display("Swap with Unscheduled successful");
        } else {
            postPollingMove();   
            // if (!MoveMode.isOn)
            //     Statusbar.display("Polling: Swap with Unscheduled successful"); 
        }

        // $(document).trigger("addHistory", [{user: user, level: "session", type: "swap with unscheduled", s1id: unscheduledId, s2id: scheduledId}]);
    }

/******************************
 * Paper level operations
 ******************************/

    function handlePollingReorderPapers(t, isMyChange){
        // no frontend work is necessary because it's already updated.

        if (isMyChange){
            postPollingMove();
            // Statusbar.display("Paper reorder successful");
        } else {
            postPollingMove();   
            // if (!MoveMode.isOn)
            //     Statusbar.display("Polling: Paper reorder successful"); 
        }
         
    }

    function handlePollingUnschedulePaper(t, isMyChange){
        PaperVisualOps.unschedule(allSubmissions[t.data.pid]);

        if (isMyChange){
            postPollingMove();
            // Statusbar.display("Paper unschedule successful");
        } else {
            postPollingMove();   
            // if (!MoveMode.isOn)
            //     Statusbar.display("Polling: Paper unschedule successful"); 
        }
        // $(document).trigger("addHistory", [{user: user, level: "paper", type: "paper unschedule", sid: t.data.sid, pid: t.data.pid}]);                
    }

    function handlePollingSchedulePaper(t, isMyChange){
        PaperVisualOps.scheduleUnscheduled(allSubmissions[t.data.pid]);

        if (isMyChange){
            MoveMode.postMove();
            // Statusbar.display("Paper schedule successful");
        } else {
            postPollingMove();   
            // if (!MoveMode.isOn)
            //     Statusbar.display("Polling: Paper schedule successful"); 
        }
        // $(document).trigger("addHistory", [{user: user, level: "paper", type: "paper schedule", sid: t.data.sid, pid: t.data.pid}]);                
    }

    function handlePollingSwapPaper(t, isMyChange){
        PaperVisualOps.swap(allSubmissions[t.data.p1id], allSubmissions[t.data.p2id]);  
 
        if (isMyChange){
            MoveMode.postMove();
            // Statusbar.display("Paper swap successful");
        } else {
            postPollingMove();   
            // if (!MoveMode.isOn)
            //     Statusbar.display("Polling: Paper swap successful"); 
        }
        // $(document).trigger("addHistory", [{user: user, level: "paper", type: "paper swap", s1id: t.data.s1id, p1id: t.data.p1id, s2id: t.data.s2id, p2id: t.data.p2id}]);    
    }

    function handlePollingMovePaper(t, isMyChange){
        PaperVisualOps.swapWithEmpty(allSubmissions[t.data.p1id]);

        if (isMyChange){
            MoveMode.postMove();
            // Statusbar.display("Paper move successful");
        } else {
            postPollingMove();   
            // if (!MoveMode.isOn)
            //     Statusbar.display("Polling: Paper move successful"); 
        }
        // $(document).trigger("addHistory", [{user: user, level: "paper", type: "paper move", s1id: t.data.s1id, p1id: t.data.p1id, s2id: t.data.s2id}]);       
    }

    function handlePollingSwapWithUnscheduledPaper(t, isMyChange){
        PaperVisualOps.swapWithUnscheduled(allSubmissions[t.data.p1id], allSubmissions[t.data.p2id]);

        if (isMyChange){
            MoveMode.postMove();
            // Statusbar.display("Paper swap with unscheduled successful");
        } else {
            postPollingMove();   
            // if (!MoveMode.isOn)
            //     Statusbar.display("Polling: Paper swap with unscheduled successful"); 
        }
        // $(document).trigger("addHistory", [{user: user, level: "paper", type: "paper swap with unscheduled", p1id: t.data.p1id, s2id: t.data.s2id, p2id: t.data.p2id}]);    
    }


    return {
        initialize: initialize
    };
}();
