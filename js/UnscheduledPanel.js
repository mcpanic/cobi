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
    }

    function _refresh(isPaper){
        var $panel = isPaper ? $(".unscheduled-papers-wrapper") : $(".unscheduled-wrapper");
        var $leftButton = isPaper ? $(".unscheduled-papers-panel .left") : $(".unscheduled-panel .left");
        var $rightButton = isPaper ? $(".unscheduled-papers-panel .right") : $(".unscheduled-panel .right");
        var hasHorizontalScrollbar = $panel[0].scrollWidth > $panel[0].clientWidth;
        if (!hasHorizontalScrollbar){
            $leftButton.css({"opacity": 0.3, "cursor": "default"});  
            $rightButton.css({"opacity": 0.3, "cursor": "default"});  
        } else {
            if (isLeftEnd(isPaper)){
                $leftButton.css({"opacity": 0.3, "cursor": "default"});
            } else {
                $leftButton.css({"opacity": 1, "cursor": "pointer"});
            }

            if (isRightEnd(isPaper)){
                $rightButton.css({"opacity": 0.3, "cursor": "default"});
            } else {
                $rightButton.css({"opacity": 1, "cursor": "pointer"});
            }
        }

    }

    function refreshButtons(){
        _refresh(false);
        _refresh(true);
    }

    function isLeftEnd(isPaper){
        var $panel = isPaper ? $(".unscheduled-papers-wrapper") : $(".unscheduled-wrapper");
        return $panel.scrollLeft() == 0;
    }

    function isRightEnd(isPaper){
        var $panel = isPaper ? $(".unscheduled-papers-wrapper") : $(".unscheduled-wrapper");
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

    function destroy(){

    }

    return {
        initialize: initialize,
        refreshButtons: refreshButtons
    };
}();       