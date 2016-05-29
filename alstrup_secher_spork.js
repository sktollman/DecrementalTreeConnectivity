var AlstrupSecherSpork = function(graph) {
	this.graph = graph;
	this.numNodes = length(this.graph.getVertices());
	this.logSize = Math.log(this.numNodes);
	this.clusters = [];
	this.clusterMap = {};

	this.animationQueue = new Array()

	//for preprocessing
	this.addCluster = function(cluster){
		//update the variables to keep track of the cluster
		var nodes = cluster.nodes
		for(var n in nodes){
			this.clusterMap[nodes[n]] = cluster;
			// highlight nodes 
		}
		this.clusters.push[cluster]; 
	};
	//recursively generate clusters as per Fredrickson
	this.makeCluster = function(node) {
		//add the cluster to the map
		this.clusterMap[node] = null;
		var clus = [node];
		var neighbors = this.graph.getNeighbors(node);
		var deg = length(neighbors);
		var size = 1;
		for(var n in neighbors){
			var neighbor = neighbors[n]
			if(!(neighbor in this.clusterMap)) continue;
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
		//pick a root node of degree one
		var verts = this.graph.getVertices();
		var rt = null;
		for(var vert in verts){
			if(length(this.graph.getNeighbors(verts[vert])) === 1){
				rt = verts[vert];
				break;
			}
		}
		//cluster all of the nodes
		this.addCluster(this.makeCluster(rt));

		//add boundary node information
		for(var c in this.clusters){
			var clus = this.clusters[c]
			clus.boundaries = [];
			for(var node in clus.nodes){
				for(var nbor in this.graph.getNeighbors(node)){
					if(this.clusterMap[nbor] !== clus){
						clus.boundaries.push(node);
						// make that node bigger
						break;
					}
				}
			}
		}

		//go through all the boundary nodes and check their connectivity
		var macroNodes = [];
		var macroEdges = [];
		for(var c in this.clusters){
			var clus = this.clusters[c]
			for(var b in clus.boundaries){
				var bound = clus.boundaries[b]
				macroNodes.push(bound);
				var neighbors = this.graph.getNeighbors(bound)
				for(var n in neighbors){
					var nbor = neighbors[n]
					if(this.clusterMap[nbor] !== clus || nbor in clus.boundaries){
						macroEdges.push([bound, nbor]);
						// make this edge bigger
					}
				}
			}
		}
		//make macro representation
		this.macroGraph = new Graph(macroNodes, macroEdges);
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

			// DFS COLORING
			while(stack.length > 0){
				var curr = stack.pop();
				searched.push[curr];
				var neighbors = this.graph.getNeighbors(curr)
				for(var n in neighbors){
					var nbor = neighbors[n]
					if(nbor in searched || this.clusterMap[nbor] !== clus) continue;
					//add edge to lists
					stack.push(nbor);
					clus.microEdges.push([curr, nbor]);
					//keep track of root->nbor path for each one
					var newEdgeInd = length(clus.microEdges) - 1;
					clus.pathWords[nbor] = clus.pathWords[curr] | (1 << newEdgeInd);
				}
			}

			//set up the bitvector edgeWord with 1s for edges that exist
			clus.edgeWord = (1 << length(clus.microEdges)) - 1;
		}
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
				boundaries1.push(vert);
			}
		}
		//check the boundary nodes we found for macro connetivity
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
		}
	};
};