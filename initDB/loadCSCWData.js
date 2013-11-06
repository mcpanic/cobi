var csv = require("csv");
var fs = require('fs');

// TODO: add other authors to TOCHI paper
// TODO where are personas?
// listOfFinalSubmissions.csv
// data-final.js
var AUTHORFILE = "authors.json";
var ENTITYFILE = "entities.json";
var SESSIONFILE = "sessions.json";
var SCHEDULEFILE = "schedule.json";

// LOAD DATA
var PCSdata = []; // assume loaded CSV of submission data
var Frenzyrawdata = require("./data-final.json"); // assume Frenzy format json without "data = " part
Frenzydata = loadFrenzyData(Frenzyrawdata); //console.log(Frenzydata);
loadSubmissions();

function loadSubmissions(){
    var parser = csv();
    parser.on("record", function (row, index){
	    PCSdata.push(row);
	}); 
    parser.from.options({
	    columns: true
		});
    parser.from('listOfFinalSubmissions.csv');
    parser.on("end", function(){
	    var authors = createAuthorData(PCSdata);
	    fs.writeFile(AUTHORFILE, JSON.stringify(authors, null, 4), function(err) {});
	    var entities = createEntityData(PCSdata, Frenzydata);
	    fs.writeFile(ENTITYFILE, JSON.stringify(entities, null, 4), function(err) {});
	    var sessions = createSessionData(Frenzydata);
	    fs.writeFile(SESSIONFILE, JSON.stringify(sessions, null, 4), function(err) {});
	    var schedule = createScheduleData();
	    fs.writeFile(SCHEDULEFILE, JSON.stringify(schedule, null, 4), function(err) {});
	});
}


function loadFrenzyData(data) {
    var sessions = {}; 
    for(var s in data.sessions){
	sessions[s] = data.sessions[s];
    }
    //    sessions.sort(function(a, b) {return a.label > b.label});
    // label from s100
    var count = 100;
    for(var i in sessions){
	sessions[i]["id"] = "s" + count;
	count+=1;
    }
    return sessions;
}

// output authors file
// output entity file
// output session file
// output schedule file

function createSessionData(data){
    var sessions = [];
    for(var i in data){
	// for each session
       
	var sessionData = data[i];
	var submissions = sessionData['members'];
	var session = {
	    "id" : sessionData['id'],
	    "date" : "",
	    "time" : "",
	    "room" : "",
	    "communities" : getLabelsForSubs(sessionData, submissions),
	    "submissions" : sessionData['members'].join(),
	    "title" : sessionData['label'],
	    "venue" : "paper",
	    "scheduled" : 0
	}
	sessions.push(session);
    }
    return sessions;
}

