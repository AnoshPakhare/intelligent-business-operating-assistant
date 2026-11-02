import React from 'react';
import { TrendingUp, Receipt, FileText, Users, ArrowUpRight, ArrowDownRight } from 'lucide-react';

const iconMap = {
  TrendingUp,
  Receipt,
  FileText,
  Users
};

export function KPICard({ title, value, change, isPositive, period, iconName, accentColor = 'indigo' }) {
  const Icon = iconMap[iconName] || TrendingUp;

  const accentStyles = {
    indigo: {
      border: 'hover:border-indigo-500/50',
      glow: 'from-indigo-500/10 to-transparent',
      iconBg: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20',
      bar: 'bg-indigo-500'
    },
    rose: {
      border: 'hover:border-rose-500/50',
      glow: 'from-rose-500/10 to-transparent',
      iconBg: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
      bar: 'bg-rose-500'
    },
    violet: {
      border: 'hover:border-violet-500/50',
      glow: 'from-violet-500/10 to-transparent',
      iconBg: 'bg-violet-500/10 text-violet-400 border-violet-500/20',
      bar: 'bg-violet-500'
    },
    cyan: {
      border: 'hover:border-cyan-500/50',
      glow: 'from-cyan-500/10 to-transparent',
      iconBg: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20',
      bar: 'bg-cyan-500'
    }
  };

  const currentAccent = accentStyles[accentColor] || accentStyles.indigo;

  return (
    <div className={`relative overflow-hidden bg-slate-900/60 backdrop-blur-md border border-slate-800/80 rounded-2xl p-5 shadow-card ${currentAccent.border} transition-all duration-300 group`}>
      {/* Background soft glow gradient */}
      <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl ${currentAccent.glow} rounded-bl-full pointer-events-none opacity-50 group-hover:opacity-100 transition-opacity duration-300`} />
      
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{title}</p>
          <h3 className="text-2xl font-extrabold text-slate-100 tracking-tight">{value}</h3>
        </div>

        <div className={`p-2.5 rounded-xl border ${currentAccent.iconBg} shadow-inner shrink-0 group-hover:scale-110 transition-transform duration-300`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>

      <div className="mt-4 pt-3 border-t border-slate-800/60 flex items-center justify-between text-xs">
        <div className="flex items-center gap-1 font-semibold">
          {isPositive ? (
            <span className="inline-flex items-center text-emerald-400">
              <ArrowUpRight className="w-3.5 h-3.5 mr-0.5" />
              {change}
            </span>
          ) : (
            <span className="inline-flex items-center text-rose-400">
              <ArrowDownRight className="w-3.5 h-3.5 mr-0.5" />
              {change}
            </span>
          )}
          <span className="text-slate-400 font-normal">{period}</span>
        </div>

        <div className="w-12 h-1 bg-slate-800 rounded-full overflow-hidden">
          <div className={`h-full ${currentAccent.bar} w-3/4 rounded-full`} />
        </div>
      </div>
    </div>
  );
}

export default KPICard;
