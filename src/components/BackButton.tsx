'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function BackButton({ threshold = 200 }: { threshold?: number }) {
  const [isVisible, setIsVisible] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const handleScroll = () => {
      // Se não passar um limite ou se rolar mais que o limite, mostra
      if (window.scrollY > threshold) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };
    
    // Mostra se o limite for zero
    if (threshold === 0) setIsVisible(true);

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [threshold]);

  if (!isVisible) return null;

  return (
    <button
      onClick={() => router.push('/')}
      style={{
        position: 'fixed',
        bottom: '30px',
        left: '50%',
        transform: 'translateX(-50%)',
        padding: '12px 30px',
        background: 'var(--color-brown-deep)',
        color: 'white',
        border: 'none',
        borderRadius: '30px',
        fontWeight: 'bold',
        fontSize: '1rem',
        boxShadow: '0 5px 20px rgba(0,0,0,0.2)',
        cursor: 'pointer',
        zIndex: 1000,
        transition: 'opacity 0.3s, transform 0.3s',
      }}
    >
      ⬅ Voltar para o Início
    </button>
  );
}
