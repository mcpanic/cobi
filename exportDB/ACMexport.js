var fs = require('fs');
var csv = require('csv');
var ENTITYFILE = "papers.json";
var SESSIONFILE = "sessions.json";
var SCHEDULEFILE = "schedule.json";

var makeScheduleCSV = true;
var sessionIgnore = []//['s-crs115R-1', 's-crs115R-2'];

// var extraChairs = {
//     "s-alt1" : "Daniela Rosner",
//     "s-alt2" : "Barry Brown",
//     "s-alt3" : "Silvia Lindtner",
//     "s-alt4" : "Morgan Ames",
//     "s-alt6" : "Lilly Irani",
//     "s-alt5" : "Conor Linehan"
// }

var mysql      = require('mysql');
var connection = mysql.createConnection({
    host     : 'mysql.csail.mit.edu',
    user     : 'cobi',
    password : 'su4Biha',
    database : 'cobiCHI2014'
});

var keynotes = [];
var keynoteEntity = null;
var sessions = null;
var sessionOutput = null;
var schedule = null;
var entity = null;

var caseStudyEntity = {
    "caseDiscuss": {
        "title": "Questions & Answers and Discussion",
        "abstract": "The last 20 minutes of this session will be used for questions and answers, as well as discussions, for all three of the case studies which were presented.",
        "cAndB": "",
        "keywords": [],
        "authors": [],
        "type": "casestudy",
        "subtype": "casestudy"
    },
}

var previewSchedule = [
    {
	"day": "Monday",
	"slot": {
            "slot_id": "Monday_7_30_8_30",
            "time": "7:30 - 8:30",
            "slot_class": "morning1",
            "sessions": [
		{
                    "session": "s-preview-1",
                    "room" : "801AB"
		}
	    ]
	}
    },
    {
	"day": "Tuesday",
	"slot": {
            "slot_id": "Tuesday_7_00_8_20",
            "time": "7:00 - 8:20",
            "slot_class": "morning1",
            "sessions": [
		{
                    "session": "s-preview-2",
                    "room" : "Exhibit Hall G"
		}
	    ]
	}
    },
    {
	"day": "Wednesday",
	"slot": {
            "slot_id": "Wednesday_7_00_8_20",
            "time": "7:00 - 8:20",
            "slot_class": "morning1",
            "sessions": [
		{
                    "session": "s-preview-3",
                    "room" : "Exhibit Hall G"
		}
	    ]
	}
    },
    {
	"day": "Thursday",
	"slot": {
            "slot_id": "Thursday_7_00_8_20",
            "time": "7:00 - 8:20",
            "slot_class": "morning1",
            "sessions": [
		{
                    "session": "s-preview-4",
                    "room" : "Exhibit Hall G"
		}
	    ]
	}
    },
]

var previewSessions = {
    "s-preview-1": {
        "s_title": "Video Preview",
        "room": "801AB",
        "time": "7:30-8:30",
        "submissions": [
	    'preview-1'
        ],
        "personas": "",
        "venue": "special",
        "day": "Monday",
        "s_tags": [],
        "type": "special",
        "subtype": "special",
        "chair": ""
    },
    "s-preview-2": {
        "s_title": "Video Preview",
        "room": "Exhibit Hall G",
        "time": "7:00-8:20",
        "submissions": [
	    'preview-2'
        ],
        "personas": "",
        "venue": "special",
        "day": "Tuesday",
        "s_tags": [],
        "type": "special",
        "subtype": "special",
        "chair": ""
    },
    "s-preview-3": {
        "s_title": "Video Preview",
        "room": "Exhibit Hall G",
        "time": "7:00-8:20",
        "submissions": [
	    'preview-3'
        ],
        "personas": "",
        "venue": "special",
        "day": "Wednesday",
        "s_tags": [],
        "type": "special",
        "subtype": "special",
        "chair": ""
    },
    "s-preview-4": {
        "s_title": "Video Preview",
        "room": "Exhibit Hall G",
        "time": "7:00-8:20",
        "submissions": [
	    'preview-4'
        ],
        "personas": "",
        "venue": "special",
        "day": "Thursday",
        "s_tags": [],
        "type": "special",
        "subtype": "special",
        "chair": ""
    }
}

