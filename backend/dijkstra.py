import heapq

from .graph import Graph


def dijkstra(graph: Graph, start: str, end: str):
    nodes = graph.get_all_nodes()
    distances = {node: float('inf') for node in nodes}
    previous = {node: None for node in nodes}
    distances[start] = 0
    heap = [(0, start)]

    while heap:
        current_distance, current_node = heapq.heappop(heap)
        if current_distance > distances[current_node]:
            continue
        if current_node == end:
            break
        for neighbor, weight in graph.get_neighbors(current_node):
            new_distance = current_distance + weight
            if new_distance < distances[neighbor]:
                distances[neighbor] = new_distance
                previous[neighbor] = current_node
                heapq.heappush(heap, (new_distance, neighbor))

    path = []
    cursor = end
    while cursor is not None:
        path.append(cursor)
        cursor = previous.get(cursor)
    path.reverse()

    if path and path[0] == start:
        return path, distances[end]
    return [], float('inf')
