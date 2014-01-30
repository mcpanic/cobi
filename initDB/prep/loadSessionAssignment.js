var fs = require('fs')
var data = require('./sessions.json')

for(var i = 0; i < data.length; i++){
    if(data[i].persona == ""){
	console.log(data[i].title +","+data[i].id);
    }
    else{
	console.log(data[i].persona+","+data[i].id);
    }
}