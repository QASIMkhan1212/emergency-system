# 🚑 Emergency Ambulance Dispatch System — Full Project Specification
> This file contains everything an AI needs to build this project from scratch.
> Group: Intellectual Minds | Members: Muhammad Qasim Khan, Ubaid Alam | SMIU Karachi

---

## SECTION 1: SYSTEM ARCHITECTURE DIAGRAM

```
┌─────────────────────────────────────────────────────────────────────────┐
│                          FRONTEND (React.js)                            │
│                                                                         │
│  ┌──────────────┐  ┌─────────────────┐  ┌───────────────────────────┐  │
│  │  Karachi Map │  │ Ambulance Status │  │  Dispatch Panel + Log     │  │
│  │  (SVG/Leaflet│  │ Cards (Live)     │  │  History Table            │  │
│  └──────────────┘  └─────────────────┘  └───────────────────────────┘  │
│  ┌──────────────┐  ┌─────────────────┐                                  │
│  │  AI Heatmap  │  │  Route Panel    │                                  │
│  │  Overlay     │  │  (Path + ETA)   │                                  │
│  └──────────────┘  └─────────────────┘                                  │
│                        │ Axios HTTP Requests                             │
└────────────────────────┼────────────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                       BACKEND (Python FastAPI)                          │
│                                                                         │
│  ┌───────────────────────────────────────────────────────────────────┐  │
│  │                          API ROUTES                               │  │
│  │                                                                   │  │
│  │  GET  /map              → Returns city graph (nodes + edges)      │  │
│  │  GET  /ambulances       → Returns all ambulance statuses          │  │
│  │  POST /dispatch         → Triggers full dispatch logic            │  │
│  │  GET  /predict          → Returns AI risk scores per area         │  │
│  │  GET  /logs             → Returns dispatch history (linked list)  │  │
│  │  POST /ambulance/move   → Update ambulance position (simulation)  │  │
│  └───────────────────────────────────────────────────────────────────┘  │
│                                │                                        │
│  ┌─────────────────────────────┼──────────────────────────────────────┐ │
│  │                    DSA ENGINE (Core Logic)                        │ │
│  │                             │                                     │ │
│  │  ┌──────────────┐  ┌────────┴──────┐  ┌────────────────────────┐ │ │
│  │  │    GRAPH     │  │   DIJKSTRA    │  │       MIN-HEAP         │ │ │
│  │  │ Adjacency    │  │   Algorithm   │  │  (heapq — nearest      │ │ │
│  │  │ List of      │  │   Shortest    │  │   ambulance finder)    │ │ │
│  │  │ Karachi Map  │  │   Path Finder │  └────────────────────────┘ │ │
│  │  └──────────────┘  └───────────────┘                             │ │
│  │                                                                   │ │
│  │  ┌──────────────┐  ┌───────────────┐                             │ │
│  │  │ LINKED LIST  │  │ AI PREDICTOR  │                             │ │
│  │  │ Dispatch Log │  │ Random Forest │                             │ │
│  │  │ (Head→Tail)  │  │ Risk Scoring  │                             │ │
│  │  └──────────────┘  └───────────────┘                             │ │
│  └───────────────────────────────────────────────────────────────────┘ │
│                                                                         │
│  ┌───────────────────────────────────────────────────────────────────┐  │
│  │           REAL MAP DATA — OSMnx + OpenStreetMap                   │  │
│  │   Downloads real Karachi road network on first startup            │  │
│  └───────────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────────┘
```

### Data Flow Summary
```
User selects patient location on map
        ↓
POST /dispatch called with { patient_location, severity }
        ↓
Min-Heap ranks all available ambulances by distance to patient
        ↓
Nearest ambulance selected (heap root)
        ↓
Dijkstra finds: Ambulance Location → Patient Location (path 1)
        ↓
Dijkstra finds: Patient Location → Nearest Hospital (path 2)
        ↓
Both paths returned to frontend
        ↓
Frontend animates ambulance along path (simulated GPS)
        ↓
Dispatch event saved to Linked List log
        ↓
AI re-runs risk prediction → heatmap updates
```

---

## SECTION 2: FOLDER STRUCTURE

