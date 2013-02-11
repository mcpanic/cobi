function SingleEntityConstraint(type, description, importance, rationale, entityRules, constraintObjectRules){
    this.importance = importance;
    this.rationale = rationale;
    this.entityRules = entityRules;
    this.constraintObjectRules = constraintObjectRules;
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
						 "only before 11",
						 10,
						 "because I am early riser",
						 [new Rule('submission', 
							   function(x){ 
							       return x.title.indexOf("Don") != -1
							   })],
						 [new Rule('session',
							   function (x){
							       return x.time == '9:00-10:20';
							   })]);
	console.log(checkConflicts(example));
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
	var matches = {};
	var levels = groupRulesByLevel(rules);
	for(var s in allSessions){
	    var paths = generatePaths(s, levels);
	    var legal = pathsBelongs(levels, paths);
	    var legalPaths = [];
	    for(var i in legal){
		if (legal[i]) legalPaths.push(paths[i]);
	    }
	    if(legalPaths.length > 0){
		matches[s] = legalPaths;
	    }
	}
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
    
    function checkConflicts(constraint){
	// TODO: explain why doesn't match
	// assume single entity constraint
	var violationsBySession = {};
	// 1. Get eligible sessions
	var belongList = belongs(constraint.entityRules);
	console.log(belongList);
	
	// 2. find all that violates constraint
	for (s in belongList){
	    var violations = violates(constraint.constraintObjectRules,
				      belongList[s]); // paths
	    if(violations.length > 0){
		violationsBySession[s] = new conflictObject([s], 
							    constraint.type, 
							    violations, 
							    constraint.description);
	    }
	}
	return violationsBySession;
    }
    
    return {tester: tester,
	    belongs: belongs,
	    equal: equal,
	    checkConflicts: checkConflicts};
}();

