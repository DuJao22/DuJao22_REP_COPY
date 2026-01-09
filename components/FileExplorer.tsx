
import React, { useState, useMemo, useEffect } from 'react';
import { ProjectFile } from '../types';

interface FileExplorerProps {
  files: Record<string, ProjectFile>;
  activeFile: string;
  onFileSelect: (name: string) => void;
  onNewFile: () => void;
}

export const FileExplorer: React.FC<FileExplorerProps> = ({ files, activeFile, onFileSelect, onNewFile }) => {
  const [expandedFolders, setExpandedFolders] = useState<Record<string, boolean>>({});

  // Garante que pastas importantes estejam expandidas por padrão
  useEffect(() => {
    setExpandedFolders(prev => ({
      ...prev,
      'templates': true,
      'src': true,
      'api': true,
      'public': true
    }));
  }, [files]);

  const tree = useMemo(() => {
    const root: any = {};
    Object.keys(files).forEach(path => {
      const parts = path.split('/');
      let current = root;
      parts.forEach((part, i) => {
        if (i === parts.length - 1) {
          current[part] = { _isFile: true, path };
        } else {
          if (!current[part]) current[part] = {};
          current = current[part];
        }
      });
    });
    return root;
  }, [files]);

  const toggleFolder = (folder: string) => {
    setExpandedFolders(prev => ({ ...prev, [folder]: !prev[folder] }));
  };

  const renderTree = (node: any, depth = 0, parentPath = '') => {
    return Object.entries(node).sort(([a, aVal], [b, bVal]) => {
      const aIsFile = (aVal as any)._isFile;
      const bIsFile = (bVal as any)._isFile;
      if (aIsFile && !bIsFile) return 1;
      if (!aIsFile && bIsFile) return -1;
      return a.localeCompare(b);
    }).map(([name, value]: [string, any]) => {
      const currentPath = parentPath ? `${parentPath}/${name}` : name;
      
      if (value._isFile) {
        const file = files[value.path];
        if (!file) return null;
        const isSelected = activeFile === value.path;
        return (
          <button
            key={value.path}
            onClick={() => onFileSelect(value.path)}
            style={{ paddingLeft: `${depth * 14 + 20}px` }}
            className={`w-full flex items-center gap-3 py-2 pr-4 rounded-xl text-[11px] font-bold transition-all mb-0.5 group ${
              isSelected ? 'bg-emerald-600 text-white shadow-lg' : 'hover:bg-slate-800 text-slate-400'
            }`}
          >
            <span>{file.name.endsWith('.html') ? '🌐' : file.name.endsWith('.py') ? '🐍' : '📝'}</span>
            <span className="truncate">{name}</span>
          </button>
        );
      }

      const isOpen = expandedFolders[currentPath];
      return (
        <div key={currentPath} className="mb-0.5">
          <button
            onClick={() => toggleFolder(currentPath)}
            style={{ paddingLeft: `${depth * 14 + 16}px` }}
            className="w-full flex items-center gap-2 py-2 text-slate-500 hover:text-slate-300 text-[10px] font-black uppercase tracking-widest transition-all"
          >
            <span className={`transition-transform ${isOpen ? 'rotate-90 text-emerald-500' : ''}`}>▶</span>
            <span>📂 {name}</span>
          </button>
          <div className={`${isOpen ? 'block' : 'hidden'}`}>
            {renderTree(value, depth + 1, currentPath)}
          </div>
        </div>
      );
    });
  };

  return (
    <div className="flex-1 flex flex-col bg-slate-900/40 overflow-hidden">
      <div className="p-6 flex items-center justify-between border-b border-white/5 bg-slate-950/20">
        <div>
          <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Enterprise Tree</span>
          <p className="text-[8px] text-emerald-500 font-bold uppercase mt-1">Ready for Run</p>
        </div>
        <button onClick={onNewFile} className="w-8 h-8 bg-slate-800 hover:bg-emerald-600 rounded-xl transition-all flex items-center justify-center">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M12 4v16m8-8H4" /></svg>
        </button>
      </div>
      <div className="flex-1 overflow-y-auto p-3 custom-scrollbar">
        {renderTree(tree)}
      </div>
    </div>
  );
};
