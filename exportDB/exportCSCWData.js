var fs = require('fs');

var ENTITYFILE = "papers.json";
var SESSIONFILE = "sessions.json";
var SCHEDULEFILE = "schedule.json";

var frenzyPapers = require('./anant-papers.json');

var mysql      = require('mysql');
var connection = mysql.createConnection({
    host     : 'mysql.csail.mit.edu',
    user     : 'cobi',
    password : 'su4Biha',
    database : 'cobi'
});

connection.connect();
connection.query('SELECT * from session', function(err, rows, fields) {
    if (err) throw err;
    var sessions = rows;
    writeSessions(sessions);
});
connection.query("SELECT * from schedule where id<>''", function(err, rows, fields) {
    if (err) throw err;
    var schedule = rows;
    writeSchedule(schedule);
});

connection.query("SELECT * from entity", function(err, rows, fields) {
    if (err) throw err;
    var entities = rows;
    writeEntities(entities);
});

connection.end();

function resolveName(x){
    if(!('middleInitial' in x) || x.middleInitial == "" ){
	return x.givenName + " " + x.familyName;
    }else{
	return x.givenName + " " + x.middleInitial[0] +  " " + x.familyName;
    }
}

function getAbstract(ent){
    if(ent.id in frenzyPapers)
	return frenzyPapers[ent.id]['abstract'];
    return ent['abstract'];
}

function writeEntities(entities){
    var output = {};
    for(var e in entities){
	var ent = entities[e];
	output[ent.id] = {
	    "title" : ent.title,
	    "abstract" : getAbstract(ent),
	    "keywords" : JSON.parse(ent['coreCommunities']).join(", "),
	    "authors" : JSON.parse(ent['authors']).map(function(x) { return {'name': resolveName(x)}})
	}
    }
    fs.writeFile(ENTITYFILE, 'entities='+JSON.stringify(output, null, 4), function(err) {});
}


function writeSchedule(schedule){
    var output = [];
    var dateIndex = ['Monday','Tuesday','Wednesday'];
    var roomIndex = ['GB56', 'GB5', 'GB6', 'GB12', 'GB34', 'GB78', 'GB910', 'Dover AB'];

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
    var DD = {"date":  schedule[0].date,
	      "day" : (schedule[0].date.split(','))[0]
	     }
    var slots = [];
    var timeSlot = {'slot_id' : schedule[0].date + ' ' + schedule[0].time,
		    'time' : schedule[0].time,
		    'sessions' : []
		   };
    
    for(var i = 0; i < schedule.length; i++){
	if(schedule[i].date != DD.date){
	    slots.push(timeSlot);
	    DD.slots = slots;
	    SD.push(DD);
	    DD = {"date":  schedule[i].date,
		  "day" : (schedule[i].date.split(','))[0]
		 }
	    slots = [];
	    timeSlot = {'slot_id' : schedule[i].date + ' ' + schedule[i].time,
			'time' : schedule[i].time,
			'sessions' : []
		   };
	}else if(schedule[i].time != timeSlot.time){
	    slots.push(timeSlot);
	    timeSlot = {'slot_id' : schedule[i].date + ' ' +  schedule[i].time,
			'time' : schedule[i].time,
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
    
function writeSessions(sessions){
    var output = {};
    for(var s in sessions){
	var ses = sessions[s];
	output[ses.id] = {
	    "s_title": ses.title,
	    "room": ses.room,
	    "time": ses.time,
	    "submissions": ses.submissions.split(','),
	    "personas": ses.personas,
	    "venue": ses.venue,
	    "day": ses.date,
	    "s_tags": JSON.parse(ses.coreCommunities)
	}
    }
    fs.writeFile(SESSIONFILE, 'sessions='+JSON.stringify(output, null, 4), function(err) {});
}
