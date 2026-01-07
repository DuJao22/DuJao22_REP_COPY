
import React from 'react';

interface AdminSettingsProps {
  isOpen: boolean;
  onClose: () => void;
}

// Fixed: Removed the conflicting declare global block that was causing "identical modifiers" 
// and "type mismatch" errors. We now access aistudio via window casting.

export const AdminSettings: React.FC<AdminSettingsProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const handleManageKey = async () => {
    try {
      // Access the platform-provided aistudio object. 
      // We use (window as any) to safely access it without conflicting with global type definitions.
      const aiStudio = (window as any).aistudio;
      if (aiStudio && typeof aiStudio.openSelectKey === 'function') {
        await aiStudio.openSelectKey();
      }
    } catch (err) {
      alert("Não foi possível abrir o seletor de chaves. Verifique as permissões do sistema.");
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
      <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden">
        <div className="p-6 border-b border-slate-800 flex items-center justify-between bg-slate-900/50">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-slate-800 rounded-lg flex items-center justify-center">⚙️</div>
            <h3 className="font-bold text-lg">Configurações do Sistema</h3>
          </div>
          <button onClick={onClose} className="text-slate-500 hover:text-white transition-colors">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        <div className="p-8 space-y-8">
          <section>
            <h4 className="text-xs font-bold text-blue-400 uppercase tracking-widest mb-4">Conectividade Gemini API</h4>
            <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-bold text-slate-200">Chave de API do Projeto</p>
                  <p className="text-xs text-slate-500">A chave é gerenciada via Environment Injector.</p>
                </div>
                <div className="px-2 py-1 bg-green-500/10 text-green-500 text-[10px] font-bold rounded uppercase">Ativo</div>
              </div>
              
              <p className="text-xs text-slate-400 leading-relaxed">
                Para manter o Arquiteto e o Desenvolvedor funcionando, você pode gerenciar ou atualizar sua chave através do seletor oficial do AI Studio.
              </p>

              <button 
                onClick={handleManageKey}
                className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" /></svg>
                TROCAR CHAVE API (AI STUDIO)
              </button>
              
              <div className="pt-2">
                <a 
                  href="https://ai.google.dev/gemini-api/docs/billing" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-[10px] text-slate-500 hover:text-blue-400 underline uppercase font-bold"
                >
                  Documentação de Faturamento e Chaves
                </a>
              </div>
            </div>
          </section>

          <section>
            <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4">Informações do Proprietário</h4>
            <div className="flex items-center gap-4 p-4 bg-slate-800/30 rounded-xl border border-slate-800">
              <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center font-bold">JL</div>
              <div>
                <p className="text-sm font-bold text-slate-100">João Layon</p>
                <p className="text-xs text-slate-400">CEO – Digital Solutions</p>
              </div>
            </div>
          </section>
        </div>

        <div className="p-6 bg-slate-900/80 border-t border-slate-800 flex justify-end">
          <button 
            onClick={onClose}
            className="px-6 py-2 bg-slate-800 hover:bg-slate-700 text-xs font-bold rounded-lg transition-colors"
          >
            FECHAR
          </button>
        </div>
      </div>
    </div>
  );
};