var previewEntities = {
    "preview-1": {
        "title": "Video Previews",
        "abstract": "For the early risers! Plan your daily schedule by viewing the 30 second Video Previews for the current day. The video previews for the current day’s Papers and Notes will be played through, in a single, back-to-back, playlist.",
        "cAndB": "",
        "keywords": [
        ],
        "authors": [
        ],
        "type": "special",
        "subtype": "special"
    },
    "preview-2": {
        "title": "Video Previews",
        "abstract": "For the early risers! Plan your daily schedule by viewing the 30 second Video Previews for the current day. The video previews for the current day’s Papers and Notes will be played through, in a single, back-to-back, playlist.",
        "cAndB": "",
        "keywords": [
        ],
        "authors": [
        ],
        "type": "special",
        "subtype": "special"
    },
    "preview-3": {
        "title": "Video Previews",
        "abstract": "For the early risers! Plan your daily schedule by viewing the 30 second Video Previews for the current day. The video previews for the current day’s Papers and Notes will be played through, in a single, back-to-back, playlist.",
        "cAndB": "",
        "keywords": [
        ],
        "authors": [
        ],
        "type": "special",
        "subtype": "special"
    },
    "preview-4": {
        "title": "Video Previews",
        "abstract": "For the early risers! Plan your daily schedule by viewing the 30 second Video Previews for the current day. The video previews for the current day’s Papers and Notes will be played through, in a single, back-to-back, playlist.",
        "cAndB": "",
        "keywords": [
        ],
        "authors": [
        ],
        "type": "special",
        "subtype": "special"
    },
};


var showcaseSchedule = {
    "day": "Tuesday",
    "slot": {
        "slot_id": "Tuesday_17_30_19_00",
        "time": "17:30 - 19:00",
        "slot_class": "evening1",
        "sessions": [
            {
                "session": "s-showcase",
                "room" : "718AB"
            }
	]
    }
}; 

var showcaseSession = {
    "s-showcase": {
        "s_title": "Video Showcase",
        "room": "718AB",
        "time": "17:30-19:00",
        "submissions": [
	    'showcase'
        ],
        "personas": "",
        "venue": "special",
        "day": "Tuesday",
        "s_tags": [],
        "type": "special",
        "subtype": "special",
        "chair": ""
    },
}

var showcaseEntity = {
    "showcase": {
        "title": "Video Showcase",
        "abstract": "Video Showcase features engaging videos that offer a variety of perspectives on human-computer interaction, including novel interfaces, reflective pieces and future envisionments. Come and enjoy the best videos on Tuesday (17:30) followed by the Golden Mouse award ceremony.", 
        "cAndB": "",
        "keywords": [
        ],
        "authors": [
        ],
        "type": "special",
        "subtype": "special"
    },
};

var townhallSchedule =     {
    "day": "Wednesday",
    "slot": {
        "slot_id": "Wednesday_12_20_14_00",
        "time": "12:20 - 14:00",
        "slot_class": "afternoon1",
        "sessions": [
            {
                "session": "s-townhall",
                "room" : "718AB"
            }
	]
    }
};

var townhallSession = {
    "s-townhall": {
        "s_title": "SIGCHI Town Hall Lunch",
        "room": "718AB",
        "time": "12:20-14:00",
        "submissions": [
            "townhall"
        ],
        "personas": "",
        "venue": "special",
        "day": "Wednesday",
        "s_tags": [],
        "type": "special",
        "subtype": "special",
        "chair": ""
    },
}

var townhallEntity = {
    "townhall": {
        "title": "SIGCHI Town Hall Lunch",
        "abstract": "SIGCHI officers present ongoing programs and activities, followed by an audience Q&A session. Participants interested in shaping SIGCHI’s future are encouraged to attend. An informal lunch is available on a first-come, first-served basis.",
        "cAndB": "",
        "keywords": [
        ],
        "authors": [
        ],
        "type": "special",
        "subtype": "special"
    },
}

