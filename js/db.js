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
    (function poll(e){
	console.log("polling with " + e.transactionId);
	setTimeout(function(){
		$.ajax({    url: "./php/loadDBtoJSONCompact.php",
			    type: 'POST',
			    data: {uid: e.uid, transactionId: e.transactionId},   
			    success: function(m){
			    // something has changed
			    if(m != null){
				var serverSchedule = m['schedule'];
				var serverUnscheduled = m['unscheduled'];
				var serverSlots = m['slots'];
				var serverTransactions = m['transactions'];
				var serverUnscheduledSubmissions = m['unscheduledSubmissions'];
				if(schedule != null){
				    var consistencyReport = checkConsistent(serverSchedule, 
									    serverUnscheduled,
									    serverUnscheduledSubmissions,
									    serverSlots, 
									    serverTransactions);
				    if(consistencyReport.isConsistent){
					console.log("still consistent");
				    }else{
					//				    alert("there is an inconsistency in data!");
				    }
				}
			    }else{// nothing changed, nothing to do
				console.log("nothing changed");
			    }
			    poll((function(){
				    if(transactions.length == 0){
					return {uid: userData.id, transactionId: 0};
				    }else{
					return {uid: userData.id, transactionId: transactions[transactions.length -1]['id']};
				    }})());
			}, 
			    error : function(m){
			    //alert(JSON.stringify(m));
			},
			    dataType: "json"});
	    }, 15000);
    })((function(){
	    if(transactions.length == 0){
		return {uid: userData.id, transactionId: 0};
	    }else{
		return {uid: userData.id, transactionId: transactions[transactions.length -1]['id']};
	    }})());
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
		$(document).trigger('transactionUpdate', [transactions[transactions.length -1]]);
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
	    	console.log("unscheduleSession success", m);
		transactions.push(m);
		$(document).trigger('transactionUpdate', [transactions[transactions.length -1]]);
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
		$(document).trigger('transactionUpdate', [transactions[transactions.length -1]]);
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
		$(document).trigger('transactionUpdate', [transactions[transactions.length -1]]);
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
		$(document).trigger('transactionUpdate', [transactions[transactions.length -1]]);
 	    },
	    error : function(m){
		alert(JSON.stringify(m));
	    },
	    dataType: "json"
	});
}

DB.prototype.swapWithUnscheduledSession = function(s1id, 
						   s2id, s2date, s2time, s2room, uid){
    
    $.ajax({
 	    async: true,
	    type: 'POST',
	    data: { type: 'swapWithUnscheduled', 
		    s1id: s1id,
		    s2id: s2id,
		    s2date: s2date,
		    s2time: s2time,
		    s2room: s2room,
		    uid: uid
	    }, 
	    url: "./php/changeSchedule.php",
	    success: function(m){
		transactions.push(m);
		$(document).trigger('transactionUpdate', [transactions[transactions.length -1]]);
 	    },
	    error : function(m){
		alert(JSON.stringify(m));
	    },
	    dataType: "json"
	});
}
    
////// paper level operations
    DB.prototype.reorderPapers = function(id, newPaperOrder, previousPaperOrder, uid){
    $.ajax({
	    async: true,
	    type: 'POST',
	    data: { type: 'reorderPapers',
		    id: id,
		    newPaperOrder: newPaperOrder.join(),
		    previousPaperOrder: previousPaperOrder.join(),
		    uid: uid
	    }, 
	    url: "./php/changeSchedule.php",
	    success: function(m){
		transactions.push(m);
		$(document).trigger('transactionUpdate', [transactions[transactions.length -1]]);
 	    },
	    error : function(m){
		alert(JSON.stringify(m));
	    },
	    dataType: "json"
	});
}
    
DB.prototype.swapPapers = function(s1id, p1id, s2id, p2id, uid){
    $.ajax({
	    async: true,
	    type: 'POST',
	    data: { type: 'swapPapers',
		    s1id: s1id,
		    p1id: p1id,
		    s2id: s2id,
		    p2id: p2id,
		    uid: uid
	    }, 
	    url: "./php/changeSchedule.php",
	    success: function(m){
		transactions.push(m);
		$(document).trigger('transactionUpdate', [transactions[transactions.length -1]]);
 	    },
	    error : function(m){
		alert(JSON.stringify(m));
	    },
	    dataType: "json"
	});
}

DB.prototype.swapWithUnscheduledPaper = function(p1id, s2id, p2id, uid){
    $.ajax({
	    async: true,
	    type: 'POST',
	    data: { type: 'swapWithUnscheduledPaper',
		    p1id: p1id,
		    s2id: s2id,
		    p2id: p2id,
		    uid: uid
	    }, 
	    url: "./php/changeSchedule.php",
	    success: function(m){
		transactions.push(m);
		$(document).trigger('transactionUpdate', [transactions[transactions.length -1]]);
 	    },
	    error : function(m){
		alert(JSON.stringify(m));
	    },
	    dataType: "json"
	});
}

DB.prototype.movePaper = function(s1id, p1id, s2id, uid){
    $.ajax({
	    async: true,
	    type: 'POST',
	    data: { type: 'movePaper',
		    s1id: s1id,
		    p1id: p1id,
		    s2id: s2id,
		    uid: uid
	    }, 
	    url: "./php/changeSchedule.php",
	    success: function(m){
		transactions.push(m);
		$(document).trigger('transactionUpdate', [transactions[transactions.length -1]]);
 	    },
	    error : function(m){
		alert(JSON.stringify(m));
	    },
	    dataType: "json"
	});
}

DB.prototype.unschedulePaper = function(sid, pid, uid){
    $.ajax({
	    async: true,
	    type: 'POST',
	    data: { type: 'unschedulePaper',
		    sid: sid,
		    pid: pid,
		    uid: uid
	    }, 
	    url: "./php/changeSchedule.php",
	    success: function(m){
		transactions.push(m);
		$(document).trigger('transactionUpdate', [transactions[transactions.length -1]]);
 	    },
	    error : function(m){
		alert(JSON.stringify(m));
	    },
	    dataType: "json"
	});
}
    
DB.prototype.schedulePaper = function(sid, pid, uid){
    $.ajax({
	    async: true,
	    type: 'POST',
	    data: { type: 'schedulePaper',
		    sid: sid,
		    pid: pid,
		    uid: uid
	    }, 
	    url: "./php/changeSchedule.php",
	    success: function(m){
		transactions.push(m);
		$(document).trigger('transactionUpdate', [transactions[transactions.length -1]]);
 	    },
	    error : function(m){
		alert(JSON.stringify(m));
	    },
	    dataType: "json"
	});
}
    

    
