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
		//var $session = findCellByID(s.id);
        console.log(s, $emptySlot);
		var session = getSessionCell("scheduled", s);
		if ($emptySlot != null){
			$emptySlot.popover("destroy").replaceWith($(session));
			$(session).effect("highlight", {color: "yellow"}, 10000); // css("background-color", "white")
		}
	}

	function _removeSessionFromSlot(s, oldDate, oldTime, oldRoom){
		var $session = findCellByID(s.id);
        console.log("hello", s, oldDate, oldTime, oldRoom);        
        $session.removeClass("selected").popover("destroy").removeAttr("id").removeData();
        var after = getSessionCell("empty", null, oldDate, oldTime, oldRoom);
        // Watch out! jQuery replaceWith returns the original element, not the replaced element.
        $session.replaceWith(after); 
	}

	function _addSessionToUnscheduled(s){
        var new_session = getSessionCell("unscheduled", s);
        $("#unscheduled").append(new_session);
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

/* REMOVE
     // move the session of id into cell
    function scheduleSessionCell(id, $emptySlot, $curSession){
		var session = getSessionCell("scheduled", allSessions[id]);
		//swapNodes(session, $cell[0]);
		$emptySlot.popover("destroy").replaceWith($(session));
		$(session).effect("highlight", {color: "yellow"}, 10000); // css("background-color", "white")
		$curSession.popover("destroy").remove();
    }
*/
    // CASE 1. src: scheduled, dst: scheduled
    function swap(scheduled1, scheduled2){
        _swapNodes($("#program #session-" + scheduled1.id)[0], $("#program #session-" + scheduled2.id)[0]);
		$("#program #session-" + scheduled1.id).effect("highlight", {color: "yellow"}, 10000);
		$("#program #session-" + scheduled2.id).effect("highlight", {color: "yellow"}, 10000);
    }

    // CASE 2. src: scheduled, dst: unscheduled
    function swapWithUnscheduled(scheduled, unscheduled){
    	var $emptySlot = findCellByDateTimeRoom(scheduled.date, scheduled.time, scheduled.room);
    	unschedule(scheduled);
    	scheduleUnscheduled(unscheduled, $emptySlot);
    }

    // CASE 3. src: scheduled, dst: empty
    function swapWithEmpty(scheduled, $emptySlot, oldDate, oldTime, oldRoom){
        console.log(scheduled, $emptySlot.data("room"), oldDate, oldTime, oldRoom);
		_removeSessionFromSlot(scheduled, oldDate, oldTime, oldRoom);
		_addSessionToSlot(scheduled, $emptySlot);
    }

    // CASE 4. src: unscheduled, dst: empty
    function scheduleUnscheduled(unscheduled, $emptySlot){
    	_removeSessionFromUnscheduled(unscheduled);	
		_addSessionToSlot(unscheduled, $emptySlot);
    }

    // CASE 5. session: scheduled
    function unschedule(scheduled, oldDate, oldTime, oldRoom){
    	_removeSessionFromSlot(scheduled, oldDate, oldTime, oldRoom);
    	_addSessionToUnscheduled(scheduled);
    }

    return {
        initialize: initialize,
        swap: swap,
        swapWithUnscheduled: swapWithUnscheduled,
        swapWithEmpty: swapWithEmpty,
        scheduleUnscheduled: scheduleUnscheduled,
        unschedule: unschedule
    };
}();       