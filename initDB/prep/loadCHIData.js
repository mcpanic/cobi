var csv = require("csv-parse");
var fs = require('fs');
var newAuth = 100000;
var assignments = require('./input/assignments');

// INPUT
//var FRENZYINPUT = "./input/data-final.json";
var IGNORELIST = [];

var CREATEAUTHORFILE = true;
var CREATEENTITYFILE = true;
var CREATESESSIONFILE = false;
var CREATESCHEDULEFILE = false;
var SESSIONSTART = 100;

var PCSINPUT = "";
// var VENUE = "paper";
// var VENUE = "TOCHI";
// var VENUE = "casestudy";
// var VENUE = "course";
// var VENUE = "SIG";
var VENUE = "panel";
// var VENUE = "altchi";
// var VENUE = "keynote";

if(VENUE == "paper"){
    PCSINPUT = "./input/PapersNotes_final_submissions_20150204.csv";
}else if(VENUE == "TOCHI"){
    PCSINPUT = "./input/tochi_final_submissions_20150204.csv";
}else if(VENUE == "casestudy"){
    PCSINPUT = "./input/casestudies_final_submissions_20150204.csv";
}else if(VENUE == "course"){
    PCSINPUT = "./input/courses_final_submissions_20150204.csv";
}else if(VENUE == "SIG"){
    PCSINPUT = "./input/sigs_final_submissions_20150204.csv";
}else if(VENUE == "panel"){
    PCSINPUT = "./input/panels_final_submissions_20150209.csv";
}else if(VENUE == "altchi"){
    PCSINPUT = "./input/altchi_final_submissions_20150204.csv";
}else if(VENUE == "keynote"){
    PCSINPUT = "./input/special_final_submissions_20150204.csv";
}

var AUTHORFILE = VENUE + "-authors.json";
var ENTITYFILE = VENUE + "-entities.json";
var SESSIONFILE = VENUE + "-sessions.json";
var SCHEDULEFILE = "schedule.json";

var roomAssignments = loadAssignments(assignments);

// LOAD DATA
var PCSdata = []; // assume loaded CSV of submission data

/*
//No Frenzy for CHI 2015
var Frenzyrawdata = require(FRENZYINPUT); // assume Frenzy format json without "data = " part
var Frenzydata = loadFrenzyData(Frenzyrawdata); //console.log(Frenzydata);
*/

