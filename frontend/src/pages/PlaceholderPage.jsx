import React from 'react';
import { Construction, Sparkles, ArrowLeft } from 'lucide-react';
import Button from '../components/ui/Button';

export function PlaceholderPage({ title, description, onBackToDashboard }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] p-6 text-center space-y-6">
      <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-indigo-600 to-violet-600 p-0.5 shadow-xl shadow-indigo-500/20 flex items-center justify-center">
        <div className="w-full h-full bg-[#0F1623] rounded-[14px] flex items-center justify-center">
          <Construction className="w-8 h-8 text-indigo-400" />
        </div>
      </div>

      <div className="max-w-md space-y-2">
        <span className="text-xs font-semibold uppercase tracking-wider px-3 py-1 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 inline-block">
          Phase 1 Layout Placeholder
        </span>
        <h2 className="text-2xl font-bold text-slate-100">{title}</h2>
        <p className="text-sm text-slate-400 leading-relaxed">
          {description || `The ${title} module layout is prepared. Business logic and backend API integration will be enabled in Phase 2.`}
        </p>
      </div>

      <div className="flex items-center gap-3 pt-2">
        <Button
          variant="secondary"
          size="md"
          icon={ArrowLeft}
          onClick={onBackToDashboard}
        >
          Return to Dashboard
        </Button>
      </div>
    </div>
  );
}

export default PlaceholderPage;
