import { useEffect, useState, useCallback, Component } from 'react';
import { Activity, Shield, Clock, Map as MapIcon, History, AlertTriangle, Radio } from 'lucide-react';
import { fetchAmbulances, fetchMap, fetchLogs, fetchRiskScores, dispatchAmbulance, moveAmbulance } from './api/axios';
import Map from './components/Map';
import Dashboard from './components/Dashboard';
import DispatchForm from './components/DispatchForm';
import RoutePanel from './components/RoutePanel';
import HeatMap from './components/HeatMap';
import LogTable from './components/LogTable';
import useSimulation from './hooks/useSimulation';

// Error Boundary to prevent full app crash
class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-950 flex items-center justify-center p-10">
          <div className="bg-rose-500/10 border border-rose-500/20 p-8 rounded-3xl max-w-xl">
            <h1 className="text-2xl font-bold text-rose-500 mb-4">Dashboard Runtime Error</h1>
            <pre className="text-xs text-rose-300 bg-black/40 p-4 rounded-xl overflow-auto max-h-60">
              {this.state.error?.toString()}
            </pre>
            <button 
              onClick={() => window.location.reload()}
              className="mt-6 px-6 py-2 bg-rose-500 text-white font-bold rounded-xl hover:bg-rose-600 transition-colors"
            >
              Restart Command Center
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

const DEFAULT_MAP = {
  nodes: [],
  edges: [],
};

