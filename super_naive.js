var SuperNaive = function(graph) {
	this.graph = graph;
	this.animationQueue = new Array();
	
	//O(1)
	this.preprocess = function() {};

	//O(n)
	this.query = function(vert1, vert2) {
		//DFS over vert1's component looking for vert2
		this.animationQueue = [] // clear queue
		var stack = [vert1];
		var searched = [];
		this.animationQueue.push({func: this.graph.unhighlightAll, that: this.graph, args: []});
		while (stack.length > 0) {
			var curr = stack.pop();
			this.animationQueue.push({func: this.graph.highlightNode, that: this.graph, args: [curr, '#e60000', '#990000']}); // red
			searched.push(curr);
			if (curr === vert2) {
				this.animationQueue.push({func: this.graph.highlightNode, that: this.graph, args: [curr, '#00FF00', '#32CD32']}); // green
				return true;
			}

			var neighbors = this.graph.getNeighbors(curr);
			for (var n in neighbors){
				if (neighbors[n] in searched) continue;
				this.animationQueue.push({func: this.graph.highlightNode, that: this.graph, args: [neighbors[n], '#ffff00', '#ffd700']}); // yellow
				stack.push(neighbors[n]);
			}
			this.animationQueue.push({func: this.graph.highlightNode, that: this.graph, args: [curr, '#878787', '#696969']}); // grey
		}
		return false;
	};

	//O(1)
	this.deleteEdge = function(vert1, vert2) { 
		this.animationQueue = []
        this.animationQueue.push({func: this.graph.unhighlightAll, that: this.graph, args: []});
        this.animationQueue.push({func: this.graph.highlightEdge, that: this.graph, args: [vert1, vert2, '#e60000']});
        this.animationQueue.push({func: this.graph.removeEdge, that: this.graph, args: [vert1, vert2]}); 
    };
};




