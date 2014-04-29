var fs = require('fs')
var sessions = require('./CobiSessions.json')
sessions = sessions['data']

var schedule = createScheduleData(sessions);

fs.writeFile("CobiSchedule.json", JSON.stringify(schedule, null, 4), function(err) {});
console.log("....schedule file created.");

function getRooms(sessions){
    var roomMap = {}
    sessions.map(function(x) { if(x.Room != null) roomMap[x.Room] = true})
    var rooms = []
    for(var i in roomMap)
	rooms.push(i)
    return rooms;
}

function getDateTime(sessions){
    var datetime = {};
    sessions.map(function(x) { 
//	if(x.Program == "Symposia") {
	    if (!(x.Key_Date in datetime)) datetime[x.Key_Date] = {};
	    if (!(x.Key_StartTime in datetime[x.Key_Date]))
		datetime[x.Key_Date][x.Key_StartTime + "-" +  x.EndTime] = true;
//	}
    });
    
    var slots = [];
    for(var d in datetime){
	for(var st in datetime[d]){
	    if(d != 'null' && st != 'null')
		slots.push({"date": d,
			    "time": st,
			   });
	}
    }
    return slots;
}

function getSession(sessions, date, time, room, endTime){
    var s = sessions.filter(function (x) { return x.Key_Date == date &&
					  x.Key_StartTime + "-" + x.EndTime == time && 
					  x.Room == room })
    if (s.length > 0){
	return s[0];
    }
    else 
	return null;
}

function createScheduleData(sessions){
    var schedule = [];
    var rooms = getRooms(sessions);
    var slots = getDateTime(sessions);
    console.log(rooms)
    console.log(slots)
    var slotId = 100; 
    var sessionCount = 0;
    for(var i = 0; i < rooms.length; i++){
	for(var j = 0; j < slots.length; j++){
	    var s = getSession(sessions, slots[j].date, slots[j].time, rooms[i], slots[j].endTime);

	    var slot = { 
		"id" : "slot" + slotId,
		"date" : slots[j].date,
		"time" : slots[j].time,
		"room" : rooms[i],
		"sessionId" : (s == null ? "" : s.Key_SessionID)
	    };
	    if(s != null){
		schedule.push(slot);
		slotId+=1;
	    }
	    
	}
    }
    
    return schedule;
}

