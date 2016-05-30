import time
import matplotlib.pyplot as plt
from random import shuffle, choice
from graph import Graph
from unstructured import Unstructured
from dfs_labeling import DFSLabeling
from even_shiloach import EvenShiloach
from alstrup_secher_spork import AlstrupSecherSpork


def test_model(graph, model_type, m):
    p_time, q_time, d_time = 0.0, 0.0, 0.0

    s_time = time.time()
    model = model_type(graph)
    p_time += time.time() - s_time

    verts = graph.getVertices()
    n = len(verts) - 1
    seq = [True] * m + [False] * n
    shuffle(seq)

    edges = [e for e in graph.getEdges()]
    shuffle(edges)

    for op in seq:
        if op:
            v1, v2 = choice(verts), choice(verts)
            s_time = time.time()
            model.query(v1, v2)
            q_time += time.time() - s_time
        else:
            v1, v2 = edges.pop()
            s_time = time.time()
            model.delete_edge(v1, v2)
            d_time += time.time() - s_time

    return p_time, q_time, d_time


def random_graph_copies(n, copies=4):
    verts = [str(i) for i in range(n)]
    edges = []
    st = choice(verts)
    clus = [st]
    others = [v for v in verts if v != st]
    shuffle(others)
    for i in range(n-1):
        v1 = choice(clus)
        v2 = others.pop()
        clus.append(v2)
        edges.append((v1, v2))
    graphs = []
    for i in range(copies):
        v_copy = [v for v in verts]
        e_copy = [e for e in edges]
        graphs.append(Graph(v_copy, e_copy))
    return graphs


def test_models(ms, ns):
    p_times, q_times, d_times = [[], [], [], []], [[], [], [], []], [[], [], [], []]

    type_list = [Unstructured, DFSLabeling, EvenShiloach, AlstrupSecherSpork]
    for m, n in zip(ms, ns):
        graphs = random_graph_copies(n)
        for i, (graph, model_type) in enumerate(zip(graphs, type_list)):
            p, q, d = test_model(graph, model_type, m)
            p_times[i].append(p)
            q_times[i].append(q)
            d_times[i].append(d)

    return p_times, q_times, d_times


def graph():
    ms = [10*(i+1) for i in range(2)]
    ns = [i for i in ms]
    p_times, q_times, d_times = test_models(ms, ns)
    for i in range(19):
        p_times2, q_times2, d_times2 = test_models(ms, ns)
        p_times = [[a + b for a, b in zip(l1, l2)] for l1, l2 in zip(p_times, p_times2)]
        q_times = [[a + b for a, b in zip(l1, l2)] for l1, l2 in zip(q_times, q_times2)]
        d_times = [[a + b for a, b in zip(l1, l2)] for l1, l2 in zip(d_times, d_times2)]

    for i in range(4):
        plt.plot(ns, [t*500000 for t in p_times[i]])
    plt.title('Preprocessing Time vs. Graph Size, m = n')
    plt.xlabel('Graph Size')
    plt.ylabel('Preprocessing Time (microsecs)')
    plt.legend(['Uns.', 'DFS', 'E-S', 'A-S-S'], 'upper left')
    plt.savefig("ptimes_meqn.png")
    plt.show()

    plt.clf()
    for i in range(4):
        plt.plot(ns, [t*500000 for t in q_times[i]])
    plt.title('Total Query Time vs. Graph Size, m = n')
    plt.xlabel('Graph Size')
    plt.ylabel('Total Query Time (microsecs)')
    plt.legend(['Uns.', 'DFS', 'E-S', 'A-S-S'], 'upper left')
    plt.savefig("qtimes_meqn.png")
    plt.show()

    plt.clf()
    for i in range(4):
        plt.plot(ns, [t*500000 for t in d_times[i]])
    plt.title('Total Delete Time vs. Graph Size, m = n')
    plt.xlabel('Graph Size')
    plt.ylabel('Total Delete Time (microsecs)')
    plt.legend(['Uns.', 'DFS', 'E-S', 'A-S-S'], 'upper left')
    plt.savefig("dtimes_meqn.png")
    plt.show()


def test_graphs():
    n, m = 20, 20
    graphs = random_graph_copies(n, copies=6)
    type_list = [AlstrupSecherSpork]  # [DFSLabeling, EvenShiloach, AlstrupSecherSpork]
    for i, model_type in enumerate(type_list):
        g_model = Unstructured(graphs[i])
        t_model = model_type(graphs[i+3])

        verts = g_model.graph.getVertices()
        seq = [True] * m + [False] * (n - 1)
        shuffle(seq)
        edges = [e for e in g_model.graph.getEdges()]
        shuffle(edges)

        for op in seq:
            if op:
                print 'QUERY'
                v1, v2 = choice(verts), choice(verts)
                print g_model.graph.getVertices(), g_model.graph.getEdges()
                print v1, v2
                g_res = g_model.query(v1, v2)
                t_res = t_model.query(v1, v2)
                print model_type, g_res, t_res
                assert g_res == t_res
                print '-' * 100
            else:
                print 'DELETE'
                v1, v2 = edges.pop()
                print g_model.graph.getVertices(), g_model.graph.getEdges()
                print v1, v2
                g_model.delete_edge(v1, v2)
                t_model.delete_edge(v1, v2)
                print g_model.graph.getVertices(), g_model.graph.getEdges()
                print '-' * 100


test_graphs()

# graph()
