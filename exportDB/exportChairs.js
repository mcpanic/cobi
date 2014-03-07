var fs = require('fs');
var mysql      = require('mysql');
var connection = mysql.createConnection({
    host     : 'mysql.csail.mit.edu',
    user     : 'cobi',
    password : 'su4Biha',
    database : 'cobiCHI2014'
});

connection.connect();
connection.query('select sessionChairs.id, session.title, givenName, familyName, email from sessionChairs inner join session on sessionChairs.id=session.id',
		 function(err, rows, fields){
		     var output = "id,title,givenName,familyName,email\n"
		     for(var i = 0; i < rows.length; i++){
			 output += rows[i]['id'] + ","  + "\"" + rows[i]['title'] + "\"," + rows[i]['givenName'] + "," + rows[i]['familyName'] + "," + rows[i]['email'] + "\n"
		     }
		     fs.writeFile('chairs.csv', output, function(err){});
		 });
connection.end()

