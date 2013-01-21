var allRooms = null;
var allSessions = null;
var authorConflictsAmongSessions = {};
var personaConflictsAmongSessions = {};
var conflictsByTime = null;
var conflictsBySession = null;
var unscheduled = null;
var schedule = null;
var frontEndOnly = false;
var scheduleSlots = null;
var userData = new userInfo(null, "Anon", null, "rookie");
var transactions = null;

////// Functions that change the data schedule 

/// TODO: don't allow actually changing slots that are locked.

function undo(){
    // TODO: assume a local transactions array of latest transactions..
    // undo last move

    // undo it in the json data
    // alert the frontend of changes
    if(transactions && transactions.length >0){
	var type = transactions[transactions.length -1].type;
	var previous = transactions[transactions.length -1].previous;

	if(type == "lock"){
	    toggleSlotLock(previous['date'], 
			   previous['time'],
			   previous['room']);
	    $(document).trigger('lockChange', [previous['date'], previous['time'], previous['room']]);
	}else if(type == "unschedule"){
	    // schedule the session
	    addSessionToSlot(allSessions[previous['id']],
			     previous['date'], 
			     previous['time'],
			     previous['room']);
	    delete unscheduled[previous['id']];
	    $(document).trigger('slotChange', [previous['date'], previous['time'], previous['room']]);
	    $(document).trigger('unscheduledChange');

	}else if(type == "schedule"){
	    removeSessionFromSlot(allSessions[previous['id']],
				  previous['date'], 
				  previous['time'],
				  previous['room']);
	    unscheduled[previous['id']] = allSessions[previous['id']];;

	    $(document).trigger('slotChange', [previous['date'], previous['time'], previous['room']]);
	    $(document).trigger('unscheduledChange');

	}else if(type == "swap"){
	    var s1date = previous['s1date'];
	    var s1time = previous['s1time'];
	    var s1room = previous['s1room'];
	    var s2date = previous['s2date'];
	    var s2time = previous['s2time'];
	    var s2room = previous['s2room'];
	    
	    allSessions[previous['s1id']].date = s2date;
	    allSessions[previous['s1id']].time = s2time;
	    allSessions[previous['s1id']].room = s2room;
	    allSessions[previous['s2id']].date = s1date;
	    allSessions[previous['s2id']].time = s1time;
	    allSessions[previous['s2id']].room = s1room;
 
	    // change it's locations in the data structure
	    schedule[s1date][s1time][s1room][previous['s2id']] = allSessions[previous['s2id']];
	    delete schedule[s1date][s1time][s1room][previous['s1id']];
	    
	    schedule[s2date][s2time][s2room][previous['s1id']] = allSessions[previous['s1id']];
	    delete schedule[s2date][s2time][s2room][previous['s2id']];

	    var s1date = previous['s1date'];
	    var s1time = previous['s1time'];
	    var s1room = previous['s1room'];
	    var s2date = previous['s2date'];
	    var s2time = previous['s2time'];
	    var s2room = previous['s2room'];
	    
	    $(document).trigger('slotChange', [s1date, s1time, s1room]);
	    $(document).trigger('slotChange', [s2date, s2time, s2room]);


	}else if(type == "move"){
	    removeSessionFromSlot(allSessions[previous['id']], previous['sdate'], previous['stime'], previous['sroom']);
	    addSessionToSlot(allSessions[previous['id']], previous['tdate'], previous['ttime'], previous['troom']);

	    $(document).trigger('slotChange', [previous['sdate'], previous['stime'], previous['sroom']]);
	    $(document).trigger('slotChange', [previous['tdate'], previous['ttime'], previous['troom']]);
	}
	
		    
	// get rid of last transaction
	transactions.pop();

	// TODO: should really check this first before 
	// allowing undo in frontend 

	// undo it on the backend
	db.undo(userData.id);
    }
}

function lockSlotsAtDayTime(day, time){
    for(var room in scheduleSlots[day][time]){
	lockSlot(day, time, room);
    }
}

function unlockSlotsAtDayTime(day, time){
    for(var room in scheduleSlots[day][time]){
	unlockSlot(day, time, room);
    }
}

function lockSlotsInRoom(r){
    for(var day in scheduleSlots){
	for(var time in scheduleSlots[day]){
	    for(var room in scheduleSlots[day][time]){
		if(room == r){
		    lockSlot(day, time, r);
		}
	    }
	}
    }
}

function unlockSlotsInRoom(r){
    for(var day in scheduleSlots){
	for(var time in scheduleSlots[day]){
	    for(var room in scheduleSlots[day][time]){
		if(room == r){
		    unlockSlot(day, time, r);
		}
	    }
	}
    }
}

function toggleSlotLock(day, time, room){
    scheduleSlots[day][time][room]['locked'] = !scheduleSlots[day][time][room]['locked'];
}

