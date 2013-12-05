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
    getChairs(connection, sessions);
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

function getChairs(connection, sessions){
    connection.query('SELECT * from sessionChairs', function(err, rows, fields) {
	if (err) throw err;
	writeSessions(sessions, rows);
	connection.end();
    });
}




function getAuthors(ent){
    var authors = ent['authors'];
    if(ent.id == "tochi100") {
	var authors = 	[
            {name:"Chinmay Kulkarni"},
	    {name:"Koh Pang Wei"},
            {name:"Huy Le"},
            {name:"Daniel Chia"},
            {name:"Kathryn Papadopoulos"},
            {name:"Justin Cheng"},
            {name:"Daphne Koller"},
            {name:"Scott Klemmer"},
	];
	return authors;
    }

    if(ent.id in frenzyPapers){
	authors = frenzyPapers[ent.id]['authors'];
	return authors.map(function (x) { x.name = x.name.trim(); return x});
    }else{
	return JSON.parse(authors).map(function(x) { return {'name': resolveName(x)}});
    }
}

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

function getTitle(ent){
    if(ent.id in frenzyPapers)
	return frenzyPapers[ent.id]['title'];
    return ent['title'];
}

function getSubtype(ent){
    if(ent.id == "tochi100") return "tochi";
    return ent['subtype'];
}

function writeEntities(entities){
    var output = {};
    for(var e in entities){
	var ent = entities[e];
	output[ent.id] = {
	    "title" : getTitle(ent),
	    "abstract" : getAbstract(ent),
	    "keywords" : JSON.parse(ent['coreCommunities']).join(", "),
	    "authors" : getAuthors(ent),
	    "type": ent.subtype,
	    "subtype": getSubtype(ent),
	    "bestPaperAward": ent.bestPaperAward,
	    "bestPaperNominee": ent.bestPaperNominee
	}
//	if(ent.id == "tochi100") console.log(output[ent.id]);
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
	{'8.45': 'morning1',
	 '10.45': 'morning2',
	 '14': 'afternoon1',
	 '15.45': 'afternoon2',
	 '17': 'afternoon3',
	 '9': 'morning1',
	 '16.45' : 'afternoon3',
	 '18' :'evening1',
	 '19' : 'evening2'
	};

    return classHash[time];
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
    var timeSlot = {'slot_id' : getId(schedule[0].date + ' ' + schedule[0].time),
		    'time' : schedule[0].time,
		    'slot_class' : getTimeClass(schedule[0].time),
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
	    timeSlot = {'slot_id' : getId(schedule[i].date + ' ' + schedule[i].time),
			'time' : schedule[i].time,
			'slot_class' : getTimeClass(schedule[i].time),	
			'sessions' : []
		   };
	}else if(schedule[i].time != timeSlot.time){
	    slots.push(timeSlot);
	    timeSlot = {'slot_id' : getId(schedule[i].date + ' ' + schedule[i].time),
			'time' : schedule[i].time,
			'slot_class' : getTimeClass(schedule[i].time),	
			'sessions' : []
		       };
	}
	timeSlot.sessions.push({
	    'session' : schedule[i].id,
//	    'room' : schedule[i].room
	});
    }
    slots.push(timeSlot);
    DD.slots = slots;
    SD.push(DD);
    fs.writeFile(SCHEDULEFILE, 'schedule='+JSON.stringify(SD, null, 4), function(err) {});
}
    
function getSubmissions(subs){
    var submissions = subs.split(',');
    if(submissions.length == 1 && submissions[0] == "") return [];
    else return submissions
}

function lookupChair(session, chairs){
    if(session.chairs == "") return "";
    var match = chairs.filter(function (x) {return  x.authorId == session.chairs });

    return resolveName(match[0]);
}

function writeSessions(sessions, chairs){
    var output = {};
    for(var s in sessions){
	var ses = sessions[s];
	output[ses.id] = {
	    "s_title": ses.title,
//	    "room": ses.room,
	    "time": ses.time,
	    "submissions": getSubmissions(ses.submissions),
	    "personas": ses.personas,
	    "venue": ses.venue,
	    "day": ses.date,
	    "s_tags": JSON.parse(ses.coreCommunities),
	    "type": ses.venue,
	    "hasAward": ses.hasAward,
	    "hasHonorableMention": ses.hasHonorableMention,
	    "subtype": ses.venue,
	    "chair": lookupChair(ses, chairs)
	}
    }
    fs.writeFile(SESSIONFILE, 'sessions='+JSON.stringify(output, null, 4), function(err) {});
}
