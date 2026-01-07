
import { ProjectFile } from './types';

export const INITIAL_FILES: Record<string, ProjectFile> = {
  'index.html': {
    name: 'index.html',
    language: 'html',
    content: `<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Dujão 22 – Sistema Live</title>
    <link rel="stylesheet" href="style.css">
</head>
<body>
    <div id="app">
        <div class="logo">D</div>
        <h1>Plataforma Dujão 22</h1>
        <p>Sistema gerado com arquitetura de alta performance.</p>
        <div class="status-badge">PRONTO PARA PRODUÇÃO</div>
        <button id="btn">VALIDAR SISTEMA</button>
    </div>
    <script src="script.js"></script>
</body>
</html>`
  },
  'style.css': {
    name: 'style.css',
    language: 'css',
    content: `body {
    background: #020617;
    color: #f8fafc;
    font-family: 'Inter', system-ui, sans-serif;
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100vh;
    margin: 0;
}
#app {
    text-align: center;
    padding: 3rem;
    border: 1px solid #1e293b;
    border-radius: 2rem;
    background: #0f172a;
    box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
    max-width: 400px;
}
.logo {
    width: 60px;
    height: 60px;
    background: #2563eb;
    border-radius: 1rem;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 2rem;
    font-weight: 800;
    margin: 0 auto 2rem;
}
h1 { font-size: 1.5rem; margin-bottom: 0.5rem; }
p { color: #94a3b8; font-size: 0.875rem; margin-bottom: 2rem; }
.status-badge {
    display: inline-block;
    padding: 0.25rem 0.75rem;
    background: #064e3b;
    color: #34d399;
    font-size: 0.6rem;
    font-weight: 900;
    border-radius: 1rem;
    margin-bottom: 2rem;
    letter-spacing: 0.1em;
}
button {
    background: #f8fafc;
    color: #020617;
    border: none;
    width: 100%;
    padding: 1rem;
    border-radius: 1rem;
    font-weight: 800;
    font-size: 0.75rem;
    cursor: pointer;
    transition: all 0.2s;
}
button:hover { background: #cbd5e1; transform: scale(1.02); }`
  },
  'script.js': {
    name: 'script.js',
    language: 'javascript',
    content: `document.getElementById('btn').addEventListener('click', () => {
    alert('Dujão 22 Engine: Verificação de Roteamento concluída com sucesso!');
});`
  },
  'app.py': {
    name: 'app.py',
    language: 'python',
    content: `from flask import Flask, jsonify

app = Flask(__name__)

@app.route('/')
def index():
    return "Dujão 22 Cloud Engine is Live"

@app.route('/api/health')
def health():
    return jsonify({"status": "healthy", "engine": "Dujão 22"})

if __name__ == '__main__':
    app.run()`
  },
  'requirements.txt': {
    name: 'requirements.txt',
    language: 'markdown',
    content: `flask\ngunicorn`
  }
};
