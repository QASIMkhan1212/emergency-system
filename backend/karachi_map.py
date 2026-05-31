import os

import networkx as nx
import osmnx as ox

from .graph import Graph

LOCATION_COORDS = {
    'Aga Khan Hospital': (24.8918, 67.0739),
    'City Hospital': (24.8678, 67.0276),
    'Liaquat Hospital': (24.8444, 67.0535),
    'Saddar': (24.8604, 67.0261),
    'Clifton': (24.8091, 67.0337),
    'Gulshan': (24.9181, 67.1140),
    'PECHS': (24.8622, 67.0667),
    'Defence': (24.8346, 67.0563),
    'Korangi': (24.8642, 67.1129),
    'Landhi': (24.8638, 67.1545),
    'Malir': (24.9498, 67.3291),
    'Lyari': (24.8573, 67.0074),
    'North Nazimabad': (24.9338, 67.0353),
    'Orangi Town': (24.9318, 66.9566),
    'Jinnah International Airport': (24.9065, 67.1608),
    'Karachi University': (24.9430, 67.1200),
    'National Stadium': (24.8944, 67.0785),
    'Gulistan-e-Jauhar': (24.9107, 67.1261),
    'North Karachi': (24.9800, 67.0600),
    'Surjani Town': (25.0200, 67.0600),
    'Baldia Town': (24.9100, 66.9700),
    'SITE Area': (24.9000, 67.0100),
    'FB Area': (24.9300, 67.0700),
    'Nazimabad': (24.9000, 67.0300),
    'Sea View': (24.8000, 67.0500),
    'Do Darya': (24.7900, 67.0800),
    'Korangi Crossing': (24.8300, 67.1200),
    'Millennium Mall': (24.9000, 67.1100),
    'Lucky One Mall': (24.9400, 67.0800),
    'Empress Market': (24.8600, 67.0300),
    'Mazar-e-Quaid': (24.8700, 67.0400),
    'Garden': (24.8700, 67.0200),
    'Bahadurabad': (24.8800, 67.0700),
    'Tariq Road': (24.8700, 67.0600),
    'Civic Centre': (24.9000, 67.0700),
    'Water Pump': (24.9400, 67.0700),
    'Malir Cantt': (24.9500, 67.2000),
    'Model Colony': (24.9100, 67.1800),
    'Shah Faisal Colony': (24.8800, 67.1500),
}

GRAPH_EDGES = [
    ('Aga Khan Hospital', 'PECHS'), ('Aga Khan Hospital', 'Gulshan'), ('Aga Khan Hospital', 'National Stadium'),
    ('City Hospital', 'Saddar'), ('City Hospital', 'Clifton'), ('City Hospital', 'Lyari'), ('City Hospital', 'Empress Market'),
    ('Liaquat Hospital', 'Korangi'), ('Liaquat Hospital', 'Landhi'), ('Liaquat Hospital', 'Malir'),
    ('Saddar', 'PECHS'), ('Saddar', 'Clifton'), ('Saddar', 'Lyari'), ('Saddar', 'Empress Market'), ('Saddar', 'Garden'),
    ('Clifton', 'Defence'), ('Clifton', 'Sea View'),
    ('Gulshan', 'Korangi'), ('Gulshan', 'PECHS'), ('Gulshan', 'FB Area'), ('Gulshan', 'Civic Centre'), ('Gulshan', 'Gulistan-e-Jauhar'),
    ('Defence', 'Korangi'), ('Defence', 'Sea View'), ('Defence', 'Do Darya'),
    ('Korangi', 'Landhi'), ('Korangi', 'Korangi Crossing'),
    ('Landhi', 'Malir'), ('Landhi', 'Shah Faisal Colony'),
    ('Malir', 'Malir Cantt'), ('Malir', 'Model Colony'),
    ('Lyari', 'Orangi Town'), ('Lyari', 'Baldia Town'),
    ('North Nazimabad', 'Gulshan'), ('North Nazimabad', 'PECHS'), ('North Nazimabad', 'Orangi Town'), ('North Nazimabad', 'Nazimabad'), ('North Nazimabad', 'Water Pump'),
    ('Orangi Town', 'Baldia Town'), ('Orangi Town', 'SITE Area'),
    ('Jinnah International Airport', 'Malir'), ('Jinnah International Airport', 'Model Colony'), ('Jinnah International Airport', 'Gulistan-e-Jauhar'),
    ('Karachi University', 'Gulshan'), ('Karachi University', 'Gulistan-e-Jauhar'), ('Karachi University', 'Malir Cantt'),
    ('National Stadium', 'Civic Centre'), ('National Stadium', 'Bahadurabad'),
    ('Gulistan-e-Jauhar', 'Millennium Mall'), ('Gulistan-e-Jauhar', 'Model Colony'),
    ('North Karachi', 'Surjani Town'), ('North Karachi', 'Water Pump'), ('North Karachi', 'Lucky One Mall'),
    ('Surjani Town', 'North Karachi'),
    ('Baldia Town', 'SITE Area'),
    ('SITE Area', 'Nazimabad'), ('SITE Area', 'Orangi Town'),
    ('FB Area', 'Water Pump'), ('FB Area', 'Lucky One Mall'), ('FB Area', 'Nazimabad'),
    ('Nazimabad', 'Garden'), ('Nazimabad', 'Empress Market'),
    ('Sea View', 'Do Darya'),
    ('Korangi Crossing', 'Defence'),
    ('Millennium Mall', 'Civic Centre'), ('Millennium Mall', 'Gulistan-e-Jauhar'),
    ('Lucky One Mall', 'Water Pump'), ('Lucky One Mall', 'FB Area'),
    ('Empress Market', 'Mazar-e-Quaid'),
    ('Mazar-e-Quaid', 'Garden'), ('Mazar-e-Quaid', 'Bahadurabad'), ('Mazar-e-Quaid', 'Tariq Road'),
    ('Garden', 'Lyari'),
    ('Bahadurabad', 'Tariq Road'), ('Bahadurabad', 'PECHS'),
    ('Tariq Road', 'PECHS'),
    ('Civic Centre', 'Bahadurabad'),
    ('Water Pump', 'North Karachi'),
]

