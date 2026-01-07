
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
    setStep('Analisando estrutura do projeto...');

    try {
      const projectFiles = Object.values(files) as ProjectFile[];
      const isPython = projectFiles.some(f => f.name.endsWith('.py'));
      const hasIndex = projectFiles.some(f => f.name === 'index.html');

      if (!hasIndex && !isPython) {
        throw new Error("Projeto inválido: Crie um 'index.html' para Frontend ou 'app.py' para Backend.");
      }

      setStep('Gerando vercel.json otimizado...');
      
      const vercelFiles: any[] = projectFiles.map(file => ({
        file: file.name,
        data: file.content
      }));

      // Injeção de vercel.json otimizado para evitar "tela escura"
      const vercelConfig = isPython ? {
        version: 2,
        builds: [
          { src: "*.py", use: "@vercel/python" },
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

      // Se for python, garante o requirements.txt
      if (isPython && !projectFiles.some(f => f.name === 'requirements.txt')) {
        vercelFiles.push({
          file: 'requirements.txt',
          data: 'flask\ngunicorn\nrequests'
        });
      }

      setStep('Fazendo upload para a Vercel Cloud...');
      
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
            outputDirectory: null
          }
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error?.message || 'A Vercel rejeitou o deploy. Verifique seu Token.');
      }

      localStorage.setItem('dujao_vercel_token', token);
      if (onVercelUpdate) onVercelUpdate(token);

      setStep('Aguardando propagação DNS...');
      setDeployUrl(data.url);
      
      // Simulação de tempo de build/propagação
      setTimeout(() => {
        setStatus('success');
      }, 1500);

    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || 'Erro crítico na conexão com a Vercel.');
      setStatus('error');
    }
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-slate-950/95 backdrop-blur-xl">
      <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-[2.5rem] shadow-[0_0_100px_rgba(0,0,0,0.8)] overflow-hidden animate-in fade-in zoom-in duration-300">
        
        {/* Header Profissional */}
        <div className="p-8 border-b border-slate-800 flex items-center justify-between bg-gradient-to-r from-slate-950 to-slate-900">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-[0_0_20px_rgba(255,255,255,0.2)]">
               <svg className="w-7 h-7 text-black" viewBox="0 0 76 65" fill="currentColor"><path d="M37.5274 0L75.0548 65H0L37.5274 0Z"/></svg>
            </div>
            <div>
              <h3 className="font-black text-sm uppercase tracking-[0.2em] text-white leading-none">Vercel Deploy Pro</h3>
              <p className="text-[10px] text-slate-500 font-bold mt-1.5 uppercase tracking-widest">Dujão 22 Optimization Engine</p>
            </div>
          </div>
          <button onClick={onClose} className="w-10 h-10 rounded-full flex items-center justify-center bg-slate-800 text-slate-500 hover:text-white transition-all active:scale-90">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        <div className="p-8 space-y-8">
          {status === 'success' ? (
            <div className="text-center py-12 space-y-8 animate-in slide-in-from-bottom-8 duration-500">
               <div className="relative inline-block">
                 <div className="absolute inset-0 bg-emerald-500 blur-2xl opacity-20 animate-pulse"></div>
                 <div className="text-7xl relative">🌎</div>
               </div>
               <div>
                 <h4 className="text-emerald-400 font-black uppercase text-sm tracking-[0.4em]">Deploy Finalizado!</h4>
                 <p className="text-[11px] text-slate-500 font-bold mt-3 leading-relaxed">Configuramos o roteamento dinâmico para evitar falhas.</p>
               </div>
               
               <div className="space-y-3">
                 <a 
                   href={`https://${deployUrl}`} 
                   target="_blank" 
                   rel="noopener noreferrer"
                   className="w-full flex items-center justify-center py-5 bg-white text-black rounded-[2rem] font-black text-xs uppercase tracking-widest shadow-2xl hover:scale-105 active:scale-95 transition-all"
                 >
                   ABRIR PROJETO LIVE
                 </a>
                 <p className="text-[10px] text-slate-600 font-mono tracking-tighter truncate px-4">{deployUrl}</p>
               </div>
            </div>
          ) : (
            <>
              {status === 'error' && (
                <div className="p-5 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-400 text-[10px] font-black uppercase tracking-widest text-center animate-shake">
                  {errorMsg}
                </div>
              )}

              <div className="space-y-6">
                <div className="p-5 bg-blue-600/5 border border-blue-600/10 rounded-[1.5rem] flex gap-4 items-start">
                   <span className="text-xl">✨</span>
                   <div>
                     <p className="text-[10px] text-blue-400 font-black uppercase tracking-widest mb-1">Otimização Automática</p>
                     <p className="text-[11px] text-slate-500 leading-relaxed font-medium">
                       Detectamos seu projeto e criaremos um <b>vercel.json</b> personalizado para garantir roteamento limpo e evitar telas pretas.
                     </p>
                   </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="text-[10px] font-black text-slate-600 uppercase tracking-widest ml-4 mb-2 block">Vercel API Token</label>
                    <input
                      type="password"
                      value={token}
                      onChange={(e) => setToken(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-[1.5rem] px-6 py-4 text-xs text-white outline-none focus:border-blue-500 transition-all text-center placeholder:text-slate-700"
                      placeholder="Paste your token here..."
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-black text-slate-600 uppercase tracking-widest ml-4 mb-2 block">Identificador do Projeto</label>
                    <input
                      type="text"
                      value={vProjectName}
                      onChange={(e) => setVProjectName(e.target.value.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''))}
                      className="w-full bg-slate-950 border border-slate-800 rounded-[1.5rem] px-6 py-4 text-xs text-white outline-none focus:border-blue-500 transition-all text-center font-mono"
                      placeholder="project-slug-name"
                    />
                  </div>
                </div>
              </div>

              <div className="pt-2">
                <button 
                  onClick={handleDeploy}
                  disabled={status === 'loading'}
                  className="w-full relative group"
                >
                  <div className={`absolute inset-0 bg-blue-600 blur-xl opacity-20 group-hover:opacity-40 transition-opacity ${status === 'loading' ? 'animate-pulse' : ''}`}></div>
                  <div className="relative py-5 bg-blue-600 hover:bg-blue-500 disabled:bg-slate-800 text-white text-[12px] font-black uppercase tracking-[0.3em] rounded-[2rem] shadow-2xl transition-all flex items-center justify-center gap-4 active:scale-95">
                    {status === 'loading' ? (
                      <>
                        <div className="w-5 h-5 border-3 border-white/20 border-t-white rounded-full animate-spin"></div>
                        {step.toUpperCase()}
                      </>
                    ) : (
                      <>PUBLICAR EM PRODUÇÃO</>
                    )}
                  </div>
                </button>
              </div>
            </>
          )}
        </div>
        
        <div className="p-6 bg-slate-950/50 border-t border-slate-800 flex justify-between items-center px-10">
           <p className="text-[9px] text-slate-700 font-black uppercase tracking-[0.6em]">CLOUD-ENGINE V3</p>
           <a href="https://vercel.com/account/tokens" target="_blank" rel="noopener" className="text-[9px] text-blue-500 font-black uppercase tracking-widest hover:text-blue-400">Get Token →</a>
        </div>
      </div>
    </div>
  );
};
