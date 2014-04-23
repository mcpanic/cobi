var fs = require('fs');
var csv = require('csv');
var ENTITYFILE = "papers.json";
var SESSIONFILE = "sessions.json";
var SCHEDULEFILE = "schedule.json";

var DATABASE_NAME = 'cobiAAAS2014';

var makeScheduleCSV = true;
var sessionIgnore = [];


var mysql      = require('mysql');
var connection = mysql.createConnection({
    host     : 'mysql.csail.mit.edu',
    user     : 'cobi',
    password : 'su4Biha',
    database : DATABASE_NAME
});

var keynotes = [];
var keynoteEntity = null;
var sessions = null;
var sessionOutput = null;
var schedule = null;
var entity = null;

writeOutputs();

function writeOutputs(){
    connection.connect();
    connection.query("set names 'latin1'", function(err, rows, fields){ 
	if(err) throw err;
	
	connection.query('SELECT * from session where scheduled=1', function(err, rows, fields) {
	    if (err) throw err;
	    sessions = rows;
	    getChairs(connection, sessions);
	});
    });
}

function getEntities(connection){
    connection.end();
    var connection2 = mysql.createConnection({
	host     : 'mysql.csail.mit.edu',
	user     : 'cobi',
	password : 'su4Biha',
	database : DATABASE_NAME
    });
    connection2.query("set names 'latin1'", function(err, rows, fields){ 
	if(err) throw err;
	
	connection2.query("SELECT * from entity", function(err, rows, fields) {
	    if (err) throw err;
	    entities = rows;
	    writeEntities(entities);
	    getSchedule(connection2);
	});
    })
}

function getSchedule(connection){
    connection.query("SELECT * from schedule where id<>''", function(err, rows, fields) {
	if (err) throw err;
	schedule = rows;
	writeSchedule(schedule);
	connection.end();
    });
}

function getChairs(connection, sessions){
    connection.query('SELECT * from sessionChairs', function(err, rows, fields) {
	if (err) throw err;
	writeSessions(sessions, rows);
	getEntities(connection);
    });
}


function getAuthors(ent){
    var authors = ent['authors'];
    return JSON.parse(authors).map(function(x) { return {
	'name': resolveName(x),
	'dept': (('primary' in x) ? x['primary']['dept'] : ''),
	'institution': (('primary' in x) ? x['primary']['institution'] : ''),
	'city' : (('primary' in x) ? x['primary']['city'] : ''),
	'country' :(('primary' in x) ? x['primary']['country'] : ''),
	'affiliation' : (('primary' in x) ? 
			 getAffiliation(x['primary']['dept'], x['primary']['institution']) : ""),
	'location' : (('primary' in x) ? 
			 getLocation(x['primary']['city'], x['primary']['country']) : "")
    }});
}

function getCombined(a, b){

    if((a == "" || (typeof a === 'undefined')) && (b == "" || (typeof b === 'undefined'))) return "";
    if((a == "" || (typeof a === 'undefined'))) return b;
    if((b == "" || (typeof b === 'undefined'))) return a;
    return a + ", " + b;
}

function getAffiliation(dept, inst){
    return getCombined(dept, inst);
}

function getLocation(city, country){
    return getCombined(city, country);
}

function resolveName(x){
    if(!('middleInitial' in x) || x.middleInitial == "" ){
	return x.givenName + " " + x.familyName;
    }else{
	return x.givenName + " " + x.middleInitial[0] +  " " + x.familyName;
    }
}

function getAbstract(ent){
    return ent['abstract'].replace(/\\  /g,"").replace(/\\ /g, "").replace(/\\/g,"")
}

function getTitle(ent){
    return ent['title'];
}

function getType(ent){
    return ent['type'];
}