HOSPITALS = ['Aga Khan Hospital', 'City Hospital', 'Liaquat Hospital']


class KarachiMap:
    def __init__(self):
        self.osm_graph = None
        self.graph = Graph()
        self.named_node_map = {}

    def load_osm(self, skip_osm=True):
        if not skip_osm:
            try:
                ox.config(use_cache=True, log_console=False)
                self.osm_graph = ox.graph_from_place('Karachi, Pakistan', network_type='drive')
                self.osm_graph = ox.add_edge_lengths(self.osm_graph)
                self._map_named_locations()
            except Exception as e:
                print(f"Failed to load OSM graph: {e}. Falling back to straight-line distances.")
                self.osm_graph = None
        
        self._build_named_graph()

    def _map_named_locations(self):
        if self.osm_graph is None:
            return

        for name, (lat, lon) in LOCATION_COORDS.items():
            self.named_node_map[name] = ox.nearest_nodes(self.osm_graph, lon, lat)

    def _build_named_graph(self):
        for location in LOCATION_COORDS.keys():
            self.graph.add_node(location)

        for source, target in GRAPH_EDGES:
            distance = self._resolve_distance(source, target)
            self.graph.add_edge(source, target, distance)

    def _resolve_distance(self, source: str, target: str) -> float:
        if self.osm_graph is not None and source in self.named_node_map and target in self.named_node_map:
            start = self.named_node_map[source]
            end = self.named_node_map[target]
            try:
                distance = nx.shortest_path_length(self.osm_graph, start, end, weight='length')
                return round(distance / 1000.0, 2)
            except (nx.NetworkXNoPath, nx.NodeNotFound):
                pass
        
        return self._haversine_distance(source, target)

    def _haversine_distance(self, source: str, target: str) -> float:
        import math
        if source not in LOCATION_COORDS or target not in LOCATION_COORDS:
            return 0.0
        
        lat1, lon1 = LOCATION_COORDS[source]
        lat2, lon2 = LOCATION_COORDS[target]
        
        R = 6371.0  # Earth radius in km
        phi1, phi2 = math.radians(lat1), math.radians(lat2)
        dphi = math.radians(lat2 - lat1)
        dlambda = math.radians(lon2 - lon1)
        
        a = math.sin(dphi / 2)**2 + math.cos(phi1) * math.cos(phi2) * math.sin(dlambda / 2)**2
        c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
        return round(R * c * 1.2, 2) # 1.2 factor for road winding approximation

    def find_nearest_node(self, lat: float, lon: float) -> str:
        import math
        nearest = None
        min_dist = float('inf')
        
        for name, (n_lat, n_lon) in LOCATION_COORDS.items():
            dist = math.sqrt((n_lat - lat)**2 + (n_lon - lon)**2)
            if dist < min_dist:
                min_dist = dist
                nearest = name
        return nearest

    def get_map_payload(self):
        nodes = [
            {'id': name, 'position': [lat, lon], 'label': name}
            for name, (lat, lon) in LOCATION_COORDS.items()
        ]
        edges = [[source, target] for source, target, _ in self.graph.to_edge_list()]
        return {'nodes': nodes, 'edges': edges}

    def find_nearest_hospital(self, patient_location: str):
        from .dijkstra import dijkstra

        best_candidate = None
        best_distance = float('inf')
        best_path = []

        for hospital in HOSPITALS:
            path, distance = dijkstra(self.graph, patient_location, hospital)
            if path and distance < best_distance:
                best_candidate = hospital
                best_distance = distance
                best_path = path

        return {'hospital': best_candidate, 'path': best_path, 'distance': best_distance}
