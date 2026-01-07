
import React from 'react';

interface EditorProps {
  value: string;
  language: string;
  onChange: (value: string) => void;
}

export const Editor: React.FC<EditorProps> = ({ value, onChange }) => {
  return (
    <div className="flex-1 flex flex-col bg-slate-950 relative overflow-hidden group">
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full h-full p-6 bg-transparent text-slate-300 code-font text-sm outline-none resize-none leading-relaxed spell-check-none"
        autoFocus
        spellCheck={false}
      />
      <div className="absolute bottom-4 right-6 text-[10px] text-slate-600 uppercase tracking-widest font-medium pointer-events-none group-hover:opacity-100 opacity-0 transition-opacity">
        Dujão 22 Engine v1.0
      </div>
    </div>
  );
};
