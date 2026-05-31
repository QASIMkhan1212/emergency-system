import { motion } from 'framer-motion';
import { History, MapPin, Ambulance, Landmark } from 'lucide-react';

function LogTable({ logs }) {
  return (
    <div className="space-y-4 h-[400px] flex flex-col">
      <div className="flex-1 overflow-y-auto custom-scrollbar pr-2">
        <div className="space-y-3">
          {logs?.slice(0, 10).map((log, i) => (
            <motion.div 
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
              key={log.id} 
              className="flex items-center gap-4 p-4 rounded-2xl border border-slate-800/40 bg-slate-800/10 hover:bg-slate-800/20 transition-all group"
            >
              <div className="flex flex-col items-center justify-center h-10 w-10 rounded-xl bg-slate-900 border border-slate-800 text-[10px] font-bold text-slate-500 tabular-nums leading-none">
                <span>{new Date(log.timestamp).getHours()}:{String(new Date(log.timestamp).getMinutes()).padStart(2, '0')}</span>
                <span className="text-[8px] uppercase mt-0.5 opacity-60">PST</span>
              </div>

              <div className="flex-1 grid grid-cols-3 gap-4">
                <div className="flex flex-col">
                  <span className="text-[10px] uppercase font-bold text-slate-500 tracking-tight flex items-center gap-1">
                    <MapPin className="w-2.5 h-2.5" /> Incident
                  </span>
                  <span className="text-xs text-white font-medium truncate">{log.patient_location}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-[10px] uppercase font-bold text-slate-500 tracking-tight flex items-center gap-1">
                    <Ambulance className="w-2.5 h-2.5" /> Assigned
                  </span>
                  <span className="text-xs text-cyan-400 font-bold truncate">{log.ambulance_name}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-[10px] uppercase font-bold text-slate-500 tracking-tight flex items-center gap-1">
                    <Landmark className="w-2.5 h-2.5" /> Destination
                  </span>
                  <span className="text-xs text-emerald-400 font-medium truncate">{log.hospital_location}</span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default LogTable;
