
document.getElementById("query").disabled=true;
document.getElementById("remove").disabled=true; var delay = 200 // make slider

function query() {
	var vert1 = document.getElementById('edge-from').value
	var vert2 = document.getElementById('edge-to').value
	var result = sn.query(vert1, vert2);
	naive.query(vert1, vert2);
	es.query(vert1, vert2);
	//spork.query();
	
	console.log(result);
	document.getElementById('query-result').innerHTML = result;
	document.getElementById("query").disabled=true;
	document.getElementById("remove").disabled=true;
	highlight();
}

function preprocess() {
	naive.preprocess();
	es.preprocess();
	spork.preprocess();
	document.getElementById("preprocess").disabled=true;
	highlight();
	
}

function deleteEdge() {
	var vert1 = document.getElementById('edge-from').value
	var vert2 = document.getElementById('edge-to').value
	sn.deleteEdge(vert1, vert2);
	naive.deleteEdge(vert1, vert2);
	es.deleteEdge(vert1, vert2);
	//spork.deleteEdge();
	document.getElementById("query").disabled=true;
	document.getElementById("remove").disabled=true;
	highlight();
}

function highlight() {
	if (sn.animationQueue.length == 0 && naive.animationQueue.length == 0 && spork.animationQueue.length == 0 && es.animationQueue.length == 0) {
		document.getElementById("query").disabled=false;
		document.getElementById("remove").disabled=false;
		return;
	}
	
	if (sn.animationQueue.length > 0) {
		var action = sn.animationQueue[0]
		action.func.apply(action.that, action.args)
		sn.animationQueue.splice(0,1)
	}
	if (naive.animationQueue.length > 0) {
		var action = naive.animationQueue[0];
		action.func.apply(action.that, action.args);
		naive.animationQueue.splice(0,1);

	}
	
	if (spork.animationQueue.length > 0) {
	    var action = spork.animationQueue[0]
	    action.func.apply(action.that, action.args)
	    spork.animationQueue.splice(0,1)
	}

	if (es.animationQueue.length > 0) {
		var action = es.animationQueue[0];
		action.func.apply(action.that, action.args);
		es.animationQueue.splice(0,1);
	}

	setTimeout(function() { highlight() }, delay)
	// allow the user to set the animation speed
}
