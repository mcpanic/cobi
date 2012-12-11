// Include code that interacts with the backend DB

// TODO/Questions
// - should more calls be asynchronous?
// - need to store transactions/undo
// - need to have log in support


function DB(){
}
var db = new DB();

DB.prototype.refresh = function(){
    // Traditional polling to check for changes
    (function poll(){
	setTimeout(function(){
		$.ajax({    url: "./php/loadDBtoJSONCompact.php",
			    success: function(m){
			    var serverSchedule = m['schedule'];
			    var serverUnscheduled = m['unscheduled'];
			    var serverSlots = m['slots'];
			    if(schedule != null){
				var consistencyReport = checkConsistent(serverSchedule, 
									serverUnscheduled, 
									serverSlots);
				if(consistencyReport.isConsistent){
				    console.log("still consistent");
				}else{
				    //				    alert("there is an inconsistency in data!");
				}
			    }
			    poll();
			}, 
			    error : function(m){
			    alert(JSON.stringify(m));
			},
			    dataType: "json"});
	    }, 10000);
    })();
};

DB.prototype.loadSchedule = function(){
	// Read data from the server
    //function loadSchedule(){
    // load scheduled sessions
    $.ajax({
	    async: false,
	    type: 'GET',
	    url: "./php/loadDBtoJSON.php",
	    success: function(m){
		//  alert(JSON.stringify(m));
		schedule = m['schedule'];
		unscheduled = m['unscheduled'];
		scheduleSlots = m['slots'];
	    },
	    error : function(m){
		alert(JSON.stringify(m));
	    },
	    dataType: "json"
	});
};

DB.prototype.toggleSlotLock = function(date, time, room, lock){
    $.ajax({
 	    async: true,
		type: 'POST',
		data: { type: 'lock', 
		    lock: lock,
		    date: date,
		    time: time,
		    room: room
		    }, 
		url: "./php/changeSchedule.php",
		success: function(m){
		
 	    },
		error : function(m){
		alert(JSON.stringify(m));
	    },
		dataType: "json"
		});
}    

DB.prototype.unscheduleSession = function(id, date, time, room){
    $.ajax({
 	    async: false,
	    type: 'POST',
	    data: { type: 'unschedule', 
		    id: id,
		    date: date,
		    time: time,
		    room: room
	    }, 
	    url: "./php/changeSchedule.php",
	    success: function(m){
		
 	    },
	    error : function(m){
		alert(JSON.stringify(m));
	    },
	    dataType: "json"
	});
}; 

DB.prototype.scheduleSession = function(id, date, time, room, endTime){
    $.ajax({
 	    async: false,
	    type: 'POST',
	    data: { type: 'schedule', 
		    id: id,
		    date: date,
		    time: time,
		    room: room,
		    endTime: endTime}, 
		url: "./php/changeSchedule.php",
		success: function(m){		
 	    },
		error : function(m){
		alert(JSON.stringify(m));
	    },
		dataType: "json"
	});
};

DB.prototype.swapSession = function(s1id, s1date, s1time, s1room, 
				    s2id, s2date, s2time, s2room){
    
    $.ajax({
 	    async: false,
		type: 'POST',
		data: { type: 'swap', 
			s1id: s1id,
			s1date: s1date,
			s1time: s1time,
			s1room: s1room,
			s2id: s2id,
			s2date: s2date,
			s2time: s2time,
			s2room: s2room
	    }, 
	    url: "./php/changeSchedule.php",
	    success: function(m){
		
 	    },
	    error : function(m){
		alert(JSON.stringify(m));
	    },
	    dataType: "json"
	});
}
