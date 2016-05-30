/*
 * Creates a graph object which allows you to dynamically update
 * and access nodes and edges
 */

var Graph = function(container, nodes_param, edges_param) {
	// default values
	if (nodes_param == undefined) nodes_param = [
			{id: '1', label: '1'},
			{id: '2', label: '2'},
			{id: '3', label: '3'},
			{id: '4', label: '4'},
			{id: '5', label: '5'}
			];
	if (edges_param == undefined) edges_param = [
				{id: '1', from: '1', to: '2'},
				{id: '2', from: '1', to: '3'},
				{id: '3', from: '2', to: '4'},
				{id: '4', from: '2', to: '5'}
				];

	this.network = {};
	this.container = container;
	this.edges = new vis.DataSet(edges_param);
	this.nodes = new vis.DataSet(nodes_param);

	this.neighbors = {};
	for (var n in nodes_param) {
		this.neighbors[nodes_param[n].id] = new Array();
	}
	for (var e in edges_param) {
		this.neighbors[edges_param[e].from].push(edges_param[e].to);
		this.neighbors[edges_param[e].to].push(edges_param[e].from);
	}

	this.edgeToId = {};
	for (var e in edges_param) {
		var edge = edges_param[e];
		var fromTo = edge.from + edge.to;
		this.edgeToId[fromTo] = edge.id;
	};

	this.getNeighbors = function(id) {
		console.log(id)
		return this.neighbors[id];
	};

	this.addNode = function(id, label) {
		this.nodes.add({
			id: id,
			label: label
		});
	};

	this.updateNodeGroup = function(id, groupNum) {
		this.nodes.update({
			id: id, 
			group: groupNum
		});
	};

	this.enlargenNode = function(id) {
		this.nodes.update({
			id: id, 
			size: 20
		});
	};

	this.highlightNode = function(id, backgroundColor, borderColor) {
		this.nodes.update({
			id: id, 
			color: {
				background: backgroundColor,
				border: borderColor
			}
		});
	};

	this.unhighlightNode = function(id) {
		this.nodes.update({
			id: id,
			color: null
		});
	};

	this.unhighlightAll = function() {
		// later should update all edges too
		items = this.nodes.get()
		for (var i in items) {
			//console.log(items[i].group)
			if (items[i].group) {
				this.nodes.update({
					id: items[i].id,
					group: items[i].group
				});
			} else {
				this.nodes.update({
					id: items[i].id,
					color: null
				});
			}
			
		}
	};

	this.enlargenEdge = function(from, to) {
		var fromTo = from + to
		var id = this.edgeToId[fromTo];
		this.edges.update({
			id: id, 
			from: from,
			to: to,
			width: 4
		});
	};

	this.highlightEdge = function(from, to, c) {
		var fromTo = from + to
		var id = this.edgeToId[fromTo];
		this.edges.update({
			id: id, 
			from: from,
			to: to,
			color: {
				color: c
			},
			dashes: true
		});
	};

	this.unhighlightEdge = function(to, from) {
		var fromTo = from + to
		var id = this.edgeToId[fromTo];
		this.edges.update({
			id: id,
			from: from,
			to: to,
			color: null
		});
	};

	this.getVertices = function() {
		return this.nodes.get()
	};

	this.updateNode = function(id, label) {
		this.nodes.update({
			id: id,
			label: label
		});
	};


	this.removeNode = function(id) {
		this.nodes.remove({id: id});
	};


	this.addEdge = function(id, from, to) {
		this.edges.add({
			id: id,
			from: from,
			to: to
		});
	};


	this.updateEdge = function(id, from, to) {
		this.edges.update({
			id: id,
			from: from,
			to: to
		});
	};


	this.removeEdge = function(from, to) {
		var fromTo = from + to;
		this.edges.remove({id: this.edgeToId[fromTo]});
		var index = this.neighbors[from].indexOf(to);
		this.neighbors[from].splice(index, 1);
	};

	this.draw = function() {
		// create a network
		var data = {
			nodes: this.nodes,
			edges: this.edges
		};
		var options = { 
			nodes: {
		        shape: 'dot',
		        size: 10,
		        font: {
		            size: 12,
		            color: '#ffffff'
		        },
		        color: {
		        	background: '#EEE9E9',
		        	border: '#EEE9E9'
		        },
		        borderWidth: 2
		    },
		    edges: {
		        width: 2,
				//arrows: 'to',
				color: {
					inherit: false
				}
			},
			layout: {
				hierarchical: {
					enabled: true,
					direction: 'UD',
					sortMethod: 'directed',
					levelSeparation: 70,
					treeSpacing: 70
				}
			},
			physics: {
				enabled: false
			},
			groups: {
				// what if the nodes could be default colored but insides are all same as background color? 
				'1': {
					color: {
						background: '#EEE9E9',
						border: '#FF1493'
					}
				},
				'2': {
					color: {
						background: '#EEE9E9',
						border: '#00BFFF'
					}
				},
				'3': {
					color: {
						background: '#EEE9E9',
						border: '#00EEEE'
					}
				},
				'4': {
					color: {
						background: '#EEE9E9',
						border: '#5CACEE'
					}
				},
				'5': {
					color: {
						background: '#EEE9E9',
						border: '#9ACD32'
					}
				},
				'6': {
					color: {
						background: '#EEE9E9',
						border: '#9B30FF'
					}
				},
				'7': {
					color: {
						background: '#EEE9E9',
						border: '#FA8072'
					}
				}
			}
		};
		this.network = new vis.Network(this.container, data, options);
	}
};

// convenience function
function toJSON(obj) {
	return JSON.stringify(obj, null, 4);
}