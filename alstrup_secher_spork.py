from math import log
from graph import Graph, Model
from even_shiloach import EvenShiloach


class AlstrupSecherSpork(Model):
    def __init__(self, graph):
        self.graph = graph
        self.logSize = log(len(graph.getVertices()))
        self.clusters = []
        self.clusterMap = {}

        rt = None
        verts = self.graph.getVertices()
        for vert in verts:
            if len(self.graph.getNeighbors(vert)) == 1 and rt is None:
                rt = vert

            nbors = self.graph.getNeighbors(vert)
            deg = len(nbors)
            if deg <= 3:
                continue
            self.graph.removeVertex(vert)
            prev = None
            v_list = []
            for i, nbor in enumerate(nbors):
                curr = vert + '_' + str(i)
                v_list.append(curr)
                self.graph.addVertex(curr)
                if prev is not None:
                    self.graph.addEdge((curr, prev))
                self.graph.addEdge((curr, nbor))
                prev = curr
            self.graph.addGroup(vert, v_list)

        self.add_cluster(self.make_cluster(rt))

        for clus in self.clusters:
            clus['bounds'] = []
            for vert in clus['verts']:
                for nbor in self.graph.getNeighbors(vert):
                    if self.clusterMap[nbor] != clus:
                        clus['bounds'].append(vert)
                        break

        macro_verts = []
        macro_edges = []

        for clus in self.clusters:
            for bound in clus['bounds']:
                macro_verts.append(bound)
                nbors = self.graph.getNeighbors(bound)
                for nbor in nbors:
                    if self.clusterMap[nbor] != clus or nbor in clus['bounds']:
                        if nbor > bound:
                            macro_edges.append((bound, nbor))

        self.macroGraph = Graph(macro_verts, macro_edges)
        self.macroESRepr = EvenShiloach(self.macroGraph)

        for clus in self.clusters:
            clus['pathWords'] = {}
            clus['pathWords'][clus['bounds'][0]] = 0
            clus['microEdges'] = {}
            stack = [clus['bounds'][0]]
            searched = set()

            while len(stack) > 0:
                curr = stack.pop()
                searched.add(curr)
                nbors = self.graph.getNeighbors(curr)
                for nbor in nbors:
                    if nbor in searched or self.clusterMap[nbor] != clus:
                        continue
                    stack.append(nbor)
                    new_edge_ind = len(clus['microEdges'])
                    clus['microEdges'][(curr, nbor)] = new_edge_ind
                    clus['pathWords'][nbor] = clus['pathWords'][curr] | (1 << new_edge_ind)

            clus['edgeWord'] = (1 << len(clus['microEdges'])) - 1

    def make_cluster(self, node):
        self.clusterMap[node] = None
        clus = [node]
        nbors = self.graph.getNeighbors(node)
        deg, sz = len(nbors), 1
        for nbor in nbors:
            if nbor in self.clusterMap:
                continue
            nbor_clus = self.make_cluster(nbor)
            n_clus, n_deg, n_sz = nbor_clus['verts'], nbor_clus['degree'], nbor_clus['size']
            if deg + n_deg - 2 <= 2 and sz + n_sz <= self.logSize:
                clus += n_clus
                deg += n_deg - 2
                sz += n_sz
            else:
                self.add_cluster(nbor_clus)
        return {'verts': clus, 'degree': deg, 'size': sz}

    def add_cluster(self, cluster):
        nodes = cluster['verts']
        for node in nodes:
            self.clusterMap[node] = cluster
        self.clusters.append(cluster)

    def query(self, vert1, vert2):
        vert1 = self.graph.getGroup(vert1)[0]
        vert2 = self.graph.getGroup(vert2)[0]
        clus1 = self.clusterMap[vert1]
        clus2 = self.clusterMap[vert2]
        if clus1 == clus2:
            return self.microquery(vert1, vert2)
        boundaries1 = []
        for vert in clus1['bounds']:
            if self.microquery(vert1, vert):
                boundaries1.append(vert)
        boundaries2 = []
        for vert in clus2['bounds']:
            if self.microquery(vert2, vert):
                boundaries2.append(vert)
        for vert1 in boundaries1:
            for vert2 in boundaries2:
                if self.macroquery(vert1, vert2):
                    return True
        return False

    def microquery(self, vert1, vert2):
        clus = self.clusterMap[vert1]
        return ((clus['pathWords'][vert1] ^ clus['pathWords'][vert2]) & ~clus['edgeWord']) == 0

    def macroquery(self, vert1, vert2):
        return self.macroESRepr.query(vert1, vert2)

    def delete_edge(self, vert1, vert2):
        vert1s = self.graph.getGroup(vert1)
        for p_vert1 in vert1s:
            for p_vert2 in self.graph.getNeighbors(p_vert1):
                if :
                    vert1, vert2 = p_vert1, p_vert2
                    break
            else:
                continue
            break
        self.graph.removeEdge((vert1, vert2))
        macronodes = self.macroGraph.getVertices()
        if vert1 in macronodes and vert2 in macronodes:
            self.macroESRepr.delete_edge(vert1, vert2)
        clus = self.clusterMap[vert1]
        if clus == self.clusterMap[vert2]:
            edge_map = clus['microEdges']
            edge_ind = edge_map[(vert1, vert2)] if (vert1, vert2) in edge_map else edge_map[(vert2, vert1)]
            clus['edgeWord'] &= ~(1 << edge_ind)
