
import React, { useState } from 'react';
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
  const [vProjectName, setVProjectName] = useState(projectName.toLowerCase().replace(/\s+/g, '-'));
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState('');
  const [deployUrl, setDeployUrl] = useState('');

  if (!isOpen) return null;

  const handleDeploy = async () => {
    if (!token || !vProjectName) {
      setErrorMsg('Token e Nome do Projeto são obrigatórios.');
      setStatus('error');
      return;
    }

    setStatus('loading');
    setErrorMsg('');
    localStorage.setItem('dujao_vercel_token', token);
    if (onVercelUpdate) onVercelUpdate(token);

    try {
      // 1. Prepare files for Vercel API
      const vercelFiles = (Object.values(files) as ProjectFile[]).map(file => ({
        file: file.name,
        data: file.content
      }));

      // 2. Create Deployment
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
            framework: null, // Let Vercel auto-detect or treat as static
            buildCommand: null,
            outputDirectory: null
          }
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error?.message || 'Falha ao criar deploy na Vercel.');
      }

      setDeployUrl(data.url);
      setStatus('success');
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || 'Erro inesperado no deploy.');
      setStatus('error');
    }
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-xl">
      <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-[2.5rem] shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300">
        <div className="p-8 border-b border-slate-800 flex items-center justify-between bg-slate-950/50">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-white rounded-2xl flex items-center justify-center shadow-lg">
               <svg className="w-6 h-6 text-black" viewBox="0 0 76 65" fill="currentColor"><path d="M37.5274 0L75.0548 65H0L37.5274 0Z"/></svg>
            </div>
            <div>
              <h3 className="font-black text-sm uppercase tracking-widest text-white leading-none">Vercel Deploy</h3>
              <p className="text-[10px] text-slate-500 font-bold mt-1 uppercase">Instant Production Launch</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 text-slate-500 hover:text-white transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        <div className="p-8 space-y-6">
          {status === 'success' ? (
            <div className="text-center py-10 space-y-6">
               <div className="text-6xl animate-bounce">🌍</div>
               <h4 className="text-emerald-400 font-black uppercase text-sm tracking-[0.3em]">Projeto Online!</h4>
               <p className="text-[11px] text-slate-400 font-bold">Seu sistema foi hospedado com sucesso.</p>
               <a 
                 href={`https://${deployUrl}`} 
                 target="_blank" 
                 rel="noopener noreferrer"
                 className="inline-block px-8 py-4 bg-white text-black rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl hover:scale-105 transition-transform"
               >
                 VISITAR SITE LIVE
               </a>
               <p className="text-[9px] text-slate-600 font-mono">URL: {deployUrl}</p>
            </div>
          ) : (
            <>
              {status === 'error' && (
                <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-400 text-[10px] font-bold uppercase tracking-widest text-center">
                  {errorMsg}
                </div>
              )}

              <div className="space-y-6">
                <div>
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1 mb-2 block">Vercel Personal Access Token</label>
                  <input
                    type="password"
                    value={token}
                    onChange={(e) => setToken(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-6 py-4 text-xs text-white outline-none focus:border-blue-500 transition-all shadow-inner"
                    placeholder="Cole seu Token da Vercel"
                  />
                  <a href="https://vercel.com/account/tokens" target="_blank" rel="noopener" className="text-[9px] text-blue-500 font-black uppercase mt-2 inline-block ml-1 hover:underline">Obter meu Token</a>
                </div>

                <div>
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1 mb-2 block">Nome do Projeto na Vercel</label>
                  <input
                    type="text"
                    value={vProjectName}
                    onChange={(e) => setVProjectName(e.target.value.toLowerCase().replace(/\s+/g, '-'))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-6 py-4 text-xs text-white outline-none focus:border-blue-500 transition-all shadow-inner"
                    placeholder="ex: meu-sistema-incrivel"
                  />
                </div>
              </div>

              <button 
                onClick={handleDeploy}
                disabled={status === 'loading'}
                className="w-full py-5 bg-white hover:bg-slate-100 disabled:bg-slate-800 text-black text-[12px] font-black uppercase tracking-[0.3em] rounded-[2rem] shadow-2xl transition-all flex items-center justify-center gap-4 active:scale-95"
              >
                {status === 'loading' ? (
                  <>
                    <div className="w-4 h-4 border-2 border-black/20 border-t-black rounded-full animate-spin"></div>
                    LANÇANDO EM PRODUÇÃO...
                  </>
                ) : (
                  <>DEPLOY PARA PRODUÇÃO</>
                )}
              </button>
            </>
          )}
        </div>
        
        <div className="p-6 bg-slate-950/40 border-t border-slate-800 text-center">
           <p className="text-[9px] text-slate-700 font-black uppercase tracking-[0.6em]">VERCEL CLOUD INTEGRATION • DUJÃO 22 ENGINE</p>
        </div>
      </div>
    </div>
  );
};
