class Graph:
    def __init__(self):
        self.adjacency_list = {}

    def add_node(self, location):
        if location not in self.adjacency_list:
            self.adjacency_list[location] = []

    def add_edge(self, location1, location2, distance):
        self.add_node(location1)
        self.add_node(location2)
        self.adjacency_list[location1].append((location2, distance))
        self.adjacency_list[location2].append((location1, distance))

    def get_neighbors(self, location):
        return self.adjacency_list.get(location, [])

    def get_all_nodes(self):
        return list(self.adjacency_list.keys())

    def to_edge_list(self):
        edges = []
        seen = set()
        for source, neighbors in self.adjacency_list.items():
            for target, distance in neighbors:
                key = tuple(sorted((source, target)))
                if key not in seen:
                    seen.add(key)
                    edges.append((source, target, distance))
        return edges
