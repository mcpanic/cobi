// ignore anything with XX
var courseRooms = ["802AB", "713AB", "709", "711"];
var courses = [
	       "Monday,11:00-12:20,XXX,crs156,XXX,crs124",
	       "Monday,14:00-15:20,crs108-1,crs100-1,crs101-1,crs111-1",	
	       "Monday,16:00-17:20,crs108-2,crs100-2,crs101-2,crs111-2",	
	       "Tuesday,9:00-10:20,crs105-1,crs160,crs129-1,crs122-1",		
	       "Tuesday,11:00-12:20,crs105-2,crs157,crs129-2,crs122-2",	
	       "Tuesday,14:00-15:20,crs137-1,crs153-1,crs102-1,crs149-1",	
	       "Tuesday,16:00-17:20,crs137-2,crs153-2,crs102-2,crs149-2",	
	       "Wednesday,9:00-10:20,crs106-1,crs161,crs147-1,crs143-1",	
	       "Wednesday,11:00-12:20,crs106-2,crs158,crs147-2,crs143-2",	
	       "Wednesday,14:00-15:20,crs115-1,crs123-1,crs113-1,crs121-1",	
	       "Wednesday,16:00-17:20,crs115-2,crs123-2,crs113-2,crs121-2",	
	       "Thursday,9:00-10:20,crs144-1,crs116-1,crs115R-1,crs138-1",	
	       "Thursday,11:00-12:20,crs144-2,crs116-2,crs115R-2,crs138-2",	
	       "Thursday,14:00-15:20,crs136,crs142,XXX,crs146"];

var sigRooms = ["715A"];
var sigs = [
	    "Monday,14:00-15:20,sig108",
	    "Monday,16:00-17:20,sig109",
	    "Tuesday,11:00-12:20,sig117",
	    "Tuesday,14:00-15:20,sig105",
	    "Tuesday,16:00-17:20,sig107",
	    "Wednesday,9:00-10:20,sig119",
	    "Wednesday,11:00-12:20,sig118",
	    "Wednesday,14:00-15:20,sig110",
	    "Wednesday,16:00-17:20,sig103",
	    "Thursday,9:00-10:20,sig111",
	    "Thursday,11:00-12:20,sig112",
	    "Thursday,14:00-15:20,sig114"];

var paperRooms = ["718A","718B","701A","701B","801A","801B","716B","714AB","717AB"];
var papersByPersona = [
	      "Monday,11:00-12:20,UIST,Games,Viz,XXX,UBI,HCI4D,Health,Art,People",
	      "Monday,14:00-15:20,UIST,Games,Viz,XXX,UBI,HCI4D,Health,Art,People",
	      "Monday,16:00-17:20,UIST,Games,Viz,XXX,UBI,HCI4D,Health,Art,People",
	      "Tuesday,9:00-10:20,UIST,Games,Viz,XXX,UBI,HCI4D,Health,Art,People",
	      "Tuesday,11:00-12:20,UIST,Games,Navigating Videos,XXX,Human-Robot Interaction,HCI4D,Health,Art,People",
	      "Tuesday,14:00-15:20,UIST,Making,Information in Use,XXX,XXX,HCI4D,Health,3D,CSCW",
	      "Tuesday,16:00-17:20,UIST,Making,Social,XXX,XXX,HCI4D,Health,3D,CSCW",
	      "Wednesday,9:00-10:20,UIST,Touch,Social,Design,Web,HCI4D,Health,Systems,CSCW",
	      "Wednesday,11:00-12:20,UIST,Touch,Social,Design,Web,HCI4D,Health,Systems,CSCW",
	      "Wednesday,14:00-15:20,UIST,Touch,Social,XXX,Methods and Models,HCI4D,Health,Systems,CSCW",
	      "Wednesday,16:00-17:20,UIST,Displays,Social,Design,Methods and Models,HCI4D,Health,Systems,CSCW",
	      "Thursday,9:00-10:20,UIST,Displays,Social,Design,Methods and Models,HCI4D,Health,Systems,Security",
	      "Thursday,11:00-12:20,UIST,Displays,Social,Transportation,Methods and Models,HCI4D,Health,Systems,Security",
	      "Thursday,14:00-15:20,Making,Displays,Social,Transportation,Methods and Models,HCI4D,PS94,Systems,Security"];
var papers = [
	      "Monday,11:00-12:20,s102,s101,s114,XXX,s129,s100,s104,s140,s111",
	      "Monday,14:00-15:20,s103,s132,s131,XXX,s143,s112,s108,s146,s165",
	      "Monday,16:00-17:20,s109,s162,s135,XXX,s156,s120,s126,s166,s186",
	      "Tuesday,9:00-10:20,s116,s185,s187,XXX,s214,s123,s138,s175,s189",
	      "Tuesday,11:00-12:20,s122,s190,s197,XXX,s174,s128,s151,s206,s201",
	      "Tuesday,14:00-15:20,s130,s105,s118,XXX,XXX,s133,s171,s142,s117",
	      "Tuesday,16:00-17:20,s139,s124,s106,XXX,XXX,s153,s177,s167,s127",
	      "Wednesday,9:00-10:20,s170,s110,s159,s121,s176,s158,s182,s134,s141",
	      "Wednesday,11:00-12:20,s193,s113,s164,s137,s198,s178,s199,s136,s161",
	      "Wednesday,14:00-15:20,s194,s119,s168,XXX,s107,s184,s203,s145,s172",
	      "Wednesday,16:00-17:20,s207,s125,s179,s163,s148,s188,s208,s149,s180",
	      "Thursday,9:00-10:20,s209,s147,s195,s191,s150,s196,s211,s152,s115",
	      "Thursday,11:00-12:20,s213,s154,s200,s155,s173,s202,s212,s181,s157",
	      "Thursday,14:00-15:20,s144,s160,s205,s169,s204,s210,XXX,s192,s183"];


module.exports = {
    courseRooms : courseRooms,
    courses : courses,
    sigRooms : sigRooms,
    sigs : sigs,
    paperRooms : paperRooms,
    papers: papers
}

