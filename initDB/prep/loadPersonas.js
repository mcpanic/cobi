var fs = require('fs');
var data = require("./data-final.json"); // assume Frenzy format json without "data = " part
data = data.sessions
var personas = {};


for (var i in data){
    if(i.indexOf(": ") != -1){
	personas[i.split(":")[0]] = true;
    }
}

for (var i in personas)
    console.log(i);
