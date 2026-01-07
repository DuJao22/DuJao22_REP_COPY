
import React, { useEffect, useState } from 'react';
import { ProjectFile } from '../types';

interface PreviewProps {
  files: Record<string, ProjectFile>;
}

export const Preview: React.FC<PreviewProps> = ({ files }) => {
  const [srcDoc, setSrcDoc] = useState('');

  useEffect(() => {
    // Busca inteligente: tenta encontrar o arquivo exato, ou qualquer um que termine com o nome esperado
    const findFileContent = (name: string) => {
      if (files[name]) return files[name].content;
      
      const alternativeKey = Object.keys(files).find(k => k.endsWith(name));
      return alternativeKey ? files[alternativeKey].content : null;
    };

    const htmlContent = findFileContent('index.html');
    const cssContent = findFileContent('style.css') || findFileContent('styles.css') || '';
    const jsContent = findFileContent('script.js') || findFileContent('game.js') || findFileContent('main.js') || '';

    const html = htmlContent || `
      <div style="color: #64748b; font-family: sans-serif; display: flex; align-items: center; justify-content: center; height: 100vh; text-align: center; flex-direction: column; padding: 20px;">
        <div style="font-size: 48px; margin-bottom: 20px;">🔍</div>
        <h2 style="margin: 0; font-weight: 800; color: #1e293b;">index.html não encontrado</h2>
        <p style="font-size: 14px; margin-top: 10px;">O Dujão Engine espera um arquivo chamado <b>index.html</b> na raiz para o preview.</p>
      </div>
    `;

    const combined = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <style>${cssContent}</style>
        </head>
        <body>
          ${html}
          <script>${jsContent}</script>
        </body>
      </html>
    `;
    setSrcDoc(combined);
  }, [files]);

  return (
    <div className="flex-1 bg-white flex flex-col shadow-inner">
      <div className="h-8 bg-slate-100 border-b border-slate-200 flex items-center px-4 gap-2">
        <div className="flex gap-1.5">
          <div className="w-2.5 h-2.5 rounded-full bg-red-400"></div>
          <div className="w-2.5 h-2.5 rounded-full bg-yellow-400"></div>
          <div className="w-2.5 h-2.5 rounded-full bg-green-400"></div>
        </div>
        <div className="flex-1 mx-4 bg-white rounded-md px-3 text-[10px] text-slate-400 truncate py-0.5 border border-slate-200 font-mono">
          https://dujao22-preview.local/index.html
        </div>
      </div>
      <iframe
        srcDoc={srcDoc}
        title="Live Preview"
        sandbox="allow-scripts"
        className="w-full h-full border-none bg-white"
      />
    </div>
  );
};
