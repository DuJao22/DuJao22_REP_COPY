
import React, { useState, useEffect } from 'react';
import { ProjectFile } from '../types';

interface VercelDialogProps {
  isOpen: boolean;
  onClose: () => void;
  files: Record<string, ProjectFile>;
  projectName: string;
  onVercelUpdate?: (token: string) => void;
  savedToken?: string;
}

export const VercelDialog: React.FC<VercelDialogProps> = ({ isOpen, onClose, files, projectName, onVercelUpdate, savedToken }) => {
  const [token, setToken] = useState(savedToken || localStorage.getItem('dujao_vercel_token') || '');
  const [vProjectName, setVProjectName] = useState(projectName.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''));
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [step, setStep] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState('');
  const [deployUrl, setDeployUrl] = useState('');

  useEffect(() => {
    if (isOpen) {
      setVProjectName(projectName.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''));
    }
  }, [isOpen, projectName]);

  if (!isOpen) return null;

  const handleDeploy = async () => {
    if (!token || !vProjectName) {
      setErrorMsg('O Token Vercel e o nome do projeto são obrigatórios.');
      setStatus('error');
      return;
    }

    setStatus('loading');
    setErrorMsg('');
    setStep('Analisando integridade...');

    try {
      const projectFiles = Object.values(files) as ProjectFile[];
      const isPython = projectFiles.some(f => f.name.endsWith('.py'));
      const indexFile = projectFiles.find(f => f.name === 'index.html');

      if (!indexFile && !isPython) {
        throw new Error("Ponto de entrada ausente: Você precisa de um 'index.html' para que o site apareça.");
      }

      setStep('Injetando scripts de compatibilidade...');
      
      const vercelFiles: any[] = projectFiles.map(file => {
        let content = file.content;
        
        if (file.name === 'index.html') {
          const debugScript = `
            <script>
              window.addEventListener('error', function(e) {
                console.error('Vercel Runtime Error:', e);
                if (!document.body.innerText.trim()) {
                  document.body.innerHTML = '<div style="background:#0f172a;color:#ef4444;padding:20px;font-family:sans-serif;height:100vh;display:flex;align-items:center;justify-content:center;flex-direction:column;text-align:center"><h1>⚠️ Erro de Carregamento</h1><p>O JavaScript do seu sistema falhou ao iniciar. Verifique o console do navegador.</p><code style="background:#1e293b;padding:10px;border-radius:8px;margin-top:10px">' + e.message + '</code></div>';
                }
              });
            </script>
          `;
          if (content.includes('</head>')) {
            content = content.replace('</head>', `${debugScript}</head>`);
          } else {
            content = debugScript + content;
          }
        }
        
        return {
          file: file.name,
          data: content
        };
      });

      setStep('Configurando Roteamento Cloud...');

      const vercelConfig = isPython ? {
        version: 2,
        builds: [
          { src: "app.py", use: "@vercel/python" },
          { src: "*.html", use: "@vercel/static" },
          { src: "*.css", use: "@vercel/static" },
          { src: "*.js", use: "@vercel/static" }
        ],
        routes: [
          { src: "/api/(.*)", dest: "/app.py" },
          { src: "/(.*)", dest: "/index.html" }
        ]
      } : {
        version: 2,
        public: true,
        cleanUrls: true,
        trailingSlash: false,
        rewrites: [
          { source: "/(.*)", destination: "/index.html" }
        ]
      };

      vercelFiles.push({
        file: 'vercel.json',
        data: JSON.stringify(vercelConfig, null, 2)
      });

      setStep('Lançando para Vercel API...');
      
      const response = await fetch('https://api.vercel.com/v13/deployments', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: vProjectName,
          files: vercelFiles,
          projectSettings: {
            framework: null,
            buildCommand: null,
            outputDirectory: null,
            installCommand: isPython ? "pip install -r requirements.txt" : null
          }
        })
      });

      const data = await response.json();

      if (!response.ok) {
        let message = 'A Vercel rejeitou os arquivos.';
        
        if (response.status === 401 || response.status === 403) {
          message = 'Token de acesso inválido ou sem permissões. Verifique se o seu token tem permissão de "Deployment".';
        } else if (response.status === 400) {
          message = `Erro na requisição: ${data.error?.message || 'Verifique o nome do projeto e os arquivos.'}`;
        } else if (response.status === 409) {
          message = 'Já existe um deploy em andamento ou o nome do projeto está em conflito.';
        } else if (data.error?.message) {
          message = data.error.message;
        }

        throw new Error(message);
      }

      localStorage.setItem('dujao_vercel_token', token);
      if (onVercelUpdate) onVercelUpdate(token);

      setStep('Finalizando...');
      setDeployUrl(data.url);
      
      setTimeout(() => {
        setStatus('success');
      }, 1000);

    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || 'Erro crítico: Verifique sua conexão e o Token.');
      setStatus('error');
    }
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-slate-950/98 backdrop-blur-2xl">
      <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-[3rem] shadow-[0_0_150px_rgba(0,0,0,1)] overflow-hidden animate-in fade-in zoom-in duration-500">
        
        <div className="p-10 border-b border-slate-800 flex items-center justify-between bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
          <div className="flex items-center gap-5">
            <div className="w-14 h-14 bg-white rounded-[1.25rem] flex items-center justify-center shadow-[0_0_40px_rgba(255,255,255,0.15)] transform -rotate-3">
               <svg className="w-8 h-8 text-black" viewBox="0 0 76 65" fill="currentColor"><path d="M37.5274 0L75.0548 65H0L37.5274 0Z"/></svg>
            </div>
            <div>
              <h3 className="font-black text-base uppercase tracking-[0.3em] text-white leading-none">Vercel Deploy</h3>
              <p className="text-[10px] text-blue-500 font-black mt-2 uppercase tracking-[0.2em] opacity-80">João Layon CEO Edition</p>
            </div>
          </div>
          <button onClick={onClose} className="w-12 h-12 rounded-full flex items-center justify-center bg-slate-800/50 text-slate-400 hover:bg-slate-700 hover:text-white transition-all">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        <div className="p-10 space-y-8">
          {status === 'success' ? (
            <div className="text-center py-12 space-y-10 animate-in fade-in slide-in-from-bottom-10 duration-700">
               <div className="relative inline-block">
                 <div className="absolute inset-0 bg-blue-500 blur-3xl opacity-30 animate-pulse"></div>
                 <div className="text-8xl relative drop-shadow-2xl">🚀</div>
               </div>
               <div>
                 <h4 className="text-white font-black uppercase text-lg tracking-[0.5em]">Sistema Online</h4>
                 <p className="text-[12px] text-slate-500 font-bold mt-4 leading-relaxed max-w-[80%] mx-auto">
                   Seu projeto foi otimizado e implantado na infraestrutura global da Vercel.
                 </p>
               </div>
               
               <div className="space-y-4">
                 <a 
                   href={`https://${deployUrl}`} 
                   target="_blank" 
                   rel="noopener noreferrer"
                   className="w-full flex items-center justify-center py-6 bg-blue-600 text-white rounded-[2rem] font-black text-xs uppercase tracking-[0.4em] shadow-[0_20px_40px_rgba(37,99,235,0.3)] hover:scale-[1.03] active:scale-95 transition-all"
                 >
                   VISUALIZAR AGORA
                 </a>
                 <p className="text-[10px] text-slate-600 font-mono tracking-tighter truncate opacity-50">{deployUrl}</p>
               </div>
            </div>
          ) : (
            <>
              {status === 'error' && (
                <div className="p-6 bg-red-500/10 border border-red-500/20 rounded-3xl text-red-400 text-[11px] font-black uppercase tracking-widest text-center leading-relaxed animate-shake">
                  <div className="flex flex-col gap-2">
                    <span className="text-red-300">⚠️ Erro Detectado:</span>
                    <span>{errorMsg}</span>
                  </div>
                </div>
              )}

              <div className="space-y-8">
                <div className="p-6 bg-blue-600/5 border border-blue-600/10 rounded-[2rem] flex gap-5 items-center">
                   <div className="w-10 h-10 bg-blue-600/20 rounded-full flex items-center justify-center text-xl shadow-inner">🛡️</div>
                   <div>
                     <p className="text-[10px] text-blue-400 font-black uppercase tracking-widest mb-1">Proteção de Roteamento</p>
                     <p className="text-[11px] text-slate-500 leading-relaxed font-bold">
                       Injetamos um script de debug para diagnosticar a "tela escura" automaticamente.
                     </p>
                   </div>
                </div>

                <div className="space-y-6">
                  <div className="relative group">
                    <label className="text-[10px] font-black text-slate-600 uppercase tracking-widest ml-6 mb-3 block group-focus-within:text-blue-500 transition-colors">Vercel API Token</label>
                    <input
                      type="password"
                      value={token}
                      onChange={(e) => setToken(e.target.value)}
                      className="w-full bg-slate-950/50 border border-slate-800 rounded-[2rem] px-8 py-5 text-sm text-white outline-none focus:border-blue-600 focus:bg-slate-950 transition-all text-center placeholder:text-slate-800"
                      placeholder="Colar Token aqui..."
                    />
                  </div>

                  <div className="relative group">
                    <label className="text-[10px] font-black text-slate-600 uppercase tracking-widest ml-6 mb-3 block group-focus-within:text-blue-500 transition-colors">Nome do Projeto</label>
                    <input
                      type="text"
                      value={vProjectName}
                      onChange={(e) => setVProjectName(e.target.value.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''))}
                      className="w-full bg-slate-950/50 border border-slate-800 rounded-[2rem] px-8 py-5 text-sm text-white outline-none focus:border-blue-600 focus:bg-slate-950 transition-all text-center font-mono"
                    />
                  </div>
                </div>
              </div>

              <div className="pt-4">
                <button 
                  onClick={handleDeploy}
                  disabled={status === 'loading'}
                  className="w-full relative group"
                >
                  <div className={`absolute inset-0 bg-blue-600 blur-2xl opacity-10 group-hover:opacity-30 transition-opacity ${status === 'loading' ? 'opacity-40' : ''}`}></div>
                  <div className="relative py-6 bg-white hover:bg-slate-100 disabled:bg-slate-800 disabled:text-slate-600 text-black text-[13px] font-black uppercase tracking-[0.4em] rounded-[2.5rem] shadow-2xl transition-all flex items-center justify-center gap-4 active:scale-95">
                    {status === 'loading' ? (
                      <>
                        <div className="w-5 h-5 border-4 border-slate-300 border-t-black rounded-full animate-spin"></div>
                        {step.toUpperCase()}
                      </>
                    ) : (
                      <>SOLICITAR DEPLOY</>
                    )}
                  </div>
                </button>
              </div>
            </>
          )}
        </div>
        
        <div className="p-8 bg-slate-950/60 border-t border-slate-800 flex justify-between items-center px-12">
           <p className="text-[10px] text-slate-700 font-black uppercase tracking-[0.4em]">DUJÃO 22 CLOUD OPS</p>
           <a href="https://vercel.com/account/tokens" target="_blank" rel="noopener" className="text-[10px] text-blue-600 font-black uppercase tracking-widest hover:text-blue-400 transition-colors">New Token →</a>
        </div>
      </div>
    </div>
  );
};
