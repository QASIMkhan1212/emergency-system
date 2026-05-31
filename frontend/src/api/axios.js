import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8000',
  timeout: 10000,
});

export async function fetchMap() {
  const response = await api.get('/map');
  return response.data;
}

export async function fetchAmbulances() {
  const response = await api.get('/ambulances');
  return response.data;
}

export async function fetchLogs() {
  const response = await api.get('/logs');
  return response.data;
}

export async function fetchRiskScores() {
  const response = await api.get('/predict');
  return response.data;
}

export async function dispatchAmbulance(payload) {
  const response = await api.post('/dispatch', payload);
  return response.data;
}

export async function moveAmbulance(payload) {
  const response = await api.post('/ambulance/move', payload);
  return response.data;
}
