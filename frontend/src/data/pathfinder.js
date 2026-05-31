export function buildGraph(edges) {
  const graph = new Map();
  edges.forEach(([from, to, weight]) => {
    if (!graph.has(from)) graph.set(from, []);
    if (!graph.has(to)) graph.set(to, []);
    graph.get(from).push({ node: to, weight });
    graph.get(to).push({ node: from, weight });
  });
  return graph;
}

export function dijkstra(graph, start, end) {
  const distances = new Map();
  const previous = new Map();
  const nodes = Array.from(graph.keys());

  nodes.forEach((node) => {
    distances.set(node, Infinity);
    previous.set(node, null);
  });

  distances.set(start, 0);
  const visited = new Set();

  while (visited.size < nodes.length) {
    const current = nodes.reduce((best, node) => {
      if (visited.has(node)) return best;
      if (best === null) return node;
      return distances.get(node) < distances.get(best) ? node : best;
    }, null);

    if (current === null || distances.get(current) === Infinity) break;
    if (current === end) break;

    visited.add(current);
    const neighbors = graph.get(current) || [];

    for (const { node: neighbor, weight } of neighbors) {
      if (visited.has(neighbor)) continue;
      const candidate = distances.get(current) + weight;
      if (candidate < distances.get(neighbor)) {
        distances.set(neighbor, candidate);
        previous.set(neighbor, current);
      }
    }
  }

  const path = [];
  let cursor = end;
  while (cursor) {
    path.unshift(cursor);
    cursor = previous.get(cursor);
  }

  if (path[0] !== start) {
    return { path: [], distance: Infinity };
  }

  return { path, distance: distances.get(end) };
}

export function findNearestHospital(graph, patientLocation, hospitals) {
  const candidates = hospitals
    .map((hospital) => ({ hospital, ...dijkstra(graph, patientLocation, hospital) }))
    .filter((result) => result.path.length > 0);

  return candidates.sort((a, b) => a.distance - b.distance)[0] || null;
}
