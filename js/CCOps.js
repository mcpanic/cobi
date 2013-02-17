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
    var allConflicts = [];

    function initialize(){
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

	 var example4 = new EntityFilterPairConstraint("personaInTwoSessions", 
						       "Sessions with the same persona should not be opposing",
						       100,
						       "because someone interested in one may be interested in the other",
						       [new Rule('session', function(x){ return true})],
						       [new Rule('session', function(x){ return true})],
						       [new Rule('session', function(a, b){ return a.personas != "" && a.personas != "Misc" && a.personas == b.personas })], 
						       [new Rule('session', function(a, b){ // assume paths, check not opposing sessions
							   return !((a.time == b.time) &&
								    (a.date == b.date) &&
 								    (a.room != b.room));
						       })]);
	
//	CCOps.allConstraints.push(example);
//	CCOps.allConstraints.push(example2);
	CCOps.allConstraints.push(example3);
	CCOps.allConstraints.push(example4);
	
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
		for(var k in constraintConflicts[j].entities){
		    var s = constraintConflicts[j].entities[k];
		    conflicts["sessions"][s].push(constraintConflicts[j]);
		}
	    }
	}
	CCOps.allConflicts = conflicts;
	return conflicts;
    }
    
    function proposeSwap(s){
	// how many conflicts are caused by the offending item
	var conflictsCausedByItem = CCOps.allConflicts["sessions"][s.id];
	var swapValue = [];
	
	// for each item, compute: 
	// 1. number of conflicts caused by moving offending item to there
	// 2. number of conflicts mitigated by removing offeding item from there
	// 3. number of conflicts caused by moving item there to offending location
	
	// calculate number of conflicts caused by moving item into another row
	var conflictsWithRow = {};
	for(var date in schedule){
	    conflictsWithRow[date] = {}
	    for(var time in schedule[date]){
		conflictsWithRow[date][time] = {};
		conflictsWithRow[date][time]["sum"] = [];
		conflictsWithRow[date][time]["session"] = {};

		if(date == s.date && time == s.time){
		    for(var room in schedule[date][time]){
			if(room != s.room){
			    for(var s2 in schedule[date][time][room]){
				// in same row; assume only single constraints affected
				var singleConflictsCausedByItem = [];
				for(var i in CCOps.allConflicts["sessions"][s.id]){
				    if(CCOps.allConflicts["sessions"][s.id][i].conflict.length == 1){
					singleConflictsCausedByItem.push(CCOps.allConflicts["sessions"][s.id][i]);
				    }
				}
				var singleConflictsCausedByCandidate = [];
				for(var i in CCOps.allConflicts["sessions"][s2]){
				    if(CCOps.allConflicts["sessions"][s2][i].conflict.length == 1){
					singleConflictsCausedByItem.push(CCOps.allConflicts["sessions"][s2][i]);
				    }
				}
				var hypSessions = {};
				var hypS = createHypSessionLoc(s, 
							       allSessions[s2].date, 
							       allSessions[s2].time,
							       allSessions[s2].room);
				var hypS2 = createHypSessionLoc(allSessions[s2], 
								s.date,
								s.time,
								s.room);
				hypSessions[s.id] = hypS;
				hypSessions[s2] = hypS2;
				
				var singleConflictsCausedByOffending = computeNewSingleConflicts(s.id, hypSessions);
			    	var singleConflictsCausedByCandidateAtOffending = computeNewSingleConflicts(s2, hypSessions);
				var conflictsResolved = singleConflictsCausedByCandidate.length + 
				    singleConflictsCausedByItem.length - 
				    singleConflictsCausedByOffending.length - 
				    singleConflictsCausedByCandidateAtOffending.length;
				swapValue.push(new swapDetails(new slot(allSessions[s2].date, allSessions[s2].time, allSessions[s2].room, s2),
							       conflictsResolved,
							       singleConflictsCausedByCandidateAtOffending,
							       singleConflictsCausedByOffending,
							       singleConflictsCausedByItem,
							       singleConflictsCausedByCandidate
							      ));
			    }
			}
		    }
		}else{
		    // precompute for pairs
		    for(var room in schedule[date][time]){
			for(var s2 in schedule[date][time][room]){
			    // TODO: edit here
			    var conflicts = computeNewPairConflicts(s.id, s2);
			    conflicts = conflicts.concat(computeNewFilteredPairConflicts(s.id, s2));
			    conflictsWithRow[date][time]["session"][s2] = conflicts;
			    conflictsWithRow[date][time]["sum"] = conflictsWithRow[date][time]["sum"].concat(conflicts);
			}
		    }
		    
		    for(var room in schedule[date][time]){
			for(var s2 in schedule[date][time][room]){
			    var conflictsCausedByCandidate = CCOps.allConflicts["sessions"][s2];
			    
			    var hypSessions = {};
			    var hypS = createHypSessionLoc(s, 
							   allSessions[s2].date, 
							   allSessions[s2].time,
							   allSessions[s2].room);
			    var hypS2 = createHypSessionLoc(allSessions[s2], 
							    s.date,
							    s.time,
							    s.room);
			    hypSessions[s.id] = hypS;
			    hypSessions[s2] = hypS2;
			    
			    var conflictsCausedByOffending = computeNewSingleConflicts(s.id, hypSessions);
			    
			    for(var i = 0; i < conflictsWithRow[date][time]["sum"].length; i++){
				var item = conflictsWithRow[date][time]["sum"][i];
				if(conflictsWithRow[date][time]["session"][s2].indexOf(item) == -1){
				    conflictsCausedByOffending.push(item);
				}
			    }
			    
			    // 3. number of conflicts caused by moving item there to offending location
			    var conflictsCausedByCandidateAtOffending = computeNewSingleConflicts(s2, hypSessions);
			    
			    for(var rs in schedule[s.date][s.time]){
				for(var sk in schedule[s.date][s.time][rs]){
				    if(sk != s.id){
					conflictsCausedByCandidateAtOffending = conflictsCausedByCandidateAtOffending.concat(computeNewPairConflicts(sk, s2));
					conflictsCausedByCandidateAtOffending = conflictsCausedByCandidateAtOffending.concat(computeNewFilteredPairConflicts(sk, s2));
				    }
				}
			    }
			    
			    // 4. number of conflicts mitigated by moving offending items away
			// numConflictsCausedByItem 
			    var conflictsResolved = conflictsCausedByCandidate.length + 
				conflictsCausedByItem.length - 
				conflictsCausedByOffending.length - 
				conflictsCausedByCandidateAtOffending.length;
			    swapValue.push(new swapDetails(new slot(allSessions[s2].date, allSessions[s2].time, allSessions[s2].room, s2),
							   conflictsResolved,
							   conflictsCausedByCandidateAtOffending,
							   conflictsCausedByOffending,
							   conflictsCausedByItem,
							   conflictsCausedByCandidate
							  ));
			}
		    }
		}
		
	    }
	}
	return swapValue;	
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

    function checkSinglePreference(preference){
	// 1. Get eligible sessions
	var belongList = preference.entities;
	var meets = [];
	
	// 2. find all that satisfies preference
	for(var s in belongList){
	    var satisfactions = satisfies(preference.constraintObjectRules,
				      belongList[s]); // paths
	    for(var i in satisfactions){
		meets.push(new conflictObject([satisfactions[i].session],
					      preference.type, 
						  satisfactions[i],
					      preference.description));
	    }
	}
	return meets;
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
    
    function computeNewFilteredPairConflicts(s1, s2){
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
			var conflict = new conflictObject([entityPairs[s1][s2][entityPair].p1.session, 
							   entityPairs[s1][s2][entityPair].p2.session], 
							  constraint.type, 
							  [entityPairs[s1][s2][entityPair].p1, 
							   entityPairs[s1][s2][entityPair].p2],
							  constraint.description);
			conflicts.push(conflict);
		    }
		}
		// then the other
		if(!constraint.isSymmetric && (s2 in entityPairs) && (s1 in entityPairs[s2])){
		    for(var entityPair in entityPairs[s2][s1]){
			var conflict = new conflictObject([entityPairs[s2][s1][entityPair].p1.session, 
							   entityPairs[s2][s1][entityPair].p2.session], 
							  constraint.type, 
							  [entityPairs[s2][s1][entityPair].p1, 
							   entityPairs[s2][s1][entityPair].p2],
							  constraint.description);
			conflicts.push(conflict);
		    }
		}
	    }
	}
	return conflicts;
    }

    function computeNewPairConflicts(s1, s2){
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
			    // TODO, assume don't need hyp session here 
			    // or even to check if path relates
			    var conflict = new conflictObject([belongLHS[s1][e1].session, 
							       belongRHS[s2][e2].session], 
							      constraint.type, 
							      [belongLHS[s1][e1], 
							       belongRHS[s2][e2]],
							      constraint.description);
			    conflicts.push(conflict);
			}
		    }
		}
		// then the other
		if(!constraint.isSymmetric && (s2 in belongLHS) && (s1 in belongRHS)){
		    for(var e1 in belongLHS[s2]){
			for(var e2 in belongRHS[s1]){
			    var conflict = new conflictObject([belongLHS[s2][e1].session, 
							       belongRHS[s1][e2].session], 
							      constraint.type, 
							      [belongLHS[s2][e1], 
							       belongRHS[s1][e2]],
							      constraint.description);
			    conflicts.push(conflict);
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
			    conflicts.push(new conflictObject([s],
							      constraint.type,
							      belongList[s][p],
							      constraint.description));
			}
		    }
		}
	    }
	}
	return conflicts;
    }
    
    
    return {allConstraints: allConstraints,
	    allConflicts: allConflicts,
	    proposeSwap: proposeSwap,
	    initialize: initialize,
	    getAllConflicts: getAllConflicts,
	    belongs: belongs,
	    equal: equal,
	    legalPathPairs: legalPathPairs};

}();