// Load paper cluster data.
// CHI 2015 had manual clustering with exclusive labels.
// CSCW 2015 used Seshy.
// CHI 2014 used Frenzy.
var labelData = [
    {"label": "3D Interaction", "submissions": ["pn112", "pn263", "pn433", "pn623", "pn1073", "pn1268"]},
    {"label": "Accessibility", "submissions": ["pn332", "pn388", "pn691", "pn1077", "pn1373", "pn1559", "pn1638", "pn1881", "pn1898", "pn2072", "pn2486", "pn5107", "pn5132"]},
    {"label": "Affective emotion", "submissions": ["pn413", "pn507", "pn859", "pn1571", "pn1723", "pn1906", "pn2050"]},
    {"label": "Animal-Human Interaction", "submissions": ["pn688", "pn2412"]},
    {"label": "Arts", "submissions": ["pn383", "pn517", "pn2272", "pn2300"]},
    {"label": "Augmented Reality", "submissions": ["pn182", "pn265", "pn273", "pn487", "pn525", "pn654", "pn1439", "pn1936", "pn2005", "pn2607"]},
    {"label": "Body Input", "submissions": ["pn979", "pn1010", "pn1066", "pn1367", "pn1709", "pn1715", "pn1809", "pn2473", "pn2582"]},
    {"label": "CitizenX", "submissions": ["pn354", "pn586", "pn677", "pn1156", "pn1558", "pn1832"]},
    {"label": "CMC", "submissions": ["pn1023", "pn1122", "pn1257", "pn1509", "pn1541"]},
    {"label": "Critical Design", "submissions": ["pn481", "pn521", "pn583", "pn1088", "pn1426", "pn1486", "pn1623", "pn1641", "pn1652", "pn5106"]},
    {"label": "Crowdsourcing applications", "submissions": ["pn555", "pn1092", "pn1453", "pn1539", "pn1727", "pn1808", "pn2423", "pn2626"]},
    {"label": "Data Understanding", "submissions": ["pn592", "pn697", "pn1142", "pn1189", "pn1552", "pn1580", "pn1606", "pn1717", "pn2637"]},
    {"label": "Disaster", "submissions": ["pn327", "pn710", "pn1018"]},
    {"label": "Eco-Green", "submissions": ["pn277", "pn389", "pn569", "pn731", "pn833", "pn849", "pn982", "pn1033", "pn1218", "pn1299", "pn2212", "pn2310", "pn2611"]},
    {"label": "Empowering Users", "submissions": ["pn1498", "pn2147", "pn2172", "pn2327", "pn2536", "pn2651", "pn5103", "pn5133"]},
    {"label": "Everyday Objects", "submissions": ["pn148", "pn361", "pn479", "pn504", "pn594", "pn787", "pn910", "pn1312", "pn1376", "pn1764", "pn1828", "pn1889", "pn2282"]},
    {"label": "Eyetracking", "submissions": ["pn236", "pn954", "pn1103", "pn1170", "pn5105"]},
    {"label": "Fabrication", "submissions": ["pn545", "pn1055", "pn1316", "pn1911", "pn2122", "pn2494", "pn2680"]},
    {"label": "Family HCI", "submissions": ["pn420", "pn450", "pn930", "pn1051", "pn1174", "pn1583", "pn1785", "pn5112", "pn5123"]},
    {"label": "Game Design", "submissions": ["pn153", "pn282", "pn605", "pn681", "pn682", "pn708", "pn1061", "pn1617", "pn2483"]},
    {"label": "Game Players", "submissions": ["pn448", "pn820", "pn1599", "pn1687", "pn1835", "pn1874", "pn2213", "pn2627"]},
    {"label": "Gender", "submissions": ["pn734", "pn2108", "pn2146", "pn2234", "pn2314"]},
    {"label": "Geographic Visualization and Data", "submissions": ["pn134", "pn323", "pn328", "pn732", "pn898", "pn2245", "pn2352"]},
    {"label": "Gesture", "submissions": ["pn147", "pn362", "pn373", "pn1069", "pn1184", "pn1688", "pn1966", "pn2004", "pn2504", "pn2678"]},
    {"label": "Global Issues in CSCW", "submissions": ["pn824", "pn965", "pn1135", "pn1626", "pn1915", "pn2288", "pn2370"]},
    {"label": "GUI", "submissions": ["pn139", "pn142", "pn359", "pn416", "pn933", "pn1284", "pn1361", "pn1492", "pn1895", "pn2296"]},
    {"label": "HCI Methods", "submissions": ["pn2048", "pn2386", "pn2620"]},
    {"label": "Health and Physical Activity", "submissions": ["pn414", "pn611", "pn1001", "pn1032", "pn1336", "pn1834", "pn1856", "pn1894", "pn2289"]},
    {"label": "Health Communications", "submissions": ["pn103", "pn243", "pn808", "pn1046", "pn1945", "pn2419", "pn2424", "pn2470", "pn2481", "pn5108"]},
    {"label": "Health Interventions", "submissions": ["pn408", "pn422", "pn862", "pn885", "pn1045", "pn1058", "pn1124", "pn1280", "pn1424", "pn1887", "pn2000", "pn2085", "pn2191", "pn2603", "pn5109"]},
    {"label": "Health Self-Monitoring", "submissions": ["pn245", "pn248", "pn780", "pn1118", "pn1144", "pn1368", "pn1722", "pn1940", "pn2185"]},
    {"label": "ICT4D", "submissions": ["pn262", "pn400", "pn685", "pn1095", "pn2471", "pn2476"]},
    {"label": "Interface and aesthetics", "submissions": ["pn768", "pn815", "pn1550", "pn2305", "pn2480"]},
    {"label": "Kids and Tech", "submissions": ["pn189", "pn716", "pn919", "pn1390", "pn1391", "pn1885", "pn2134"]},
    {"label": "Makers", "submissions": ["pn353", "pn1210", "pn1296", "pn2165", "pn2312", "pn2318"]},
    {"label": "Measuring Crowdsourcing", "submissions": ["pn206", "pn1166", "pn1662", "pn1840", "pn2313", "pn2336", "pn2588"]},
    {"label": "Meta-HCI", "submissions": ["pn496", "pn1188", "pn1528", "pn1893", "pn2421", "pn5111"]},
    {"label": "Mobile", "submissions": ["pn369", "pn462", "pn563", "pn1129", "pn1275", "pn1647", "pn1990", "pn2281", "pn5127"]},
    {"label": "Mobile Interaction", "submissions": ["pn312", "pn380", "pn1086", "pn1350", "pn1577", "pn1907", "pn2102", "pn2131"]},
    {"label": "MOOCS e-learning", "submissions": ["pn382", "pn727", "pn738", "pn936", "pn1147", "pn1167", "pn1335", "pn1530", "pn1574", "pn2492", "pn5119", "pn5128"]},
    {"label": "Multi-Tasking/Interruptions", "submissions": ["pn261", "pn855", "pn1501", "pn2587"]},
    {"label": "Muscle Sensing", "submissions": ["pn115", "pn140", "pn399", "pn1766", "pn1980", "pn5115", "pn5121"]},
    {"label": "Older Adults", "submissions": ["pn105", "pn1603", "pn1689", "pn2570", "pn5102"]},
    {"label": "Perception and Viz", "submissions": ["pn500", "pn1289", "pn1684", "pn1886", "pn2539"]},
    {"label": "Physiological BCI", "submissions": ["pn1026", "pn1047", "pn5114"]},
    {"label": "Politic", "submissions": ["pn409", "pn439", "pn880", "pn917", "pn1458", "pn1751"]},
    {"label": "Privacy UX", "submissions": ["pn169", "pn287", "pn298", "pn371", "pn466", "pn763", "pn895", "pn1266", "pn1480", "pn2244", "pn2478", "pn5113"]},
    {"label": "Programming", "submissions": ["pn464", "pn932", "pn1038", "pn1948", "pn2560", "pn2575", "pn5101"]},
    {"label": "Protecting Kids", "submissions": ["pn598", "pn1049", "pn1337", "pn1742", "pn1848"]},
    {"label": "Public Displays", "submissions": ["pn229", "pn638", "pn667", "pn699", "pn1016"]},
    {"label": "Robots", "submissions": ["pn366", "pn1538", "pn2196", "pn2328", "pn2586"]},
    {"label": "Search", "submissions": ["pn532", "pn595", "pn1618", "pn1958", "pn2207", "pn2447", "pn2578"]},
    {"label": "Security", "submissions": ["pn114", "pn136", "pn167", "pn434", "pn480", "pn602", "pn652", "pn657", "pn904", "pn1031", "pn1221", "pn1656", "pn1743", "pn2548"]},
    {"label": "Small Device Input", "submissions": ["pn144", "pn548", "pn783", "pn1054", "pn1356", "pn1533", "pn1991", "pn2602", "pn5118"]},
    {"label": "Smartwatch", "submissions": ["pn488", "pn546", "pn643", "pn762", "pn2218"]},
    {"label": "Social Media", "submissions": ["pn242", "pn345", "pn1081", "pn1506", "pn2224", "pn2238", "pn2339", "pn2341", "pn2348", "pn5110"]},
    {"label": "Social Methods", "submissions": ["pn411", "pn1256", "pn1258", "pn1386", "pn1497"]},
    {"label": "Sound", "submissions": ["pn160", "pn306", "pn587", "pn1187", "pn1355", "pn1977"]},
    {"label": "Speech UI", "submissions": ["pn1273", "pn1302", "pn2111", "pn2228"]},
    {"label": "Tables & Walls", "submissions": ["pn123", "pn271", "pn564", "pn851", "pn1673", "pn1892"]},
    {"label": "Tactile Notifications", "submissions": ["pn1114", "pn1149", "pn1195", "pn1763"]},
    {"label": "Tangible UI", "submissions": ["pn451", "pn453", "pn1620", "pn1888", "pn1942", "pn2464", "pn2604"]},
    {"label": "Tangible Viz", "submissions": ["pn365", "pn650", "pn2625"]},
    {"label": "Touch Interaction", "submissions": ["pn551", "pn875", "pn922", "pn1644", "pn1927", "pn1979", "pn2495", "pn2629", "pn5134"]},
    {"label": "Understanding Crowd Sourcers", "submissions": ["pn207", "pn239", "pn687", "pn747", "pn807", "pn906", "pn1059", "pn1837", "pn2032", "pn2375"]},
    {"label": "UX Methods", "submissions": ["pn155", "pn227", "pn234", "pn302", "pn308", "pn528", "pn631", "pn1048", "pn1419", "pn1573", "pn1596", "pn2022", "pn2425", "pn2491", "pn5104"]},
    {"label": "VR", "submissions": ["pn665", "pn1217", "pn1323", "pn1357"]},
    {"label": "Work", "submissions": ["pn410", "pn581", "pn973", "pn1151", "pn1226", "pn1350", "pn1682", "pn1944", "pn1972", "pn2126", "pn2247", "pn2340", "pn2606"]}
];

