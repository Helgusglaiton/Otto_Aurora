export const revalidate = 0;
import { getRevealedStatus } from '@/lib/settings';
import { supabase } from '@/lib/supabase';
import Image from 'next/image';

function calculateAge(events: any[]) {
  if (!events || events.length === 0) return null;
  // Assumimos que o primeiro evento cronológico é o nascimento
  const birthEvent = events[events.length - 1]; 
  const birthDate = new Date(birthEvent.event_date);
  const now = new Date();
  
  if (now < birthDate) return "Na barriga da mamãe";
  
  let months = (now.getFullYear() - birthDate.getFullYear()) * 12;
  months -= birthDate.getMonth();
  months += now.getMonth();
  
  let days = now.getDate() - birthDate.getDate();
  if (days < 0) {
    months--;
    const tempDate = new Date(now.getFullYear(), now.getMonth(), 0);
    days += tempDate.getDate();
  }
  
  if (months === 0 && days === 0) return "Nasceu hoje! 🎉";
  
  let ageStr = [];
  if (months > 0) ageStr.push(`${months} ${months === 1 ? 'mês' : 'meses'}`);
  if (days > 0) ageStr.push(`${days} ${days === 1 ? 'dia' : 'dias'}`);
  
  return ageStr.join(' e ') + " de vida";
}

export default async function BebePage() {
  const status = await getRevealedStatus();
  
  const name = status === 'aurora' ? 'Aurora' : status === 'otto' ? 'Otto' : 'Bebê';
  const color = status === 'aurora' ? 'var(--color-terracotta)' : 'var(--color-tan)';
  
  // Fetch timeline events
  const { data: events } = await supabase
    .from('timeline_events')
    .select('*')
    .order('event_date', { ascending: false });

  const ageStr = calculateAge(events || []);

  return (
    <main style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'var(--color-cream)', fontFamily: 'var(--font-sans)', textAlign: 'center', padding: '20px', position: 'relative' }}>
      <div className="watercolor-bg"></div>
      
      <div style={{ position: 'relative', zIndex: 1, background: 'rgba(255, 255, 255, 0.7)', padding: '40px 60px', borderRadius: '30px', boxShadow: '0 10px 40px rgba(0,0,0,0.05)', backdropFilter: 'blur(5px)' }}>
        <h1 className="cursive" style={{ color: color, fontSize: '5rem', margin: '0' }}>{name}</h1>
        <p style={{ color: 'var(--color-brown-deep)', fontSize: '1.4rem', marginTop: '10px', fontWeight: 500 }}>
          {ageStr ? ageStr : "O grande amor de nossas vidas chegou!"}
        </p>
      </div>
      
      <div style={{ background: 'white', padding: '40px', borderRadius: '25px', marginTop: '40px', zIndex: 1, boxShadow: '0 10px 30px rgba(0,0,0,0.05)', maxWidth: '600px', width: '100%' }}>
        <h2 style={{ color: color, marginBottom: '20px', fontSize: '2rem' }}>Linha do Tempo</h2>
        <div style={{ borderLeft: `3px dashed ${color}`, paddingLeft: '20px', textAlign: 'left', marginLeft: '10px' }}>
          
          {events && events.length > 0 ? events.map(evt => (
            <div key={evt.id} style={{ marginBottom: '40px', position: 'relative' }}>
              {/* Dot */}
              <div style={{ position: 'absolute', left: '-29px', top: '0', background: 'white', border: `3px solid ${color}`, width: '15px', height: '15px', borderRadius: '50%' }}></div>
              
              {/* Date Box */}
              <div style={{ background: 'var(--color-cream)', padding: '8px 15px', borderRadius: '15px', display: 'inline-block', marginBottom: '15px', border: `1px solid ${color}` }}>
                <span style={{ fontWeight: 600, color: 'var(--color-brown-deep)' }}>
                  {new Date(evt.event_date).toLocaleDateString('pt-BR', { timeZone: 'UTC' })}
                </span>
              </div>
              
              <h3 style={{ color: 'var(--color-brown-deep)', margin: '0 0 10px 0', fontSize: '1.6rem' }}>{evt.title}</h3>
              
              {evt.milestone_type && (
                <span style={{ display: 'inline-block', background: color, color: 'white', padding: '5px 12px', borderRadius: '20px', fontSize: '0.8rem', marginBottom: '15px', fontWeight: 'bold' }}>
                  ⭐ {evt.milestone_type}
                </span>
              )}
              
              {evt.file_url && (
                evt.file_type === 'video' ? (
                  <video src={evt.file_url} controls style={{ width: '100%', borderRadius: '15px', marginBottom: '15px', boxShadow: '0 4px 10px rgba(0,0,0,0.1)' }} />
                ) : (
                  <Image src={evt.file_url} alt={evt.title} width={600} height={400} style={{ width: '100%', height: 'auto', borderRadius: '15px', marginBottom: '15px', boxShadow: '0 4px 10px rgba(0,0,0,0.1)', objectFit: 'cover' }} />
                )
              )}
              
              {evt.description && <p style={{ color: '#555', margin: 0, lineHeight: 1.6, fontSize: '1.1rem' }}>{evt.description}</p>}
            </div>
          )) : (
            <div style={{ marginBottom: '30px', position: 'relative' }}>
              <div style={{ position: 'absolute', left: '-29px', top: '0', background: 'white', border: `3px solid ${color}`, width: '15px', height: '15px', borderRadius: '50%' }}></div>
              <h3 style={{ color: 'var(--color-brown-deep)', margin: '0 0 5px 0' }}>Em breve...</h3>
              <p style={{ color: '#888', margin: 0 }}>Fotos e registros do nascimento e dos primeiros meses aparecerão aqui para acompanharmos o crescimento.</p>
            </div>
          )}

        </div>
      </div>
      
      <a href="/galeria" style={{ marginTop: '40px', padding: '15px 40px', background: color, color: 'white', borderRadius: '30px', textDecoration: 'none', fontWeight: 'bold', zIndex: 1, fontSize: '1.1rem', boxShadow: '0 5px 15px rgba(0,0,0,0.1)' }}>
        Ver Galeria do Chá Revelação
      </a>
    </main>
  );
}
