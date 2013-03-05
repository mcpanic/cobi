// Unit chair moves at the visual (front-end) level
// These can be combined to form more complex operations.

var ChairVisualOps = function() {
	// Initialize the sidebar with a default view 
	function initialize(){
	  	//bindEvents();
	}

	function bindEvents(){

	}

	function _addChairToSlot(s, srcType){
        var cell = getChairDetail("chairMove", "scheduled", s, srcType, allSessions[s.id]);
        $(".popover-inner .chair-display").replaceWith($(cell));
        $(".popover-inner button").addClass("disabled");
	}

	function _removeChairFromSlot(s, isDone){		
        $(".popover-inner .chair-display").removeAttr("data-chair-id");
        $(".popover-inner .chair-display .chair-text").html("Session Chair: N/A");
        // disable chair-related buttons in all cases. Or just unschedule button?
        $(".popover-inner .chair-display button").addClass("disabled");
        if (isDone)
            $(".popover-inner button").addClass("disabled");
	}

	function _addChairToUnscheduled(s){
        var cell = getChairCell("unscheduled", s);
        $("#unscheduled-chairs tr").append($(cell));
	}

	function _removeChairFromUnscheduled(s){
		var $cell = $("#unscheduled-chairs #" + s.authorId);
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
        var $s1 = $(".popover-inner [data-chair-id='" + scheduled1.authorId + "']");
        var $s2 = $(".popover-inner [data-chair-id='" + scheduled2.authorId + "']");
        console.log($s1.length > 0, $s2.length > 0);
        if ($s1.length > 0 && $s2.length > 0) {
            _swapNodes($s1[0], $s2[0]);
        } else if ($s1.length > 0) {
            _removeChairFromSlot(scheduled1, true);
            _addChairToSlot(scheduled2, "chair-scheduled");
        } else if ($s2.length > 0) {
            _removeChairFromSlot(scheduled2, true);
            _addChairToSlot(scheduled1, "chair-scheduled");
        }
        $(".move-cancel-button").addClass("disabled"); 
    }

    // CASE 2. src: scheduled, dst: unscheduled && src: unscheduled, dst: scheduled
    function swapWithUnscheduled(unscheduled, scheduled){
        unschedule(scheduled);
    	scheduleUnscheduled(unscheduled);
        $(".move-cancel-button").addClass("disabled");
    }

    // CASE 3. src: scheduled, dst: empty && src: empty, dst: scheduled
    function swapWithEmpty(scheduled){
        var isAdditionNeeded = $(".popover-inner [data-chair-id='" + scheduled.authorId + "']").length == 0;
        _removeChairFromSlot(scheduled, true);
        if (isAdditionNeeded)
		    _addChairToSlot(scheduled, "chair-empty");
        $(".move-cancel-button").addClass("disabled");
    }

    // CASE 4. src: unscheduled, dst: empty && src: empty, dst: unscheduled
    function scheduleUnscheduled(unscheduled){
        var isAdditionNeeded = $(".move-src-selected").hasClass("unscheduled");
    	_removeChairFromUnscheduled(unscheduled);	
        if (isAdditionNeeded)
            _addChairToSlot(unscheduled, "chair-unscheduled");
        $(".move-cancel-button").addClass("disabled");
    }

    // CASE 5. session: scheduled
    function unschedule(scheduled){
        _removeChairFromSlot(scheduled, false);
        _addChairToUnscheduled(scheduled);
        $(".move-cancel-button").addClass("disabled");
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