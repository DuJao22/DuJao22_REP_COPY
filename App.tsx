
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
import { askAI } from './services/geminiService';
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
    addLog('info', '[Dujão Engine] Iniciando container de execução...');
    addLog('info', `[WORKSPACE] Servindo ${activeProject?.name}...`);
    
    setTimeout(() => {
      const currentContent = activeProject?.files[activeFile]?.content || '';
      if (currentContent.includes('error') || currentContent.includes('undefined') || Math.random() > 0.95) {
        addLog('error', `[ERROR] Runtime Exception em ${activeFile}: Erro detectado.`);
      } else {
        addLog('success', '[READY] Sistema rodando em modo produção.');
      }
    }, 800);
  };

  const handleDownloadZip = async () => {
    if (!activeProject) return;
    addLog('info', '[ZIP] Preparando pacote de download...');
    try {
      const zip = new JSZip();
      (Object.values(activeProject.files) as ProjectFile[]).forEach(file => {
        zip.file(file.name, file.content);
      });
      const content = await zip.generateAsync({ type: 'blob' });
      const url = window.URL.createObjectURL(content);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${activeProject.name.replace(/\s+/g, '_')}_dujao22.zip`;
      link.click();
      window.URL.revokeObjectURL(url);
      addLog('success', '[ZIP] Download concluído.');
    } catch (err) {
      addLog('error', '[ZIP] Falha ao gerar arquivo.');
    }
  };

  const handleGithubUpdate = (data: { login: string; avatar_url: string; token: string } | null) => {
    if (!user) return;
    setUser({ ...user, github: data || undefined });
  };

  const handleVercelUpdate = (token: string) => {
    if (!user) return;
    setUser({ ...user, vercel: { token } });
  };

  const handleAutoFix = async () => {
    if (!activeProject || terminalLogs.length === 0) return;
    setIsFixing(true);
    addLog('info', '[Dujão AI] Corrigindo inconsistências...');
    const errorLogs = terminalLogs.filter(l => l.type === 'error').map(l => l.message).join('\n');
    try {
      const response = await askAI(`ERROS:\n${errorLogs}\n\nCorrija agora.`, activeProject, 'developer');
      const fileRegex = /@@@FILE:(.*?)@@@\n([\s\S]*?)\n@@@ENDFILE@@@/g;
      let match;
      const updates: {name: string, content: string}[] = [];
      while ((match = fileRegex.exec(response || "")) !== null) {
        const fileName = match[1].trim().split('/').pop() || match[1].trim();
        updates.push({ name: fileName, content: match[2] });
      }
      if (updates.length > 0) {
        handleApplyAIChanges(updates);
        addLog('success', `[FIXED] IA aplicou correções.`);
      }
    } catch (err) {
      addLog('error', '[Dujão AI] Falha na Engine.');
    } finally {
      setIsFixing(false);
    }
  };

  const handleLogin = (userObj: User) => {
    setUser(userObj);
    localStorage.setItem('dujao_user_obj', JSON.stringify(userObj));
  };

  const handleLogout = () => {
    setUser(null);
    setActiveProject(null);
    localStorage.removeItem('dujao_user_obj');
  };

  const handleCreateProject = (name: string, initialFiles?: Record<string, ProjectFile>) => {
    const newProject: Project = {
      id: Date.now().toString(),
      name,
      description: initialFiles ? "Gerado via IA" : "Manual",
      files: initialFiles || { ...INITIAL_FILES },
      createdAt: Date.now()
    };
    setProjects(prev => [...prev, newProject]);
    setActiveProject(newProject);
    setActiveFile(Object.keys(newProject.files)[0] || 'index.html');
  };

  const handleOpenProject = (project: Project) => {
    setActiveProject(project);
    setActiveFile(Object.keys(project.files)[0] || 'index.html');
  };

  const handleFileChange = useCallback((content: string) => {
    if (!activeProject || !activeFile) return;
    const updatedProject = {
      ...activeProject,
      files: {
        ...activeProject.files,
        [activeFile]: { ...activeProject.files[activeFile], content }
      }
    };
    setActiveProject(updatedProject);
    setProjects(prev => prev.map(p => p.id === updatedProject.id ? updatedProject : p));
  }, [activeProject, activeFile]);

  const handleApplyAIChanges = (updates: {name: string, content: string}[]) => {
    if (!activeProject) return;
    const newFiles = { ...activeProject.files };
    let lastFile = activeFile;
    updates.forEach(u => {
      const cleanName = u.name.split('/').pop() || u.name;
      const ext = cleanName.split('.').pop()?.toLowerCase() || '';
      let lang: FileType = 'markdown';
      if (ext === 'py') lang = 'python'; else if (ext === 'html') lang = 'html';
      else if (ext === 'css') lang = 'css'; else if (ext === 'js') lang = 'javascript';
      newFiles[cleanName] = { name: cleanName, content: u.content, language: lang };
      lastFile = cleanName;
    });
    const updated = { ...activeProject, files: newFiles };
    setActiveProject(updated);
    setActiveFile(lastFile);
    setProjects(prev => prev.map(p => p.id === updated.id ? updated : p));
  };

  const handleNewFile = () => {
    const name = prompt("Nome do arquivo:");
    if (!name || !activeProject) return;
    const cleanName = name.split('/').pop() || name;
    const ext = cleanName.split('.').pop()?.toLowerCase() || '';
    let lang: FileType = 'markdown';
    if (ext === 'py') lang = 'python'; else if (ext === 'html') lang = 'html';
    else if (ext === 'css') lang = 'css'; else if (ext === 'js') lang = 'javascript';
    const updated = { ...activeProject, files: { ...activeProject.files, [cleanName]: { name: cleanName, content: '', language: lang } } };
    setActiveProject(updated);
    setActiveFile(cleanName);
    setProjects(prev => prev.map(p => p.id === updated.id ? updated : p));
  };

  if (!user) return <Auth onLogin={handleLogin} />;

  return (
    <div className="flex h-screen overflow-hidden bg-slate-950 font-sans text-slate-100">
      <div className="flex-1 flex flex-col min-w-0">
        {!activeProject ? (
          <Dashboard 
            username={user.username} 
            projects={projects} 
            onOpenProject={handleOpenProject} 
            onCreateProject={(name) => handleCreateProject(name)} 
            onLogout={handleLogout}
          />
        ) : (
          <Layout 
            onRun={handleRun} 
            onDownloadZip={handleDownloadZip}
            onGithubCommit={() => setShowGithub(true)}
            onVercelDeploy={() => setShowVercel(true)}
          >
            {/* Sidebar Responsivo */}
            <div className={`
              fixed lg:relative z-[80] lg:z-0
              ${showSidebar ? 'translate-x-0' : '-translate-x-full lg:translate-x-0 lg:w-0 lg:opacity-0'}
              transition-all duration-300 h-[calc(100vh-56px)] lg:h-auto w-64 bg-slate-900 border-r border-slate-800 flex flex-col
            `}>
              <div className="p-2 border-b border-slate-800 lg:hidden">
                <button onClick={() => setShowSidebar(false)} className="w-full py-2 bg-slate-800 rounded-lg text-[10px] font-black uppercase">Ocultar</button>
              </div>
              <button 
                onClick={() => setActiveProject(null)}
                className="p-4 text-[10px] font-black text-slate-500 uppercase hover:text-blue-400 border-b border-slate-800 transition-all flex items-center gap-2 group"
              >
                ← Dashboard
              </button>
              <FileExplorer 
                files={activeProject.files} 
                activeFile={activeFile} 
                onFileSelect={(f) => { setActiveFile(f); if(window.innerWidth < 1024) setShowSidebar(false); }} 
                onNewFile={handleNewFile} 
              />
              <div className="mt-auto p-4 border-t border-slate-800">
                <button onClick={() => setShowSettings(true)} className="w-full py-2 bg-slate-800/50 hover:bg-slate-800 rounded-lg text-[9px] font-black uppercase text-slate-500 hover:text-white transition-all border border-slate-700/50">Configurações</button>
              </div>
            </div>

            {/* Editor & Preview Area */}
            <div className="flex-1 flex flex-col min-w-0 relative">
              <div className="h-10 lg:h-12 bg-slate-950 border-b border-slate-800 flex items-center px-2 lg:px-4 justify-between sticky top-0 z-40">
                 <div className="flex items-center gap-2">
                   <button onClick={() => setShowSidebar(!showSidebar)} className="lg:hidden p-1.5 bg-slate-900 border border-slate-800 rounded-md text-slate-400">
                     <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h8m-8 6h16" /></svg>
                   </button>
                   <span className="hidden sm:inline text-[9px] text-blue-500 font-black bg-blue-500/10 border border-blue-500/20 px-2 py-0.5 rounded uppercase">{activeProject.files[activeFile]?.language || 'TEXT'}</span>
                   <span className="text-[10px] lg:text-[11px] text-slate-400 font-bold truncate max-w-[120px]">{activeFile}</span>
                 </div>
                 <div className="flex gap-1 bg-slate-900/50 p-1 rounded-lg">
                   {['editor', 'split', 'preview'].map(m => (
                     <button 
                        key={m}
                        onClick={() => setViewMode(m as any)}
                        className={`px-2 py-1 text-[8px] lg:text-[9px] font-black uppercase rounded-md transition-all ${viewMode === m ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}
                     >{m}</button>
                   ))}
                 </div>
              </div>
              
              <div className="flex-1 flex overflow-hidden bg-slate-950 flex-col lg:flex-row">
                {(viewMode === 'editor' || viewMode === 'split') && (
                  <div className={`flex-1 flex flex-col ${viewMode === 'split' ? 'lg:border-r border-slate-800' : ''}`}>
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

      {/* Chat responsivo */}
      <div className={`
        fixed inset-y-0 right-0 z-[120] lg:relative lg:z-0
        transition-all duration-500 cubic-bezier(0.4, 0, 0.2, 1)
        ${showChat ? 'translate-x-0 w-full sm:w-[400px]' : 'translate-x-full lg:w-0'}
        flex flex-col border-l border-slate-800 bg-slate-900
      `}>
        {showChat && (
          <>
            <button onClick={() => setShowChat(false)} className="lg:hidden absolute top-4 right-4 z-[130] p-2 bg-slate-800 rounded-full">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
            <AIChat 
              files={activeProject?.files || {}} 
              activeProject={activeProject}
              onApplyChanges={handleApplyAIChanges}
              onImportProject={(name, files) => handleCreateProject(name, files)}
            />
          </>
        )}
      </div>

      {/* Chat Toggle Button (Desktop & Mobile Floating) */}
      {!showChat && (
        <button 
          onClick={() => setShowChat(true)}
          className="fixed bottom-6 right-6 w-14 h-14 bg-blue-600 text-white rounded-full shadow-2xl flex items-center justify-center z-[110] animate-bounce active:scale-90 lg:hover:scale-110 transition-transform"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" /></svg>
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
            onGithubUpdate={handleGithubUpdate}
            savedGithub={user.github}
          />
          <VercelDialog
            isOpen={showVercel}
            onClose={() => setShowVercel(false)}
            files={activeProject.files}
            projectName={activeProject.name}
            onVercelUpdate={handleVercelUpdate}
            savedToken={user.vercel?.token}
          />
        </>
      )}
    </div>
  );
};

export default App;
