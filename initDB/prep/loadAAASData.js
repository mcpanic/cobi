var fs = require('fs');
var IGNORELIST = [];

var CREATEAUTHORFILE = true;
var CREATEENTITYFILE = true;
var CREATESESSIONFILE = true;
var CREATESCHEDULEFILE = true;

var AAAS_PAPERS = require('./CobiPapers.json')
var AAAS_PEOPLE = require('./CobiPeople.json')
var AAAS_ROLES = require('./CobiRoles.json')
var AAAS_SESSIONS = require('./CobiSessions.json')

var AUTHORFILE = "authors.json";
var ENTITYFILE = "entities.json";
var SESSIONFILE = "sessions.json";
var SCHEDULEFILE = "schedule.json";

writeFormattedData();

function writeFormattedData(){
    if(CREATEAUTHORFILE){
	var authors = createAuthorData(AAAS_PEOPLE);
	fs.writeFile("output/" + AUTHORFILE, JSON.stringify(authors, null, 4), function(err) {});
	console.log(VENUE , "....author file created.");
    }
    if(CREATEENTITYFILE){
	var entities = createEntityData(PCSdata, Frenzydata, VENUE);
	fs.writeFile("output/" + ENTITYFILE, JSON.stringify(entities, null, 4), function(err) {});
	console.log(VENUE , "....entity file created.");
    }
    if(CREATESESSIONFILE){
	var sessions = createSessionData(PCSdata, Frenzydata);
	fs.writeFile("output/" + SESSIONFILE, JSON.stringify(sessions, null, 4), function(err) {});
	console.log(VENUE , "....session file created.");
    }
    if(CREATESCHEDULEFILE){
	var schedule = createScheduleData();
	fs.writeFile("output/" + SCHEDULEFILE, JSON.stringify(schedule, null, 4), function(err) {});
	console.log(VENUE , "....schedule file created.");
    }
}	

function loadFrenzyData(data) {
    var sessions = {}; 
    for(var s in data.sessions){
	sessions[s] = data.sessions[s];
    }
    //    sessions.sort(function(a, b) {return a.label > b.label});
    // label from s100
    var count = SESSIONSTART;
    for(var i in sessions){
	sessions[i]["id"] = "s" + count;
	count+=1;
    }
    return sessions;
}

var personaList = [
    'HCI4D',
    'Games',
    'UIST',
    'Health',
    'Making',
    'Social',
    'Methods and Models',
    'Touch',
    'People',
    'Viz',
    'Security',
    'CSCW',
    'Design',
    'Displays',
    'UBI',
    'Systems',
    'Art',
    '3D',
    'Transportation',
    'Web'];
    
var communityList = ['SC_Applications-B',
		     'SC_Applications-V',
		     'SC_Applications-W',
		     'SC_Beyond Individual',
		     'SC_Cap & Mod',
		     'SC_Design-B',
		     'SC_Design-R',
		     'SC_Interaction Techniques',
		     'SC_People-D',
		     'SC_People-V',
		     'SC_Systems & Tools',
		     'SC_TOCHI',
		     'SC_Usability'];

function createPaperSessionData(data){
    var sessions = [];

    // Papers and TOCHI sessions...
    for(var i in data){
	var sessionData = data[i];
	var submissions = sessionData['members'];
	var allLabels = getLabelsForSubs(sessionData, submissions);
	var title = sessionData['label'];
	var persona = "";
	if(title.indexOf(": ") != -1){
	    var parts = sessionData['label'].split(": ");
	    persona = parts[0];
	    title = parts[1];
	}
	var info = sessionLookup(sessionData['id']);
	var session = {
	    "id" : sessionData['id'],
	    "date" : info.date,
	    "time" : info.time,
	    "room" : info.room,
	    "communities" : allLabels.getUnique(),
	    "persona" : persona,
	    "submissions" : sessionData['members'].join(),
	    "title" : title,
	    "venue" : VENUE,
	    "scheduled" : ((info.date == "") ? 0 : 1)
	}
	sessions.push(session);
    }
    return sessions;
}



function createEmptySession(id,title,scheduled){
    return {
	"id" :  id,
	"date" : "",
	"time" : "",
	"room" : ""	,   
	"communities" : [],
	"persona" : "",
	"submissions" : "",
	"title" : title,
	"venue" : VENUE,
	"scheduled" : scheduled
    }
}

function createCaseStudySessionData(PCSdata){
    var sessions = [];
    var numCSsessions = 3;
    for(var i = 1; i <= 3; i++){
	sessions.push(createEmptySession("s-case-" + i, "Case Study Session " + i, 0));
    }
    return sessions;
}

