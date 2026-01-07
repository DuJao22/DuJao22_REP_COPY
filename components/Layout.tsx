
import React, { useState } from 'react';

interface LayoutProps {
  children: React.ReactNode;
  onRun?: () => void;
  onDownloadZip?: () => void;
  onGithubCommit?: () => void;
  onVercelDeploy?: () => void;
}

export const Layout: React.FC<LayoutProps> = ({ children, onRun, onDownloadZip, onGithubCommit, onVercelDeploy }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <div className="flex flex-col h-screen bg-slate-950 text-slate-100 overflow-hidden">
      {/* Header Responsivo */}
      <header className="h-14 lg:h-16 border-b border-slate-800 flex items-center justify-between px-4 lg:px-6 bg-slate-900/80 backdrop-blur-md z-[100] sticky top-0">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 lg:w-9 lg:h-9 bg-blue-600 rounded-lg flex items-center justify-center font-bold text-lg lg:text-xl shadow-lg shadow-blue-900/20">D</div>
          <div className="hidden sm:block">
            <h1 className="font-bold text-sm lg:text-base leading-none">Dujão 22</h1>
            <span className="text-[9px] text-slate-400 uppercase tracking-widest font-black">Digital Solutions</span>
          </div>
        </div>
        
        {/* Desktop Controls */}
        <div className="hidden md:flex items-center gap-3">
          <div className="flex items-center bg-slate-800/50 rounded-lg p-1 border border-slate-700/50">
            <button onClick={onDownloadZip} className="px-3 py-1.5 hover:bg-slate-700 rounded-md text-[10px] font-black uppercase tracking-wider transition-all">ZIP</button>
            <div className="w-px h-4 bg-slate-700 mx-1"></div>
            <button onClick={onGithubCommit} className="px-3 py-1.5 hover:bg-slate-700 rounded-md text-[10px] font-black uppercase tracking-wider transition-all">GITHUB</button>
            <div className="w-px h-4 bg-slate-700 mx-1"></div>
            <button onClick={onVercelDeploy} className="px-3 py-1.5 hover:bg-slate-700 rounded-md text-[10px] font-black uppercase tracking-wider transition-all">VERCEL</button>
          </div>
          <button onClick={onRun} className="px-5 py-1.5 bg-emerald-600 hover:bg-emerald-500 rounded-lg text-xs font-black uppercase tracking-[0.2em] transition-all flex items-center gap-2 active:scale-95 shadow-xl shadow-emerald-900/30">RUN</button>
        </div>

        {/* Mobile Menu Toggle */}
        <div className="flex md:hidden items-center gap-2">
           <button onClick={onRun} className="p-2 bg-emerald-600 rounded-lg shadow-lg active:scale-90">
             <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" /></svg>
           </button>
           <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="p-2 bg-slate-800 rounded-lg text-slate-300">
             <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={isMenuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} /></svg>
           </button>
        </div>
      </header>

      {/* Mobile Drawer Overlay */}
      {isMenuOpen && (
        <div className="md:hidden fixed inset-0 z-[150] bg-slate-950/90 backdrop-blur-xl animate-in fade-in duration-300">
          <div className="flex flex-col h-full p-8 pt-20 gap-4">
            <button onClick={() => { onDownloadZip?.(); setIsMenuOpen(false); }} className="w-full p-4 bg-slate-900 border border-slate-800 rounded-2xl font-black text-xs uppercase tracking-widest text-left flex items-center justify-between">
              BAIXAR ZIP <span>📦</span>
            </button>
            <button onClick={() => { onGithubCommit?.(); setIsMenuOpen(false); }} className="w-full p-4 bg-slate-900 border border-slate-800 rounded-2xl font-black text-xs uppercase tracking-widest text-left flex items-center justify-between">
              GITHUB COMMIT <span>🐙</span>
            </button>
            <button onClick={() => { onVercelDeploy?.(); setIsMenuOpen(false); }} className="w-full p-4 bg-blue-600 rounded-2xl font-black text-xs uppercase tracking-widest text-left flex items-center justify-between">
              DEPLOY VERCEL <span>▲</span>
            </button>
            <button onClick={() => setIsMenuOpen(false)} className="mt-auto p-4 bg-slate-800 rounded-2xl text-[10px] font-black uppercase tracking-widest text-center">FECHAR MENU</button>
          </div>
        </div>
      )}
      
      {/* Content Area */}
      <main className="flex-1 flex flex-col md:flex-row overflow-hidden relative">
        {children}
      </main>
    </div>
  );
};
