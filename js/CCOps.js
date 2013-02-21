function SingleEntityConstraint(type, description, descriptionFunc, importance, rationale, entityRules, constraintObjectRules){
    this.importance = importance;
    this.rationale = rationale;
    this.entityRules = entityRules;
    this.entities = CCOps.belongs(entityRules);
    this.constraintObjectRules = constraintObjectRules;
    this.description = description;
    this.descriptionFunc = descriptionFunc;
    this.type = type;
    this.constraintType = "single";
}

function EntityPairConstraint(type, description, descriptionFunc, importance, rationale, entity1Rules, entity2Rules, relationRules){
    this.importance = importance;
    this.rationale = rationale;
    this.entity1Rules = entity1Rules;
    this.entity2Rules = entity2Rules;
    this.isSymmetric = true;
    if(entity1Rules.length != entity1Rules.length){
	this.isSymmetric = false;
    }else{
	for(var i in entity1Rules){
	    if(!(entity1Rules[i].level == entity2Rules[i].level && 
		 entity1Rules[i].comp + '' == entity2Rules[i].comp + '')){
		this.isSymmetric = false;
		break;
	    }
	}
    }
    this.entities1 = CCOps.belongs(entity1Rules);
    this.entities2 = CCOps.belongs(entity2Rules);
    this.relationRules = relationRules;
    this.description = description;
    this.descriptionFunc = descriptionFunc;
    this.type = type;
    this.constraintType = "pair";
}

function EntityFilterPairConstraint(type, description, descriptionFunc, importance, rationale, entity1Rules, entity2Rules, filterRules, relationRules){
    this.importance = importance;
    this.rationale = rationale;
    this.entity1Rules = entity1Rules;
    this.entity2Rules = entity2Rules;
    this.entities1 = CCOps.belongs(entity1Rules);
    this.entities2 = CCOps.belongs(entity2Rules);
    this.isSymmetric = true;
    this.filterRules = filterRules;
    this.entityPairs = CCOps.legalPathPairs(filterRules, 
					    this.entities1,
					    this.entities2);
    this.relationRules = relationRules;
    this.description = description;
    this.descriptionFunc = descriptionFunc;
    this.type = type;
    this.constraintType = "pairFiltered";
}

function entityTrace(session, submission, author){
    this.session = session;
    this.submission = submission;
    this.author = author;
}

function Rule(level, comp){
    this.level = level;
    this.comp = comp;
}


