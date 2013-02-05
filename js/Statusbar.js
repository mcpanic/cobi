var Statusbar = function() {

	var $bar;

    // Initialize the view mode 
    function initialize(){
		$bar = $("#statusbar");
		display("Loading conference data... This might take up to 15-20 seconds.");
        bindEvents();
    }

    function bindEvents(){
        // $(document).on("addStatus", addStatusHandler);  
        // $(document).on("updateStatusAccepted", updateStatusHandler);      
        // $(document).on("updateStatusFailed", updateStatusHandler);  
        $(document).on("addMoveStatus", addMoveStatusHandler);
        $(document).on("addPaperMoveStatus", addPaperMoveStatusHandler);
        $bar.on("click", ".history-link", clickLinkHandler);    
        $bar.on("click", ".history-paper-link", clickPaperLinkHandler);
    }

    function updateStatus(type, t){
        // the current transaction is still displayed
        var $status = $bar.find(".status").first();
        if ($status.attr("data-local-hash") == t.localHash){
            if (type == "updateStatusAccepted")
                $status.find(".label").removeClass("label-info").addClass("label-success").html("Success");
            else if (type == "updateStatusFailed")
                $status.find(".label").removeClass("label-info").addClass("label-warning").html("Failed");
        }
    }


    function addStatus(t){
        console.log("STATUS", t, MoveMode.isOn, !isTransactionMyChange(t));
        // TODO: do something also for move mode without touching the cancel button
        if (MoveMode.isOn && !isTransactionMyChange(t))
            return;

        if (isTransactionSessionLevel(t))
            displaySessionStatus(t);
        else 
            displayPaperStatus(t);
    }


    // function updateStatusHandler(event, t){
    //     // the current transaction is still displayed
    //     var $status = $bar.find(".status").first();
    //     if ($status.attr("data-local-hash") == t.localHash){
    //         if (event.type == "updateStatusAccepted")
    //             $status.find(".label").removeClass("label-info").addClass("label-success").html("Success");
    //         else if (t.type == "updateStatusFailed")
    //             $status.find(".label").removeClass("label-info").addClass("label-warning").html("Failed");
    //     }
    // }

    // function addStatusHandler(event, t){
    //     console.log("STATUS", t, MoveMode.isOn, !isTransactionMyChange(t));
    //     // TODO: do something also for move mode without touching the cancel button
    //     if (MoveMode.isOn && !isTransactionMyChange(t))
    //         return;

    //     if (isTransactionSessionLevel(t))
    //         displaySessionStatus(t);
    //     else 
    //         displayPaperStatus(t);
    // }


    function addMoveStatusHandler(event, id){
        var $statusLabel = $("<span/>").addClass("label label-info").html("Scheduling session");
        var $status = $("<div/>").addClass("status").append($statusLabel).append();
        var $session = $(".selected").first();
        var $link = (typeof $session.attr("data-session-id") === "undefined") ? getCellLinkByDateTimeRoom($session.attr("data-date"), $session.attr("data-time"), $session.attr("data-room")) : getCellLinkByID($session.attr("data-session-id"));
        $status.append(" ").append($link)
            .append("&nbsp;&nbsp;&nbsp;Number: change in # of conflicts. <span class='palette recommended'>&nbsp;</span>: recommended." + MoveMode.getCancelButtonHTML());
        $bar.html($status);
    }

    function addPaperMoveStatusHandler(event, id, paperId){
        var $statusLabel = $("<span/>").addClass("label label-info").html("Scheduling submission");
        var $status = $("<div/>").addClass("status").append($statusLabel).append();
        var $session = $(".selected").first();
        var $link = getPaperCellLinkByID($session.attr("data-session-id"), paperId);
        $status.append(" ").append($link)
            .append("&nbsp;&nbsp;&nbsp;Number: change in # of conflicts. <span class='palette recommended'>&nbsp;</span>: recommended." + MoveMode.getCancelButtonHTML());
        $bar.html($status);
    }

    function displaySessionStatus(t){
        var $link, $li;
        var $statusLabel = isTransactionMyChange(t) ? $("<span/>").addClass("label label-info").html("In progress") : $("<span/>").addClass("label label-info").html("Updated");

        var user = isTransactionMyChange(t) ? "" : getUsernameByUID(t.uid);
        $li = $("<div/>").addClass("status").attr("data-local-hash", t.localHash).append($statusLabel).append(" " + user + " ").append($("<strong/>").wrapInner(typeDisplayList[t.type])).append(": ");

        if (t.type.indexOf("swap") !== -1){
            $link = getCellLinkByID(t.data.s1id);
            var $link2 = getCellLinkByID(t.data.s2id);
            $li = $li.append($link).append(" and ").append($link2);    
        } else {
            $link = (typeof t.data.id === "undefined") ? getCellLinkByDateTimeRoom(t.data.date, t.data.time, t.data.room) : getCellLinkByID(t.data.id);
            $li = $li.append($link);
        }

        $bar.html($li);
    }

    function displayPaperStatus(t){
        var $link, $li;
        var $statusLabel = isTransactionMyChange(t) ? $("<span/>").addClass("label label-info").html("In progress") : $("<span/>").addClass("label label-info").html("Updated");

        var user = isTransactionMyChange(t) ? "" : getUsernameByUID(t.uid);
        $li = $("<div/>").addClass("status").attr("data-local-hash", t.localHash).append($statusLabel).append(" " + user + " ").append($("<strong/>").wrapInner(typeDisplayList[t.type])).append(": ");

          if (t.type.indexOf("swap") !== -1){
               if (t.type == "swapPapers"){
                    $link = getPaperCellLinkByID(t.data.s1id, t.data.p2id);
                    var $link2 = getPaperCellLinkByID(t.data.s2id, t.data.p1id);
                    $li = $li.append($link).append(" and ").append($link2); 
               } else if (t.type == "swapWithUnscheduledPaper"){
                    $link = getPaperCellLinkByID(undefined, t.data.p2id);
                    var $link2 = getPaperCellLinkByID(t.data.s2id, t.data.p1id);
                    $li = $li.append($link).append(" and ").append($link2); 
               }                  

          } else {
               console.log(t.type, t.data);
               if (t.type == "unschedulePaper")
                    $link = getPaperCellLinkByID(undefined, t.data.pid);
               else if (t.type == "schedulePaper")
                    $link = getPaperCellLinkByID(t.data.sid, t.data.pid);
               else if (t.type == "movePaper")
                    $link = getPaperCellLinkByID(t.data.s2id, t.data.p1id);
               else if (t.type == "reorderPapers")
                    $link = getPaperCellLinkByID(t.data.id, "");
               $li = $li.append($link);
          }

        $bar.html($li);        
    }

    // Display the given html with given type
    function display(html, type){
    	$bar.html(html);
    }

    function clickLinkHandler(){
        var id = $(this).attr("data-session-id");      
        var $cell;
        if (typeof id === "undefined") {
            $cell = findCellByDateTimeRoom($(this).attr("data-slot-date"), $(this).attr("data-slot-time"), $(this).attr("data-slot-room"));
        } else
           $cell = findCellByID(id);

        $("body").animate({
            scrollTop:$cell.offset().top - 100
        }, 500); 
        $cell.effect("highlight", {color: "#aec7e8"}, 3000);

        return false;
    } 

    function clickPaperLinkHandler(){
        var id = $(this).attr("data-session-id");
        var paperId = $(this).attr("data-submission-id");
        var $cell;
        if (typeof id === "undefined") {
          // $cell = findCellByDateTimeRoom($(this).attr("data-slot-date"), $(this).attr("data-slot-time"), $(this).attr("data-slot-room"));
          $cell = $("#unscheduled-papers #" + paperId);
        } else
           $cell = findCellByID(id);

        $("body").animate({
            scrollTop:$cell.offset().top - 100
        }, 500); 
        $cell.effect("highlight", {color: "#aec7e8"}, 3000);            
      
      return false;
    } 

    function destroy(){

    }

    return {
        initialize: initialize,
        updateStatus: updateStatus,
        addStatus: addStatus,
        display: display,
        destroy: destroy
    };
}();       