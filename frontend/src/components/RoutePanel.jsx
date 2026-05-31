import { MapPin, Navigation, Timer, Milestone, ArrowRight } from 'lucide-react';

function RoutePanel({ routeSummary, simulation }) {
  if (!routeSummary) {
    return (
      <div className="h-full flex items-center justify-center p-8 border border-dashed border-slate-800 rounded-3xl">
        <div className="text-center opacity-40">
          <Navigation className="w-8 h-8 mx-auto mb-3" />
          <p className="text-sm font-medium">Standing by for Dispatch Coordinates</p>
        </div>
      </div>
    );
  }

  const {
    ambulance = {},
    patientLocation = 'Unknown',
    hospitalLocation = 'Unknown',
    distanceToPatient = 0,
    distanceToHospital = 0,
    routeToPatient = [],
    routeToHospital = [],
  } = routeSummary;

  const safeFixed = (val) => (typeof val === 'number' ? val.toFixed(1) : '0.0');

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-800/20 border border-slate-700/30">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-cyan-500/10 rounded-xl">
            <Timer className="w-5 h-5 text-cyan-400" />
          </div>
          <div>
            <div className="text-[10px] uppercase font-bold text-slate-500 leading-none mb-1">Estimated Arrival</div>
            <div className="text-xl font-black text-white tabular-nums">{ambulance?.eta ?? '--:--'}</div>
          </div>
        </div>
        <div className="text-right">
          <div className="text-[10px] uppercase font-bold text-slate-500 leading-none mb-1">Status</div>
          <div className="text-xs font-bold text-cyan-400 uppercase tracking-wider">{simulation?.segment || 'In Transit'}</div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-4">
          <div className="flex items-center gap-2 px-1">
            <Milestone className="w-3.5 h-3.5 text-slate-500" />
            <span className="text-[10px] uppercase font-bold text-slate-500 tracking-widest">Navigation Path</span>
          </div>
          
          <div className="relative pl-4 space-y-6 border-l border-slate-800 ml-1.5">
            <div className="relative">
              <div className="absolute -left-[21px] top-1 w-2.5 h-2.5 rounded-full bg-slate-900 border-2 border-slate-700" />
              <div className="text-[10px] uppercase font-bold text-slate-500 mb-1">Base Origin</div>
              <div className="text-xs text-white font-medium">{ambulance?.location || 'Base'}</div>
            </div>
            <div className="relative">
              <div className="absolute -left-[21px] top-1 w-2.5 h-2.5 rounded-full bg-slate-900 border-2 border-cyan-500 shadow-[0_0_8px_rgba(6,182,212,0.4)]" />
              <div className="text-[10px] uppercase font-bold text-cyan-500/80 mb-1">Patient Intercept</div>
              <div className="text-xs text-white font-medium">{patientLocation}</div>
              <div className="mt-1 text-[10px] text-slate-500 italic">{safeFixed(distanceToPatient)} km transit</div>
            </div>
            <div className="relative">
              <div className="absolute -left-[21px] top-1 w-2.5 h-2.5 rounded-full bg-slate-900 border-2 border-emerald-500" />
              <div className="text-[10px] uppercase font-bold text-emerald-500/80 mb-1">Medical Center</div>
              <div className="text-xs text-white font-medium">{hospitalLocation}</div>
              <div className="mt-1 text-[10px] text-slate-500 italic">{safeFixed(distanceToHospital)} km transit</div>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-4">
           <div className="flex items-center gap-2 px-1">
            <MapPin className="w-3.5 h-3.5 text-slate-500" />
            <span className="text-[10px] uppercase font-bold text-slate-500 tracking-widest">Waypoint Chain</span>
          </div>
          <div className="p-4 rounded-2xl bg-slate-950/40 border border-slate-800/60 h-full">
            <div className="flex flex-wrap gap-1.5">
              {[...(routeToPatient || []), ...(routeToHospital?.slice(1) || [])].map((step, i, arr) => (
                <div key={i} className="flex items-center gap-1.5">
                  <span className="text-[10px] px-2 py-0.5 rounded-lg bg-slate-800 text-slate-400 font-medium">{step}</span>
                  {i < arr.length - 1 && (
                    <ArrowRight className="w-2.5 h-2.5 text-slate-700" />
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default RoutePanel;
