var csv = require("csv")
var fs = require('fs')
var ld = require('ld')
var natural = require('natural'),
TfIdf = natural.TfIdf,
tfidf = new TfIdf()

var committees = {
    'V-Specific' : [
	'pn1120',
	'pn1182',
	'pn1290',
	'pn1298',
	'pn1354',
	'pn1362',
	'pn1377',
	'pn1413',
	'pn1446',
	'pn1514',
	'pn1623',
	'pn1684',
	'pn1736',
	'pn1745',
	'pn1814',
	'pn1817',
	'pn1821',
	'pn1845',
	'pn2200',
	'pn2214',
	'pn223',
	'pn2268',
	'pn2274',
	'pn2284',
	'pn2293',
	'pn2487',
	'pn431',
	'pn443',
	'pn686',
	'pn761',
	'pn787',
	'pn883',
	'pn884',
	'pn950'],
    'B-Specific' : [
	'pn1192',
	'pn1399',
	'pn1454',
	'pn1475',
	'pn1525',
	'pn155',
	'pn1617',
	'pn169',
	'pn1707',
	'pn1724',
	'pn1811',
	'pn191',
	'pn1915',
	'pn1976',
	'pn2005',
	'pn2054',
	'pn2103',
	'pn2112',
	'pn2134',
	'pn2226',
	'pn2227',
	'pn2244',
	'pn2276',
	'pn2399',
	'pn248',
	'pn2522',
	'pn399',
	'pn521',
	'pn664',
	'pn737',
	'pn757'
    ],
    'V-Specific' : [
	'pn1055',
	'pn1171',
	'pn121',
	'pn122',
	'pn1264',
	'pn1281',
	'pn1423',
	'pn1482',
	'pn1569',
	'pn1632',
	'pn164',
	'pn1700',
	'pn1704',
	'pn1773',
	'pn1800',
	'pn1923',
	'pn2001',
	'pn2115',
	'pn2242',
	'pn245',
	'pn404',
	'pn444',
	'pn541',
	'pn714',
	'pn739',
	'pn845',
	'pn906',
	'pn975'],
    'Interaction Beyond the Individual' : [
	'pn1009',
	'pn1014',
	'pn1032',
	'pn1123',
	'pn1236',
	'pn1255',
	'pn1296',
	'pn1330',
	'pn1333',
	'pn1341',
	'pn1343',
	'pn1347',
	'pn1375',
	'pn1470',
	'pn150',
	'pn1558',
	'pn1642',
	'pn1675',
	'pn1727',
	'pn1763',
	'pn180',
	'pn1867',
	'pn1881',
	'pn1896',
	'pn1918',
	'pn1954',
	'pn2074',
	'pn2095',
	'pn2208',
	'pn2225',
	'pn2235',
	'pn2277',
	'pn2343',
	'pn2401',
	'pn2488',
	'pn263',
	'pn286',
	'pn340',
	'pn419',
	'pn490',
	'pn514',
	'pn526',
	'pn558',
	'pn590',
	'pn641',
	'pn653',
	'pn671',
	'pn677',
	'pn751',
	'pn763',
	'pn802',
	'pn924'
    ],
    'Interaction Using Specific Capabilities or Modalities': 
    [
	'pn1081',
	'pn111',
	'pn1186',
	'pn1193',
	'pn1225',
	'pn1337',
	'pn138',
	'pn1472',
	'pn1488',
	'pn1586',
	'pn1587',
	'pn1628',
	'pn1635',
	'pn1796',
	'pn183',
	'pn1865',
	'pn1911',
	'pn1983',
	'pn1992',
	'pn208',
	'pn2096',
	'pn233',
	'pn235',
	'pn241',
	'pn2424',
	'pn2442',
	'pn288',
	'pn337',
	'pn366',
	'pn371',
	'pn385',
	'pn389',
	'pn395',
	'pn438',
	'pn495',
	'pn549',
	'pn621',
	'pn648',
	'pn673',
	'pn718',
	'pn728',
	'pn730',
	'pn734',
	'pn775',
	'pn791',
	'pn796',
	'pn876',
	'pn916',
	'pn966'],
    'R-Design': [
	'pn118',
	'pn1183',
	'pn1241',
	'pn1252',
	'pn1262',
	'pn1448',
	'pn1517',
	'pn1518',
	'pn1758',
	'pn1859',
	'pn1949',
	'pn2016',
	'pn2020',
	'pn2046',
	'pn2129',
	'pn2216',
	'pn2303',
	'pn2327',
	'pn2358',
	'pn2368',
	'pn2420',
	'pn279',
	'pn320',
	'pn534',
	'pn547',
	'pn576',
	'pn586',
	'pn687',
	'pn701',
	'pn866',
	'pn941',
	'pn967'],
    'B-Design' : [
	'pn1034',
	'pn1095',
	'pn1190',
	'pn1199',
	'pn1268',
	'pn1428',
	'pn1442',
	'pn1452',
	'pn1579',
	'pn1626',
	'pn1667',
	'pn1682',
	'pn1709',
	'pn1710',
	'pn1750',
	'pn1820',
	'pn189',
	'pn1904',
	'pn1942',
	'pn2011',
	'pn2048',
	'pn2140',
	'pn216',
	'pn2193',
	'pn2220',
	'pn2330',
	'pn2406',
	'pn555',
	'pn581',
	'pn614',
	'pn704',
	'pn758',
	'pn810',
	'pn887',
	'pn999',
    ],
    'Interaction Techniques and Devices':[
	'pn1007',
	'pn1046',
	'pn113',
	'pn1200',
	'pn1222',
	'pn1316',
	'pn1336',
	'pn1360',
	'pn142',
	'pn147',
	'pn1471',
	'pn1473',
	'pn1513',
	'pn1583',
	'pn1783',
	'pn1872',
	'pn1883',
	'pn1936',
	'pn198',
	'pn2010',
	'pn2022',
	'pn2029',
	'pn2031',
	'pn2041',
	'pn2090',
	'pn2157',
	'pn222',
	'pn2266',
	'pn228',
	'pn2372',
	'pn2432',
	'pn2441',
	'pn2449',
	'pn2451',
	'pn2454',
	'pn2464',
	'pn264',
	'pn330',
	'pn343',
	'pn372',
	'pn425',
	'pn428',
	'pn464',
	'pn525',
	'pn529',
	'pn583',
	'pn589',
	'pn654',
	'pn755',
	'pn756',
	'pn794',
	'pn896',
	'pn977',
	'pn988',
    ],
    'V-Understanding':[
	'pn1036',
	'pn1071',
	'pn1092',
	'pn1110',
	'pn119',
	'pn1203',
	'pn1227',
	'pn1238',
	'pn1242',
	'pn1295',
	'pn1325',
	'pn1351',
	'pn139',
	'pn1398',
	'pn1414',
	'pn1417',
	'pn1425',
	'pn166',
	'pn190',
	'pn219',
	'pn255',
	'pn272',
	'pn292',
	'pn345',
	'pn361',
	'pn386',
	'pn400',
	'pn405',
	'pn420',
	'pn426',
	'pn455',
	'pn493',
	'pn601',
	'pn626',
	'pn657',
	'pn691',
	'pn750',
	'pn785',
	'pn799',
	'pn838',
	'pn862',
	'pn897',
	'pn905',
	'pn951',
    ],
    'D-Understanding':[
	'pn1293',
	'pn1410',
	'pn1490',
	'pn1549',
	'pn1646',
	'pn1732',
	'pn1742',
	'pn1756',
	'pn1760',
	'pn1806',
	'pn1834',
	'pn1850',
	'pn186',
	'pn1901',
	'pn1916',
	'pn1932',
	'pn1978',
	'pn1982',
	'pn1987',
	'pn2105',
	'pn2117',
	'pn2119',
	'pn2128',
	'pn2153',
	'pn2159',
	'pn2160',
	'pn2175',
	'pn2202',
	'pn2203',
	'pn2294',
	'pn2317',
	'pn2328',
	'pn2380',
	'pn2394',
	'pn2417',
	'pn2463',
	'pn2489',
	'pn2525',
	'pn2560',
	'pn532'
    ],
    'Technology, Systems and Engineering': [
	'pn104',
	'pn1057',
	'pn1161',
	'pn1179',
	'pn1237',
	'pn1372',
	'pn1421',
	'pn1426',
	'pn1460',
	'pn1485',
	'pn1503',
	'pn1651',
	'pn171',
	'pn1776',
	'pn1958',
	'pn1969',
	'pn205',
	'pn2168',
	'pn224',
	'pn239',
	'pn2447',
	'pn2483',
	'pn271',
	'pn276',
	'pn297',
	'pn313',
	'pn505',
	'pn650',
	'pn672',
	'pn736',
	'pn983',
    ],
    'User experience and usability': [
	'pn1015',
	'pn1020',
	'pn1097',
	'pn1099',
	'pn1103',
	'pn116',
	'pn1188',
	'pn1257',
	'pn1269',
	'pn1275',
	'pn1282',
	'pn1447',
	'pn1521',
	'pn1670',
	'pn1722',
	'pn1818',
	'pn2003',
	'pn2027',
	'pn2084',
	'pn2094',
	'pn2150',
	'pn2472',
	'pn2490',
	'pn250',
	'pn319',
	'pn435',
	'pn602',
	'pn639',
	'pn643',
	'pn683',
	'pn692',
	'pn806',
	'pn847',
	'pn898',
	'pn965',
    ]
}


