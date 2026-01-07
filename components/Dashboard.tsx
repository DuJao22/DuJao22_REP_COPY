
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
    <div className="min-h-screen bg-slate-950 p-8">
      <header className="max-w-6xl mx-auto flex items-center justify-between mb-12">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center font-bold text-xl">D</div>
          <div>
            <h1 className="text-2xl font-bold">Olá, {username}</h1>
            <p className="text-xs text-slate-500 font-bold uppercase tracking-widest">Workspace Digital Solutions</p>
          </div>
        </div>
        <button onClick={onLogout} className="text-xs font-bold text-red-500 hover:text-red-400 uppercase tracking-widest transition-colors">Sair</button>
      </header>

      <main className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl flex flex-col justify-between hover:border-blue-500 transition-colors group">
            <div>
              <h3 className="text-lg font-bold mb-2">Novo Projeto</h3>
              <p className="text-xs text-slate-400 mb-6">Comece um sistema do zero ou peça para a IA construir.</p>
              <input 
                type="text"
                placeholder="Nome do projeto..."
                value={newProjectName}
                onChange={(e) => setNewProjectName(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2 text-sm mb-4 outline-none focus:border-blue-500"
              />
            </div>
            <button 
              onClick={() => {
                if (newProjectName) {
                  onCreateProject(newProjectName);
                  setNewProjectName('');
                }
              }}
              className="w-full py-2 bg-blue-600 hover:bg-blue-500 rounded-lg font-bold text-sm transition-all"
            >
              CRIAR PROJETO
            </button>
          </div>

          {projects.map(project => (
            <div 
              key={project.id}
              onClick={() => onOpenProject(project)}
              className="bg-slate-900 border border-slate-800 p-6 rounded-2xl cursor-pointer hover:bg-slate-900/50 hover:border-slate-700 transition-all group"
            >
              <div className="flex justify-between items-start mb-4">
                <div className="w-10 h-10 bg-slate-800 rounded-lg flex items-center justify-center text-xl">📁</div>
                <span className="text-[10px] font-bold text-slate-500 bg-slate-800 px-2 py-1 rounded">{Object.keys(project.files).length} ARQS</span>
              </div>
              <h3 className="font-bold text-slate-200 group-hover:text-blue-400 transition-colors">{project.name}</h3>
              <p className="text-xs text-slate-500 mt-2 line-clamp-2">{project.description || "Nenhuma descrição."}</p>
              <div className="mt-6 flex items-center justify-between">
                <span className="text-[10px] text-slate-600 font-bold uppercase">Criado em {new Date(project.createdAt).toLocaleDateString()}</span>
                <span className="text-blue-500 group-hover:translate-x-1 transition-transform">→</span>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
};
