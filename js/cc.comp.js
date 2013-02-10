// Comparators

var Comp = function() {
	// Initialize the sidebar with a default view 
	function initialize(){
	  	// bindEvents();
	}

    function test(){
        console.assert(_stringEquals("a", "a"), "_stringEquals failed");
        console.assert(_stringContains("abcde", "abcde"), "_stringContains failed");
        console.log(scheduleDateIs("Monday"));
        console.log(scheduleDateIs("Tuesday"));
        console.log(scheduleTimeIs("11:00-12:20"));
        console.log(scheduleTimeIs("14:00"));
        console.log(scheduleRoomIs("242A"));
        console.log(scheduleRoomIs("Red"));
        console.log(sessionHasAward());
        console.log(sessionTitleContains("crowd"));
        console.log(submissionTitleContains("Online"));
        console.log(authorNameContains("Ryan"));
        console.log(authorNameContains("Juho"));
    }

	// function bindEvents(){
	// }

    function _stringEquals(s1, s2){
        return s1 === s2;
    }

    function _stringContains(s1, s2){
        // TODO: Fuzzy match
        // TODO: case insensitive
        // TODO: asusming that s1 is longer than s2
        return s1.indexOf(s2) !== -1;
    }


/********************************
    schedule level comparators
 ********************************/
    function scheduleDateIs(val){
        var list = schedule;
        var newList = [];
        $.each(list, function(dIndex, d){
            if (_stringEquals(dIndex, val))
                newList.push(d);
        });
        return newList;
    }

    function scheduleTimeIs(val){
        var list = schedule;
        var newList = [];
        $.each(list, function(dIndex, d){
            $.each(d, function(tIndex, t){
                if (_stringEquals(tIndex, val))
                    newList.push(t);    
            });
        });
        return newList;
    }

    function scheduleRoomIs(val){
        var list = schedule;
        var newList = [];
        $.each(list, function(dIndex, d){
            $.each(d, function(tIndex, t){
                $.each(t, function(rIndex, r){
                    if (_stringEquals(rIndex, val))
                        newList.push(r);                        
                }); 
            });
        });
        return newList;
    }

/********************************
    session level comparators
 ********************************/
    // all sessions that have award
    function sessionHasAward(){
        var list = allSessions;
        var newList = [];
        $.each(list, function(id, item){
            if (item.hasAward)
                newList.push(item);
        });
        return newList;
    }

    function sessionTitleContains(val){
        var list = allSessions;
        var newList = [];
        $.each(list, function(id, item){
            if (_stringContains(item.title, val))
                newList.push(item);
        });
        return newList;
    }

/********************************
    submission level comparators
 ********************************/
    function submissionTitleContains(val){
        var list = allSubmissions;
        var newList = [];
        $.each(list, function(id, item){
            if (_stringContains(item.title, val))
                newList.push(item);
        });
        return newList;
    }

/********************************
    author level comparators
 ********************************/
    function authorNameContains(val){
        var list = allSubmissions;
        var newList = [];
        $.each(list, function(id, submission){
            $.each(submission.authors, function(i, author){
                if (_stringContains(author.firstName, val))
                    newList.push(submission);
            });
        });
        return newList;
    }


    return {
        // initialize: initialize
        test: test
    };
}();       


