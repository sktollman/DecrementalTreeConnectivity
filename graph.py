class Graph():
	def __init__(self, vertices, edges):
		self.vertices = vertices
		self.edges = edges
		self.adjacencyMap = {}
		for vert in vertices:
			self.adjacencyMap[vert] = []
		for edge in edges:
			v1, v2 = edge
			self.adjacencyMap[v1].append(v2)
			self.adjacencyMap[v2].append(v1)

	def getVertices(self):
		return self.vertices

	def getNeighbors(self, vertex):
		return self.adjacencyMap[vertex]

	def addVertex(self, vertex):
		self.vertices.append(vertex)
		self.adjacencyMap[vertex] = []

	def removeVertex(self, vertex):
		self.vertices.remove(vertex)
		nbors = self.adjacencyMap[vertex]
		for nbor in nbors:
			self.adjacencyMap[nbor].remove(vertex)
		del self.adjacencyMap[vertex]

	def addEdge(self, edge):
		v1, v2 = edge
		self.adjacencyMap[v1].append(v2)
		self.adjacencyMap[v2].append(v1)
		
	def removeEdge(self, edge):
		v1, v2 = edge
		self.adjacencyMap[v1].remove(v2)
		self.adjacencyMap[v2].remove(v1)
