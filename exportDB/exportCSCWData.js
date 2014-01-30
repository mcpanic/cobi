var fs = require('fs');

var ENTITYFILE = "papers.json";
var SESSIONFILE = "sessions.json";
var SCHEDULEFILE = "schedule.json";

var frenzyPapers = require('./anant-papers.json');
var newTitles = require('./cscwTitles.json');
var newChairs = require('./newChairs.json');

var mysql      = require('mysql');
var connection = mysql.createConnection({
    host     : 'mysql.csail.mit.edu',
    user     : 'cobi',
    password : 'su4Biha',
    database : 'cobi'
});


var facebook = {
    "FB" : {"name": "Facebook Happy Hour",
	    "day": "Monday, Feb 17th"}
}

var facebookMonday = {
            "slot_id": "Monday__Feb_17th_20_00_22_00",
            "time": "20:00-22:00",
            "slot_class": "evening2",
            "sessions": [
		{ "session": "FB" }
	    ]
}



// special sessions
var workshops = {
    "W1" : {"name": "W1: Sharing, Re-use and Circulation of Resources in Cooperative Scientific Work",
	    "day": "Saturday, Feb 15th"},
    "W2" : {"name": "W2: Structures for Knowledge Co-creation Between Organisations and the Public",
	    "day": "Saturday, Feb 15th"},
    "W3" : {"name": "W3: Designing with Users for Domestic Environments: Methods - Challenges - Lessons Learned",
	    "day": "Saturday, Feb 15th"},
    "W4" : {"name": "W4: Cross-Cultural Studies of Collaborative Systems: Making Methodological Advances as a Community",
	    "day": "Saturday, Feb 15th"},
    "W5" : {"name": "W5: Designing Futures for Peer-to-Peer Learning @ CSCW",
	    "day": "Saturday, Feb 15th"},
    "W6" : {"name": "W6: Back to the Future of Organizational Work: Crowdsourcing and Digital Work Marketplaces",
	    "day": "Sunday, Feb 16th"},
    "W7" : {"name": "W7: Co-creating & Identity-making in CSCW: Revisiting Ethics in Design Research",
	    "day": "Sunday, Feb 16th"},
    "W8" : {"name": "W8: Quick and Dirty: Lightweight Methods for Heavyweight Research",
	    "day": "Sunday, Feb 16th"},
    "W9" : {"name": "W9: The Fourteenth International Workshop on Collaborative Editing Systems",
	    "day": "Sunday, Feb 16th"},
    "W10" :{"name": "W10: Collaboration and Coordination in the Context of Informal Care (CCCiC 2014)",
	    "day": "Saturday, Feb 15th"},
    "W11" :{"name": "W11: Global Software Development in a CSCW Perspective",
	    "day": "Sunday, Feb 16th"},
    "W12" :{"name": "W12: Feminism and Social Media Research",
	    "day": "Sunday, Feb 16th"},
    "W13" :{"name": "W13: Designing for Interactive Arts and Performance Collaboration",
	    "day": "Sunday, Feb 16th"},
    "W14" :{"name": "W14: OCData Hackathon: Online Communities Data Hackathon",
	    "day": "Saturday, Feb 15th"},
    "WD"  :{"name": "Doctoral Colloquium",
	    "day": "Sunday, Feb 16th"}
};

var satWorkshops = {
    "date": "Saturday, Feb 15th",
    "day": "Saturday",
    "slots": [
        {
            "slot_id": "Saturday__Feb_15th_all_day",
            "time": "all-day",
            "slot_class": "all-day",
            "sessions": [
		{ "session": "W1" },
		{ "session": "W2" },
		{ "session": "W3" },
		{ "session": "W4" },
		{ "session": "W5" },
		{ "session": "W10" },
		{ "session": "W14" }
	    ]
	}
    ]
};

var sunWorkshops = {
    "date": "Sunday, Feb 16th",
    "day": "Sunday",
    "slots": [
        {
            "slot_id": "Sunday__Feb_16th_all_day",
            "time": "all-day",
            "slot_class": "all-day",
            "sessions": [
		{ "session": "W6" },
		{ "session": "W7" },
		{ "session": "W8" },
		{ "session": "W9" },
		{ "session": "W11" },
		{ "session": "W12" },
		{ "session": "W13" },
		{ "session": "WD" }
	    ]
	}
    ]
};


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
    if(ent.id in newTitles) 
	return newTitles[ent.id]

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
	    "award": ent.bestPaperAward==1,
	    "hm": ent.bestPaperNominee==1
	}
