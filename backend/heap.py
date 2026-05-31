import heapq

from .dijkstra import dijkstra


class AmbulanceHeap:
    def __init__(self):
        self.heap = []

    def push(self, distance, ambulance_id):
        heapq.heappush(self.heap, (distance, ambulance_id))

    def pop_nearest(self):
        if self.heap:
            distance, ambulance_id = heapq.heappop(self.heap)
            return ambulance_id, distance
        return None, None

    def is_empty(self):
        return len(self.heap) == 0

def find_nearest_ambulance(graph, ambulances, patient_location):
    """
    Finds the available ambulance with the shortest Dijkstra path to the patient.
    """
    heap = AmbulanceHeap()
    print(f"Finding nearest ambulance for location: {patient_location}")

    available_units = [a for amb in ambulances if (a := amb).get('status') == 'available']

    for ambulance in available_units:
        route, distance = dijkstra(graph, ambulance.get('location'), patient_location)
        if route:
            print(f" - {ambulance['name']} is {distance:.2f} km away")
            heap.push(distance, ambulance.get('id'))
        else:
            print(f" - {ambulance['name']} has no route to patient")

    nearest_id, nearest_distance = heap.pop_nearest()
    if nearest_id is None:
        print("No available ambulances can reach this location.")
        return None

    chosen = next((ambulance for ambulance in ambulances if ambulance.get('id') == nearest_id), None)
    print(f"SELECTED: {chosen['name']} ({nearest_distance:.2f} km)")
    return chosen

