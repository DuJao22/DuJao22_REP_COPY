
import React from 'react';
import { ProjectFile } from '../types';

interface FileExplorerProps {
  files: Record<string, ProjectFile>;
  activeFile: string;
  onFileSelect: (name: string) => void;
  onNewFile: () => void;
}

export const FileExplorer: React.FC<FileExplorerProps> = ({ files, activeFile, onFileSelect, onNewFile }) => {
  return (
    <div className="w-64 border-r border-slate-800 bg-slate-900/30 flex flex-col">
      <div className="p-4 flex items-center justify-between border-b border-slate-800">
        <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Arquivos</span>
        <button onClick={onNewFile} className="p-1 hover:bg-slate-800 rounded transition-colors">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" /></svg>
        </button>
      </div>
      <div className="flex-1 overflow-y-auto p-2">
        {/* Fixed: Cast Object.values to ProjectFile[] to resolve Property 'name'/'language' does not exist on type 'unknown' errors */}
        {(Object.values(files) as ProjectFile[]).map((file) => (
          <button
            key={file.name}
            onClick={() => onFileSelect(file.name)}
            className={`w-full flex items-center gap-2 px-3 py-2 rounded-md text-sm transition-colors mb-1 ${
              activeFile === file.name ? 'bg-blue-600/20 text-blue-400' : 'hover:bg-slate-800 text-slate-300'
            }`}
          >
            <span className="opacity-60">
              {file.language === 'python' && '🐍'}
              {file.language === 'html' && '🌐'}
              {file.language === 'css' && '🎨'}
              {file.language === 'javascript' && '📜'}
              {file.language === 'markdown' && '📝'}
            </span>
            {file.name}
          </button>
        ))}
      </div>
      <div className="p-4 bg-slate-900/60 border-t border-slate-800">
        <p className="text-[10px] text-slate-500 uppercase font-bold">Desenvolvido por</p>
        <p className="text-xs text-blue-400 font-semibold">João Layon CEO</p>
      </div>
    </div>
  );
};