//	if(ent.id == "tochi100") console.log(output[ent.id]);
    }

    // special entities
    output['next1'] =  {
	"title" : "Coworking: A sociotechnical approach to ameliorating the problems with distributed working",
	"abstract" : "",
	"keywords" : "",
	"authors" : [
	    {
		"name": "Toni Ferro"
	    }
	],
	"type": "CSCWhat's Next",
	"subtype": "CSCWhat's Next",
	"award": false,
	"hm": false
    }

    output['next2'] =  {
	"title" : "Counting & Coordinating: How people track their personal finances",
	"abstract" : "",
	"keywords" : "",
	"authors" : [
	    {
		"name": "Jofish Kaye"
	    }
	],
	"type": "CSCWhat's Next",
	"subtype": "CSCWhat's Next",
	"award": false,
	"hm": false
    }

    output['next3'] =  {
	"title" : "Schema-mediated idea generation: Innovating with crowds",
	"abstract" : "",
	"keywords" : "",
	"authors" : [
	    {
		"name": "Lixiu Yu",
	    }
	],
	"type": "CSCWhat's Next",
	"subtype": "CSCWhat's Next",
	"award": false,
	"hm": false
    }


    output['impact'] =  {
	"title" : "CSCW Lasting Impact Award: Jonathan Grudin",
	"abstract" : "The first CSCW Lasting Impact Award recognizes Jonathan Grudin's groundbreaking 1988 paper \"Why CSCW applications fail: Problems in the design and evaluation of organizational interfaces.\" This paper epitomizes the goals of CSCW, surfacing hidden social dynamics, revealing their impact, and, ultimately, turning those insights into design principles for new systems. For example, because the benefits of using a system are often unequal among the required participants, it has to be designed to appeal to participants who have the least to gain.\n Irene Greif will present the award in a short formal part of the session, where we'll also hear from Jonathan on how he came to write the paper, and Tom Finholt on what the data shows about the impact of the paper.\n To bring the concepts up to date, we are assembling a panel that will look at current trends and technologies in the context of the cost/benefit trade-off. Why do people keep up their Facebook pages religiously, but still fail to update \"skills\" lists on internal work-related sites? Does the cost/benefit balance predict the extremely low completion rates of MOOCs? While many people scoff at using extrinsic rewards though gamification, do they make perfect sense when some people will get little to no intrinsic rewards? Bring your own favorite examples, as we'll welcome audience participation!\n Irene Greif, Award Presenter and Moderator\n Jonathan Grudin, Microsoft Research, Award Winner\n Thomas Finholt, University of Michigan, Impact Analysis",
	"keywords" : "",
	"authors" : [
	    {
		"name": "Jonathan Grudin"
	    }
	],
	"type": "special",
	"subtype": "special",
	"award": false,
	"hm": false
    }

    output['opening'] =  {
	"title" : "Opening Keynote: Mary Flanagan",
	"abstract" : "Mary Flanagan (@criticlaplay) -- founder of the Tiltfactor research lab as well as an artist, writer, and scholar -- will share recent research on how games can influence and change attitudes, opinions, and behaviors. Flanagan expands the boundaries of medium, discipline, and genre across writing, visual arts, computer science, psychology, and design to innovate in these fields with a critical play-centered approach. She is interested in collaboration, social impact, and creating paradigms for productive social interaction based on our inherent capacity for play-- while highlighting and prioritizing human values in the design of new technologies and systems.\n As an artist, her collection of over 20 major works range from game-inspired systems to computer viruses, embodied interfaces to interactive texts; these works are exhibited internationally. As a scholar interested in how human values are in play across technologies and systems, Flanagan has written more than 20 critical essays and chapters on games, empathy, gender and digital representation, art and technology, and responsible design. Her recent books include Critical Play (2009, MIT Press) and Values at Play in Digital Games with Helen Nissenbaum (2014, MIT Press). Flanagan’s work has been supported by grants and commissions including The British Arts Council, the National Endowment for the Humanities, the Robert Wood Johnson Foundation, the ACLS, and the National Science Foundation. Flanagan is the Sherman Fairchild Distinguished Professor in Digital Humanities at Dartmouth College.",
	"keywords" : "",
	"authors" : [
	    {
		"name": "Mary Flanagan"
	    }
	],
	"type": "special",
	"subtype": "special",
	"award": false,
	"hm": false
    }

    output['closing'] =  {
	"title" : "Next Generation Humanitarian Computing",
	"abstract" : "Humanitarian organizations are completely unprepared to deal with the rise of Big (Crisis) Data--the massive overflow of user-generated content posted on social media during disasters. To be sure, humanitarian organizations have no expertise in advanced computing. At the same time, the overflow of information during disasters can be as paralyzing to humanitarian response as the absence of information. This talk will highlight how the computing community can make a significant difference in humanitarian response. To demonstrate this, the talk will explain how we are experimenting with human and machine computing to make sense of--and verify--Big Crisis Data. For example, we can automatically extract crisis information from Twitter by combining microtasking with machine learning. This would enable UN information management officers to create their own classifiers on the fly. In terms of verification, we can draw on techniques from time-critical crowdsourcing to rapidly collect and triangulate evidence during disasters. This would allow emergency managers to quickly debunk rumors in the immediate aftermath of a crisis. In conclusion, the talk will outline how we can actively bridge the gap between humanitarian and computing communities.\n Patrick Meier (PhD) is an internationally recognized thought leader on the application of new technologies for humanitarian response. He presently serves as Director of Social Innovation at the Qatar Foundation’s Computing Research Institute (QCRI) where he and his team use Advanced Computing to develop Next Generation Humanitarian Technologies. Patrick is also a UNICEF Humanitarian Innovations Fellow, a Rockefeller Foundation and PopTech Fellow, and a Fellow at Harvard University where he previously co-directed the Harvard Humanitarian Initiative's Program on Crisis Mapping. His influential blog iRevolution has received well over 1 million hits and been cited by the New York Times, UK Guardian, Slate, Wired, Scientific American and New Scientist, amongst others. Patrick tweets at @patrickmeier.",
	"keywords" : "",
	"authors" : [
	    {
		"name": "Patrick Meier"
	    }
	],
	"type": "special",
	"subtype": "special",
	"award": false,
	"hm": false
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
	    if(DD.date == "Monday, Feb 17th"){
		DD.slots.push(facebookMonday);
	    }
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

	    if(timeSlot.slot_id == "Tuesday__Feb_18th_10_45_12_00"){
		timeSlot.sessions.unshift({"session":"next",
					   //				   "room" : "GB5"
					  });
	    }


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
    SD.unshift(satWorkshops, sunWorkshops);

    // add facebook thing...

    fs.writeFile(SCHEDULEFILE, 'schedule='+JSON.stringify(SD, null, 4), function(err) {});
}
    
