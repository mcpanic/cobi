var csv = require("csv");
var fs = require('fs');

var mysql      = require('mysql');
var connection = mysql.createConnection({
    host     : 'mysql.csail.mit.edu',
    user     : 'cobi',
    password : 'su4Biha',
    database : 'cobiCHI2014'
});

var honorableMentions = [
    "pn2268",
    "pn1110",
    "pn1428",
    "pn602",
    "pn113",
    "pn1257",
    "pn292",
    "pn224",
    "pn1745",
    "pn2225",
    "pn1057",
    "pn529",
    "pn1475",
    "pn673",
    "pn2317",
    "pn2303",
    "pn626",
    "pn734",
    "pn1742",
    "pn164",
    "pn1704",
    "pn2266",
    "pn802",
    "pn1773",
    "pn787",
    "pn286",
    "pn750",
    "pn2488",
    "pn493",
    "pn737",
    "pn2372",
    "pn2328",
    "pn581",
    "pn558",
    "pn1351",
    "pn1482",
    "pn794",
    "pn2216",
    "pn1642",
    "pn641",
    "pn1298",
    "pn2368",
    "pn1448",
    "pn241",
    "pn228",
    "pn435",
    "pn1811",
    "pn866",
    "pn2103",
    "pn288",
    "pn2208",
    "pn883",
    "pn1472",
    "pn239",
    "pn297",
    "pn648",
    "pn2054",
    "pn1264",
    "pn1471",
    "pn2029",
    "pn2153",
    "pn1199",
    "pn1238",
    "pn718",
    "pn758",
    "pn2010",
    "pn2140",
    "pn169",
    "pn898",
    "pn2525",
    "pn2011",
    "pn2159",
    "pn2168",
    "pn1978",
    "pn119",
    "pn728",
    "pn2214",
    "pn1490",
    "pn1651",
    "pn1020",
    "pn361",
    "pn1103",
    "pn650",
    "pn2150",
];

var bestPapers = [
    "pn1330",
    "pn739",
    "pn692",
    "pn389",
    "pn751",
    "pn2220",
    "pn736",
    "pn1377",
    "pn428",
    "pn142",
    "pn1241",
    "pn2244",
    "pn2105",
    "pn1325",
    "pn138",
    "pn2022",
    "pn1982",
    "pn1700",
    "pn967",
    "pn1255",
    "pn1485"
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


