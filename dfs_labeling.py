from graph import Model


class DFSLabeling(Model):
    def __init__(self, graph):
        self.graph = graph
        self.numClusters = 1
        self.labelMap = {}
        for vert in graph.getVertices():
            self.labelMap[vert] = self.numClusters

    def query(self, vert1, vert2):
        return self.labelMap[vert1] == self.labelMap[vert2]

    def delete_edge(self, vert1, vert2):
        self.graph.removeEdge((vert1, vert2))
        self.numClusters += 1
        stack = [vert1]
        searched = set()
        while len(stack) > 0:
            curr = stack.pop()
            searched.add(curr)
            self.labelMap[curr] = self.numClusters
            nbors = self.graph.getNeighbors(curr)
            for nbor in nbors:
                if nbor in searched:
                    continue
                stack.append(nbor)
