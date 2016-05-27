var SuperNaive = function(graph) {
	this.graph = graph;
	
	//O(1)
	this.preprocess = function() {};
	this.preprocess();

	//O(n)
	this.query = function(vert1, vert2) {
		//DFS over vert1's component looking for vert2
		var stack = [vert1];
		var searched = [];
		while(stack.length > 0){
			var curr = stack.pop();
			searched.push[curr];
			if(curr === vert2) return true;
			for(var neighbor in this.graph.getNeighbors(curr)){
				if(neighbor in searched) continue;
				stack.push(neighbor);
			}
		}
		return false;
	};

	//O(1)
	this.deleteEdge = function(vert1, vert2) {};
};