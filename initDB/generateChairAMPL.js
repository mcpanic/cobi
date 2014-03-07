var fs = require('fs')
var chairs = require('./chairAffinities.json');

var ignoreList = ['s-alt1', 's-alt2', 's-alt3', 's-alt4', 's-alt5', 's-alt6', 's-case-1', 's-case-2', 's-case-3'];
var chairIgnore = ['chair-CS-1', 'chair-CS-2', 'chair-CS-3']

generateDataFile()

function generateDataFile(){
    var output = "set CHAIRS := ";
    var chairsOut = "";
    var sessions = "";
    
    for(var i in chairs){
	if(isEmpty(chairs[i].affinity) || chairIgnore.indexOf(i) >= 0) continue;
	chairsOut += i + " "
    }
	
    output += chairsOut + ";\n\nset SESSIONS := "
    
    for(var i in chairs){
	for(var j in chairs[i].committeeMatch){
	    if(ignoreList.indexOf(j) >= 0) continue;
	    sessions += j + " "
	}
	break;
    }
    output += sessions + ";\n\nparam fit: \n"
    output += chairsOut + ":=\n"
    
    for(var s in chairs['1001'].committeeMatch){
	if(ignoreList.indexOf(s) >= 0) continue;
	output += s + ' ';
	var aff = ''
	for(var i in chairs){
	    if(isEmpty(chairs[i].affinity) || chairIgnore.indexOf(i) >= 0) continue;
	    aff += (parseInt(chairs[i].affinity[s]) * chairs[i].canChair[s]) + " "
	}
	output+= aff + "\n"
    }
    output = output.replace(/^\s+|\s+$/g, '');
    output += ";\n"
    fs.writeFile('chair.dat', output, function(err){});
}

function isEmpty(map) {
    for(var key in map) {
	if (map.hasOwnProperty(key)) {
	    return false;
	}
    }
    return true;
}


