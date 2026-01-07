
import React from 'react';

interface LayoutProps {
  children: React.ReactNode;
  onRun?: () => void;
  onDownloadZip?: () => void;
  onGithubCommit?: () => void;
}

export const Layout: React.FC<LayoutProps> = ({ children, onRun, onDownloadZip, onGithubCommit }) => {
  return (
    <div className="flex flex-col h-screen bg-slate-950 text-slate-100">
      {/* Header */}
      <header className="h-14 border-b border-slate-800 flex items-center justify-between px-6 bg-slate-900/50 backdrop-blur-md z-50">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center font-bold text-xl shadow-lg shadow-blue-900/20">D</div>
          <div>
            <h1 className="font-bold text-lg leading-none">Dujão 22</h1>
            <span className="text-[10px] text-slate-400 uppercase tracking-widest font-black">Digital Solutions | João Layon</span>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="flex items-center bg-slate-800/50 rounded-lg p-1 border border-slate-700/50">
            <button 
              onClick={onDownloadZip}
              className="px-3 py-1.5 hover:bg-slate-700 rounded-md text-[10px] font-black uppercase tracking-wider transition-all flex items-center gap-2"
              title="Baixar Projeto (.ZIP)"
            >
              <span className="text-sm">📦</span>
              ZIP
            </button>
            <div className="w-px h-4 bg-slate-700 mx-1"></div>
            <button 
              onClick={onGithubCommit}
              className="px-3 py-1.5 hover:bg-slate-700 rounded-md text-[10px] font-black uppercase tracking-wider transition-all flex items-center gap-2 text-slate-300"
              title="Commit no GitHub"
            >
              <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24"><path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" /></svg>
              GITHUB
            </button>
          </div>

          <button 
            onClick={onRun}
            className="px-5 py-1.5 bg-emerald-600 hover:bg-emerald-500 rounded-lg text-xs font-black uppercase tracking-[0.2em] transition-all flex items-center gap-2 active:scale-95 shadow-xl shadow-emerald-900/30 border border-emerald-400/20"
          >
            <div className="w-2 h-2 rounded-full bg-white animate-pulse"></div>
            RUN
          </button>
          
          <div className="flex items-center gap-2 border-l border-slate-800 pl-4 ml-2">
             <div className="w-9 h-9 rounded-xl bg-slate-800 flex items-center justify-center text-[10px] font-black border border-slate-700 shadow-inner group cursor-pointer hover:border-blue-500/50 transition-all">
               <span className="group-hover:text-blue-400">JL</span>
             </div>
          </div>
        </div>
      </header>
      
      {/* Content Area */}
      <main className="flex-1 flex overflow-hidden relative">
        {children}
      </main>
    </div>
  );
};
