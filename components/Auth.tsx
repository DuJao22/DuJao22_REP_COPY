
import React, { useState } from 'react';
import { User } from '../types';

interface AuthProps {
  onLogin: (user: User) => void;
}

export const Auth: React.FC<AuthProps> = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Verificação de Admin específica
    if (email === 'dujao22@gmail.com' && password === '30031936Vo.') {
      onLogin({
        id: 'admin-01',
        username: 'João Layon (Admin)',
        email: email,
        role: 'admin'
      });
      return;
    }

    // Login Simulado para usuários comuns (qualquer outro login com senha de 4+ dígitos)
    if (email.includes('@') && password.length >= 4) {
      onLogin({
        id: Date.now().toString(),
        username: email.split('@')[0],
        email: email,
        role: 'user'
      });
    } else {
      setError('Credenciais inválidas. Tente novamente.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 px-4">
      <div className="max-w-md w-full space-y-8 p-8 bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl">
        <div className="text-center">
          <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4 text-3xl font-bold text-white shadow-[0_0_20px_rgba(37,99,235,0.4)]">D</div>
          <h2 className="text-3xl font-extrabold text-white">Dujão 22</h2>
          <p className="mt-2 text-sm text-slate-400 font-medium uppercase tracking-widest">Digital Solutions | João Layon</p>
        </div>
        
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="p-3 bg-red-500/10 border border-red-500/50 rounded-lg text-red-400 text-xs text-center font-bold uppercase">
              {error}
            </div>
          )}
          <div className="space-y-4">
            <div>
              <label className="text-xs font-bold text-slate-500 uppercase">E-mail</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full mt-1 px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-white outline-none focus:border-blue-500 transition-colors"
                placeholder="seu@email.com"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-500 uppercase">Senha</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full mt-1 px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-white outline-none focus:border-blue-500 transition-colors"
                placeholder="••••••••"
              />
            </div>
          </div>
          <button
            type="submit"
            className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl shadow-lg transition-all active:scale-95 flex items-center justify-center gap-2"
          >
            ACESSAR PLATAFORMA
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7l5 5m0 0l-5 5m5-5H6" /></svg>
          </button>
        </form>
        <p className="text-center text-[10px] text-slate-600 uppercase font-bold">
          © João Layon - Plataforma de Desenvolvimento Inteligente
        </p>
      </div>
    </div>
  );
};
