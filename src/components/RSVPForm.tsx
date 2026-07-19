'use client';
import { useState } from 'react';

export default function RSVPForm() {
  const [isOpen, setIsOpen] = useState(false);
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [stats, setStats] = useState<{ aurora: number, otto: number } | null>(null);
  const [userVote, setUserVote] = useState<string>('');

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setStatus('loading');
    
    const formData = new FormData(e.currentTarget);
    const data = {
      nome: formData.get('nome'),
      adultos: formData.get('adultos'),
      criancas: formData.get('criancas'),
      voto: formData.get('voto'),
      mensagem: formData.get('mensagem'),
    };
    
    setUserVote(data.voto as string);

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 seconds timeout

      const response = await fetch('/api/rsvp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      
      if (response.ok) {
        const result = await response.json();
        if (result.stats) {
          setStats(result.stats);
        }
        setStatus('success');
      } else {
        setStatus('error');
      }
    } catch (error: any) {
      if (error.name === 'AbortError') {
        alert('Parece que a sua conexão está lenta ou caiu. Verifique a internet e tente de novo!');
      }
      setStatus('error');
    }
  };

  if (!isOpen) {
    return (
      <button className="rsvp-btn" onClick={() => setIsOpen(true)}>
        Confirmar Presença
      </button>
    );
  }

  return (
    <div className="rsvp-overlay">
      <div className="rsvp-modal">
        {status === 'success' ? (
          <div className="success-message">
            <h3 className="cursive" style={{ fontSize: '2.5rem', color: 'var(--color-terracotta)', marginBottom: '10px' }}>Oba!</h3>
            <p>Sua presença foi confirmada! Mal podemos esperar para celebrar.</p>
            
            {stats && (
              <div style={{ marginTop: '20px', padding: '15px', background: 'var(--color-cream)', borderRadius: '15px' }}>
                <p style={{ fontWeight: 600, color: 'var(--color-brown-deep)', marginBottom: '10px' }}>
                  {userVote === 'Aurora' 
                    ? `Que legal! ${stats.aurora}% dos convidados também acham que é a Aurora 🩷` 
                    : `Demais! ${stats.otto}% dos convidados também acham que é o Otto 🩵`}
                </p>
                <div style={{ display: 'flex', height: '25px', borderRadius: '12px', overflow: 'hidden', boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.1)' }}>
                  <div style={{ width: `${stats.aurora}%`, background: 'var(--color-terracotta)', display: 'flex', alignItems: 'center', justifyItems: 'flex-start', paddingLeft: '10px', color: 'white', fontSize: '0.8rem', fontWeight: 'bold' }}>{stats.aurora}%</div>
                  <div style={{ width: `${stats.otto}%`, background: 'var(--color-tan)', display: 'flex', alignItems: 'center', justifyContent: 'flex-end', paddingRight: '10px', color: 'white', fontSize: '0.8rem', fontWeight: 'bold' }}>{stats.otto}%</div>
                </div>
              </div>
            )}
            
            <button className="location-btn" onClick={() => setIsOpen(false)} style={{ marginTop: '20px', width: '100%', padding: '12px 0' }}>Fechar</button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="rsvp-form">
            <h3 className="cursive" style={{ fontSize: '2.5rem', color: 'var(--color-terracotta)', textAlign: 'center', marginBottom: '20px' }}>
              Confirmar Presença
            </h3>
            
            <div className="form-group">
              <label>Nome Completo (ou Família)</label>
              <input type="text" name="nome" required placeholder="Ex: Família Silva" />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Qtd. Adultos</label>
                <input type="number" name="adultos" min="1" required defaultValue="1" />
              </div>
              <div className="form-group">
                <label>Qtd. Crianças</label>
                <input type="number" name="criancas" min="0" defaultValue="0" />
              </div>
            </div>

            <div className="form-group" style={{ textAlign: 'center', margin: '20px 0' }}>
              <label style={{ fontSize: '1rem', marginBottom: '10px', color: 'var(--color-brown-deep)', fontWeight: 600 }}>Quem você acha que vem aí?</label>
              <div style={{ display: 'flex', gap: '15px', justifyContent: 'center' }}>
                <label style={{ flex: 1, cursor: 'pointer' }}>
                  <input type="radio" name="voto" value="Aurora" required className="vote-radio" />
                  <div className="vote-card aurora-card">Aurora 🩷</div>
                </label>
                <label style={{ flex: 1, cursor: 'pointer' }}>
                  <input type="radio" name="voto" value="Otto" required className="vote-radio" />
                  <div className="vote-card otto-card">Otto 🩵</div>
                </label>
              </div>
            </div>

            <div className="form-group">
              <label>Deixe um recadinho (Opcional)</label>
              <textarea name="mensagem" rows={2} placeholder="Mensagem para os pais..."></textarea>
            </div>

            <div className="form-actions" style={{ marginTop: '15px' }}>
              <button type="button" className="cancel-btn" onClick={() => setIsOpen(false)}>Cancelar</button>
              <button type="submit" className="submit-btn" disabled={status === 'loading'}>
                {status === 'loading' ? 'Enviando...' : 'Confirmar'}
              </button>
            </div>
            
            {status === 'error' && <p className="error-text" style={{ color: 'red', marginTop: '10px', textAlign: 'center', fontSize: '0.9rem' }}>Ocorreu um erro de conexão. Por favor, tente novamente.</p>}
          </form>
        )}
      </div>
    </div>
  );
}
