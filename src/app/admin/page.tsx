'use client';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { getRevealedStatus, setRevealedStatus } from '@/lib/settings';
import Image from 'next/image';
import QRCode from "react-qr-code";

export default function AdminPage() {
  const [media, setMedia] = useState<any[]>([]);
  const [timeline, setTimeline] = useState<any[]>([]);
  const [revStatus, setRevStatus] = useState<'pendente' | 'aurora' | 'otto'>('pendente');
  const [loading, setLoading] = useState(true);
  
  // Timeline State
  const [tlTitle, setTlTitle] = useState('');
  const [tlDate, setTlDate] = useState('');
  const [tlDesc, setTlDesc] = useState('');
  const [tlMilestone, setTlMilestone] = useState('');
  const [tlCustomMilestone, setTlCustomMilestone] = useState('');
  const [tlFile, setTlFile] = useState<File | null>(null);
  const [tlLoading, setTlLoading] = useState(false);
  
  const [qrUrl, setQrUrl] = useState('https://seusite.vercel.app/upload');

  const router = useRouter();

  useEffect(() => {
    checkUser();
  }, []);

  const checkUser = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      router.push('/login');
    } else {
      fetchAllData();
      const status = await getRevealedStatus();
      setRevStatus(status);
    }
  };

  const fetchAllData = async () => {
    // Busca mídias do Chá
    const { data: mData } = await supabase
      .from('media')
      .select('*')
      .neq('file_type', 'revealed')
      .order('created_at', { ascending: false });
    if (mData) setMedia(mData);

    // Busca eventos da linha do tempo
    const { data: tData } = await supabase
      .from('timeline_events')
      .select('*')
      .order('event_date', { ascending: false });
    if (tData) setTimeline(tData);

    setLoading(false);
  };

  const handleAction = async (id: string, newStatus: 'aprovado' | 'rejeitado') => {
    const { error } = await supabase
      .from('media')
      .update({ status: newStatus })
      .eq('id', id);
      
    if (!error) {
      setMedia(media.map(m => m.id === id ? { ...m, status: newStatus } : m));
    } else {
      alert("Erro ao atualizar o status da mídia.");
    }
  };

  const extractFilePath = (url: string) => {
    const parts = url.split('/guest-uploads/');
    return parts.length > 1 ? parts[1] : null;
  }

  const handleDeleteMedia = async (id: string, url: string) => {
    if (!confirm("Tem certeza que deseja EXCLUIR DEFINITIVAMENTE essa foto/vídeo? Isso irá apagar do banco de dados e liberar espaço no armazenamento.")) return;
    
    const filePath = extractFilePath(url);
    if (filePath) {
      await supabase.storage.from('guest-uploads').remove([filePath]);
    }
    
    await supabase.from('media').delete().eq('id', id);
    setMedia(media.filter(m => m.id !== id));
  }

  const handleDeleteTimeline = async (id: string, url: string | null) => {
    if (!confirm("Tem certeza que deseja excluir este marco da Linha do Tempo definitivamente?")) return;
    
    if (url) {
      const filePath = extractFilePath(url);
      if (filePath) {
        await supabase.storage.from('guest-uploads').remove([filePath]);
      }
    }
    
    await supabase.from('timeline_events').delete().eq('id', id);
    setTimeline(timeline.filter(t => t.id !== id));
  }

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  }

  const handleReveal = async (newStatus: 'pendente' | 'aurora' | 'otto') => {
    if (confirm(`Tem certeza que deseja mudar o site para: ${newStatus}?`)) {
      await setRevealedStatus(newStatus);
      setRevStatus(newStatus);
      alert('Status atualizado! Acesse a página inicial (/) para ver a mágica.');
    }
  }

  const handleAddTimeline = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tlFile || !tlTitle || !tlDate) return alert("Preencha título, data e escolha uma foto!");
    setTlLoading(true);

    const fileExt = tlFile.name.split('.').pop();
    const fileName = `timeline_${Math.random().toString(36).substring(2)}_${Date.now()}.${fileExt}`;
    
    const { error: uploadError } = await supabase.storage
      .from('guest-uploads')
      .upload(fileName, tlFile);
      
    if (uploadError) {
      console.error(uploadError);
      alert("Erro no upload da foto. Verifique se você rodou o script SQL de permissão.");
      setTlLoading(false);
      return;
    }
    
    const { data: { publicUrl } } = supabase.storage
      .from('guest-uploads')
      .getPublicUrl(fileName);

    const finalMilestone = tlMilestone === 'Outra' ? tlCustomMilestone : tlMilestone;

    const { error: dbError } = await supabase.from('timeline_events').insert({
      title: tlTitle,
      event_date: tlDate,
      description: tlDesc,
      milestone_type: finalMilestone,
      file_url: publicUrl,
      file_type: tlFile.type.startsWith('video/') ? 'video' : 'image'
    });

    if (dbError) {
      console.error(dbError);
      alert("Erro ao salvar no banco de dados.");
    } else {
      alert("Novo marco adicionado na linha do tempo com sucesso!");
      setTlTitle(''); setTlDate(''); setTlDesc(''); setTlMilestone(''); setTlCustomMilestone(''); setTlFile(null);
      fetchAllData(); // Recarrega a lista
    }
    setTlLoading(false);
  }

  if (loading) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-sans)' }}>
      <p style={{ color: 'var(--color-terracotta)', fontSize: '1.2rem' }}>Carregando painel...</p>
    </div>
  );

  const pendentes = media.filter(m => m.status === 'pendente');
  const processados = media.filter(m => m.status !== 'pendente');

  return (
    <main style={{ minHeight: '100vh', background: 'var(--bg-gradient)', padding: '40px 20px', fontFamily: 'var(--font-sans)' }}>
      <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
        
        <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px', paddingBottom: '20px', borderBottom: '2px solid rgba(213, 165, 126, 0.3)' }}>
          <div>
            <h1 className="cursive" style={{ color: 'var(--color-terracotta)', fontSize: '3rem' }}>Painel Admin</h1>
            <p style={{ color: 'var(--color-brown-deep)' }}>Modere, gerencie e exclua fotos para liberar espaço.</p>
          </div>
          <button onClick={handleLogout} style={{ background: 'transparent', border: '1px solid var(--color-brown-deep)', color: 'var(--color-brown-deep)', padding: '8px 20px', borderRadius: '20px', cursor: 'pointer', fontWeight: 600 }}>Sair</button>
        </header>
        
        {/* REVELAÇÃO */}
        <div style={{ background: 'white', padding: '30px', borderRadius: '20px', marginBottom: '40px', boxShadow: '0 4px 15px rgba(0,0,0,0.05)', textAlign: 'center' }}>
          <h2 style={{ color: 'var(--color-brown-deep)', marginBottom: '20px' }}>O Grande Momento: A Revelação!</h2>
          <p style={{ color: '#666', marginBottom: '20px' }}>Status Atual: <strong>{revStatus.toUpperCase()}</strong></p>
          <div style={{ display: 'flex', gap: '15px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <button onClick={() => handleReveal('pendente')} style={{ padding: '12px 25px', background: revStatus === 'pendente' ? '#333' : '#ddd', color: revStatus === 'pendente' ? 'white' : '#333', border: 'none', borderRadius: '30px', cursor: 'pointer', fontWeight: 600 }}>Voltar para o Chá (Pendente)</button>
            <button onClick={() => handleReveal('aurora')} style={{ padding: '12px 25px', background: 'var(--color-terracotta)', opacity: revStatus === 'aurora' ? 1 : 0.5, color: 'white', border: 'none', borderRadius: '30px', cursor: 'pointer', fontWeight: 600 }}>Revelar: É A AURORA 🩷</button>
            <button onClick={() => handleReveal('otto')} style={{ padding: '12px 25px', background: 'var(--color-tan)', opacity: revStatus === 'otto' ? 1 : 0.5, color: 'white', border: 'none', borderRadius: '30px', cursor: 'pointer', fontWeight: 600 }}>Revelar: É O OTTO 🩵</button>
          </div>
        </div>

        {/* CADASTRAR LINHA DO TEMPO */}
        <div style={{ background: 'white', padding: '30px', borderRadius: '20px', marginBottom: '40px', boxShadow: '0 4px 15px rgba(0,0,0,0.05)' }}>
          <h2 style={{ color: 'var(--color-brown-deep)', marginBottom: '10px' }}>Adicionar Novo Marco 🍼</h2>
          <p style={{ color: '#666', marginBottom: '20px' }}>Adicione conquistas (Primeiro Passo, Mesversário) na Linha do Tempo do bebê.</p>
          
          <form onSubmit={handleAddTimeline} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
            <div style={{ gridColumn: '1 / -1' }}>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', color: 'var(--color-terracotta)' }}>Foto ou Vídeo do Momento *</label>
              <input type="file" accept="image/*,video/*" onChange={e => setTlFile(e.target.files?.[0] || null)} required style={{ width: '100%', padding: '10px', border: '1px solid #ccc', borderRadius: '10px' }} />
            </div>
            
            <div>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', color: 'var(--color-terracotta)' }}>Título *</label>
              <input type="text" placeholder="Ex: Primeiro Mesversário" value={tlTitle} onChange={e => setTlTitle(e.target.value)} required style={{ width: '100%', padding: '10px', border: '1px solid #ccc', borderRadius: '10px', outline: 'none' }} />
            </div>
            
            <div>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', color: 'var(--color-terracotta)' }}>Data do Acontecimento *</label>
              <input type="date" value={tlDate} onChange={e => setTlDate(e.target.value)} required style={{ width: '100%', padding: '10px', border: '1px solid #ccc', borderRadius: '10px', outline: 'none' }} />
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', color: 'var(--color-terracotta)' }}>Conquista (Opcional)</label>
              <select value={tlMilestone} onChange={e => setTlMilestone(e.target.value)} style={{ width: '100%', padding: '10px', border: '1px solid #ccc', borderRadius: '10px', outline: 'none', background: 'white' }}>
                <option value="">-- Nenhuma / Geral --</option>
                <option value="Nascimento">Nascimento</option>
                <option value="Mesversário">Mesversário</option>
                <option value="Aniversário">Aniversário</option>
                <option value="Primeiro Sorriso">Primeiro Sorriso</option>
                <option value="Descobriu os pezinhos">Descobriu os pezinhos</option>
                <option value="Sentou sem apoio">Sentou sem apoio</option>
                <option value="Engatinhou">Engatinhou</option>
                <option value="Primeiros Passos">Primeiros Passos</option>
                <option value="Primeira Palavrinha">Primeira Palavrinha</option>
                <option value="Primeira Papinha">Primeira Papinha</option>
                <option value="Primeira Mamadeira">Primeira Mamadeira</option>
                <option value="Primeiro Dentinho">Primeiro Dentinho</option>
                <option value="Primeiro Corte de Cabelo">Primeiro Corte de Cabelo</option>
                <option value="Primeira Viagem">Primeira Viagem</option>
                <option value="Primeiro Banho de Mar">Primeiro Banho de Mar</option>
                <option value="Dormiu a noite toda">Dormiu a noite toda</option>
                <option value="Primeiro dia na Creche">Primeiro dia na Creche</option>
                <option value="Primeiro Dia das Mães">Primeiro Dia das Mães</option>
                <option value="Primeiro Dia dos Pais">Primeiro Dia dos Pais</option>
                <option value="Primeiro Natal">Primeiro Natal</option>
                <option value="Primeira Páscoa">Primeira Páscoa</option>
                <option value="Outra">Outra (Descrever)</option>
              </select>
              
              {tlMilestone === 'Outra' && (
                <input 
                  type="text" 
                  placeholder="Qual foi a conquista?" 
                  value={tlCustomMilestone} 
                  onChange={e => setTlCustomMilestone(e.target.value)} 
                  required 
                  style={{ width: '100%', padding: '10px', border: '1px solid #ccc', borderRadius: '10px', outline: 'none', marginTop: '10px' }} 
                />
              )}
            </div>

            <div style={{ gridColumn: '1 / -1' }}>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', color: 'var(--color-terracotta)' }}>Texto Descritivo (Opcional)</label>
              <textarea placeholder="Conte um pouco sobre esse momento..." value={tlDesc} onChange={e => setTlDesc(e.target.value)} rows={3} style={{ width: '100%', padding: '10px', border: '1px solid #ccc', borderRadius: '10px', outline: 'none', resize: 'vertical' }}></textarea>
            </div>

            <button type="submit" disabled={tlLoading} style={{ gridColumn: '1 / -1', padding: '15px', background: 'var(--color-brown-deep)', color: 'white', border: 'none', borderRadius: '15px', fontWeight: 'bold', cursor: 'pointer', fontSize: '1.1rem' }}>
              {tlLoading ? 'Enviando...' : 'Publicar na Linha do Tempo'}
            </button>
          </form>
        </div>

        {/* MODERAÇÃO DE FOTOS PENDENTES */}
        <h3 style={{ color: 'var(--color-brown-deep)', fontSize: '1.5rem', marginBottom: '20px' }}>Fotos dos Convidados (Pendentes)</h3>
        {pendentes.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '30px', background: 'white', borderRadius: '20px', marginBottom: '40px' }}>
            <p style={{ color: 'var(--color-brown-deep)' }}>Nenhuma foto pendente. 🎉</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '25px', marginBottom: '40px' }}>
            {pendentes.map(m => (
              <div key={m.id} style={{ background: 'white', borderRadius: '15px', overflow: 'hidden', boxShadow: '0 4px 15px rgba(0,0,0,0.05)' }}>
                {m.file_type === 'video' ? (
                  <video src={m.file_url} controls style={{ width: '100%', height: '250px', objectFit: 'cover' }} />
                ) : (
                  <Image src={m.file_url} alt="Envio" width={400} height={400} style={{ width: '100%', height: '250px', objectFit: 'cover' }} />
                )}
                
                <div style={{ padding: '15px' }}>
                  <p style={{ color: 'var(--color-brown-deep)', fontWeight: 600, marginBottom: '10px' }}>Por: {m.guest_name}</p>
                  <div style={{ display: 'flex', gap: '10px' }}>
                    <button onClick={() => handleAction(m.id, 'aprovado')} style={{ flex: 1, padding: '10px', background: '#84a98c', color: 'white', border: 'none', borderRadius: '10px', cursor: 'pointer', fontWeight: 600 }}>Aprovar</button>
                    <button onClick={() => handleAction(m.id, 'rejeitado')} style={{ flex: 1, padding: '10px', background: '#e07a5f', color: 'white', border: 'none', borderRadius: '10px', cursor: 'pointer', fontWeight: 600 }}>Rejeitar</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* FOTOS APROVADAS / REJEITADAS (PARA EXCLUSÃO) */}
        <h3 style={{ color: 'var(--color-brown-deep)', fontSize: '1.5rem', marginBottom: '20px' }}>Fotos Processadas (Gerenciar Espaço)</h3>
        {processados.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '30px', background: 'white', borderRadius: '20px', marginBottom: '40px' }}>
            <p style={{ color: 'var(--color-brown-deep)' }}>Nenhuma foto processada ainda.</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '20px', marginBottom: '40px' }}>
            {processados.map(m => (
              <div key={m.id} style={{ background: 'white', borderRadius: '15px', overflow: 'hidden', border: `2px solid ${m.status === 'aprovado' ? '#84a98c' : '#e07a5f'}` }}>
                {m.file_type === 'video' ? (
                  <video src={m.file_url} controls style={{ width: '100%', height: '150px', objectFit: 'cover' }} />
                ) : (
                  <Image src={m.file_url} alt="Envio" width={300} height={300} style={{ width: '100%', height: '150px', objectFit: 'cover' }} />
                )}
                
                <div style={{ padding: '15px' }}>
                  <p style={{ fontSize: '0.9rem', marginBottom: '10px' }}>Status: {m.status}</p>
                  <button onClick={() => handleDeleteMedia(m.id, m.file_url)} style={{ width: '100%', padding: '10px', background: '#d32f2f', color: 'white', border: 'none', borderRadius: '10px', cursor: 'pointer', fontWeight: 600, fontSize: '0.9rem' }}>Excluir Definitivo</button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* TIMELINE (PARA EXCLUSÃO) */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h3 style={{ color: 'var(--color-brown-deep)', fontSize: '1.5rem', margin: 0 }}>Gerenciar Linha do Tempo</h3>
          <button onClick={() => window.open('/admin/album', '_blank')} style={{ padding: '10px 20px', background: 'var(--color-terracotta)', color: 'white', border: 'none', borderRadius: '20px', cursor: 'pointer', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '5px' }}>
            🖨️ Gerar Álbum Físico (PDF)
          </button>
        </div>
        {timeline.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '30px', background: 'white', borderRadius: '20px', marginBottom: '40px' }}>
            <p style={{ color: 'var(--color-brown-deep)' }}>Nenhum marco cadastrado na Linha do Tempo.</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '20px', marginBottom: '40px' }}>
            {timeline.map(t => (
              <div key={t.id} style={{ background: 'white', borderRadius: '15px', overflow: 'hidden', boxShadow: '0 4px 15px rgba(0,0,0,0.05)' }}>
                {t.file_url && (
                   t.file_type === 'video' ? (
                    <video src={t.file_url} controls style={{ width: '100%', height: '150px', objectFit: 'cover' }} />
                  ) : (
                    <Image src={t.file_url} alt="Timeline" width={300} height={300} style={{ width: '100%', height: '150px', objectFit: 'cover' }} />
                  )
                )}
                
                <div style={{ padding: '15px' }}>
                  <p style={{ fontWeight: 'bold', fontSize: '1rem', marginBottom: '5px' }}>{t.title}</p>
                  <p style={{ fontSize: '0.8rem', color: '#666', marginBottom: '10px' }}>{new Date(t.event_date).toLocaleDateString('pt-BR', { timeZone: 'UTC' })}</p>
                  <button onClick={() => handleDeleteTimeline(t.id, t.file_url)} style={{ width: '100%', padding: '10px', background: '#d32f2f', color: 'white', border: 'none', borderRadius: '10px', cursor: 'pointer', fontWeight: 600, fontSize: '0.9rem' }}>Excluir Definitivo</button>
                </div>
              </div>
            ))}
          </div>
        )}
        
        {/* QR CODE GENERATOR */}
        <div style={{ marginTop: '50px', padding: '40px', background: 'white', borderRadius: '25px', boxShadow: '0 10px 40px rgba(0,0,0,0.05)' }}>
          <h3 style={{ color: 'var(--color-brown-deep)', fontSize: '1.5rem', marginBottom: '10px' }}>📱 Gerador de QR Code (Mesas do Evento)</h3>
          <p style={{ color: '#666', marginBottom: '20px' }}>
            Imprima este QR Code e coloque nas mesas do Chá de Bebê ou Maternidade para que os convidados acessem a tela de Upload de fotos diretamente!
          </p>
          
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '40px', alignItems: 'flex-start' }}>
            <div style={{ flex: '1 1 300px' }}>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', color: 'var(--color-terracotta)' }}>Link do seu site (Página de Upload)</label>
              <input 
                type="url" 
                value={qrUrl} 
                onChange={e => setQrUrl(e.target.value)} 
                style={{ width: '100%', padding: '12px', border: '1px solid #ccc', borderRadius: '10px', outline: 'none', marginBottom: '15px' }} 
              />
              
              <div style={{ background: 'var(--color-cream)', padding: '15px', borderRadius: '15px' }}>
                <p style={{ margin: '0 0 10px 0', fontSize: '0.9rem', color: 'var(--color-brown-deep)', fontWeight: 'bold' }}>Sugestões Rápidas:</p>
                <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                  <button onClick={() => setQrUrl('https://seusite.vercel.app/upload')} style={{ padding: '5px 10px', borderRadius: '10px', border: '1px solid var(--color-terracotta)', background: 'transparent', cursor: 'pointer', color: 'var(--color-terracotta)' }}>Ir para /upload (Fotos)</button>
                  <button onClick={() => setQrUrl('https://seusite.vercel.app/cha')} style={{ padding: '5px 10px', borderRadius: '10px', border: '1px solid var(--color-brown-deep)', background: 'transparent', cursor: 'pointer', color: 'var(--color-brown-deep)' }}>Ir para /cha (Convite)</button>
                </div>
              </div>
            </div>
            
            <div style={{ flex: '0 0 auto', background: 'var(--color-cream)', padding: '30px', borderRadius: '25px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', border: '2px dashed var(--color-tan)' }}>
              <div style={{ background: 'white', padding: '15px', borderRadius: '15px', boxShadow: '0 5px 15px rgba(0,0,0,0.1)', marginBottom: '15px' }}>
                <QRCode value={qrUrl} size={200} fgColor="var(--color-brown-deep)" />
              </div>
              <p style={{ color: 'var(--color-brown-deep)', fontWeight: 600, fontSize: '0.9rem', margin: 0 }}>Aponte a câmera!</p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
