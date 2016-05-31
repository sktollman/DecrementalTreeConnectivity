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
    ratio = 100
    ns = [100*(i+1) for i in range(10)]
    ms = [i * ratio for i in ns]
    p_times, q_times, d_times = test_models(ms, ns)
    for i in range(19):
        p_times2, q_times2, d_times2 = test_models(ms, ns)
        p_times = [[a + b for a, b in zip(l1, l2)] for l1, l2 in zip(p_times, p_times2)]
        q_times = [[a + b for a, b in zip(l1, l2)] for l1, l2 in zip(q_times, q_times2)]
        d_times = [[a + b for a, b in zip(l1, l2)] for l1, l2 in zip(d_times, d_times2)]

    # for i in range(4):
    #     plt.plot(ns, [t*500 for t in p_times[i]])
    # plt.title('Preprocessing Time vs. Graph Size')
    # plt.xlabel('Graph Size')
    # plt.ylabel('Preprocessing Time (ms)')
    # plt.legend(['Unstructured', 'DFS Labeling', 'Even Shiloach', 'Alstrup Secher Spork'], 'upper left')
    # plt.savefig("ptimes_meq" + str(ratio) + "n.png")
    # plt.show()

    # plt.clf()
    # for i in range(4):
    #     plt.plot(ns, [t*500 for t in q_times[i]])
    # plt.title('Total Query Time vs. Graph Size')
    # plt.xlabel('Graph Size')
    # plt.ylabel('Total Query Time (ms)')
    # plt.legend(['Unstructured', 'DFS Labeling', 'Even Shiloach', 'Alstrup Secher Spork'], 'upper left')
    # plt.savefig("qtimes_meq" + str(ratio) + "n.png")
    # plt.show()

    # plt.clf()
    # for i in range(4):
    #     plt.plot(ns, [t*500 for t in d_times[i]])
    # plt.title('Total Delete Time vs. Graph Size')
    # plt.xlabel('Graph Size')
    # plt.ylabel('Total Delete Time (ms)')
    # plt.legend(['Unstructured', 'DFS Labeling', 'Even Shiloach', 'Alstrup Secher Spork'], 'upper left')
    # plt.savefig("dtimes_meq" + str(ratio) + "n.png")
    # plt.show()

    # plt.clf()
    for i in range(4):
        t_times = [p+q+d for p, (q, d) in zip(p_times[i], zip(q_times[i], d_times[i]))]
        plt.plot(ns, [t*500 for t in t_times])
    plt.title('Total Operation Time vs. Graph Size, m = 100n')
    plt.xlabel('Graph Size')
    plt.ylabel('Total Operation Time (ms)')
    plt.legend(['Unstructured', 'DFS Labeling', 'Even Shiloach', 'Alstrup Secher Spork'], 'upper left')
    plt.savefig("times_meq" + str(ratio) + "n.png")
    plt.show()


def test_graphs():
    n_trials = 100
    n, m = 100, 100

    type_list = [DFSLabeling, EvenShiloach, AlstrupSecherSpork]
    for i, model_type in enumerate(type_list):
        for j in range(n_trials):
            graphs = random_graph_copies(n, copies=2)
            g_model = Unstructured(graphs[0])
            t_model = model_type(graphs[1])

            verts = g_model.graph.getVertices()
            seq = [True] * m + [False] * (n - 1)
            shuffle(seq)
            edges = [e for e in g_model.graph.getEdges()]
            shuffle(edges)

            for op in seq:
                if op:
                    v1, v2 = choice(verts), choice(verts)
                    g_res = g_model.query(v1, v2)
                    t_res = t_model.query(v1, v2)
                    assert g_res == t_res
                else:
                    v1, v2 = edges.pop()
                    g_model.delete_edge(v1, v2)
                    t_model.delete_edge(v1, v2)


graph()