var parser = csv()
var committeeMembers = [];

var mysql      = require('mysql');
var connection = mysql.createConnection({
    host     : 'mysql.csail.mit.edu',
    user     : 'cobi',
    password : 'su4Biha',
    database : 'cobiCHI2014'
});

var connection2 = mysql.createConnection({
    host     : 'mysql.csail.mit.edu',
    user     : 'cobi',
    password : 'su4Biha',
    database : 'cobiCHI'
});

var yearLookup = {
    '2013' : connection2,
    '2014' : connection
}

parser.on("record", 
	  function (row, index) {
	      committeeMembers.push(row);
	  });

parser.from.options({
    columns: true
});

parser.from('committee.csv');
parser.on("end", function(){
    matchAuthors(committeeMembers)
})

var arrayUnique = function(a) {
    return a.reduce(function(p, c) {
        if (p.indexOf(c) < 0) p.push(c);
        return p;
    }, []);
};

function matchAuthors(cm){
    var missed = 0;
    var authors = [];
    var entities = [];
    var chairs = {};
    var sessions = [];
    connection.connect();
    connection.query("set names 'latin1'", function(err, rows, fields){ 
	connection.query('SELECT * from authors', function(err, rows, fields) {
	    authors = rows;
	    for(var i in authors) authors[i]['year'] = '2014';
	    connection2.query('SELECT * from authors', function(err, rows2, fields) {
		for(var i in rows2) rows2[i]['year'] = '2013';
		authors = authors.concat(rows2)
		
		connection.query('SELECT id, abstract, title, keywords from entity', function(err, rows3, fields){
		    for(var i in rows3) rows3[i]['year'] = '2014';
		    entities = rows3;
		    
		    connection2.query('SELECT id, abstract, title, keywords from entity', function (err, rows4, fields){
			for(var i in rows4) rows4[i]['year'] = '2013';
			entities = entities.concat(rows4);
			connection.query("select id,title,venue,submissions,date,time from session where scheduled=1 and (venue='paper' or venue='altchi' or venue='casestudy')",function(err, rows5, fields){
			    sessions = rows5;
			    
			    // 1. Gather session information
			    for(var i = 0; i < sessions.length; i++){
				var submissions = sessions[i].submissions.split(',')
				sessions[i].abstracts = submissions.map(function(x) { return entities.filter(function(y) { return x == y.id && y.year == '2014'})[0].abstract}).join('\n ');
				var dateIndex = {'Monday':'mon', 'Tuesday':'tue', 'Wednesday':'we', 'Thursday':'thu'};
				sessions[i].ti = dateIndex[sessions[i]['date']] + (parseInt(sessions[i]['time'].split(':')[0]) < 12 ? 1 : 2);
			    }

			    // 2. Gather Chair Information
			    for(var i = 0; i < cm.length; i++){
				chairs[cm[i]['ID']] = {
				    'authorId' : "chair"+i,
				    'records' : [],
				    'abstracts' : "",
				    'firstname' : cm[i]['First Name'],
				    'lastname' : cm[i]['Last Name'],
				    'email' : cm[i]['Email'],
				    'available' : {
					'mon1' : cm[i]['mon1'],
					'mon2' : cm[i]['mon2'],
					'tue1' : cm[i]['tue1'],
					'tue2' : cm[i]['tue2'],
					'we1' : cm[i]['we1'],
					'we2' : cm[i]['we2'],
					'thu1' : cm[i]['thu1'],
					'thu2' : cm[i]['thu2'],
				    },
				    'subcommittee' : cm[i]['Subcommittee']
				}
				
				var match = authors.filter(function (x) {return ld.computeDistance(x.familyName + ' ' + x.givenName, cm[i]['Last Name'] + cm[i]['First Name']) < 1 || x.email == cm[i].Email
									});
				if(match.length == 0){ // No info about this person
				    missed+=1;
				}else{  // found past records on this cat
				    chairs[cm[i]['ID']]['authorId'] = match[0].authorId;
				    chairs[cm[i]['ID']]['records'] = match;
				    chairs[cm[i]['ID']]['abstracts'] = lookupAbstracts(match, entities);
				}
			    }
			    
			    // 3. Note who can chair which sessions
			    for(var i in chairs){
				chairs[i].canChair = {};
				chairs[i].committeeMatch = {};
				for(var j = 0; j < sessions.length; j++){
				    if(chairs[i].subcommittee in committees){
					var matches = committees[chairs[i].subcommittee]
					
					chairs[i].committeeMatch[sessions[j].id] = sessions[j].submissions.split(',').map(function(x){ return (matches.indexOf(x) >= 0 ? 1 : 0)}).reduce(function(a, b) {
					    return a + b;
					}) 
				    }
				    
				    chairs[i].canChair[sessions[j].id] = (chairs[i]['available'][sessions[j].ti] > 0 ? 1 : 0);
				    
				    if(sessions[j].submissions.split(',').map(function (sub) {
					return authors.filter(function(author) { return author.year == '2014' && author.id == sub && author.authorId == chairs[i].authorId }).length > 0 
				    }).filter(function (y) {return y == true}).length > 0)
					// can't chair this session because has paper in it
					chairs[i].canChair[sessions[j].id] = 0;
				}
			    }
			    // 4. Compute TF-IDF 
			    natural.PorterStemmer.attach();
			    for(var i = 0; i < sessions.length; i++){
				tfidf.addDocument(sessions[i].abstracts.tokenizeAndStem());
			    }
			    
			    for(var i in chairs){
				// console.log(i)
				chairs[i].affinity = {};
				natural.PorterStemmer.attach();
				if(chairs[i].abstracts == "") continue;
				var tokens = chairs[i].abstracts.tokenizeAndStem();
				var legitTokens = tokens.filter(function (x) { 
				    return tfidf.documents.map(function(y) { return x in y }).filter(function (z) { return z== true }).length > 0})
				//console.log(legitTokens);
				
				tfidf.tfidfs(legitTokens, function(k, measure) {
				    chairs[i].affinity[sessions[k].id] = measure
				});
			    }
			    
			    fs.writeFile('chairAffinities.json', JSON.stringify(chairs, null, 4), function(err) {});
			    connection2.end()
			    connection.end()
			})
		    })
		})
	    })
	})
    })
}

function lookupAbstracts(match, entities){
    return match.map(function (x){
 	var r = entities.filter(function (y) { 
	    return y.id == x.id && y.year == x.year
	})
	return r[0]['title'] + '\n ' +  r[0]['abstract'] + '\n ' + r[0]['keywords']
    }).join('\n ')
}