function App() {
  const [mapData, setMapData] = useState(DEFAULT_MAP);
  const [ambulances, setAmbulances] = useState([]);
  const [logs, setLogs] = useState([]);
  const [riskData, setRiskData] = useState([]);
  const [routeSummary, setRouteSummary] = useState(null);
  const [statusMessage, setStatusMessage] = useState('Initializing Systems...');
  const [selectedLocation, setSelectedLocation] = useState(null);

  const loadAll = useCallback(async () => {
    try {
      const [mapResponse, ambulanceResponse, logResponse, riskResponse] = await Promise.all([
        fetchMap(),
        fetchAmbulances(),
        fetchLogs(),
        fetchRiskScores(),
      ]);

      setMapData(mapResponse);
      setAmbulances(ambulanceResponse);
      setLogs(logResponse);
      setRiskData(riskResponse);
      setStatusMessage('Operational');
    } catch (error) {
      console.error('Data Load Error:', error);
      setStatusMessage('Network Error - Retrying...');
    }
  }, []);

  const onSimulationComplete = useCallback(async () => {
    if (routeSummary?.ambulance) {
      try {
        await moveAmbulance({
          ambulance_id: routeSummary.ambulance.id,
          new_location: routeSummary.hospitalLocation,
        });
        setStatusMessage(`${routeSummary.ambulance.name} delivered the patient.`);
        setRouteSummary(null);
        await loadAll();
      } catch (err) {
        console.error('Mission update failed:', err);
      }
    }
  }, [routeSummary, loadAll]);

  const simulation = useSimulation(routeSummary, onSimulationComplete);

  useEffect(() => {
    loadAll();
    const interval = setInterval(loadAll, 5000);
    return () => clearInterval(interval);
  }, [loadAll]);

  const handleDispatch = useCallback(async (payload) => {
    setStatusMessage('Dispatching Unit...');
    
    const dispatchPayload = selectedLocation?.lat ? {
      lat: selectedLocation.lat,
      lon: selectedLocation.lon,
      severity: payload.severity
    } : payload;

    console.log('Initiating dispatch with payload:', dispatchPayload);

    try {
      const response = await dispatchAmbulance(dispatchPayload);
      console.log('Dispatch Response:', response);
      
      if (!response || !response.ambulance) {
        throw new Error('Invalid response from dispatch server');
      }

      setRouteSummary(response);
      setStatusMessage(`Dispatched ${response.ambulance.name}`);
      await loadAll();
    } catch (error) {
      console.error('Dispatch Error:', error);
      setStatusMessage(error?.response?.data?.detail || error?.message || 'Dispatch Failed');
    }
  }, [selectedLocation, loadAll]);

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-[#020617] text-slate-100 font-sans selection:bg-cyan-500/30">
        <nav className="sticky top-0 z-[1000] border-b border-slate-800/60 bg-slate-950/80 backdrop-blur-xl px-4 py-3">
          <div className="max-w-[1600px] mx-auto flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-cyan-500/10 rounded-xl border border-cyan-500/20">
                <Activity className="w-6 h-6 text-cyan-400" />
              </div>
              <div>
                <h1 className="text-xl font-bold tracking-tight text-white leading-none">ARES</h1>
                <p className="text-[10px] uppercase tracking-[0.2em] text-slate-500 mt-1 font-semibold">Ambulance Response System</p>
              </div>
            </div>
            
            <div className="hidden md:flex items-center gap-6">
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-900/50 border border-slate-800/50">
                <div className={`w-2 h-2 rounded-full ${statusMessage === 'Operational' ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]' : 'bg-amber-500 animate-pulse'}`} />
                <span className="text-xs font-medium text-slate-300 uppercase tracking-wider">{statusMessage}</span>
              </div>
              <div className="h-4 w-[1px] bg-slate-800" />
              <div className="text-xs font-medium text-slate-400 tabular-nums">
                {new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
              </div>
            </div>
          </div>
        </nav>

        <main className="max-w-[1600px] mx-auto p-4 lg:p-6 space-y-6">
          <div className="grid gap-6 xl:grid-cols-[1fr_400px]">
            <div className="space-y-6">
              <div className="grid gap-6 md:grid-cols-[380px_1fr]">
                <div className="space-y-6">
                  <section className="rounded-[2rem] border border-slate-800/60 bg-slate-900/40 p-6 backdrop-blur-sm shadow-2xl">
                    <div className="flex items-center gap-3 mb-6">
                      <Radio className="w-5 h-5 text-cyan-400" />
                      <h2 className="text-lg font-bold text-white">Quick Dispatch</h2>
                    </div>
                    <DispatchForm 
                      locations={mapData.nodes} 
                      onDispatch={handleDispatch}
                      selectedLocation={selectedLocation}
                      onLocationSelect={setSelectedLocation}
                    />
                  </section>

                  {routeSummary && (
                    <section className="rounded-[2rem] border border-slate-800/60 bg-slate-900/40 p-6 backdrop-blur-sm shadow-2xl">
                      <div className="flex items-center gap-3 mb-6">
                        <Clock className="w-5 h-5 text-cyan-400" />
                        <h2 className="text-lg font-bold text-white">Route Intelligence</h2>
                      </div>
                      <RoutePanel routeSummary={routeSummary} simulation={simulation} />
                    </section>
                  )}
                </div>

                <section className="rounded-[2rem] border border-slate-800/60 bg-white/5 overflow-hidden shadow-2xl relative">
                  <Map
                    mapData={mapData}
                    ambulances={ambulances}
                    routeToPatient={routeSummary?.routeToPatient}
                    routeToHospital={routeSummary?.routeToHospital}
                    ambulance={routeSummary?.ambulance}
                    patientLocation={routeSummary?.patientLocation}
                    hospitalLocation={routeSummary?.hospitalLocation}
                    currentLocation={simulation.currentLocation}
                    selectedLocation={selectedLocation}
                    onLocationSelect={setSelectedLocation}
                  />
                </section>
              </div>

              <div className="grid gap-6 md:grid-cols-2">
                <section className="rounded-[2rem] border border-slate-800/60 bg-slate-900/40 p-6 backdrop-blur-sm shadow-2xl">
                  <div className="flex items-center gap-3 mb-6">
                    <AlertTriangle className="w-5 h-5 text-amber-400" />
                    <h2 className="text-lg font-bold text-white">AI Risk Assessment</h2>
                  </div>
                  <HeatMap riskData={riskData} />
                </section>

                <section className="rounded-[2rem] border border-slate-800/60 bg-slate-900/40 p-6 backdrop-blur-sm shadow-2xl">
                  <div className="flex items-center gap-3 mb-6">
                    <History className="w-5 h-5 text-cyan-400" />
                    <h2 className="text-lg font-bold text-white">Operational Logs</h2>
                  </div>
                  <LogTable logs={logs} />
                </section>
              </div>
            </div>

            <aside className="space-y-6">
              <section className="rounded-[2rem] border border-slate-800/60 bg-slate-900/40 p-6 backdrop-blur-sm shadow-2xl h-full">
                <div className="flex items-center gap-3 mb-6">
                  <Shield className="w-5 h-5 text-emerald-400" />
                  <h2 className="text-lg font-bold text-white">Fleet Readiness</h2>
                </div>
                <Dashboard ambulances={ambulances} />
              </section>
            </aside>
          </div>
        </main>
      </div>
    </ErrorBoundary>
  );
}

export default App;
