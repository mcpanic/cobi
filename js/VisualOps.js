// Unit session moves at the visual (front-end) level
// These can be combined to form more complex operations.

var VisualOps = function() {
	// Initialize the sidebar with a default view 
	function initialize(){
	  	//bindEvents();
	}

	function bindEvents(){

	}

	function _addSessionToSlot(s, $emptySlot){
		var session = getSessionCell("scheduled", s, s.date, s.time, s.room);
		if ($emptySlot != null){
			$emptySlot.popover("destroy").replaceWith($(session));
			$(session).effect("highlight", {color: "yellow"}, 10000); // css("background-color", "white")
		}
	}

	function _removeSessionFromSlot(s, oldDate, oldTime, oldRoom){
		var $session = findCellByID(s.id);
        //console.log("hello", s, oldDate, oldTime, oldRoom);        
        $session.removeClass("selected").popover("destroy").removeAttr("id");
        removeDataAttributes($session);
        var after = getSessionCell("empty", null, oldDate, oldTime, oldRoom);
        // Watch out! jQuery replaceWith returns the original element, not the replaced element.
        $session.replaceWith(after); 
	}

	function _addSessionToUnscheduled(s){
        var cell = getSessionCell("unscheduled", s);
        $("#unscheduled tr").append(cell);
        $(cell).effect("highlight", {color: "yellow"}, 10000);
	}

	function _removeSessionFromUnscheduled(s){
		var $session = findCellByID(s.id);
		$session.popover("destroy").remove();
	}


    function _swapNodes(a, b) {
		var aparent= a.parentNode;
		var asibling= a.nextSibling===b? a : a.nextSibling;
		b.parentNode.insertBefore(a, b);
		aparent.insertBefore(b, asibling);
	}

    function _swapDateTimeRoom($a, $b){
        var aDate = $a.attr("data-date");
        var aTime = $a.attr("data-time");
        var aRoom = $a.attr("data-room");
        var bDate = $b.attr("data-date");
        var bTime = $b.attr("data-time");
        var bRoom = $b.attr("data-room");
        $a.attr("data-date", bDate);
        $a.attr("data-time", bTime);
        $a.attr("data-room", bRoom);
        $b.attr("data-date", aDate);
        $b.attr("data-time", aTime);
        $b.attr("data-room", aRoom);
    }

    // CASE 1. src: scheduled, dst: scheduled
    function swap(scheduled1, scheduled2){
        _swapNodes($("#program #session-" + scheduled1.id)[0], $("#program #session-" + scheduled2.id)[0]);
        // switching date, time, and room information
        _swapDateTimeRoom($("#program #session-" + scheduled1.id), $("#program #session-" + scheduled2.id));
		$("#program #session-" + scheduled1.id).effect("highlight", {color: "yellow"}, 10000);
		$("#program #session-" + scheduled2.id).effect("highlight", {color: "yellow"}, 10000);
    }

    // CASE 2. src: scheduled, dst: unscheduled && src: unscheduled, dst: scheduled
    function swapWithUnscheduled(unscheduled, scheduled){
        unschedule(scheduled, unscheduled.date, unscheduled.time, unscheduled.room);
        // by the backend code, unscheduled alreay contains updated the destination's date, time, and room
    	var $emptySlot = findCellByDateTimeRoom(unscheduled.date, unscheduled.time, unscheduled.room);
    	scheduleUnscheduled(unscheduled, $emptySlot);
    }

    // CASE 3. src: scheduled, dst: empty && src: empty, dst: scheduled
    function swapWithEmpty(scheduled, $emptySlot, oldDate, oldTime, oldRoom){
		_removeSessionFromSlot(scheduled, oldDate, oldTime, oldRoom);
		_addSessionToSlot(scheduled, $emptySlot);
    }

    // CASE 4. src: unscheduled, dst: empty && src: empty, dst: unscheduled
    function scheduleUnscheduled(unscheduled, $emptySlot){
    	_removeSessionFromUnscheduled(unscheduled);	
		_addSessionToSlot(unscheduled, $emptySlot);
    }

    // CASE 5. session: scheduled
    function unschedule(scheduled, oldDate, oldTime, oldRoom){
    	_removeSessionFromSlot(scheduled, oldDate, oldTime, oldRoom);
    	_addSessionToUnscheduled(scheduled);
    }

    // CASE 6. lock a session
    function lock($cell){
        $cell.find(".title").addClass("locked");
        $cell.effect("highlight", {color: "yellow"}, 10000);               
    }

    // CASE 7. lock a session
    function unlock($cell){
        $cell.find(".title").removeClass("locked");
        $cell.effect("highlight", {color: "yellow"}, 10000);       
    }

    return {
        initialize: initialize,
        swap: swap,
        swapWithUnscheduled: swapWithUnscheduled,
        swapWithEmpty: swapWithEmpty,
        scheduleUnscheduled: scheduleUnscheduled,
        unschedule: unschedule,
        lock: lock,
        unlock: unlock
    };
}();       