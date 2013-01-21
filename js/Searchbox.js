var Searchbox = function() {

	var data;

    // Initialize the view mode 
    function initialize(){
//        bindEvents();

        //data = [{id:0,tag:'enhancement'},{id:1,tag:'bug'},{id:2,tag:'duplicate'},{id:3,tag:'invalid'},{id:4,tag:'wontfix'}];
		
        $("#searchbox").select2({
            placeholder: "session / paper / author name",
            minimumInputLength: 2,
            allowClear: true,
            dropdownCssClass: "dropdown-item",
            //data: {results: data, text: "tag"},
            query: function (query) {
                var q = query.term.toLowerCase();
                var data = {results: []};
                var sessionData = {text: "Sessions", children:[]};
                var submissionData = {text: "Submissions", children:[]};

                // look at all sessions
                for (id in allSessions){
                    var title = allSessions[id].title;
                    console.log(title);
                    if (title.toLowerCase().indexOf(q) !== -1)
                        sessionData.children.push({id: id, text: "<strong>" + title + "</strong>"});  

                    // look at all submissions
                    $.each(allSessions[id].submissions, function(index, submission){
                        var submissionDisplay = "";
                        var authorsDisplay = "";
                        var isMatch = false;

                        if (submission.title.toLowerCase().indexOf(q) !== -1)
                            isMatch = true; 
                        
                        // look at all authors
                        $.each(submission.authors, function(i, author){
                            if (author.firstName.toLowerCase().indexOf(q) !== -1 || author.lastName.toLowerCase().indexOf(q) !== -1)
                                isMatch = true;
                            authorsDisplay += author.firstName + " " + author.lastName + ", ";
                        });
                        
                        if (isMatch) {
                            submissionDisplay = authorsDisplay + "<br><strong>" + submission.title + "</strong>";
                            submissionData.children.push({id: id, text: submissionDisplay}); 
                        }

                    });

                }
                
                data.results.push(sessionData);
                data.results.push(submissionData);
                query.callback(data);
            }
            //formatSelection: format,
            //formatResult: format
        });

        $("#searchbox").on("change", function(e){
            $(".highlight").removeClass("highlight");
            var id = e.val;
            console.log(JSON.stringify({val:e.val, added:e.added, removed:e.removed}));
            if (id == "")
                return;
            var $cell = findCellByID(id);
            $("body").animate({
                scrollTop:$cell.offset().top - 100
            }, 500);
            //$(document).scrollTop( $(cell).offset().top - 100); 
            $cell.addClass("highlight"); //.popover("toggle");               

        });
		
    }

    function format(item) { 
        return item.tag; 
    }

    function destroy(){

    }

    return {
        initialize: initialize,
        destroy: destroy
    };
}();       