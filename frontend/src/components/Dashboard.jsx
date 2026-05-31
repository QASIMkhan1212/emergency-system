import { motion } from 'framer-motion';
import { Truck, MapPin, ChevronRight, CheckCircle2, XCircle } from 'lucide-react';

function Dashboard({ ambulances }) {
  const availableCount = ambulances.filter((item) => item.status === 'available').length;
  const busyCount = ambulances.filter((item) => item.status !== 'available').length;

  return (
    <div className="h-full flex flex-col">
      <div className="grid grid-cols-2 gap-4 mb-8">
        <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-3xl p-4">
          <div className="flex items-center gap-2 text-emerald-400 mb-2">
            <CheckCircle2 className="w-4 h-4" />
            <span className="text-[10px] uppercase tracking-widest font-bold">Available</span>
          </div>
          <div className="text-3xl font-bold text-white tabular-nums">{availableCount}</div>
        </div>
        <div className="bg-rose-500/10 border border-rose-500/20 rounded-3xl p-4">
          <div className="flex items-center gap-2 text-rose-400 mb-2">
            <XCircle className="w-4 h-4" />
            <span className="text-[10px] uppercase tracking-widest font-bold">Busy</span>
          </div>
          <div className="text-3xl font-bold text-white tabular-nums">{busyCount}</div>
        </div>
      </div>

      <div className="flex-1 space-y-3 overflow-y-auto pr-2 custom-scrollbar">
        {ambulances.map((ambulance, i) => (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            key={ambulance.id} 
            className="group relative rounded-2xl border border-slate-800/40 bg-slate-800/20 p-4 transition-all hover:bg-slate-800/40 hover:border-slate-700/60"
          >
            <div className="flex items-start justify-between">
              <div className="flex gap-3">
                <div className={`p-2 rounded-xl ${ambulance.status === 'available' ? 'bg-emerald-500/10' : 'bg-rose-500/10'}`}>
                  <Truck className={`w-5 h-5 ${ambulance.status === 'available' ? 'text-emerald-400' : 'text-rose-400'}`} />
                </div>
                <div>
                  <h3 className="font-bold text-white leading-tight">{ambulance.name}</h3>
                  <div className="flex items-center gap-1 mt-1 text-slate-400">
                    <MapPin className="w-3 h-3" />
                    <span className="text-xs">{ambulance.location}</span>
                  </div>
                </div>
              </div>
              <div className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-tighter ${
                ambulance.status === 'available' 
                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                  : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
              }`}>
                {ambulance.status}
              </div>
            </div>
            
            <div className="mt-4 flex items-center justify-between">
              <div className="flex flex-col">
                <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Unit ID</span>
                <span className="text-xs text-slate-300 font-medium">{ambulance.id}</span>
              </div>
              <div className="flex flex-col items-end">
                <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Arrival Time</span>
                <span className={`text-xs font-bold tabular-nums ${ambulance.status === 'available' ? 'text-slate-400' : 'text-cyan-400'}`}>
                  {ambulance.eta ?? '00:00'}
                </span>
              </div>
            </div>

            <div className="absolute top-1/2 -right-1 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
              <ChevronRight className="w-4 h-4 text-slate-600" />
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

export default Dashboard;
