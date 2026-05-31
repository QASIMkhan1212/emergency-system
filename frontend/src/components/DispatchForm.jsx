import { useMemo, useState, useEffect } from 'react';
import { MapPin, AlertCircle, Navigation2 } from 'lucide-react';
import { motion } from 'framer-motion';

function DispatchForm({ locations, onDispatch, selectedLocation, onLocationSelect }) {
  const [patientLocation, setPatientLocation] = useState('');
  const [severity, setSeverity] = useState('medium');

  useEffect(() => {
    if (selectedLocation) {
      // If it's the new object structure, use the id for the dropdown
      const locationName = typeof selectedLocation === 'object' ? selectedLocation.id : selectedLocation;
      setPatientLocation(locationName || '');
    }
  }, [selectedLocation]);

  const locationOptions = useMemo(() => {
    if (!locations || locations.length === 0) return [];
    return locations.map((location) => {
      if (typeof location === 'string') return location;
      if (location?.id) return location.id;
      if (location?.label) return location.label;
      return null;
    }).filter(Boolean);
  }, [locations]);

  const submit = (event) => {
    event.preventDefault();
    if (!patientLocation) return;
    onDispatch({ patient_location: patientLocation, severity });
  };

  const severities = [
    { id: 'low', label: 'Low', color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20' },
    { id: 'medium', label: 'Medium', color: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/20' },
    { id: 'high', label: 'High', color: 'text-rose-400', bg: 'bg-rose-500/10', border: 'border-rose-500/20' },
  ];

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <label className="block">
          <div className="flex items-center gap-2 mb-2 text-slate-400">
            <MapPin className="w-3.5 h-3.5" />
            <span className="text-[10px] uppercase font-bold tracking-widest">Incident Location</span>
          </div>
          <div className="relative group">
            <select
              value={patientLocation}
              onChange={(event) => {
                const value = event.target.value;
                setPatientLocation(value);
                onLocationSelect(value);
              }}
              className="w-full h-12 pl-4 pr-10 rounded-2xl border border-slate-700/60 bg-slate-800/20 text-sm text-white appearance-none outline-none focus:border-cyan-500/50 focus:ring-4 focus:ring-cyan-500/10 transition-all cursor-pointer"
            >
              <option value="" disabled className="bg-slate-900">Select Coordinate Node</option>
              {locationOptions.map((location) => (
                <option key={location} value={location} className="bg-slate-900">{location}</option>
              ))}
            </select>
            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500 group-hover:text-slate-300 transition-colors">
              <Navigation2 className="w-4 h-4 rotate-45" />
            </div>
          </div>
        </label>

        <div>
          <div className="flex items-center gap-2 mb-3 text-slate-400">
            <AlertCircle className="w-3.5 h-3.5" />
            <span className="text-[10px] uppercase font-bold tracking-widest">Triage Severity</span>
          </div>
          <div className="grid grid-cols-3 gap-3">
            {severities.map((s) => (
              <button
                key={s.id}
                type="button"
                onClick={() => setSeverity(s.id)}
                className={`relative px-3 py-3 rounded-2xl border transition-all text-xs font-bold uppercase tracking-tighter ${
                  severity === s.id 
                    ? `${s.bg} ${s.border} ${s.color} shadow-lg shadow-${s.id}-500/10 scale-[1.02]` 
                    : 'bg-slate-800/20 border-slate-800/40 text-slate-500 hover:border-slate-700/60'
                }`}
              >
                {s.label}
                {severity === s.id && (
                  <motion.div 
                    layoutId="severity-active"
                    className="absolute inset-0 rounded-2xl border-2 border-cyan-500/20"
                    transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
                  />
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      <button
        onClick={submit}
        disabled={!patientLocation || locationOptions.length === 0}
        className="w-full h-14 rounded-2xl bg-cyan-500 text-slate-950 font-bold text-sm uppercase tracking-widest transition-all hover:bg-cyan-400 hover:scale-[1.01] active:scale-95 disabled:opacity-30 disabled:grayscale disabled:cursor-not-allowed shadow-xl shadow-cyan-500/20 group"
      >
        <div className="flex items-center justify-center gap-2">
          <span>Initialize Dispatch</span>
          <Navigation2 className="w-4 h-4 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
        </div>
      </button>
    </div>
  );
}

export default DispatchForm;
