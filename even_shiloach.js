var EvenShiloach = function(graph) {
	this.graph = graph;
	this.animationQueue = new Array();

	//O(n)
	this.preprocess = function() {
		this.clusterNums = 1;
		this.connectivityMap = {};
		var vertices = this.graph.getVertices();
		for (var i in vertices) {
			var start = vertices[i].id
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
		this.animationQueue = []
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

	//O(log(n))
	this.deleteEdge = function(vert1, vert2) {
		this.animationQueue = []
        this.animationQueue.push({func: this.graph.unhighlightAll, that: this.graph, args: []});
        this.animationQueue.push({func: this.graph.highlightEdge, that: this.graph, args: [vert1, vert2, '#e60000']});
        this.animationQueue.push({func: this.graph.removeEdge, that: this.graph, args: [vert1, vert2]}); 

		var oldCluNum = this.connectivityMap[vert1];
		//save the list of the two components
		var comp1 = [vert1];
		var comp2 = [vert2];
		//stacks for DFS. execute parallel DFS over the two components. stop when first is done
		var stack1 = [vert1];
		var stack2 = [vert2];
		while(stack1.length > 0 && stack2.length > 0){
			var curr1 = stack1.pop();
			var curr2 = stack2.pop();
			this.animationQueue.push({func: this.graph.highlightNode, that: this.graph, args: [curr1, '#e60000', '#990000']}); // red
			this.animationQueue.push({func: this.graph.highlightNode, that: this.graph, args: [curr2, '#e60000', '#990000']}); // red
					
			//add these nodes to the component lists, mark them as searched
			comp1.push(curr1);
			comp2.push(curr2);
			this.connectivityMap[curr1] = -1;
			this.connectivityMap[curr2] = -1;
			//add unsearched neighbors
			var neighbors1 = this.graph.getNeighbors(curr1)
			for(var n in neighbors1){
				if(this.connectivityMap[neighbors1[n]] == -1 || neighbors1[n] == vert2) continue;
				this.animationQueue.push({func: this.graph.highlightNode, that: this.graph, args: [neighbors1[n], '#ffff00', '#ffd700']}); // yellow
					
				stack1.push(neighbors1[n]);
			}
			var neighbors2 = this.graph.getNeighbors(curr2)
			for(var n in neighbors2){
				if(this.connectivityMap[neighbors2[n]] == -1 || neighbors2[n] == vert1) continue;
				this.animationQueue.push({func: this.graph.highlightNode, that: this.graph, args: [neighbors2[n], '#ffff00', '#ffd700']}); // yellow
					
				stack2.push(neighbors2[n]);
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
			this.connectivityMap[comp[vert]] = this.clusterNums;
			this.animationQueue.push({func: this.graph.updateNodeGroup, that: this.graph, args: [comp[vert], this.clusterNums]}); 
		
		}
		for(var vert in compOther){
			this.connectivityMap[compOther[vert]] = oldCluNum;
			this.animationQueue.push({func: this.graph.updateNodeGroup, that: this.graph, args: [compOther[vert], oldCluNum]}); 
		}

		this.animationQueue.push({func: this.graph.unhighlightAll, that: this.graph, args: []});
	};
};