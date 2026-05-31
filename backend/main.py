import copy
import datetime
from typing import Optional, Union

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from backend.ai_predictor import AIPredictor
from backend.ambulance_data import AMBULANCES as INITIAL_AMBULANCES
from backend.dijkstra import dijkstra
from backend.heap import find_nearest_ambulance
from backend.karachi_map import KarachiMap
from backend.linked_list import DispatchLogLinkedList


class DispatchRequest(BaseModel):
    patient_location: Optional[str] = None
    lat: Optional[float] = None
    lon: Optional[float] = None
    severity: str


class AmbulanceMoveRequest(BaseModel):
    ambulance_id: str
    new_location: str


app = FastAPI(title='Karachi Ambulance Dispatch Backend')
app.add_middleware(
    CORSMiddleware,
    allow_origins=['*'],
    allow_credentials=True,
    allow_methods=['*'],
    allow_headers=['*'],
)

map_service = KarachiMap()
ambulances = []
log_list = DispatchLogLinkedList()
predictor = AIPredictor(incident_csv_path='backend/data/incidents.csv')


@app.on_event('startup')
def startup_event():
    global map_service, ambulances, predictor
    map_service.load_osm()
    ambulances = copy.deepcopy(INITIAL_AMBULANCES)
    predictor.train()
    log_list.push(
        {
            'id': 'LOG-001',
            'timestamp': datetime.datetime.utcnow().isoformat(),
            'patient_location': 'Saddar',
            'ambulance_name': 'Rescue Gamma',
            'hospital_location': 'City Hospital',
        }
    )
    log_list.push(
        {
            'id': 'LOG-002',
            'timestamp': (datetime.datetime.utcnow() - datetime.timedelta(minutes=21)).isoformat(),
            'patient_location': 'Landhi',
            'ambulance_name': 'Rescue Beta',
            'hospital_location': 'Liaquat Hospital',
        }
    )


@app.get('/map')
def get_map():
    return map_service.get_map_payload()


@app.get('/ambulances')
def get_ambulances():
    return ambulances


@app.get('/logs')
def get_logs():
    return log_list.to_list()


@app.get('/predict')
def get_risk_scores():
    locations = map_service.graph.get_all_nodes()
    return predictor.predict(locations)


@app.post('/dispatch')
def dispatch(request: DispatchRequest):
    if request.severity not in {'low', 'medium', 'high'}:
        raise HTTPException(status_code=400, detail='Severity must be one of low, medium, high.')

    # Resolve location name from name OR coordinates
    location_name = request.patient_location
    if request.lat is not None and request.lon is not None:
        resolved_name = map_service.find_nearest_node(request.lat, request.lon)
        if resolved_name:
            location_name = resolved_name

    if not location_name or location_name not in map_service.graph.get_all_nodes():
        raise HTTPException(status_code=404, detail='Target location not recognized.')

    ambulance = find_nearest_ambulance(map_service.graph, ambulances, location_name)
    if ambulance is None:
        raise HTTPException(status_code=404, detail='No available ambulances found.')

    route_to_patient, distance_to_patient = dijkstra(map_service.graph, ambulance['location'], location_name)
    hospital_route = map_service.find_nearest_hospital(location_name)

    if not hospital_route or not hospital_route['path']:
        raise HTTPException(status_code=500, detail='Unable to determine nearest hospital route.')

    # Ensure finite numbers for JSON serialization
    safe_dist_patient = 0.0 if distance_to_patient == float('inf') else distance_to_patient
    safe_dist_hospital = 0.0 if hospital_route['distance'] == float('inf') else hospital_route['distance']

    base_eta = max(3, round((safe_dist_patient + safe_dist_hospital) * 3))
    speed_factor = {'low': 1.2, 'medium': 1.0, 'high': 0.8}[request.severity]
    ambulance['status'] = 'busy'
    ambulance['eta'] = f'{max(3, round(base_eta * speed_factor))} min'

    log_entry = {
        'id': f'LOG-{len(log_list.to_list()) + 1:03}',
        'timestamp': datetime.datetime.utcnow().isoformat(),
        'patient_location': location_name,
        'ambulance_name': ambulance['name'],
        'hospital_location': hospital_route['hospital'],
    }
    log_list.push(log_entry)

    return {
        'ambulance': ambulance,
        'patientLocation': location_name,
        'hospitalLocation': hospital_route['hospital'],
        'distanceToPatient': round(safe_dist_patient, 2),
        'distanceToHospital': round(safe_dist_hospital, 2),
        'routeToPatient': route_to_patient,
        'routeToHospital': hospital_route['path'],
    }


@app.post('/ambulance/move')
def move_ambulance(request: AmbulanceMoveRequest):
    if request.new_location not in map_service.graph.get_all_nodes():
        raise HTTPException(status_code=404, detail='Destination location not recognized.')

    ambulance = next((item for item in ambulances if item['id'] == request.ambulance_id), None)
    if ambulance is None:
        raise HTTPException(status_code=404, detail='Ambulance not found.')

    ambulance['location'] = request.new_location
    ambulance['status'] = 'available'
    ambulance['eta'] = 'N/A'
    return ambulance
