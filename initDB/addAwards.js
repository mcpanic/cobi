var csv = require("csv");
var fs = require('fs');

var mysql      = require('mysql');
var connection = mysql.createConnection({
    host     : 'mysql.csail.mit.edu',
    user     : 'cobi',
    password : 'su4Biha',
    database : 'cobi'
});

var honorableMentions = ['cscw223',
			 'cscw431',
			 'cscw471',
			 'cscw527',
			 'cscw128',
			 'cscw147',
			 'cscw204',
			 'cscw209',
			 'cscw299',
			 'cscw358',
			 'cscw411',
			 'cscw432',
			 'cscw588',
			 'cscw599',
			 'cscw609'
			];

var bestPapers =  ['cscw240',
		   'cscw244',
		   'cscw285',
		   'cscw389'];

connection.connect();
connection.query('SELECT id, session from entity', function(err, rows, fields) {
    if (err) throw err;

    // do best papers
    for(var i = 0; i < bestPapers.length; i++){
	var p = bestPapers[i];
	var query1 = "UPDATE entity SET bestPaperAward=1 where id='" + p + "';";
	var s = (rows.filter(function (x) { return x.id == p }))[0].session;
	var query2 = "UPDATE session SET hasAward=1 where id='" + s + "';";


	connection.query(query1, function(err, rows, fields) {});
	connection.query(query2, function(err, rows, fields) {});
    }

    // do honorable mentions
    for(var i = 0; i < honorableMentions.length; i++){
	var p = honorableMentions[i];
	var query1 = "UPDATE entity SET bestPaperNominee=1 where id='" + p + "';";
	var s = (rows.filter(function (x) { return x.id == p }))[0].session;
	var query2 = "UPDATE session SET hasHonorableMention=1 where id='" + s + "';";

	connection.query(query1, function(err, rows, fields) {});
	connection.query(query2, function(err, rows, fields) {});
    }
    
    connection.end();
});


