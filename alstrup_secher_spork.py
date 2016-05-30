from sets import Set

class AlstrupSecherSpork():
	def addCluster(self, cluster):
		nodes = cluster.nodes;
		for node in nodes:
			self.clusterMap[node] = cluster
		self.clusters.append(cluster)

	def makeCluster(self, node):
		self.clusterMap[node] = None
		clus = [node]
		nbors = this.graph.getNeighbors(node)
		deg, sz = len(nbors), 1
		for nbor in nbors:
			if nbor in self.clusterMap:
				continue
			n_clus, n_deg, n_sz = self.makeCluster(nbor)
			if deg + n_deg - 2 <= 2 and sz + n_sz <= self.logSize:
				clus += n_clus
				deg += n_deg - 2
				sz += n_sz
			else:
				self.addCluster(nborCluster)
		return {'verts':clus, 'degree':deg, 'size':sz}

	def __init__(self, graph):
		self.graph = graph
		self.logSize = Math.log(len(graph.getVertices()))
		self.clusterMap = {}

		verts = self.graph.getVertices();
		for vert in verts:
			nbors = self.graph.getNeighbors(vert)
			deg = len(nbors)
		  if deg <= 3:
		  	continue
	    self.graph.removeVertex(vert)
	    prevV = None
	    for i, nbor in enumerate(nbors):
	    	self.graph.addVertex(vert + '' + i)
		    if prevV is not None:
		    	self.graph.addEdge((currV, prevV))
		    self.graph.addEdge((currV, nbor))
		    prevV = currV

		rt = None
		for vert in verts:
			if len(self.graph.getNeighbors(vert)) == 1:
				rt = vert
				break
		self.addCluster(self.makeCluster(rt))

		for clus in self.clusters:
			clus['bounds'] = []
			for vert in clus['verts']:
				for nbor in self.graph.getNeighbors(vert):
					if self.clusterMap[nbor] != clus:
						clus['bounds'].append(node)
						break

		macroVerts = []
		macroEdges = []
		
		for clus in self.clusters:
			for bound in clus['bounds']:
				macroVerts.append(bound)
				nbors = self.graph.getNeighbors(bound)
				for nbor in nbors:
					if self.clusterMap[nbor] != clus or nbor in clus['bound']:
						macroEdges.push((bound, nbor))

		self.macroGraph = Graph(macroVerts, macroEdges)
		self.macroESRepr = EvenShiloach(self.macroGraph)

		for clus in self.clusters:
			clus['pathWords'] = {}
			clus['pathWords'][clus['bound'][0]] = 0
			clus['microEdges'] = {}
			stack = [clus['bound'][0]]
			searched = Set()

			while len(stack) > 0:
				curr = stack.pop()
				searched.add(curr)
				nbors = self.graph.getNeighbors(curr)
				for nbor in neighbors:
					if nbor in searched or self.clusterMap[nbor] != clus:
						continue;
					stack.append(nbor)
					newEdgeInd = len(clus['microEdges'])
					clus['microEdges'][(curr, nbor)] = newEdgeInd
					clus['pathWords'][nbor] = clus['pathWords'][curr] | (1 << newEdgeInd)

			clus['edgeWord'] = (1 << len(clus['microEdges'])) - 1

	def microquery(self, vert1, vert2):
		clus = self.clusterMap[vert1];
		return (((clus['pathWords'][vert1] ^ clus['pathWords'][vert2]) & ~clus['edgeWord']) == 0)

	def macroquery(self, vert1, vert2):
		return self.macroESRepr.query(vert1, vert2)

	def query(self, vert1, vert2):
		clus1 = self.clusterMap[vert1]
		clus2 = self.clusterMap[vert2]
		if clus1 == clus2:
			return self.microquery(vert1, vert2)
		boundaries1 = []
		for vert in clus1['bound']:
			if self.microquery(vert1, vert):
				boundaries1.append(vert)
		boundaries2 = []
		for vert in clus2['bound']:
			if self.microquery(vert2, vert):
				boundaries2.append(vert)
		for vert1 in boundaries1:
			for vert2 in boundaries2:
				if self.macroquery(vert1, vert2):
					return True
		return False

	def deleteEdge(self, vert1, vert2):
		macronodes = self.macrotree.getVertices()
		if vert1 in macronodes and vert2 in macronodes:
			self.macrotree.deleteEdge((vert1, vert2))
		clus = self.clusterMap[vert1]
		if clus == self.clusterMap[vert2]:
			edgeMap = clus['microEdges']
			edgeInd = edgeMap[(vert1, vert2)] if (vert1, vert2) in edgeMap else edgeMap[(vert2, vert1)]
			cluster['edgeWord'] &= ~(1 << edgeInd)