function lockSlot(day, time, room){
    scheduleSlots[day][time][room]['locked'] = true;
    if(!frontEndOnly){
	db.toggleSlotLock(day, time, room, true, userData.id);
    }
}

function unlockSlot(day, time, room){
    scheduleSlots[day][time][room]['locked'] = false;
    if(!frontEndOnly){
	db.toggleSlotLock(day, time, room, false, userData.id);
    }
}


function removeSessionFromSlot(s, date, time, room){
    delete schedule[date][time][room][s.id];
    allSessions[s.id]['date'] = "";
    allSessions[s.id]['time'] = "";
    allSessions[s.id]['room'] = "";
}

function clearSlot(date, time, room){
    for(s in schedule[date][time][room]){
	//	console.log("Clearing: " + s);
	removeSessionFromSlot(allSessions[s], date, time, room);
    }
}

function addSessionToSlot(s, date, time, room){
    schedule[date][time][room][s.id] = s;
    s['date'] = date;
    s['time'] = time;
    s['room'] = room;
    // todo doesn't deal with endTime
}

// Unschedule a session
function unscheduleSession(s){
    // todo: doesn't deal with endTime
    var sdate = s.date;
    var stime = s.time;
    var sroom = s.room;

    if(scheduleSlots[sdate][stime][sroom]['locked']){
	$(document).trigger('slotLocked', [sdate, stime, sroom]);
	return;
    }

    // remove session from slot
    removeSessionFromSlot(s, sdate, stime, sroom);

    // add to unscheduled
    unscheduled[s.id] = s;

    // unschedule on server
    if(!frontEndOnly){
	db.unscheduleSession(s.id, sdate, stime, sroom, userData.id);
    }
}


// schedule a session
function scheduleSession(s, sdate, stime, sroom){
    if(scheduleSlots[sdate][stime][sroom]['locked']){
	$(document).trigger('slotLocked', [sdate, stime, sroom]);
	return;
    }

    var isUnscheduled = false;
    // remove session from unscheduled
    if(s.id in unscheduled){
	delete unscheduled[s.id];
	isUnscheduled = true;
    }
    
    // schedule on server
    if(!frontEndOnly){
	if(isUnscheduled){
	    db.scheduleSession(s.id, sdate, stime, sroom, userData.id);
	}else{
	    db.moveSession(s.id, s.date, s.time, s.room, 
		    sdate, stime, sroom, userData.id); 
	}
    }
    
    // schedule on frontend
    if(!isUnscheduled){
	removeSessionFromSlot(s, s.date, s.time, s.room)
    }
    addSessionToSlot(s, sdate, stime, sroom);
}


// Swaps two sessions into the original schedule data structure
function swapSessions(s1, s2){
    var s1date = s1.date;
    var s1time = s1.time;
    var s1room = s1.room;
    var s2date = s2.date;
    var s2time = s2.time;
    var s2room = s2.room;
    
    if(scheduleSlots[s1date][s1time][s1room]['locked']){
	$(document).trigger('slotLocked', [s1date, s1time, s1room]);
	return;
    }

    if(scheduleSlots[s2date][s2time][s2room]['locked']){
	$(document).trigger('slotLocked', [s2date, s2time, s2room]);
	return;
    }


    s1.date = s2date;
    s1.time = s2time;
    s1.room = s2room;
    s2.date = s1date;
    s2.time = s1time;
    s2.room = s1room;

    // change it's locations in the data structure
    schedule[s1date][s1time][s1room][s2.id] = s2;
    delete schedule[s1date][s1time][s1room][s1.id];

    schedule[s2date][s2time][s2room][s1.id] = s1;
    delete schedule[s2date][s2time][s2room][s2.id];

    // perform swap on server
    if(!frontEndOnly){
	db.swapSession(s1.id, s1date, s1time, s1room,
		       s2.id, s2date, s2time, s2room,  userData.id);
    }
}
///////end functions for interacting with schedule////////////

function arraysEqual(arr1, arr2) {
    if(arr1.length != arr2.length)
	return false;
    for(var i = 0; i < arr1.length; i++) {
	if(arr1[i] != arr2[i])
	    return false;
    }
    return true;
}

function keys(obj){
    var keys = [];
    
    for(var key in obj){
	if(obj.hasOwnProperty(key)){
	    keys.push(key);
	}
    }
    return keys;
}

if(!Array.prototype.indexOf) {
    Array.prototype.indexOf = function(what, i) {
        i = i || 0;
        var L = this.length;
        while (i < L) {
            if(this[i] === what) return i;
            ++i;
        }
        return -1;
    };
}

function initialize(){
    loadUser();
    db.loadSchedule();
}