loadSubmissions();

function loadAssignments(as){
    var records = [];
    // courses
    for(var i = 0; i < as.courses.length; i++){
    	var cd = as.courses[i].split(",");
    	var date = cd[0];
    	var time = cd[1];
    	for(var j = 2; j < cd.length; j++){
    	    if(cd[j].indexOf("XXX") == -1){
    		var room = as.courseRooms[j-2];
    		var sessionId = "s-" + cd[j];
    		records.push({
    		    "id": sessionId,
    		    "date": date,
    		    "time": time,
    		    "room": room,
    		});
    	    }
    	}
    }

    // altchi
    for(var i = 0; i < as.altchis.length; i++){
    	var cd = as.altchis[i].split(",");
    	var date = cd[0];
    	var time = cd[1];
    	for(var j = 2; j < cd.length; j++){
    	    if(cd[j].indexOf("XXX") == -1){
    		var room = as.altchiRooms[j-2];
    		var sessionId = "s-" + cd[j];
    		records.push({
    		    "id": sessionId,
    		    "date": date,
    		    "time": time,
    		    "room": room,
    		});
    	    }
    	}
    }

    // casestudies
    for(var i = 0; i < as.casestudies.length; i++){
        var cd = as.casestudies[i].split(",");
        var date = cd[0];
        var time = cd[1];
        for(var j = 2; j < cd.length; j++){
            if(cd[j].indexOf("XXX") == -1){
            var room = as.casestudiesRooms[j-2];
            var sessionId = "s-" + cd[j];
            records.push({
                "id": sessionId,
                "date": date,
                "time": time,
                "room": room,
            });
            }
        }
    }


    // Panels
    for(var i = 0; i < as.panels.length; i++){
    	var cd = as.panels[i].split(",");
    	var date = cd[0];
    	var time = cd[1];
    	for(var j = 2; j < cd.length; j++){
    	    if(cd[j].indexOf("XXX") == -1){
    		var room = as.panelRooms[j-2];
    		var sessionId = "s-" + cd[j];
    		records.push({
    		    "id": sessionId,
    		    "date": date,
    		    "time": time,
    		    "room": room,
    		});
    	    }
    	}
    }

    // SIGs
    for(var i = 0; i < as.sigs.length; i++){
    	var cd = as.sigs[i].split(",");
    	var date = cd[0];
    	var time = cd[1];
    	for(var j = 2; j < cd.length; j++){
    	    if(cd[j].indexOf("XXX") == -1){
    		var room = as.sigRooms[j-2];
    		var sessionId = "s-" + cd[j];
    		records.push({
    		    "id": sessionId,
    		    "date": date,
    		    "time": time,
    		    "room": room,
    		});
    	    }
    	}
    }

    // papers
    for(var i = 0; i < as.papers.length; i++){
    	var cd = as.papers[i].split(",");
    	var date = cd[0];
    	var time = cd[1];
    	for(var j = 2; j < cd.length; j++){
    	    if(cd[j].indexOf("XXX") == -1){
    		var room = as.paperRooms[j-2];
    		var sessionId = cd[j];
    		records.push({
    		    "id": sessionId,
    		    "date": date,
    		    "time": time,
    		    "room": room,
    		});
    	    }
    	}
    }
    return records;
}


