
var mysql      = require('mysql');
var connection = mysql.createConnection({
    host     : 'mysql.csail.mit.edu',
    user     : 'cobi',
    password : 'su4Biha',
    database : 'cobiCHI2015Dev'
});

var honorableMentions = [
"pn123",
"pn134",
"pn136",
"pn148",
"pn160",
"pn167",
"pn206",
"pn207",
"pn248",
"pn323",
"pn332",
"pn362",
"pn399",
"pn409",
"pn414",
"pn422",
"pn448",
"pn448",
"pn462",
"pn464",
"pn528",
"pn545",
"pn551",
"pn581",
"pn592",
"pn605",
"pn652",
"pn682",
"pn688",
"pn699",
"pn747",
"pn780",
"pn787",
"pn815",
"pn851",
"pn862",
"pn885",
"pn904",
"pn917",
"pn919",
"pn922",
"pn936",
"pn982",
"pn1045",
"pn1045",
"pn1046",
"pn1048",
"pn1055",
"pn1059",
"pn1073",
"pn1086",
"pn1095",
"pn1144",
"pn1156",
"pn1167",
"pn1187",
"pn1189",
"pn1195",
"pn1256",
"pn1257",
"pn1280",
"pn1355",
"pn1386",
"pn1391",
"pn1424",
"pn1426",
"pn1552",
"pn1558",
"pn1583",
"pn1641",
"pn1682",
"pn1689",
"pn1893",
"pn1940",
"pn1945",
"pn1972",
"pn1991",
"pn2022",
"pn2032",
"pn2122",
"pn2165",
"pn2212",
"pn2310",
"pn2312",
"pn2336",
"pn2352",
"pn2375",
"pn2421",
"pn2423",
"pn2447",
"pn2473",
"pn2480",
"pn2491",
"pn2494",
"pn2539",
"pn2578",
"pn2578",
"pn2582",
"pn2586",
"pn2629",
"pn2680"
];

var bestPapers = [
"pn115",
"pn144",
"pn261",
"pn328",
"pn366",
"pn400",
"pn450",
"pn481",
"pn564",
"pn598",
"pn638",
"pn849",
"pn1367",
"pn1458",
"pn1528",
"pn1533",
"pn2108",
"pn2146",
"pn2191",
"pn2341",
"pn2486"
];

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