```
ambulance-dispatch-system/
│
├── backend/
│   ├── main.py                  ← FastAPI app entry point, all routes defined here
│   ├── graph.py                 ← Graph class using adjacency list
│   ├── dijkstra.py              ← Dijkstra's shortest path algorithm
│   ├── heap.py                  ← Min-Heap class for nearest ambulance
│   ├── linked_list.py           ← Linked List class for dispatch logs
│   ├── ai_predictor.py          ← Random Forest model, training, prediction
│   ├── karachi_map.py           ← OSMnx loader for real Karachi road network
│   ├── ambulance_data.py        ← Initial ambulance positions and statuses
│   ├── data/
│   │   └── incidents.csv        ← Synthetic historical incident data for AI training
│   └── requirements.txt         ← All Python dependencies
│
├── frontend/
│   ├── public/
│   │   └── index.html
│   ├── src/
│   │   ├── App.jsx              ← Root component, layout, state management
│   │   ├── api/
│   │   │   └── axios.js         ← Centralized API calls (base URL, all endpoints)
│   │   ├── components/
│   │   │   ├── Map.jsx          ← SVG Karachi map, nodes, edges, route highlight
│   │   │   ├── Dashboard.jsx    ← Grid of ambulance status cards (available/busy)
│   │   │   ├── DispatchForm.jsx ← Dropdown: patient location + severity selector
│   │   │   ├── RoutePanel.jsx   ← Displays calculated route steps + ETA
│   │   │   ├── HeatMap.jsx      ← Color overlay on map based on AI risk scores
│   │   │   └── LogTable.jsx     ← Table of all past dispatches from linked list
│   │   ├── hooks/
│   │   │   └── useSimulation.js ← Custom hook: animates ambulance movement on map
│   │   └── index.css            ← Tailwind imports
│   ├── package.json
│   ├── tailwind.config.js
│   └── vite.config.js
│
└── README.md                    ← Setup instructions, how to run backend + frontend
```

---

## SECTION 3: DSA COMPONENTS — FULL DETAILS

---

### 3.1 GRAPH (Adjacency List)

**File:** `backend/graph.py`

**Purpose:**
Represents the Karachi city map. Every location (hospital, area, landmark) is a node. Every road between two locations is an edge with a distance (weight in km).

**Data Structure:**
```
Dictionary where:
  Key   = location name (string)
  Value = list of tuples (neighbor_name, distance_in_km)
```

**Implementation:**
```python
class Graph:
    def __init__(self):
        self.adjacency_list = {}

    def add_node(self, location):
        if location not in self.adjacency_list:
            self.adjacency_list[location] = []

    def add_edge(self, location1, location2, distance):
        # Undirected graph — road goes both ways
        self.adjacency_list[location1].append((location2, distance))
        self.adjacency_list[location2].append((location1, distance))

    def get_neighbors(self, location):
        return self.adjacency_list.get(location, [])

    def get_all_nodes(self):
        return list(self.adjacency_list.keys())
```

**Karachi Map Data (hardcoded for demo, OSMnx for real version):**
```python
KARACHI_LOCATIONS = {
    "Aga Khan Hospital":  [("PECHS", 3.0), ("Gulshan", 4.0), ("Defence", 6.0)],
    "City Hospital":      [("Saddar", 3.0), ("Clifton", 5.0), ("Lyari", 6.0)],
    "Liaquat Hospital":   [("Korangi", 4.0), ("Landhi", 6.0), ("Malir", 8.0)],
    "Saddar":             [("City Hospital", 3.0), ("PECHS", 2.0), ("Clifton", 4.0), ("Lyari", 5.0)],
    "Clifton":            [("City Hospital", 5.0), ("Saddar", 4.0), ("Defence", 3.0)],
    "Gulshan":            [("Aga Khan Hospital", 4.0), ("Korangi", 5.0), ("PECHS", 3.0)],
    "PECHS":              [("Saddar", 2.0), ("Gulshan", 3.0), ("Aga Khan Hospital", 3.0)],
    "Defence":            [("Clifton", 3.0), ("Aga Khan Hospital", 6.0), ("Korangi", 7.0)],
    "Korangi":            [("Liaquat Hospital", 4.0), ("Gulshan", 5.0), ("Landhi", 3.0)],
    "Landhi":             [("Liaquat Hospital", 6.0), ("Korangi", 3.0), ("Malir", 4.0)],
    "Malir":              [("Liaquat Hospital", 8.0), ("Landhi", 4.0)],
    "Lyari":              [("Saddar", 5.0), ("City Hospital", 6.0)],
    "North Nazimabad":    [("Gulshan", 6.0), ("PECHS", 5.0), ("Orangi", 4.0)],
    "Orangi":             [("North Nazimabad", 4.0), ("Lyari", 7.0)],
}

HOSPITALS = ["Aga Khan Hospital", "City Hospital", "Liaquat Hospital"]
```

