
import React, { useEffect, useState } from 'react';
import { ProjectFile } from '../types';

interface PreviewProps {
  files: Record<string, ProjectFile>;
}

export const Preview: React.FC<PreviewProps> = ({ files }) => {
  const [srcDoc, setSrcDoc] = useState('');

  useEffect(() => {
    const findFileContent = (name: string) => {
      // Tenta encontrar o arquivo exato ou o arquivo dentro da pasta templates/
      if (files[name]) return files[name].content;
      if (files[`templates/${name}`]) return files[`templates/${name}`].content;
      
      const alternativeKey = Object.keys(files).find(k => k.endsWith(name));
      return alternativeKey ? files[alternativeKey].content : null;
    };

    const htmlContent = findFileContent('index.html');
    const cssContent = findFileContent('style.css') || findFileContent('styles.css') || '';
    const jsContent = findFileContent('script.js') || findFileContent('main.js') || findFileContent('index.js') || '';

    // Se o HTML já vem com estilos e scripts (regra do sistema), injetamos como está
    const htmlBody = htmlContent || `
      <div style="color: #64748b; font-family: sans-serif; display: flex; align-items: center; justify-content: center; height: 100vh; text-align: center; flex-direction: column; padding: 20px; background: #0f172a;">
        <div style="font-size: 48px; margin-bottom: 20px;">🏗️</div>
        <h2 style="margin: 0; font-weight: 800; color: #f8fafc;">Aguardando Compilação</h2>
        <p style="font-size: 14px; margin-top: 10px; color: #94a3b8;">O Arquiteto está estruturando o arquivo <b>templates/index.html</b>.</p>
      </div>
    `;

    const errorHandlerScript = `
      window.onerror = function(msg, url, lineNo, columnNo, error) {
        const errorDiv = document.createElement('div');
        errorDiv.style.cssText = "position:fixed; bottom:20px; left:20px; right:20px; background:#ef4444; color:white; padding:20px; border-radius:12px; font-family:monospace; font-size:12px; z-index:9999; border:2px solid #7f1d1d; box-shadow: 0 20px 25px -5px rgba(0,0,0,0.5)";
        errorDiv.innerHTML = \`
          <b style="display:block;margin-bottom:8px;text-transform:uppercase;font-size:10px;letter-spacing:1px">Runtime Audit Failed:</b>
          \${msg} <br>
          <span style="opacity:0.7;font-size:10px">Path: \${url} | Line: \${lineNo}</span>
        \`;
        document.body.appendChild(errorDiv);
        return false;
      };
    `;

    const combined = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <script src="https://cdn.tailwindcss.com"></script>
          <style>
            ${cssContent}
          </style>
          <script>${errorHandlerScript}</script>
        </head>
        <body class="bg-slate-900 min-h-screen">
          ${htmlBody}
          <script type="module">
            try {
              ${jsContent}
            } catch(e) {
              window.onerror(e.message, null, 0, 0, e);
            }
          </script>
        </body>
      </html>
    `;
    setSrcDoc(combined);
  }, [files]);

  return (
    <div className="flex-1 bg-white flex flex-col shadow-inner overflow-hidden">
      <div className="h-10 bg-slate-900 border-b border-white/5 flex items-center px-4 gap-3 shrink-0">
        <div className="flex gap-1.5">
          <div className="w-2.5 h-2.5 rounded-full bg-slate-800"></div>
          <div className="w-2.5 h-2.5 rounded-full bg-slate-800"></div>
          <div className="w-2.5 h-2.5 rounded-full bg-slate-800"></div>
        </div>
        <div className="flex-1 mx-4 bg-slate-950 rounded-lg px-4 text-[10px] text-slate-500 truncate py-1 border border-white/5 font-mono flex items-center gap-2">
          <span className="text-blue-500">HTTPS</span> preview.dujao22.cloud/templates/index.html
        </div>
      </div>
      <div className="flex-1 relative bg-slate-900">
        <iframe
          srcDoc={srcDoc}
          title="Live Architectural Preview"
          sandbox="allow-scripts allow-modals allow-forms allow-popups allow-same-origin"
          className="absolute inset-0 w-full h-full border-none"
        />
      </div>
    </div>
  );
};
