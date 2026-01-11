
import React, { useRef, useEffect } from 'react';

interface Log {
  type: 'info' | 'error' | 'success' | 'system';
  message: string;
}

interface TerminalProps {
  logs: Log[];
  onAutoFix: () => void;
  isFixing: boolean;
}

export const Terminal: React.FC<TerminalProps> = ({ logs, onAutoFix, isFixing }) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const hasError = logs.some(l => l.type === 'error');

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [logs]);

  return (
    <div className="h-44 bg-[#020617] border-t border-slate-800 flex flex-col font-mono text-[10px] overflow-hidden">
      <div className="flex items-center justify-between px-6 h-9 border-b border-slate-800 bg-[#0f172a]/50 backdrop-blur-md">
        <div className="flex items-center gap-4">
          <span className="text-slate-500 font-black uppercase tracking-[0.2em] text-[8px]">Dujão OS Shell</span>
          <div className="flex items-center gap-2">
             <div className={`w-1.5 h-1.5 rounded-full ${hasError ? 'bg-red-500 animate-pulse' : 'bg-emerald-500'}`}></div>
             <span className="text-slate-600 text-[8px] uppercase font-bold tracking-tighter">Container: Node-22.x</span>
          </div>
        </div>
        
        {hasError && (
          <button 
            onClick={onAutoFix}
            disabled={isFixing}
            className={`flex items-center gap-2 px-4 py-1 rounded-lg text-[9px] font-black uppercase transition-all transform active:scale-95 ${
              isFixing ? 'bg-slate-800 text-slate-500 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-500 text-white shadow-[0_0_20px_rgba(37,99,235,0.4)]'
            }`}
          >
            {isFixing ? (
              <><div className="w-3 h-3 border-2 border-white/20 border-t-white rounded-full animate-spin"></div> REPARANDO...</>
            ) : (
              '🔧 FIX WITH DUJÃO AI'
            )}
          </button>
        )}
      </div>
      
      <div ref={scrollRef} className="flex-1 p-4 overflow-y-auto space-y-1 custom-scrollbar bg-[#020617] scroll-smooth">
        {logs.length === 0 && (
          <div className="text-slate-700 italic opacity-50"># Terminal ocioso. Aguardando instrução de boot...</div>
        )}
        {logs.map((log, i) => (
          <div key={i} className={`flex gap-3 p-1 rounded transition-colors ${log.type === 'error' ? 'bg-red-500/5' : ''}`}>
            <span className={`shrink-0 font-bold w-12 text-right ${
              log.type === 'error' ? 'text-red-500' : 
              log.type === 'success' ? 'text-emerald-500' : 
              log.type === 'system' ? 'text-slate-600' :
              'text-blue-500'
            }`}>
              {log.type === 'error' ? '[FATAL]' : 
               log.type === 'success' ? '[OK]' : 
               log.type === 'system' ? '[SYS]' : '[LOG]'}
            </span>
            <span className={`leading-relaxed tracking-tight ${
              log.type === 'error' ? 'text-red-400 font-bold' : 
              log.type === 'system' ? 'text-slate-500' :
              'text-slate-300'
            }`}>
              {log.message}
            </span>
          </div>
        ))}
        {isFixing && (
          <div className="flex gap-3 text-blue-400 italic animate-pulse p-1">
            <span className="w-12 text-right font-black">AI_CORE</span>
            <span>Auditoria em progresso... Injetando correções estruturais na memória do container...</span>
          </div>
        )}
        <div className="h-6"></div>
      </div>
    </div>
  );
};
