import React, { useState } from 'react';
import { Sparkles, Mic, Send, Bot, Terminal, RefreshCw } from 'lucide-react';
import Button from '../ui/Button';

export function AIAssistantPanel({ onAskAi, isLoading }) {
  const [query, setQuery] = useState('');
  const [isListening, setIsListening] = useState(false);

  const suggestedPrompts = [
    "Show today's sales",
    "Which products are low in stock?",
    "Show ABC Technologies' invoices",
    "Summarize this month's expenses",
  ];

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!query.trim() || isLoading) return;
    onAskAi?.(query);
  };

  const handleChipClick = (prompt) => {
    setQuery(prompt);
    if (!isLoading) {
      onAskAi?.(prompt);
    }
  };

  const toggleMic = () => {
    setIsListening(!isListening);
  };

  return (
    <div className="relative overflow-hidden bg-gradient-to-b from-[#131B2E]/90 via-[#0F1626]/90 to-[#0C111C]/90 backdrop-blur-xl border border-violet-500/30 rounded-2xl p-6 shadow-2xl shadow-violet-950/40">
      {/* Decorative background glow */}
      <div className="absolute top-0 right-0 -mt-8 -mr-8 w-64 h-64 bg-violet-600/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 -mb-8 -ml-8 w-64 h-64 bg-indigo-600/15 rounded-full blur-3xl pointer-events-none" />

      {/* Header section */}
      <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-800/80">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-violet-600 via-indigo-600 to-purple-500 p-0.5 shadow-lg shadow-violet-500/30 shrink-0 flex items-center justify-center">
            <div className="w-full h-full bg-[#0E1422] rounded-[14px] flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-violet-400 animate-pulse" />
            </div>
          </div>
          <div>
            <h2 className="text-xl font-bold bg-gradient-to-r from-white via-slate-100 to-violet-200 bg-clip-text text-transparent">
              How can I help you today?
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Ask IBOA to analyze your business in English or Hindi/Hinglish (Local Ollama gemma3:1b).
            </p>
          </div>
        </div>

        {/* Status indicator */}
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold self-start md:self-auto">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
          <span>{isLoading ? 'Processing...' : 'Ready • IBOA Local AI'}</span>
        </div>
      </div>

      {/* Main AI Input Form */}
      <form onSubmit={handleSubmit} className="relative z-10 mt-6">
        <div className="relative flex items-center">
          <div className="absolute left-4 text-violet-400">
            {isLoading ? (
              <RefreshCw className="w-5 h-5 animate-spin text-violet-400" />
            ) : (
              <Bot className="w-5 h-5" />
            )}
          </div>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            disabled={isLoading}
            placeholder="Ask IBOA anything (e.g. 'Aaj ki sales kitni hai?', 'Which products are low in stock?')..."
            className="w-full h-14 pl-12 pr-28 rounded-2xl bg-slate-900/90 border border-violet-500/30 text-slate-100 placeholder-slate-400 text-sm focus:outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-500/30 transition-all duration-300 shadow-inner disabled:opacity-60"
          />

          <div className="absolute right-3 flex items-center gap-2">
            <button
              type="button"
              onClick={toggleMic}
              className={`p-2.5 rounded-xl transition-all duration-200 ${
                isListening 
                  ? 'bg-rose-500/20 text-rose-400 border border-rose-500/40 animate-pulse' 
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              }`}
              title={isListening ? 'Stop listening' : 'Voice search'}
            >
              <Mic className="w-4 h-4" />
            </button>

            <Button
              type="submit"
              variant="ai"
              size="sm"
              icon={Send}
              isLoading={isLoading}
              className="rounded-xl font-semibold"
            >
              Ask
            </Button>
          </div>
        </div>
      </form>

      {/* Suggested prompts list */}
      <div className="relative z-10 mt-4 flex flex-wrap items-center gap-2">
        <span className="text-xs font-medium text-slate-400 mr-1 flex items-center gap-1">
          <Terminal className="w-3.5 h-3.5 text-violet-400" />
          Suggested:
        </span>
        {suggestedPrompts.map((prompt, idx) => (
          <button
            key={idx}
            type="button"
            disabled={isLoading}
            onClick={() => handleChipClick(prompt)}
            className="text-xs px-3 py-1.5 rounded-xl bg-slate-800/60 hover:bg-violet-950/40 text-slate-300 hover:text-violet-200 border border-slate-700/60 hover:border-violet-500/40 transition-all duration-200 disabled:opacity-50"
          >
            "{prompt}"
          </button>
        ))}
      </div>
    </div>
  );
}

export default AIAssistantPanel;
