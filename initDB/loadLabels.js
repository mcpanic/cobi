var fs = require('fs');
var data = require("./data-final.json"); // assume Frenzy format json without "data = " part
data = data.items
var labels = {};

for (var i in data){
    for (var j in data[i].labels){
	if(data[i].labels[j].checked){
	    if(j in labels) {labels[j]+=1;}
	    else labels[j] = 1;
	}
    }
}

var out = [];
for(var i in labels){
    if(labels[i] > 2)
	out.push(i);
}
out.sort(
    function(a, b) {
	if (a.toLowerCase() < b.toLowerCase()) return -1;
	if (a.toLowerCase() > b.toLowerCase()) return 1;
	return 0;
    }
);
console.log(out);