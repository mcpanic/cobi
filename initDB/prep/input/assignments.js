
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
var altchiRooms = ["308"];
var altchis = [
    "Monday,11:30-12:50,alt1",
    "Monday,14:30-15:50,alt2",
    "Monday,16:30-17:50,alt3",
    "Tuesday,9:30-10:50,alt4",
    "Tuesday,11:30-12:50,alt5"
];

var altchiAssigns = {
    "alt1":{"title":"temp alt.chi", "submissions":""},
    "alt2":{"title":"temp alt.chi", "submissions":""},
    "alt3":{"title":"temp alt.chi", "submissions":""},
    "alt4":{"title":"temp alt.chi", "submissions":""},
    "alt5":{"title":"temp alt.chi", "submissions":""}
};

var panelRooms = ["307"];
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
    "panel1": {"title":"temp panel", "submissions":""},
    "panel2": {"title":"temp panel", "submissions":""},
    "panel3": {"title":"temp panel", "submissions":""},
    "panel4": {"title":"temp panel", "submissions":""},
    "panel5": {"title":"temp panel", "submissions":""},
    "panel6": {"title":"temp panel", "submissions":""},
    "panel7": {"title":"temp panel", "submissions":""},
}

var courseRooms = ["308", "317A", "317BC", "E7", "318BC"];
var courses = [
	       "Monday,11:30-12:50,XXX,crs108,crs128,crs113,crs132",
	       "Monday,14:30-15:50,XXX,crs135,crs112,crs118,crs111",
	       "Monday,16:30-17:50,XXX,crs135,crs112,crs118,crs111",
	       "Tuesday,9:30-10:50,XXX,crs122,crs100,crs129,crs106",
	       "Tuesday,11:30-12:50,XXX,crs122,crs100,crs129,crs106",
	       "Tuesday,14:30-15:50,XXX,crs134,crs133,crs109,crs131",
	       "Tuesday,16:30-17:50,XXX,crs134,crs133,crs109,crs131",
	       "Wednesday,9:30-10:50,XXX,crs101,XXX,crs116,crs121",
	       "Wednesday,11:30-12:50,XXX,crs101,XXX,crs116,crs121",
	       "Wednesday,14:30-15:50,crs115,crs104,XXX,crs117,crs107",
	       "Wednesday,16:30-17:50,crs115,crs104,XXX,crs117,crs107",
	       "Thursday,9:30-10:50,XXX,XXX,crs138,crs119,crs110",
	       "Thursday,11:30-12:50,XXX,XXX,crs103,crs124,XXX"
];

var sigRooms = ["318A"];
var sigs = [
        "Monday,11:30-12:50,sig1",
	    "Monday,14:30-15:50,sig2",
	    "Monday,16:30-17:50,sig3",
	    "Tuesday,11:30-12:50,sig4",
	    "Tuesday,16:30-17:50,sig5",
	    "Wednesday,11:30-12:50,sig6",
	    "Thursday,11:30-12:50,sig7",
	    "Thursday,14:30-15:50,sig8"
];
var sigAssigns = {
    "sig1": {"title":"temp SIG", "submissions":""},
    "sig2": {"title":"temp SIG", "submissions":""},
    "sig3": {"title":"temp SIG", "submissions":""},
    "sig4": {"title":"temp SIG", "submissions":""},
    "sig5": {"title":"temp SIG", "submissions":""},
    "sig6": {"title":"temp SIG", "submissions":""},
    "sig7": {"title":"temp SIG", "submissions":""},
    "sig8": {"title":"temp SIG", "submissions":""},
}

var casestudiesRooms = ["308"];
var casestudies = [
        "Tuesday,14:30-15:50,case1",
        "Wednesday,9:30-10:50,case2",
        "Thursday,9:30-10:50,case3",
        "Thursday,11:30-12:50,case4",
        "Thursday,14:30-15:50,case5"
];
var caseAssigns = {
    "case1": {"title":"temp casestudy", "submissions":""},
    "case2": {"title":"temp casestudy", "submissions":""},
    "case3": {"title":"temp casestudy", "submissions":""},
    "case4": {"title":"temp casestudy", "submissions":""},
    "case5": {"title":"temp casestudy", "submissions":""}
}

var paperRooms = ["401", "E5", "E6", "E1/E2", "402", "E3", "E4", "403", "307"];
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
    sigAssigns: sigAssigns,
    casestudiesRooms: casestudiesRooms,
    casestudies: casestudies,
    caseAssigns: caseAssigns,
    paperRooms : paperRooms,
    papers: papers
}

