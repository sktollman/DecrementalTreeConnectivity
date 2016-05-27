/*
 * Creates a graph object which allows you to dynamically update
 * and access nodes and edges
 */
var Graph = function(container) {
	var nodes, edges, network;

	this.addNode = function(id, label) {
		try {
			nodes.add({
				id: id,
				label: label
			});
		}
		catch (err) {
			alert(err);
		}
	};

	this.updateNode = function(id, label) {
		try {
			nodes.update({
				id: id,
				label: label
			});
		}
		catch (err) {
			alert(err);
		}
	}


	this.removeNode = function(id) {
		try {
			nodes.remove({id: id});
		}
		catch (err) {
			alert(err);
		}
	}


	this.addEdge = function(id, from, to) {
		try {
			edges.add({
				id: id,
				from: from,
				to: to
			});
		}
		catch (err) {
			alert(err);
		}
	}


	this.updateEdge = function(id, from, to) {
		try {
			edges.update({
				id: id,
				from: from,
				to: to
			});
		}
		catch (err) {
			alert(err);
		}
	}


	this.removeEdge = function(id) {
		try {
			edges.remove({id: id});
		}
		catch (err) {
			alert(err);
		}
	}

	this.draw = function() {
		// create an array with nodes
		nodes = new vis.DataSet();
		//nodes.on('*', function () {
			//document.getElementById('nodes').innerHTML = toJSON(nodes.get())
		//});
		nodes.add([
			{id: '1', label: 'Node 1'},
			{id: '2', label: 'Node 2'},
			{id: '3', label: 'Node 3'},
			{id: '4', label: 'Node 4'},
			{id: '5', label: 'Node 5'}
		]);

		// create an array with edges
		edges = new vis.DataSet();
		//edges.on('*', function () {
			//document.getElementById('edges').innerHTML = toJSON(edges.get())
		//});
		edges.add([
			{id: '1', from: '1', to: '2'},
			{id: '2', from: '1', to: '3'},
			{id: '3', from: '2', to: '4'},
			{id: '4', from: '2', to: '5'}
		]);

		// create a network
		var data = {
			nodes: nodes,
			edges: edges
		};
		var options = {};
		network = new vis.Network(container, data, options);
	}
};

// convenience function
function toJSON(obj) {
	return JSON.stringify(obj, null, 4);
}
