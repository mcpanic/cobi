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
			    //alert(JSON.stringify(m));
			},
			    dataType: "json"});
	    }, 10000);
    })();
};

DB.prototype.loadUser = function(uid){
    $.ajax({
	    async: true,
	    type: 'POST',
	    data: {uid: uid},   
	    url: "./php/loadUser.php",
	    success: function(m){
		if(m != null){
		    userData = new userInfo(m['uid'], m['name'], m['email'], m['type']);
		}else{
		    //		    userData = new userInfo(null, "Anon", null, "rookie");
		}
	    },
	    error : function(m){
		alert(JSON.stringify(m));
	    },
	    dataType: "json"
	});
};

DB.prototype.loadSchedule = function(){
	// Read data from the server
    //function loadSchedule(){
    // load scheduled sessions
    $.ajax({
	    async: true,
	    type: 'GET',
	    url: "./php/loadDBtoJSON.php",
	    success: function(m){
		initAfterScheduleLoads(m);
	    },
	    error : function(m){
		alert(JSON.stringify(m));
	    },
	    dataType: "json"
	});
};

DB.prototype.undo = function(uid){
    $.ajax({
 	    async: true,
		type: 'POST',
		data: { type: 'undo', 
			uid: uid,
	         }, 
		url: "./php/changeSchedule.php",
		success: function(m){
		if(m == null){
		    //alert("You do not have undo privileges");
		}else{
		    
		    // should return something like 
		    // checkConsistency...
		}
 	    },
	    error : function(m){
		alert(JSON.stringify(m));
	    },
	    dataType: "json"
	});
}    


DB.prototype.toggleSlotLock = function(date, time, room, lock, uid){
    $.ajax({
 	    async: true,
		type: 'POST',
		data: { type: 'lock', 
			uid: uid,
		    lock: lock,
		    date: date,
		    time: time,
		    room: room
		    }, 
		url: "./php/changeSchedule.php",
		success: function(m){
		transactions.push(m);
 	    },
		error : function(m){
		alert("lock error: " + JSON.stringify(m));
	    },
		dataType: "json"
		});
}    

    DB.prototype.unscheduleSession = function(id, date, time, room, uid){
    $.ajax({
 	    async: true,
	    type: 'POST',
	    data: { type: 'unschedule', 
		    uid: uid,
		    id: id,
		    date: date,
		    time: time,
		    room: room
	    }, 
	    url: "./php/changeSchedule.php",
	    success: function(m){
		transactions.push(m);
 	    },
	    error : function(m){
		alert(JSON.stringify(m));
	    },
	    dataType: "json"
	});
}; 

DB.prototype.scheduleSession = function(id, date, time, room, uid){
    $.ajax({
 	    async: true,
	    type: 'POST',
	    data: { type: 'schedule', 
		    id: id,
		    date: date,
		    time: time,
		    room: room,
		    uid: uid}, 
		url: "./php/changeSchedule.php",
		success: function(m){		
		transactions.push(m);
 	    },
		error : function(m){
		alert(JSON.stringify(m));
	    },
		dataType: "json"
	});
};

DB.prototype.moveSession = function(id, date, time, room, tdate, ttime, troom, uid){
    $.ajax({
 	    async: true,
	    type: 'POST',
	    data: { type: 'move', 
		    id: id,
		    sdate: date,
		    stime: time,
		    sroom: room,
		    tdate: tdate,
		    ttime: ttime,
		    troom: troom,
		    uid: uid}, 
	    url: "./php/changeSchedule.php",
	    success: function(m){		
		transactions.push(m);
 	    },
	    error : function(m){
		alert(JSON.stringify(m));
	    },
	    dataType: "json"
	});
};


DB.prototype.swapSession = function(s1id, s1date, s1time, s1room, 
				    s2id, s2date, s2time, s2room, uid){
    
    $.ajax({
 	    async: true,
		type: 'POST',
		data: { type: 'swap', 
			s1id: s1id,
			s1date: s1date,
			s1time: s1time,
			s1room: s1room,
			s2id: s2id,
			s2date: s2date,
			s2time: s2time,
			s2room: s2room,
			uid: uid
	    }, 
	    url: "./php/changeSchedule.php",
	    success: function(m){

		transactions.push(m);
 	    },
	    error : function(m){
		alert(JSON.stringify(m));
	    },
	    dataType: "json"
	});
}
