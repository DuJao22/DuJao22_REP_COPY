
import React, { useState } from 'react';
import { Project } from '../types';

interface DashboardProps {
  username: string;
  projects: Project[];
  onOpenProject: (project: Project) => void;
  onCreateProject: (name: string) => void;
  onLogout: () => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ username, projects, onOpenProject, onCreateProject, onLogout }) => {
  const [newProjectName, setNewProjectName] = useState('');

  return (
    <div className="min-h-screen bg-slate-950 p-4 lg:p-12 overflow-y-auto">
      <header className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center justify-between mb-16 gap-6">
        <div className="flex items-center gap-6">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl flex items-center justify-center font-black text-3xl shadow-2xl shadow-blue-500/20 rotate-3">D</div>
          <div>
            <h1 className="text-3xl font-black text-white tracking-tight">Cloud Console</h1>
            <p className="text-xs text-slate-500 font-bold uppercase tracking-[0.3em] mt-1">Bem-vindo de volta, {username.split(' ')[0]}</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
           <div className="hidden md:block h-10 w-px bg-slate-800 mx-2"></div>
           <button onClick={onLogout} className="px-6 py-2 border border-slate-800 rounded-xl text-[10px] font-black text-slate-500 hover:text-red-400 hover:border-red-900 transition-all uppercase tracking-widest">Logout System</button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Create Section */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-slate-900/50 border border-slate-800 p-8 rounded-[2rem] backdrop-blur-xl">
              <h3 className="text-white font-black text-sm uppercase tracking-widest mb-6">Novo Deployment</h3>
              <input 
                type="text"
                placeholder="Identificador do sistema..."
                value={newProjectName}
                onChange={(e) => setNewProjectName(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-6 py-4 text-xs text-white mb-6 outline-none focus:border-blue-500 transition-all font-mono"
              />
              <button 
                onClick={() => {
                  if (newProjectName) {
                    onCreateProject(newProjectName);
                    setNewProjectName('');
                  }
                }}
                disabled={!newProjectName}
                className="w-full py-4 bg-blue-600 hover:bg-blue-500 disabled:bg-slate-800 disabled:text-slate-600 rounded-2xl font-black text-xs uppercase tracking-[0.2em] transition-all shadow-xl shadow-blue-900/20 active:scale-95"
              >
                Launch Architecture
              </button>
            </div>
            
            <div className="p-6 border border-slate-800 rounded-[2rem] bg-gradient-to-br from-blue-600/10 to-transparent">
               <p className="text-[10px] font-black text-blue-500 uppercase mb-2">Dujão Status</p>
               <div className="flex items-center gap-2">
                 <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                 <span className="text-[11px] text-slate-300 font-bold uppercase">Engine v2.2 Online</span>
               </div>
            </div>
          </div>

          {/* Projects Grid */}
          <div className="lg:col-span-3 grid grid-cols-1 md:grid-cols-2 gap-6">
            {projects.length === 0 && (
              <div className="md:col-span-2 py-20 text-center border-2 border-dashed border-slate-800 rounded-[3rem]">
                 <div className="text-5xl mb-6">🪐</div>
                 <h2 className="text-slate-500 font-black uppercase text-xs tracking-widest">Nenhum sistema detectado em órbita.</h2>
              </div>
            )}
            {projects.map(project => (
              <div 
                key={project.id}
                onClick={() => onOpenProject(project)}
                className="group relative bg-slate-900 border border-slate-800 p-8 rounded-[2.5rem] cursor-pointer hover:border-blue-600/50 transition-all duration-500 hover:-translate-y-1 overflow-hidden"
              >
                <div className="absolute top-0 right-0 p-8">
                   <div className="text-2xl group-hover:scale-125 transition-transform duration-500">📁</div>
                </div>
                
                <div className="flex items-center gap-2 mb-4">
                   <span className="text-[9px] font-black bg-blue-500/10 text-blue-400 px-3 py-1 rounded-full uppercase tracking-widest">
                     {Object.keys(project.files).length} Files
                   </span>
                </div>

                <h3 className="text-xl font-black text-white group-hover:text-blue-400 transition-colors">{project.name}</h3>
                <p className="text-[11px] text-slate-500 mt-3 font-bold uppercase tracking-tight leading-relaxed line-clamp-2">
                  {project.description || "Iniciando processo de arquitetura estruturada."}
                </p>
                
                <div className="mt-8 pt-6 border-t border-slate-800 flex items-center justify-between">
                  <div className="flex flex-col">
                    <span className="text-[9px] text-slate-600 font-black uppercase tracking-widest">Data de Lançamento</span>
                    <span className="text-[10px] text-slate-400 font-bold">{new Date(project.createdAt).toLocaleDateString('pt-BR')}</span>
                  </div>
                  <div className="w-10 h-10 rounded-full border border-slate-800 flex items-center justify-center group-hover:bg-blue-600 group-hover:border-blue-600 transition-all">
                    <span className="text-white">→</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
      
      <footer className="max-w-7xl mx-auto mt-20 pb-10 text-center">
         <p className="text-[9px] text-slate-800 font-black uppercase tracking-[1em]">João Layon Digital Solutions • Global Engineering</p>
      </footer>
    </div>
  );
};
