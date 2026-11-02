import React, { useEffect } from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

/**
 * Reusable Toast notification popup.
 */
export function Toast({ message, type = 'info', onClose, duration = 4000 }) {
  useEffect(() => {
    if (duration) {
      const timer = setTimeout(() => {
        onClose?.();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [duration, onClose]);

  const icons = {
    success: CheckCircle2,
    error: AlertCircle,
    info: Info,
  };

  const colors = {
    success: 'border-emerald-500/40 text-emerald-300 bg-emerald-950/60',
    error: 'border-rose-500/40 text-rose-300 bg-rose-950/60',
    info: 'border-indigo-500/40 text-indigo-300 bg-indigo-950/60',
  };

  const Icon = icons[type] || Info;

  return (
    <div className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 px-4 py-3 rounded-xl border backdrop-blur-md shadow-xl ${colors[type]} transition-all duration-300`}>
      <Icon className="w-5 h-5 shrink-0" />
      <span className="text-sm font-medium text-slate-100">{message}</span>
      <button 
        onClick={onClose} 
        className="ml-2 text-slate-400 hover:text-white p-0.5 rounded-md hover:bg-white/10 transition-colors"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}

export default Toast;
