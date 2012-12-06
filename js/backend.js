// function loadSchedule(){
//    $.ajax({
// 	    type: 'GET',
// 		url: "http://people.csail.mit.edu/hqz/cobi/php/loadDBtoJSON.php",
// 	       success: function(m){
// 	       alert(JSON.stringify(m, undefined, 2));
// 	   },
// 	       dataType: "json"
// 	       });
// }

function createDatabase() {
    $.ajax({
	    type: 'POST',
		url: "http://people.csail.mit.edu/hqz/cobi/php/createDb.php",
		data: 
	    {test: "hi"},
		success: function(m){
		alert(m);
	 		       },
		dataType: "text"
		});
}

function sendJSON() {
    // to avoid data size issues, send one day at a time
    for(var date in schedule){
	$.ajax({
		type: 'POST',
		    async: false,
		    url: "http://people.csail.mit.edu/hqz/cobi/php/initDBfromJSON.php",
		    data: {date: date,
			mydata: JSON.stringify(schedule[date])},
		    success: function(m){
		    alert(m);
		},
		    error: function(e){
		    console.log(e.message);
		}
	    });
    }
}
