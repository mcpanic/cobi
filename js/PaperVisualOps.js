// Unit paper moves at the visual (front-end) level
// These can be combined to form more complex operations.

var PaperVisualOps = function() {
	// Initialize the sidebar with a default view 
	function initialize(){
	  	//bindEvents();
	}

	function bindEvents(){

	}

	function _addSubmissionToSlot(s){
		var cell = getSubmissionCell("scheduled", s);
        if ($(".popover-inner #" + s.session + ".list-submissions .submission-empty").length > 0)
    		$(cell).insertBefore($(".popover-inner #" + s.session + ".list-submissions"));
        else
            $(".popover-inner #" + s.session + ".list-submissions").append($(cell));
		$(cell).effect("highlight", {color: "yellow"}, 10000);
	}

	function _removeSubmissionFromSlot(s){		
        $(".popover-inner #" + s.id).remove();
	}

	function _addSubmissionToUnscheduled(s){
        var cell = getSubmissionCell("unscheduled", s);
        $("#unscheduled-papers").append($(cell));
        $(cell).effect("highlight", {color: "yellow"}, 10000);
	}

	function _removeSubmissionFromUnscheduled(s){
		var $cell = $("#unscheduled-papers #" + s.id);
		$cell.popover("destroy").remove();
	}

    function _swapNodes(a, b) {
		var aparent= a.parentNode;
		var asibling= a.nextSibling===b? a : a.nextSibling;
		b.parentNode.insertBefore(a, b);
		aparent.insertBefore(b, asibling);
	}

    // CASE 1. src: scheduled, dst: scheduled
    function swap(scheduled1, scheduled2){
        var $s1 = $(".popover-inner #" + scheduled1.id);
        var $s2 = $(".popover-inner #" + scheduled2.id);
        if (typeof $s1[0] !== "undefined" && typeof $s1[0] !== "undefined")
            _swapNodes($s1[0], $s2[0]);
        else if (typeof $s1[0] !== "undefined") {
            _removeSubmissionFromSlot(scheduled1);
            _addSubmissionToSlot(scheduled2);
        } else if (typeof $s2[0] !== "undefined") {
            _removeSubmissionFromSlot(scheduled2);
            _addSubmissionToSlot(scheduled1);
        }

		$("#program #session-" + scheduled1.session).effect("highlight", {color: "yellow"}, 10000);
		$("#program #session-" + scheduled2.session).effect("highlight", {color: "yellow"}, 10000);
        $(".popover-inner #" + scheduled1.id).effect("highlight", {color: "yellow"}, 10000);
        $(".popover-inner #" + scheduled2.id).effect("highlight", {color: "yellow"}, 10000);
    }

    // CASE 2. src: scheduled, dst: unscheduled && src: unscheduled, dst: scheduled
    function swapWithUnscheduled(unscheduled, scheduled){
        unschedule(scheduled);
        // by the backend code, unscheduled alreay contains updated the destination's date, time, and room
    	//var $emptySlot = findCellByDateTimeRoom(unscheduled.date, unscheduled.time, unscheduled.room);
    	scheduleUnscheduled(unscheduled);
    }

    // CASE 3. src: scheduled, dst: empty && src: empty, dst: scheduled
    function swapWithEmpty(scheduled){
		_removeSubmissionFromSlot(scheduled);
		_addSubmissionToSlot(scheduled);
    }

    // CASE 4. src: unscheduled, dst: empty && src: empty, dst: unscheduled
    function scheduleUnscheduled(unscheduled){
    	_removeSubmissionFromUnscheduled(unscheduled);	
		_addSubmissionToSlot(unscheduled);
    }

    // CASE 5. session: scheduled
    function unschedule(scheduled){
        console.log("UNSCHEDULE", scheduled);
        _removeSubmissionFromSlot(scheduled);
        _addSubmissionToUnscheduled(scheduled);
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