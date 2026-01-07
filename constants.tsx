
import { ProjectFile } from './types';

export const INITIAL_FILES: Record<string, ProjectFile> = {
  'app.py': {
    name: 'app.py',
    language: 'python',
    content: `from flask import Flask, render_template, jsonify
import sqlite3

app = Flask(__name__)

def init_db():
    conn = sqlite3.connect('database.db')
    cursor = conn.cursor()
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS projects (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            description TEXT
        )
    ''')
    conn.commit()
    conn.close()

@app.route('/')
def home():
    return "Dujão 22 API is Running!"

@app.route('/api/status')
def status():
    return jsonify({"status": "online", "owner": "João Layon"})

if __name__ == '__main__':
    init_db()
    app.run(host='0.0.0.0', port=5000)`
  },
  'index.html': {
    name: 'index.html',
    language: 'html',
    content: `<!DOCTYPE html>
<html>
<head>
    <title>Meu Projeto Dujão 22</title>
    <link rel="stylesheet" href="style.css">
</head>
<body>
    <div id="app">
        <h1>Bem-vindo ao Dujão 22</h1>
        <p>Desenvolvido por João Layon</p>
        <button id="btn">Clique aqui</button>
    </div>
    <script src="script.js"></script>
</body>
</html>`
  },
  'style.css': {
    name: 'style.css',
    language: 'css',
    content: `body {
    background: #0f172a;
    color: white;
    font-family: sans-serif;
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100vh;
    margin: 0;
}
#app {
    text-align: center;
    padding: 2rem;
    border: 1px solid #334155;
    border-radius: 8px;
    background: #1e293b;
}
button {
    background: #3b82f6;
    color: white;
    border: none;
    padding: 0.5rem 1rem;
    border-radius: 4px;
    cursor: pointer;
}`
  },
  'script.js': {
    name: 'script.js',
    language: 'javascript',
    content: `document.getElementById('btn').addEventListener('click', () => {
    alert('Dujão 22: Sistema Criado com Sucesso!');
});`
  },
  'requirements.txt': {
    name: 'requirements.txt',
    language: 'markdown',
    content: `flask\ngunicorn\nrequests`
  }
};