function getKeywords(ent){
    if(ent['keywords'] == null) return [];

    ent['keywords'] = ent['keywords'].replace(/\"/g,"");

    if(ent['keywords'].indexOf("; ") != -1){
	return ent['keywords'].split("; ").map(function(x){return x.trim()});
    }
    if(ent['keywords'].indexOf(", ") != -1){
	return ent['keywords'].split(", ").map(function(x){return x.trim()});
    }
    return [];
}

function getCommunities(ent){
    return JSON.parse(ent['coreCommunities']);
}

function getSubtype(ent){
    if(ent['type'] == 'paper') return ent['subtype']
    return ent['type'];
}

function getCB(ent){
    return ent['cAndB'].replace(/\\  /g,"").replace(/\\ /g, "").replace(/\\/g,"")    
}

function writeEntities(entities){
    var output = {};
    for(var e in entities){
	var ent = entities[e];
	output[ent.id] = {
	    "title" : getTitle(ent),
	    "abstract" : getAbstract(ent),
	    "cAndB" : getCB(ent),
	    "keywords" : getKeywords(ent),//JSON.parse(ent['coreCommunities']).join(", "),
	    "authors" : getAuthors(ent),
	    "type": getType(ent),
	    "subtype": getSubtype(ent),
	    "award": ent.bestPaperAward==1,
            "hm": ent.bestPaperNominee==1
	}
    }
    fs.writeFile(ENTITYFILE, 'entities='+JSON.stringify(output, null, 4), function(err) {});
}

function getId(s){
    s = s.replace(/ /g, "_");
    s = s.replace(/:/g, "_");
    s = s.replace(/-/g, "_");
    s = s.replace(/,/g, "_");
    s = s.replace(/\./g, "_");
    return s;
}

function getTimeClass(t){
    var time = parseFloat((t.split('-'))[0].replace(':', '.'));
    var classHash = 
	{'9': 'morning1',
	 '11': 'morning2',
	 '14': 'afternoon1',
	 '16': 'afternoon2',
	};
    return classHash[time];
}

function writeSchedule(schedule){
    var output = [];
    var dateIndex = ['Monday','Tuesday','Wednesday','Thursday'];

    var roomIndex = ["718A","718B","701A","701B","801A","801B","803AB","716A","716B","714AB","717AB","802AB","715A","715B","713AB","707","709","711","Plenary", "Exhibit Hall"];
    
    var dates = ["April 28th, 2014", "April 29th, 2014", "April 30th, 2014", "May 1st, 2014"];
    
    schedule.sort(function (a,b){
	var dateA = (a.date.split(','))[0];
	var dateB = (b.date.split(','))[0];

	if(dateA != dateB){
	    return dateIndex.indexOf(dateA) - 
		dateIndex.indexOf(dateB);
	}else{ // same date
	    var timeA = parseFloat((a.time.split('-'))[0].replace(':', '.'));
	    var timeB = parseFloat((b.time.split('-'))[0].replace(':', '.'));
	    if(timeA != timeB){ // not same time
		return timeA - timeB;
	    }else{
		return roomIndex.indexOf(a.room) - roomIndex.indexOf(b.room);
	    }
	}
    });

    var SD = [];
    var DD = {"date":  dates[dateIndex.indexOf(schedule[0].date)],
	      "day" : (schedule[0].date.split(','))[0]
	     }
    var slots = [];
    var timeSlot = {'slot_id' : getId(schedule[0].date + ' ' + schedule[0].time),
		    'time' : schedule[0].time.replace('-', ' - '),
		    'slot_class' : getTimeClass(schedule[0].time),
		    'sessions' : []
		   };
    
    for(var i = 0; i < schedule.length; i++){
	if(dates[dateIndex.indexOf(schedule[i].date)] != DD.date){
	    slots.push(timeSlot);
	    DD.slots = slots;
	    SD.push(DD);
	    
	    DD = {"date": dates[dateIndex.indexOf(schedule[i].date)],// schedule[i].date,
		  "day" : (schedule[i].date.split(','))[0]
		 }
	    slots = [];
	    timeSlot = {'slot_id' : getId(schedule[i].date + ' ' + schedule[i].time),
			'time' : schedule[i].time.replace('-', ' - '),
			'slot_class' : getTimeClass(schedule[i].time),	
			'sessions' : []
		       };
	}else if(schedule[i].time.replace('-', ' - ') != timeSlot.time){
	    slots.push(timeSlot);
	    timeSlot = {'slot_id' : getId(schedule[i].date + ' ' + schedule[i].time),
			'time' : schedule[i].time.replace('-', ' - '),
			'slot_class' : getTimeClass(schedule[i].time),	
			'sessions' : []
		       };
	}
	timeSlot.sessions.push({
	    'session' : schedule[i].id,
	    'room' : schedule[i].room
	});
    }
    
    slots.push(timeSlot);
    DD.slots = slots;
    SD.push(DD);



    fs.writeFile(SCHEDULEFILE, 'schedule='+JSON.stringify(SD, null, 4), function(err) {});
}



function insertScheduleSlot(slot, sch){
    for(var i = 0; i < sch.length; i++){
	if(sch[i].day == slot.day){
	    for(var j = 0; j < sch[i].slots.length; j++){
		if(sch[i].slots[j].slot_id == slot.slot.slot_id){
		    sch[i].slots[j].sessions.unshift(slot.slot.sessions[0]);
		    return;
		}
	    }
	    // create a new timeslot
	    if(slot.slot.slot_class.indexOf("morning") >= 0)
		sch[i].slots.unshift(slot.slot);
	    else if(slot.slot.slot_class.indexOf("afternoon1") >= 0){
		// insert before afternoon
		for(var z = 0; z < sch[i].slots.length; z++){
		    if(sch[i].slots[z].slot_class.indexOf("afternoon1") >= 0){
			sch[i].slots.splice(z, 0, slot.slot)
			break;
		    }
		}
	    } else sch[i].slots.push(slot.slot);
	    return;
	}
    }
}

function getSubmissions(ses){
    var subs = ses.submissions;
    var submissions = subs.split(',');
    if(submissions.length == 1 && submissions[0] == "") return [];
    else return submissions
}

function lookupChair(session, chairs){
    if(session.chairs == "") return "";
    // ASSUME ONE CHAIR
    session.chairs = session.chairs.split(',')[0]
    var match = chairs.filter(function (x) {return  x.authorId == session.chairs });
    return resolveName(match[0]);
}

function writeSessions(sessions, chairs){
    var output = {};
    for(var s in sessions){
	if(sessionIgnore.indexOf(sessions[s].id) >= 0) continue;
	var ses = sessions[s];
	output[ses.id] = {
	    "s_title": ses.title,
	    "room": ses.room,
	    "time": ses.time,
	    "submissions": getSubmissions(ses),
	    "personas": ses.personas,
	    "venue": ses.venue,
	    "day": ses.date,
	    "s_tags": JSON.parse(ses.coreCommunities),
	    "type": ses.venue,
	    "hasAward": ses.hasAward==1,
	    "hasHonorableMention": ses.hasHonorableMention==1,
	    "subtype": ses.venue,
	    "chair": lookupChair(ses, chairs)
	}
    }


    sessionOutput = output;
    fs.writeFile(SESSIONFILE, 'sessions='+JSON.stringify(output, null, 4), function(err) {});
}