**Why Graph?**
A graph is the natural way to model any road network. Each intersection = node, each road = edge. Without a graph, we cannot apply Dijkstra or any pathfinding algorithm.

---

### 3.2 DIJKSTRA'S ALGORITHM

**File:** `backend/dijkstra.py`

**Purpose:**
Finds the shortest (minimum distance) path between two locations in the Karachi road graph.

**Used For:**
1. Finding shortest path: Ambulance location → Patient location
2. Finding shortest path: Patient location → Nearest hospital

**How It Works (Step by Step):**
```
1. Set distance of start node = 0, all others = infinity
2. Push (0, start) into a min-heap
3. While heap is not empty:
   a. Pop node with smallest distance (u)
   b. For each neighbor (v) of u:
      - new_dist = dist[u] + edge_weight(u, v)
      - If new_dist < dist[v]:
          - Update dist[v] = new_dist
          - Record prev[v] = u  (to reconstruct path later)
          - Push (new_dist, v) into heap
4. Reconstruct path by backtracking through prev[] from end to start
5. Return path list + total distance
```

**Implementation:**
```python
import heapq

def dijkstra(graph, start, end):
    # Initialize distances
    distances = {node: float('inf') for node in graph.get_all_nodes()}
    distances[start] = 0
    previous = {node: None for node in graph.get_all_nodes()}

    # Min-heap: (distance, node)
    heap = [(0, start)]

    while heap:
        current_dist, current_node = heapq.heappop(heap)

        # Skip if we already found a shorter path
        if current_dist > distances[current_node]:
            continue

        # Explore neighbors
        for neighbor, weight in graph.get_neighbors(current_node):
            new_dist = distances[current_node] + weight
            if new_dist < distances[neighbor]:
                distances[neighbor] = new_dist
                previous[neighbor] = current_node
                heapq.heappush(heap, (new_dist, neighbor))

    # Reconstruct path from end to start
    path = []
    current = end
    while current is not None:
        path.append(current)
        current = previous[current]
    path.reverse()

    # If path doesn't start at 'start', no route exists
    if path[0] != start:
        return [], float('inf')

    return path, distances[end]


def find_nearest_hospital(graph, patient_location, hospitals):
    best_dist = float('inf')
    best_hospital = None
    best_path = []

    for hospital in hospitals:
        path, dist = dijkstra(graph, patient_location, hospital)
        if dist < best_dist:
            best_dist = dist
            best_hospital = hospital
            best_path = path

    return best_hospital, best_path, best_dist
```

**Example:**
```
Patient in: Lyari
Ambulance in: Gulshan

Dijkstra explores:
  Gulshan(0) → PECHS(3) → Saddar(5) → Lyari(10)
  
Result:
  Path: ['Gulshan', 'PECHS', 'Saddar', 'Lyari']
  Distance: 10.0 km
  ETA: ~15 minutes
```

**Time Complexity:** O((V + E) log V)
- V = number of locations (nodes)
- E = number of roads (edges)

---

### 3.3 MIN-HEAP (Priority Queue)

**File:** `backend/heap.py`

**Purpose:**
Given multiple available ambulances, instantly find the one closest to the patient. The heap always keeps the minimum distance element at the top.

**How It Works:**
```
All available ambulances are inserted into heap as:
  (distance_to_patient, ambulance_id)

Heap automatically sorts so smallest distance is always at root.
heappop() gives us the nearest ambulance in O(log n) time.
```

