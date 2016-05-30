class Graph:
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
        self.vertGroups = {}

    def getVertices(self):
        return self.vertices

    def getEdges(self):
        return self.edges

    def getNeighbors(self, vertex):
        return self.adjacencyMap[vertex]

    def addGroup(self, name, vertices):
        self.vertGroups[name] = vertices

    def getGroup(self, vertex):
        if vertex in self.vertGroups:
            return self.vertGroups[vertex]
        return [vertex]

    def addVertex(self, vertex):
        self.vertices.append(vertex)
        self.adjacencyMap[vertex] = []

    def removeVertex(self, vertex):
        self.vertices.remove(vertex)
        nbors = self.adjacencyMap[vertex]
        for nbor in nbors:
            self.adjacencyMap[nbor].remove(vertex)
        del self.adjacencyMap[vertex]
        self.edges = [edge for edge in self.edges if vertex not in edge]

    def addEdge(self, edge):
        v1, v2 = edge
        self.adjacencyMap[v1].append(v2)
        self.adjacencyMap[v2].append(v1)
        self.edges.append(edge)

    def removeEdge(self, edge):
        v1, v2 = edge
        self.adjacencyMap[v1].remove(v2)
        self.adjacencyMap[v2].remove(v1)
        self.edges = [e for e in self.edges if not (v1 in e and v2 in e)]


class Model:
    def query(self, vert1, vert2):
        pass

    def delete_edge(self, vert1, vert2):
        pass