function loadSubmissions(){
/*
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
	});
*/
    var input = fs.readFileSync(PCSINPUT, 'utf8');

    var headers = [];
    // Get relevant fields for TF-IDF
    csv(input, {columns: true}, function(err, data){
        for(var i in data){
            PCSdata.push(data[i]);
        }

        loadClusterData();

        if(CREATEAUTHORFILE){
        var authors = createAuthorData(PCSdata, VENUE);
        fs.writeFile("output/" + AUTHORFILE, JSON.stringify(authors, null, 4), function(err) {});
        console.log(VENUE , "....author file created.");
        }
        if(CREATEENTITYFILE){
        var entities = createEntityData(PCSdata, labelData, VENUE);
        fs.writeFile("output/" + ENTITYFILE, JSON.stringify(entities, null, 4), function(err) {});
        console.log(VENUE , "....entity file created.");
        }
        if(CREATESESSIONFILE){
        var sessions = createSessionData(PCSdata, labelData);
        fs.writeFile("output/" + SESSIONFILE, JSON.stringify(sessions, null, 4), function(err) {});
        console.log(VENUE , "....session file created.");
        }
        if(CREATESCHEDULEFILE){
        var schedule = createScheduleData();
        fs.writeFile("output/" + SCHEDULEFILE, JSON.stringify(schedule, null, 4), function(err) {});
        console.log(VENUE , "....schedule file created.");
        }
    });
}

