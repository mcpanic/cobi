var allRooms = null;
var allSessions = null;
var authorConflictsAmongSessions = {};
var personaConflictsAmongSessions = {};
var conflictsByTime = null;
var conflictsBySession = null;
var unscheduled = null;
var schedule = null;
///////functions for interacting with the DB ///////////

// Read data from the server
function loadSchedule(){
    // load scheduled sessions
   $.ajax({
	   async: false,
	    type: 'GET',
		url: "./php/loadDBtoJSON.php",
	       success: function(m){
	       //  alert(JSON.stringify(m));
	       schedule = m['schedule'];
	       unscheduled = m['unscheduled'];
	   },
	       error : function(m){
	       alert(JSON.stringify(m));
	   },
	       dataType: "json"
	       });
}

// Unschedule a session
function unscheduleSession(s){
    // todo: doesn't deal with endTime
    var sdate = s.date;
    var stime = s.time;
    var sroom = s.room;

    // unschedule on frontend
    delete schedule[sdate][stime][sroom][s.id];
    allSessions[s.id]['date'] = "";
    allSessions[s.id]['time'] = "";
    allSessions[s.id]['room'] = "";
    allSessions[s.id]['endTime'] = "";
    unscheduled[s.id] = s;

    // unschedule on server
        $.ajax({
 	    async: false,
		type: 'POST',
		data: { type: 'unschedule', 
			id: s.id,
			date: sdate,
			time: stime,
			room: sroom
			}, 
		url: "./php/changeSchedule.php",
		success: function(m){
		
 	    },
		error : function(m){
		alert(JSON.stringify(m));
	    },
		dataType: "json"
		 });

}

// schedule a session
function scheduleSession(s, sdate, stime, sroom, sendTime){
    // schedule on frontend
    //    alert(JSON.stringify(schedule[sdate][stime][sroom]));
    //    alert(JSON.stringify(s));
    schedule[sdate][stime][sroom][s.id] = s;
    s['date'] = sdate;
    s['time'] = stime;
    s['room'] = sroom;
    // todo doesn't deal with endTime
    s['endTime'] = sendTime;

    // schedule on server
        $.ajax({
 	    async: false,
		type: 'POST',
		data: { type: 'schedule', 
			id: s.id,
			date: sdate,
			time: stime,
			room: sroom,
			endTime: s.endTime}, 
		url: "./php/changeSchedule.php",
		success: function(m){
		
 	    },
		error : function(m){
		alert(JSON.stringify(m));
	    },
		dataType: "json"
		 });
}


// Swaps two sessions into the original schedule data structure
function swapSessions(s1, s2){
    var s1date = s1.date;
    var s1time = s1.time;
    var s1room = s1.room;
    var s2date = s2.date;
    var s2time = s2.time;
    var s2room = s2.room;
    
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
        $.ajax({
 	    async: false,
		type: 'POST',
		data: { type: 'swap', 
			s1id: s1.id,
			s1date: s1date,
			s1time: s1time,
			s1room: s1room,
			s2id: s2.id,
			s2date: s2date,
			s2time: s2time,
			s2room: s2room
			}, 
		url: "./php/changeSchedule.php",
		success: function(m){
		
 	    },
		error : function(m){
		alert(JSON.stringify(m));
	    },
		dataType: "json"
		 });


    //    alert(JSON.stringify(schedule[s1date][s1time][s1room]));
    //    alert(JSON.stringify(schedule[s2date][s2time][s2room]));
}


///////end functions for interacting with DB////////////

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

// Populates all of the above variables and attaches personas
function initialize(){
    loadSchedule();
    allRooms = getAllRooms();
    allSessions = getAllSessions();
    attachPersonas();  // loads personas from a file into schedule JSON

    initializeAuthorConflictsAmongSessions(); // this can be loaded from a file
    initializePersonaConflictsAmongSessions(); // this can be loaded from a file
  
    getAllConflicts();
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
		    swapValue[s2] = new swapDetails(conflictsResolved,
						    conflictsCausedByCandidateAtOffending,
						    conflictsCausedByOffending,
						    conflictsCausedByCandidate,
						    conflictsCausedByItem);
		}
	    }
	}
    }
    
    return swapValue;

}

function swapDetails(value, addedSrc, addedDest, removedSrc, removedDest){
    this.value = value;
    this.addedSrc = addedSrc;
    this.addedDest = addedDest;
    this.removedSrc = removedSrc;
    this.removedDest = removedDest;
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


function conflictObject(entities, type, description){
    this.entities = entities;
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
		conflicts.push(new conflictObject([s1.id, s2.id], "authorInTwoSessions", 
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
		conflicts.push(new conflictObject([s1.id, s2.id], "personaInTwoSessions", 
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
		     for(var ses in schedule[day][time][room]){
			 scheduleAtTime[rooms[room]+2] = schedule[day][time][room][ses];
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

