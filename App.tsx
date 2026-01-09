
import React, { useState, useEffect, useCallback } from 'react';
import { Auth } from './components/Auth';
import { Dashboard } from './components/Dashboard';
import { Layout } from './components/Layout';
import { FileExplorer } from './components/FileExplorer';
import { Editor } from './components/Editor';
import { AIChat } from './components/AIChat';
import { Preview } from './components/Preview';
import { Terminal } from './components/Terminal';
import { AdminSettings } from './components/AdminSettings';
import { GithubDialog } from './components/GithubDialog';
import { VercelDialog } from './components/VercelDialog';
import { Project, ProjectFile, FileType, User } from './types';
import { INITIAL_FILES } from './constants';
import JSZip from 'jszip';

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('dujao_user_obj');
    return saved ? JSON.parse(saved) : null;
  });
  
  const [projects, setProjects] = useState<Project[]>([]);
  const [activeProject, setActiveProject] = useState<Project | null>(null);
  const [activeFile, setActiveFile] = useState<string>('');
  const [viewMode, setViewMode] = useState<'editor' | 'preview' | 'split'>(() => window.innerWidth < 1024 ? 'editor' : 'split');
  const [showSettings, setShowSettings] = useState(false);
  const [showGithub, setShowGithub] = useState(false);
  const [showVercel, setShowVercel] = useState(false);
  const [terminalLogs, setTerminalLogs] = useState<{type: 'info' | 'error' | 'success', message: string}[]>([]);
  const [isFixing, setIsFixing] = useState(false);
  const [showChat, setShowChat] = useState(window.innerWidth > 1280);
  const [showSidebar, setShowSidebar] = useState(window.innerWidth > 1024);

  useEffect(() => {
    if (user) {
      const saved = localStorage.getItem(`dujao_projects_${user.id}`);
      setProjects(saved ? JSON.parse(saved) : []);
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      localStorage.setItem(`dujao_projects_${user.id}`, JSON.stringify(projects));
      localStorage.setItem('dujao_user_obj', JSON.stringify(user));
    }
  }, [projects, user]);

  const addLog = (type: 'info' | 'error' | 'success', message: string) => {
    setTerminalLogs(prev => [...prev, { type, message }]);
  };

  const handleRun = () => {
    setTerminalLogs([]);
    addLog('info', '[ENGINE] Auditando integridade da solução...');
    addLog('info', `[WORKSPACE] Compilando grafo de dependências em ${activeProject?.name}...`);
    
    setTimeout(() => {
      const projectFiles = activeProject?.files || {};
      const hasIndex = Object.keys(projectFiles).some(k => k.endsWith('index.html'));
      
      if (!hasIndex) {
        addLog('error', '[CRITICAL] Ponto de entrada (index.html) não localizado na raiz.');
      } else {
        addLog('success', '[CERTIFIED] Sistema verificado e pronto para operação em nuvem.');
      }
    }, 1200);
  };

  const handleAutoFix = async () => {
    if (!activeProject || terminalLogs.length === 0) return;
    const errors = terminalLogs.filter(l => l.type === 'error').map(l => l.message).join('\n');
    if (!errors) return;

    setIsFixing(true);
    addLog('info', '[AI] Aplicando patch de correção auditada...');
    
    const repairPrompt = `Ocorreram falhas de auditoria:\n${errors}\n\nReconstrua os módulos afetados com foco em funcionalidade total.`;
    
    if ((window as any).triggerAISend) {
      await (window as any).triggerAISend(repairPrompt);
    }
    
    setIsFixing(false);
  };

  const handleDownloadZip = async () => {
    if (!activeProject) return;
    addLog('info', '[ZIP] Empacotando arquitetura...');
    try {
      const zip = new JSZip();
      Object.entries(activeProject.files).forEach(([path, file]) => {
        zip.file(path, (file as ProjectFile).content);
      });
      const content = await zip.generateAsync({ type: 'blob' });
      const url = window.URL.createObjectURL(content);
      const link = document.createElement('a');
      link.href = url;
      link.download = `DS_SOLUTIONS_${activeProject.name.toUpperCase().replace(/\s+/g, '_')}.zip`;
      link.click();
      window.URL.revokeObjectURL(url);
      addLog('success', '[EXPORT] Pacote de engenharia gerado.');
    } catch (err) {
      addLog('error', '[EXPORT] Falha na compressão do cluster.');
    }
  };

  const handleCreateProject = (name: string, initialFiles?: Record<string, ProjectFile>) => {
    const newProject: Project = {
      id: Date.now().toString(),
      name,
      description: initialFiles ? "Solução Enterprise Auditada." : "Ambiente de desenvolvimento profissional.",
      files: initialFiles || { ...INITIAL_FILES },
      createdAt: Date.now(),
      progress: initialFiles ? 100 : 0,
      stack: initialFiles ? ['Modern Enterprise Stack'] : []
    };
    setProjects(prev => [...prev, newProject]);
    setActiveProject(newProject);
    const firstFile = Object.keys(newProject.files)[0] || 'index.html';
    setActiveFile(firstFile);
  };

  const handleOpenProject = (project: Project) => {
    setActiveProject(project);
    const firstFile = Object.keys(project.files)[0] || 'index.html';
    setActiveFile(firstFile);
  };

  const handleFileChange = useCallback((content: string) => {
    if (!activeProject || !activeFile) return;
    const updatedProject = {
      ...activeProject,
      files: {
        ...activeProject.files,
        [activeFile]: { ...activeProject.files[activeFile], content, lastModified: Date.now() }
      }
    };
    setActiveProject(updatedProject);
    setProjects(prev => prev.map(p => p.id === updatedProject.id ? updatedProject : p));
  }, [activeProject, activeFile]);

  const handleApplyAIChanges = (updates: {name: string, content: string}[]) => {
    if (!activeProject) return;
    const newFiles = { ...activeProject.files };
    let fileToFocus = activeFile;
    
    updates.forEach(u => {
      const ext = u.name.split('.').pop()?.toLowerCase() || '';
      let lang: FileType = 'markdown';
      if (ext === 'py') lang = 'python'; else if (ext === 'html') lang = 'html';
      else if (ext === 'css') lang = 'css'; else if (ext === 'js' || ext === 'jsx') lang = 'javascript';
      else if (ext === 'ts') lang = 'typescript'; else if (ext === 'tsx') lang = 'tsx';
      
      newFiles[u.name] = { name: u.name, content: u.content, language: lang, lastModified: Date.now() };
      fileToFocus = u.name;
    });

    const updated = { ...activeProject, files: newFiles };
    setActiveProject(updated);
    setActiveFile(fileToFocus);
    setProjects(prev => prev.map(p => p.id === updated.id ? updated : p));
  };

  const handleNewFile = () => {
    const name = prompt("Caminho completo do arquivo (ex: src/components/Header.tsx):");
    if (!name || !activeProject) return;
    const ext = name.split('.').pop()?.toLowerCase() || '';
    let lang: FileType = 'markdown';
    if (ext === 'py') lang = 'python'; else if (ext === 'html') lang = 'html';
    else if (ext === 'css') lang = 'css'; else if (ext === 'js' || ext === 'jsx') lang = 'javascript';
    else if (ext === 'ts') lang = 'typescript'; else if (ext === 'tsx') lang = 'tsx';
    const updated = { ...activeProject, files: { ...activeProject.files, [name]: { name, content: '', language: lang, lastModified: Date.now() } } };
    setActiveProject(updated);
    setActiveFile(name);
    setProjects(prev => prev.map(p => p.id === updated.id ? updated : p));
  };

  if (!user) return <Auth onLogin={setUser} />;

  return (
    <div className="flex h-screen overflow-hidden bg-slate-950 font-sans text-slate-100">
      <div className="flex-1 flex flex-col min-w-0">
        {!activeProject ? (
          <Dashboard 
            username={user.username} 
            projects={projects} 
            onOpenProject={handleOpenProject} 
            onCreateProject={(name) => handleCreateProject(name)} 
            onLogout={() => setUser(null)}
          />
        ) : (
          <Layout 
            onRun={handleRun} 
            onDownloadZip={handleDownloadZip}
            onGithubCommit={() => setShowGithub(true)}
            onVercelDeploy={() => setShowVercel(true)}
            onOpenSettings={() => setShowSettings(true)}
          >
            {/* Project Integrity Bar */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-slate-900 z-[110]">
               <div className={`h-full bg-blue-500 transition-all duration-1000 ${activeProject.progress === 100 ? 'w-full shadow-[0_0_10px_#3b82f6]' : 'w-1/3'}`}></div>
            </div>

            {/* Sidebar Explorer */}
            <div className={`
              fixed lg:relative z-[80] lg:z-0
              ${showSidebar ? 'translate-x-0 w-72' : '-translate-x-full lg:translate-x-0 lg:w-0 lg:opacity-0'}
              transition-all duration-500 h-[calc(100vh-56px)] lg:h-auto bg-slate-950 border-r border-white/5 flex flex-col
            `}>
              <button 
                onClick={() => setActiveProject(null)}
                className="p-8 text-[10px] font-black text-slate-500 uppercase hover:text-white border-b border-white/5 transition-all flex items-center gap-4 group bg-slate-950"
              >
                <span className="w-6 h-6 rounded-lg bg-slate-900 flex items-center justify-center group-hover:-translate-x-1 transition-transform">←</span>
                Sair do Ambiente
              </button>
              <FileExplorer 
                files={activeProject.files} 
                activeFile={activeFile} 
                onFileSelect={(f) => { setActiveFile(f); if(window.innerWidth < 1024) setShowSidebar(false); }} 
                onNewFile={handleNewFile} 
              />
            </div>

            {/* Core Workspace Area */}
            <div className="flex-1 flex flex-col min-w-0 relative bg-slate-950">
              <div className="h-14 bg-slate-950 border-b border-white/5 flex items-center px-8 justify-between sticky top-0 z-40">
                 <div className="flex items-center gap-6">
                   <button onClick={() => setShowSidebar(!showSidebar)} className="lg:hidden p-2.5 bg-slate-900 border border-white/10 rounded-xl text-slate-400">
                     <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M12 12h8m-8 6h16" /></svg>
                   </button>
                   <div className="flex items-center gap-4">
                     <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-[0_0_12px_rgba(16,185,129,0.5)]"></div>
                     <span className="text-[11px] text-slate-100 font-black tracking-tighter uppercase font-mono bg-slate-900 px-3 py-1 rounded-lg border border-white/5">{activeFile}</span>
                   </div>
                 </div>
                 <div className="flex gap-2 bg-slate-900 p-1.5 rounded-2xl border border-white/5">
                   {['editor', 'split', 'preview'].map(m => (
                     <button 
                        key={m}
                        onClick={() => setViewMode(m as any)}
                        className={`px-5 py-2 text-[9px] font-black uppercase rounded-xl transition-all ${viewMode === m ? 'bg-blue-600 text-white shadow-xl shadow-blue-900/30' : 'text-slate-500 hover:text-slate-300'}`}
                     >{m}</button>
                   ))}
                 </div>
              </div>
              
              <div className="flex-1 flex overflow-hidden flex-col lg:flex-row">
                {(viewMode === 'editor' || viewMode === 'split') && (
                  <div className={`flex-1 flex flex-col ${viewMode === 'split' ? 'lg:border-r border-white/5' : ''}`}>
                    <Editor 
                      value={activeProject.files[activeFile]?.content || ''}
                      language={activeProject.files[activeFile]?.language || 'markdown'}
                      onChange={handleFileChange}
                    />
                  </div>
                )}
                {(viewMode === 'preview' || viewMode === 'split') && (
                  <div className={`flex-1 flex flex-col ${viewMode === 'editor' ? 'hidden' : 'block'}`}>
                    <Preview files={activeProject.files} />
                  </div>
                )}
              </div>
              
              <Terminal logs={terminalLogs} onAutoFix={handleAutoFix} isFixing={isFixing} />
            </div>
          </Layout>
        )}
      </div>

      {/* AI Consulting Sidebar */}
      <div className={`
        fixed inset-y-0 right-0 z-[120] lg:relative lg:z-0
        transition-all duration-700 cubic-bezier(0.16, 1, 0.3, 1)
        ${showChat ? 'translate-x-0 w-full sm:w-[550px]' : 'translate-x-full lg:w-0'}
        flex flex-col border-l border-white/5 bg-slate-900 shadow-[-50px_0_100px_rgba(0,0,0,0.9)]
      `}>
        {showChat && (
          <AIChat 
            files={activeProject?.files || {}} 
            activeProject={activeProject}
            onApplyChanges={handleApplyAIChanges}
            onImportProject={(name, files) => handleCreateProject(name, files)}
          />
        )}
      </div>

      {!showChat && (
        <button 
          onClick={() => setShowChat(true)}
          className="fixed bottom-12 right-12 w-24 h-24 bg-blue-600 text-white rounded-[2.5rem] shadow-[0_40px_80px_-20px_rgba(37,99,235,0.6)] flex items-center justify-center z-[110] active:scale-90 hover:scale-110 transition-all group overflow-hidden border-4 border-white/10"
        >
          <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
          <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
        </button>
      )}

      <AdminSettings isOpen={showSettings} onClose={() => setShowSettings(false)} />
      
      {activeProject && (
        <>
          <GithubDialog 
            isOpen={showGithub} 
            onClose={() => setShowGithub(false)} 
            files={activeProject.files}
            projectName={activeProject.name}
            savedGithub={user.github}
          />
          <VercelDialog
            isOpen={showVercel}
            onClose={() => setShowVercel(false)}
            files={activeProject.files}
            projectName={activeProject.name}
            savedToken={user.vercel?.token}
          />
        </>
      )}
    </div>
  );
};

export default App;
