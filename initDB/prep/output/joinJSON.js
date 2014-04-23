// joins JSON arrays into one big JSON array
// usage: node joinJSON.js outfile i1 i2 i3 ....
var fs = require('fs')

var files = [];
var output = "outfile";
process.argv.forEach(function (val, index, array) {
    if(index == 2) output = val
    if(index >= 3) files = files.concat(require("./" + val))
});

fs.writeFile("./joined/" + output, JSON.stringify(files, null, 4), function(err) {});

