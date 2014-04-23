var fs = require('fs');
var mysql      = require('mysql');
var connection = mysql.createConnection({
    host     : 'mysql.csail.mit.edu',
    user     : 'cobi',
    password : 'su4Biha',
    database : 'cobiCHI2014'
});

connection.connect();
connection.query("set names 'latin1'", function(err, www, fields){ 
    if(err) throw err;
    
//    connection.query('select session.id,session.date, session.time, session.room, sessionChairs.id, session.title, session.submissions, givenName, familyName, primaryAff, email from sessionChairs inner join session on sessionChairs.id=session.id',
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




function getAffName(aff){
    if(aff != null && 'institution' in aff) {
	//	console.log(aff['institution'])
	return "\"" + aff['institution'] + "\""
    }
    else return ""
}

function getAffLoc(aff){
    if(aff != null && 'country' in aff) {
//	console.log(aff['institution'])
	return aff['country']
    }
    else return ""
}

function getSubmission(subs, i) {
    var subArr = subs.split(",")
    if(i < subArr.length)
	return subArr[i]
    else return ""
}