var keynoteSchedule = [
    {
        "day": "Monday",
        "slot": {
            "slot_id": "Monday_9_00_10_20",
            "time": "9:00 - 10:20",
            "slot_class": "morning1",
            "sessions": [
                {
                    "session": "s-key106",
                    "room" : "Exhibit Hall G"
                }
	    ]
	}
    },
    {
        "day": "Tuesday",
        "slot": {
            "slot_id": "Tuesday_8_30_8_50",
            "time": "8:30 - 8:50",
            "slot_class": "morning1",
            "sessions": [
                {
                    "session": "s-key104",
                    "room" : "Exhibit Hall G"
                }
	    ]
	}
    },
    {
        "day": "Wednesday",
        "slot": {
            "slot_id": "Wednesday_8_30_8_50",
            "time": "8:30 - 8:50",
            "slot_class": "morning1",
            "sessions": [
                {
                    "session": "s-key103",
                    "room" : "Exhibit Hall G"
                }
	    ]
	}
    },
    {
        "day": "Thursday",
        "slot": {
            "slot_id": "Thursday_8_30_8_50",
            "time": "8:30 - 8:50",
            "slot_class": "morning1",
            "sessions": [
                {
                    "session": "s-key102",
                    "room" : "Exhibit Hall G"
                }
	    ]
	}
    },
    {
        "day": "Thursday",
        "slot": {
            "slot_id": "Thursday_16_00_17_20",
            "time": "16:00 - 17:20",
            "slot_class": "afternoon2",
            "sessions": [
                {
                    "session": "s-key100",
                    "room" : "Exhibit Hall G"
                }
	    ]
	}
    }
]

var keynoteSessions = {
    "s-key106": {
        "s_title": "Opening Keynote, Margaret Atwood",
        "room": "Exhibit Hall G",
        "time": "9:00-10:20",
        "submissions": [
            "key106"
        ],
        "personas": "",
        "venue": "keynote",
        "day": "Monday",
        "s_tags": [],
        "type": "keynote",
        "subtype": "keynote",
        "chair": ""
    },
    "s-key104": {
        "s_title": "Provoke! Wisdom! Impact! - Nathan Eagle",
	"room": "Exhibit Hall G",
        "time": "8:30-8:50",
        "submissions": [
            "key104"
        ],
        "personas": "",
        "venue": "plenary",
        "day": "Tuesday",
        "s_tags": [],
        "type": "plenary",
        "subtype": "plenary",
        "chair": ""
    },
    "s-key103": {
        "s_title": "Provoke! Wisdom! Impact! - Scooter Morris",
        "room": "Exhibit Hall G",
        "time": "8:30-8:50",
        "submissions": [
            "key103"
        ],
        "personas": "",
        "venue": "plenary",
        "day": "Wednesday",
        "s_tags": [],
        "type": "plenary",
        "subtype": "plenary",
        "chair": ""
    },
    "s-key102": {
        "s_title": "Provoke! Wisdom! Impact! - Elizabeth F. Churchill",
        "room": "Exhibit Hall G",
        "time": "8:30-8:50",
        "submissions": [
            "key102"
        ],
        "personas": "",
        "venue": "plenary",
        "day": "Thursday",
        "s_tags": [],
        "type": "plenary",
        "subtype": "plenary",
        "chair": ""
    },
   "s-key100": {
       "s_title": "Closing Keynote - Scott Jenson",
       "room": "Exhibit Hall G",
       "time": "16:00-17:20",
       "submissions": [
           "key100"
       ],
       "personas": "",
       "venue": "keynote",
       "day": "Thursday",
       "s_tags": [],
       "type": "keynote",
       "subtype": "keynote",
       "chair": ""
   }
};

getKeynotes();

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
	database : 'cobiCHI2014'
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

