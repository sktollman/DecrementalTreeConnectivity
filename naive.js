var Naive = function(graph) {
	this.graph = graph;
	this.animationQueue = new Array();
	
	//O(n)
	this.preprocess = function() {
		this.clusterNums = 1;
		this.connectivityMap = {};
		var vertices = this.graph.getVertices()
		for (var i in vertices) {
			var start = vertices[i].id;
			//if this vertex has already been assigned a cluster, skip it
			if (start in this.connectivityMap) continue;
			//DFS from this node, assigning them all the same cluster number
			var stack = [start];
			while (stack.length > 0){
				var curr = stack.pop();
				this.animationQueue.push({func: this.graph.highlightNode, that: this.graph, args: [curr, '#e60000', '#990000']}); // red
				this.connectivityMap[curr] = this.clusterNums;
				
				var neighbors = this.graph.getNeighbors(curr);
				for(var n in neighbors){
					if(neighbors[n] in this.connectivityMap) continue;
					this.animationQueue.push({func: this.graph.highlightNode, that: this.graph, args: [neighbors[n], '#ffff00', '#ffd700']}); // yellow
					stack.push(neighbors[n]);
				}

				this.animationQueue.push({func: this.graph.updateNodeGroup, that: this.graph, args: [curr, this.clusterNums]}); // put in correct group
			}
				
			this.clusterNums++;
		}
		this.clusterNums--;
	};

	//O(1)
	this.query = function(vert1, vert2) {
		//checks to see if the two vertices map to the same cluster
		this.animationQueue.push({func: this.graph.unhighlightAll, that: this.graph, args: []});
		this.animationQueue.push({func: this.graph.highlightNode, that: this.graph, args: [vert1, '#e60000', '#990000']}); // red
		this.animationQueue.push({func: this.graph.highlightNode, that: this.graph, args: [vert2, '#e60000', '#990000']}); // red
		if (this.connectivityMap[vert1] === this.connectivityMap[vert2]) {
			this.animationQueue.push({func: this.graph.highlightNode, that: this.graph, args: [vert1, '#00FF00', '#32CD32']}); // green
			this.animationQueue.push({func: this.graph.highlightNode, that: this.graph, args: [vert2, '#00FF00', '#32CD32']}); // green
			return true;
		}
		return false;
	};

	//O(n)
	this.deleteEdge = function(vert1, vert2) {
		this.animationQueue.push({func: this.graph.unhighlightAll, that: this.graph, args: []});
        this.animationQueue.push({func: this.graph.highlightEdge, that: this.graph, args: [vert1, vert2, '#e60000']});
        this.animationQueue.push({func: this.graph.removeEdge, that: this.graph, args: [vert1, vert2]}); 

		//save the list of the component
		var comp = []; // push vert1 in first while iteration
		//DFS over vert1's component
		var stack = [vert1];
		while (stack.length > 0) {
			var curr = stack.pop();
			this.animationQueue.push({func: this.graph.highlightNode, that: this.graph, args: [curr, '#e60000', '#990000']}); // red

			comp.push(curr);
			this.connectivityMap[curr] = -1;

			var neighbors = this.graph.getNeighbors(curr);
			for (var n in neighbors) {
				// the graph only removes the edge on animation, which is why we need the first check
				if(neighbors[n] == vert2 || this.connectivityMap[neighbors[n]] == -1) continue;
				this.animationQueue.push({func: this.graph.highlightNode, that: this.graph, args: [neighbors[n], '#ffff00', '#ffd700']}); // yellow
				stack.push(neighbors[n]);
			}
		}

		//add a new cluster
		this.clusterNums++;
		//assign all the things in vert1's cluster the new number
		for(var vert in comp){
			this.connectivityMap[comp[vert]] = this.clusterNums;
			this.animationQueue.push({func: this.graph.updateNodeGroup, that: this.graph, args: [comp[vert], this.clusterNums]}); 
		}
	};
};