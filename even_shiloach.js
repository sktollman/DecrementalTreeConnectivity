var EvenShiloach = function(graph) {
	this.graph = graph;
	
	//O(n)
	this.preprocess = function() {
		this.clusterNums = 1;
		this.connMap = {};
		for(var start in this.graph.getVertices()) {
			//if this vertex has already been assigned a cluster, skip it
			if(start in this.connMap) continue;
			//DFS from this node, assigning them all the same cluster number
			var stack = [start];
			while(stack.length > 0){
				var curr = stack.pop();
				this.connMap[curr] = this.clusterNums;
				for(var neighbor in this.graph.getNeighbors(curr)){
					if(neighbor in this.connMap) continue;
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
		return (this.connMap[vert1] === this.connMap[vert2]);
	};

	//O(log(n))
	this.deleteEdge = function(vert1, vert2) {
		//if there is no edge between them, quite
		if(!this.query(vert1, vert2)) return;

		var oldCluNum = this.connMap[vert1];
		//save the list of the two components
		var comp1 = [vert1];
		var comp2 = [vert2];
		//stacks for DFS. execute parallel DFS over the two components. stop when first is done
		var stack1 = [vert1];
		var stack2 = [vert2];
		while(stack1.length > 0 && stack2.length > 0){
			var curr1 = stack1.pop();
			var curr2 = stack2.pop();
			//add these nodes to the component lists, mark them as searched
			comp1.push(curr1);
			comp2.push(curr2);
			this.connMap[curr1] = -1;
			this.connMap[curr2] = -1;
			//add unsearched neighbors
			for(var neighbor in this.graph.getNeighbors(curr1)){
				if(this.connMap[neighbor] == -1) continue;
				stack1.push(neighbor);
			}
			for(var neighbor in this.graph.getNeighbors(curr2)){
				if(this.connMap[neighbor] == -1) continue;
				stack2.push(neighbor);
			}
		}

		//add a new cluster
		this.clusterNums++;
		//pick the smaller one (the one that ended the DFS)
		var comp = comp1;
		var compOther = comp2;
		if(stack1.length > 0){
			comp = comp2;
			compOther = comp1;
		}
		//assign all the things in the small one to the new number and the other one the old number
		for(var vert in comp){
			this.connMap[vert] = this.clusterNums;
		}
		for(var vert in compOther){
			this.connMap[vert] = oldCluNum;
		}
	};
};