/*
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
*/

function loadClusterData() {
    var count = SESSIONSTART;
    for (var i in labelData){
        labelData[i]["id"]  = "s" + count;
        count += 1;
    }
    return labelData;
}

function createPaperSessionData(sessionData){
    var sessions = [];

    // Papers and TOCHI sessions...
    for(var i in sessionData){
        var submissions = sessionData[i]['submissions'];
        // var allLabels = getLabelsForSubs(sessionData, submissions);
        var title = sessionData[i]['label'];
        var info = sessionLookup(sessionData[i]['id']);
        var session = {
            "id" : sessionData[i]['id'],
            "date" : info.date,
            "time" : info.time,
            "room" : info.room,
            "communities" : [], //allLabels.getUnique(),
            "persona" : "",
            "submissions" : submissions.join(),
            "title" : title,
            "venue" : VENUE,
            "scheduled" : ((info.date == "") ? 0 : 1)
        }
        sessions.push(session);
    }
    return sessions;
}

/*
function createPaperSessionDataFrenzy(data){
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
*/


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
    for(var s in assignments.caseAssigns){
        var sid = "s-" + s;
        var info = sessionLookup(sid);
        var session = {
            "id" : sid,
            "date" : info.date,
            "time" : info.time,
            "room" : info.room,
            "communities" : [],
            "persona" : "",
            "submissions" : assignments.caseAssigns[s].submissions,
            "title" : assignments.caseAssigns[s].title,
            "venue" : VENUE,
            "scheduled" : ((info.date == "") ? 0 : 1)
        }
        sessions.push(session);
    }
    return sessions;
}

function createPanelSessionData(PCSdata){
    var sessions = [];
    for(var s in assignments.panelAssigns){
        var sid = "s-" + s;
        var info = sessionLookup(sid);
        var session = {
            "id" : sid,
            "date" : info.date,
            "time" : info.time,
            "room" : info.room,
            "communities" : [],
            "persona" : "",
            "submissions" : assignments.panelAssigns[s].submissions,
            "title" : assignments.panelAssigns[s].title,
            "venue" : VENUE,
            "scheduled" : ((info.date == "") ? 0 : 1)
        }
        sessions.push(session);
    }
    return sessions;

    // var sessions = [];
    // for(var i = 0; i < PCSdata.length; i++){
    // 	var sub = PCSdata[i];
    // 	var sid = "";
    // 	for(var s in assignments.panelAssigns){
    // 	    if(assignments.panelAssigns[s].submissions == sub["ID"]) {
    // 		sid = "s-" + s;
    // 		break;
    // 	    }
    // 	}
    // 	var info = sessionLookup(sid);
    // 	var session = {
    // 	    "id" : sid,
    // 	    "date" : info.date,
    // 	    "time" : info.time,
    // 	    "room" : info.room,
    // 	    "communities" : [],
    // 	    "persona" : "",
    // 	    "submissions" : sub["ID"],
    // 	    "title" : ((sub["Title"].indexOf("[NOT SUBMITTED]") == 0) ?
    // 		       sub["Title"].substring(16) : sub["Title"]),
    // 	    "venue" : VENUE,
    // 	    "scheduled" : ((info.date == "") ? 0 : 1)
    // 	}
    // 	sessions.push(session);
    // }
    // return sessions;
}


