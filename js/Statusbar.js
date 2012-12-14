var Statusbar = function() {

	var bar;

    // Initialize the view mode 
    function initialize(){
//        bindEvents();
		bar = $("#statusbar");
		display("Loading conference data... This might take up to 15-20 seconds.");
    }

    // Display the given html with given type
    function display(html, type){
    	bar.html(html);
    }

    function destroy(){

    }

    return {
        initialize: initialize,
        display: display,
        destroy: destroy
    };
}();       