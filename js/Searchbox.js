var Searchbox = function() {

    // Initialize the search box functionality
    function initialize(){
        $("#searchbox").select2({
            width: "copy",
            containerCssClass: "searchbox",
            placeholder: "search by session / paper / author name",
            minimumInputLength: 2,
            allowClear: true,
            dropdownCssClass: "dropdown-item",
            query: function (query) {
                var q = query.term.toLowerCase();
                var data = search(q);
                query.callback(data);
            },
            formatSelection: format,
            formatResult: format
        });

        $("#searchbox").on("change", function(e){
            var id = e.val;
            //console.log(JSON.stringify({val:e.val, added:e.added, removed:e.removed}));
            if (id == "")
                return;
            var $cell = findCellByID(id);
            // not a session, so a submission
            if ($cell.length == 0) {
                // something wrong, so just return
                if (typeof allSubmissions[id] === "undefined")
                    return;
                else {
                    // unscheduled paper
                    if (allSubmissions[id].session == "null"){
                        $cell = $("#" + id);
                    } else{
                        $cell = findCellByID(allSubmissions[id].session);
                    }
                }
                    
            }
            $("body").animate({
                scrollTop:$cell.offset().top - 100
            }, 500);   
            $cell.effect("highlight", {color: "#aec7e8"}, 3000);          
        });
    }

    // Perform search, using a modified version of fuse.js, not fuse.min.js
    function search(q) {
        var data = {results: []};
        var sessionData = {text: "Sessions", children:[]};
        var submissionData = {text: "Submissions", children:[]};

        // fuzzy query match
        var options = {
          keys: ["title"],   
          id: "id",          
          threshold: "0.2"
        }
        var f = new Fuse(allSessions, options);
        var result = f.search(q); 
        // console.log("FUSE", q, result);
        for (id in result) {
            sessionData.children.push({id: result[id], text: allSessions[result[id]].title});  
        }


        // construct objects to be inserted for submissions. flattening author information out to the front so that it's searchable
        var submissions = {};
        $.each(allSubmissions, function(index, submission){
            // strip commas
            var authors = displayAuthors(submission.authors).replace(/,/g,'');
            var s = {
                id: submission.id, 
                title: submission.title, 
                authors: authors
            };
            submissions[submission.id] = s;
        });
        console.log(submissions);
        options = {
            keys: ["authors"],
            id: "id",
            threshold: "0.2"
        }        
        f = new Fuse(submissions, options);
        result = f.search(q);
        // console.log("FUSE2", q, result);

        for (id in result) {
            submissionData.children.push({id: result[id], text: submissions[result[id]].title, authors: submissions[result[id]].authors});   
        }
            
        data.results.push(sessionData);
        data.results.push(submissionData);
        return data;
    }

    function format(item) { 
        if (typeof allSubmissions[item.id] === "undefined")
            return "<strong>" + item.text + "</strong>"; 
        else
            return "<strong>" + item.text + "</strong><br>" + displayAuthors(allSubmissions[item.id].authors);
    }

    function destroy(){

    }

    return {
        initialize: initialize,
        destroy: destroy
    };
}();       