// Populates all of the above variables and attaches personas
// once the schedule is loaded from server 
function initAfterScheduleLoads(m){
    schedule = m['schedule'];
    unscheduled = m['unscheduled'];
    scheduleSlots = m['slots'];
    transactions = m['transactions'];

    allRooms = getAllRooms();
    allSessions = getAllSessions();
    attachPersonas();  // loads personas from a file into schedule JSON
    
    initializeAuthorConflictsAmongSessions(); // this can be loaded from a file
    initializePersonaConflictsAmongSessions(); // this can be loaded from a file
    
    getAllConflicts();
    
    // Traditional polling for now...
    if(!frontEndOnly){
	db.refresh();
    }
    $(document).trigger('fullyLoaded');
}

function loadUser(){
    var params = getURLParams();
    if(params.uid){
	db.loadUser(params.uid);
    }
}

function getURLParams() {
    var params = {}
    var m = window.location.href.match(/[\\?&]([^=]+)=([^&#]*)/g)
	if (m) {
	    for (var i = 0; i < m.length; i++) {
		var a = m[i].match(/.([^=]+)=(.*)/)
		params[unescapeURL(a[1])] = unescapeURL(a[2])
	    }
	}
    return params;
}

function unescapeURL(s) {
    return decodeURIComponent(s.replace(/\+/g, "%20"));
}


// record where inconsistencies occur
// change the internal data to update and bring everythign consistent
//      
//
function checkConsistent(serverSchedule, serverUnscheduled, serverSlots, serverTransactions){
    // Compare schedule first
    // Assume same keys on day/time/room exist always, so any inconsistency is in content

    var scheduleChange = [];
    var unscheduledChange = [];

    var consistent = true;
    
    // check if there are new transactions
    for(var i = 0; i < serverTransactions.length; i++){
	if(parseInt(serverTransactions[i]['id']) > 
	   parseInt(transactions[transactions.length -1]['id'])){
	    consistent = false;
	    transactions.push(serverTransactions[i]);
	}
    }

    // TODO: inefficient version.. can just use the records
    // handle differences below
    for(var day in schedule){
	for(var time in schedule[day]){
	    for(var room in schedule[day][time]){
		if(!arraysEqual(keys(schedule[day][time][room]).sort(), 
				keys(serverSchedule[day][time][room]).sort())){
		    consistent = false;
		    
		    // update content of slot
		    clearSlot(day, time, room);
		    for(var s in serverSchedule[day][time][room]){
			addSessionToSlot(allSessions[s], day, time, room, "");
		    }
		    // trigger the change here
		    $(document).trigger('slotChange', [day, time, room]);

		}else{
		    // get rid of key where same
		    delete serverSchedule[day][time][room];
		}
	    }
	}
    }

    // Check for changes to locks
    for(var day in scheduleSlots){
	for(var time in scheduleSlots[day]){
	    for(var room in scheduleSlots[day][time]){
		if(scheduleSlots[day][time][room]['locked'] !=
		   serverSlots[day][time][room]['locked']){
		    toggleSlotLock(day, time, room);
		    // trigger the change here
		    $(document).trigger('lockChange', [day, time, room]);
		}
	    }
	}
    }

    if(!arraysEqual(keys(unscheduled).sort(),  keys(serverUnscheduled).sort())){
	// get what's different... 
	// what's added
	// what's removed
	consistent = false;
	
	// make change to unscheduled data
	unscheduled = {};
	for(var s in serverUnscheduled){
	    unscheduled[s] = allSessions[s];
	}

	// trigger a change in unscheduled data
	$(document).trigger('unscheduledChange');
    }
    
    return { isConsistent: consistent,
	    scheduleChange: serverSchedule,
	    unscheduledChange: serverUnscheduled
	    };
}


function getAllSessions(){
    var sessions = {};
    for(var day in schedule){
	for(var time in schedule[day]){
	    for(var room in schedule[day][time]){
		for(var session in schedule[day][time][room]){
		    sessions[session] = schedule[day][time][room][session];
		}
	    }
	}
    }
    // get unscheduled sessions too
    for(var session in unscheduled){
	sessions[session] = unscheduled[session];
    }
    return sessions;
}

function randomizeSchedule(){
    var sk = keys(allSessions);
    var tmp, current, top = sk.length;
    //    output = "";
    if(top) while(--top) {
	    current = Math.floor(Math.random() * (top + 1));
	    tmp = sk[current];
	    sk[current] = sk[top];
	    sk[top] = tmp;
	    swapSessions(allSessions[sk[current]], allSessions[sk[top]]);
	    //output += "swapping " + sk[current] + " with " + sk[top] + "\n";
	    //    output += "swapping " + sk[current] + " with " + sk[top] + "\n";
	}
    //    return output;
}

// Pre-processing to fill a data structure noting a list of conflicts
// among any two sessions
function initializeAuthorConflictsAmongSessions(){
    var authorConflicts = null;
    if(allSessions == null){
	allSessions = getAllSessions();
    }
    sessionKeys = keys(allSessions);
    // initialize all conflicts to 0
    for(var i = 0; i < sessionKeys.length; i++){
	var s1 = sessionKeys[i];
	authorConflictsAmongSessions[s1] = {};
	for(var j = 0; j < sessionKeys.length; j++){
	    var s2 = sessionKeys[j];
	    authorConflictsAmongSessions[s1][s2] = [];
	}
    }    

    // add conflicts
    for(var i  = 0; i < sessionKeys.length; i++){
	var s1 = sessionKeys[i];
	for(var j = i+1; j < sessionKeys.length; j++){
	    var s2 = sessionKeys[j];
	    var authorConflicts = computeAuthorConflicts(allSessions[s1], allSessions[s2]);
	    authorConflictsAmongSessions[s1][s2] = authorConflicts;
	    authorConflictsAmongSessions[s2][s1] = authorConflicts;
	}
    }
}

// Pre-processing to fill a data structure noting a list of conflicts
// among any two sessions
function initializePersonaConflictsAmongSessions(){
    var personaConflicts = null;
    if(allSessions == null){
	allSessions = getAllSessions();
    }
    sessionKeys = keys(allSessions);
    // initialize all conflicts to 0
    for(var i = 0; i < sessionKeys.length; i++){
	var s1 = sessionKeys[i];
	personaConflictsAmongSessions[s1] = {};
	for(var j = 0; j < sessionKeys.length; j++){
	    var s2 = sessionKeys[j];
	    personaConflictsAmongSessions[s1][s2] = [];
	}
    }    

    // add conflicts
    for(var i  = 0; i < sessionKeys.length; i++){
	var s1 = sessionKeys[i];
	for(var j = i+1; j < sessionKeys.length; j++){
	    var s2 = sessionKeys[j];
	    var personaConflicts = computePersonaConflicts(allSessions[s1], allSessions[s2]);
	    personaConflictsAmongSessions[s1][s2] = personaConflicts;
	    personaConflictsAmongSessions[s2][s1] = personaConflicts;
	}
    }
}

// Computes a score for every possible session that s can swap with
// TODO: may want to limit to not be able to swap to certain places (e.g., special sessions, etc.), 
//       so may need a filtered list of possible swap locations
function proposeSwap(s) {
    // how many conflicts are caused by the offending item
    var conflictsCausedByItem = calculateConflictsCausedBy(s);
    var swapValue = [];

    // for each item, compute: 
    // 1. number of conflicts caused by moving offending item to there
    // 2. number of conflicts mitigated by removing offeding item from there
    // 3. number of conflicts caused by moving item there to offending location
  
    
    // calculate number of conflicts caused by moving item into another row
    var conflictsWithRow = {};
    
    for(var day in schedule){
	conflictsWithRow[day] = {}
	for(var time in schedule[day]){
	    if(day == s.date && time == s.time) {
		// todo: assume that nothing changes in terms of constraints
		for(var room in schedule[day][time]){
		    for(var s2 in schedule[day][time][room]){
			swapValue.push(new swapDetails(new slot(day, time, room, s2),
						       0,
						       null,
						       null,
						       null,
						       null));
		    }
		}
		continue;
	    }

	    conflictsWithRow[day][time] = {};
	    conflictsWithRow[day][time]["sum"] = [];
	    conflictsWithRow[day][time]["session"] = {};
	    
	    for(var room in schedule[day][time]){
		// in case there are multiple sessions in a room, shouldn't be
		for(var s2 in schedule[day][time][room]){
		    var conflicts = authorConflictsAmongSessions[s.id][s2];
		    conflicts.concat(personaConflictsAmongSessions[s.id][s2]);
		    conflictsWithRow[day][time]["session"][s2] = conflicts;
		    conflictsWithRow[day][time]["sum"] = conflictsWithRow[day][time]["sum"].concat(conflicts);
		}
	    }
	    
	    for(var room in schedule[day][time]){
		// in case there are multiple sessions in a room, shouldn't be
		for(var s2 in schedule[day][time][room]){
		    
		    // 1. number of conflicts caused by moving offending item to there
		    var conflictsCausedByOffending = [];
		    for(var i = 0; i < conflictsWithRow[day][time]["sum"].length; i++){
			var item = conflictsWithRow[day][time]["sum"][i];
			if(conflictsWithRow[day][time]["session"][s2].indexOf(item) == -1){
			    conflictsCausedByOffending.push(item);
			}
		    }

		    // 2. number of conflicts mitigated by removing offending item from there
		    var conflictsCausedByCandidate = calculateConflictsCausedBy(allSessions[s2]);
		            
		    // 3. number of conflicts caused by moving item there to offending location
		    var conflictsCausedByCandidateAtOffending = [];
		    for(var rs in schedule[s.date][s.time]){
			if(rs == s.room) continue;
			
			for(var sk in schedule[s.date][s.time][rs]){
			    conflictsCausedByCandidateAtOffending = conflictsCausedByCandidateAtOffending.concat(authorConflictsAmongSessions[sk][s2]);
			    conflictsCausedByCandidateAtOffending = conflictsCausedByCandidateAtOffending.concat(personaConflictsAmongSessions[sk][s2]);
			}
		    }
		    
		    // 4. number of conflicts mitigated by moving offending items away
		    // numConflictsCausedByItem 
        
		    var conflictsResolved = conflictsCausedByCandidate.length + 
			conflictsCausedByItem.length - 
			conflictsCausedByOffending.length - 
			conflictsCausedByCandidateAtOffending.length;
		    swapValue.push(new swapDetails(new slot(allSessions[s2].date, allSessions[s2].time, allSessions[s2].room, s2),
						   conflictsResolved,
						   conflictsCausedByCandidateAtOffending,
						   conflictsCausedByOffending,
						   conflictsCausedByItem,
						   conflictsCausedByCandidate
						   ));
		}
	    }
	}
    }
    
    return swapValue;
    
}

// Computes a score for every possible session that s can move into
// TODO: can currently only schedule to an empty slot
function proposeSlot(s) {
    var moveValue = [];

    // for each item, compute: 
    // number of conflicts caused by moving offending item to there (empty slot)
    
    // calculate number of conflicts caused by moving item into another row
    var conflictsWithRow = {};
    
    for(var day in schedule){
	conflictsWithRow[day] = {}
	for(var time in schedule[day]){
	    //    if(day == s.date && time == s.time) continue;
	    conflictsWithRow[day][time] = {};
	    conflictsWithRow[day][time]["sum"] = [];
	    conflictsWithRow[day][time]["session"] = {};
	    
	    for(var room in schedule[day][time]){
		// in case there are multiple sessions in a room, shouldn't be
		for(var s2 in schedule[day][time][room]){
		    var conflicts = authorConflictsAmongSessions[s.id][s2];
		    conflicts.concat(personaConflictsAmongSessions[s.id][s2]);
		    conflictsWithRow[day][time]["session"][s2] = conflicts;
		    conflictsWithRow[day][time]["sum"] = conflictsWithRow[day][time]["sum"].concat(conflicts);
		}
	    }
	    
	    for(var room in schedule[day][time]){
		// only consider rooms that are empty
		if(keys(schedule[day][time][room]).length != 0) continue;

		var conflictsCausedByOffending = conflictsWithRow[day][time]["sum"];
		var conflictsResolved = -conflictsCausedByOffending.length;		
		if(s.id in unscheduled){
		    // 1. number of conflicts caused by moving offending item to there
		    moveValue.push(new swapDetails(new slot(day, time, room, null),
						   conflictsResolved,
						   null,
						   conflictsCausedByOffending,
						   null,
						   null));
		}else{ // session is already scheduled
		    // TODO: if same date and time, just different room, so assuming no change

		    if(s.date == day && s.time == time){
			moveValue.push(new swapDetails(new slot(day, time, room, null),
						       0,
						       null,
						       null,
						       null,
						       null));
		    }else{ // different day/time, consider conflicts removed by moving offending  
			var conflictsCausedByItem = calculateConflictsCausedBy(s);
			conflictsResolved += conflictsCausedByItem.length;
			moveValue.push(new swapDetails(new slot(day, time, room, null),
						       conflictsResolved,
						       null,
						       conflictsCausedByOffending,
						       conflictsCausedByItem,
						       null
						       ));
		    }
		}
	    }
	}
    }
    return moveValue;
}

function proposeSlotAndSwap(s){
    // todo: only works for already scheduled sessions 
    var slotValue = proposeSlot(s);
    var swapValue = proposeSwap(s);
    return {slotValue: slotValue,
	    swapValue: swapValue};
}

function proposeSessionForSlot(day, time, room){
    var scheduleValue = proposeScheduledSessionForSlot(day,time,room);
    var unscheduleValue = proposeUnscheduledSessionForSlot(day,time,room);
    return {scheduleValue: scheduleValue,
	    unscheduleValue: unscheduleValue};
}

// Computes a score for every possible unschedule session that can move into slot
// TODO: can also think about moving scheduled session here...
function proposeUnscheduledSessionForSlot(day, time, room) {
    // ASSUME: day time room points to a currently unscheduled slot
    if(keys(schedule[day][time][room]).length != 0){
		alert("There is already a session scheduled here.");
		return;
    }

    var moveValue = [];
    var conflictsWithSession = {};

    for(var s in unscheduled){
	conflictsWithSession[s] = [];
	// what conflicts does the session have with other sessions at this day and time
	for(var r2 in schedule[day][time]){
	    // in case there are multiple sessions in a room, shouldn't be
	    for(var s2 in schedule[day][time][r2]){
			var conflicts = authorConflictsAmongSessions[s][s2];
			conflictsWithSession[s] = conflictsWithSession[s].concat(conflicts);
	    }
	}
	
	moveValue.push(new swapDetails(new slot(null, null, null, s),
				       -conflictsWithSession[s].length,
				       null,
				       conflictsWithSession[s],
				       null,
				       null));
    }
    return moveValue;
}

// Computes a score for every possible schedule session that can move into slot
function proposeScheduledSessionForSlot(sdate, stime, sroom) {
      var swapValue = [];

      // for each item, compute: 
      // 2. number of conflicts mitigated by removing offending item from there
      // 3. number of conflicts caused by moving item there to offending location
      
      for(var day in schedule){
	  for(var time in schedule[day]){
	      if(day == sdate && time == stime) {
		  // todo: assume that nothing changes in terms of constraints
		  for(var room in schedule[day][time]){
		      for(var s2 in schedule[day][time][room]){
			  swapValue.push(new swapDetails(new slot(day, time, room, s2),
							 0,
							 null,
							 null,
							 null,
							 null));
		      }
		  }
		  continue;
	      }
	      
	      for(var room in schedule[day][time]){
		  // in case there are multiple sessions in a room, shouldn't be
		  for(var s2 in schedule[day][time][room]){
		      
		      // 2. number of conflicts mitigated by removing offending item from there
		      var conflictsCausedByCandidate = calculateConflictsCausedBy(allSessions[s2]);
		            
		      // 3. number of conflicts caused by moving item there to offending location
		      var conflictsCausedByCandidateAtOffending = [];
		      for(var rs in schedule[sdate][stime]){
			  if(rs == sroom) continue;
			  
			  for(var sk in schedule[sdate][stime][rs]){
			      conflictsCausedByCandidateAtOffending = conflictsCausedByCandidateAtOffending.concat(authorConflictsAmongSessions[sk][s2]);
			      conflictsCausedByCandidateAtOffending = conflictsCausedByCandidateAtOffending.concat(personaConflictsAmongSessions[sk][s2]);
			  }
		      }
		      
		      // 4. number of conflicts mitigated by moving offending items away
		      // numConflictsCausedByItem 
		      
		      var conflictsResolved = conflictsCausedByCandidate.length - 
			  conflictsCausedByCandidateAtOffending.length;
		    swapValue.push(new swapDetails(new slot(allSessions[s2].date, allSessions[s2].time, allSessions[s2].room, s2),
						   conflictsResolved,
						   conflictsCausedByCandidateAtOffending,
						   null,
						   null,
						   conflictsCausedByCandidate
						   ));
		}
	    }
	}
    }
    
    return swapValue;
}


function calculateConflictsCausedBy(s){

    var conflicts = [];
    // todo: add an error check if s is empty
      
    // assume conflicts already initialized
    // assume allRooms initialized

    // look for conflicts at same date and time
    var day = s.date;
    var time = s.time;
    
    for(var room in schedule[day][time]){
	// in case there are multiple sessions in a room, shouldn't be
	for(var s2 in schedule[day][time][room]){
	    if(allSessions[s2] != s){
		var authorConflicts = computeAuthorConflicts(s, allSessions[s2]);
		var personaConflicts = computePersonaConflicts(s, allSessions[s2]); 
		// write into conflicts at day, time, room
		conflicts = conflicts.concat(authorConflicts);
		conflicts = conflicts.concat(personaConflicts);
	    }
	}
    }
    return conflicts;
}


// Computes a score for every possible session that s can swap with
// TODO: may want to limit to not be able to swap to certain places (e.g., special sessions, etc.), 
//       so may need a filtered list of possible swap locations
function proposeSwapValues(s) {
    // how many conflicts are caused by the offending item
    var numConflictsCausedByItem = calculateNumConflictsCausedBy(s);
    var swapValue = {};

    // for each item, compute: 
    // 1. number of conflicts caused by moving offending item to there
    // 2. number of conflicts mitigated by removing offeding item from there
    // 3. number of conflicts caused by moving item there to offending location
  
    
    // calculate number of conflicts caused by moving item into another row
    var conflictsWithRow = {};
    
    for(var day in schedule){
	conflictsWithRow[day] = {}
	for(var time in schedule[day]){
	    if(day == s.date && time == s.time) continue;
	    conflictsWithRow[day][time] = {};
	    conflictsWithRow[day][time]["sum"] = 0;
	    conflictsWithRow[day][time]["session"] = {};
	    
	    for(var room in schedule[day][time]){
		// in case there are multiple sessions in a room, shouldn't be
		for(var s2 in schedule[day][time][room]){
		    var numConflicts = authorConflictsAmongSessions[s.id][s2].length + 
			personaConflictsAmongSessions[s.id][s2].length;
		    conflictsWithRow[day][time]["session"][s2] = numConflicts;
		    conflictsWithRow[day][time]["sum"] += numConflicts;
		}
	    }
	    
	    for(var room in schedule[day][time]){
		// in case there are multiple sessions in a room, shouldn't be
		for(var s2 in schedule[day][time][room]){
		    
		    // 1. number of conflicts caused by moving offending item to there
		    var numConflictsCausedByOffending = conflictsWithRow[day][time]["sum"] - 
			conflictsWithRow[day][time]["session"][s2];
		    
		    // 2. number of conflicts mitigated by removing offending item from there
		    var numConflictsCausedByCandidate = calculateNumConflictsCausedBy(allSessions[s2]);
		            
		    // 3. number of conflicts caused by moving item there to offending location
		    var numConflictsCausedByCandidateAtOffending = 0;
		    for(var rs in schedule[s.date][s.time]){
			if(rs == s.room) continue;
			
			for(var sk in schedule[s.date][s.time][rs]){
			    numConflictsCausedByCandidateAtOffending += authorConflictsAmongSessions[sk][s2].length;
			    numConflictsCausedByCandidateAtOffending += personaConflictsAmongSessions[sk][s2].length;
			}
		    }
		    
		    // 4. number of conflicts mitigated by moving offending items away
		    // numConflictsCausedByItem 
        
		    var conflictsResolved = numConflictsCausedByCandidate + 
			numConflictsCausedByItem - 
			numConflictsCausedByOffending - 
			numConflictsCausedByCandidateAtOffending;
		    swapValue[s2] = conflictsResolved;
		}
	    }
	}
    }
    
    return swapValue;

}

function calculateNumConflictsCausedBy(s){

    var numConflicts = 0;
    // todo: add an error check if s is empty
      
    // assume conflicts already initialized
    // assume allRooms initialized

    // look for conflicts at same date and time
    var day = s.date;
    var time = s.time;
    
    for(var room in schedule[day][time]){
	// in case there are multiple sessions in a room, shouldn't be
	for(var s2 in schedule[day][time][room]){
	    if(allSessions[s2] != s){
		var authorConflicts = computeAuthorConflicts(s, allSessions[s2]);
		var personaConflicts = computePersonaConflicts(s, allSessions[s2]); 
		// write into conflicts at day, time, room
		numConflicts += authorConflicts.length;
		numConflicts += personaConflicts.length;
	    }
	}
    }
    return numConflicts;
}

function getAllConflicts(){
    var conflicts = {}
    // assume conflicts already initialized
    // assume allRooms initialized
    conflicts["datetime"] = {};
    conflicts["sessions"] = {};
    for(var session in allSessions){
	conflicts["sessions"][session] = [];
    }

    for(var day in schedule){
	conflicts["datetime"][day] = {}
	for(var time in schedule[day]){
	    conflicts["datetime"][day][time] = [];
	    var roomKeys = keys(schedule[day][time]);
	    for(var i = 0; i < roomKeys.length; i++){
		// in case there are multiple sessions in a room, shouldn't be
		for(var s1 in schedule[day][time][roomKeys[i]]){
		    for(var j = i+1; j < roomKeys.length; j++){
			// in case there are multiple sessions in a room, shouldn't be
			for(var s2 in schedule[day][time][roomKeys[j]]){
			    // no author should be in two rooms at once
			    			    
			    var authorConflicts = computeAuthorConflicts(allSessions[s1], allSessions[s2]);
			    var personaConflicts = computePersonaConflicts(allSessions[s1], allSessions[s2]); 
			
			    // write into conflicts at day, time, room
			    if(authorConflicts.length > 0){
				conflicts["datetime"][day][time] = 
				    conflicts["datetime"][day][time].concat(authorConflicts);
				conflicts["sessions"][s1] = conflicts["sessions"][s1].concat(authorConflicts);
				conflicts["sessions"][s2] = conflicts["sessions"][s2].concat(authorConflicts);
			    }
			    if(personaConflicts.length > 0){
				conflicts["datetime"][day][time] = 
				    conflicts["datetime"][day][time].concat(personaConflicts);
				conflicts["sessions"][s1] = conflicts["sessions"][s1].concat(personaConflicts);
				conflicts["sessions"][s2] = conflicts["sessions"][s2].concat(personaConflicts);
			    }
			}
		    }
		}
	    }
	}
    }
    conflictsByTime = conflicts["datetime"];
    conflictsBySession = conflicts["sessions"];
    //    return conflicts;
}

function isEmpty(map) {
    for(var key in map) {
	if (map.hasOwnProperty(key)) {
	    return false;
	}
	return true;
    }
}

function getSessionAuthors(s){
    var authors = {};
    for(var submission in s["submissions"]){
	for(var author in s["submissions"][submission]["authors"]){
	    if(!(author in authors)){
		authors[author] = 1;
	    }else{
		authors[author] += 1;
	    }
	}
    }
    return authors;
}

function getSessionPersonas(s){
    return s["personas"];
}

function userInfo(id, name, email, type){
    this.id = id;
    this.name = name;
    this.email = email;
    this.type = type;
}

function swapDetails(target, value, addedSrc, addedDest, removedSrc, removedDest){
    this.target = target;
    this.value = value;
    this.addedSrc = addedSrc;
    this.addedDest = addedDest;
    this.removedSrc = removedSrc;
    this.removedDest = removedDest;
}

function slot(date, time, room, session){
    this.date = date;
    this.time = time;
    this.room = room;
    this.session = session;
}

function conflictObject(entities, type, conflict, description){
    this.entities = entities;
    this.conflict = conflict;
    this.type = type;
    this.description = description;
}

function computeAuthorConflicts(s1, s2){
    var conflicts = [];
    var s1authors = getSessionAuthors(s1);
    var s2authors = getSessionAuthors(s2);
  
    for(var s1author in s1authors){
	for(var s2author in s2authors){
	    if(s1author == s2author){
		conflicts.push(new conflictObject([s1.id, s2.id], 
						  "authorInTwoSessions", 
						  s1author, 
						  s1author + " is in both '" + s1.title + 
						  "' and '" + s2.title + "'\n"));
	    }
	}
    }
    return conflicts;
}

function computePersonaConflicts(s1, s2){
    var conflicts = [];
    var s1personas = getSessionPersonas(s1);
    var s2personas = getSessionPersonas(s2);
  
    for(var s1persona in s1personas){
	for(var s2persona in s2personas){
	    if(s1persona == s2persona){
		conflicts.push(new conflictObject([s1.id, s2.id], 
						  "personaInTwoSessions", 
						  personaHash[s1persona],
						  "Someone interested in " + personaHash[s1persona] + " may want to see both '" + s1.title + 
						  "' and '" + s2.title + "'"));
	    }
	}
    }
    return conflicts;
}



function getAllRooms(){
    var rooms = {};
    var index = 0;
    for(var day in schedule){
	for(var time in schedule[day]){
	    for(var room in schedule[day][time]){
		if(room in rooms){
		}else{
		    rooms[room] = index;
		    index++;
		}
	    }
	}
    }
    return rooms;
}





// Attach persona information to the JSON data structure
function attachPersonas(){
    // assume have allSessions
    for(var s in allSessions){
	allSessions[s]["personas"] = {};
	for(var submission in allSessions[s]["submissions"]){
	    allSessions[s]["submissions"][submission]["personas"] = {};
	    for(var persona in personas){
		if(personas[persona].indexOf(submission) != -1){
		    allSessions[s]["personas"][persona] = true;
		    allSessions[s]["submissions"][submission]["personas"][persona] = true;
		}
	    }
	}
    }
}

//Reads the program into a schedule matrix (timeslots x rooms) and prints out a table
     function makeProgram(){
	 var scheduleMatrix = [];
	 var rooms = allRooms;
	 var numRooms = keys(rooms).length;
	 
	 var days = keys(schedule).sort(function(a,b) {
		 return parseInt(a.split(' ')[1]) - parseInt(b.split(' ')[1])
	     });
	 for(var i = 0; i < days.length; i++) {
	     var day = days[i];
	     for(var time in schedule[day]){
		 var scheduleAtTime = [day, time];
		 for(var j = 0; j < numRooms; j++){
		     scheduleAtTime.push("");
		 }   
		 for(var room in schedule[day][time]){
		     if(keys(schedule[day][time][room]).length == 0){
			 scheduleAtTime[rooms[room]+2] = -1;
		     }else{
			 for(var ses in schedule[day][time][room]){
			     scheduleAtTime[rooms[room]+2] = schedule[day][time][room][ses];
			 }
		     }
		 }
		 scheduleMatrix.push(scheduleAtTime);
	     }
	 }
	 return scheduleMatrix;
     }

     function displayProgram(sm){
	 var table = document.createElement('table');
	 
	 var orderedRooms = keys(allRooms).sort(function(a,b) { return allRooms[a] - allRooms[b];});
	 
	 var header = document.createElement('tr');
	 // leave one empty for 1st column
	 var firstcell = document.createElement('td');
	 $(header).append(firstcell);
	 for(var i = 0; i < orderedRooms.length; i++){
	     var cell = document.createElement('td');
	     $(cell).append(orderedRooms[i]);
	     $(header).append(cell);
	 }
	 $(table).append(header);

	 for(var i = 0; i < sm.length; i++){
	     var row = document.createElement('tr');

	     // add the conflicts
	     var conflict = document.createElement('td');
	     $(conflict).append(conflictsByTime[sm[i][0]][sm[i][1]].map(function(co) {return co.description}).join("<br/><br/>"));

	     $(row).append(conflict);
	

	     var slot = document.createElement('td');
	     $(slot).append(sm[i][0] + ", " + sm[i][1]);
	     $(row).append(slot);
	     
	     for(var j = 2; j < sm[i].length; j++){
		 var cell = document.createElement('td');
		 if(sm[i][j] != ""){
		     $(cell).append(sm[i][j].title);
		 }
		 $(row).append(cell);
	     }
	     $(table).append(row);
	 }
	 $('#program').append(table);
     }

