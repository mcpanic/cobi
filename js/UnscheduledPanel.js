var UnscheduledPanel = function() {

    // Initialize the view mode 
    function initialize(){
        refreshButtons();
        bindEvents();
    }

    function bindEvents(){
        $(".unscheduled-panel .left").on("click", unscheduledLeftHandler);
        $(".unscheduled-panel .right").on("click", unscheduledRightHandler);
        $(".unscheduled-papers-panel .left").on("click", unscheduledPapersLeftHandler);
        $(".unscheduled-papers-panel .right").on("click", unscheduledPapersRightHandler);
        $(".unscheduled-chairs-panel .left").on("click", unscheduledChairsLeftHandler);
        $(".unscheduled-chairs-panel .right").on("click", unscheduledChairsRightHandler);

    }

    function _refresh(mode){
        var $panel;
        var $leftButton;
        var $rightButton;
        if (mode == "session") {
            $panel = $(".unscheduled-wrapper");
            $leftButton = $(".unscheduled-panel .left");
            $rightButton = $(".unscheduled-panel .right");
        } else if (mode == "paper") {
            $panel = $(".unscheduled-papers-wrapper");
            $leftButton = $(".unscheduled-papers-panel .left");
            $rightButton = $(".unscheduled-papers-panel .right");
        } else if (mode == "chair") {
            $panel = $(".unscheduled-chairs-wrapper");
            $leftButton = $(".unscheduled-chairs-panel .left");
            $rightButton = $(".unscheduled-chairs-panel .right");
        }

        var hasHorizontalScrollbar = $panel[0].scrollWidth > $panel[0].clientWidth;
        if (!hasHorizontalScrollbar){
            $leftButton.css({"opacity": 0.3, "cursor": "default"});  
            $rightButton.css({"opacity": 0.3, "cursor": "default"});  
        } else {
            if (isLeftEnd(mode)){
                $leftButton.css({"opacity": 0.3, "cursor": "default"});
            } else {
                $leftButton.css({"opacity": 1, "cursor": "pointer"});
            }

            if (isRightEnd(mode)){
                $rightButton.css({"opacity": 0.3, "cursor": "default"});
            } else {
                $rightButton.css({"opacity": 1, "cursor": "pointer"});
            }
        }

    }

    function refreshButtons(){
        _refresh("session");
        _refresh("paper");
        _refresh("chair");
    }

    function isLeftEnd(mode){
        var $panel;
        if (mode == "session") {
            $panel = $(".unscheduled-wrapper");
        } else if (mode == "paper") {
            $panel = $(".unscheduled-papers-wrapper");
        } else if (mode == "chair") {
            $panel = $(".unscheduled-chairs-wrapper");
        }

        return $panel.scrollLeft() == 0;
    }

    function isRightEnd(mode){
        var $panel;
        if (mode == "session") {
            $panel = $(".unscheduled-wrapper");
        } else if (mode == "paper") {
            $panel = $(".unscheduled-papers-wrapper");
        } else if (mode == "chair") {
            $panel = $(".unscheduled-chairs-wrapper");
        }

        return $panel[0].clientWidth + $panel[0].scrollLeft >= $panel[0].scrollWidth;   
    }

    function unscheduledLeftHandler(event) {
        event.preventDefault();
        $(".unscheduled-wrapper").animate({
            scrollLeft: "-=60px"
        }, {
            duration: 200,
            complete: refreshButtons
        });
    }

    function unscheduledRightHandler(event) {
        event.preventDefault();
        $(".unscheduled-wrapper").animate({
            scrollLeft: "+=60px"
        }, {
            duration: 200,
            complete: refreshButtons
        });
    }

    function unscheduledPapersLeftHandler(event) {
        event.preventDefault();
        $(".unscheduled-papers-wrapper").animate({
            scrollLeft: "-=60px"
        }, {
            duration: 200,
            complete: refreshButtons
        });
    }

    function unscheduledPapersRightHandler(event) {
        event.preventDefault();
        $(".unscheduled-papers-wrapper").animate({
            scrollLeft: "+=60px"
        }, {
            duration: 200,
            complete: refreshButtons
        });
    }

    function unscheduledChairsLeftHandler(event) {
        event.preventDefault();
        $(".unscheduled-chairs-wrapper").animate({
            scrollLeft: "-=60px"
        }, {
            duration: 200,
            complete: refreshButtons
        });
    }

    function unscheduledChairsRightHandler(event) {
        event.preventDefault();
        $(".unscheduled-chairs-wrapper").animate({
            scrollLeft: "+=60px"
        }, {
            duration: 200,
            complete: refreshButtons
        });
    }

    function destroy(){

    }

    return {
        initialize: initialize,
        refreshButtons: refreshButtons
    };
}();       