function createScheduleData(){
    // slots for the schedule
    //GB56 - Plenaries & reception, 1400 (T)heater (will set up as (C)lassroom)
    //GB5, GB6 - as parallel session rooms mixed seating. Classroom in front, theater in the back to allow easy inter-session hoping.
    //	GB12, GB34, GB78, and GB910 as our main parallel session rooms with mixed seating, 160T and 102C
    //DOVER AB as 100T parallel session room.
    //	DOVER C and Bristol as special activities rooms (BOF, speaker prep, etc.)
    var schedule = [];
    var rooms = ["GB56", "GB5", "GB6", "GB12", "GB34", "GB78", "GB910", "160T", "102C", "Dover AB", "100T", "Dover C", "Bristol"];
    var slots = [{"date":"Monday, Feb 17th", "time": "8:30-10:00"},
		     {"date":"Monday, Feb 17th", "time": "10:00-10:30"},
		     {"date":"Monday, Feb 17th", "time": "10:30-12:00"},
		     {"date":"Monday, Feb 17th", "time": "12:00-14:00"},
		     {"date":"Monday, Feb 17th", "time": "14:00-15:30"},
		     {"date":"Monday, Feb 17th", "time": "15:30-16:00"},
		     {"date":"Monday, Feb 17th", "time": "16:00-17:00"},
		     {"date":"Monday, Feb 17th", "time": "17:00-19:00"},
		     {"date":"Tuesday, Feb 18th", "time": "8:30-10:00"},
		     {"date":"Tuesday, Feb 18th", "time": "10:00-10:30"},
		     {"date":"Tuesday, Feb 18th", "time": "10:30-12:00"},
		     {"date":"Tuesday, Feb 18th", "time": "12:00-14:00"},
		     {"date":"Tuesday, Feb 18th", "time": "14:00-15:30"},
		     {"date":"Tuesday, Feb 18th", "time": "15:30-16:00"},
		     {"date":"Tuesday, Feb 18th", "time": "16:00-16:45"},
		     {"date":"Tuesday, Feb 18th", "time": "16:45-17:30"},
		     {"date":"Tuesday, Feb 18th", "time": "18:00-19:00"},
		     {"date":"Tuesday, Feb 18th", "time": "19:00-22:00"},
		     {"date":"Wednesday, Feb 19th", "time": "8:30-10:00"},
		     {"date":"Wednesday, Feb 19th", "time": "10:00-10:30"},
		     {"date":"Wednesday, Feb 19th", "time": "10:30-12:00"},
		     {"date":"Wednesday, Feb 19th", "time": "12:00-14:00"},
		     {"date":"Wednesday, Feb 19th", "time": "14:00-15:30"},
		     {"date":"Wednesday, Feb 19th", "time": "15:30-16:00"},
		     {"date":"Wednesday, Feb 19th", "time": "16:00-17:30"}
		     ];
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

function createAuthors(sub){
    var authors = [];
    var numAuthors = sub["Author list"].split(",").length;
    for (var i = 1; i <= numAuthors; i++){    
	// create record for this author of this submission	
	var author = {
	    "authorId" : "auth" + sub["Author ID " + i],
	    "type" : "author",
	    "id" : sub["ID"],
	    "venue" : "paper",
	    "rank" : i,
	    "givenName" : sub["Author given first name " + i],
	    "middleInitial" : sub["Author middle initial or name " + i],
	    "familyName" : sub["Author last/family name " + i]	,
	    "email" : sub["Valid email address " + i],
	    "role" : "",
	    "primary" : { 
		"dept" : sub["Primary Affiliation (no labs or depts names in this field) " + i + " - Department/School/Lab"],
		"institution" : sub["Primary Affiliation (no labs or depts names in this field) " + i + " - Institution"],
		    "city" : sub["Primary Affiliation (no labs or depts names in this field) " + i + " - City"],
		"country" : sub["Primary Affiliation (no labs or depts names in this field) " + i + " - Country"] 
	    },
	    "secondary" :  { 
		
		"dept" : sub["Secondary Affiliation (optional) (no labs or depts names in this field) " + i + " - Department/School/Lab"],
		
		"institution" : sub["Secondary Affiliation (optional) (no labs or depts names in this field) " + i + " - Institution"],
		"city" : sub["Secondary Affiliation (optional) (no labs or depts names in this field) " + i + " - City"],
		"country" : sub["Secondary Affiliation (optional) (no labs or depts names in this field) " + i + " - Country"]
	    }
	}
	authors.push(author);
    }
    return authors;
}

function createAuthorData(data){
    var authors = [];
    for(var s = 0; s < data.length; s++){ // for each submission
	var sub = data[s];
	authors = authors.concat(createAuthors(sub));
    }
    return authors;
}

function createEntityData(data, sessionData){
    var submissions = [];
    for(var s = 0; s < data.length; s++){ // for each submission
	var sub = data[s];
	var submission = {
		"id" : sub["ID"],
		"title" : sub["Title"],
		"abstract" : sub["Abstract"],
		"acmLink" : "",
		"authors" : createAuthors(sub), 
		"cbStatement" : "",
		"contactEmail" : sub["Contact Email"],
		"contactFirstName" : sub["Contact given name"],
		"contactLastName" : sub["Contact family name"],
		"keywords" : sub["Author Keywords"],
		"venue" : "paper",
		"subtype" : "paper",
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
    if(sessionName in sessionData){
	return sessionData[sessionName]['id'];
    }else{
	return "";
    }
}