function getSubmissions(ses){
    if(ses.id == "s221") return ["impact"];    
    if(ses.id == "s220") return ["opening"];    
    if(ses.id == "s225") return ["closing"];    

    var subs = ses.submissions;
    var submissions = subs.split(',');
    if(submissions.length == 1 && submissions[0] == "") return [];
    else return submissions
}

function lookupChair(session, chairs){
    if(session.id in newChairs) return newChairs[session.id]
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
	    "submissions": getSubmissions(ses),
	    "personas": ses.personas,
	    "venue": ses.venue,
	    "day": ses.date,
	    "s_tags": JSON.parse(ses.coreCommunities),
	    "type": ses.venue,
//	    "hasAward": ses.hasAward,
//	    "hasHonorableMention": ses.hasHonorableMention,
	    "subtype": ses.venue,
	    "chair": lookupChair(ses, chairs)
	}
    }

    for(var w in workshops){
	output[w] = {
	    "s_title": workshops[w].name,
	    //	    "room": ses.room,
	    "time": "all-day",
	    "submissions": [],
	    "personas": "",
	    "venue": "workshop",
	    "day": workshops[w].day,
	    "s_tags": [],
	    "type": "workshop",
	    "subtype": "workshop",
	    "chair": ""
	}
    }

    // special next session
    output["next"] = {
	"s_title": "CSCWhat's Next",
	//	    "room": "GB5",
        "time": "10:45-12:00",
	"submissions": ['next1','next2','next3'],
	"personas": "",
	"venue": "CSCWhat's Next",
        "day": "Tuesday, Feb 18th",
	"s_tags": [],
	"type": "CSCWhat's Next",
	"subtype": "CSCWhat's Next",
	"chair": "Mark Handel, Susan Wyche"
    }

    output["FB"] = {
	"s_title": facebook["FB"].name,
	//	    "room": "TBD",
        "time": "20:00-22:00",
	"submissions": [],
	"personas": "",
	"venue": "special",
        "day": "Monday, Feb 17th",
	"s_tags": [],
	"type": "special",
	"subtype": "special",
	"chair": ""
    }

    fs.writeFile(SESSIONFILE, 'sessions='+JSON.stringify(output, null, 4), function(err) {});
}
