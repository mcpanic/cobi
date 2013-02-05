// Unit paper moves at the visual (front-end) level
// These can be combined to form more complex operations.

var PaperVisualOps = function() {
	// Initialize the sidebar with a default view 
	function initialize(){
	  	//bindEvents();
	}

	function bindEvents(){

	}

	function _addSubmissionToSlot(s, pos, srcType){
        console.log(srcType);
        var cell = getSubmissionDetail("paperMove", "scheduled", s, srcType, allSessions[s.session]);
        $(cell).insertBefore($(".popover-inner .list-submissions li").eq(pos));
        $(".popover-inner button").addClass("disabled");
		$(".popover-inner .list-submissions li").eq(pos).effect("highlight", {color: "yellow"}, 10000);
	}

    // returns the position that was removed
	function _removeSubmissionFromSlot(s, isDone){		
        var pos = $(".popover-inner #" + s.id).index();
        $(".popover-inner #" + s.id).remove();
        if (isDone)
            $(".popover-inner button").addClass("disabled");
        return pos;
	}

	function _addSubmissionToUnscheduled(s){
        var cell = getSubmissionCell("unscheduled", s);
        $("#unscheduled-papers tr").append($(cell));
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
        if ($s1.length > 0 && $s2.length > 0) {
            _swapNodes($s1[0], $s2[0]);
            $s1.effect("highlight", {color: "yellow"}, 10000);
            $s2.effect("highlight", {color: "yellow"}, 10000);
        } else if ($s1.length > 0) {
            var pos = _removeSubmissionFromSlot(scheduled1, true);
            _addSubmissionToSlot(scheduled2, pos, "paper-scheduled");
        } else if ($s2.length > 0) {
            var pos = _removeSubmissionFromSlot(scheduled2, true);
            _addSubmissionToSlot(scheduled1, pos, "paper-scheduled");
        }

		$("#program #session-" + scheduled1.session).effect("highlight", {color: "yellow"}, 10000);
		$("#program #session-" + scheduled2.session).effect("highlight", {color: "yellow"}, 10000);
 
    }

    // CASE 2. src: scheduled, dst: unscheduled && src: unscheduled, dst: scheduled
    function swapWithUnscheduled(unscheduled, scheduled){
        var pos = unschedule(scheduled);
    	scheduleUnscheduled(unscheduled, pos);
    }

    // CASE 3. src: scheduled, dst: empty && src: empty, dst: scheduled
    function swapWithEmpty(scheduled, pos){
        var isAdditionNeeded = $(".popover-inner #" + scheduled.id).length == 0;
        _removeSubmissionFromSlot(scheduled, true);
        if (isAdditionNeeded)
		    _addSubmissionToSlot(scheduled, pos, "paper-empty");
    }

    // CASE 4. src: unscheduled, dst: empty && src: empty, dst: unscheduled
    function scheduleUnscheduled(unscheduled, pos){
        var isAdditionNeeded = $(".move-src-selected").hasClass("unscheduled");
    	_removeSubmissionFromUnscheduled(unscheduled);	
        if (isAdditionNeeded)
            _addSubmissionToSlot(unscheduled, pos, "paper-unscheduled");
    }

    // CASE 5. session: scheduled
    function unschedule(scheduled){
        var pos = _removeSubmissionFromSlot(scheduled, false);
        _addSubmissionToUnscheduled(scheduled);
        return pos;
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