function createPanelSessionData(PCSdata){
    var sessions = [];
    for(var i = 0; i < PCSdata.length; i++){
	var sub = PCSdata[i];
	var sid = "";
	for(var s in assignments.panelAssigns){
	    if(assignments.panelAssigns[s].submissions == sub["ID"]) {
		sid = "s-" + s;
		break;
	    }
	}
	var info = sessionLookup(sid);
	var session = {
	    "id" : sid,
	    "date" : info.date,
	    "time" : info.time,
	    "room" : info.room,
	    "communities" : [],
	    "persona" : "",
	    "submissions" : sub["ID"],
	    "title" : ((sub["Title"].indexOf("[NOT SUBMITTED]") == 0) ?
		       sub["Title"].substring(16) : sub["Title"]),
	    "venue" : VENUE,
	    "scheduled" : ((info.date == "") ? 0 : 1)
	}
	sessions.push(session);
    }
    return sessions;
}


function createSIGSessionData(PCSdata){
    var sessions = [];
    for(var i = 0; i < PCSdata.length; i++){
	var sub = PCSdata[i];
	var info = sessionLookup("s-" + sub['ID']);
	var session = {
	    "id" : "s-" + sub["ID"], 
	    "date" : info.date,
	    "time" : info.time,
	    "room" : info.room,
	    "communities" : [],
	    "persona" : "",
	    "submissions" : sub["ID"],
	    "title" : ((sub["Title"].indexOf("[NOT SUBMITTED]") == 0) ?
		       sub["Title"].substring(16) : sub["Title"]),
	    "venue" : VENUE,
	    "scheduled" : ((info.date == "") ? 0 : 1)
	}
	sessions.push(session);
    }
    return sessions;
}

function createCourseSessionData(PCSdata){
    var sessions = [];
    for(var i = 0; i < PCSdata.length; i++){
	var sub = PCSdata[i];
	var matches = roomAssignments.filter(function(x) {
	    return (x.id.indexOf('s-' + sub['ID']) == 0)});
	
	for(var j = 0; j < matches.length; j++){
	    var info = matches[j];
	    var session = {
		"id" : info.id,
		"date" : info.date,
		"time" : info.time,
		"room" : info.room,
		"communities" : [],
		"persona" : "",
		"submissions" : sub["ID"],
		"title" : ((sub["Title"].indexOf("[NOT SUBMITTED]") == 0) ?
			   (sub["Title"].substring(16) + " (" + (j+1) + "/" + matches.length +")") :
			   (sub["Title"] + " (" + (j+1) + "/" + matches.length +")")),
		"venue" : VENUE,
		"scheduled" : ((info.date == "") ? 0 : 1)
	    }
	    sessions.push(session);
	}
    }
    return sessions;
}

function createAltchiSessionData(PCSdata){
    var sessions = [];
    for(var s in assignments.altchiAssigns){
	var sid = "s-" + s;
	var info = sessionLookup(sid);
	var session = {
	    "id" : sid,
	    "date" : info.date,
	    "time" : info.time,
	    "room" : info.room,
	    "communities" : [],
	    "persona" : "",
	    "submissions" : assignments.altchiAssigns[s].submissions,
	    "title" : assignments.altchiAssigns[s].title,
	    "venue" : VENUE,
	    "scheduled" : ((info.date == "") ? 0 : 1)
	}
	sessions.push(session);
    }
    return sessions;
}

function createSessionData(PCSdata, data){
    if(VENUE == "paper" || VENUE == "TOCHI")
	return createPaperSessionData(data)

    if(VENUE == "casestudy")
	return createCaseStudySessionData(PCSdata)
    
    if(VENUE == "SIG")
	return createSIGSessionData(PCSdata)
    
    if(VENUE == "course")
	return createCourseSessionData(PCSdata)

    if(VENUE == "panel")
	return createPanelSessionData(PCSdata)

    if(VENUE == "altchi")
	return createAltchiSessionData(PCSdata)
}

function mode(array)
{
    if(array.length == 0)
	return null;
    var modeMap = {};
    var maxEl = array[0], maxCount = 1;
    for(var i = 0; i < array.length; i++)
    {
	var el = array[i];
	if(modeMap[el] == null)
	    modeMap[el] = 1;
	else
	    modeMap[el]++;
	if(modeMap[el] > maxCount)
	{
	    maxEl = el;
	    maxCount = modeMap[el];
	}
    }
    return maxEl;
}

