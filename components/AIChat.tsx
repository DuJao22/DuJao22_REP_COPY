
import React, { useState, useRef, useEffect } from 'react';
import { ChatMessage, ProjectFile, Project, FileType } from '../types';
import { askAI } from '../services/geminiService';

interface AIChatProps {
  files: Record<string, ProjectFile>;
  activeProject: Project | null;
  onApplyChanges: (updates: {name: string, content: string}[]) => void;
  onImportProject: (name: string, files: Record<string, ProjectFile>) => void;
}

export const AIChat: React.FC<AIChatProps> = ({ files, activeProject, onApplyChanges, onImportProject }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  const parseAndExtractFiles = (text: string) => {
    const fileRegex = /@@@FILE:(.*?)@@@\s*?\n([\s\S]*?)\s*?@@@ENDFILE@@@/g;
    const updates: {name: string, content: string}[] = [];
    let match;

    while ((match = fileRegex.exec(text)) !== null) {
      if (match[1] && match[2]) {
        // CORREÇÃO: Remove qualquer caminho de pasta (ex: "public/index.html" -> "index.html")
        const fileName = match[1].trim().split('/').pop() || match[1].trim();
        updates.push({
          name: fileName,
          content: match[2]
        });
      }
    }
    return updates;
  };

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMsg: ChatMessage = {
      role: 'user',
      content: input,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      const rawResponse = await askAI(input, activeProject);
      const updates = parseAndExtractFiles(rawResponse || "");
      
      let systemNote = "";

      if (updates.length > 0) {
        if (activeProject) {
          onApplyChanges(updates);
          systemNote = `⚡ Workspace Sincronizado: ${updates.length} arquivo(s) atualizados.`;
        } else {
          const projectName = "Sistema " + new Date().toLocaleTimeString('pt-BR', {hour: '2-digit', minute: '2-digit'});
          const filesMap: Record<string, ProjectFile> = {};
          
          updates.forEach(u => {
            const ext = u.name.split('.').pop()?.toLowerCase() || '';
            let lang: FileType = 'markdown';
            if (ext === 'py') lang = 'python';
            else if (ext === 'html') lang = 'html';
            else if (ext === 'css') lang = 'css';
            else if (ext === 'js') lang = 'javascript';
            else if (ext === 'json') lang = 'json';
            
            filesMap[u.name] = { name: u.name, content: u.content, language: lang };
          });

          onImportProject(projectName, filesMap);
          systemNote = `🚀 Novo projeto "${projectName}" carregado com sucesso!`;
        }
      }

      const cleanContent = (rawResponse || "").replace(/@@@FILE:[\s\S]*?@@@ENDFILE@@@/g, '').trim();
      
      const aiMsg: ChatMessage = {
        role: 'assistant',
        content: cleanContent || "Comando executado. Os arquivos foram corrigidos e sincronizados.",
        timestamp: new Date()
      };

      setMessages(prev => {
        const next = [...prev, aiMsg];
        if (systemNote) {
          next.push({
            role: 'assistant',
            content: systemNote,
            timestamp: new Date()
          });
        }
        return next;
      });
    } catch (err) {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: "Ops! Ocorreu um erro na Engine. Tente novamente.",
        timestamp: new Date()
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex-1 bg-slate-900 flex flex-col h-full shadow-2xl relative">
      <div className="p-5 border-b border-slate-800 bg-slate-950/80 backdrop-blur-md">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xs font-black text-slate-100 uppercase tracking-[0.25em]">Dujão 22 AI Engine</h2>
            <p className="text-[9px] text-slate-500 font-bold uppercase mt-1">Unified Architect & Developer</p>
          </div>
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full animate-pulse ${activeProject ? 'bg-emerald-500' : 'bg-blue-500'}`}></div>
            <span className="text-[9px] font-black text-slate-400 uppercase">
              {activeProject ? 'Workspace' : 'Global'}
            </span>
          </div>
        </div>
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto p-5 space-y-6 custom-scrollbar bg-slate-900/30">
        {messages.length === 0 && (
          <div className="text-center mt-24 px-10">
            <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-8 shadow-xl">
              <span className="text-3xl">🤖</span>
            </div>
            <h3 className="font-black text-slate-100 mb-3 text-xs uppercase tracking-widest">IA Unificada</h3>
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-tighter">
              Descreva seu sistema. Eu cuido do planejamento e do código, garantindo que tudo funcione perfeitamente.
            </p>
          </div>
        )}
        
        {messages.map((msg, i) => (
          <div key={i} className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
            <div className={`max-w-[95%] p-4 rounded-2xl text-[12px] leading-relaxed shadow-lg border transition-all ${
              msg.role === 'user' 
                ? 'bg-blue-600 text-white border-blue-400/20 rounded-tr-none' 
                : 'bg-slate-800 border-slate-700 text-slate-100 rounded-tl-none'
            }`}>
              <div className="whitespace-pre-wrap code-font">{msg.content}</div>
            </div>
            <div className="mt-2 px-1 flex items-center gap-2">
              <span className={`text-[8px] font-black uppercase tracking-widest ${msg.role === 'user' ? 'text-slate-500' : 'text-blue-400'}`}>
                {msg.role === 'user' ? 'VOCÊ' : 'DUJÃO AI'}
              </span>
            </div>
          </div>
        ))}
        
        {isLoading && (
          <div className="p-4 bg-slate-800/50 rounded-2xl border border-slate-700 animate-pulse w-fit">
            <div className="flex gap-1.5">
              <div className="w-1 h-1 rounded-full bg-slate-500 animate-bounce"></div>
              <div className="w-1 h-1 rounded-full bg-slate-500 animate-bounce [animation-delay:0.2s]"></div>
              <div className="w-1 h-1 rounded-full bg-slate-500 animate-bounce [animation-delay:0.4s]"></div>
            </div>
          </div>
        )}
      </div>

      <div className="p-4 border-t border-slate-800 bg-slate-950">
        <div className="flex items-end gap-2 bg-slate-900 border border-slate-800 rounded-xl p-3 focus-within:ring-2 focus-within:ring-blue-500/20 transition-all">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
            placeholder="Mande sua ideia ou peça uma correção..."
            className="flex-1 bg-transparent text-[12px] text-slate-200 outline-none resize-none py-1 max-h-32"
            rows={1}
          />
          <button
            onClick={handleSend}
            disabled={isLoading || !input.trim()}
            className="p-2.5 bg-blue-600 hover:bg-blue-500 rounded-lg shadow-lg"
          >
            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>
          </button>
        </div>
        <p className="mt-3 text-[7px] text-slate-700 text-center font-black uppercase tracking-[0.5em]">JOÃO LAYON CEO</p>
      </div>
    </div>
  );
};