**Implementation:**
```python
import heapq

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
    ambulances = {
        "AMB-01": {"location": "Saddar", "status": "available"},
        "AMB-02": {"location": "Gulshan", "status": "busy"},
        ...
    }
    """
    heap = AmbulanceHeap()

    for amb_id, amb_data in ambulances.items():
        if amb_data["status"] != "available":
            continue  # Skip busy ambulances

        # Find distance from this ambulance to patient
        path, dist = dijkstra(graph, amb_data["location"], patient_location)
        if path:  # Route exists
            heap.push(dist, amb_id)

    # Pop nearest
    nearest_id, nearest_dist = heap.pop_nearest()
    return nearest_id, nearest_dist
```

**Example:**
```
Patient in: Gulshan

Available ambulances:
  AMB-01 at Saddar  → distance 5.0 km
  AMB-02 at Korangi → distance 5.1 km
  AMB-03 at PECHS   → distance 3.0 km  ← NEAREST

Heap after insertions:
  [(3.0, AMB-03), (5.0, AMB-01), (5.1, AMB-02)]

heappop() → (3.0, AMB-03) — dispatched!
```

**Why Min-Heap?**
- Without heap: check all ambulances one by one = O(n) per query
- With min-heap: nearest ambulance always at top = O(log n) insertion, O(log n) extraction
- For a city with 50+ ambulances, this difference matters a lot

---

### 3.4 LINKED LIST (Dispatch Log)

**File:** `backend/linked_list.py`

**Purpose:**
Every time an ambulance is dispatched, a record is saved. The linked list stores this history where each node = one dispatch event. New dispatches are added at the head (most recent first).

**Node Structure:**
```
Each Node contains:
  - dispatch_id     : unique ID (e.g. "D-001")
  - ambulance_id    : which ambulance was sent (e.g. "AMB-03")
  - patient_location: where the patient was
  - hospital        : which hospital they went to
  - distance_km     : total distance travelled
  - timestamp       : when it happened
  - next            : pointer to previous dispatch node
```

**Implementation:**
```python
from datetime import datetime

class DispatchNode:
    def __init__(self, data):
        self.data = data      # Dictionary with dispatch details
        self.next = None      # Pointer to next node


class DispatchLinkedList:
    def __init__(self):
        self.head = None
        self.size = 0

    def add_dispatch(self, dispatch_data):
        """Add new dispatch at head (most recent first)"""
        new_node = DispatchNode(dispatch_data)
        new_node.next = self.head
        self.head = new_node
        self.size += 1

    def get_all_logs(self):
        """Traverse list and return all dispatches"""
        logs = []
        current = self.head
        while current is not None:
            logs.append(current.data)
            current = current.next
        return logs  # Returns most recent first

    def get_total_dispatches(self):
        return self.size

    def search_by_ambulance(self, amb_id):
        """Search dispatches for a specific ambulance"""
        results = []
        current = self.head
        while current is not None:
            if current.data["ambulance_id"] == amb_id:
                results.append(current.data)
            current = current.next
        return results


# Global log instance
dispatch_log = DispatchLinkedList()

# Example usage:
dispatch_log.add_dispatch({
    "dispatch_id": "D-001",
    "ambulance_id": "AMB-03",
    "patient_location": "Gulshan",
    "hospital": "Aga Khan Hospital",
    "path_to_patient": ["PECHS", "Gulshan"],
    "path_to_hospital": ["Gulshan", "Aga Khan Hospital"],
    "distance_km": 7.0,
    "severity": "critical",
    "timestamp": datetime.now().isoformat()
})
```

**Why Linked List?**
- New dispatch added in O(1) — just update head pointer
- No fixed size — can store unlimited dispatch history
- Traversal for log display = O(n)
- Natural LIFO order — most recent dispatch shown first

---

### 3.5 AI PREDICTION LAYER

**File:** `backend/ai_predictor.py`

**Purpose:**
Predict which areas of Karachi are at high risk of emergencies in the next hour. Pre-position ambulances before emergencies happen.

**Model:** Random Forest Classifier (scikit-learn)

**Input Features:**
```
- hour_of_day     : 0-23
- day_of_week     : 0=Monday, 6=Sunday
- area_name       : encoded as integer
- weather_code    : 0=clear, 1=rain, 2=fog
- past_incidents  : count of incidents in this area last 7 days
```

**Output:**
```
risk_score: float 0.0 to 10.0 for each area
  0-3   = Low Risk   (green on heatmap)
  4-6   = Medium Risk (yellow on heatmap)
  7-10  = High Risk  (red on heatmap)
```

