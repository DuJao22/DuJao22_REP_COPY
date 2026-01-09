
import React, { useState } from 'react';
import { GoogleGenAI } from "@google/genai";

interface AdminSettingsProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AdminSettings: React.FC<AdminSettingsProps> = ({ isOpen, onClose }) => {
  const [verifyStatus, setVerifyStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  if (!isOpen) return null;

  const handleManageKey = async () => {
    try {
      const aiStudio = (window as any).aistudio;
      if (aiStudio && typeof aiStudio.openSelectKey === 'function') {
        await aiStudio.openSelectKey();
        setVerifyStatus('idle'); // Reset status when changing key
      }
    } catch (err) {
      alert("Não foi possível abrir o seletor de chaves. Verifique as permissões do sistema.");
    }
  };

  const verifyKeyFunctionality = async () => {
    setVerifyStatus('loading');
    setErrorMessage('');
    
    try {
      // Criar nova instância para garantir o uso da chave mais recente
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: 'Ping',
      });
      
      if (response && response.text) {
        setVerifyStatus('success');
      } else {
        throw new Error("Resposta vazia do cluster.");
      }
    } catch (err: any) {
      setVerifyStatus('error');
      setErrorMessage(err.message || 'Erro desconhecido na autenticação.');
    }
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-300">
      <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-[2.5rem] shadow-2xl overflow-hidden">
        <div className="p-8 border-b border-slate-800 flex items-center justify-between bg-slate-950/50">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-slate-800 rounded-2xl flex items-center justify-center text-xl shadow-inner transform -rotate-3 border border-slate-700">⚙️</div>
            <div>
              <h3 className="font-black text-sm uppercase tracking-widest text-white leading-none">Configurações de Engine</h3>
              <p className="text-[10px] text-slate-500 font-bold mt-1 uppercase">Dujão 22 Core Security</p>
            </div>
          </div>
          <button onClick={onClose} className="w-10 h-10 rounded-full flex items-center justify-center bg-slate-800 text-slate-400 hover:text-white transition-all">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        <div className="p-10 space-y-10">
          <section>
            <div className="flex items-center justify-between mb-6">
               <h4 className="text-[10px] font-black text-blue-400 uppercase tracking-[0.3em]">Módulo Gemini API</h4>
               {verifyStatus === 'success' && (
                 <div className="flex items-center gap-2 bg-emerald-500/10 px-3 py-1 rounded-full">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
                    <span className="text-[9px] font-black text-emerald-500 uppercase tracking-widest">Funcional</span>
                 </div>
               )}
            </div>
            
            <div className="p-6 bg-slate-950/50 border border-slate-800 rounded-[2rem] space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-black text-slate-200 uppercase tracking-tight">Status da Credencial</p>
                  <p className="text-[10px] text-slate-500 font-bold mt-1 uppercase">Injetada via Environment Variable</p>
                </div>
              </div>
              
              <div className="grid grid-cols-1 gap-3">
                <button 
                  onClick={handleManageKey}
                  className="w-full py-4 bg-slate-800 hover:bg-slate-700 text-white text-[10px] font-black uppercase tracking-[0.2em] rounded-2xl transition-all flex items-center justify-center gap-3 border border-slate-700/50"
                >
                  <svg className="w-4 h-4 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" /></svg>
                  ALTERAR CHAVE NO AI STUDIO
                </button>

                <button 
                  onClick={verifyKeyFunctionality}
                  disabled={verifyStatus === 'loading'}
                  className={`w-full py-4 ${verifyStatus === 'success' ? 'bg-emerald-600' : 'bg-blue-600 hover:bg-blue-500'} text-white text-[10px] font-black uppercase tracking-[0.2em] rounded-2xl transition-all shadow-xl shadow-blue-900/20 active:scale-95 flex items-center justify-center gap-3`}
                >
                  {verifyStatus === 'loading' ? (
                    <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                  ) : verifyStatus === 'success' ? (
                    <>✅ CONEXÃO ESTABELECIDA</>
                  ) : (
                    <>🚀 TESTAR FUNCIONALIDADE</>
                  )}
                </button>
              </div>

              {verifyStatus === 'error' && (
                <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl text-[9px] text-red-400 font-bold uppercase tracking-widest text-center animate-shake">
                  {errorMessage || "Falha na validação da chave."}
                </div>
              )}
            </div>
          </section>

          <section>
            <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] mb-4">Auth System</h4>
            <div className="flex items-center gap-5 p-6 bg-slate-800/20 rounded-[2rem] border border-slate-800 shadow-inner">
              <div className="w-14 h-14 bg-blue-600 rounded-2xl flex items-center justify-center font-black text-lg shadow-xl shadow-blue-900/20 transform rotate-3">JL</div>
              <div>
                <p className="text-sm font-black text-slate-100 uppercase tracking-tighter">João Layon</p>
                <p className="text-[10px] text-slate-500 font-bold uppercase mt-1">CEO – DIGITAL SOLUTIONS</p>
              </div>
            </div>
          </section>
        </div>

        <div className="p-8 bg-slate-950 border-t border-slate-800 flex justify-center">
          <p className="text-[9px] text-slate-700 font-black uppercase tracking-[0.8em]">Dujão 22 • Protocolo de Segurança Ativo</p>
        </div>
      </div>
    </div>
  );
};
