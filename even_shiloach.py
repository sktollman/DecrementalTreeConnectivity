from sets import Set

class EvenShiloach():
	def __init__(self, graph):
		self.graph = graph
		self.numClusters = 1
		self.labelMap = {}
		for vert in graph.getVertices():
			self.labelMap[vert] = self.numClusters

	def query(self, vert1, vert2):
		return self.labelMap[vert1] == self.labelMap[vert2]

	def deleteEdge(self, vert1, vert2):
		self.numClusters++
		stack1 = [vert1]
		stack2 = [vert2]
		searched1 = Set()
		searched2 = Set()
		while len(stack1) > 0 and len(stack2) > 0:
			curr1 = stack1.pop()
			curr2 = stack2.pop()
			searched1.add(curr1)
			searched2.add(curr2)
			nbors1 = self.graph.getNeighbors(curr1)
			for nbor in nbors1:
				if nbor in searched1:
					continue
				stack1.append(nbor)
			nbors2 = self.graph.getNeighbors(curr2)
			for nbor in nbors2:
				if nbor in searched2:
					continue
				stack2.append(nbor)
		searched = searched1 if len(stack1) == 0 else searched2
		for vert in searched:
			self.labelMap[vert] = self.numClusters