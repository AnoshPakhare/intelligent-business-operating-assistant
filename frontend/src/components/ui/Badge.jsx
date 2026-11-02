import React from 'react';

/**
 * Reusable Badge component for statuses, tags, and KPI pills.
 */
export function Badge({
  children,
  variant = 'default',
  size = 'md',
  className = '',
  dot = false,
}) {
  const baseStyles = 'inline-flex items-center font-medium rounded-full transition-colors select-none';

  const variants = {
    default: 'bg-slate-800/80 text-slate-300 border border-slate-700/60',
    created: 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shadow-sm shadow-emerald-500/5',
    cancelled: 'bg-rose-500/10 text-rose-400 border border-rose-500/20 shadow-sm shadow-rose-500/5',
    critical: 'bg-red-500/15 text-red-400 border border-red-500/30 animate-pulse',
    low: 'bg-amber-500/15 text-amber-400 border border-amber-500/30',
    indigo: 'bg-indigo-500/10 text-indigo-300 border border-indigo-500/30',
    ai: 'bg-gradient-to-r from-indigo-500/20 to-violet-500/20 text-violet-300 border border-violet-500/30 shadow-sm shadow-violet-500/10'
  };

  const dotColors = {
    default: 'bg-slate-400',
    created: 'bg-emerald-400',
    cancelled: 'bg-rose-400',
    critical: 'bg-red-400',
    low: 'bg-amber-400',
    indigo: 'bg-indigo-400',
    ai: 'bg-violet-400'
  };

  const sizes = {
    sm: 'text-[10px] px-2 py-0.5 gap-1',
    md: 'text-xs px-2.5 py-1 gap-1.5',
    lg: 'text-sm px-3 py-1 gap-2'
  };

  return (
    <span className={`${baseStyles} ${variants[variant] || variants.default} ${sizes[size]} ${className}`}>
      {dot && <span className={`w-1.5 h-1.5 rounded-full ${dotColors[variant] || dotColors.default}`} />}
      {children}
    </span>
  );
}

export default Badge;
