import React from 'react';

export function Footer() {
  return (
    <footer className="py-4 px-6 border-t border-slate-800/60 bg-[#0B0F17]/90 text-center text-xs text-slate-400">
      <div className="flex items-center justify-center gap-2">
        <span>IBOA</span>
        <span>•</span>
        <span>Intelligent Business Operating Assistant</span>
        <span>•</span>
        <span className="text-slate-400 font-medium">Version 1.0</span>
      </div>
    </footer>
  );
}

export default Footer;
