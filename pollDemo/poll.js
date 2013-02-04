var schedule = null; // the schedule/session data structure
var unscheduled = null; // the unscheduled sessions
var unscheduledSubmissions = null; // the unscheduled papers/submissions
var scheduleSlots = null; // which slots are locked
var transactions = []; // transaction records

$(document).ready(function() {
    loadSchedule();
});

// Load the latest schedule initially
function loadSchedule(){
    $.ajax({
	async: true,
	type: 'POST',
	url: "http://people.csail.mit.edu/hqz/cobi/pollDemo/loadSchedule.php",
	data: {lastId: 0},
	success: function(m){
	    schedule = m['schedule'];
	    unscheduled = m['unscheduled'];
	    unscheduledSubmissions = m['unscheduledSubmissions'];
	    scheduleSlots = m['slots'];
	    transactions = m['transactions'];

	    displaySchedule();
	    keepRefreshing(); // polls and displays changes as they are made
	},
	error : function(m){
	    alert(JSON.stringify(m));
	},
	dataType: "json"
    });
};

// displays the schedule in the view
// TODO: this is just a demo/debug tool. You can do with this data as you wish...
function displaySchedule(){
    $('#debug').append("<br/><b>Current Data</b><br/>");
    // demonstrating how to traverse the schedule data
    for(var day in schedule){
	for(var time in schedule[day]){
	    for(var room in schedule[day][time]){
		for(var s in schedule[day][time][room]){
		    var subKeys = [];
		    for(var sub in schedule[day][time][room][s]['submissions']){
			$('#debug').append(day + ", " + time + ", " + room + ", " + s + ": " + 
					   schedule[day][time][room][s]['submissions'][sub] + '<br/>');
		    }}}}}
    
    // demonstrating how to traverse the unscheduled data
    $('#debug').append('<br/>Unscheduled sessions:<br/>');
    for(var item in unscheduled){
	$('#debug').append(item + "<br/>");
    }
    // demonstrating how to traverse the unscheduled submissions data
    $('#debug').append('<br/>Unscheduled submissions:<br/>');
    for(var item in unscheduledSubmissions){
	$('#debug').append(item + "<br/>");
    }

    // demonstrating how to traverse the scheduleSlots to see what's locked
    $('#debug').append('<br/>Locked slots:<br/>');
    for(var day in scheduleSlots){
	for(var time in scheduleSlots[day]){
	    for(var room in scheduleSlots[day][time]){
		if(scheduleSlots[day][time][room]['locked'] == 1){
		    $('#debug').append("locked: " + day + ", " + time + ", " + room + "<br/>");
		}
	    }
	}
    }
    
    // demonstrating how to traverse the transaction records
    $('#debug').append('<br/>Latest transaction records:<br/>');
    for (t in transactions){
	if(t < transactions.length - 5){
	    continue;
	}else{
	    $('#debug').append(JSON.stringify(transactions[t]) + '<br/>');
	}
    }
}


var keepRefreshing = function(){
    // Traditional polling to check for changes
    (function poll(e){
	console.log("polling with " + e.transactionId);
	setTimeout(function(){
	    $.ajax({    url: "http://people.csail.mit.edu/hqz/cobi/pollDemo/loadSchedule.php",
			type: 'POST',
			data: {lastId: e.transactionId},   
			success: function(m){
			    // something has changed
			    if(m != null){
				var serverSchedule = m['schedule'];
				var serverUnscheduled = m['unscheduled'];
				var serverSlots = m['slots'];
				var serverTransactions = m['transactions'];
				var serverUnscheduledSubmissions = m['unscheduledSubmissions'];
				var changes = detectChanges(serverSchedule, 
							    serverUnscheduled,
							    serverUnscheduledSubmissions,
							    serverSlots, 
							    serverTransactions);
				makeChanges(serverSchedule, 
					    serverUnscheduled,
					    serverUnscheduledSubmissions,
					    serverSlots, 
					    serverTransactions);
				handleChangesInView(changes);
			    }
			    poll((function(){
				if(transactions.length == 0){
				    return {transactionId: 0};
				}else{
				    return {transactionId: transactions[transactions.length -1]['id']};
				}})());
			}, 
			error : function(m){
			    console.log(JSON.stringify(m));
			},
			dataType: "json"});
	}, 15000);
    })((function(){
	if(transactions.length == 0){
	    return {transactionId: 0};
	}else{
	    return {transactionId: transactions[transactions.length -1]['id']};
	}})());
};

