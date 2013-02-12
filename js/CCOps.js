function SingleEntityConstraint(type, description, importance, rationale, entityRules, constraintObjectRules){
    this.importance = importance;
    this.rationale = rationale;
    this.entityRules = entityRules;
    this.constraintObjectRules = constraintObjectRules;
    this.description = description;
    this.type = type;
}

function EntityPairConstraint(type, description, importance, rationale, entity1Rules, entity2Rules, relationRules){
    this.importance = importance;
    this.rationale = rationale;
    this.entity1Rules = entity1Rules;
    this.entity2Rules = entity2Rules;
    this.relationRules = relationRules;
    this.description = description;
    this.type = type;
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
    function tester(){
	var example = new SingleEntityConstraint("singleEntity", 
						 "Submissions whose title begin with 'Don' should be at 11am",
						 10,
						 "because it's my favorite time and I am a don",
						 [new Rule('submission', 
							   function(x){ 
							       return x.title.indexOf("Don") != -1
							   }),
// 						  new Rule('author', 
// 							   function(x){
// 							       return x.lastName == "Fu"
// 							   })
						 ],
						 [new Rule('session',
							   function (x){
							       return x.time == '11:00-12:20'
							   }),
						  new Rule('session',
							   function(x){ // assume a session, a submission, or an author
							       return x.date != "Monday"
							   })]);

	var example2 = new EntityPairConstraint("pairEntity", 
						"Authors whose first name is Dan should not be opposite each other",
						100,
						"because they should only have to be at one place at any given time",
						[new Rule('author', function(x){ return x.firstName == "Dan"})],
						[new Rule('author', function(x){ return x.firstName == "Dan"})],
						[function(a, b){ // assume paths, check not opposing sessions
						    return !((allSessions[a.session].time == allSessions[b.session].time) &&
							     (allSessions[a.session].date == allSessions[b.session].date) && 
							     (allSessions[a.session].room != allSessions[b.session].room));
						}]);
	console.log("Conflicts created by constraint 1");
	console.log(checkConflicts(example));
	console.log("Conflicts created by constraint 2");
	console.log(checkPairConflicts(example2));
    }

    function equal(a, b){
	return a == b;
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

    function belongs(rules){
	var matches = [];
	var levels = groupRulesByLevel(rules);
	for(var s in allSessions){
	    var paths = generatePaths(s, levels);
	    var legal = pathsBelongs(levels, paths);
	    var legalPaths = [];
	    for(var i in legal){
		if (legal[i]) legalPaths.push(paths[i]);
	    }
	    if(legalPaths.length > 0){
		matches = matches.concat(legalPaths);
	    }
	}
//	console.log(matches);
	return matches;
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
	// 1. Get eligible LHS sessions
	var belongLHS = belongs(constraint.entity1Rules);	
	var belongRHS = belongs(constraint.entity2Rules);	
	
	// 2. Get eligible RHS sessions
	for (var i in belongLHS){
	    for (var j in belongRHS){
		for (var rr in constraint.relationRules){
		    if(!((constraint.relationRules[rr])(belongLHS[i],
							belongRHS[j]))){
			var conflict = new conflictObject([belongLHS[i].session, belongRHS[j].session], 
							  constraint.type, 
							  [belongLHS[i], belongRHS[j]],
							  constraint.description);
			conflictList.push(conflict);
			break; 
			// TODO: only record one form of violation per entities
		    }
		}
	    }
	}
	return conflictList;
    }
    
    function checkConflicts(constraint){
	// TODO: explain why doesn't match
	// assume single entity constraint
	// 1. Get eligible sessions
	var belongList = belongs(constraint.entityRules);
	
	// 2. find all that violates constraint
	var violations = violates(constraint.constraintObjectRules,
				  belongList); // paths
	var conflicts = [];
	for(var i in violations){
	    conflicts.push(new conflictObject([violations[i].session],
					      constraint.type, 
					      violations[i],
					      constraint.description));

	}
		
	return conflicts;
    }
    
    
    return {tester: tester,
	    belongs: belongs,
	    equal: equal,
	    checkConflicts: checkConflicts};
}();

