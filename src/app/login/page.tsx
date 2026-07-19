'use client';
import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError('Credenciais inválidas. Tente novamente.');
      setLoading(false);
    } else {
      router.push('/admin');
    }
  };

  return (
    <main style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-gradient)', fontFamily: 'var(--font-sans)' }}>
      <div style={{ background: 'var(--color-white)', padding: '40px', borderRadius: '20px', boxShadow: '0 10px 25px rgba(0,0,0,0.05)', textAlign: 'center', width: '100%', maxWidth: '400px' }}>
        <h2 className="cursive" style={{ color: 'var(--color-terracotta)', fontSize: '2.5rem', marginBottom: '10px' }}>Área dos Pais</h2>
        <p style={{ color: 'var(--color-brown-deep)', marginBottom: '30px' }}>Faça login para moderar as fotos.</p>
        
        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          <input 
            type="email" 
            placeholder="E-mail" 
            value={email} 
            onChange={e => setEmail(e.target.value)} 
            required 
            style={{ padding: '15px', borderRadius: '10px', border: '1px solid rgba(213, 165, 126, 0.4)', outline: 'none' }} 
          />
          <input 
            type="password" 
            placeholder="Senha" 
            value={password} 
            onChange={e => setPassword(e.target.value)} 
            required 
            style={{ padding: '15px', borderRadius: '10px', border: '1px solid rgba(213, 165, 126, 0.4)', outline: 'none' }} 
          />
          <button 
            type="submit" 
            disabled={loading}
            style={{ padding: '15px', background: 'var(--color-terracotta)', color: 'white', border: 'none', borderRadius: '25px', cursor: 'pointer', fontWeight: 600, marginTop: '10px' }}
          >
            {loading ? 'Entrando...' : 'Entrar no Painel'}
          </button>
          {error && <p style={{ color: 'red', fontSize: '0.9rem', marginTop: '10px' }}>{error}</p>}
        </form>
      </div>
    </main>
  );
}