function keys(obj){
    var keys = [];
    for(var key in obj){
	if(obj.hasOwnProperty(key))
	    keys.push(key);
    }
    return keys;
}

function arraysEqual(arr1, arr2) {
    if(arr1.length != arr2.length)
	return false;
    for(var i = 0; i < arr1.length; i++) {
	if(arr1[i] != arr2[i])
	    return false;
    }
    return true;
}

// Decide what to do with the changes that's been made
// TODO: for now this just displays them. Assumes data is already updated, so it's just a matter of updating the view
function handleChangesInView(changes){
    $('#debug').html("");
    $('#debug').append("<b>Latest Changes<b/> " + "<br/>");
    
    if(changes.scheduleChange.length > 0){
	$('#debug').append("schedule change: " + "<br/>");
	for(change in changes.scheduleChange){
	    $('#debug').append(JSON.stringify(changes.scheduleChange[change]) + "<br/>");
	}
    }
    
    if(changes.sessionChange.length > 0){
	$('#debug').append("session change: " + "<br/>");
	for(change in changes.sessionChange){
	    $('#debug').append(JSON.stringify(changes.sessionChange[change]) + "<br/>");
	}
    }

    if(changes.lockChange.length > 0){
	$('#debug').append("lock change: " + "<br/>");
	for(change in changes.lockChange){
	    $('#debug').append(JSON.stringify(changes.lockChange[change]) + "<br/>");
	}
    }
    if(changes.unscheduledChange)
	$('#debug').append("unscheduled sessions have changed<br/>");
    
    if(changes.unscheduledSubmissionsChange)
	$('#debug').append("unscheduled submissions have changed<br/>");
    
    
    // display the schedule under the changes
    displaySchedule();
}

// Updates current data with latest from the server
function makeChanges(serverSchedule, serverUnscheduled, serverUnscheduledSubmissions, serverSlots, serverTransactions){
    // add new transactions
    for(var i = 0; i < serverTransactions.length; i++){
	transactions.push(serverTransactions[i]);
    }
    // copy over the entire new data
    schedule = serverSchedule;
    unscheduled = serverUnscheduled;
    unscheduledSubmissions = serverUnscheduledSubmissions;
    scheduleSlots = serverSlots;
}

// Look for where the changes have been made
function detectChanges(serverSchedule, serverUnscheduled, serverUnscheduledSubmissions, serverSlots, serverTransactions){
    var scheduleChange = [];
    var sessionChange = [];
    var lockChange = [];
    var unscheduledChange = false;
    var unscheduledSubmissionsChange = false;
    
    for(var day in schedule){
	for(var time in schedule[day]){
	    for(var room in schedule[day][time]){
		
		if(!arraysEqual(keys(schedule[day][time][room]).sort(), 
				keys(serverSchedule[day][time][room]).sort())){
		    scheduleChange.push({'date': day, 'time': time, 'room': room});
		}else{
		    // check that papers are the same too
		    for(var s in schedule[day][time][room]){
			if(!arraysEqual(schedule[day][time][room][s]['submissions'],
					serverSchedule[day][time][room][s]['submissions'])){
			    sessionChange.push({'session': s, 'date': day, 'time': time, 'room': room});
			}
		    }
		}
	    }
	}
    }
    
    // Check for changes to locks
    for(var day in scheduleSlots){
	for(var time in scheduleSlots[day]){
	    for(var room in scheduleSlots[day][time]){
		if(scheduleSlots[day][time][room]['locked'] !=
		   serverSlots[day][time][room]['locked']){
		    lockChange.push({'date': day, 'time':time, 'room':room});
		}
	    }
	}
    }
    
    if(!arraysEqual(keys(unscheduled).sort(),  keys(serverUnscheduled).sort())){
	// trigger a change in unscheduled data
	unscheduledChange = true;
    }
    
    ///// check if unscheduled papers match
    if(!arraysEqual(keys(unscheduledSubmissions).sort(),  keys(serverUnscheduledSubmissions).sort())){
	// trigger a change in unscheduled submissions data
	unscheduledSubmissionsChange = true;
    }
    
    return { scheduleChange: scheduleChange,
	     sessionChange: sessionChange,
	     lockChange: lockChange,
	     unscheduledChange: unscheduledChange,
	     unscheduledSubmissionsChange: unscheduledSubmissionsChange
	   };
}

