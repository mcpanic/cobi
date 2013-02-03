var Statusbar = function() {

	var $bar;

    // Initialize the view mode 
    function initialize(){
        bindEvents();
		$bar = $("#statusbar");
		display("Loading conference data... This might take up to 15-20 seconds.");
    }

    function bindEvents(){
        $(document).on("addStatus", addStatusHandler);  
        $(document).on("updateStatusAccepted", updateStatusHandler);      
        $(document).on("updateStatusFailed", updateStatusHandler);      
    }

    function updateStatusHandler(event, t){
        // the current transaction is still displayed
        var $status = $bar.find(".status").first();
        if ($status.attr("data-local-hash") == t.localHash){
            if (event.type == "updateStatusAccepted")
                $status.find(".label").removeClass("label-info").addClass("label-success").html("Success");
            else if (t.type == "updateStatusFailed")
                $status.find(".label").removeClass("label-info").addClass("label-warning").html("Failed");
        }
    }

    function addStatusHandler(event, t){
        console.log("STATUS", t);
        // TODO: do something also for move mode without touching the cancel button
        if (MoveMode.isOn && !isTransactionMyChange(t))
        return;

        if (isTransactionSessionLevel(t))
            displaySessionStatus(t);
        else 
            displayPaperStatus(t);
    }

    function displaySessionStatus(t){
        var $link, $li;
        var $statusLabel = $("<span/>").addClass("label label-info").html("In progress");

        // TODO: change with actual user management logic to display username
        var user = isTransactionMyChange(t) ? "" : "Anon";
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
    }

    // Display the given html with given type
    function display(html, type){
    	$bar.html(html);
    }


    function destroy(){

    }

    return {
        initialize: initialize,
        display: display,
        destroy: destroy
    };
}();       