function createScheduleData(){
    var schedule = [];
    var rooms = ["718A","718B","701A","701B","801A","801B","803AB","716A","716B","714AB","717AB","802AB","715A","715B","713AB","707","709","711","Plenary"];

    var slots = [//{"date":"Monday", "time": "9:00-10:20"},
		 {"date":"Monday", "time": "11:00-12:20"},
		 {"date":"Monday", "time": "14:00-15:20"},
		 {"date":"Monday", "time": "16:00-17:20"},
		 {"date":"Tuesday", "time": "9:00-10:20"},
		 {"date":"Tuesday", "time": "11:00-12:20"},
		 {"date":"Tuesday", "time": "14:00-15:20"},
		 {"date":"Tuesday", "time": "16:00-17:20"},
		 {"date":"Wednesday", "time": "9:00-10:20"},
		 {"date":"Wednesday", "time": "11:00-12:20"},
		 {"date":"Wednesday", "time": "14:00-15:20"},
		 {"date":"Wednesday", "time": "16:00-17:20"},
		 {"date":"Thursday", "time": "9:00-10:20"},
		 {"date":"Thursday", "time": "11:00-12:20"},
		 {"date":"Thursday", "time": "14:00-15:20"},
		 //{"date":"Thursday", "time": "16:00-17:20"}
    ];
    
    var slotId = 100; 
    for(var i = 0; i < rooms.length; i++){
	for(var j = 0; j < slots.length; j++){
	    var slot = { 
		"id" : "slot" + slotId,
		"date" : slots[j].date,
		"time" : slots[j].time,
		"room" : rooms[i],
		"sessionId" : assignmentLookup(slots[j].date, slots[j].time, rooms[i])
	    };
	    slotId+=1;
	    schedule.push(slot);
	}
    }
    return schedule;
}

function sessionLookup(id){
    var results = roomAssignments.filter(function(x){return x.id == id});
    if(results.length == 1){
	return results[0];
    }
    return {
	"date": "",
	"time": "",
	"room": ""
    }
}

function assignmentLookup(date, time, room){
    var results = roomAssignments.filter(function(x) 
			   { return (x.date == date && 
				     x.time == time && 
				     x.room == room)});
    if(results.length > 1){
	console.log("multiple results in same room???");
	console.log(date , time , room)
	console.log(results[0]);
	console.log(results[1]);
	return results[0].id; //""
    }
    if(results.length == 1){
	return results[0].id;
    }
    return "";
}

function createAuthors(sub, venue){
    var authors = [];
    var numAuthors = sub["Author list"].split(",").length;
    for (var i = 1; i <= numAuthors; i++){    
	// create record for this author of this submission	
	var author = {
	    "authorId" : "auth" + createAuth(sub["Author ID " + i]),
	    "type" : "author",
	    "id" : sub["ID"],
	    "venue" : venue,
	    "rank" : i,
	    "givenName" : ((venue == "TOCHI" || venue == "keynote") ? sub["Given name " + i] : sub["Author given first name " + i]),	
	    "middleInitial" : ((venue == "TOCHI" || venue == "keynote") ? sub["Middle initial " + i] : sub["Middle initial or name " + i]),
	    "familyName" : ((venue == "TOCHI" || venue == "keynote") ? sub["Family name " + i] : sub["Author last/family name " + i]),
	    "email" : ((venue == "TOCHI" || venue == "keynote") ? sub["Email " + i] : sub["Valid email address " + i]),
	    "role" : "",
	    "primary" : { 
		"dept" : ((venue == 'casestudy' || venue == 'SIG' || venue == 'course' || venue == 'panel') ? sub["Primary Affiliation (no labs or depts names in this field) " + i + " - Department/School/Lab"] 
			  : sub["Primary Affiliation " + i + " - Department/School/Lab"]),
		"institution" : ((venue == 'casestudy' || venue == 'SIG' || venue == 'course' || venue == 'panel') ? sub["Primary Affiliation (no labs or depts names in this field) " + i + " - Institution"] 
				 : sub["Primary Affiliation " + i + " - Institution"]),
		"city" : ((venue == 'casestudy' || venue == 'SIG' || venue == 'course' || venue == 'panel') ? sub["Primary Affiliation (no labs or depts names in this field) " + i + " - City"] 
				 : sub["Primary Affiliation " + i + " - City"]),
		"country" : ((venue == 'casestudy' || venue == 'SIG' || venue == 'course' || venue == 'panel') ? sub["Primary Affiliation (no labs or depts names in this field) " + i + " - Country"] 
				 : sub["Primary Affiliation " + i + " - Country"]),
	    },
	    "secondary" :  { 
		"dept" : ((venue == 'casestudy' || venue == 'SIG' || venue == 'course' || venue == 'panel') ? sub["Secondary Affiliation (optional) (no labs or depts names in this field) " + i + " - Department/School/Lab"] 
			  : sub["Secondary Affiliation (optional) " + i + " - Department/School/Lab"]),
		"institution" : ((venue == 'casestudy' || venue == 'SIG' || venue == 'course' || venue == 'panel') ? sub["Secondary Affiliation (optional) (no labs or depts names in this field) " + i + " - Institution"] 
				 : sub["Secondary Affiliation (optional) " + i + " - Institution"]),
		"city" : ((venue == 'casestudy' || venue == 'SIG' || venue == 'course' || venue == 'panel') ? sub["Secondary Affiliation (optional) (no labs or depts names in this field) " + i + " - City"] 
				 : sub["Secondary Affiliation (optional) " + i + " - City"]),
		"country" : ((venue == 'casestudy' || venue == 'SIG' || venue == 'course' || venue == 'panel') ? sub["Secondary Affiliation (optional) (no labs or depts names in this field) " + i + " - Country"] 
			     : sub["Secondary Affiliation (optional) " + i + " - Country"])
	    }
	}
	authors.push(author);
    }
    return authors;
}

