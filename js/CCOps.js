var CCOps = function(){
    function tester(){
	alert("hi");
    }
    function equal(a, b){
	return a == b;
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

    function getAllMatchingSessions(sessionKeys, keyHierarchy, comp, value){
	var matchingSessions = [];
	for (s in sessionKeys){
	    if(sessionMatchesPred(allSessions[sessionKeys[s]], keyHierarchy, comp, value)){
		matchingSessions.push(s);
	    }
	}
	return matchingSessions;
    }
    // find all sessions that satisfy a set of rules
    function belongs(rules){
	var sessionKeys = keys(allSessions);
	for (i in rules){
	    sessionKeys = getAllMatchingSessions(sessionKeys,
						 rules[i].keyHierarchy,
						 rules[i].comp,
						 rules[i].value);
	}
	return sessionKeys;
    }
    return {tester: tester,
	    sessionMatchesPred: sessionMatchesPred,
	    getAllMatchingSessions: getAllMatchingSessions,
	    belongs, belongs,
	    equal: equal};
}();

