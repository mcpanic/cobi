// replaces assignChairs.php
var fs = require('fs')
var initial = require('./initialChairs.json');
var chairs = require('./chairAffinities.json');
var numChairs = 0;
var numDone = 0;
var mysql      = require('mysql');
var connection = mysql.createConnection({
    host     : 'mysql.csail.mit.edu',
    user     : 'cobi',
    password : 'su4Biha',
    database : 'cobiCHI2014'
});


for(var i in chairs){
    numChairs++
    if(i in initial){
	chairs[i]['session'] = initial[i]
    }else{
	chairs[i]['session'] = ''
    }
}


for(var i in chairs){
    for(var j in chairs[i].affinity){
	chairs[i].affinity[j] = parseInt(chairs[i].affinity[j]) * chairs[i].canChair[j];
    }
}

connection.connect();

for(var i in chairs){
    if(chairs[i].authorId.indexOf('chair') == 0){ // create new chair
	connection.query("insert into sessionChairs (authorId, id, givenName, middleInitial, familyName, email, affinity) values (?, ?, ?, ?, ?, ?, ?)", [chairs[i].authorId, chairs[i].session, chairs[i].firstname.trim(), "", chairs[i].lastname.trim(), chairs[i].email, "{}"], function(err, results) { 
	    console.log(err)
	    postPro()});
	if(chairs[i].session != ""){
	    numChairs++;
	    var authorId = chairs[i].authorId;
	    var sessionId = chairs[i].session;
	    connection.query('update session set chairs=? where id=?', [authorId, sessionId],
			     function(err, results){
				 console.log(err)
				 postPro()
			     })
	}
    }else { // this person exists
	if(chairs[i].session != ""){
	    numChairs++;
	    var authorId = chairs[i].authorId;
	    var sessionId = chairs[i].session;
	    connection.query('insert into sessionChairs (authorId, id, givenName, middleInitial, familyName, email, affinity, primaryAff, secondaryAff) values (?, ?, ?, ?, ?, ?, ?, ?, ?)', [chairs[i].authorId, chairs[i].session, chairs[i].records[0].givenName, chairs[i].records[0].middleInitial, chairs[i].records[0].familyName, chairs[i].records[0].email, JSON.stringify(chairs[i].affinity), chairs[i].records[0].primaryAff, chairs[i].records[0].secondaryAff], function(err, results){
		postPro()
	    });
	    
	    console.log(authorId, sessionId);
	    connection.query('update session set chairs=? where id=?', [authorId, sessionId],
			     function(err, results){
				 console.log(err)
				 postPro()
			     })
	}else{
	    connection.query('insert into sessionChairs (authorId, id, givenName, middleInitial, familyName, email, affinity, primaryAff, secondaryAff) values (?, ?, ?, ?, ?, ?, ?, ?, ?)', [chairs[i].authorId, chairs[i].session, chairs[i].records[0].givenName, chairs[i].records[0].middleInitial, chairs[i].records[0].familyName, chairs[i].records[0].email, JSON.stringify(chairs[i].affinity), chairs[i].records[0].primaryAff, chairs[i].records[0].secondaryAff], function(err, results){
		postPro()
	    })
	}
    }
}


function postPro(){
    numDone++;
    if(numDone == numChairs) connection.end();
    return;
}