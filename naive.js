var Naive = function(graph) {
	this.graph = graph;
	
	//O(n)
	this.preprocess = function() {
		this.clusterNums = 1;
		this.connectivityMap = {};
		for(var start in this.graph.getVertices()) {
			//if this vertex has already been assigned a cluster, skip it
			if(start in this.connectivityMap) continue;
			//DFS from this node, assigning them all the same cluster number
			var stack = [start];
			while(stack.length > 0){
				var curr = stack.pop();
				this.connectivityMap[curr] = this.clusterNums;
				for(var neighbor in this.graph.getNeighbors(curr)){
					if(neighbor in this.connectivityMap) continue;
					stack.push(neighbor);
				}
			}
			this.clusterNums++;
		}
		this.clusterNums--;
	};
	this.preprocess();

	//O(1)
	this.query = function(vert1, vert2) {
		//checks to see if the two vertices map to the same cluster
		return (this.connectivityMap[vert1] === this.connectivityMap[vert2]);
	};

	//O(n)
	this.deleteEdge = function(vert1, vert2) {
		//if there is no edge between them, quite
		if(!this.query(vert1, vert2)) return;

		//save the list of the component
		var comp = [vert1];
		//DFS over vert1's component
		var stack = [vert1];
		while(stack.length > 0){
			var curr = stack.pop();
			comp.push(curr);
			this.connectivityMap[curr] = -1;
			for(var neighbor in this.graph.getNeighbors(curr)){
				if(this.connectivityMap[neighbor] == -1) continue;
				stack.push(neighbor);
			}
		}

		//add a new cluster
		this.clusterNums++;
		//assign all the things in vert1's cluster the new number
		for(var vert in comp){
			this.connectivityMap[vert] = this.clusterNums;
		}
	};
};