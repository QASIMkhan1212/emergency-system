import { MAP_DATA, GRAPH_EDGES, HOSPITALS, INITIAL_AMBULANCES, INITIAL_LOGS, INITIAL_RISK_DATA } from '../data/mockData';
import { buildGraph, dijkstra, findNearestHospital } from '../data/pathfinder';

const graph = buildGraph(GRAPH_EDGES);
let ambulances = JSON.parse(JSON.stringify(INITIAL_AMBULANCES));
let logs = [...INITIAL_LOGS];
let riskData = [...INITIAL_RISK_DATA];

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function fetchMap() {
  await delay(150);
  return MAP_DATA;
}

export async function fetchAmbulances() {
  await delay(100);
  return JSON.parse(JSON.stringify(ambulances));
}

export async function fetchLogs() {
  await delay(100);
  return [...logs].sort((a, b) => b.timestamp - a.timestamp);
}

export async function fetchRiskScores() {
  await delay(100);
  return [...riskData].sort((a, b) => b.score - a.score);
}

export async function dispatchAmbulance(payload) {
  await delay(250);

  const patientLocation = payload.patient_location;
  if (!patientLocation) {
    throw new Error('Patient location is required.');
  }

  const availableAmbulances = ambulances.filter((item) => item.status === 'available');
  if (availableAmbulances.length === 0) {
    throw new Error('No available ambulances at the moment.');
  }

  const ambulanceCandidates = availableAmbulances
    .map((ambulance) => {
      const result = dijkstra(graph, ambulance.location, patientLocation);
      return { ambulance, ...result };
    })
    .filter((candidate) => candidate.path.length > 0)
    .sort((a, b) => a.distance - b.distance);

  const chosen = ambulanceCandidates[0];
  if (!chosen) {
    throw new Error('Unable to route an ambulance to the patient location.');
  }

  const hospitalRoute = findNearestHospital(graph, patientLocation, HOSPITALS);
  if (!hospitalRoute) {
    throw new Error('No hospital route found from the patient location.');
  }

  const assignedAmbulance = ambulances.find((item) => item.id === chosen.ambulance.id);
  if (assignedAmbulance) {
    assignedAmbulance.status = 'busy';
    assignedAmbulance.eta = `${Math.round((chosen.distance + hospitalRoute.distance) * 3)} min`;
  }

  const dispatchLog = {
    id: `LOG-${String(logs.length + 1).padStart(3, '0')}`,
    timestamp: Date.now(),
    patient_location: patientLocation,
    ambulance_name: chosen.ambulance.name,
    hospital_location: hospitalRoute.hospital,
  };
  logs = [dispatchLog, ...logs].slice(0, 15);

  return {
    ambulance: chosen.ambulance,
    patientLocation,
    hospitalLocation: hospitalRoute.hospital,
    distanceToPatient: chosen.distance,
    distanceToHospital: hospitalRoute.distance,
    routeToPatient: chosen.path,
    routeToHospital: hospitalRoute.path,
  };
}