function createAuth(id){
    if(id != "") return id;
    newAuth+=1;
    return newAuth;
}

function createEntityAuthors(sub, venue){
    var authors = [];
    var numAuthors = sub["Author list"].split(",").length;
    for (var i = 1; i <= numAuthors; i++){    
	// create record for this author of this submission	
	var author = {
	    "id" : "auth" + createAuth(sub["Author ID " + i]),
	    "type" : "author",
	    "venue" : venue,
	    "rank" : i,
	    "givenName" : ((venue == 'TOCHI' || venue == 'keynote') ? sub["Given name " + i] : sub["Author given first name " + i]),	
   	    "middleInitial" : ((venue == "TOCHI" || venue == "keynote") ? sub["Middle initial " + i] : sub["Middle initial or name " + i]),
	    "familyName" : ((venue == "TOCHI" || venue == "keynote") ? sub["Family name " + i] : sub["Author last/family name " + i]),
	    "email" : ((venue == "TOCHI" || venue == "keynote") ? sub["Email " + i] : sub["Valid email address " + i]),
	    "primary" : { 
		"dept" : ((venue == 'casestudy' || venue == 'SIG' || venue == 'course' || venue == 'panel') ? sub["Primary Affiliation (no labs or depts names in this field) " + i + " - Department/School/Lab"] 
			  : sub["Primary Affiliation " + i + " - Department/School/Lab"]),
		"institution" : ((venue == 'casestudy' || venue == 'SIG' || venue == 'course' || venue == 'panel') ? sub["Primary Affiliation (no labs or depts names in this field) " + i + " - Institution"] 
				 : sub["Primary Affiliation " + i + " - Institution"]),
		"city" : ((venue == 'casestudy' || venue == 'SIG' || venue == 'course' || venue == 'panel') ? sub["Primary Affiliation (no labs or depts names in this field) " + i + " - City"] 
			  : sub["Primary Affiliation " + i + " - City"]),
		"country" : ((venue == 'casestudy' || venue == 'SIG' || venue == 'course' || venue == 'panel') ? sub["Primary Affiliation (no labs or depts names in this field) " + i + " - Country"] 
				 : sub["Primary Affiliation " + i + " - Country"]),
	    },
	    "secondary" :  { 
		"dept" : ((venue == 'casestudy' || venue == 'SIG' || venue == 'course' || venue == 'panel') ? sub["Secondary Affiliation (optional) (no labs or depts names in this field) " + i + " - Department/School/Lab"] 
			  : sub["Secondary Affiliation (optional) " + i + " - Department/School/Lab"]),
		"institution" : ((venue == 'casestudy' || venue == 'SIG' || venue == 'course' || venue == 'panel') ? sub["Secondary Affiliation (optional) (no labs or depts names in this field) " + i + " - Institution"] 
				 : sub["Secondary Affiliation (optional) " + i + " - Institution"]),
		"city" : ((venue == 'casestudy' || venue == 'SIG' || venue == 'course' || venue == 'panel') ? sub["Secondary Affiliation (optional) (no labs or depts names in this field) " + i + " - City"] 
			  : sub["Secondary Affiliation (optional) " + i + " - City"]),
		"country" : ((venue == 'casestudy' || venue == 'SIG' || venue == 'course' || venue == 'panel') ? sub["Secondary Affiliation (optional) (no labs or depts names in this field) " + i + " - Country"] 
			     : sub["Secondary Affiliation (optional) " + i + " - Country"])
	    }
	    // "primary" : { 
	    // 	"dept" : sub["Primary Affiliation " + i + " - Department/School/Lab"],
	    // 	"institution" : sub["Primary Affiliation " + i + " - Institution"],
	    // 	"city" : sub["Primary Affiliation " + i + " - City"],
	    // 	"country" : sub["Primary Affiliation " + i + " - Country"] 
	    // },
	    // "secondary" :  { 		
	    // 	"dept" : sub["Secondary Affiliation (optional) " + i + " - Department/School/Lab"],
	    // 	"institution" : sub["Secondary Affiliation (optional) " + i + " - Institution"],
	    // 	"city" : sub["Secondary Affiliation (optional) " + i + " - City"],
	    // 	"country" : sub["Secondary Affiliation (optional) " + i + " - Country"]
	    // }
	}
	authors.push(author);
    }
    return authors;
}

