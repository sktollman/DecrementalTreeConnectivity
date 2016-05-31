
var delay = 200 // make slider

// ** should also allow the user to delete nodes and edges? 

var sn;
var naive;
var es;
var spork;
var nodesWithoutEdges;

reset();

function defaultGraph() {
	var nodes = [
			{id: '1', label: '1'},
			{id: '2', label: '2'},
			{id: '3', label: '3'},
			{id: '4', label: '4'},
			{id: '5', label: '5'}
			];
	var edges = [
				{id: '1', from: '1', to: '2'},
				{id: '2', from: '1', to: '3'},
				{id: '3', from: '2', to: '4'},
				{id: '4', from: '2', to: '5'}
				];

	createAllGraphs(nodes, edges);	
}

function reset() {
	document.getElementById("preprocess").disabled=true;
	document.getElementById("add-edge").disabled=true;
	document.getElementById("query").disabled=true;
	document.getElementById("remove").disabled=true; 
	document.getElementById("clear").disabled=true; 
	document.getElementById("default-graph").disabled=false;
	document.getElementById("random-graph").disabled=false;

	
	if (sn != undefined) {
		sn.graph.clearGraph();
		naive.graph.clearGraph();
		es.graph.clearGraph();
		spork.graph.clearGraph();
	}

	sn = undefined;
	naive = undefined;
	es = undefined;
	spork = undefined;
	nodesWithoutEdges = {};
}

function createAllGraphs(nodes, edges) { 
	var container1 = document.getElementById('network_supernaive');
	var g_supernaive = new Graph(container1, nodes, edges);
	g_supernaive.draw();
	sn = new SuperNaive(g_supernaive);

	var container2 = document.getElementById('network_naive');
	var g_naive = new Graph(container2, nodes, edges);
	g_naive.draw();
	naive = new Naive(g_naive);

	var container4 = document.getElementById('network_es');
	var g_es = new Graph(container4, nodes, edges);
	g_es.draw();
	es = new EvenShiloach(g_es);

	var container3 = document.getElementById('network_spork');
	var g_spork = new Graph(container3, nodes, edges);
	g_spork.draw();
	spork = new AlstrupSecherSpork(g_spork);

	// disable random and default buttons, enable edge add and preprocess.
	document.getElementById("preprocess").disabled=false;
	document.getElementById("clear").disabled=false;
	document.getElementById("add-node").disabled=false;
	document.getElementById("add-edge").disabled=false;
	document.getElementById("default-graph").disabled=true;
	document.getElementById("random-graph").disabled=true;
}


function addNode() {
 	if (!sn) { // we don't yet have graphs
 		createAllGraphs([], []);
 	}
 	var id = sn.graph.nextNodeId(); // will be the same for all of them

 	// turn off the preprocess button until an edge is added, as it is not yet a valid tree
	document.getElementById("preprocess").disabled=true;
	nodesWithoutEdges[id] = true;

 	sn.graph.addNode(id, id);
 	naive.graph.addNode(id, id);
 	es.graph.addNode(id, id);
 	spork.graph.addNode(id, id);
}

function addEdge() {
	var vert1 = document.getElementById('edge-from-create').value
	var vert2 = document.getElementById('edge-to-create').value

	if (sn.query(vert1, vert2)) return; // there is a path between the vertices, adding an edge would cause a cycle

	var id = sn.graph.nextEdgeId(); // will be the same for all of them
	sn.graph.addEdge(id, vert1, vert2)
 	naive.graph.addEdge(id, vert1, vert2)
 	es.graph.addEdge(id, vert1, vert2)
 	spork.graph.addEdge(id, vert1, vert2)

 	if (vert1 in nodesWithoutEdges) delete nodesWithoutEdges[vert1];
 	if (vert2 in nodesWithoutEdges) delete nodesWithoutEdges[vert2];

 	// enable the preprocess button if it is a valid tree (i.e. connected)
 	if (Object.keys(nodesWithoutEdges).length === 0)
 		document.getElementById("preprocess").disabled=false;

}

// not yet implemented 
function randomGraph() {
	// random number of nodes between 1 and 15
	var numNodes = Math.floor((Math.random() * 10) + 5);
	var nodes = [];
	for (n in numNodes) {
		id = (n+1).toString()
		nodes.push({id: id, label: id})
	}
	var edges = [];
	for (var n=1; n < numNodes; n++) {
		id = (n+1).toString()
		nodes.push({id: id, label: id})
	}
	return {nodes: nodes, edges: edges}
}

function initializeDataStructures() {

}

function query() {
	console.log('query')
	var vert1 = document.getElementById('edge-from').value
	var vert2 = document.getElementById('edge-to').value
	console.log('got values')
	var result = sn.query(vert1, vert2);
	console.log('sn')
	naive.query(vert1, vert2);
	console.log('naive')
	es.query(vert1, vert2);
	console.log('es')
	spork.query(vert1, vert2);
	console.log('spork')
	
	console.log(result);
	document.getElementById('query-result').innerHTML = result;
	document.getElementById("query").disabled=true;
	document.getElementById("clear").disabled=true;
	document.getElementById("remove").disabled=true;
	pause = parseInt(document.getElementById("pause").value);
	if (pause > 0) delay = pause;
	highlight();
}

function preprocess() {
	document.getElementById("add-node").disabled=true;
	document.getElementById("add-edge").disabled=true;

	initializeDataStructures();
	naive.preprocess();
	es.preprocess();
	spork.preprocess();
	document.getElementById("preprocess").disabled=true;
	document.getElementById("clear").disabled=true;
	pause = parseInt(document.getElementById("pause").value);
	if (pause > 0) delay = pause;
	console.log(pause)
	highlight();
	
}

function deleteEdge() {
	var vert1 = document.getElementById('edge-from').value
	var vert2 = document.getElementById('edge-to').value
	sn.deleteEdge(vert1, vert2);
	naive.deleteEdge(vert1, vert2);
	es.deleteEdge(vert1, vert2);
	spork.deleteEdge(vert1, vert2);
	document.getElementById("query").disabled=true;
	document.getElementById("remove").disabled=true;
	document.getElementById("clear").disabled=true;
	pause = parseInt(document.getElementById("pause").value);
	if (pause > 0) delay = pause;
	highlight();
}

function highlight() {
	if (sn.animationQueue.length == 0 && naive.animationQueue.length == 0 && spork.animationQueue.length == 0 && es.animationQueue.length == 0) {
		document.getElementById("query").disabled=false;
		document.getElementById("remove").disabled=false;
		document.getElementById("clear").disabled=false;
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
