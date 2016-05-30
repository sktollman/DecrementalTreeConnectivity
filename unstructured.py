from sets import Set

class Unstructured():
	def __init__(self, graph):
		self.graph = graph

	def query(self, vert1, vert2):
		stack = [vert1]
		searched = Set()
		while len(stack) > 0:
			curr = stack.pop()
			searched.add(curr)
			if curr == vert2:
				return True;

			nbors = self.graph.getNeighbors(curr)
			for nbor in nbors:
				if nbor in searched:
					continue
				stack.append(nbor)

		return False

	def deleteEdge(self, vert1, vert2):
		self.graph.removeEdge((vert1, vert2))
