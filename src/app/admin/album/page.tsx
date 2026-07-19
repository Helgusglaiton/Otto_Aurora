'use client';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

export default function AlbumPage() {
  const [timeline, setTimeline] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTimeline();
  }, []);

  const fetchTimeline = async () => {
    const { data } = await supabase
      .from('timeline_events')
      .select('*')
      .order('event_date', { ascending: true }); // Ordem cronológica para o álbum
    
    if (data) setTimeline(data);
    setLoading(false);
  };

  if (loading) return <div style={{ padding: '50px', textAlign: 'center', fontFamily: 'var(--font-sans)' }}>Preparando seu álbum...</div>;

  return (
    <div style={{ background: '#fff', minHeight: '100vh', fontFamily: 'var(--font-sans)', color: '#333' }}>
      <style dangerouslySetInnerHTML={{__html: `
        @media print {
          .no-print { display: none !important; }
          .page-break { page-break-before: always; }
          body { background: white; margin: 0; padding: 0; }
          @page { margin: 1cm; }
        }
      `}} />
      
      <div className="no-print" style={{ padding: '20px', textAlign: 'center', background: 'var(--color-cream)', borderBottom: '1px solid var(--color-tan)' }}>
        <button 
          onClick={() => window.print()}
          style={{ padding: '12px 25px', background: 'var(--color-terracotta)', color: 'white', border: 'none', borderRadius: '30px', fontSize: '1.2rem', cursor: 'pointer', fontWeight: 'bold' }}
        >
          🖨️ Imprimir / Salvar em PDF
        </button>
        <p style={{ marginTop: '10px', color: 'var(--color-brown-deep)' }}>Dica: Nas opções de impressão, selecione "Salvar como PDF" e ative "Gráficos de plano de fundo".</p>
      </div>

      <div style={{ maxWidth: '800px', margin: '0 auto', padding: '40px' }}>
        <h1 className="cursive" style={{ textAlign: 'center', fontSize: '5rem', color: 'var(--color-terracotta)', marginBottom: '60px' }}>
          Nossa História
        </h1>

        {timeline.length === 0 && (
          <p style={{ textAlign: 'center' }}>Adicione momentos na Linha do Tempo primeiro!</p>
        )}

        {timeline.map((evt, idx) => (
          <div key={evt.id} className={idx > 0 && idx % 2 === 0 ? "page-break" : ""} style={{ marginBottom: '80px', pageBreakInside: 'avoid' }}>
            <div style={{ textAlign: 'center', marginBottom: '15px' }}>
              <span style={{ background: 'var(--color-cream)', color: 'var(--color-brown-deep)', padding: '5px 15px', borderRadius: '15px', fontWeight: 'bold' }}>
                {new Date(evt.event_date).toLocaleDateString('pt-BR', { timeZone: 'UTC' })}
              </span>
            </div>
            
            <h2 style={{ textAlign: 'center', fontSize: '2.5rem', marginBottom: '10px', color: 'var(--color-brown-deep)' }}>{evt.title}</h2>
            
            {evt.milestone_type && (
               <div style={{ textAlign: 'center', marginBottom: '20px' }}>
                 <span style={{ border: '2px solid var(--color-tan)', color: 'var(--color-brown-deep)', padding: '5px 15px', borderRadius: '20px', fontSize: '0.9rem', fontWeight: 'bold' }}>
                   ⭐ {evt.milestone_type}
                 </span>
               </div>
            )}

            {evt.file_url && (
              <div style={{ textAlign: 'center', marginBottom: '20px' }}>
                {evt.file_type === 'video' ? (
                  <div style={{ padding: '50px', background: '#f9f9f9', border: '2px dashed #ccc', borderRadius: '15px', color: '#888' }}>
                     [Vídeo: {evt.title}] - Assista no site interativo
                  </div>
                ) : (
                  <img src={evt.file_url} alt={evt.title} style={{ maxWidth: '100%', maxHeight: '500px', borderRadius: '15px', objectFit: 'contain', boxShadow: '0 10px 30px rgba(0,0,0,0.05)' }} />
                )}
              </div>
            )}
            
            {evt.description && (
              <p style={{ fontSize: '1.2rem', lineHeight: 1.6, textAlign: 'center', marginTop: '20px', color: '#555' }}>
                {evt.description}
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