function createAuthorData(data, venue){
    var authors = [];
    for(var s = 0; s < data.length; s++){ // for each submission
	var sub = data[s];
	authors = authors.concat(createAuthors(sub, venue));
    }
    return authors;
}

function createEntityData(data, sessionData, venue){
    var submissions = [];
    for(var s = 0; s < data.length; s++){ // for each submission
	var sub = data[s]; 
	var submission = {
	    "id" : sub["ID"],
	    "title" : ((sub["Title"].indexOf("[NOT SUBMITTED]") == 0) ?
		       sub["Title"].substring(16) : sub["Title"]),
	    "abstract" : sub["Abstract"],
	    "acmLink" : "",
	    "authors" : createEntityAuthors(sub, venue), 
	    "cbStatement" :( (venue == 'altchi') ?
			     sub["Contribution and Benefit Statement"] :
			     sub["Contribution & Benefit Statement (Mandatory Field)"]),
	    "contactEmail" : sub["Contact Email"],
	    "contactFirstName" : sub["Contact given name"],
	    "contactLastName" : sub["Contact family name"],
	    "keywords" : sub["Author Keywords"],
	    "venue" : venue,
	    "subtype" : sub["Paper or Note"],
	    "session" : getSession(sessionData, sub["ID"]),
	    "communities" : getLabels(sessionData, sub["ID"])
	}
	submissions.push(submission);
    }
    return submissions;
}

function getLabels(sessionData, id){
    var labelArray = [];
    if(!(id in Frenzyrawdata["items"])) return labelArray;

    var labels = Frenzyrawdata["items"][id]["labels"];
    for(var l in labels){
	if(labels[l].checked){
	    labelArray.push(l);
	}
    }
    return labelArray;
}


Array.prototype.getUnique = function(){
    var u = {}, a = [];
    for(var i = 0, l = this.length; i < l; ++i){
	if(u.hasOwnProperty(this[i])) {
            continue;
	}
	a.push(this[i]);
	u[this[i]] = 1;
    }
    return a;
}


function getLabelsForSubs(sessionData, ids){
    var labelArray = [];
    for(var i = 0; i < ids.length; i++){
	var id = ids[i];
	labelArray = labelArray.concat(getLabels(sessionData, id));
    }
    return labelArray;
}


function getSession(sessionData, id){
    if(VENUE == "SIG"){
	var matches = roomAssignments.filter(function(x) {
	    return (x.id.indexOf('s-' + id) == 0)});
	if(matches.length > 0) return matches[0].id;
	else return ""
    }

    if(VENUE == "course"){
	var matches = roomAssignments.filter(function(x) {
	    return (x.id.indexOf('s-' + id) == 0)});
	if(matches.length > 0) return matches[0].id;
	else return ""
    }
    
    if(VENUE == "panel"){
	for(var s in assignments.panelAssigns){
	    if(assignments.panelAssigns[s].submissions == id){
		return 's-' + s;
	    }
	}
    }
    
    if(VENUE == "altchi"){
	for(var s in assignments.altchiAssigns){
	    if(assignments.altchiAssigns[s].submissions.indexOf(id) >= 0){
		return 's-' + s;
	    }
	}
    }
    
    if(!(id in Frenzyrawdata["items"])){
	console.log("Missing: " + id);
	return "";
    }

    var sessionName = Frenzyrawdata["items"][id]["session"];
//    console.log(sessionName);
    
    if(sessionName in sessionData){
//	console.log(sessionData[sessionName]['id']);
	return sessionData[sessionName]['id'];
    }else{
	console.log("Missing: " + sessionName);
	return "";
    }
}
