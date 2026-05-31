export const NODES = [
  { id: 'Aga Khan Hospital', position: [24.8600, 67.0149], label: 'Aga Khan Hospital' },
  { id: 'City Hospital', position: [24.8678, 67.0276], label: 'City Hospital' },
  { id: 'Liaquat Hospital', position: [24.8444, 67.0535], label: 'Liaquat Hospital' },
  { id: 'Saddar', position: [24.8604, 67.0261], label: 'Saddar' },
  { id: 'Clifton', position: [24.8091, 67.0337], label: 'Clifton' },
  { id: 'Gulshan', position: [24.9181, 67.1140], label: 'Gulshan' },
  { id: 'PECHS', position: [24.8622, 67.0667], label: 'PECHS' },
  { id: 'Defence', position: [24.8346, 67.0563], label: 'Defence' },
  { id: 'Korangi', position: [24.8642, 67.1129], label: 'Korangi' },
  { id: 'Landhi', position: [24.8638, 67.1545], label: 'Landhi' },
  { id: 'Malir', position: [24.9498, 67.3291], label: 'Malir' },
  { id: 'Lyari', position: [24.8573, 67.0074], label: 'Lyari' },
  { id: 'North Nazimabad', position: [24.9338, 67.0353], label: 'North Nazimabad' },
  { id: 'Orangi', position: [24.9318, 66.9566], label: 'Orangi' },
];

export const GRAPH_EDGES = [
  ['Aga Khan Hospital', 'PECHS', 3.0],
  ['Aga Khan Hospital', 'Gulshan', 4.0],
  ['Aga Khan Hospital', 'Defence', 6.0],
  ['City Hospital', 'Saddar', 3.0],
  ['City Hospital', 'Clifton', 5.0],
  ['City Hospital', 'Lyari', 6.0],
  ['Liaquat Hospital', 'Korangi', 4.0],
  ['Liaquat Hospital', 'Landhi', 6.0],
  ['Liaquat Hospital', 'Malir', 8.0],
  ['Saddar', 'PECHS', 2.0],
  ['Saddar', 'Clifton', 4.0],
  ['Saddar', 'Lyari', 5.0],
  ['Clifton', 'Defence', 3.0],
  ['Gulshan', 'Korangi', 5.0],
  ['Gulshan', 'PECHS', 3.0],
  ['Defence', 'Korangi', 7.0],
  ['Korangi', 'Landhi', 3.0],
  ['Landhi', 'Malir', 4.0],
  ['Lyari', 'Orangi', 7.0],
  ['North Nazimabad', 'Gulshan', 6.0],
  ['North Nazimabad', 'PECHS', 5.0],
  ['North Nazimabad', 'Orangi', 4.0],
];

export const HOSPITALS = ['Aga Khan Hospital', 'City Hospital', 'Liaquat Hospital'];

export const MAP_DATA = {
  nodes: NODES,
  edges: GRAPH_EDGES.map(([from, to]) => [from, to]),
};

export const INITIAL_AMBULANCES = [
  { id: 'AMB-001', name: 'Rescue Alpha', status: 'available', location: 'PECHS', eta: '5 min' },
  { id: 'AMB-002', name: 'Rescue Beta', status: 'available', location: 'Lyari', eta: '8 min' },
  { id: 'AMB-003', name: 'Rescue Gamma', status: 'busy', location: 'City Hospital', eta: 'Arriving' },
  { id: 'AMB-004', name: 'Rescue Delta', status: 'available', location: 'Gulshan', eta: '6 min' },
];

export const INITIAL_LOGS = [
  {
    id: 'LOG-001',
    timestamp: Date.now() - 1000 * 60 * 7,
    patient_location: 'Saddar',
    ambulance_name: 'Rescue Gamma',
    hospital_location: 'City Hospital',
  },
  {
    id: 'LOG-002',
    timestamp: Date.now() - 1000 * 60 * 20,
    patient_location: 'Landhi',
    ambulance_name: 'Rescue Beta',
    hospital_location: 'Liaquat Hospital',
  },
];

export const INITIAL_RISK_DATA = [
  { location: 'Aga Khan Hospital', score: 0.22 },
  { location: 'City Hospital', score: 0.31 },
  { location: 'Liaquat Hospital', score: 0.65 },
  { location: 'Saddar', score: 0.78 },
  { location: 'Clifton', score: 0.58 },
  { location: 'Gulshan', score: 0.47 },
  { location: 'PECHS', score: 0.52 },
  { location: 'Defence', score: 0.38 },
  { location: 'Korangi', score: 0.86 },
  { location: 'Landhi', score: 0.72 },
  { location: 'Malir', score: 0.49 },
  { location: 'Lyari', score: 0.91 },
  { location: 'North Nazimabad', score: 0.34 },
  { location: 'Orangi', score: 0.60 },
];
