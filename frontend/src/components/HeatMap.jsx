import { motion } from 'framer-motion';
import { Activity, ShieldAlert, ShieldCheck, Shield } from 'lucide-react';

function HeatMap({ riskData }) {
  if (!riskData || riskData.length === 0) {
    return (
      <div className="h-[400px] flex items-center justify-center border border-dashed border-slate-800 rounded-3xl">
        <div className="text-center">
          <Activity className="w-8 h-8 text-slate-700 mx-auto mb-3 animate-pulse" />
          <p className="text-sm text-slate-500 font-medium">Aggregating Risk Data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 h-[400px] flex flex-col">
      <div className="flex-1 overflow-y-auto custom-scrollbar pr-2">
        <div className="grid grid-cols-2 gap-3">
          {riskData.map((item, i) => {
            const score = item.score ?? 0;
            const isHigh = score > 0.75;
            const isMed = score > 0.45;
            
            const color = isHigh ? 'text-rose-400' : isMed ? 'text-amber-400' : 'text-emerald-400';
            const bg = isHigh ? 'bg-rose-500/10' : isMed ? 'bg-amber-500/10' : 'bg-emerald-500/10';
            const border = isHigh ? 'border-rose-500/20' : isMed ? 'border-amber-500/20' : 'border-emerald-500/20';

            return (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.03 }}
                key={item.location} 
                className={`rounded-2xl border ${border} ${bg} p-4 transition-all hover:scale-[1.02]`}
              >
                <div className="flex items-center justify-between mb-3">
                  {isHigh ? (
                    <ShieldAlert className={`w-4 h-4 ${color}`} />
                  ) : isMed ? (
                    <Shield className={`w-4 h-4 ${color}`} />
                  ) : (
                    <ShieldCheck className={`w-4 h-4 ${color}`} />
                  )}
                  <span className={`text-[10px] font-black uppercase tracking-tighter tabular-nums ${color}`}>
                    {Math.round(score * 100)}%
                  </span>
                </div>
                <div className="text-[11px] font-bold text-white truncate uppercase tracking-tight">{item.location}</div>
                <div className="mt-1 w-full h-1 bg-slate-950/50 rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${score * 100}%` }}
                    className={`h-full ${isHigh ? 'bg-rose-500' : isMed ? 'bg-amber-500' : 'bg-emerald-500'}`}
                  />
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default HeatMap;
