
import React, { useRef, useEffect } from 'react';

interface Log {
  type: 'info' | 'error' | 'success';
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
    <div className="h-48 border-t border-slate-800 bg-slate-900/80 flex flex-col font-mono text-xs">
      <div className="flex items-center justify-between px-4 h-8 border-b border-slate-800 bg-slate-900">
        <div className="flex items-center gap-4">
          <span className="text-slate-400 font-bold uppercase tracking-wider text-[10px]">Console</span>
          <span className="text-slate-600 text-[10px]">Dujão Engine Logs</span>
        </div>
        
        {hasError && (
          <button 
            onClick={onAutoFix}
            disabled={isFixing}
            className={`flex items-center gap-2 px-2 py-0.5 rounded text-[10px] font-bold uppercase transition-all ${
              isFixing ? 'bg-slate-800 text-slate-500' : 'bg-blue-600 hover:bg-blue-500 text-white animate-pulse'
            }`}
          >
            {isFixing ? (
              <>
                <div className="w-2 h-2 border-2 border-slate-400 border-t-transparent rounded-full animate-spin"></div>
                Corrigindo...
              </>
            ) : (
              <>
                <span className="text-xs">🔧</span>
                Corrigir com Dujão AI
              </>
            )}
          </button>
        )}
      </div>
      
      <div ref={scrollRef} className="flex-1 p-4 overflow-y-auto space-y-1">
        {logs.length === 0 && (
          <div className="text-slate-600 italic">Aguardando execução (Clique em RUN)...</div>
        )}
        {logs.map((log, i) => (
          <div key={i} className="flex gap-2">
            <span className={`font-bold ${
              log.type === 'error' ? 'text-red-500' : 
              log.type === 'success' ? 'text-green-500' : 
              'text-blue-500'
            }`}>
              [{log.type.toUpperCase()}]
            </span>
            <span className={log.type === 'error' ? 'text-red-400' : 'text-slate-300'}>
              {log.message}
            </span>
          </div>
        ))}
        {isFixing && (
          <div className="flex gap-2 text-blue-400 italic animate-pulse">
            <span>[AI]</span>
            <span>O Agente está reescrevendo os arquivos problemáticos...</span>
          </div>
        )}
        <div className="h-4"></div>
      </div>
    </div>
  );
};