var CCOps = function(){
    var allConstraints = [];
    var allConflicts = [];
    var authorsourcingData = null;

    function createSingleConflict(violation, constraint){
	var session = allSessions[violation.session];
	return new conflictObject([violation.session],
				  constraint.type,
				  [violation],
				  constraint.descriptionFunc(session, violation));
    }
    function createPairConflict(violationA, violationB, constraint){
	var sessionA = allSessions[violationA.session];
	var sessionB = allSessions[violationB.session];
	return new conflictObject([violationA.session, violationB.session],
				  constraint.type,
				  [violationA, violationB],
				  constraint.descriptionFunc(sessionA, violationA, sessionB, violationB));
    }
    function createSingleHypConflict(violation, constraint, hypSessions){
	var session = allSessions[violation.session];
	if(violation.session in hypSessions){
	    session = hypSessions[violation.session];
	}
	return new conflictObject([violation.session],
				  constraint.type,
				  [violation],
				  constraint.descriptionFunc(session, violation));
    }
    function createPairHypConflict(violationA, violationB, constraint, hypSessions){
	var sessionA = allSessions[violationA.session];
	var sessionB = allSessions[violationB.session];
	if(violationA.session in hypSessions){
	    sessionA = hypSessions[violationA.session];
	}
	if(violationB.session in hypSessions){
	    sessionB = hypSessions[violationB.session];
	}
	return new conflictObject([violationA.session, violationB.session],
				  constraint.type,
				  [violationA, violationB],
				  constraint.descriptionFunc(sessionA, violationA, sessionB, violationB));
    }

    function loadAuthorsourcingData(){
	$.ajax({
 	    async: false,
	    type: 'GET',
	    url: "./php/loadAuthorsourcing.php",
	    success: function(m){	
		if(m != null){
		    CCOps.authorsourcingData = m;
		}
	    },
	    error : function(m){
		console.log("error: " + JSON.stringify(m));
	    },
	    dataType: "json"
	});
    }
    
    function generateSubmissionNotTogetherConstraint(e1, e2){
	var constraint = new EntityPairConstraint("interested",
						  "submissions that should be at different time slots",
						  function (sessionA, violationA, sessionB, violationB){
						      return "'" + sessionA.submissions[violationA.submission].title + "' and '" + 
							  sessionB.submissions[violationB.submission].title + "'" + " should be at different times.";
						  },
 						  -5, 
 						  "this is what an author said",
 						  [new Rule('submission', 
 							    function(x){ 
 								return x.id == e1;
  							    }),
  						  ],
 						  [new Rule('submission',
 							    function (x){
 								return x.id == e2;
							    }),
						      ],
						  [new Rule('session', function(a,b){
						      return !((a.time == b.time) &&
							       (a.date == b.date) &&
							       (a.room != b.room));
						  })]);
//	console.log(constraint);
	return constraint;
    }


    function generateFitInSessionConstraint(e1, e2, type){
	var text = {'great': 'these papers are great together',
		    'ok' : 'these papers are good together',
		    'notsure': 'not sure if these papers are good together',
		    'notok': 'these papers should not be together'};
	var scores = {'great': 10,
		      'ok': 5,
		      'notsure': -5,
		      'notok' : -10};
	var filler = {'great' : ' should be great ',
		      'ok': ' should be ok ',
		      'notsure': ' should probably not be ',
		      'notok': ' should not be '};
	
	var constraint = new EntityPairConstraint(type,
						  text[type],
						  function (sessionA, violationA, sessionB, violationB){
						      return "'" + sessionA.submissions[violationA.submission].title + "' and '" + 
							  sessionB.submissions[violationB.submission].title + "'" + filler[type] + "in the same session.";
						  },
 						  scores[type],
 						  "this is what an author said",
 						  [new Rule('submission', 
 							    function(x){ 
 								return x.id == e1;
  							    }),
  						  ],
 						  [new Rule('submission',
 							    function (x){
 								return x.id == e2;
							    }),
						      ],
						  [new Rule('session', function(a,b){
						      return !(a.id == b.id);
						  })]);
//	console.log(constraint);
	return constraint;
    }
    
    
    function generateAuthorsourcingConstraints(){
	for(var submission in CCOps.authorsourcingData){
	    // generate cohesiveness constraints
	    for(var auth in CCOps.authorsourcingData[submission]){
		var i = CCOps.authorsourcingData[submission][auth].length -1; // ignore dups from same author
//		for(var i in CCOps.authorsourcingData[submission][auth]){
		    var cases = {'great': [], 'ok':[], 'notsure':[],'notok':[]};
		    for(var j in cases){
			cases[j] = CCOps.authorsourcingData[submission][auth][i][j].split(',');
			    for(var k in cases[j]){
				CCOps.allConstraints.push(generateFitInSessionConstraint(submission, cases[j][k], j));
			    }
		    }
	//	}
	    }

	    for(var auth in CCOps.authorsourcingData[submission]){
		var i = CCOps.authorsourcingData[submission][auth].length -1; // ignore dups from same author
		// generate like-so-avoid constraints
		var interestedList = CCOps.authorsourcingData[submission][auth][i]['interested'].split(',');
		interestedList.push(submission);
		for(var j = 0; j < interestedList.length - 1; j++){
		    for(var k = j+1; k < interestedList.length; k++){
			CCOps.allConstraints.push(generateSubmissionNotTogetherConstraint(interestedList[j], interestedList[k]));
		    }
		}
		// generate relevant to special thus avoid
		var relevantList = [];
		if(CCOps.authorsourcingData[submission][auth][i]['relevant'] != ""){
		    relevantList = CCOps.authorsourcingData[submission][auth][i]['relevant'].split(',');
		}
		for(var j = 0; j < relevantList.length; j++){
		    CCOps.allConstraints.push(generateSubmissionNotTogetherConstraint(submission, relevantList[j]));
		}
	    }
	}
    }
	
    function initialize(){
	loadAuthorsourcingData();
	generateAuthorsourcingConstraints();
	console.log("loading finished");
	//     	var example = new SingleEntityConstraint("donat11",
	// 						 "Submissions whose title begin with 'Don' should be at 11am",
	// 						 10,
// 						 "because it's my favorite time and I am a don",
	// 						 [new Rule('submission', 
// 							   function(x){ 
// 							       return Comp.stringStartsWith(x.title, "Don");
// 							   }),
// 						 ],
// 						 [new Rule('session',
// 							   function (x){
// 							       return Comp.timeEquals(x.time, "11:00-12:20");
// 							   }),
// 						  new Rule('session',
// 							   function(x){ // assume a session, a submission, or an author
// 							       return !Comp.dateEquals(x.date, "Monday");
// 							   })]);
	
// 	var example2 = new EntityPairConstraint("danjohn",
// 						"Authors whose first name is Dan should not be in opposing sessions with authors whose first name is John",
// 						100,
// 						"because Dan and John want to see each other's talks",
// 						[new Rule('author', function(x){ return x.firstName == "Dan"})],
// 						[new Rule('author', function(x){ return x.firstName == "John"})],
// 						[new Rule('session', function(a, b){ // assume paths, check not opposing sessions
// 						    return !((a.time == b.time) &&
// 							     (a.date == b.date) &&
// 							     (a.room != b.room));
// 						})]);
	
	 var example3 = new EntityFilterPairConstraint("authorInTwoSessions", 
						       "same author shouldn't be in simultaneous sessions", 
						       function (sessionA, violationA, sessionB, violationB){
							   return sessionA.submissions[violationA.submission].authors[violationA.author].firstName + " " + 
							       sessionA.submissions[violationA.submission].authors[violationA.author].lastName + 
							       " is in both '" + 
							       sessionA.title + "' and '" + sessionB.title + "'.";
						       },
						       -10,
						       "because authors should only have to be at one place at any given time",
						       [new Rule('author', function(x){ return true})],
						       [new Rule('author', function(x){ return true})],
						       [new Rule('author', function(a, b){ return a.authorId == b.authorId }),
							new Rule('session', function(a, b) { return a.id != b.id})], 
						       [new Rule('session', function(a, b){ // assume paths, check not opposing sessions
							   return !((a.time == b.time) &&
								    (a.date == b.date) &&
								    (a.room != b.room));
						       })]);

	 var example4 = new EntityFilterPairConstraint("personaInTwoSessions", 
						       "same persona shouldn't be in simultaneous sessions", 
						       function (sessionA, violationA, sessionB, violationB){
							   return "Someone interested in '" + sessionA.personas + "' may want to see both '" + 
							       sessionA.title + "' and '" + sessionB.title + "'.";
						       },
						       -4,
						       "because someone interested in one may be interested in the other",
						       [new Rule('session', function(x){ return true})],
						       [new Rule('session', function(x){ return true})],
						       [new Rule('session', function(a, b){ return a.personas != "" && 
											    a.personas != "Misc" 
											    && a.personas == b.personas }),
							new Rule('session', function(a, b){ return a.id != b.id})], 
						       [new Rule('session', function(a, b){ // assume paths, check not opposing sessions
							   return !((a.time == b.time) &&
								    (a.date == b.date) &&
 								    (a.room != b.room));
						       })]);
 	var example5 = new EntityPairConstraint("badTogether",
						"example: these papers aren't good together",
						function (sessionA, violationA, sessionB, violationB){
						    return "'" + sessionA.submissions[violationA.submission].title + "' and '" + 
							sessionB.submissions[violationB.submission].title + "' should not be in the same session.";
						},
 						-7,
 						"because they are not related",
 						[new Rule('submission', 
 							  function(x){ 
 							      return x.title.indexOf("Don") != -1;
  							  }),
  						],
 						[new Rule('submission',
 							  function (x){
 							      return x.title.indexOf("Turk") != -1;
							  }),
						],
						[new Rule('session', function(a,b){
						    return !(a.id == b.id);
						})]);
	var example6 = new EntityPairConstraint("goodTogether",
						"example: these papers are good together",
						function (sessionA, violationA, sessionB, violationB){
						    return "'" + sessionA.submissions[violationA.submission].title + "' and '" + 
							sessionB.submissions[violationB.submission].title + "' are good in the same session.";
						},
 						4,
 						"because they are related",
 						[new Rule('submission', 
 							  function(x){ 
 							      return x.title.indexOf("Don") != -1;
  							  }),
  						],
 						[new Rule('submission',
 							  function (x){
 							      return x.title.indexOf("Revisiting") != -1;
							  }),
						],
						[new Rule('session', function(a,b){
						    return !(a.id == b.id);
						})]);

	CCOps.allConstraints.push(example3);
	CCOps.allConstraints.push(example4);
	CCOps.allConstraints.push(example5);
	CCOps.allConstraints.push(example6);
	
	getAllConflicts();
    }
    
    function getAllConflicts(){
	var conflicts = {};
	conflicts["sessions"] = {};
	conflicts["all"] = [];
	for(var session in allSessions)
	    conflicts["sessions"][session] = [];
	
	for(var i in CCOps.allConstraints){
	    var constraintConflicts;
	    if(CCOps.allConstraints[i].constraintType == 'single'){
		constraintConflicts = checkSingleConflicts(CCOps.allConstraints[i]);
	    }else if(CCOps.allConstraints[i].constraintType == 'pair'){
		constraintConflicts = checkPairConflicts(CCOps.allConstraints[i]);
	    }else{// pairFiltered
		constraintConflicts = checkFilteredPairConflicts(CCOps.allConstraints[i]);
	    }
	    conflicts["all"] = conflicts["all"].concat(constraintConflicts);
	    
	    for(var j in constraintConflicts){
		if(constraintConflicts[j].entities.length == 2 && // special case for same session in pair constraint
		   constraintConflicts[j].entities[0] == constraintConflicts[j].entities[1]){
		    var s = constraintConflicts[j].entities[0];
		    conflicts["sessions"][s].push(constraintConflicts[j]);
		}else{
		    for(var k in constraintConflicts[j].entities){
			var s = constraintConflicts[j].entities[k];
			conflicts["sessions"][s].push(constraintConflicts[j]);
		    }
		}
	    }
	}
	CCOps.allConflicts = conflicts;
	return conflicts;
    }
    
    function computeConflictsWithRowAtTimeSlot(s, date, time){
	var ret = {};
	ret["sum"] = [];
	ret["session"] = {};
	for(var room in schedule[date][time]){
	    for(var s2 in schedule[date][time][room]){
		var conflicts = computeNewPairConflicts(s.id, s2, allSessions);
		conflicts = conflicts.concat(computeNewFilteredPairConflicts(s.id, s2, allSessions));
		ret["session"][s2] = conflicts;
		ret["sum"] = ret["sum"].concat(conflicts);
	    }
	}
	return ret;
    }
    
    function computeConflictsWithRow(s){
	var conflictsWithRow = {};
	for(var date in schedule){
	    conflictsWithRow[date] = {}
	    for(var time in schedule[date]){
		conflictsWithRow[date][time] = computeConflictsWithRowAtTimeSlot(s, date, time);
	    }
	}
	return conflictsWithRow;
    }

    function computeAllSingleConflicts(s1, s2){
	var singleConflictsCausedByItem = [];
	if(!(s1 in unscheduled)){
	    for(var i in CCOps.allConflicts["sessions"][s1]){
		if(CCOps.allConflicts["sessions"][s1][i].conflict.length == 1){
		    singleConflictsCausedByItem.push(CCOps.allConflicts["sessions"][s1][i]);
		}
	    }
	}
	var singleConflictsCausedByCandidate = [];
	for(var i in CCOps.allConflicts["sessions"][s2]){
	    if(CCOps.allConflicts["sessions"][s2][i].conflict.length == 1){
		singleConflictsCausedByCandidate.push(CCOps.allConflicts["sessions"][s2][i]);
	    }
	}
	var hypSessions = {};
	var hypS = createHypSessionLoc(allSessions[s1], 
				       allSessions[s2].date, 
				       allSessions[s2].time,
				       allSessions[s2].room);
	var hypS2 = createHypSessionLoc(allSessions[s2], 
					allSessions[s1].date,
					allSessions[s1].time,
					allSessions[s1].room);
	hypSessions[s1] = hypS;
	hypSessions[s2] = hypS2;
	
	var singleConflictsCausedByOffending = computeNewSingleConflicts(s1, hypSessions);
	var singleConflictsCausedByCandidateAtOffending = [];
	if(!(s1 in unscheduled)){
	    singleConflictsCausedByCandidateAtOffending = computeNewSingleConflicts(s2, hypSessions);
	}
	return {conflictsCausedByItem: singleConflictsCausedByItem,
		conflictsCausedByCandidate: singleConflictsCausedByCandidate,
		conflictsCausedByOffending: singleConflictsCausedByOffending,
		conflictsCausedByCandidateAtOffending: singleConflictsCausedByCandidateAtOffending};
    }

    function computeAllSingleConflictsSlot(s1, space){
	var singleConflictsCausedByItem = [];
	if(!(s1 in unscheduled)){
	    for(var i in CCOps.allConflicts["sessions"][s1]){
		if(CCOps.allConflicts["sessions"][s1][i].conflict.length == 1){
		    singleConflictsCausedByItem.push(CCOps.allConflicts["sessions"][s1][i]);
		}
	    }
	}
	var hypSessions = {};
	var hypS = createHypSessionLoc(allSessions[s1], 
				       space.date,
				       space.time,
				       space.room);
	hypSessions[s1] = hypS;
	
	var singleConflictsCausedByOffending = computeNewSingleConflicts(s1, hypSessions);

	return {conflictsCausedByItem: singleConflictsCausedByItem,
		conflictsCausedByCandidate: [],
		conflictsCausedByOffending: singleConflictsCausedByOffending,
		conflictsCausedByCandidateAtOffending: []};
    }


    function computeAllConflictsSlot(s1, space, conflictsWithRow){
	var hypSessions = {};
	var hypS = createHypSessionLoc(allSessions[s1], 
				       space.date,
				       space.time,
				       space.room);
	hypSessions[s1] = hypS;
	var conflictsCausedByOffending = computeNewSingleConflicts(s1, hypSessions);
	
	var conflictsCausedByItem = [];
	if(!(s1 in unscheduled)){
	    for(var i in CCOps.allConflicts["sessions"][s1]){
		// self conflicts do not matter when we swap sessions
		if(CCOps.allConflicts["sessions"][s1][i].entities.length == 2 &&
		   CCOps.allConflicts["sessions"][s1][i].entities[0] == 
		   CCOps.allConflicts["sessions"][s1][i].entities[1]){
		}else{
		    conflictsCausedByItem.push(CCOps.allConflicts["sessions"][s1][i]);
		}
	    }
	}
	
	
	var s = allSessions[s1];
	var date = space.date;
	var time = space.time;

	for(var i = 0; i < conflictsWithRow[date][time]["sum"].length; i++){
	    var item = conflictsWithRow[date][time]["sum"][i];
	    conflictsCausedByOffending.push(item);
	}
		
	return {conflictsCausedByItem: conflictsCausedByItem,
		conflictsCausedByCandidate: [],
		conflictsCausedByOffending: conflictsCausedByOffending,
		conflictsCausedByCandidateAtOffending: []};
    }

    function computeAllConflicts(s1, s2, conflictsWithRow){
	var conflictsCausedByCandidate = [];
	if(!(s2 in unscheduled)){
	    for(var i in CCOps.allConflicts["sessions"][s2]){
		// self conflicts do not matter when we swap sessions
		if(CCOps.allConflicts["sessions"][s2][i].entities.length == 2 &&
		   CCOps.allConflicts["sessions"][s2][i].entities[0] == 
		   CCOps.allConflicts["sessions"][s2][i].entities[1]){
		}else{
		    conflictsCausedByCandidate.push(CCOps.allConflicts["sessions"][s2][i]);
		}
	    }
	}
	var conflictsCausedByItem = [];
	if(!(s1 in unscheduled)){
	    for(var i in CCOps.allConflicts["sessions"][s1]){
		// self conflicts do not matter when we swap sessions
		if(CCOps.allConflicts["sessions"][s1][i].entities.length == 2 &&
		   CCOps.allConflicts["sessions"][s1][i].entities[0] == 
		   CCOps.allConflicts["sessions"][s1][i].entities[1]){
		}else{
		    conflictsCausedByItem.push(CCOps.allConflicts["sessions"][s1][i]);
		}
	    }
	}
	var hypSessions = {};
	var hypS = createHypSessionLoc(allSessions[s1], 
				       allSessions[s2].date, 
				       allSessions[s2].time,
				       allSessions[s2].room);
	var hypS2 = createHypSessionLoc(allSessions[s2], 
					allSessions[s1].date,
					allSessions[s1].time,
					allSessions[s1].room);
	hypSessions[s1] = hypS;
	hypSessions[s2] = hypS2;
	
	var conflictsCausedByOffending = computeNewSingleConflicts(s1, hypSessions);
	var conflictsCausedByCandidateAtOffending = [];
	if(!(s1 in unscheduled)){
	    conflictsCausedByCandidateAtOffending = computeNewSingleConflicts(s2, hypSessions);
	}
	var s = allSessions[s1];
	var date = allSessions[s2].date;
	var time = allSessions[s2].time;

	for(var i = 0; i < conflictsWithRow[date][time]["sum"].length; i++){
	    var item = conflictsWithRow[date][time]["sum"][i];
	    if(conflictsWithRow[date][time]["session"][s2].indexOf(item) == -1){
		conflictsCausedByOffending.push(item);
	    }
	}

	if(!(s1 in unscheduled)){
	    for(var rs in schedule[s.date][s.time]){
		for(var sk in schedule[s.date][s.time][rs]){
		    if(sk != s.id){
			conflictsCausedByCandidateAtOffending = conflictsCausedByCandidateAtOffending.concat(computeNewPairConflicts(sk, s2, hypSessions));
			conflictsCausedByCandidateAtOffending = conflictsCausedByCandidateAtOffending.concat(computeNewFilteredPairConflicts(sk, s2, hypSessions));
		    }
		}
	    }
	}
	

	return {conflictsCausedByItem: conflictsCausedByItem,
		conflictsCausedByCandidate: conflictsCausedByCandidate,
		conflictsCausedByOffending: conflictsCausedByOffending,
		conflictsCausedByCandidateAtOffending: conflictsCausedByCandidateAtOffending};
    }

    function proposeSessionForSlot(sdate, stime, sroom){
	var scheduleValue = [];
	var unscheduleValue = [];
	
	// proposing unscheduled session
	if(keys(schedule[sdate][stime][sroom]).length != 0) return;
	
	var conflictsWithSession = {};
	for(var s2 in unscheduled){
	    var cc = null;
	    var conflictsCausedByItem = [];
	    var conflictsWithRow = computeConflictsWithRowAtTimeSlot(allSessions[s2], sdate, stime);

	    var sc = {conflictsCausedByItem: [],
		      conflictsCausedByCandidate: [],
		      conflictsCausedByOffending: conflictsWithRow['sum'], 
		      conflictsCausedByCandidateAtOffending: []};
	    unscheduleValue.push(createSwapDetails(sc, new slot(null, null, null, s2)));
	}

	// proposing scheduled session
	for(var date in schedule){
	    for(var time in schedule[date]){
		for(var room in schedule[date][time]){
		    for(var s2 in schedule[date][time][room]){
			var cc = null;
			var space = new slot(sdate, stime, sroom, null);
			if(date == sdate && time == stime){
			    // in same row; assume only single constraints affected
			    if(room == sroom) continue;
			    cc = computeAllSingleConflictsSlot(s2, space);
			}else{
			    var conflictsCausedByItem = CCOps.allConflicts["sessions"][s2];
			    var conflictsWithRow = {};
			    conflictsWithRow[sdate] = {};
			    conflictsWithRow[sdate][stime] = computeConflictsWithRowAtTimeSlot(allSessions[s2], sdate, stime);
			    cc = computeAllConflictsSlot(s2, space, conflictsCausedByItem, conflictsWithRow);
			}
			var sc = {conflictsCausedByItem: cc.conflictsCausedByCandidate,
				  conflictsCausedByCandidate: cc.conflictsCausedByItem,
				  conflictsCausedByOffending: cc.conflictsCausedByCandidateAtOffending,
				  conflictsCausedByCandidateAtOffending: cc.conflictsCausedByOffending};
			scheduleValue.push(createSwapDetails(sc, new slot(date, time, room, s2)));
		    }
		}
	    }
	}
    	return {scheduleValue: scheduleValue,
		unscheduleValue: unscheduleValue};
    }
    
    function proposeSlotAndSwap(s){
	var swapValue = [];
	var slotValue = [];
	
	var conflictsWithRow = computeConflictsWithRow(s);
	
	for(var date in schedule){
	    for(var time in schedule[date]){
		for(var room in schedule[date][time]){
		    if(keys(schedule[date][time][room]).length == 0){
			// if is an empty slot
			var sc = null;
			var space = new slot(date, time, room, null);
			if(date == s.date && time == s.time){
			    // in same row; assume only single constraints affected
			    if(room == s.room) continue;
			    cc = computeAllSingleConflictsSlot(s.id, space);
			}else{
			    cc = computeAllConflictsSlot(s.id, space, conflictsWithRow);
			}
			slotValue.push(createSwapDetails(cc, space));
		    }else{
			// if has sessions here
			for(var s2 in schedule[date][time][room]){
			    var cc = null;
			    if(date == s.date && time == s.time){
				// in same row; assume only single constraints affected
				if(room == s.room) continue;
				cc = computeAllSingleConflicts(s.id, s2);
			    }else{
				cc = computeAllConflicts(s.id, s2, conflictsWithRow);
			    }
			    var space = new slot(date, time, room, s2);
			    swapValue.push(createSwapDetails(cc, space));
			}
		    }
		}
	    }
	}
	return {swapValue: swapValue,
		slotValue: slotValue};	
    }
    
    
    function matchingSessionPaper(session, p){
	return (session["venue"] == p.type ||
		(p.type == "TOCHI" && session["venue"] == "paper"));
    }

    function computePaperSwapConflicts(p1, s1, p2, s2){
	var ignorePairs = false;
	if (p1.session != "null" && !(s1 in unscheduled) && !(s2 in unscheduled) && 
	    ((allSessions[s1].date == allSessions[s2].date) &&
	     (allSessions[s1].time == allSessions[s2].time))){
	    ignorePairs = true;
	}

	var conflictsCausedByItem = [];
	if(p1.session != "null" && !(s1 in unscheduled)){
	    if(ignorePairs){
		for(var c in CCOps.allConflicts["sessions"][s1]){
		    if(CCOps.allConflicts["sessions"][s1][c].constraintType == 'single'){
			conflictsCausedByItem.push(CCOps.allConflicts["sessions"][s1][c]);
		    }
		}
	    }else{
		conflictsCausedByItem = CCOps.allConflicts["sessions"][s1];
	    }
	}

	var conflictsCausedByCandidate = []
	if(!(s2 in unscheduled) && s2 != "null"){
	    if(ignorePairs){
		for(var c in CCOps.allConflicts["sessions"][s2]){
		    if(CCOps.allConflicts["sessions"][s2][c].constraintType == 'single'){
			conflictsCausedByItem.push(CCOps.allConflicts["sessions"][s2][c]);
		    }
		}
	    }else{
		conflictsCausedByCandidate = CCOps.allConflicts["sessions"][s2];
	    }
	}

	var subS1 = [];
	var subS2 = [];
	if(p2 == null){ // inserting into s2
	    if(p1.session != "null"){
		for(var sub in allSessions[s1].submissions){
		    if(allSessions[s1].submissions[sub].id != p1.id)
			subS1.push(allSessions[s1].submissions[sub]);
		}
	    }
	    for(var sub in allSessions[s2].submissions){
		subS2.push(allSessions[s2].submissions[sub]);
	    }
	    subS2.push(p1);
	}else{ // swapping p1 and p2
	    if(p1.session != "null"){
		for(var sub in allSessions[s1].submissions){
		    if(allSessions[s1].submissions[sub].id == p1.id)
			subS1.push(p2);
		    else
			subS1.push(allSessions[s1].submissions[sub]);
		}
	    }
	    for(var sub in allSessions[s2].submissions){
		if(allSessions[s2].submissions[sub].id == p2.id)
		    subS2.push(p1);
		else
		    subS2.push(allSessions[s2].submissions[sub]);
	    }
	}

	if(p1.session == "null"){
	    var hypSessions = {};
	    var hypS2 = createHypSessionSubs(allSessions[s2], subS2);
	    hypSessions[s2] = hypS2;
	    var conflictsCausedByOffending = computeConflictsFromSession(s2, hypSessions, ignorePairs);
	    var conflictsCausedByCandidateAtOffending = [];
	    return {conflictsCausedByItem: conflictsCausedByItem,
		    conflictsCausedByCandidate: conflictsCausedByCandidate,
		    conflictsCausedByOffending: conflictsCausedByOffending,
		    conflictsCausedByCandidateAtOffending: conflictsCausedByCandidateAtOffending};
	}else{

	    var hypSessions = {};
	    var hypS1 = createHypSessionSubs(allSessions[s1], subS1); 
	    var hypS2 = createHypSessionSubs(allSessions[s2], subS2);
	    hypSessions[s1] = hypS1;
	    hypSessions[s2] = hypS2;
	    
	    var conflictsCausedByOffending = computeConflictsFromSession(s2, hypSessions, ignorePairs);

	    var conflictsCausedByCandidateAtOffending = computeConflictsFromSession(s1, hypSessions, ignorePairs);

	    return {conflictsCausedByItem: conflictsCausedByItem,
		    conflictsCausedByCandidate: conflictsCausedByCandidate,
		    conflictsCausedByOffending: conflictsCausedByOffending,
		    conflictsCausedByCandidateAtOffending: conflictsCausedByCandidateAtOffending};
	}
    }
    
    function computeConflictsFromSession(s, hypSessions, ignorePairs){
	
	var conflicts = [];
	// conflicts caused by offending
	if (s in unscheduled){
	    return conflicts;
	}
	
	for(var i in CCOps.allConstraints){
	    var constraint = CCOps.allConstraints[i];
            if(constraint.constraintType == "single"){
		var paths = hypLegalPaths(s, constraint.entityRules, hypSessions);
		var levels = groupRulesByLevel(constraint.constraintObjectRules);
		for (var p in paths){
		    if(!pathHypBelongs(levels, paths[p], hypSessions)){
			conflicts.push(createSingleHypConflict(paths[p], constraint, hypSessions));
		    }
		}
	    }else if(constraint.constraintType =="pair" && !ignorePairs) {
		var paths1 = hypLegalPaths(s, constraint.entity1Rules, hypSessions);
		var paths2 = hypLegalPaths(s, constraint.entity2Rules, hypSessions);
		var date = hypSessions[s].date;
		var time = hypSessions[s].time;
		var belongLHS = constraint.entities1;
		var belongRHS = constraint.entities2;
		var levels = groupRulesByLevel(constraint.relationRules);
	
		for(var room in schedule[date][time]){
		    for(var s2 in schedule[date][time][room]){
			// go one direction first
			if(s != s2 && s2 in belongRHS){
			    for(var e1 in paths1){
				for(var e2 in belongRHS[s2]){
				    conflicts.push(createPairHypConflict(paths1[e1], belongRHS[s2][e2], constraint, hypSessions));
				}
			    }
			} // then the other
			if(!constraint.isSymmetric && s2 in belongLHS && s != s2){
			    for(var e1 in belongLHS[s2]){
				for(var e2 in paths2){
				    conflicts.push(createPairHypConflict(belongLHS[s2][e1], paths2[e2], constraint, hypSessions));
				}
			    }
			}
			if(s == s2){// handle special case
			    for(var e1 in paths1){
				for(var e2 in paths2){
				    if(!pathHypRelates(levels, paths1[e1], paths2[e2], hypSessions)){
					conflicts.push(createPairHypConflict(paths1[e1], paths2[e2], constraint, hypSessions));
				    }
				}
			    }
			}
		    }
		}
	    }else if(constraint.constraintType =="pairFiltered" && !ignorePairs) {
		// TODO: Assume symmetric
		var paths1 = hypLegalPaths(s, constraint.entity1Rules, hypSessions);
			var date = hypSessions[s].date;
		var time = hypSessions[s].time;
		var belongLHS = constraint.entities1;
		var belongRHS = constraint.entities2;
		var levels = groupRulesByLevel(constraint.filterRules);
		for(var room in schedule[date][time]){
		    for(var s2 in schedule[date][time][room]){
			if(s != s2 && s2 in belongRHS){
			    for(var e1 in paths1){
				for(var e2 in belongRHS[s2]){
				    if(pathHypRelates(levels, paths1[e1], belongRHS[s2][e2], hypSessions)){
					conflicts.push(createPairHypConflict(paths1[e1], belongRHS[s2][e2], constraint, hypSessions));
				    }
				}
			    }
			}
		    }
		}
	    }
	}
	return conflicts;
    }
    
    function proposePaperSessionAndSwap(p){
	var swapValue = [];
	var sessionValue = [];
	
	for(var date in schedule){
	    for(var time in schedule[date]){
		for(var room in schedule[date][time]){
		    for(var session in schedule[date][time][room]){
			if(p.session != session && matchingSessionPaper(schedule[date][time][room][session], p)){
			    var cc = null;
			    // swapping...
			    for(var p2 in schedule[date][time][room][session]['submissions']){
				cc = computePaperSwapConflicts(p, p.session, schedule[date][time][room][session]['submissions'][p2], session);
				var space = new sessionPaper(session, schedule[date][time][room][session]['submissions'][p2]['id']);
				swapValue.push(createSwapDetails(cc, space));
			    }
			    
			    // inserting...
			    cc = computePaperSwapConflicts(p, p.session, null, session);
			    var space = new sessionPaper(session, null);
			    sessionValue.push(createSwapDetails(cc, space));
			}
		    }
		}
	    }
	}
	
	for(var session in unscheduled){
	    if(p.session != session && matchingSessionPaper(unscheduled[session], p)){
		var cc = null;
		// swapping...
		for(var p2 in unscheduled[session]['submissions']){
		    cc = computePaperSwapConflicts(p, p.session, unscheduled[session]['submissions'][p2], session);
		    var space = new sessionPaper(session, unscheduled[session]['submissions'][p2]['id']);
		    swapValue.push(createSwapDetails(cc, space));
		}
		
		// inserting...
		cc = computePaperSwapConflicts(p, p.session, null, session);
		var space = new sessionPaper(session, null);
		sessionValue.push(createSwapDetails(cc, space));
	    }
	}
	return {swapValue: swapValue,
		sessionValue: sessionValue};
    }
    
    
    function proposePaperForSession(s){
	var scheduleValue = [];
	var unscheduleValue = [];
	
	for(var date in schedule){
	    for(var time in schedule[date]){
		for(var room in schedule[date][time]){
		    for(var session in schedule[date][time][room]){
			for(var submission in schedule[date][time][room][session]['submissions']){
			    var p = schedule[date][time][room][session]['submissions'][submission];
			    if(s.id != session && matchingSessionPaper(s, p)){
				var cc = null;
				cc = computePaperSwapConflicts(p, p.session, null, s.id);
				var space = new sessionPaper(session, p.id);
				var sc = {conflictsCausedByItem: cc.conflictsCausedByCandidate,
					  conflictsCausedByCandidate: cc.conflictsCausedByItem,
					  conflictsCausedByOffending: cc.conflictsCausedByCandidateAtOffending,
					  conflictsCausedByCandidateAtOffending: cc.conflictsCausedByOffending};
				
				scheduleValue.push(createSwapDetails(sc, space));
			    }
			}
		    }
		}
	    }
	}
	
	// look for unscheduled paper
	for(var submission in unscheduledSubmissions){
	    var p = unscheduledSubmissions[submission];
	    if(matchingSessionPaper(s, p)){
		var cc = null;
		cc = computePaperSwapConflicts(p, p.session, null, s.id);
		var sc = {conflictsCausedByItem: cc.conflictsCausedByCandidate,
			  conflictsCausedByCandidate: cc.conflictsCausedByItem,
			  conflictsCausedByOffending: cc.conflictsCausedByCandidateAtOffending,
			  conflictsCausedByCandidateAtOffending: cc.conflictsCausedByOffending};
		var space = new sessionPaper(null, p.id);
		unscheduleValue.push(createSwapDetails(sc, space));
	    }
	}
	
	return {scheduleValue: scheduleValue,
	     	unscheduleValue: unscheduleValue};
    }
    
    function createSwapDetails(cc, space){
	var conflictsResolved = cc.conflictsCausedByCandidate.length + 
	    cc.conflictsCausedByItem.length - 
	    cc.conflictsCausedByOffending.length - 
	    cc.conflictsCausedByCandidateAtOffending.length;

	cc = removeAddRemove(cc);
	
	return new swapDetails(space,
			       conflictsResolved,
			       cc.conflictsCausedByCandidateAtOffending,
			       cc.conflictsCausedByOffending,
			       cc.conflictsCausedByItem,
			       cc.conflictsCausedByCandidate
			      );
    }
    
    function removeAddRemove(cc){
	var resA = removeSames(cc.conflictsCausedByCandidateAtOffending,
			       cc.conflictsCausedByItem);
	var resB = removeSames(cc.conflictsCausedByOffending,
    			       cc.conflictsCausedByCandidate);
	
	return { 
	    conflictsCausedByItem: resA.b,
	    conflictsCausedByCandidate: resB.b,
	    conflictsCausedByOffending: resB.a,
	    conflictsCausedByCandidateAtOffending: resA.a
	}
    }
    
    function removeSames(a,b){
	var markedForRemovalA = [];
	var markedForRemovalB = [];
	for(var i in a) markedForRemovalA.push(false);
	for(var i in b) markedForRemovalB.push(false);
	
        for(var i = 0; i < a.length; i++){
	    for(var j = 0; j < b.length; j++){
    		if(a[i].type == b[j].type && a[i].conflict.length == b[j].conflict.length){
    		    var same = false;
		    if(a[i].conflict.length ==1 &&
		       a[i].conflict[0].author == b[j].conflict[0].author &&
    		       a[i].conflict[0].session == b[j].conflict[0].session &&
    		       a[i].conflict[0].submission == b[j].conflict[0].submission){
			same = true;
		    }else if(a[i].conflict.length == 2 && 
			     a[i].conflict[0].author == b[j].conflict[0].author &&
    			     a[i].conflict[0].session == b[j].conflict[0].session &&
    			     a[i].conflict[0].submission == b[j].conflict[0].submission &&
			     a[i].conflict[1].author == b[j].conflict[1].author &&
    			     a[i].conflict[1].session == b[j].conflict[1].session &&
			     a[i].conflict[1].submission == b[j].conflict[1].submission){
			same = true;
		    }else if(a[i].conflict.length == 2 && 
			     a[i].conflict[1].author == b[j].conflict[0].author &&
    			     a[i].conflict[1].session == b[j].conflict[0].session &&
    			     a[i].conflict[1].submission == b[j].conflict[0].submission &&
			     a[i].conflict[0].author == b[j].conflict[1].author &&
    			     a[i].conflict[0].session == b[j].conflict[1].session &&
			     a[i].conflict[0].submission == b[j].conflict[1].submission){
			same = true;
		    }
		    if(same){
    			markedForRemovalA[i] = true;
			markedForRemovalB[j] = true;
			break;
		    }
		}
	    }
        }
	var ap = [];
	var bp = [];
	for(var i in a){
	    if(!markedForRemovalA[i]) ap.push(a[i]);
	}
	for(var i in b){
	    if(!markedForRemovalB[i]) bp.push(b[i]);
	}
	return {a: ap,
		b: bp};
    }
    
    function clone(obj) {
	// Handle the 3 simple types, and null or undefined
	if (null == obj || "object" != typeof obj) return obj;
	
	// Handle Array
	if (obj instanceof Array) {
	    var copy = [];
	    for (var i = 0, len = obj.length; i < len; i++) {
		copy[i] = clone(obj[i]);
	    }
	    return copy;
	}
	
	// Handle Object
	if (obj instanceof Object) {
	    var copy = {};
	    for (var attr in obj) {
		if (obj.hasOwnProperty(attr)) copy[attr] = clone(obj[attr]);
	    }
	    return copy;
	}
	
	throw new Error("Unable to copy obj! Its type isn't supported.");
    }
    
    function copySession(s){
	return clone(s);
    }
    
    function createHypSessionLoc(s, date, time, room){
	hypSession = clone(s);
	hypSession.date = date;
	hypSession.time = time;
	hypSession.room = room;
	return hypSession;
    } 

    function createHypSessionSubs(s, subs){
	hypSession = clone(s);
	hypSession['submissions'] = subs;
	return hypSession;
    }
    
    function equal(a, b){
	return a == b;
    }

    function legalPathPairs(rules, entities1, entities2){
	var levels = groupRulesByLevel(rules);
	var pathPairs = {};
	for (var s1 in entities1){
	    paths = legalPathPairsForSession(s1, levels, entities1, entities2);
	    if (paths != null){
		pathPairs[s1] = paths;
	    }
	}
	return pathPairs;
    }
    
    function legalPathPairsForHypSession(paths1, levels, entities2, hypSessions){
	var pathPairs = {};
	for(var s2 in entities2){
	    var paths = [];
	    for (var e1 in paths1){
		for(var e2 in entities2[s2]){
		    var path1 = paths1[e1];
		    var path2 = entities2[s2][e2];
		    if(pathHypRelates(levels, path1, path2, hypSessions)){
			paths.push({'p1': path1,
				    'p2': path2});
		    }
		}
	    }
	}
	return pathPairs;
    }

    
    function legalPathPairsForTwoSessions(s1, s2, levels, entities1, entities2){
	var paths = [];
	for(var e1 in entities1[s1]){
	    for(var e2 in entities2[s2]){
		var path1 = entities1[s1][e1];
		var path2 = entities2[s2][e2];
		if(pathRelates(levels, path1, path2)){
		    paths.push({'p1': path1,
				'p2': path2});
		}
	    }
	}
	return paths;
    }
    
    function legalPathPairsForSession(s1, levels, entities1, entities2){
	var pathPairs = {};
	var changed = false;
	for(var s2 in entities2){
	    var paths = legalPathPairsForTwoSessions(s1, s2, levels, entities1, entities2);
	    if(paths.length > 0){
		changed = true;
		pathPairs[s2] = paths;
	    }
	}
	if(!changed)
	    return null;
	else
	    return pathPairs;
	
    }

    function pathHypRelates(levels, path1, path2, hypSessions){
	var session1 = allSessions[path1.session];
	var session2 = allSessions[path2.session];
	if(path1.session in hypSessions)
	    session1 = hypSessions[path1.session];
	if(path2.session in hypSessions)
	    session2 = hypSessions[path2.session];
	
	for (var sessionRule in levels['session']){
	    if(!(levels['session'][sessionRule].comp)(session1,
						      session2)){
		return false;
	    }
	}
	// check submission level
	for(var submissionRule in levels['submission']){
	    var comp = levels['submission'][submissionRule].comp;
	    if(!comp(session1.submissions[path1.submission],
		     session2.submissions[path2.submission])){
		return false;
	    }else{
	    }
	}
	
	// check author level 
	for(var authorRule in levels['author']){
	    if(!(levels['author'][authorRule].comp)(session1.submissions[path1.submission].authors[path1.author],
						    session2.submissions[path2.submission].authors[path2.author])){
		return false;
	    }
	}
	
	return true;
	
    }
    function pathRelates(levels, path1, path2){
	// TODO: track where violations are happening
	// check session level
	for (var sessionRule in levels['session']){
	    if(!(levels['session'][sessionRule].comp)(allSessions[path1.session], 
						      allSessions[path2.session])){
		return false;
	    }
	}
	// check submission level
	for(var submissionRule in levels['submission']){
	    var comp = levels['submission'][submissionRule].comp;
	    if(!comp(allSessions[path1.session].submissions[path1.submission],
		     allSessions[path2.session].submissions[path2.submission])){
		return false;
	    }else{
	    }
	}
	
	// check author level 
	for(var authorRule in levels['author']){
	    if(!(levels['author'][authorRule].comp)(allSessions[path1.session].submissions[path1.submission].authors[path1.author],
						    allSessions[path2.session].submissions[path2.submission].authors[path2.author])){
		return false;
	    }
	}
	
	return true;
    }
    
    function pathBelongs(levels, path){
	// TODO: track where violations are happening
	// check session level
	for (var sessionRule in levels['session']){
	    if(!(levels['session'][sessionRule].comp)(allSessions[path.session])){
		return false;
	    }
	}
	// check submission level
	for(var submissionRule in levels['submission']){
	    var comp = levels['submission'][submissionRule].comp;
	    if(!comp(allSessions[path.session].submissions[path.submission])){
		return false;
	    }else{
	    }
	}
	
	// check author level 
	for(var authorRule in levels['author']){
	    if(!(levels['author'][authorRule].comp)(allSessions[path.session].submissions[path.submission].authors[path.author])){
		return false;
	    }
	}
	
	return true;
    }
    
    function pathsHypBelongs(levels, paths, hypSessions){
	// return paths if session satisfies rules
	var legal = [];
	for(var i in paths){
	    legal.push(true);
	}
	for(var i in paths){
	    legal[i] = pathHypBelongs(levels, paths[i], hypSessions);	    
	}
	return legal;
    }
    

    function pathHypBelongs(levels, path, hypSessions){
	// TODO: track where violations are happening
	// check session level
	var session = allSessions[path.session];
	if(path.session in hypSessions){
	    session = hypSessions[path.session];
	}
	
	for (var sessionRule in levels['session']){
	    if(!(levels['session'][sessionRule].comp)(session)){
		return false;
	    }
	}
	// check submission level
	for(var submissionRule in levels['submission']){
	    var comp = levels['submission'][submissionRule].comp;
	    if(!comp(session.submissions[path.submission])){
		return false;
	    }else{
	    }
	}
	
	// check author level 
	for(var authorRule in levels['author']){
	    if(!(levels['author'][authorRule].comp)(session.submissions[path.submission].authors[path.author])){
		return false;
	    }
	}
	
	return true;
    }
    
    
    function pathsBelongs(levels, paths){
	// return paths if session satisfies rules
	var legal = [];
	for(var i in paths){
	    legal.push(true);
	}
	for(var i in paths){
	    legal[i] = pathBelongs(levels, paths[i]);	    
	}
	return legal;
    }
    
    
    function groupRulesByLevel(rules){
	var levels = {};
	// group rules by the level at which they operate
	levels['session'] = [];
	levels['submission'] = [];
	levels['author'] = [];
	for(var i = 0; i < rules.length; i++){
	    levels[rules[i].level].push(rules[i]);
	}
	return levels;
    }
    
    function updateAllConstraintEntities(affectedSessions){
	// array of session ids
	for(var i in CCOps.allConstraints){
	    updateConstraintEntities(affectedSessions, CCOps.allConstraints[i]);
	}
    }

    function updateConstraintEntities(affectedSessions, constraint){
	if(constraint.constraintType == "single"){		
	    for(var i in affectedSessions){
		var sessionPath = updateLegalPaths(affectedSessions[i], 
						   constraint.entityRules);
		if(sessionPath.length == 0 && (affectedSessions[i] in constraint.entities)){
		    delete constraint.entities[affectedSessions[i]];
		}else{
		    constraint.entities[affectedSessions[i]] = sessionPath;
		}
	    }
	}else {
	    for(var i in affectedSessions){
		var sessionPath = updateLegalPaths(affectedSessions[i], 
						   constraint.entity1Rules);

		if(sessionPath.length == 0 && (affectedSessions[i] in constraint.entities1)){
		    delete constraint.entities1[affectedSessions[i]];
		}else{
		    constraint.entities1[affectedSessions[i]] = sessionPath;
		}
		
		sessionPath = updateLegalPaths(affectedSessions[i], 
					       constraint.entity2Rules);
		if(sessionPath.length == 0 && (affectedSessions[i] in constraint.entities2)){
		    delete constraint.entities2[affectedSessions[i]];
		}else{
		    constraint.entities2[affectedSessions[i]] = sessionPath;
		}
	    }
	    
	    if (constraint.constraintType == "pairFiltered"){
		for(var i in affectedSessions){
		    // update legal paths
	            var levels = groupRulesByLevel(constraint.filterRules);
		    if(affectedSessions[i] in constraint.entityPairs){
			delete constraint.entityPairs[affectedSessions[i]];
		    }
		    var paths = legalPathPairsForSession(affectedSessions[i], levels, constraint.entities1, constraint.entities2);
		    if(paths != null){
			constraint.entityPairs[affectedSessions[i]] = paths;
		    }
		    // still have to go through all paths where sessions are on RHS and update 
		    // them too
		    for(var s in constraint.entityPairs){
			if(affectedSessions[i] in constraint.entityPairs[s]){
			    delete constraint.entityPairs[s][affectedSessions[i]];
			}
			var affPaths = legalPathPairsForTwoSessions(s, affectedSessions[i], levels, constraint.entities1, constraint.entities2);
			if(affPaths.length > 0)
			    constraint.entityPairs[s][affectedSessions[i]] = affPaths; 
			
		    }
		}
	    }
	}
    }
    
    function hypLegalPaths(s, rules, hypSessions){
	var levels = groupRulesByLevel(rules);
	var paths = generatePaths(hypSessions[s], levels); 
	var legal = pathsHypBelongs(levels, paths, hypSessions);
	var legalPaths = [];
	for(var i in legal){
	    if (legal[i]) legalPaths.push(paths[i]);
	}
	return legalPaths;

    }
    
    function updateLegalPaths(s, rules){
	var levels = groupRulesByLevel(rules);
	var paths = generatePaths(allSessions[s], levels);
	var legal = pathsBelongs(levels, paths);
	var legalPaths = [];
	for(var i in legal){
	    if (legal[i]) legalPaths.push(paths[i]);
	}
	return legalPaths;
    }

    function belongs(rules){
	var matchesBySession = {};
	var levels = groupRulesByLevel(rules);
	for(var s in allSessions){
	    var paths = generatePaths(allSessions[s], levels);
	    var legal = pathsBelongs(levels, paths);
	    var legalPaths = [];
	    for(var i in legal){
		if (legal[i]) legalPaths.push(paths[i]);
	    }
	    if(legalPaths.length > 0){
		matchesBySession[s] = legalPaths;
	    }
	}
	//	console.log(matches);
	return matchesBySession;
    }
	
    function violates(rules, paths){
	// given a set of paths, figure out which paths violates the rules
	var levels = groupRulesByLevel(rules);
	var legal = pathsBelongs(levels, paths);
	var violatingPaths = [];
	for(var i in legal){
	    if (!legal[i]) violatingPaths.push(paths[i]);
	}
	return violatingPaths;
    }

    function satisfies(rules, paths){
	// given a set of paths, figure out which paths violates the rules
	var levels = groupRulesByLevel(rules);
	var legal = pathsBelongs(levels, paths);
	var acceptingPaths = [];
	for(var i in legal){
	    if (legal[i]) acceptingPaths.push(paths[i]);
	}
	return acceptingPaths;
    }
    
    function generatePaths(s, levels){
	var paths = [];
	if(levels['submission'].length != 0 || levels['author'].length != 0){
	    for(var sub in s.submissions){
		if(levels['author'].length != 0){
		    for(var auth in s.submissions[sub].authors){
			paths.push(new entityTrace(s.id, sub, auth));
		    }
		}else{
		    // just generate sub level paths
		    paths.push(new entityTrace(s.id, sub, null));
		}
	    }
	}else{
	    paths.push(new entityTrace(s.id, null, null));
	}
	return paths;
    }

    function checkPairConflicts(constraint){
	var violationsBySession = {};
	var conflictList = [];
	
	var belongLHS = constraint.entities1;
	var belongRHS = constraint.entities2;
	var levels = groupRulesByLevel(constraint.relationRules);

	// assume only have to check at same time slot relations
	for(var date in schedule){
	    for(var time in schedule[date]){
		var roomKeys = keys(schedule[date][time]);
		for(var i = 0; i < roomKeys.length; i++){
		    for(var s1 in schedule[date][time][roomKeys[i]]){
			if (s1 in belongLHS){
			    var start = 0;
			    if(constraint.isSymmetric){
				start = i+1;
			    }
			    for(var j = start; j < roomKeys.length; j++){
			    	for(var s2 in schedule[date][time][roomKeys[j]]){
				    if(s1 != s2 && s2 in belongRHS){
					for(var e1 in belongLHS[s1]){
					    for(var e2 in belongRHS[s2]){
						if(!pathRelates(levels, belongLHS[s1][e1], belongRHS[s2][e2])){
						    var conflict = createPairConflict(belongLHS[s1][e1], belongRHS[s2][e2], constraint);
						    conflictList.push(conflict);
						}
					    }
					}
				    }else if(s1 == s2){
					for(var e1 in belongLHS[s1]){
					    for(var e2 in belongRHS[s2]){
						if(!pathRelates(levels, belongLHS[s1][e1], belongRHS[s2][e2])){
						    var conflict = createPairConflict(belongLHS[s1][e1], belongRHS[s2][e2], constraint);
						    conflictList.push(conflict);
						}
					    }
					}
					
				    }
				}
			    }
			    
			}
		    }
		}
	    }
	}
	return conflictList;
    }
    
    function checkFilteredPairConflicts(constraint){
	var violationsBySession = {};
	var conflictList = [];
	
	var entityPairs = constraint.entityPairs;

	// 2. Get eligible RHS sessions

	var levels = groupRulesByLevel(constraint.relationRules);
		
	// assume only have to check at same time slot relations
	for(var date in schedule){
	    for(var time in schedule[date]){
		var roomKeys = keys(schedule[date][time]);
		for(var i = 0; i < roomKeys.length; i++){
		    for(var s1 in schedule[date][time][roomKeys[i]]){
			if (s1 in entityPairs){
			    var start = 0;
			    if(constraint.isSymmetric){
				start = i+1;
			    }
			    for(var j = start; j < roomKeys.length; j++){
				if(j!=i){
				    for(var s2 in schedule[date][time][roomKeys[j]]){
					if (s2 in entityPairs[s1]){
					    for (var entityPair in entityPairs[s1][s2]){
						if(!pathRelates(levels, entityPairs[s1][s2][entityPair].p1, 
								entityPairs[s1][s2][entityPair].p2)){
						    
						    var conflict = createPairConflict(entityPairs[s1][s2][entityPair].p1,
										      entityPairs[s1][s2][entityPair].p2,
										      constraint);
						    conflictList.push(conflict);
						}
					    }
					}
				    }
				}
			    }
			}
		    }
		}
	    }
	}
    	return conflictList;
    }
    
    function checkSingleConflicts(constraint){
	// TODO: explain why doesn't match
	// assume single entity constraint
	// 1. Get eligible sessions
	var belongList = constraint.entities;
	var conflicts = [];
	
	// 2. find all that violates constraint
	for(var s in belongList){
	    var violations = violates(constraint.constraintObjectRules,
				      belongList[s]); // paths
	    for(var i in violations){
		conflicts.push(createSingleConflict(violations[i], constraint));
	    }
	}
	return conflicts;
    }
    
    function revealPath(path){
	if(path.author != null) {
	    return allSessions[path.session].submissions[path.submission].authors[path.author].firstName + " " + 
		allSessions[path.session].submissions[path.submission].authors[path.author].lastName + ", " + 
		allSessions[path.session].title;
	}else if(path.submission != null){
	    return allSessions[path.session].submissions[path.submission].title + ", " + allSessions[path.session].title;
	}else{
	    return allSessions[path.session].personas + ", " + allSessions[path.session].title;
	}
    }

    function computeNewFilteredPairConflicts(s1, s2, hypSessions){
	var conflicts = [];

	for(var i in CCOps.allConstraints){
	    var constraint = CCOps.allConstraints[i];
	    if(constraint.constraintType == "pairFiltered"){
		var entityPairs = constraint.entityPairs;
		var levels = groupRulesByLevel(constraint.relationRules);
		
		// go one direction first
		if((s1 in entityPairs) && (s2 in entityPairs[s1])){
		    for(var entityPair in entityPairs[s1][s2]){
			// TODO, assume don't need hyp session here 
			// or even to check if path relates
			var conflict = createPairHypConflict(entityPairs[s1][s2][entityPair].p1,
							     entityPairs[s1][s2][entityPair].p2,
							     constraint,
							     hypSessions);
			conflicts.push(conflict);
		    }
		}
		// then the other
		if(!constraint.isSymmetric && (s2 in entityPairs) && (s1 in entityPairs[s2])){
		    for(var entityPair in entityPairs[s2][s1]){
			var conflict = createPairHypConflict(entityPairs[s2][s1][entityPair].p1,
							     entityPairs[s2][s1][entityPair].p2,
							     constraint,
							     hypSessions);
			conflicts.push(conflict);
		    }
		}
	    }
	}
	return conflicts;
    }
    
    // assumes s1 and s2 not same and just checking for in different session
    function computeNewPairConflicts(s1, s2, hypSessions){
	var conflicts = [];

	for(var i in CCOps.allConstraints){
	    var constraint = CCOps.allConstraints[i];
	    if(constraint.constraintType == "pair"){
		var belongLHS = constraint.entities1;
		var belongRHS = constraint.entities2;
		var levels = groupRulesByLevel(constraint.relationRules);
		// go one direction first
		if((s1 in belongLHS) && (s2 in belongRHS)){
		    for(var e1 in belongLHS[s1]){
			for(var e2 in belongRHS[s2]){
			    if(!pathHypRelates(levels, belongLHS[s1][e1], belongRHS[s2][e2], hypSessions)){
				var conflict = createPairHypConflict(belongLHS[s1][e1],
								     belongRHS[s2][e2],
								     constraint, hypSessions);
				conflicts.push(conflict);
			    }
			}
		    }
		}
		// then the other
		if(!constraint.isSymmetric && s1 != s2 && (s2 in belongLHS) && (s1 in belongRHS)){
		    for(var e1 in belongLHS[s2]){
			for(var e2 in belongRHS[s1]){
			    if(!pathHypRelates(levels, belongLHS[s2][e1], belongRHS[s1][e2], hypSessions)){
				var conflict = createPairHypConflict(belongLHS[s2][e1],
								     belongRHS[s1][e2],
								     constraint, hypSessions);
				conflicts.push(conflict);
			    }
			}
		    }
		}
	    }
	}
	return conflicts;
    }
    
    function computeNewSingleConflicts(s, hypSessions){
	var conflicts = [];
	
	for(var i in CCOps.allConstraints){
	    var constraint = CCOps.allConstraints[i];
	    if(constraint.constraintType == "single"){
		var belongList = constraint.entities;
		if(s in belongList){
		    var levels = groupRulesByLevel(constraint.constraintObjectRules);
		    
		    for(var p in belongList[s]){
			if(!pathHypBelongs(levels, belongList[s][p], hypSessions)){ 
			    conflicts.push(createSingleHypConflict(belongList[s][p],
								   constraint, hypSessions));
			}
		    }
		}
	    }
	}
	return conflicts;
    }
    
    
    return {allConstraints: allConstraints,
	    allConflicts: allConflicts,
	    proposeSlotAndSwap: proposeSlotAndSwap,
	    proposePaperSessionAndSwap: proposePaperSessionAndSwap,
	    proposePaperForSession: proposePaperForSession,
	    proposeSessionForSlot: proposeSessionForSlot,
	    updateAllConstraintEntities: updateAllConstraintEntities,
	    computePaperSwapConflicts: computePaperSwapConflicts,
	    initialize: initialize,
	    getAllConflicts: getAllConflicts,
	    belongs: belongs,
	    equal: equal,
	    legalPathPairs: legalPathPairs,
	    removeSames: removeSames,
	    authorsourcingData: authorsourcingData
	   };
}();