function getKeynotes(){
    var parser = csv();
    parser.on("record", function (row, index){
	keynotes.push(row);
    });
    parser.from.options({
	columns: true
    });
    parser.from('keynotes.csv');
    parser.on("end", function(){
	var output = {};
	for(var i = 0; i < keynotes.length; i++){
	    output[keynotes[i]['ID']] = {
		"title" : keynotes[i]['Title'],
		"abstract" : keynotes[i]['Abstract'],
		"cAndB" : "",
		"keywords": [],
		"authors": [
		    {
			"name": keynotes[i]['Given name 1'] + " " + keynotes[i]['Family name 1'],
			"givenName" : keynotes[i]['Given name 1'],
			"familyName" : keynotes[i]['Family name 1'], 
			"dept": keynotes[i]['Primary Affiliation 1 - Department/School/Lab'],
			"institution": keynotes[i]['Primary Affiliation 1 - Institution'],
			"city": keynotes[i]['Primary Affiliation 1 - City'],
			"country": keynotes[i]['Primary Affiliation 1 - Country'],
			"affiliation":  getAffiliation(keynotes[i]['Primary Affiliation 1 - Department/School/Lab'],
						       keynotes[i]['Primary Affiliation 1 - Institution']),
			"location": getLocation(keynotes[i]['Primary Affiliation 1 - City'], keynotes[i]['Primary Affiliation 1 - Country'])
		    }
		]
		
	    };
	}
	keynoteEntity = output;
	writeOutputs();
    });
}
	


function getAuthors(ent){
    var authors = ent['authors'];
    return JSON.parse(authors).map(function(x) { return {
	'name': resolveName(x),
	'givenName' : x.givenName,
	'middleInitial' : x.middleInitial,
	'familyName' : x.familyName,
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
    for(var e in keynoteEntity){
	output[e] = keynoteEntity[e];
    }
    for(var e in townhallEntity){
	output[e] = townhallEntity[e];
    }
    
    for(var e in showcaseEntity){
	output[e] = showcaseEntity[e];
}
for(var e in caseStudyEntity){
 output[e] = caseStudyEntity[e]
}

for(var e in previewEntities){
output[e] = previewEntities[e];
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

    var roomIndex = ["Exhibit Hall G", "701A","701B", "707","709","711", "713AB", "714AB","715A","715B", "716A","716B","717AB","718AB","801A","801B","801AB","802AB", "803AB"]


//    var roomIndex = ["Exhibit Hall G","718A","718B","701A","701B","801A","801B","803AB","716A","716B","714AB","717AB","802AB","715A","715B","713AB","707","709","711"]; //, "Plenary"];
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

    for(var i = 0; i < keynoteSchedule.length; i++){
	insertScheduleSlot(keynoteSchedule[i], SD);
    }
    for(var i = 0; i < previewSchedule.length; i++){
	insertScheduleSlot(previewSchedule[i], SD);
    }

    insertScheduleSlot(townhallSchedule, SD);
    insertScheduleSlot(showcaseSchedule, SD);

    if(makeScheduleCSV){
	generateScheduleCSV(SD, roomIndex, dates)
    }

    fs.writeFile(SCHEDULEFILE, 'schedule='+JSON.stringify(SD, null, 4), function(err) {});
}

function generateScheduleCSV(sch, rooms, dates){
    var table = [];
    var header = ["", ""];

    for(var i = 0; i < rooms.length; i++)
	header.push(rooms[i]);

    table.push(header)
    for(var d = 0; d < sch.length; d++){
	var date = sch[d].day + ", " + sch[d].date;
	for(var s = 0; s < sch[d].slots.length; s++){
	    var time = sch[d].slots[s].time
	    var row = [date, time]
	    for(var r in rooms) row.push("");
	    for(var ss = 0; ss < sch[d].slots[s].sessions.length; ss++){
		var session  = sch[d].slots[s].sessions[ss]
		
		row[rooms.indexOf(session.room) +2] = "[" + sessionOutput[session.session].venue + "] " + session.session + ": " + sessionOutput[session.session].s_title
	    }
	    table.push(row)
	}
    }
    csv().from(table).to('scheduleTable.csv')
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

    for(var s in keynoteSessions){
	output[s] = keynoteSessions[s];
    }
    
    for(var s in previewSessions){
	output[s] = previewSessions[s];
    }
    
    for(var s in townhallSession){
	output[s] = townhallSession[s];
    }
    for(var s in showcaseSession){
	output[s] = showcaseSession[s];
    }
    
//    for(var s in extraChairs){
//	output[s].chair = extraChairs[s]
//    }

    output['s-case-1'].submissions.push('caseDiscuss')
    output['s-case-2'].submissions.push('caseDiscuss')
    output['s-case-3'].submissions.push('caseDiscuss')

    sessionOutput = output;
    fs.writeFile(SESSIONFILE, 'sessions='+JSON.stringify(output, null, 4), function(err) {});
}
