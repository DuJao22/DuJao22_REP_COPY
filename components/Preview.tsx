
import React, { useEffect, useState } from 'react';
import { ProjectFile } from '../types';

interface PreviewProps {
  files: Record<string, ProjectFile>;
}

export const Preview: React.FC<PreviewProps> = ({ files }) => {
  const [srcDoc, setSrcDoc] = useState('');

  useEffect(() => {
    const findFileContent = (name: string) => {
      if (files[name]) return files[name].content;
      const alternativeKey = Object.keys(files).find(k => k.endsWith(name));
      return alternativeKey ? files[alternativeKey].content : null;
    };

    const htmlContent = findFileContent('index.html');
    const cssContent = findFileContent('style.css') || findFileContent('styles.css') || '';
    const jsContent = findFileContent('script.js') || findFileContent('main.js') || '';

    const html = htmlContent || `
      <div style="color: #64748b; font-family: sans-serif; display: flex; align-items: center; justify-content: center; height: 100vh; text-align: center; flex-direction: column; padding: 20px; background: #0f172a;">
        <div style="font-size: 48px; margin-bottom: 20px;">🔍</div>
        <h2 style="margin: 0; font-weight: 800; color: #f8fafc;">index.html não encontrado</h2>
        <p style="font-size: 14px; margin-top: 10px; color: #94a3b8;">O Dujão Engine precisa de um arquivo <b>index.html</b> para exibir o preview.</p>
      </div>
    `;

    // Script de Error Boundary para o Preview
    const errorHandlerScript = `
      window.onerror = function(msg, url, lineNo, columnNo, error) {
        document.body.innerHTML += \`
          <div style="position:fixed; bottom:10px; left:10px; right:10px; background:#ef4444; color:white; padding:15px; border-radius:8px; font-family:monospace; font-size:12px; z-index:9999; border:1px solid #7f1d1d; box-shadow: 0 10px 15px -3px rgba(0,0,0,0.5)">
            <b style="display:block;margin-bottom:5px;text-transform:uppercase;font-size:10px;opacity:0.8">Runtime Error Detected:</b>
            \${msg} <br>
            <span style="opacity:0.6;font-size:10px">at line \${lineNo}:\${columnNo}</span>
          </div>
        \`;
        return false;
      };
    `;

    const combined = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <style>
            body { margin: 0; background: white; }
            ${cssContent}
          </style>
          <script>${errorHandlerScript}</script>
        </head>
        <body>
          ${html}
          <script>
            try {
              ${jsContent}
            } catch(e) {
              console.error(e);
              window.onerror(e.message, null, 0, 0, e);
            }
          </script>
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
          https://preview.dujao22.cloud/index.html
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