function createSIGSessionData(PCSdata){
    var sessions = [];
    for(var s in assignments.sigAssigns){
        var sid = "s-" + s;
        var info = sessionLookup(sid);
        var session = {
            "id" : sid,
            "date" : info.date,
            "time" : info.time,
            "room" : info.room,
            "communities" : [],
            "persona" : "",
            "submissions" : assignments.sigAssigns[s].submissions,
            "title" : assignments.sigAssigns[s].title,
            "venue" : VENUE,
            "scheduled" : ((info.date == "") ? 0 : 1)
        }
        sessions.push(session);
    }
    return sessions;

    // var sessions = [];
    // for(var i = 0; i < PCSdata.length; i++){
    // 	var sub = PCSdata[i];
    // 	var info = sessionLookup("s-" + sub['ID']);
    // 	var session = {
    // 	    "id" : "s-" + sub["ID"],
    // 	    "date" : info.date,
    // 	    "time" : info.time,
    // 	    "room" : info.room,
    // 	    "communities" : [],
    // 	    "persona" : "",
    // 	    "submissions" : sub["ID"],
    // 	    "title" : ((sub["Title"].indexOf("[NOT SUBMITTED]") == 0) ?
    // 		       sub["Title"].substring(16) : sub["Title"]),
    // 	    "venue" : VENUE,
    // 	    "scheduled" : ((info.date == "") ? 0 : 1)
    // 	}
    // 	sessions.push(session);
    // }
    // return sessions;
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

function createSessionData(PCSdata, sessionData){
    if(VENUE == "paper" || VENUE == "TOCHI")
	return createPaperSessionData(sessionData)

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
    var rooms = ["Hall D1", "401", "E5", "E6", "E1/E2", "402", "E3", "E4", "403", "307", "308", "317A", "317BC", "E7", "318BC", "318A"];

    var slots = [
            {"date": "Monday", "time": "11:30-12:50"},
            {"date": "Monday", "time": "14:30-15:50"},
            {"date": "Monday", "time": "16:30-17:50"},
            {"date": "Tuesday", "time": "9:30-10:50"},
            {"date": "Tuesday", "time": "11:30-12:50"},
            {"date": "Tuesday", "time": "14:30-15:50"},
            {"date": "Tuesday", "time": "16:30-17:50"},
            {"date": "Wednesday", "time": "9:30-10:50"},
            {"date": "Wednesday", "time": "11:30-12:50"},
            {"date": "Wednesday", "time": "14:30-15:50"},
            {"date": "Wednesday", "time": "16:30-17:50"},
            {"date": "Thursday", "time": "9:30-10:50"},
            {"date": "Thursday", "time": "11:30-12:50"},
            {"date": "Thursday", "time": "14:30-15:50"},
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
    	    "givenName" : ((venue == "TOCHI" || venue == "SIG" || venue == "panel" || venue == "altchi" || venue == "keynote") ? sub["Author given first name " + i] : sub["Author given name or first name " + i]),
    	    "middleInitial" : ((venue == "") ? sub["Author middle initial or name " + i] : sub["Middle initial or name " + i]),
    	    "familyName" : ((venue == "TOCHI" || venue == "SIG" || venue == "panel" || venue == "altchi" || venue == "keynote") ? sub["Author last/family name " + i] : sub["Author last name or family name " + i]),
    	    "email" : ((venue == "") ? sub["Email " + i] : sub["Valid email address " + i]),
    	    "role" : "",
    	    "primary" : {
        		"dept" : sub["Primary Affiliation (no labs or dept names in this field) " + i + " - Department/School/Lab"],
        		"institution" : sub["Primary Affiliation (no labs or dept names in this field) " + i + " - Institution"],
        		"city" : sub["Primary Affiliation (no labs or dept names in this field) " + i + " - City"],
        		"country" : sub["Primary Affiliation (no labs or dept names in this field) " + i + " - Country"]
    	    },
    	    "secondary" :  {
        		"dept" : sub["Secondary Affiliation (optional) (no labs or dept names in this field) " + i + " - Department/School/Lab"],
        		"institution" : sub["Secondary Affiliation (optional) (no labs or dept names in this field) " + i + " - Institution"],
        		"city" : sub["Secondary Affiliation (optional) (no labs or dept names in this field) " + i + " - City"],
        		"country" : sub["Secondary Affiliation (optional) (no labs or dept names in this field) " + i + " - Country"]
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
            "authorId" : "auth" + createAuth(sub["Author ID " + i]),
            "type" : "author",
            "id" : sub["ID"],
            "venue" : venue,
            "rank" : i,
            "givenName" : ((venue == "TOCHI" || venue == "SIG" || venue == "panel" || venue == "altchi" || venue == "keynote") ? sub["Author given first name " + i] : sub["Author given name or first name " + i]),
            "middleInitial" : ((venue == "") ? sub["Author middle initial or name " + i] : sub["Middle initial or name " + i]),
            "familyName" : ((venue == "TOCHI" || venue == "SIG" || venue == "panel" || venue == "altchi" || venue == "keynote") ? sub["Author last/family name " + i] : sub["Author last name or family name " + i]),
            "email" : ((venue == "") ? sub["Email " + i] : sub["Valid email address " + i]),
            "role" : "",
            "primary" : {
                "dept" : sub["Primary Affiliation (no labs or dept names in this field) " + i + " - Department/School/Lab"],
                "institution" : sub["Primary Affiliation (no labs or dept names in this field) " + i + " - Institution"],
                "city" : sub["Primary Affiliation (no labs or dept names in this field) " + i + " - City"],
                "country" : sub["Primary Affiliation (no labs or dept names in this field) " + i + " - Country"]
            },
            "secondary" :  {
                "dept" : sub["Secondary Affiliation (optional) (no labs or dept names in this field) " + i + " - Department/School/Lab"],
                "institution" : sub["Secondary Affiliation (optional) (no labs or dept names in this field) " + i + " - Institution"],
                "city" : sub["Secondary Affiliation (optional) (no labs or dept names in this field) " + i + " - City"],
                "country" : sub["Secondary Affiliation (optional) (no labs or dept names in this field) " + i + " - Country"]
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
	    "cbStatement" : typeof(sub["Contribution & Benefit Statement (Mandatory Field)"]) === "undefined" ? "" : sub["Contribution & Benefit Statement (Mandatory Field)"],
	    "contactEmail" : sub["Contact Email"],
	    "contactFirstName" : sub["Contact given name"],
	    "contactLastName" : sub["Contact family name"],
	    "keywords" : typeof(sub["Author Keywords"]) === "undefined" ? "" : sub["Author Keywords"],
	    "venue" : venue,
	    "subtype" : typeof(sub["Paper or Note"]) === "undefined" ? "" : sub["Paper or Note"],
	    "session" : getSession(sessionData, sub["ID"]),
	    "communities" : "", //getLabels(sessionData, sub["ID"])
	}
	submissions.push(submission);
    }
    return submissions;
}

/*
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
*/

/*
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
*/
/*
function getLabelsForSubs(sessionData, ids){
    var labelArray = [];
    for(var i = 0; i < ids.length; i++){
	var id = ids[i];
	labelArray = labelArray.concat(getLabels(sessionData, id));
    }
    return labelArray;
}
*/


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

    // Frenzy as sessionData
/*
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
*/

    // CHI2015 sessionData
    for (var i in sessionData) {
        // console.log(id);
        if (sessionData[i]["submissions"].indexOf(id) != -1) {
            // console.log(id, sessionData[i]["id"]);
            return sessionData[i]["id"];
        }
    }
    return "";
}
