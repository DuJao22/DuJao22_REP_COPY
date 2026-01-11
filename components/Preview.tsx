
import React, { useEffect, useState } from 'react';
import { ProjectFile } from '../types';

interface PreviewProps {
  files: Record<string, ProjectFile>;
  isRunning?: boolean;
}

export const Preview: React.FC<PreviewProps> = ({ files, isRunning = true }) => {
  const [srcDoc, setSrcDoc] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true);
    
    const findFileContent = (name: string) => {
      if (files[name]) return files[name].content;
      if (files[`templates/${name}`]) return files[`templates/${name}`].content;
      const alternativeKey = Object.keys(files).find(k => k.endsWith(name));
      return alternativeKey ? files[alternativeKey].content : null;
    };

    const htmlContent = findFileContent('index.html');
    const cssContent = findFileContent('style.css') || findFileContent('styles.css') || '';
    const jsContent = findFileContent('script.js') || findFileContent('main.js') || findFileContent('index.js') || '';

    const htmlBody = htmlContent || `
      <div style="background:#0f172a; color:#94a3b8; font-family:sans-serif; height:100vh; display:flex; align-items:center; justify-content:center; flex-direction:column; text-align:center;">
        <div style="font-size:32px; margin-bottom:16px;">🔍</div>
        <h2 style="color:white; margin:0;">index.html não encontrado</h2>
        <p style="font-size:12px; margin-top:8px;">A estrutura de pastas templates/ ou raiz deve conter um index.html.</p>
      </div>
    `;

    const errorHandlerScript = `
      window.onerror = function(msg, url, lineNo, columnNo, error) {
        const errorDiv = document.createElement('div');
        errorDiv.style.cssText = "position:fixed; bottom:20px; left:20px; right:20px; background:#ef4444; color:white; padding:16px; border-radius:12px; font-family:monospace; font-size:11px; z-index:9999; border:1px solid #7f1d1d; box-shadow: 0 10px 15px -3px rgba(0,0,0,0.5)";
        errorDiv.innerHTML = \`<b>Runtime Error:</b> \${msg}<br><small style="opacity:0.6">Path: \${url} (Line \${lineNo})</small>\`;
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
          <style>${cssContent}</style>
          <script>${errorHandlerScript}</script>
        </head>
        <body class="bg-slate-900 text-slate-100">
          ${htmlBody}
          <script type="module">
            try { ${jsContent} } catch(e) { window.onerror(e.message, null, 0, 0, e); }
          </script>
        </body>
      </html>
    `;

    const timer = setTimeout(() => {
      setSrcDoc(combined);
      setIsLoading(false);
    }, 400);

    return () => clearTimeout(timer);
  }, [files, isRunning]);

  return (
    <div className="flex-1 bg-slate-950 flex flex-col overflow-hidden relative border border-slate-800 rounded-xl m-4">
      <div className="h-8 bg-slate-900 border-b border-slate-800 flex items-center px-4 justify-between shrink-0">
        <div className="flex gap-1">
          <div className="w-2 h-2 rounded-full bg-slate-700"></div>
          <div className="w-2 h-2 rounded-full bg-slate-700"></div>
          <div className="w-2 h-2 rounded-full bg-slate-700"></div>
        </div>
        <div className="bg-slate-950 rounded px-2 py-0.5 text-[8px] text-slate-500 font-mono flex items-center gap-2 border border-slate-800/50">
          <span className="text-emerald-500">HTTPS</span> localhost:3000
        </div>
        <div className="w-4"></div>
      </div>
      
      <div className="flex-1 relative">
        <iframe
          srcDoc={srcDoc}
          title="Preview"
          sandbox="allow-scripts allow-modals allow-forms allow-popups allow-same-origin"
          className="absolute inset-0 w-full h-full border-none"
        />
        
        {(!isRunning || isLoading) && (
          <div className="absolute inset-0 bg-slate-950/90 backdrop-blur-sm flex flex-col items-center justify-center animate-in fade-in duration-300">
            <div className="w-8 h-8 border-2 border-slate-800 border-t-blue-500 rounded-full animate-spin mb-4"></div>
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Restarting Server...</p>
          </div>
        )}
      </div>
    </div>
  );
};
