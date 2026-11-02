import React from 'react';
import ReactMarkdown from 'react-markdown';
import { Sparkles, Bot, AlertTriangle, Cpu } from 'lucide-react';
import Badge from '../ui/Badge';

export function AIResultCard({ aiData, onClose }) {
  if (!aiData) return null;

  const { response, tool_used, data, status, error_detail } = aiData;
  const isError = status === 'error';

  // Normalize Unicode bullets to markdown dashes so ReactMarkdown renders them as proper bullet lists
  const formattedContent = (response || '')
    .replace(/^[ \t]*[•●○][ \t]*/gm, '- ');

  return (
    <div className={`relative overflow-hidden backdrop-blur-md border rounded-2xl p-5 shadow-xl transition-all duration-300 ${
      isError 
        ? 'bg-rose-950/20 border-rose-500/30' 
        : 'bg-violet-950/20 border-violet-500/30'
    }`}>
      {/* Glow highlight */}
      <div className={`absolute top-0 right-0 -mt-8 -mr-8 w-48 h-48 rounded-full blur-2xl pointer-events-none ${
        isError ? 'bg-rose-600/10' : 'bg-violet-600/15'
      }`} />

      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-xl border flex items-center justify-center shrink-0 ${
            isError 
              ? 'bg-rose-500/10 border-rose-500/30 text-rose-400' 
              : 'bg-violet-500/10 border-violet-500/30 text-violet-400'
          }`}>
            {isError ? <AlertTriangle className="w-5 h-5" /> : <Bot className="w-5 h-5" />}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h4 className={`text-base font-bold ${isError ? 'text-rose-300' : 'text-violet-200'}`}>
                {isError ? 'AI Assistant Warning' : 'IBOA AI Insight'}
              </h4>
              {tool_used && (
                <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded-full bg-violet-500/20 text-violet-300 border border-violet-500/30 flex items-center gap-1">
                  <Cpu className="w-3 h-3" />
                  Tool: {tool_used}
                </span>
              )}
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Powered by local Ollama model (gemma3:1b) &amp; PostgreSQL DB
            </p>
          </div>
        </div>
      </div>

      {/* Response Message Body with Markdown Rendering */}
      <div className="mt-4 p-4 rounded-xl bg-slate-900/80 border border-slate-800 text-slate-200 text-xs leading-relaxed font-sans ai-markdown-body">
        <ReactMarkdown
          skipHtml={true}
          components={{
            h1: ({children}) => <h1 className="text-base font-bold text-violet-200 mt-3 mb-2">{children}</h1>,
            h2: ({children}) => <h2 className="text-sm font-bold text-violet-200 mt-3 mb-1.5">{children}</h2>,
            h3: ({children}) => <h3 className="text-xs font-bold text-violet-300 mt-2 mb-1">{children}</h3>,
            p: ({children}) => <p className="mb-2 last:mb-0 leading-relaxed whitespace-pre-line">{children}</p>,
            strong: ({children}) => <strong className="font-bold text-slate-100">{children}</strong>,
            em: ({children}) => <em className="italic text-slate-300">{children}</em>,
            ul: ({children}) => <ul className="list-disc list-inside mb-2 space-y-1 pl-1 text-slate-200">{children}</ul>,
            ol: ({children}) => <ol className="list-decimal list-inside mb-2 space-y-1 pl-1 text-slate-200">{children}</ol>,
            li: ({children}) => <li className="text-slate-200 leading-relaxed">{children}</li>,
            a: ({href, children}) => <span className="text-violet-400 underline">{children}</span>,
            code: ({children}) => <code className="px-1.5 py-0.5 rounded bg-slate-800 text-violet-300 text-[11px] font-mono">{children}</code>,
            hr: () => <hr className="border-slate-800 my-3" />,
            blockquote: ({children}) => <blockquote className="border-l-2 border-violet-500/40 pl-3 my-2 text-slate-300 italic">{children}</blockquote>,
          }}
        >
          {formattedContent}
        </ReactMarkdown>
      </div>

      {/* Data Limitation Notice if applicable */}
      {data && data.limitation_note && (
        <div className="mt-3 p-3 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-300 text-[11px] flex items-start gap-2">
          <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-amber-400" />
          <div>
            <strong className="block font-semibold">Data Limitation Notice:</strong>
            <span>{data.limitation_note}</span>
          </div>
        </div>
      )}
    </div>
  );
}

export default AIResultCard;
