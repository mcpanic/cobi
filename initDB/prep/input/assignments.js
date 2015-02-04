
// 9:30-10:50
// 11:30-12:50
// 14:30-15:50
// 16:30-17:50
/*
    var rooms = ["Hall D1", "401", "E5", "E6", "E1/E2", "402", "E3", "E4", "403", "307ABC", "308ABC", "317A", "317BC", "E7", "318BC", "318A"];

    var slots = [
            {"date": "Monday, 04-19", "time": "11:30-12:50"},
            {"date": "Monday, 04-19", "time": "14:30-15:50"},
            {"date": "Monday, 04-19"," time": "16:30-17:50"},
            {"date": "Tuesday, 04-20", "time": "9:30-10:50"},
            {"date": "Tuesday, 04-20", "time": "11:30-12:50"},
            {"date": "Tuesday, 04-20", "time": "14:30-15:50"},
            {"date": "Tuesday, 04-20"," time": "16:30-17:50"},
            {"date": "Wednesday, 04-21", "time": "9:30-10:50"},
            {"date": "Wednesday, 04-21", "time": "11:30-12:50"},
            {"date": "Wednesday, 04-21", "time": "14:30-15:50"},
            {"date": "Wednesday, 04-21"," time": "16:30-17:50"},
            {"date": "Thursday, 04-22", "time": "9:30-10:50"},
            {"date": "Thursday, 04-22", "time": "11:30-12:50"},
            {"date": "Thursday, 04-22", "time": "14:30-15:50"},
    ];
*/
// ignore anything with XX
var altchiRooms = ["308ABC"];
var altchis = [
    "Monday,11:30-12:50,alt1",
    "Monday,14:30-15:50,alt2",
    "Monday,16:30-17:50,alt3",
    "Tuesday,9:30-10:50,alt4",
    "Tuesday,11:30-12:50,alt5"
];

var altchiAssigns = {
    "alt1":{"title":"temp name",
	    "submissions":""},
    "alt2":{"title":"temp name",
        "submissions":""},
    "alt3":{"title":"temp name",
        "submissions":""},
    "alt4":{"title":"temp name",
        "submissions":""},
    "alt5":{"title":"temp name",
        "submissions":""}
};

var panelRooms = ["307ABC"];
var panels = [
    "Monday,11:30-12:50,panel1",
    "Monday,16:30-17:50,panel2",
    "Tuesday,11:30-12:50,panel3",
    "Tuesday,16:30-17:50,panel4",
    "Wednesday,11:30-12:50,panel5",
    "Wednesday,16:30-17:50,panel6",
    "Thursday,11:30-12:50,panel7"
];

var panelAssigns = {
    "panel1": {"submissions":""},
    "panel2": {"submissions":""},
    "panel3": {"submissions":""},
    "panel4": {"submissions":""},
    "panel5": {"submissions":""},
    "panel6": {"submissions":""},
    "panel7": {"submissions":""},
}

var courseRooms = ["317A", "317BC", "E7", "318BC"];
var courses = [
	       "Monday,11:30-12:50,XXX,XXX,XXX,XXX",
	       "Monday,14:30-15:50,XXX,XXX,XXX,XXX",
	       "Monday,16:30-17:50,XXX,XXX,XXX,XXX",
	       "Tuesday,9:30-10:50,XXX,XXX,XXX,XXX",
	       "Tuesday,11:30-12:50,XXX,XXX,XXX,XXX",
	       "Tuesday,14:30-15:50,XXX,XXX,XXX,XXX",
	       "Tuesday,16:30-17:50,XXX,XXX,XXX,XXX",
	       "Wednesday,9:30-10:50,XXX,XXX,XXX,XXX",
	       "Wednesday,11:30-12:50,XXX,XXX,XXX,XXX",
	       "Wednesday,14:30-15:50,XXX,XXX,XXX,XXX",
	       "Wednesday,16:30-17:50,XXX,XXX,XXX,XXX",
	       "Thursday,9:30-10:50,XXX,XXX,XXX,XXX",
	       "Thursday,11:30-12:50,XXX,XXX,XXX,XXX"
];

var sigRooms = ["318A"];
var sigs = [
        "Monday,11:30-12:50,XXX",
	    "Monday,14:30-15:50,XXX",
	    "Monday,16:30-17:50,XXX",
	    "Tuesday,11:30-12:50,XXX",
	    "Tuesday,16:30-17:50,XXX",
	    "Wednesday,11:30-12:50,XXX",
	    "Thursday,11:30-12:50,XXX",
	    "Thursday,14:30-15:50,XXX"
];