**Implementation:**
```python
import pandas as pd
from sklearn.ensemble import RandomForestClassifier
from sklearn.preprocessing import LabelEncoder
import numpy as np
from datetime import datetime

class RiskPredictor:
    def __init__(self):
        self.model = RandomForestClassifier(n_estimators=100, random_state=42)
        self.label_encoder = LabelEncoder()
        self.is_trained = False

    def train(self, csv_path="data/incidents.csv"):
        df = pd.read_csv(csv_path)
        self.label_encoder.fit(df["area_name"])
        df["area_encoded"] = self.label_encoder.transform(df["area_name"])

        X = df[["hour_of_day", "day_of_week", "area_encoded", "weather_code", "past_incidents"]]
        y = df["risk_level"]  # 0=low, 1=medium, 2=high

        self.model.fit(X, y)
        self.is_trained = True

    def predict_all_areas(self, areas, weather_code=0):
        now = datetime.now()
        hour = now.hour
        day = now.weekday()

        results = {}
        for area in areas:
            try:
                area_encoded = self.label_encoder.transform([area])[0]
                past_incidents = np.random.randint(1, 15)  # Simulated for demo
                features = [[hour, day, area_encoded, weather_code, past_incidents]]
                risk_class = self.model.predict(features)[0]
                # Convert class to score
                score_map = {0: np.random.uniform(1, 3),
                             1: np.random.uniform(4, 6),
                             2: np.random.uniform(7, 10)}
                results[area] = round(score_map[risk_class], 1)
            except:
                results[area] = 3.0  # Default low risk
        return results
```

**Synthetic Training Data (incidents.csv sample):**
```csv
area_name,hour_of_day,day_of_week,weather_code,past_incidents,risk_level
Lyari,2,4,0,12,2
Korangi,18,1,1,7,2
Clifton,14,6,0,3,0
Saddar,22,4,0,9,1
Orangi,1,5,1,14,2
Defence,10,6,0,2,0
Gulshan,17,1,0,5,1
PECHS,8,0,0,4,1
Landhi,23,5,1,11,2
North Nazimabad,3,4,0,8,1
```

---

## SECTION 4: API ENDPOINTS (FastAPI)

**File:** `backend/main.py`

```python
# Full list of endpoints the frontend will call:

GET  /map
  Response: {
    "nodes": ["Saddar", "Gulshan", ...],
    "edges": [{"from": "Saddar", "to": "PECHS", "weight": 2.0}, ...],
    "hospitals": ["Aga Khan Hospital", ...]
  }

GET  /ambulances
  Response: {
    "AMB-01": {"location": "Saddar", "status": "available", "unit": "Alpha"},
    "AMB-02": {"location": "Gulshan", "status": "busy", "unit": "Bravo"},
    ...
  }

POST /dispatch
  Request Body: {
    "patient_location": "Gulshan",
    "severity": "critical"   # critical / moderate / minor
  }
  Response: {
    "ambulance_id": "AMB-03",
    "ambulance_location": "PECHS",
    "path_to_patient": ["PECHS", "Gulshan"],
    "path_to_hospital": ["Gulshan", "Aga Khan Hospital"],
    "hospital": "Aga Khan Hospital",
    "total_distance_km": 7.0,
    "eta_minutes": 11,
    "dispatch_id": "D-007"
  }

GET  /predict
  Response: {
    "Saddar": 7.2,
    "Gulshan": 4.5,
    "Lyari": 8.9,
    "Clifton": 2.1,
    ...
  }

GET  /logs
  Response: [
    {
      "dispatch_id": "D-007",
      "ambulance_id": "AMB-03",
      "patient_location": "Gulshan",
      "hospital": "Aga Khan Hospital",
      "distance_km": 7.0,
      "severity": "critical",
      "timestamp": "2026-05-21T14:32:00"
    },
    ...
  ]

POST /ambulance/move
  Request Body: {
    "ambulance_id": "AMB-03",
    "new_location": "Gulshan",
    "new_status": "at_scene"
  }
  Response: { "success": true }
```

---

## SECTION 5: FRONTEND COMPONENTS

**All components live in:** `frontend/src/components/`

