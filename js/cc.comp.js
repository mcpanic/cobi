// Comparators

var Comp = function() {
    var dateList = {
        "Saturday": 0,
        "Sunday": 1,
        "Monday": 2,
        "Tuesday": 3,
        "Wednesday": 4,
        "Thursday": 5,
        "Friday": 6
    };

    var timeList = {
        "9:00-10:20": 0, 
        "11:00-12:20": 1, 
        "14:00-15:20": 2, 
        "16:00-17:20": 3
    };

    var roomList = {
        "221/221M": {floor: "2", size: "", type: ""},
        "241": {floor: "2", size: "", type: ""},
        "242A": {floor: "2", size: "", type: ""},
        "242B": {floor: "2", size: "", type: ""},
        "243":  {floor: "2", size: "", type: ""},
        "251":  {floor: "2", size: "", type: ""},
        "252A": {floor: "2", size: "", type: ""},
        "252B": {floor: "2", size: "", type: ""},
        "253": {floor: "2", size: "", type: ""},
        "342A": {floor: "3", size: "", type: ""},
        "343": {floor: "3", size: "", type: ""},
        "351": {floor: "3", size: "", type: ""},
        "352AB": {floor: "3", size: "", type: ""},
        "361": {floor: "3", size: "", type: ""},
        "362/363": {floor: "3", size: "", type: ""},
        "Blue": {floor: "2", size: "", type: ""},
        "Bordeaux": {floor: "2", size: "", type: ""},
        "Havane": {floor: "2", size: "", type: ""}
    };

    var orderedDateList = [];
    var orderedTimeList = [];
    var orderedRoomList = [];
    var sessionTypeList = ["paper", "course", "special", "panel", "casestudy", "SIG", "bof", "altchi"];
    var submissionTypeList = ["paper", "TOCHI", "course", "panel", "casestudy", "SIG"];


	// Initialize the sidebar with a default view 
	function initialize(){
	  	// bindEvents();
        orderedDateList = keys(schedule).sort(function(a,b) { return dateList[a] - dateList[b]; }); 
        var tList = [];
        $.each(schedule, function(i, date){ 
            $.each(date, function(j, time){ 
                tList.push(j);
            })
        });
        tList = _.uniq(tList);
        orderedTimeList = tList.sort(function(a,b) { return timeList[a] - timeList[b]; } );
        orderedRoomList = keys(allRooms); 

        test();      
	}

    function test(){
        console.assert(booleanEquals(false, "false"), "booleanEquals");
        console.assert(booleanEquals(false, "FALSE"), "booleanEquals");
        console.assert(booleanEquals("FALSE", "false"), "booleanEquals");
        console.assert(!booleanEquals(false, true), "booleanEquals");
        console.assert(!booleanEquals(false, "true"), "booleanEquals");        


        console.assert(sessionTypeRegular("paper"), "sessionTypeRegular");
        console.assert(!sessionTypeRegular("course"), "sessionTypeRegular");
        console.assert(!sessionTypeRegular("special"), "sessionTypeRegular");
        console.assert(!sessionTypeSpecial("paper"), "sessionTypeSpecial");
        console.assert(sessionTypeSpecial("altchi"), "sessionTypeSpecial");


        console.assert(submissionTypeRegular("paper"), "submissionTypeRegular");
        console.assert(submissionTypeRegular("TOCHI"), "submissionTypeRegular");
        console.assert(!submissionTypeRegular("course"), "submissionTypeRegular");
        console.assert(!submissionTypeSpecial("paper"), "submissionTypeRegular");
        console.assert(!submissionTypeSpecial("TOCHI"), "submissionTypeRegular");
        console.assert(submissionTypeSpecial("course"), "submissionTypeRegular");

    }

	// function bindEvents(){
	// }

/********************************
    generic comparators
 ********************************/

    function stringEquals(v1, v2){
        return v1 === v2;
    }

    // v1 contains v2 (shorter)
    function stringContains(v1, v2){
        // TODO: Fuzzy match
        // TODO: case insensitive
        return v1.indexOf(v2) !== -1;
    }

    // v1 starts with v2
    function stringStartsWith(v1, v2){
        return v1.indexOf(v2) === 0;
    }

    // accepts both "true" (case insensitive) and true
    function booleanEquals(v1, v2){
        return (/^true$/i).test(v1) === (/^true$/i).test(v2);
    }

    function numEquals(v1, v2){
        return parseInt(v1) === parseInt(v2);
    }

    function numLessThan(v1, v2){
        return parseInt(v1) < parseInt(v2);
    }

    function numGreaterThan(v1, v2){
        return parseInt(v1) > parseInt(v2);
    }

/********************************
    ordered list comparators
 ********************************/

    // is v1 before v2?
    function _orderedBefore(v1, v2, orderedList){
        var i1 = _.indexOf(orderedList, v1);
        var i2 = _.indexOf(orderedList, v2);
        return i1 > i2;
    }

    // is v1 after v2?
    function _orderedAfter(v1, v2, orderedList){
        var i1 = _.indexOf(orderedList, v1);
        var i2 = _.indexOf(orderedList, v2);
        return i1 < i2;
    }

    function _orderedFirst(v, orderedList){
        return orderedList[0] == v;
    }

    function _orderedLast(v, orderedList){
        return orderedList[orderedList.length-1] == v;
    }    

/********************************
    date-related comparators
 ********************************/

    function dateEquals(o, v){
        return stringEquals(o, v);
    }

    function dateFirst(o){
        return _orderedFirst(o, orderedDateList);
    } 

    function dateLast(o){
        return stringEquals(o, orderedDateList);
    }

    function dateBefore(o, v){
        return _orderedBefore(o, v, orderedDateList);
    }

    function dateAfter(o, v){
        return _orderedAfter(o, v, orderedDateList);
    }

/********************************
    time-related comparators
 ********************************/
    function timeEquals(o, v){
        return stringEquals(o, v);
    }

    function timeMorning(o){
        var index = _.indexOf(orderedTimeList, o);
        if (index == 0 || index == 1)
            return true;
        else
            return false;
    }

    function timeAfternoon(o){
        var index = _.indexOf(orderedTimeList, o);
        if (index == 2 || index == 3)
            return true;
        else
            return false;
    }

    function timeBefore(o, v){
        return _orderedBefore(o.date, v, orderedTimeList);
    }

    function timeAfter(o, v){
        return _orderedAfter(o.date, v, orderedTimeList);
    }


/********************************
    room-related comparators
 ********************************/
    function roomLowerFloor(o){
        return parseInt(orderedRoomList[o].floor) === 2;
    }

    function roomUpperFloor(o){
        return parseInt(orderedRoomList[o].floor) === 3;
    }

    // TODO: More to come for size and type
    function roomSizeSmall(o){
        return parseInt(orderedRoomList[o].size) === "small";
    }

    function roomSizeMedium(o){
        return parseInt(orderedRoomList[o].size) === "medium";
    }

    function roomSizeLarge(o){
        return parseInt(orderedRoomList[o].size) === "large";
    }

    // conference room
    // TODO: implement
    function roomTypeRegular(o){

    }

    // theater, ...
    // TODO: implement
    function roomTypeSpecial(o){

    }


/********************************
    session-level comparators
 ********************************/

    function sessionTypeRegular(o){
        return stringEquals(o, "paper");
    }

    // everything not paper is special
    // refer to sessionTypeList
    function sessionTypeSpecial(o){
        return !stringEquals(o, "paper");
    }
 
/********************************
    submission-level comparators
 ********************************/

    function submissionTypeRegular(o){
        return stringEquals(o, "paper") || stringEquals(o, "TOCHI");
    }

    // everything not paper is special
    // refer to submissionTypeList
    function submissionTypeSpecial(o){
        return !stringEquals(o, "paper") && !stringEquals(o, "TOCHI");
    }

/********************************
    author-level comparators
 ********************************/


/********************************
    return all public comparators
 ********************************/
    return {
        initialize: initialize,
        stringEquals: stringEquals,
        stringContains: stringContains,
        stringStartsWith: stringStartsWith,
        booleanEquals: booleanEquals,
        numEquals: numEquals,
        numLessThan: numLessThan,
        numGreaterThan: numGreaterThan,
        dateEquals: dateEquals,
        dateFirst: dateFirst,  
        dateLast: dateLast,
        dateBefore: dateBefore,
        dateAfter: dateAfter,
        timeEquals: timeEquals,
        timeMorning: timeMorning,
        timeAfternoon: timeAfternoon,
        timeBefore: timeBefore,
        timeAfter: timeAfter,
        roomLowerFloor: roomLowerFloor,
        roomUpperFloor: roomUpperFloor,  
        roomSizeSmall: roomSizeSmall,
        roomSizeMedium: roomSizeMedium,
        roomSizeLarge: roomSizeLarge,
        roomTypeRegular: roomTypeRegular,
        roomTypeSpecial: roomTypeSpecial,
        sessionTypeRegular: sessionTypeRegular,
        sessionTypeSpecial: sessionTypeSpecial,
        submissionTypeRegular: submissionTypeRegular, 
        submissionTypeSpecial: submissionTypeSpecial        
    };
}();       


