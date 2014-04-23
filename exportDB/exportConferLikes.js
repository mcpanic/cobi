var fs = require('fs');

var OUTFILE = "confer-likes.csv";

var mysql      = require('mysql');
var connection = mysql.createConnection({
    host     : 'mysql.csail.mit.edu',
    user     : 'cobi',
    password : 'su4Biha',
    database : 'cobiCHI2014'
});

connection.connect();
connection.query("set names 'latin1'", function(err, rows, fields){ if(err) throw err;});

connection.query('select authr.givenName, authr.familyName, authr.email, authr.authorId, authrsrc.id, authrsrc.great, authrsrc.interested from authorsourcing as authrsrc, authors as authr where authrsrc.authorId=authr.authorId and authr.id = authrsrc.id', function(err, rows, fields) {
    if (err) throw err;
    var likes = rows;
    outputLikes(likes);
    connection.end();
});

function outputLikes(likes){
    var authors = {};
    for(var i = 0; i < likes.length; i++){
	if(likes[i].authorId in authors){
	    var author = authors[likes[i].authorId];
	    author.great = author.great + "," + likes[i].great;
	    author.interested = author.interested + "," + likes[i].interested;
	}else{
	    authors[likes[i].authorId] = likes[i];
	}
    }

    var outputStr = "";
    for(var a in authors){
//	outputStr += authors[a].authorId + ",";
	var likeData = uniq(authors[a].interested.split(",")).join(";");
	if(likeData =="") continue;
	outputStr += authors[a].email+","+authors[a].givenName+","+authors[a].familyName+",";
	outputStr += likeData;
	outputStr += "\n";
    }
    console.log(outputStr);
    fs.writeFile(OUTFILE, outputStr, function(err) {});
}


function uniq(ary) {
    var prim = {"boolean":{}, "number":{}, "string":{}}, obj = [];
    var res = ary.filter(function(x) {
        var t = typeof x;
        return (t in prim) ? 
            !prim[t][x] && (prim[t][x] = 1) :
            obj.indexOf(x) < 0 && obj.push(x);
    });
    console.log(res.join(";"));
    return res;
}