var paperRooms = ["401", "E5", "E6", "E1/E2", "402", "E3", "E4", "403", "307ABC"];
var papersByPersona = [
	      "Monday,11:30-12:50,XXX,XXX,XXX,XXX,XXX,XXX,XXX,XXX,XXX",
	      "Monday,14:30-15:50,XXX,XXX,XXX,XXX,XXX,XXX,XXX,XXX,XXX",
	      "Monday,16:30-17:50,XXX,XXX,XXX,XXX,XXX,XXX,XXX,XXX,XXX",
	      "Tuesday,9:30-10:50,XXX,XXX,XXX,XXX,XXX,XXX,XXX,XXX,XXX",
	      "Tuesday,11:30-12:50,XXX,XXX,XXX,XXX,XXX,XXX,XXX,XXX,XXX",
	      "Tuesday,14:30-15:50,XXX,XXX,XXX,XXX,XXX,XXX,XXX,XXX,XXX",
	      "Tuesday,16:30-17:50,XXX,XXX,XXX,XXX,XXX,XXX,XXX,XXX,XXX",
	      "Wednesday,9:30-10:50,XXX,XXX,XXX,XXX,XXX,XXX,XXX,XXX,XXX",
	      "Wednesday,11:30-12:50,XXX,XXX,XXX,XXX,XXX,XXX,XXX,XXX,XXX",
	      "Wednesday,14:30-15:50,XXX,XXX,XXX,XXX,XXX,XXX,XXX,XXX,XXX",
	      "Wednesday,16:30-17:50,XXX,XXX,XXX,XXX,XXX,XXX,XXX,XXX,XXX",
	      "Thursday,9:30-10:50,XXX,XXX,XXX,XXX,XXX,XXX,XXX,XXX,XXX",
	      "Thursday,11:30-12:50,XXX,XXX,XXX,XXX,XXX,XXX,XXX,XXX,XXX",
	      "Thursday,14:30-15:50,XXX,XXX,XXX,XXX,XXX,XXX,XXX,XXX,XXX"
];
var papers = [
          "Monday,11:30-12:50,XXX,XXX,XXX,XXX,XXX,XXX,XXX,XXX,XXX",
          "Monday,14:30-15:50,XXX,XXX,XXX,XXX,XXX,XXX,XXX,XXX,XXX",
          "Monday,16:30-17:50,XXX,XXX,XXX,XXX,XXX,XXX,XXX,XXX,XXX",
          "Tuesday,9:30-10:50,XXX,XXX,XXX,XXX,XXX,XXX,XXX,XXX,XXX",
          "Tuesday,11:30-12:50,XXX,XXX,XXX,XXX,XXX,XXX,XXX,XXX,XXX",
          "Tuesday,14:30-15:50,XXX,XXX,XXX,XXX,XXX,XXX,XXX,XXX,XXX",
          "Tuesday,16:30-17:50,XXX,XXX,XXX,XXX,XXX,XXX,XXX,XXX,XXX",
          "Wednesday,9:30-10:50,XXX,XXX,XXX,XXX,XXX,XXX,XXX,XXX,XXX",
          "Wednesday,11:30-12:50,XXX,XXX,XXX,XXX,XXX,XXX,XXX,XXX,XXX",
          "Wednesday,14:30-15:50,XXX,XXX,XXX,XXX,XXX,XXX,XXX,XXX,XXX",
          "Wednesday,16:30-17:50,XXX,XXX,XXX,XXX,XXX,XXX,XXX,XXX,XXX",
          "Thursday,9:30-10:50,XXX,XXX,XXX,XXX,XXX,XXX,XXX,XXX,XXX",
          "Thursday,11:30-12:50,XXX,XXX,XXX,XXX,XXX,XXX,XXX,XXX,XXX",
          "Thursday,14:30-15:50,XXX,XXX,XXX,XXX,XXX,XXX,XXX,XXX,XXX"
];


module.exports = {
    altchiRooms : altchiRooms,
    altchis : altchis,
    altchiAssigns: altchiAssigns,
    panelRooms : panelRooms,
    panels: panels,
    panelAssigns: panelAssigns,
    courseRooms : courseRooms,
    courses : courses,
    sigRooms : sigRooms,
    sigs : sigs,
    paperRooms : paperRooms,
    papers: papers
}

