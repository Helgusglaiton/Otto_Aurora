'use client';
import { useState } from 'react';

export default function RSVPForm() {
  const [isOpen, setIsOpen] = useState(false);
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [stats, setStats] = useState<{ aurora: number, otto: number } | null>(null);
  const [userVote, setUserVote] = useState<string>('');
  const [showCalendarPopup, setShowCalendarPopup] = useState(false);

  const handleAddToCalendar = () => {
    // Definimos dados fictícios de exemplo (o usuário pode alterar o local e data depois no código)
    const event = {
      title: 'Chá Revelação: Aurora ou Otto?',
      description: 'Venha celebrar com a gente e descobrir quem está a caminho! 🩷🩵',
      location: 'Local do Chá',
      startTime: '20260808T130000', 
      endTime: '20260808T170000'
    };

    const icsData = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Chá Revelação//App//PT
BEGIN:VEVENT
SUMMARY:${event.title}
DESCRIPTION:${event.description}
LOCATION:${event.location}
DTSTART:${event.startTime}
DTEND:${event.endTime}
END:VEVENT
END:VCALENDAR`;

    const blob = new Blob([icsData], { type: 'text/calendar;charset=utf-8' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'cha-revelacao.ics');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

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
        setShowCalendarPopup(true);
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
      {showCalendarPopup && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.85)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: '20px' }}>
          <div style={{ background: 'white', padding: '40px 30px', borderRadius: '30px', maxWidth: '400px', width: '100%', textAlign: 'center', boxShadow: '0 20px 50px rgba(0,0,0,0.3)' }}>
            <div style={{ fontSize: '3rem', marginBottom: '10px' }}>🗓️</div>
             <h3 className="cursive" style={{ color: 'var(--color-terracotta)', fontSize: '3rem', margin: '0 0 10px 0' }}>Anote aí!</h3>
             <p style={{ color: 'var(--color-brown-deep)', marginBottom: '25px', fontSize: '1.2rem', lineHeight: 1.5 }}>Gostaria de adicionar o nosso Chá Revelação na agenda do seu celular para não esquecer o dia e o horário?</p>
             <button 
               onClick={() => { handleAddToCalendar(); setShowCalendarPopup(false); }} 
               style={{ width: '100%', padding: '15px', background: 'var(--color-tan)', color: 'white', border: 'none', borderRadius: '30px', cursor: 'pointer', fontWeight: 'bold', fontSize: '1.2rem', marginBottom: '15px', boxShadow: '0 5px 15px rgba(0,0,0,0.1)' }}
             >
               Sim, adicionar à agenda
             </button>
             <button 
               onClick={() => setShowCalendarPopup(false)} 
               style={{ width: '100%', padding: '15px', background: 'transparent', color: '#888', border: 'none', cursor: 'pointer', fontWeight: 'bold', fontSize: '1rem', textDecoration: 'underline' }}
             >
               Não, obrigado
             </button>
          </div>
        </div>
      )}

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
            <button className="location-btn" onClick={() => setIsOpen(false)} style={{ marginTop: '20px', width: '100%', padding: '15px 0', fontSize: '1.1rem' }}>Concluir e Fechar</button>
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