### Map.jsx
- Renders Karachi map as SVG
- Nodes = circles with location names
- Edges = lines between nodes with distance labels
- Active route highlighted in red/orange animated line
- Ambulance icon moves along route (simulated GPS)
- Clicking a node sets it as patient location

### Dashboard.jsx
- Grid of cards, one per ambulance
- Each card shows: ambulance ID, unit name, current location, status badge (green=available, red=busy)
- Updates every 2 seconds via polling /ambulances

### DispatchForm.jsx
- Dropdown to select patient location (all graph nodes)
- Radio buttons for severity: Critical / Moderate / Minor
- "Dispatch Ambulance" button → calls POST /dispatch
- Shows loading spinner while waiting for response

### RoutePanel.jsx
- After dispatch, shows:
  - Which ambulance was sent
  - Step-by-step path: PECHS → Gulshan → Aga Khan Hospital
  - Total distance in km
  - Estimated time of arrival in minutes
  - Live countdown timer

### HeatMap.jsx
- Color overlay on map nodes based on AI risk score
- Green (0-3) / Yellow (4-6) / Red (7-10)
- Refreshes every 30 seconds via GET /predict
- Legend shown on bottom left of map

### LogTable.jsx
- Table with columns: Dispatch ID, Ambulance, Patient Location, Hospital, Distance, Severity, Time
- Data from GET /logs (linked list traversal)
- Most recent dispatch shown at top
- Color-coded rows by severity

---

## SECTION 6: SIMULATED GPS (Ambulance Animation)

**File:** `frontend/src/hooks/useSimulation.js`

```
Logic:
1. After dispatch, frontend receives full path array
   e.g. ["PECHS", "Gulshan Road", "Gulshan"]

2. useSimulation hook stores:
   - current path
   - current step index (starts at 0)

3. Every 1500ms (1.5 seconds), step index increments by 1

4. Map.jsx reads current step → renders ambulance icon at that node

5. When step reaches end of path_to_patient:
   - Ambulance status = "At Scene"
   - Wait 3 seconds
   - Then begin animating path_to_hospital

6. On reaching hospital:
   - Status = "Delivered"
   - POST /ambulance/move called to reset ambulance
   - Ambulance becomes available again
```

---

## SECTION 7: REQUIREMENTS FILES

### backend/requirements.txt
```
fastapi==0.110.0
uvicorn==0.29.0
pydantic==2.6.4
scikit-learn==1.4.2
pandas==2.2.1
numpy==1.26.4
osmnx==1.9.1
networkx==3.3
```

### frontend/package.json (dependencies section)
```json
{
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "axios": "^1.6.8",
    "lucide-react": "^0.383.0"
  },
  "devDependencies": {
    "vite": "^5.2.0",
    "@vitejs/plugin-react": "^4.2.1",
    "tailwindcss": "^3.4.1",
    "autoprefixer": "^10.4.19",
    "postcss": "^8.4.38"
  }
}
```

---

## SECTION 8: HOW TO RUN

### Backend
```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

### Frontend
```bash
cd frontend
npm install
npm run dev
# Opens at http://localhost:5173
```

### Backend API Docs (auto-generated by FastAPI)
```
http://localhost:8000/docs
```

---

## SECTION 9: IMPORTANT NOTES FOR AI BUILDING THIS PROJECT

1. **Graph is undirected** — all roads go both ways, add edges in both directions
2. **Hospitals are also nodes** in the graph — they have connections to nearby areas
3. **Ambulances start as hardcoded data** — 5 ambulances at different Karachi locations
4. **AI model trains on startup** — load incidents.csv and train RandomForest when FastAPI starts
5. **CORS must be enabled** on FastAPI — frontend (port 5173) calls backend (port 8000)
6. **Simulated GPS only** — no real GPS; ambulance position updates via frontend animation logic
7. **Dispatch log persists in memory** — no database needed, linked list in Python memory is enough
8. **ETA formula:** `eta_minutes = round((distance_km / 40) * 60)` — assumes 40 km/h average speed
9. **Map SVG coordinates** — manually assign x,y pixel positions to each Karachi location node for rendering
10. **Severity affects priority** — critical patients get dispatched even if only 1 ambulance is left; moderate/minor check for 2+ available

---

*End of Project Specification*
*Group: Intellectual Minds | SMIU Karachi | DSA Project 2026*
