
import React, { useState, useEffect, useCallback, useRef } from 'react';
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
  const [terminalLogs, setTerminalLogs] = useState<{type: 'info' | 'error' | 'success' | 'system', message: string}[]>([]);
  const [isFixing, setIsFixing] = useState(false);
  const [isRunning, setIsRunning] = useState(false);
  const [showChat, setShowChat] = useState(window.innerWidth > 1280);
  const [showSidebar, setShowSidebar] = useState(window.innerWidth > 1024);
  
  const restartTimeoutRef = useRef<any>(null);

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

  const addLog = useCallback((type: 'info' | 'error' | 'success' | 'system', message: string) => {
    setTerminalLogs(prev => [...prev, { type, message }]);
  }, []);

  const handleRun = useCallback(() => {
    setIsRunning(false);
    setTerminalLogs(prev => prev.slice(-5)); 
    addLog('info', '➜ [SYSTEM] Iniciando boot de auditoria...');
    
    setTimeout(() => {
      const projectFiles = activeProject?.files || {};
      const fileNames = Object.keys(projectFiles);
      
      // Inteligência de Roteamento: Procura index.html em qualquer lugar
      const indexPath = fileNames.find(k => k.endsWith('index.html'));
      
      if (!indexPath) {
        addLog('error', '[CRITICAL] Ponto de entrada (index.html) não localizado no projeto.');
        addLog('info', '➜ [AUTO-FIX] Sugestão: Clique em "Fix with Dujão AI" para gerar a estrutura base.');
      } else {
        setIsRunning(true);
        addLog('success', `Boot bem-sucedido. Entry point: ${indexPath}`);
        addLog('success', 'Server listening on port 3000 (HTTPS)');
      }
    }, 400);
  }, [activeProject, addLog]);

  const triggerServerRestart = useCallback(() => {
    if (restartTimeoutRef.current) clearTimeout(restartTimeoutRef.current);
    
    setIsRunning(false);
    addLog('system', 'SIGTERM: Reiniciando container devido a alterações...');
    
    restartTimeoutRef.current = setTimeout(() => {
      handleRun();
    }, 500);
  }, [addLog, handleRun]);

  const handleAutoFix = async () => {
    if (!activeProject) return;
    
    const errors = terminalLogs.filter(l => l.type === 'error').map(l => l.message).join('\n');
    setIsFixing(true);
    addLog('info', '[OMNI-FIX] Solicitando reparo estrutural ao núcleo...');
    
    const repairPrompt = errors 
      ? `ERROS DETECTADOS NO SISTEMA:\n${errors}\n\nAnalise meus arquivos e corrija o problema agora. Se faltar o index.html, crie-o na raiz.`
      : `O sistema não está rodando corretamente. Verifique se o index.html está na raiz e se as referências de scripts estão corretas.`;

    if ((window as any).triggerAISend) {
      await (window as any).triggerAISend(repairPrompt);
    }
    
    setIsFixing(false);
  };

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
      if (u.name.endsWith('index.html')) fileToFocus = u.name;
    });

    const updated = { ...activeProject, files: newFiles };
    setActiveProject(updated);
    if (fileToFocus) setActiveFile(fileToFocus);
    setProjects(prev => prev.map(p => p.id === updated.id ? updated : p));
    triggerServerRestart();
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
    triggerServerRestart();
  }, [activeProject, activeFile, triggerServerRestart]);

  const handleCreateProject = (name: string, initialFiles?: Record<string, ProjectFile>) => {
    const newProject: Project = {
      id: Date.now().toString(),
      name,
      description: initialFiles ? "Sistema estruturado e auditado." : "Ambiente pronto para desenvolvimento.",
      files: initialFiles || { ...INITIAL_FILES },
      createdAt: Date.now(),
      progress: initialFiles ? 100 : 0,
      stack: initialFiles ? ['Modern Stack'] : []
    };
    setProjects(prev => [...prev, newProject]);
    setActiveProject(newProject);
    const firstFile = Object.keys(newProject.files).find(k => k.endsWith('index.html')) || Object.keys(newProject.files)[0] || 'index.html';
    setActiveFile(firstFile);
    addLog('system', `Container ${name} inicializado.`);
  };

  const handleOpenProject = (project: Project) => {
    setActiveProject(project);
    const firstFile = Object.keys(project.files).find(k => k.endsWith('index.html')) || Object.keys(project.files)[0] || 'index.html';
    setActiveFile(firstFile);
    setTerminalLogs([]);
    addLog('info', `Projeto ${project.name} online.`);
  };

  const handleDownloadZip = async () => {
    if (!activeProject) return;
    try {
      const zip = new JSZip();
      Object.entries(activeProject.files).forEach(([path, file]) => {
        zip.file(path, (file as ProjectFile).content);
      });
      const content = await zip.generateAsync({ type: 'blob' });
      const url = window.URL.createObjectURL(content);
      const link = document.createElement('a');
      link.href = url;
      link.download = `DS_PRO_${activeProject.name.replace(/\s+/g, '_')}.zip`;
      link.click();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      addLog('error', 'Falha no empacotamento do ZIP.');
    }
  };

  const handleNewFile = () => {
    const name = prompt("Caminho do arquivo (ex: index.html ou src/app.js):");
    if (!name || !activeProject) return;
    const ext = name.split('.').pop()?.toLowerCase() || '';
    let lang: FileType = 'markdown';
    if (ext === 'py') lang = 'python'; else if (ext === 'html') lang = 'html';
    const updated = { ...activeProject, files: { ...activeProject.files, [name]: { name, content: '', language: lang, lastModified: Date.now() } } };
    setActiveProject(updated);
    setActiveFile(name);
    setProjects(prev => prev.map(p => p.id === updated.id ? updated : p));
  };

  if (!user) return <Auth onLogin={setUser} />;

  return (
    <div className="flex h-screen overflow-hidden bg-[#020617] font-sans text-slate-100 selection:bg-blue-500/30">
      <div className="flex-1 flex flex-col min-w-0 relative">
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
            {/* Sidebar Explorer */}
            <div className={`
              fixed lg:relative z-[80] lg:z-0
              ${showSidebar ? 'translate-x-0 w-64' : '-translate-x-full lg:translate-x-0 lg:w-0 lg:opacity-0'}
              transition-all duration-500 ease-in-out h-full bg-[#020617] border-r border-slate-800/50 flex flex-col
            `}>
              <button 
                onClick={() => setActiveProject(null)}
                className="p-5 text-[10px] font-black text-slate-500 uppercase hover:text-white border-b border-slate-800/50 transition-all flex items-center gap-3 bg-slate-950/20"
              >
                <span className="w-6 h-6 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-center text-xs">←</span>
                Dashboard
              </button>
              <FileExplorer 
                files={activeProject.files} 
                activeFile={activeFile} 
                onFileSelect={(f) => { setActiveFile(f); if(window.innerWidth < 1024) setShowSidebar(false); }} 
                onNewFile={handleNewFile} 
              />
            </div>

            {/* Workspace */}
            <div className="flex-1 flex flex-col min-w-0 relative bg-slate-950/20">
              <div className="h-12 bg-[#020617] border-b border-slate-800/50 flex items-center px-6 justify-between z-40">
                 <div className="flex items-center gap-4">
                   <button onClick={() => setShowSidebar(!showSidebar)} className="p-2 bg-slate-900 border border-slate-800 rounded-lg text-slate-400 hover:text-blue-400 transition-all">
                     <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 6h16M4 12h16M4 18h16" /></svg>
                   </button>
                   <div className="flex items-center gap-2">
                     <span className="text-[10px] text-blue-500 font-black uppercase tracking-widest">{activeProject.name}</span>
                     <span className="text-slate-700 font-bold">/</span>
                     <span className="text-[10px] text-slate-400 font-mono tracking-tighter truncate max-w-[150px]">{activeFile}</span>
                   </div>
                 </div>
                 
                 <div className="flex gap-1 bg-slate-900/50 p-1 rounded-xl border border-slate-800/50">
                   {['editor', 'split', 'preview'].map(m => (
                     <button 
                        key={m}
                        onClick={() => setViewMode(m as any)}
                        className={`px-4 py-1.5 text-[9px] font-black uppercase rounded-lg transition-all ${viewMode === m ? 'bg-slate-800 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}
                     >{m}</button>
                   ))}
                 </div>
              </div>
              
              <div className="flex-1 flex overflow-hidden flex-col lg:flex-row">
                {(viewMode === 'editor' || viewMode === 'split') && (
                  <div className={`flex-1 flex flex-col ${viewMode === 'split' ? 'lg:border-r border-slate-800/50' : ''}`}>
                    <Editor 
                      value={activeProject.files[activeFile]?.content || ''}
                      language={activeProject.files[activeFile]?.language || 'markdown'}
                      onChange={handleFileChange}
                    />
                  </div>
                )}
                {(viewMode === 'preview' || viewMode === 'split') && (
                  <div className={`flex-1 flex flex-col relative ${viewMode === 'editor' ? 'hidden' : 'block'}`}>
                    <Preview files={activeProject.files} isRunning={isRunning} />
                  </div>
                )}
              </div>
              
              <Terminal logs={terminalLogs} onAutoFix={handleAutoFix} isFixing={isFixing} />
            </div>
          </Layout>
        )}
      </div>

      {/* AI Chat Drawer */}
      <div className={`
        fixed inset-y-0 right-0 z-[120] lg:relative lg:z-0
        transition-all duration-500 cubic-bezier(0.4, 0, 0.2, 1)
        ${showChat ? 'translate-x-0 w-full sm:w-[500px]' : 'translate-x-full lg:w-0'}
        flex flex-col border-l border-slate-800 bg-[#020617] shadow-[-20px_0_60px_rgba(0,0,0,0.8)]
      `}>
        {showChat && (
          <AIChat 
            files={activeProject?.files || {}} 
            activeProject={activeProject}
            onApplyChanges={handleApplyAIChanges}
            onImportProject={(name, files) => handleCreateProject(name, files)}
          />
        )}
        <button 
          onClick={() => setShowChat(!showChat)}
          className="absolute -left-10 top-1/2 -translate-y-1/2 w-10 h-24 bg-[#020617] border border-slate-800 border-r-0 rounded-l-2xl flex items-center justify-center text-slate-500 hover:text-blue-500 transition-all shadow-xl group"
        >
          <span className={`text-xl font-black transition-transform duration-500 ${showChat ? 'rotate-0' : 'rotate-180'}`}>➔</span>
        </button>
      </div>

      <AdminSettings isOpen={showSettings} onClose={() => setShowSettings(false)} />
      
      {activeProject && (
        <>
          <GithubDialog isOpen={showGithub} onClose={() => setShowGithub(false)} files={activeProject.files} projectName={activeProject.name} savedGithub={user.github} />
          <VercelDialog isOpen={showVercel} onClose={() => setShowVercel(false)} files={activeProject.files} projectName={activeProject.name} savedToken={user.vercel?.token} />
        </>
      )}
    </div>
  );
};

export default App;
