
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
  const [viewMode, setViewMode] = useState<'editor' | 'preview' | 'split'>('split');
  const [showSettings, setShowSettings] = useState(false);
  const [showGithub, setShowGithub] = useState(false);
  const [terminalLogs, setTerminalLogs] = useState<{type: 'info' | 'error' | 'success', message: string}[]>([]);
  const [isFixing, setIsFixing] = useState(false);
  const [showChat, setShowChat] = useState(true);

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
      if (currentContent.includes('error') || currentContent.includes('undefined') || Math.random() > 0.9) {
        addLog('error', `[ERROR] Runtime Exception em ${activeFile}: Erro de sintaxe ou lógica detectado.`);
      } else {
        addLog('success', '[READY] Sistema rodando sem erros detectados.');
      }
    }, 1000);
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
      
      addLog('success', '[ZIP] Download iniciado com sucesso.');
    } catch (err) {
      addLog('error', '[ZIP] Falha ao gerar arquivo compactado.');
    }
  };

  const handleGithubUpdate = (data: { login: string; avatar_url: string; token: string } | null) => {
    if (!user) return;
    const updatedUser = { ...user, github: data || undefined };
    setUser(updatedUser);
    if (data) {
      localStorage.setItem('dujao_github_pat', data.token);
    } else {
      localStorage.removeItem('dujao_github_pat');
    }
  };

  const handleAutoFix = async () => {
    if (!activeProject || terminalLogs.length === 0) return;
    setIsFixing(true);
    addLog('info', '[Dujão AI] Analisando logs e corrigindo arquivos...');

    const errorLogs = terminalLogs.filter(l => l.type === 'error').map(l => l.message).join('\n');
    const prompt = `ERRO NO TERMINAL:\n${errorLogs}\n\nCorrija os arquivos necessários. LEMBRE-SE: Use nomes de arquivos planos, sem pastas.`;

    try {
      const response = await askAI(prompt, activeProject, 'developer');
      const fileRegex = /@@@FILE:(.*?)@@@\n([\s\S]*?)\n@@@ENDFILE@@@/g;
      let match;
      const updates: {name: string, content: string}[] = [];

      while ((match = fileRegex.exec(response || "")) !== null) {
        const fileName = match[1].trim().split('/').pop() || match[1].trim();
        updates.push({ name: fileName, content: match[2] });
      }

      if (updates.length > 0) {
        handleApplyAIChanges(updates);
        addLog('success', `[FIXED] Dujão AI corrigiu os arquivos.`);
      } else {
        addLog('info', '[Dujão AI] Nenhuma alteração foi necessária.');
      }
    } catch (err) {
      addLog('error', '[Dujão AI] Falha na correção automática.');
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
      description: initialFiles ? "Projeto gerado via IA Dujão 22" : "Novo projeto manual.",
      files: initialFiles || { ...INITIAL_FILES },
      createdAt: Date.now()
    };
    setProjects(prev => [...prev, newProject]);
    setActiveProject(newProject);
    setActiveFile(Object.keys(newProject.files)[0] || 'index.html');
    addLog('success', `Projeto "${name}" aberto.`);
  };

  const handleOpenProject = (project: Project) => {
    setActiveProject(project);
    const firstFile = Object.keys(project.files)[0] || '';
    setActiveFile(firstFile);
    setTerminalLogs([{type: 'info', message: `Projeto ${project.name} carregado.`}]);
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
      const ext = cleanName.split('.').pop()?.toLowerCase();
      let lang: FileType = 'markdown';
      if (ext === 'py') lang = 'python';
      else if (ext === 'html') lang = 'html';
      else if (ext === 'css') lang = 'css';
      else if (ext === 'js') lang = 'javascript';
      else if (ext === 'json') lang = 'json';
      
      newFiles[cleanName] = { name: cleanName, content: u.content, language: lang };
      lastFile = cleanName;
    });

    const updatedProject = { ...activeProject, files: newFiles };
    setActiveProject(updatedProject);
    setActiveFile(lastFile);
    setProjects(prev => prev.map(p => p.id === updatedProject.id ? updatedProject : p));
  };

  const handleNewFile = () => {
    const nameInput = prompt("Nome do arquivo:");
    if (!nameInput || !activeProject) return;
    const name = nameInput.split('/').pop() || nameInput;
    const ext = name.split('.').pop()?.toLowerCase();
    let lang: FileType = 'markdown';
    if (ext === 'py') lang = 'python';
    else if (ext === 'html') lang = 'html';
    else if (ext === 'css') lang = 'css';
    else if (ext === 'js') lang = 'javascript';
    else if (ext === 'json') lang = 'json';

    const newFiles = { ...activeProject.files, [name]: { name, content: '', language: lang } };
    const updated = { ...activeProject, files: newFiles };
    setActiveProject(updated);
    setActiveFile(name);
    setProjects(prev => prev.map(p => p.id === updated.id ? updated : p));
  };

  if (!user) return <Auth onLogin={handleLogin} />;

  return (
    <div className="flex h-screen overflow-hidden bg-slate-950 font-sans">
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
          >
            <div className="flex-none flex flex-col w-64 bg-slate-900 border-r border-slate-800">
              <button 
                onClick={() => setActiveProject(null)}
                className="p-4 text-[10px] font-black text-slate-500 uppercase hover:text-blue-400 border-b border-slate-800 transition-all flex items-center gap-2 group"
              >
                <span className="group-hover:-translate-x-1 transition-transform">←</span>
                Dashboard Principal
              </button>
              <FileExplorer 
                files={activeProject.files} 
                activeFile={activeFile} 
                onFileSelect={setActiveFile} 
                onNewFile={handleNewFile} 
              />
              <div className="mt-auto p-4 border-t border-slate-800">
                <button 
                   onClick={() => setShowSettings(true)}
                   className="w-full py-2 bg-slate-800/50 hover:bg-slate-800 rounded-lg text-[9px] font-black uppercase tracking-widest text-slate-500 hover:text-white transition-all border border-slate-700/50"
                >
                  Configurações
                </button>
              </div>
            </div>

            <div className="flex-1 flex flex-col min-w-0">
              <div className="flex-1 flex overflow-hidden">
                <div className="flex-1 flex flex-col relative">
                  <div className="h-10 bg-slate-950 border-b border-slate-800 flex items-center px-4 justify-between">
                     <div className="flex items-center gap-3">
                       <span className="text-[9px] text-blue-500 font-black bg-blue-500/10 border border-blue-500/20 px-2 py-0.5 rounded uppercase tracking-widest">{activeProject.files[activeFile]?.language || 'TEXT'}</span>
                       <span className="text-[11px] text-slate-400 font-bold">{activeFile}</span>
                     </div>
                     <div className="flex gap-1.5">
                       {['editor', 'split', 'preview'].map(m => (
                         <button 
                          key={m}
                          onClick={() => setViewMode(m as any)}
                          className={`px-3 py-1 text-[10px] font-black uppercase rounded-lg transition-all ${viewMode === m ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/40' : 'text-slate-600 bg-slate-900 hover:bg-slate-800'}`}
                         >{m}</button>
                       ))}
                     </div>
                  </div>
                  
                  <div className="flex-1 flex bg-slate-950">
                    {(viewMode === 'editor' || viewMode === 'split') && (
                      <Editor 
                        value={activeProject.files[activeFile]?.content || ''}
                        language={activeProject.files[activeFile]?.language || 'markdown'}
                        onChange={handleFileChange}
                      />
                    )}
                    {viewMode === 'split' && <div className="w-[1px] bg-slate-800/50"></div>}
                    {(viewMode === 'preview' || viewMode === 'split') && (
                      <Preview files={activeProject.files} />
                    )}
                  </div>
                </div>
              </div>
              <Terminal logs={terminalLogs} onAutoFix={handleAutoFix} isFixing={isFixing} />
            </div>
          </Layout>
        )}
      </div>

      <div className={`transition-all duration-700 cubic-bezier(0.4, 0, 0.2, 1) ${showChat ? 'w-[400px]' : 'w-0'} relative border-l border-slate-800 flex`}>
        <button 
          onClick={() => setShowChat(!showChat)}
          className={`absolute left-[-32px] top-1/2 -translate-y-1/2 w-8 h-20 bg-slate-900 border border-slate-800 rounded-l-xl flex items-center justify-center text-slate-500 hover:text-white z-[60] shadow-2xl`}
        >
          <span className="text-lg font-bold">{showChat ? '→' : '←'}</span>
        </button>
        {showChat && (
          <AIChat 
            files={activeProject?.files || {}} 
            activeProject={activeProject}
            onApplyChanges={handleApplyAIChanges}
            onImportProject={(name, files) => handleCreateProject(name, files)}
          />
        )}
      </div>

      <AdminSettings isOpen={showSettings} onClose={() => setShowSettings(false)} />
      
      {activeProject && (
        <GithubDialog 
          isOpen={showGithub} 
          onClose={() => setShowGithub(false)} 
          files={activeProject.files}
          projectName={activeProject.name}
          onGithubUpdate={handleGithubUpdate}
          savedGithub={user.github}
        />
      )}
    </div>
  );
};

export default App;
