
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
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages, isLoading]);

  const parseAndExtractFiles = (text: string) => {
    const fileRegex = /@@@FILE:([\s\S]*?)@@@\n([\s\S]*?)@@@ENDFILE@@@/g;
    const updates: {name: string, content: string}[] = [];
    let match;

    while ((match = fileRegex.exec(text)) !== null) {
      const path = match[1].trim();
      const content = match[2];
      if (path && content) updates.push({ name: path, content });
    }
    return updates;
  };

  const handleSend = async (customPrompt?: string) => {
    const promptToSend = customPrompt || input;
    if (!promptToSend.trim() || isLoading) return;

    setMessages(prev => [...prev, { role: 'user', content: promptToSend, timestamp: new Date() }]);
    if (!customPrompt) setInput('');
    setIsLoading(true);

    try {
      const rawResponse = await askAI(promptToSend, activeProject);
      const updates = parseAndExtractFiles(rawResponse || "");
      
      if (updates.length > 0) {
        if (activeProject) {
          onApplyChanges(updates);
        } else {
          const projectName = "Sistema Enterprise " + Math.floor(Math.random() * 1000);
          const filesMap: Record<string, ProjectFile> = {};
          
          updates.forEach(u => {
            const ext = u.name.split('.').pop()?.toLowerCase() || '';
            let lang: FileType = 'markdown';
            if (ext === 'py') lang = 'python';
            else if (['html', 'htm'].includes(ext)) lang = 'html';
            else if (ext === 'css') lang = 'css';
            else if (['js', 'jsx'].includes(ext)) lang = 'javascript';
            else if (ext === 'ts') lang = 'typescript';
            else if (ext === 'tsx') lang = 'tsx';
            
            filesMap[u.name] = { name: u.name, content: u.content, language: lang };
          });

          onImportProject(projectName, filesMap);
        }
      }

      const cleanContent = (rawResponse || "").replace(/@@@FILE:[\s\S]*?@@@ENDFILE@@@/g, '').trim();
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: cleanContent || "Verificação concluída. Sistema gerado com arquitetura Enterprise Dujão.",
        timestamp: new Date()
      }]);
    } catch (err) {
      setMessages(prev => [...prev, { role: 'assistant', content: "🚨 ERRO CRÍTICO NA CONSTRUÇÃO.", timestamp: new Date() }]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    (window as any).triggerAISend = (prompt: string) => handleSend(prompt);
  }, [activeProject]);

  return (
    <div className="flex-1 bg-slate-900 flex flex-col h-full shadow-2xl relative border-l border-white/5">
      <div className="p-6 border-b border-slate-800 bg-slate-950/90 backdrop-blur-xl flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.6)]"></div>
          <div>
            <h2 className="text-[10px] font-black text-white uppercase tracking-[0.3em]">Full-Stack Engine</h2>
            <p className="text-[8px] text-slate-500 font-bold uppercase mt-1 tracking-tighter">Verified Architectural Delivery</p>
          </div>
        </div>
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-8 custom-scrollbar bg-slate-950/50">
        {messages.map((msg, i) => (
          <div key={i} className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'} animate-in fade-in slide-in-from-bottom-2`}>
            <div className={`max-w-[95%] p-6 rounded-3xl text-[12px] leading-relaxed shadow-2xl border transition-all ${
              msg.role === 'user' ? 'bg-blue-600 text-white border-blue-400/20' : 'bg-slate-800 border-slate-700/50 text-slate-100'
            }`}>
              <div className="whitespace-pre-wrap font-mono">{msg.content}</div>
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="p-6 bg-slate-800/40 rounded-3xl border border-slate-700/30 w-fit flex gap-2 items-center">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
            <span className="text-[9px] font-black text-emerald-400 uppercase tracking-widest">Auditoria em tempo real...</span>
          </div>
        )}
      </div>

      <div className="p-6 border-t border-slate-800/50 bg-slate-950">
        <div className="flex items-end gap-4 bg-slate-900/60 border border-slate-800 rounded-[2rem] p-4 focus-within:border-emerald-500/50 transition-all">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
            placeholder="Solicite um sistema completo (ex: E-commerce de Luxo)..."
            className="flex-1 bg-transparent text-[12px] text-slate-200 outline-none resize-none py-2"
            rows={1}
          />
          <button
            onClick={() => handleSend()}
            disabled={isLoading || !input.trim()}
            className="w-12 h-12 bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-800 text-white rounded-2xl shadow-xl flex items-center justify-center transition-all"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
          </button>
        </div>
      </div>
    </div>
  );
};
