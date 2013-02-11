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

// level == session
// level == submission
// level == author
function exist(s, level, comp){
    var matches = [];
    if(level == 'session'){
	if(comp(s)){
	    matches.push(new entityTrace(s.id, null, null));
	}
	return matches;
    }else if(level == 'submission'){
	for(var sub in s.submissions){
	    if(comp(s.submissions[sub])){
		matches.push(new entityTrace(s.id, sub, null));
	    }
	}
	return matches;
    }else if(level == 'author'){
	for(var sub in s.submissions){
	    for(var auth in s.submissions[sub].authors){
		if(comp(s.submissions[sub].authors[auth])){
		    matches.push(new entityTrace(s.id, sub, auth));
		}
	    }
	}
	return matches;
    }
}

function Rule(keyHierarchy, comp){
    this.keyHierarchy = keyHierarchy;
    this.comp = comp;
}

var CCOps = function(){
    function tester(){
	alert("hi");
    }
    function equal(a, b){
	return a == b;
    }
    function sessionMatchesRules(x, rules){
	var violatedRules = [];
	
	for (var i in rules){
	    if(!sessionMatchesPred(x, rules[i].keyHierarchy, rules[i].comp)){
		violatedRules.push(rules[i]);
	    }
	}
	return violatedRules;
    }
function multiLevel(rules){
    var matches = [];
    var levels = {};
    levels['session'] = [];
    levels['submission'] = [];
    levels['author'] = [];
    
    for(var i = 0; i < rules.length; i++){
	levels[levels[rules[i].level]].push(rules[i]);
    }
    // define all paths
    var paths = [];

    for(var s in allSessions){
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
    }
    
    var legal = [];
    for(var i in paths){
	legal.push(true);
    }
    // filter through level by level
    for(var i in paths){
	if(legal[i]){
	    for(var sessionRule in levels['session']){
		if(!(levels['session'][sessionRule].comp)(allSessions[paths[i].session])){
		    legal[i] = false;
		}
	    }
	}
    }

    for(var i in paths){
	if(legal[i]){
	    for(var submissionRule in levels['submission']){
		if(!(levels['submission'][submissionRule].comp)(allSessions[paths[i].session].submissions[paths[i].submission])){
		    legal[i] = false;
		}
	    }
	}
    }

    for(var i in paths){
	if(legal[i]){
	    for(var authorRule in levels['author']){
		if(!(levels['author'][authorRule].comp)(allSessions[paths[i].session].submissions[paths[i].submission].authors[paths[i].author])){
		    legal[i] = false;
		}
	    }
	}
    }
    
    var legalPaths = [];
    for (var i in paths){
	if(legal[i]){
	    legalPaths.push(paths[i])
	}
    }
    return legalPaths;
}
    
    function sessionMatchesPred(x, keyHierarchy, comp, value){
	var o = x;
	for (i in keyHierarchy){
	    if (keyHierarchy[i] in x){
		o = x[keyHierarchy[i]];
	    }else{
		// not this object
		return false;
	    }
	}
	return comp(o, value);
    }

    function getAllMatchingSessions(sessionKeys, rule){
	var matchingSessions = [];
	for (s in sessionKeys){
	    if(sessionMatchesPred(allSessions[sessionKeys[s]], rule.keyHierarchy, rule.comp, rule.value)){
		matchingSessions.push(s);
	    }
	}
	return matchingSessions;
    }
    
    // find all sessions that satisfy a set of rules
    function belongs(rules){
	var belongList = [];
	for(s in allSessions){
	    var violations = sessionMatchesRules(allSessions[s], rules);
	    if(violations.length == 0){
		belongList.push(s);
	    }
	}
	return belongList;
    }
    
    function checkForViolation(constraint){
	// TODO: explain why doesn't match
	// assume single entity constraint
	var sessionViolations = [];
	// 1. Get eligible sessions
	belongList = belongs(constraint.entityRules);
	// 2. find all that violates constraint
	for (s in belongList){
	    var violations = sessionMatchesRules(allSessions[s], 
						 constraint.constraintObjectRules);
	    if(violations.length != 0){
		sessionViolations.push(new conflictObject([s],
							  constraint.type,
							  violations,
							  constraint.description));
	    }
	}
	return sessionViolations;
    }
    
    return {tester: tester,
	    checkForViolation: checkForViolation,
	    sessionMatchesPred: sessionMatchesPred,
	    getAllMatchingSessions: getAllMatchingSessions,
	    belongs: belongs,
	    multiLevel: multiLevel,
	    equal: equal};
}();

