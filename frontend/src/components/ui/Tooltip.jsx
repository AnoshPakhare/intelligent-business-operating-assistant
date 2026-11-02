import React, { useState } from 'react';

/**
 * Reusable Tooltip component for collapsed sidebar items & buttons.
 */
export function Tooltip({ children, text, position = 'right', disabled = false }) {
  const [isVisible, setIsVisible] = useState(false);

  if (disabled || !text) return <>{children}</>;

  const positionClasses = {
    right: 'left-full ml-3 top-1/2 -translate-y-1/2',
    left: 'right-full mr-3 top-1/2 -translate-y-1/2',
    top: 'bottom-full mb-3 left-1/2 -translate-x-1/2',
    bottom: 'top-full mt-3 left-1/2 -translate-x-1/2',
  };

  const arrowClasses = {
    right: '-left-1 top-1/2 -translate-y-1/2 border-r-slate-800 border-t-transparent border-b-transparent border-l-transparent',
    left: '-right-1 top-1/2 -translate-y-1/2 border-l-slate-800 border-t-transparent border-b-transparent border-r-transparent',
    top: '-bottom-1 left-1/2 -translate-x-1/2 border-t-slate-800 border-l-transparent border-r-transparent border-b-transparent',
    bottom: '-top-1 left-1/2 -translate-x-1/2 border-b-slate-800 border-l-transparent border-r-transparent border-t-transparent',
  };

  return (
    <div 
      className="relative inline-flex items-center"
      onMouseEnter={() => setIsVisible(true)}
      onMouseLeave={() => setIsVisible(false)}
    >
      {children}
      {isVisible && (
        <div className={`absolute z-50 pointer-events-none whitespace-nowrap ${positionClasses[position]}`}>
          <div className="bg-slate-900 text-slate-100 text-xs px-2.5 py-1.5 rounded-md border border-slate-700/80 shadow-lg font-medium">
            {text}
          </div>
          <div className={`absolute w-0 h-0 border-4 ${arrowClasses[position]}`} />
        </div>
      )}
    </div>
  );
}

export default Tooltip;
