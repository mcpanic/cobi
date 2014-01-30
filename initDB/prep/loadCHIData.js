var csv = require("csv");
var fs = require('fs');
var newAuth = 100000;

// INPUT
var FRENZYINPUT = "./data-final.json";
//var PCSINPUT = "Papers-listOfFinalSubmissions.csv";
// var PCSINPUT = "CaseStudy-listOfFinalSubmissions.csv";
// var PCSINPUT = "Courses-listOfFinalSubmissions.csv";
// var PCSINPUT = "SIGs-listOfFinalSubmissions.csv";
var PCSINPUT = "TOCHI-listOfFinalSubmissions.csv";
var VENUE = "TOCHI";
//var VENUE = "paper";
var IGNORELIST = ['to132'];

var AUTHORFILE = "authors.json";
var ENTITYFILE = "entities.json";
var SESSIONFILE = "sessions.json";
var SCHEDULEFILE = "schedule.json";
var CREATEAUTHORFILE = false;
var CREATEENTITYFILE = true;
var CREATESESSIONFILE = false;
var CREATESCHEDULEFILE = false;
var SESSIONSTART = 100;

// LOAD DATA
var PCSdata = []; // assume loaded CSV of submission data
var Frenzyrawdata = require(FRENZYINPUT); // assume Frenzy format json without "data = " part
Frenzydata = loadFrenzyData(Frenzyrawdata); //console.log(Frenzydata);
loadSubmissions();

function loadSubmissions(){
    var parser = csv();
    parser.on("record", function (row, index){
	    if(IGNORELIST.indexOf(row['ID']) == -1)
		PCSdata.push(row);
	}); 
    parser.from.options({
	    columns: true
		});
    parser.from(PCSINPUT);
    parser.on("end", function(){
	    if(CREATEAUTHORFILE){
		var authors = createAuthorData(PCSdata, VENUE);
		fs.writeFile(AUTHORFILE, JSON.stringify(authors, null, 4), function(err) {});
	    }
	    if(CREATEENTITYFILE){
		var entities = createEntityData(PCSdata, Frenzydata, VENUE);
		fs.writeFile(ENTITYFILE, JSON.stringify(entities, null, 4), function(err) {});
	    }
	    if(CREATESESSIONFILE){
		var sessions = createSessionData(Frenzydata);
		fs.writeFile(SESSIONFILE, JSON.stringify(sessions, null, 4), function(err) {});
	    }
	    if(CREATESCHEDULEFILE){
		var schedule = createScheduleData();
		fs.writeFile(SCHEDULEFILE, JSON.stringify(schedule, null, 4), function(err) {});
	    }
	});
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

function createSessionData(data){
    var sessions = [];
    for(var i in data){
	// for each session
       
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

	var session = {
	    "id" : sessionData['id'],
	    "date" : "",
	    "time" : "",
	    "room" : "",
	    "communities" : allLabels.getUnique(),
	    "persona" : persona,
	    "submissions" : sessionData['members'].join(),
	    "title" : title,
	    "venue" : "paper",
	    "scheduled" : 0
	}
	sessions.push(session);
    }
    return sessions;
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
    var slots = [{"date":"Monday", "time": "9:00-10:20"},
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
		 {"date":"Thursday", "time": "16:00-17:20"}];
    
    var slotId = 100; 
    for(var i = 0; i < rooms.length; i++){
	for(var j = 0; j < slots.length; j++){
	    var slot = { 
		"id" : "slot" + slotId,
		"date" : slots[j].date,
		"time" : slots[j].time,
		"room" : rooms[i],
		"sessionId" : ""
	    };
	    slotId+=1;
	    schedule.push(slot);
	}
    }
    return schedule;
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
	    "venue" : "paper",
	    "rank" : i,
	    "givenName" : ((venue == 'TOCHI') ? sub["Given name " + i] : sub["Author given first name " + i]),	
	    "middleInitial" : ((venue == "TOCHI") ? sub["Middle initial " + i] : sub["Author middle initial or name " + i]),
	    "familyName" : ((venue == "TOCHI") ? sub["Family name " + i] : sub["Author last/family name " + i]),
	    "email" : ((venue == "TOCHI") ? sub["Email " + i] : sub["Valid email address " + i]),
	    "role" : "",
	    "primary" : { 
		"dept" : sub["Primary Affiliation " + i + " - Department/School/Lab"],
		"institution" : sub["Primary Affiliation " + i + " - Institution"],
		    "city" : sub["Primary Affiliation " + i + " - City"],
		"country" : sub["Primary Affiliation " + i + " - Country"] 
	    },
	    "secondary" :  { 
		
		"dept" : sub["Secondary Affiliation (optional) " + i + " - Department/School/Lab"],
		
		"institution" : sub["Secondary Affiliation (optional) " + i + " - Institution"],
		"city" : sub["Secondary Affiliation (optional) " + i + " - City"],
		"country" : sub["Secondary Affiliation (optional) " + i + " - Country"]
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
	    "givenName" : ((venue == 'TOCHI') ? sub["Given name " + i] : sub["Author given first name " + i]),	
   	    "middleInitial" : ((venue == "TOCHI") ? sub["Middle initial " + i] : sub["Middle initial or name " + i]),
	    "familyName" : ((venue == "TOCHI") ? sub["Family name " + i] : sub["Author last/family name " + i]),
	    "email" : ((venue == "TOCHI") ? sub["Email " + i] : sub["Valid email address " + i]),
	    "primary" : { 
		"dept" : sub["Primary Affiliation " + i + " - Department/School/Lab"],
		"institution" : sub["Primary Affiliation " + i + " - Institution"],
		"city" : sub["Primary Affiliation " + i + " - City"],
		"country" : sub["Primary Affiliation " + i + " - Country"] 
	    },
	    "secondary" :  { 		
		"dept" : sub["Secondary Affiliation (optional) " + i + " - Department/School/Lab"],
		"institution" : sub["Secondary Affiliation (optional) " + i + " - Institution"],
		"city" : sub["Secondary Affiliation (optional) " + i + " - City"],
		"country" : sub["Secondary Affiliation (optional) " + i + " - Country"]
	    }
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
	    "cbStatement" : sub["Contribution & Benefit Statement (Mandatory Field)"],
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
    var sessionName = Frenzyrawdata["items"][id]["session"];
    console.log(sessionName);

    if(sessionName in sessionData){
	console.log(sessionData[sessionName]['id']);

	return sessionData[sessionName]['id'];
    }else{
	console.log("Missing: " + sessionName);
	return "";
    }
}
