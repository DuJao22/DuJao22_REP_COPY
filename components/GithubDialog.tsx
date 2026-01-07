
import React, { useState, useEffect } from 'react';
import { ProjectFile } from '../types';

interface GithubDialogProps {
  isOpen: boolean;
  onClose: () => void;
  files: Record<string, ProjectFile>;
  projectName: string;
  onGithubUpdate?: (data: { login: string; avatar_url: string; token: string } | null) => void;
  savedGithub?: { login: string; avatar_url: string; token: string };
}

export const GithubDialog: React.FC<GithubDialogProps> = ({ 
  isOpen, 
  onClose, 
  files, 
  projectName, 
  onGithubUpdate,
  savedGithub 
}) => {
  const [pat, setPat] = useState(savedGithub?.token || localStorage.getItem('dujao_github_pat') || '');
  const [repo, setRepo] = useState(localStorage.getItem('dujao_github_repo') || ''); 
  const [branch, setBranch] = useState('main');
  const [message, setMessage] = useState(`Deploy via Dujão 22 Engine: ${projectName}`);
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error' | 'connecting'>('idle');
  const [errorMsg, setErrorMsg] = useState('');
  const [profile, setProfile] = useState<any>(savedGithub || null);

  useEffect(() => {
    if (pat && isOpen && !profile) {
      validateToken(pat);
    }
  }, [isOpen]);

  const validateToken = async (token: string) => {
    if (!token) return;
    setStatus('connecting');
    try {
      const resp = await fetch('https://api.github.com/user', {
        headers: { 'Authorization': `token ${token}` }
      });
      if (resp.ok) {
        const data = await resp.json();
        const githubData = {
          login: data.login,
          avatar_url: data.avatar_url,
          token: token
        };
        setProfile(githubData);
        if (onGithubUpdate) onGithubUpdate(githubData);
        setStatus('idle');
        setErrorMsg('');
      } else {
        setProfile(null);
        setErrorMsg('Token inválido ou expirado.');
        setStatus('error');
      }
    } catch (e) {
      setStatus('error');
      setErrorMsg('Erro de conexão com GitHub API.');
    }
  };

  const handleQuickLogin = () => {
    const scopes = 'repo,workflow,write:packages';
    const note = `Dujao22_IDE_${Date.now()}`;
    window.open(`https://github.com/settings/tokens/new?description=${note}&scopes=${scopes}`, '_blank');
  };

  const handleLogout = () => {
    setPat('');
    setProfile(null);
    localStorage.removeItem('dujao_github_pat');
    if (onGithubUpdate) onGithubUpdate(null);
  };

  const handleCommit = async () => {
    if (!pat || !repo) {
      setErrorMsg('Token e Repositório são obrigatórios.');
      setStatus('error');
      return;
    }

    setStatus('loading');
    setErrorMsg('');
    localStorage.setItem('dujao_github_repo', repo);

    try {
      const headers = {
        'Authorization': `token ${pat}`,
        'Accept': 'application/vnd.github.v3+json',
        'Content-Type': 'application/json'
      };

      const baseResponse = await fetch(`https://api.github.com/repos/${repo}/branches/${branch}`, { headers });
      if (!baseResponse.ok) throw new Error(`Repositório "${repo}" não encontrado.`);
      
      const baseData = await baseResponse.json();
      const baseTreeSha = baseData.commit.commit.tree.sha;
      const baseCommitSha = baseData.commit.sha;

      const treeEntries = (Object.values(files) as ProjectFile[]).map(file => ({
        path: file.name,
        mode: '100644',
        type: 'blob',
        content: file.content
      }));

      const treeResponse = await fetch(`https://api.github.com/repos/${repo}/git/trees`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ base_tree: baseTreeSha, tree: treeEntries })
      });
      const treeData = await treeResponse.json();

      const commitResponse = await fetch(`https://api.github.com/repos/${repo}/git/commits`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          message,
          tree: treeData.sha,
          parents: [baseCommitSha]
        })
      });
      const commitData = await commitResponse.json();

      const pushResponse = await fetch(`https://api.github.com/repos/${repo}/git/refs/heads/${branch}`, {
        method: 'PATCH',
        headers,
        body: JSON.stringify({ sha: commitData.sha, force: false })
      });

      if (!pushResponse.ok) throw new Error('Falha ao atualizar referência no GitHub.');

      setStatus('success');
      setTimeout(() => { onClose(); setStatus('idle'); }, 2000);
    } catch (err: any) {
      setErrorMsg(err.message || 'Erro crítico no processo de Commit.');
      setStatus('error');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-slate-950/95 backdrop-blur-xl">
      <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-[2.5rem] shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300">
        <div className="p-8 border-b border-slate-800 flex items-center justify-between bg-slate-950/50">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-white rounded-2xl flex items-center justify-center shadow-lg">
               <svg className="w-6 h-6 text-slate-900" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" /></svg>
            </div>
            <div>
              <h3 className="font-black text-sm uppercase tracking-widest text-white leading-none">GitHub Connect</h3>
              <p className="text-[10px] text-slate-500 font-bold mt-1 uppercase">Dujão 22 Deployment Engine</p>
            </div>
          </div>
          <button onClick={onClose} className="w-10 h-10 rounded-full flex items-center justify-center bg-slate-800 text-slate-400 hover:text-white transition-all">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        <div className="p-8 space-y-8">
          {profile ? (
            <div className="flex items-center gap-5 p-5 bg-slate-950/50 border border-slate-800 rounded-[2rem] shadow-inner">
              <img src={profile.avatar_url} alt={profile.login} className="w-16 h-16 rounded-2xl border-2 border-slate-800 shadow-xl" />
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                  <p className="text-[10px] text-emerald-500 font-black uppercase tracking-widest">Sessão Ativa</p>
                </div>
                <p className="text-lg font-black text-white leading-tight">@{profile.login}</p>
                <button onClick={handleLogout} className="text-[9px] font-black text-red-500 hover:text-red-400 uppercase tracking-widest mt-1">Encerrar Conexão</button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <button 
                onClick={handleQuickLogin}
                className="group w-full flex items-center justify-between p-6 bg-white hover:bg-slate-100 text-slate-900 rounded-[2rem] font-black text-xs uppercase tracking-widest shadow-2xl transition-all active:scale-95"
              >
                <span>🚀 Login Rápido (Gerar Token)</span>
                <span className="bg-slate-900 text-white px-3 py-1 rounded-full text-[9px] group-hover:scale-110 transition-transform">AUTO-TOKEN</span>
              </button>
              
              <div className="relative">
                <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-800"></div></div>
                <div className="relative flex justify-center"><span className="bg-slate-900 px-4 text-[9px] font-black text-slate-600 uppercase tracking-widest">Ou insira manualmente</span></div>
              </div>

              <input
                type="password"
                value={pat}
                onChange={(e) => { setPat(e.target.value); validateToken(e.target.value); }}
                className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-6 py-4 text-xs text-white outline-none focus:border-blue-500 transition-all text-center tracking-widest"
                placeholder="ghp_xxxxxxxxxxxxxxxxxxxx"
              />
            </div>
          )}

          {status === 'success' ? (
            <div className="text-center py-10 animate-in fade-in slide-in-from-bottom-4">
               <div className="text-6xl mb-6">🚢</div>
               <h4 className="text-emerald-400 font-black uppercase text-sm tracking-[0.3em]">Deploy Concluído!</h4>
               <p className="text-[11px] text-slate-500 font-bold mt-3">Os arquivos foram sincronizados com sucesso.</p>
            </div>
          ) : (
            <div className={`space-y-6 transition-all ${!profile ? 'opacity-30 pointer-events-none grayscale' : 'opacity-100'}`}>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Repositório Target</label>
                  <input
                    type="text"
                    value={repo}
                    onChange={(e) => setRepo(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-5 py-4 text-xs text-white outline-none focus:border-blue-500 font-mono"
                    placeholder="usuario/projeto"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Branch</label>
                  <input
                    type="text"
                    value={branch}
                    onChange={(e) => setBranch(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-5 py-4 text-xs text-white outline-none focus:border-blue-500 font-mono"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Mensagem do Commit</label>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-5 py-4 text-xs text-white outline-none focus:border-blue-500 h-24 resize-none leading-relaxed"
                />
              </div>

              {errorMsg && (
                <div className="bg-red-500/10 border border-red-500/20 p-4 rounded-2xl text-[10px] text-red-400 font-bold uppercase tracking-wider text-center">{errorMsg}</div>
              )}

              <button 
                onClick={handleCommit}
                disabled={status === 'loading' || status === 'connecting' || !profile}
                className="w-full py-5 bg-blue-600 hover:bg-blue-500 disabled:bg-slate-800 disabled:text-slate-600 text-white text-[12px] font-black uppercase tracking-[0.25em] rounded-[2rem] shadow-2xl transition-all flex items-center justify-center gap-4 active:scale-95"
              >
                {status === 'loading' ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                    REALIZANDO PUSH...
                  </>
                ) : (
                  <>ENVIAR PARA GITHUB</>
                )}
              </button>
            </div>
          )}
        </div>
        
        <div className="p-6 bg-slate-950/40 border-t border-slate-800 text-center">
           <p className="text-[9px] text-slate-700 font-black uppercase tracking-[0.6em]">DIGITAL SOLUTIONS • CLOUD DEPLOY ENGINE</p>
        </div>
      </div>
    </div>
  );
};
