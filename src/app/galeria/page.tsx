'use client';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import Image from 'next/image';
import BackButton from '@/components/BackButton';

export default function GaleriaPage() {
  const [media, setMedia] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const PAGE_SIZE = 12;

  useEffect(() => {
    fetchMedia(0);
  }, []);

  const fetchMedia = async (pageNumber: number) => {
    if (pageNumber > 0) setLoadingMore(true);
    
    const from = pageNumber * PAGE_SIZE;
    const to = from + PAGE_SIZE - 1;

    const { data } = await supabase
      .from('media')
      .select('*')
      .eq('status', 'aprovado')
      .neq('file_type', 'revealed')
      .order('created_at', { ascending: false })
      .range(from, to);
      
    if (data) {
      if (pageNumber === 0) setMedia(data);
      else setMedia(prev => [...prev, ...data]);
      
      if (data.length < PAGE_SIZE) setHasMore(false);
    }
    setLoading(false);
    setLoadingMore(false);
  };

  const handleLoadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    fetchMedia(nextPage);
  };

  return (
    <main style={{ minHeight: '100vh', background: 'var(--color-cream)', padding: '50px 20px', fontFamily: 'var(--font-sans)', position: 'relative' }}>
      <div className="watercolor-bg"></div>
      <div style={{ maxWidth: '1000px', margin: '0 auto', position: 'relative', zIndex: 1 }}>
        <h1 className="cursive" style={{ color: 'var(--color-terracotta)', fontSize: '4rem', textAlign: 'center', marginBottom: '10px' }}>Galeria de Memórias</h1>
        <p style={{ color: 'var(--color-brown-deep)', textAlign: 'center', marginBottom: '50px', fontSize: '1.2rem' }}>Os melhores momentos capturados por vocês.</p>
        
        {loading ? (
          <p style={{ textAlign: 'center', color: 'var(--color-terracotta)' }}>Carregando memórias...</p>
        ) : media.length === 0 ? (
          <p style={{ textAlign: 'center', color: 'var(--color-brown-deep)' }}>Nenhuma foto aprovada ainda.</p>
        ) : (
           <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '30px' }}>
            {media.map(m => (
              <div key={m.id} style={{ background: 'white', padding: '15px', borderRadius: '20px', boxShadow: '0 10px 25px rgba(0,0,0,0.05)', transform: 'rotate(-2deg)', transition: 'transform 0.3s' }} onMouseEnter={e => e.currentTarget.style.transform = 'rotate(0)'} onMouseLeave={e => e.currentTarget.style.transform = 'rotate(-2deg)'}>
                {m.file_type === 'video' ? (
                  <video src={m.file_url} controls style={{ width: '100%', height: '350px', objectFit: 'cover', borderRadius: '12px' }} />
                ) : (
                  <Image src={m.file_url} alt="Envio" width={400} height={400} style={{ width: '100%', height: '350px', objectFit: 'cover', borderRadius: '12px' }} />
                )}
                {m.guest_name && m.guest_name !== 'Anônimo' && (
                  <p style={{ marginTop: '15px', fontSize: '1rem', color: 'var(--color-brown-deep)', textAlign: 'center', fontWeight: 600 }}>📸 {m.guest_name}</p>
                )}
              </div>
            ))}
          </div>
        )}
        
        {hasMore && !loading && media.length > 0 && (
          <div style={{ textAlign: 'center', marginTop: '40px' }}>
            <button onClick={handleLoadMore} disabled={loadingMore} style={{ padding: '15px 40px', background: 'white', color: 'var(--color-terracotta)', border: '2px solid var(--color-terracotta)', borderRadius: '30px', fontWeight: 'bold', fontSize: '1.1rem', cursor: 'pointer', transition: 'all 0.3s' }} onMouseEnter={e => { e.currentTarget.style.background = 'var(--color-terracotta)'; e.currentTarget.style.color = 'white'; }} onMouseLeave={e => { e.currentTarget.style.background = 'white'; e.currentTarget.style.color = 'var(--color-terracotta)'; }}>
              {loadingMore ? 'Carregando...' : 'Carregar mais fotos'}
            </button>
          </div>
        )}
      </div>
      <BackButton threshold={100} />
    </main>
  );
}
