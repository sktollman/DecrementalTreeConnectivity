var AlstrupSecherSpork = function(graph) {
	this.graph = graph;
	this.numNodes = this.graph.getVertices().length;
	this.logSize = Math.log(this.numNodes);
	this.clusters = [];
	this.clusterMap = {};

	this.animationQueue = new Array();

	//for preprocessing
	this.addCluster = function(cluster){
		//update the variables to keep track of the cluster
		var nodes = cluster.nodes;
		for(var n in nodes){
			this.clusterMap[nodes[n]] = cluster;
			// highlight nodes 
			// clusters.length will be the eventual index of this cluster
			this.animationQueue.push({func: this.graph.updateNodeGroup, that: this.graph, args: [nodes[n], this.clusters.length+1]});
		}
		this.clusters.push(cluster);
		console.log(this.clusters);
	};
	//recursively generate clusters as per Fredrickson
	this.makeCluster = function(node) {
		//add the cluster to the map
		this.clusterMap[node] = null;
		var clus = [node];
		var neighbors = this.graph.getNeighbors(node);
		var deg = neighbors.length;
		var sz = 1;
		for(var n in neighbors){
			var neighbor = neighbors[n];
			if(neighbor in this.clusterMap) continue;
			var nborCluster = this.makeCluster(neighbor);
			if(deg + nborCluster.degree - 2 <= 2 && sz + nborCluster.size <= this.logSize){
				clus += nborCluster.nodes;
				deg += nborCluster.degree - 2;
				sz += nborCluster.size;
			}
			else{
				this.addCluster(nborCluster);
			}
		}
		return {nodes:clus, degree:deg, size:sz};
	};

	//O(n)
	this.preprocess = function() {
		//remake the graph such that all nodes have degree <= 3
		var verts = this.graph.getVertices();
		for (var i in verts) {
			var node = verts[i].id;
			this.animationQueue.push({func: this.graph.highlightNode, that: this.graph, args: [node, '#e60000', '#990000']}); // red
			var nbors = this.graph.getNeighbors(node);
			var deg = nbors.length;
		  	if(deg <= 3) {
		  		this.animationQueue.push({func: this.graph.highlightNode, that: this.graph, args: [node, '#878787', '#696969']}); // grey
		  		continue;
		  	}
		    this.graph.removeNode(node); //I assume this removes edges incident to node as well
		    var prevV = null;
		    for(var j in nbors){
		    	var nbor = nbors[j];
		    	this.animationQueue.push({func: this.graph.highlightNode, that: this.graph, args: [nbor, '#ffff00', '#ffd700']}); // yellow
		    	//var currV = new Vertex(); //I know this is wrong sorry but Idk how it works
			    this.graph.addNode(nbor, nbor);
			    if (prevV != null) {
			    	this.graph.addEdge(currV, prevV);
			    }
			    this.graph.addEdge(currV, nbor);
			    prevV = currV;
		    }
		    this.animationQueue.push({func: this.graph.highlightNode, that: this.graph, args: [node, '#878787', '#696969']}); // grey
		}

		this.animationQueue.push({func: this.graph.unhighlightAll, that: this.graph, args: []});

		var rt = null;
		for (var vert in verts) {
			if (this.graph.getNeighbors(verts[vert].id).length == 1) {
				rt = verts[vert];
				break;
			}
		}

		//cluster all of the nodes
		this.addCluster(this.makeCluster(rt.id));

		//add boundary node information
		for(var c in this.clusters){
			var clus = this.clusters[c]
			clus.boundaries = [];
			for(var n in clus.nodes){
				var node = clus.nodes[n]
				var nbors = this.graph.getNeighbors(node)
				for(var nbor in nbors){
					if(this.clusterMap[nbors[nbor]] !== clus){
						clus.boundaries.push(node);
						// make that node bigger
						this.animationQueue.push({func: this.graph.enlargeNode, that: this.graph, args: [node]});
						break;
					}
				}
			}
		}

		//go through all the boundary nodes and check their connectivity
		var macroNodes = [];
		var macroEdges = [];
		var edgenum = 0;
		
		for(var c in this.clusters){
			var clus = this.clusters[c]
			for(var b in clus.boundaries){
				var bound = clus.boundaries[b]
				macroNodes.push({id: bound, label: bound});
				var neighbors = this.graph.getNeighbors(bound)
				for(var n in neighbors){
					var nbor = neighbors[n];
					if(this.clusterMap[nbor] !== clus || nbor in clus.boundaries){
						if (parseInt(bound) < parseInt(nbor)) {
							macroEdges.push({id: edgenum, from: bound, to: nbor});
							edgenum++;
							// make this edge bigger
							this.animationQueue.push({func: this.graph.enlargeEdge, that: this.graph, args: [bound, nbor]});
						}
					}
				}
				for(var n in clus.boundaries){
					var nbor = neighbors[n];
					if (parseInt(bound) < parseInt(nbor)) {
						macroEdges.push({id: edgenum, from: bound, to: nbor});
						edgenum++;
						// make this edge bigger
						this.animationQueue.push({func: this.graph.enlargeEdge, that: this.graph, args: [bound, nbor]});
					}
				}
			}
		}
		//make macro representation
		this.macroGraph = new Graph("", macroNodes, macroEdges);
		this.macroESRepr = new EvenShiloach(this.macroGraph);

		//make micro representations for each cluster
		for(var c in this.clusters){
			var clus = this.clusters[c]
			//create pathwords that correspond to each of the nodes
			clus.pathWords = {};
			clus.pathWords[clus.boundaries[0]] = 0;
			//get list of all edges in cluster with DFS
			clus.microEdges = [];
			var stack = [clus.boundaries[0]];
			var searched = [];

			// highlight label, change, unhighlight 
			var nbor = clus.boundaries[0];
			this.animationQueue.push({func: this.graph.updateLabelColor, that: this.graph, args: [nbor, '#e60000']}); 
			this.animationQueue.push({func: this.graph.updateLabelText, that: this.graph, args: [nbor, intToBitString(0)]}); 
			this.animationQueue.push({func: this.graph.unhighlightLabel, that: this.graph, args: [nbor]}); 


			// DFS COLORING
			while(stack.length > 0){
				var curr = stack.pop();
				this.animationQueue.push({func: this.graph.highlightNode, that: this.graph, args: [curr, '#e60000', '#990000']}); // red
				searched.push[curr];
				var neighbors = this.graph.getNeighbors(curr)
				for(var n in neighbors){
					var nbor = neighbors[n]
					if(nbor in searched || this.clusterMap[nbor] !== clus) continue;
					this.animationQueue.push({func: this.graph.highlightNode, that: this.graph, args: [nbor, '#ffff00', '#ffd700']}); // yellow
					//add edge to lists
					stack.push(nbor);
					clus.microEdges.push([curr, nbor]);
					//keep track of root->nbor path for each one
					var newEdgeInd = clus.microEdges.length - 1;
					clus.pathWords[nbor] = clus.pathWords[curr] | (1 << newEdgeInd);
					// highlight label, change, unhighlight 
					this.animationQueue.push({func: this.graph.updateLabelColor, that: this.graph, args: [nbor, '#e60000']}); 
					this.animationQueue.push({func: this.graph.updateLabelText, that: this.graph, args: [nbor, clus.pathwords[nbor].toString()]}); 
					this.animationQueue.push({func: this.graph.unhlighlightLabel, that: this.graph, args: [nbor]}); 

				}

				this.animationQueue.push({func: this.graph.highlightNode, that: this.graph, args: [curr, '#878787', '#696969']}); // grey
			}

			// FIGURE OUT HOW TO REPRESENT THIS 
			//set up the bitvector edgeWord with 1s for edges that exist
			clus.edgeWord = (1 << clus.microEdges.length) - 1;
		}
		this.animationQueue.push({func: this.graph.unhighlightAll, that: this.graph, args: []});

	};



	//query connectivity in the macro graph
	this.macroquery = function(macVert1, macVert2){
		return this.macroESRepr.query(macVert1, macVert2);
	};
	//query connectivity in a micro graph
	this.microquery = function(micVert1, micVert2){
		var cluster = this.clusterMap[micVert1];
		return (((cluster.pathWords[micVert1] ^ cluster.pathWords[micVert2]) & ~cluster.edgeWord) === 0);
	};

	//O(1)
	this.query = function(vert1, vert2) {
		// 

		var clu1 = this.clusterMap[vert1];
		var clu2 = this.clusterMap[vert2];
		//if they're in the same cluster, just check the micro connectivity
		if (clu1 === clu2) {
			return this.microquery(vert1, vert2);
		}
		//otherwise, check the boundary nodes each inner vert can get to
		var boundaries1 = [];
		for (var vert in clu1.boundaries) {
			if (this.microquery(vert1, vert)) {
				boundaries1.push(vert);
			}
		}
		var boundaries2 = [];
		for (var vert in clu2.boundaries) {
			if (this.microquery(vert2, vert)) {
				boundaries2.push(vert);
			}
		}
		//check the boundary nodes we found for macro connectivity
		for (var macVert1 in boundaries1) {
			for (var macVert2 in boundaries2) {
				if (this.macroquery(macVert1, macVert2))
					return true;
			}
		}
		return false;
	};

	//O(1)
	this.deleteEdge = function(vert1, vert2) {
		// first remove. 
		// use queue from macro es to color dfs over boundaries 
		// print bit representations. 
		// change bit representation
		this.animationQueue.push({func: this.graph.unhighlightAll, that: this.graph, args: []});
        this.animationQueue.push({func: this.graph.highlightEdge, that: this.graph, args: [vert1, vert2, '#e60000']});
        this.animationQueue.push({func: this.graph.removeEdge, that: this.graph, args: [vert1, vert2]}); 

		//if it's a macroedge, delete it in the macrograph
		var outerVerts = this.macroGraph.getVertices();
		if(vert1 in outerVerts && vert2 in outerVerts){
			this.macroESRepr.deleteEdge(vert1, vert2);
		}

		//find the cluster and delete there
		var cluster = this.clusterMap[vert1];
		if(cluster === this.clusterMap[vert2]){
			var edgeInd = cluster.microEdges.findIndex(function(edge){return (vert1 in edge && vert2 in edge)});
			cluster.edgeWord &= ~(1 << edgeInd);
			var bounds = cluster.boundaries;
			if(bounds.length === 2){
				if(this.macroquery(bounds[0], bounds[1]) && !this.microquery(bounds[0], bounds[1])){
					this.macroESRepr.deleteEdge(bounds[0], bounds[1]);
				}
			}
		}
	};

	// http://stackoverflow.com/questions/9939760/how-do-i-convert-an-integer-to-binary-in-javascript
	function intToBitString(value) {
    	var result = (value >>> 0).toString(2);
    	while (result.length < 8) result = '0' + result;
    	return result;
	}
};