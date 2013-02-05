

var Polling = function() {
    // Initialize the frontend polling management module 
    function initialize(){
        bindEvents();
    }

    // Add event handlers to each sidebar item
    function bindEvents(){
        // $(document).on("transactionUpdate", transactionUpdateHandler);
        // $(document).on("transactionAccepted", transactionAcceptedHandler);
        // $(document).on("transactionFailed", transactionFailedHandler);

        $(document).on("userLoaded", userLoadedHandler);
    }

    function userLoadedHandler(event){
        console.log("userLoadedHandler", allUsers, userData);
    }

    function transactionAccepted(t){
        console.log("transactionAccepted", t);
        Statusbar.updateStatus("updateStatusAccepted", t);
        Sidebar.updateHistory("updateHistoryAccepted", t);
    }

    // function transactionAcceptedHandler(event, t){
    //     console.log(event.type, t);
    //     $(document).trigger("updateStatusAccepted", [t]); 
    //     $(document).trigger("updateHistoryAccepted", [t]); 
    // }

    function transactionFailed(t){
        console.log("transactionFailed", t);
        var rollbackTransaction = new TransactionData(t.uid, t.previousType, t.previous, t.type, t.data);
        handleTransaction(rollbackTransaction);
        Statusbar.updateStatus("updateStatusFailed", t);
        Sidebar.updateHistory("updateHistoryFailed", t);        
    }

    // function transactionFailedHandler(event, t){
    //     console.log(event.type, t);
    //     var rollbackTransaction = new TransactionData(t.uid, t.previousType, t.previous, t.type, t.data);
    //     handleTransaction(rollbackTransaction);
    //     $(document).trigger("updateStatusFailed", [t]); 
    //     $(document).trigger("updateHistoryFailed", [t]); 
    // }

    function transactionUpdate(t){
        console.log("transactionUpdate", t);
        //type: event type, uid: user who made the change, data: object
        handleTransaction(t);
        Statusbar.addStatus(t);
        Sidebar.addHistory(t);    
    }  

    // function transactionUpdateHandler(event, t){
    //     console.log(event.type, t);
    //     //type: event type, uid: user who made the change, data: object
    //     handleTransaction(t);

    //     $(document).trigger("addStatus", [t]); 
    //     $(document).trigger("addHistory", [t]); 
    // }  

    function handleTransaction(t){
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
    }

    function postPollingMove(){
        updateUnscheduledCount();
        // the backend conflicts update
        getAllConflicts();
        Conflicts.clearConflictDisplay();
        // the frontend conflicts update: the row view of conflicts.
        Conflicts.updateConflicts();
        UnscheduledPanel.refreshButtons();
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
        var $cell = (id == null) ? findCellByDateTimeRoom(t.data.date, t.data.time, t.data.room): findCellByID(id);
        if ($cell == null || typeof $cell === "undefined")
            return;

        VisualOps.lock($cell);

        postPollingMove();  
        if (isMyChange)
            $(".selected").removeClass("selected").popover("hide");
    }

    function handlePollingUnlock(t, isMyChange){
        // TODO: lock needs to get id in t.data.id
        var id = null;
        for (s in schedule[t.data.date][t.data.time][t.data.room]){
            id = s;
        }    
        // empty cells can also be locked or unlocked
        var $cell = (id == null) ? findCellByDateTimeRoom(t.data.date, t.data.time, t.data.room): findCellByID(id);
        if ($cell == null || typeof $cell === "undefined")
            return;

        VisualOps.unlock($cell);

        postPollingMove();  
        if (isMyChange)
            $(".selected").removeClass("selected").popover("hide");
    }

    function handlePollingUnschedule(t, isMyChange){
        var id = t.data.id;
        var $cell = findCellByID(id);
        if ($cell == null || typeof $cell === "undefined")
            return;

        VisualOps.unschedule(allSessions[id], t.data.date, t.data.time, t.data.room);

        postPollingMove();  
        if (isMyChange)
            $(".selected").removeClass("selected");
    }

    function handlePollingSchedule(t, isMyChange){
        var id = t.data.id;
        var $cell = findCellByID(id);
        if ($cell == null || typeof $cell === "undefined")
         return;

        $emptySlot = findCellByDateTimeRoom(t.data.date, t.data.time, t.data.room);
        VisualOps.scheduleUnscheduled(allSessions[id], $emptySlot);

        postPollingMove();  
        if (isMyChange)
            MoveMode.destroy();           
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

        postPollingMove();  
        if (isMyChange)
            MoveMode.destroy();
    }

    function handlePollingMove(t, isMyChange){
        var id = t.data.id;
        var $cell = findCellByID(id);
        if ($cell == null || typeof $cell === "undefined")
         return;

        $emptySlot = findCellByDateTimeRoom(t.data.tdate, t.data.ttime, t.data.troom);
        VisualOps.swapWithEmpty(allSessions[id], $emptySlot, t.data.sdate, t.data.stime, t.data.sroom);

        postPollingMove();  
        if (isMyChange)
            MoveMode.destroy();
    }

    function handlePollingSwapWithUnscheduled(t, isMyChange){
        var scheduledId = t.data.s2id;
        var unscheduledId = t.data.s1id;

        VisualOps.swapWithUnscheduled(allSessions[unscheduledId], allSessions[scheduledId]);

        postPollingMove();  
        if (isMyChange)
            MoveMode.destroy();
    }

/******************************
 * Paper level operations
 ******************************/

    function handlePollingReorderPapers(t, isMyChange){
        // no frontend work is necessary because it's already updated.
        postPollingMove();            
    }

    function handlePollingUnschedulePaper(t, isMyChange){
        PaperVisualOps.unschedule(allSubmissions[t.data.pid]);
        postPollingMove();            
    }

    function handlePollingSchedulePaper(t, isMyChange){
        PaperVisualOps.scheduleUnscheduled(allSubmissions[t.data.pid], t.data.pos);
        setTimeout(function (){
            postPollingMove();  
            if (isMyChange)
                MoveMode.destroy();  
        }, 2300);                   
    }

    function handlePollingSwapPaper(t, isMyChange){
        PaperVisualOps.swap(allSubmissions[t.data.p1id], allSubmissions[t.data.p2id]);  
        setTimeout(function (){
            postPollingMove();  
            if (isMyChange)
                MoveMode.destroy();
        }, 2300);                
    }

    function handlePollingMovePaper(t, isMyChange){
        PaperVisualOps.swapWithEmpty(allSubmissions[t.data.p1id], t.data.pos); 
        setTimeout(function (){
            postPollingMove();  
            if (isMyChange)
                MoveMode.destroy();
        }, 2300);
    }

    function handlePollingSwapWithUnscheduledPaper(t, isMyChange){
        PaperVisualOps.swapWithUnscheduled(allSubmissions[t.data.p1id], allSubmissions[t.data.p2id]); 
        setTimeout(function (){
            postPollingMove();  
            if (isMyChange)
                MoveMode.destroy();
        }, 2300);
    }

    return {
        initialize: initialize,
        transactionUpdate: transactionUpdate,
        transactionAccepted: transactionAccepted,
        transactionFailed: transactionFailed
    };
}();
