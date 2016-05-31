/*
 * Creates a graph object which allows you to dynamically update
 * and access nodes and edges
 */

var Graph = function(container, nodes_param, edges_param) {
	var distinctColors = ['#ff0000', '#591616', '#ff8080', '#d96236', '#734939', '#4c1f00', 
	'#4d4139', '#f28100', '#332200', '#f2b63d', '#ffeabf', '#998c73', '#665200', '#a3bf30', 
	'#3e592d', '#8da67c', '#39e639', '#00731f', '#39e6ac', '#00d6e6', '#007780', '#003033', 
	'#36a3d9', '#b6def2', '#163a59', '#00388c', '#80a2ff', '#69738c', '#3d3df2', '#1c0d33', 
	'#3c0059', '#bf73e6', '#cc00ff', '#ffbffb', '#661a4d', '#e63995', '#806071', '#330014', 
	'#e6acbb', '#a60016', '#8c464f']

	var nodeBackgroundColor = '#EEE9E9'

	this.network = {};
	this.container = container;
	this.edges = new vis.DataSet(edges_param);
	this.nodes = new vis.DataSet(nodes_param);

	this.edgeId = 0;
	this.nodeId = 0;

	this.neighbors = {};
	for (var n in nodes_param) {
		asInt = parseInt(nodes_param[n].id);
		if (asInt > this.nodeId) this.nodeId = asInt

		this.neighbors[nodes_param[n].id] = new Array();
	}
	
	for (var e in edges_param) {
		asInt = parseInt(edges_param[e].id);
		if (asInt > this.edgeId) this.edgeId = asInt

		this.neighbors[edges_param[e].from].push(edges_param[e].to);
		this.neighbors[edges_param[e].to].push(edges_param[e].from);
	}

	this.edgeToId = {};
	for (var e in edges_param) {
		var edge = edges_param[e];
		var fromTo = edge.from + edge.to;
		this.edgeToId[fromTo] = edge.id;
		var toFrom = edge.to + edge.from;
		this.edgeToId[toFrom] = edge.id;
	}

	this.getNeighbors = function(id) {
		return this.neighbors[id];
	};

	this.nextNodeId = function() {
		this.nodeId++;
		return this.nodeId.toString();
	};

	this.nextEdgeId = function() {
		this.edgeId++;
		return this.edgeId.toString();
	};

	this.addNode = function(id, label) {
		this.nodes.add({
			id: id,
			label: label
		});
		this.neighbors[id] = new Array();
	};

	this.updateNodeGroup = function(id, groupNum) {
		this.nodes.update({
			id: id, 
			group: groupNum
		});
	};

	this.enlargeNode = function(id) {
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
		items = this.nodes.get();
		for (var i in items) {
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

	this.unhighlightES = function(esgraph) {
		items = esgraph.nodes.get();
		for (var i in items) {
			console.log(this.nodes.get(items[i].id))
			this.nodes.update({
				id: items[i].id,
				color:  {
					background: esgroups[items[i].group],
					border: groups[this.nodes.get(items[i].id).group].color.border
				}
			});
		}
	}

	this.updateESGroup = function(id, group) {
		this.nodes.update({
			id: id, 
			color: {
				background: groups[group].border
			}
		});
	}

	this.updateLabelColor = function(id, color) {
		this.nodes.update({
			id: id,
			font: {
				color: color
			}
		});
	}

	this.unhighlightLabel = function(id) {
		this.nodes.update({
			id: id,
			font: null
		});
	}

	this.updateLabelText = function(id, addition) {
		this.nodes.update({
			id: id,
			label: this.nodes.get(id).label + ', ' + addition
		});
	}

	this.updateMacroBit = function(id, bitstring) {
		var arr = this.nodes.get(id).split(", ");
		var label = arr[0] 
		if (arr.length == 3) label += ', ' + arr[1];
		label += ', ' + bitstring;
		this.nodes.update({
			id: id,
			label: label
		});
	}

	this.enlargeEdge = function(from, to) {
		var fromTo = from + to
		var id = this.edgeToId[fromTo];
		this.edges.update({
			id: id, 
			from: from,
			to: to,
			width: 8
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

	this.containsNode = function(id) {
		return (id in this.nodes.get());
	};

	this.containsEdge = function(from, to) {
		var fromTo = from + to
		var id = this.edgeToId[fromTo];
		return (id in this.edges.get());
	};

	this.clearGraph = function(id) {
		items = this.nodes.get();
		for (var i in items) {
			this.nodes.remove({id: items[i].id});
		}
	};


	this.addEdge = function(id, from, to) {
		if (!(to in this.neighbors) || !(from in this.neighbors)) return;
		this.edges.add({
			id: id,
			from: from,
			to: to
		});
		this.neighbors[from].push(to);
		this.neighbors[to].push(from);
		var fromTo = from + to;
		this.edgeToId[fromTo] = id;
		var toFrom = to + from;
		this.edgeToId[toFrom] = id;
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
					nodeSpacing: 135,
					treeSpacing: 135
				}
			},
			physics: {
				enabled: false
			},
			groups: groups
		};
		this.network = new vis.Network(this.container, data, options);
	}

	var groups = {
				'1': { color: { background: nodeBackgroundColor, border: '#FF1493' } },
				'2': { color: { background: nodeBackgroundColor, border: distinctColors[18] } },
				'3': { color: { background: nodeBackgroundColor, border: distinctColors[28] } },
				'4': { color: { background: nodeBackgroundColor, border: distinctColors[15] } },
				'5': { color: { background: nodeBackgroundColor, border: distinctColors[31] } },
				'6': { color: { background: nodeBackgroundColor, border: distinctColors[16] } },
				'7': { color: { background: nodeBackgroundColor, border: distinctColors[0] } },
				'8': { color: { background: nodeBackgroundColor, border: distinctColors[1] } },
				'9': { color: { background: nodeBackgroundColor, border: distinctColors[38] } },
				'10': { color: { background: nodeBackgroundColor, border: distinctColors[2] } },
				'11': { color: { background: nodeBackgroundColor, border: distinctColors[3] } },
				'12': { color: { background: nodeBackgroundColor, border: distinctColors[4] } },
				'13': { color: { background: nodeBackgroundColor, border: distinctColors[5] } },
				'14': { color: { background: nodeBackgroundColor, border: distinctColors[6] } },
				'15': { color: { background: nodeBackgroundColor, border: distinctColors[7] } },
				'16': { color: { background: nodeBackgroundColor, border: distinctColors[8] } },
				'17': { color: { background: nodeBackgroundColor, border: distinctColors[9] } },
				'18': { color: { background: nodeBackgroundColor, border: distinctColors[10] } },
				'19': { color: { background: nodeBackgroundColor, border: distinctColors[11] } },
				'20': { color: { background: nodeBackgroundColor, border: distinctColors[12] } },
				'21': { color: { background: nodeBackgroundColor, border: distinctColors[13] } },
				'22': { color: { background: nodeBackgroundColor, border: distinctColors[14] } },
				'23': { color: { background: nodeBackgroundColor, border: distinctColors[17] } },
				'24': { color: { background: nodeBackgroundColor, border: distinctColors[19] } },
				'25': { color: { background: nodeBackgroundColor, border: distinctColors[20] } },
				'26': { color: { background: nodeBackgroundColor, border: distinctColors[21] } },
				'27': { color: { background: nodeBackgroundColor, border: distinctColors[22] } },
				'28': { color: { background: nodeBackgroundColor, border: distinctColors[23] } },
				'29': { color: { background: nodeBackgroundColor, border: distinctColors[24] } },
				'30': { color: { background: nodeBackgroundColor, border: distinctColors[25] } },
				'31': { color: { background: nodeBackgroundColor, border: distinctColors[26] } },
				'32': { color: { background: nodeBackgroundColor, border: distinctColors[27] } },
				'33': { color: { background: nodeBackgroundColor, border: distinctColors[29] } },
				'34': { color: { background: nodeBackgroundColor, border: distinctColors[30] } },
				'35': { color: { background: nodeBackgroundColor, border: distinctColors[32] } },
				'36': { color: { background: nodeBackgroundColor, border: distinctColors[33] } },
				'37': { color: { background: nodeBackgroundColor, border: distinctColors[34] } },
				'38': { color: { background: nodeBackgroundColor, border: distinctColors[35] } },
				'39': { color: { background: nodeBackgroundColor, border: distinctColors[36] } },
				'40': { color: { background: nodeBackgroundColor, border: distinctColors[37] } },
				'41': { color: { background: nodeBackgroundColor, border: distinctColors[39] } },
				'42': { color: { background: nodeBackgroundColor, border: distinctColors[40] } },
			}

		var esgroups = {
			'1': '#FFC0CB',
			'2': '#E0FFFF',
			'3': '#FFBBFF',
			'4': '#F0FFF0',
			'5': '#FFFACD'
		}
};

// convenience function
function toJSON(obj) {
	return JSON.stringify(obj, null, 4);
}