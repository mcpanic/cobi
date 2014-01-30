var csv = require("csv");
var fs = require('fs');
var updatedTitles = {};
var OUTFILE = 'cscwTitles.json'
getData();

function getData(){
    var parser = csv();
    
    parser.on("record", function (row, index){
	updatedTitles[row['ID'].trim().replace('\t', '')] = row['Paper Final Title'];
    }); 
    parser.from.options({
	columns: true,
	delimiter: ','
    });
    parser.from('final_titles.csv');

    parser.on("end", function(){
	fs.writeFile(OUTFILE, JSON.stringify(updatedTitles, null, 4), function(err) {});
	
    });
    
    
}