function SingleEntityConstraint(type, description, importance, rationale, entityRules, constraintObjectRules){
    this.importance = importance;
    this.rationale = rationale;
    this.entityRules = entityRules;
    this.entities = CCOps.belongs(entityRules);
    this.constraintObjectRules = constraintObjectRules;
    this.description = description;
    this.type = type;
    this.constraintType = "single";
}

function EntityPairConstraint(type, description, importance, rationale, entity1Rules, entity2Rules, relationRules){
    this.importance = importance;
    this.rationale = rationale;
    this.entity1Rules = entity1Rules;
    this.entity2Rules = entity2Rules;
    this.isSymmetric = false;
    if(''+entity1Rules == ''+entity2Rules){
	this.isSymmetric = true;
    }
    this.entities1 = CCOps.belongs(entity1Rules);
    this.entities2 = CCOps.belongs(entity2Rules);
    this.relationRules = relationRules;
    this.description = description;
    this.type = type;
    this.constraintType = "pair";
}

function EntityFilterPairConstraint(type, description, importance, rationale, entity1Rules, entity2Rules, filterRules, relationRules){
    this.importance = importance;
    this.rationale = rationale;
    this.entity1Rules = entity1Rules;
    this.entity2Rules = entity2Rules;
    this.entities1 = CCOps.belongs(entity1Rules);
    this.entities2 = CCOps.belongs(entity2Rules);
    this.isSymmetric = false;
    if(''+entity1Rules == ''+entity2Rules){
	this.isSymmetric = true;
    }
    this.filterRules = filterRules;
    this.entityPairs = CCOps.legalPathPairs(filterRules, 
					    this.entities1,
					    this.entities2);
    this.relationRules = relationRules;
    this.description = description;
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
    var init = function(){
    	var example = new SingleEntityConstraint("donat11",
						 "Submissions whose title begin with 'Don' should be at 11am",
						 10,
						 "because it's my favorite time and I am a don",
						 [new Rule('submission', 
							   function(x){ 
							       return Comp.stringStartsWith(x.title, "Don");
							   }),
						 ],
						 [new Rule('session',
							   function (x){
							       return Comp.timeEquals(x.time, "11:00-12:20");
							   }),
						  new Rule('session',
							   function(x){ // assume a session, a submission, or an author
							       return !Comp.dateEquals(x.date, "Monday");
							   })]);
	
	var example2 = new EntityPairConstraint("danjohn",
						"Authors whose first name is Dan should not be in opposing sessions with authors whose first name is John",
						100,
						"because Dan and John want to see each other's talks",
						[new Rule('author', function(x){ return x.firstName == "Dan"})],
						[new Rule('author', function(x){ return x.firstName == "John"})],
						[new Rule('session', function(a, b){ // assume paths, check not opposing sessions
						    return !((a.time == b.time) &&
							     (a.date == b.date) &&
							     (a.room != b.room));
						})]);
	
	 var example3 = new EntityFilterPairConstraint("authorInTwoSessions", 
						      "Sessions with the same author should not be opposing",
						      100,
						      "because authors should only have to be at one place at any given time",
						      [new Rule('author', function(x){ return true})],
						      [new Rule('author', function(x){ return true})],
						      [new Rule('author', function(a, b){ return a.authorId == b.authorId })], 
						      [new Rule('session', function(a, b){ // assume paths, check not opposing sessions
							  return !((a.time == b.time) &&
								   (a.date == b.date) &&
								   (a.room != b.room));
						      })]);

	allConstraints.push(example);
	allConstraints.push(example2);
	allConstraints.push(example3);
    }

    function getAllConflicts(){
	var conflicts = {};
	conflicts["sessions"] = {};
	conflicts["all"] = [];
	for(var session in allSessions)
	    conflicts["sessions"][session] = [];
	
	for(var i in allConstraints){
	    var constraintConflicts;
	    if(allConstraints[i].constraintType == 'single'){
		constraintConflicts = checkSingleConflicts(allConstraints[i]);
		
	    }else if(allConstraints[i].constraintType == 'pair'){
		constraintConflicts = checkPairConflicts(allConstraints[i]);
	    }else{// pairFiltered
		constraintConflicts = checkFilteredPairConflicts(allConstraints[i]);
	    }
	    conflicts["all"] = conflicts["all"].concat(constraintConflicts);
	    
	    for(var j in constraintConflicts){
		for(var k in constraintConflicts[j].entities){
		    var s = constraintConflicts[j].entities[k];
		    conflicts["sessions"][s].push(constraintConflicts[j]);
		}
	    }
	}
	return conflicts;
    }
    
    function tester(){
	var startTime = $.now();
	var example = new SingleEntityConstraint("don11", 
						 "Submissions whose title begin with 'Don' should be at 11am",
						 10,
						 "because it's my favorite time and I am a don",
						 [new Rule('submission', 
							   function(x){ 
							       return x.title.indexOf("Don") != -1
							   }),
						 ],
						 [new Rule('session',
							   function (x){
							       return x.time == '11:00-12:20'
							   }),
						  new Rule('session',
							   function(x){ // assume a session, a submission, or an author
							       return x.date != "Monday"
							   })]);
	
	var example2 = new EntityPairConstraint("danjohn",
						"Authors whose first name is Dan should not be in opposing sessions with authors whose first name is John",
						100,
						"because Dan and John want to see each other's talks",
						[new Rule('author', function(x){ return x.firstName == "Dan"})],
						[new Rule('author', function(x){ return x.firstName == "John"})],
						[new Rule('session', function(a, b){ // assume paths, check not opposing sessions
						    return !((a.time == b.time) &&
							     (a.date == b.date) &&
							     (a.room != b.room));
						})]);
	
	 var example3 = new EntityFilterPairConstraint("authorInTwoSessions", 
						      "Sessions with the same author should not be opposing",
						      100,
						      "because authors should only have to be at one place at any given time",
						      [new Rule('author', function(x){ return true})],
						      [new Rule('author', function(x){ return true})],
						      [new Rule('author', function(a, b){ return a.authorId == b.authorId })], 
						      [new Rule('session', function(a, b){ // assume paths, check not opposing sessions
							  return !((a.time == b.time) &&
								   (a.date == b.date) &&								   (a.room != b.room));
						      })]);

	var generated = $.now();
	console.log("time to create: " + (generated - startTime));
	console.log(example2.entities1);

	var results = checkPairConflicts(example2);
	for(var i in results){
 	    console.log(results[i].conflict[0].author + ", " + results[i].conflict[0].session + ", " + results[i].conflict[0].submission + ", " + allSessions[results[i].conflict[0].session].date + ", " + allSessions[results[i].conflict[0].session].time + ", " + allSessions[results[i].conflict[0].session].room + ", " + results[i].conflict[1].author + ", " + results[i].conflict[1].session + ", " + results[i].conflict[1].submission + ", " + allSessions[results[i].conflict[1].session].date + ", " + allSessions[results[i].conflict[1].session].time + ", " + allSessions[results[i].conflict[1].session].room);
	}
	
// 	console.log("time to check: " + ($.now() - generated));
 	updateConstraintEntities(['s288', 's204'], example);
 	updateConstraintEntities(['s207', 's203'], example2);
  	updateConstraintEntities(['s214', 's215'], example3);
 	console.log("Conflicts created by constraint 1");
 	console.log(checkSingleConflicts(example));
 	console.log("Conflicts created by constraint 2");
 	console.log(checkPairConflicts(example2));
 	console.log("Conflicts created by constraint 3");
 	console.log(checkFilteredPairConflicts(example3));
	
	
// 	for(var i = 0; i< 10; i++){
// 	    //checkConflicts(example);
// 	    //	checkPairConflicts(example2);
// 	    checkFilteredPairConflicts(example3);
// 	}
// 	console.log("time to check many more times: " + ($.now() - generated));
    }
    

	function formatTimeOfDay(millisSinceEpoch) {
	    var secondsSinceEpoch = (millisSinceEpoch / 1000) | 0;
	    var secondsInDay = ((secondsSinceEpoch % 86400) + 86400) % 86400;
	    var seconds = secondsInDay % 60;
	    var minutes = ((secondsInDay / 60) | 0) % 60;
	    var hours = (secondsInDay / 3600) | 0;
	    return hours + (minutes < 10 ? ":0" : ":")
		+ minutes + (seconds < 10 ? ":0" : ":")
		+ seconds;
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
    
    function legalPathPairsForSession(s1, levels, entities1, entities2){
	var pathPairs = {};
	var changed = false;
	for(var s2 in entities2){
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
	    if(paths.length > 0){
		changed = true;
		pathPairs[s2] = paths;
	    }
	}
	if(!changed){
	    return null;
	}else{
	    return pathPairs;
	}
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
		    delete constraint.entities1[affectedSessions[i]];
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
		}
	    }
	}
    }

    function updateLegalPaths(s, rules){
	var levels = groupRulesByLevel(rules);
	var paths = generatePaths(s, levels);
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
	    var paths = generatePaths(s, levels);
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
    
    function generatePaths(s, levels){
	var paths = [];
	if(levels['submission'].length != 0 || levels['author'].length != 0){
	    for(var sub in allSessions[s].submissions){
		if(levels['author'].length != 0){
		    for(var auth in allSessions[s].submissions[sub].authors){
			paths.push(new entityTrace(s, sub, auth));
		    }
		}else{
		    // just generate sub level paths
		    paths.push(new entityTrace(s, sub, null));
		}
	    }
	}else{
	    paths.push(new entityTrace(s, null, null));
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
				if(j != i){ 
			    	    for(var s2 in schedule[date][time][roomKeys[j]]){
					if(s2 in belongRHS){
					    for(var e1 in belongLHS[s1]){
						for(var e2 in belongRHS[s2]){
						    if(!pathRelates(levels, belongLHS[s1][e1], belongRHS[s2][e2])){
							var conflict = new conflictObject([belongLHS[s1][e1].session, 
											   belongRHS[s2][e2].session], 
											  constraint.type, 
											  [belongLHS[s1][e1], 
											   belongRHS[s2][e2]],
											  constraint.description);
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
						    var conflict = new conflictObject([entityPairs[s1][s2][entityPair].p1.session, 
										       entityPairs[s1][s2][entityPair].p2.session], 
										      constraint.type, 
										      [entityPairs[s1][s2][entityPair].p1, 
										       entityPairs[s1][s2][entityPair].p2],
										      constraint.description);
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
		conflicts.push(new conflictObject([violations[i].session],
						  constraint.type, 
						  violations[i],
						  constraint.description));
	    }
	}
	return conflicts;
    }
    
    
    return {tester: tester,
	    allConstraints: allConstraints,
	    init: init,
	    getAllConflicts: getAllConflicts,
	    belongs: belongs,
	    equal: equal,
	    legalPathPairs: legalPathPairs};

}();

