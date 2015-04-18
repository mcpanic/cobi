var fs = require('fs');
var mysql      = require('mysql');
var connection = mysql.createConnection({
    host     : 'mysql.csail.mit.edu',
    user     : 'cobi',
    password : 'su4Biha',
    database : 'cobiCHI2015Dev'
});

connection.connect();
connection.query("set names 'latin1'", function(err, www, fields){
    if(err) throw err;


var roomTrackMapping = {
    "401": "A",
    "402": "B",
    "403": "C",
    "E1/E2": "D",
    "E3": "E",
    "E4": "F",
    "E5": "G",
    "E6": "H",
    "E7": "I",
    "307": "J",
    "308": "K",
    "317A": "L",
    "317BC": "M",
    "318A": "N",
    "318BC": "O",
    "Hall D1": "Z"
};

// PCS File Format
// "ID","Date","Time","End Time","Track","Title","Chair(s)","Location","Notes","Web Page","Submission IDs"


    connection.query('select session.id,date,time,room,title,submissions,sessionChairs.givenName, sessionChairs.familyName, sessionChairs.primaryAff from session left outer join sessionChairs on sessionChairs.authorId=session.chairs where scheduled=1',
             function(err, rows, fields){
             var output = "ID,Date,Time,End Time,Track,Title,Chair(s),Location,Notes,Web Page,Submission IDs\n"
             for(var i = 0; i < rows.length; i++){
                // To ensure that IDs are integers, we're not using rows[i]['id'], but i as the first column
                var newID = i; // rows[i]['id']
                var newDate = "";
                if (rows[i]['date'] == "Monday") newDate = "\"Apr 20, 2015\"";
                else if (rows[i]['date'] == "Tuesday") newDate = "\"Apr 21, 2015\"";
                else if (rows[i]['date'] == "Wednesday") newDate = "\"Apr 22, 2015\"";
                else if (rows[i]['date'] == "Thursday") newDate = "\"Apr 23, 2015\"";

                outputArray = [i+1, newDate, rows[i]['time'].split('-')[0], rows[i]['time'].split('-')[1], roomTrackMapping[rows[i]['room']], "\"" + removeHTMLTags(rows[i]['title']) + "\"", "\"" + getChair(rows[i]) + "\"", "\"" + rows[i]['room'] + "\"", "", "", getSubmission(rows[i]['submissions'], 0) + " " + getSubmission(rows[i]['submissions'], 1) + " " + getSubmission(rows[i]['submissions'], 2) + " " + getSubmission(rows[i]['submissions'], 3) + " " + getSubmission(rows[i]['submissions'], 4) + " " + getSubmission(rows[i]['submissions'], 5)];
                output += outputArray.join(",") + "\n";
             }
             fs.writeFile('sessions.csv', output, function(err){});
             connection.end()
             });
});

//    connection.query('select session.id,session.date, session.time, session.room, sessionChairs.id, session.title, session.submissions, givenName, familyName, primaryAff, email from sessionChairs inner join session on sessionChairs.id=session.id',


/*
    connection.query('select session.id,date,time,room,title,submissions,sessionChairs.givenName, sessionChairs.familyName, sessionChairs.primaryAff from session left outer join sessionChairs on sessionChairs.authorId=session.chairs where scheduled=1',
		     function(err, rows, fields){
			 var output = "ID,Date,Time,End Time,Track,Title,Chair(s) First Name,Chair(s) Last Name,Chair Affiliation,ChairAffiliation Country,Location,Notes,CHI code,Web Page,Submission ID1,Submission ID2,Submission ID3,Submission ID4,Submission ID5,Submission ID6\n"
			 for(var i = 0; i < rows.length; i++){
			     outputArray = [rows[i]['id'], rows[i]['date'], rows[i]['time'].split('-')[0], rows[i]['time'].split('-')[1], "", "\"" + rows[i]['title'] + "\"", rows[i]['givenName'], rows[i]['familyName'], getAffName(JSON.parse(rows[i]['primaryAff'])), getAffLoc(JSON.parse(rows[i]['primaryAff'])), rows[i]['room'], "", "", "", getSubmission(rows[i]['submissions'], 0), getSubmission(rows[i]['submissions'], 1), getSubmission(rows[i]['submissions'], 2), getSubmission(rows[i]['submissions'], 3), getSubmission(rows[i]['submissions'], 4), getSubmission(rows[i]['submissions'], 5)];
			     output += outputArray.join(",") + "\n";
			 }
			 fs.writeFile('sessions.csv', output, function(err){});
			 connection.end()
		     });
});
*/

// Remove any HTML tag from the text
function removeHTMLTags(text) {
    var result = text.replace(/(<([^>]+)>)/ig,"");
    // console.log(result);
    return result;
    // var div = document.createElement("div");
    // div.innerHTML = text;
    // return div.textContent || div.innerText || "";
}

function getChair(row){
    if (row['givenName'] != null && row['familyName'] != null)
        return row['givenName'] + " " + row['familyName'];
    return "";
}

function getAffName(aff){
    if(aff != null && 'institution' in aff) {
	return "\"" + aff['institution'] + "\""
    }
    else return ""
}

function getAffLoc(aff){
    if(aff != null && 'country' in aff) {
	return aff['country']
    }
    else return ""
}

function getSubmission(subs, i) {
    var subArr = subs.split(",")
    if(i < subArr.length) {
        // Detect TOCHI (pn51xx) and change to jrn1xx)
        if (subArr[i].indexOf("pn51") == 0 && subArr[i].length == 6) {
            var newName = "jrn1" + subArr[i].substr(4);
            console.log(subArr[i], "->", newName);
            return newName;
        }
        if (subArr[i] == "award1") {
            return "talks105";
        }
        if (subArr[i] == "award2") {
            return "talks106";
        }
        if (subArr[i] == "award3") {
            return "talks107";
        }
        // Blacklist: rejected but still in session
        if (subArr[i] == "pn965")
            return "";
	    return subArr[i];
    }
    else return "";
}