function SingleEntityConstraint(type, description, importance, rationale, entityRules, constraintObjectRules){
    this.importance = importance;
    this.rationale = rationale;
    this.entityRules = entityRules;
    this.constraintObjectRules = constraintObjectRules;
    this.description = description;
    this.type = type;
}

function Rule(keyHierarchy, comp, value){
    this.keyHierarchy = keyHierarchy;
    this.comp = comp;
    this.value = value;
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
	    if(!sessionMatchesPred(x, rules[i].keyHierarchy, rules[i].comp, rules[i].value)){
		violatedRules.push(rules[i]);
	    }
	}
	return violatedRules;
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
	    equal: equal};
}();

