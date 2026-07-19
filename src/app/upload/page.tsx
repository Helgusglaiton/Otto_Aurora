'use client';
import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import './upload.css';
import BackButton from '@/components/BackButton';

export default function UploadPage() {
  const [file, setFile] = useState<File | null>(null);
  const [guestName, setGuestName] = useState('');
  const [status, setStatus] = useState<'idle'|'uploading'|'success'|'error'>('idle');

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;
    
    setStatus('uploading');
    
    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random().toString(36).substring(2)}_${Date.now()}.${fileExt}`;
    
    // 1. Upload to Supabase Storage Bucket
    const { error: uploadError } = await supabase.storage
      .from('guest-uploads')
      .upload(fileName, file);
      
    if (uploadError) {
      console.error("Erro no Storage:", uploadError);
      setStatus('error');
      return;
    }
    
    // 2. Get Public URL
    const { data: { publicUrl } } = supabase.storage
      .from('guest-uploads')
      .getPublicUrl(fileName);
      
    // 3. Save reference to Database
    const { error: dbError } = await supabase
      .from('media')
      .insert({
        file_url: publicUrl,
        file_type: file.type.startsWith('video/') ? 'video' : 'image',
        guest_name: guestName || 'Anônimo'
      });
      
    if (dbError) {
      console.error("Erro no Banco:", dbError);
      setStatus('error');
    } else {
      setStatus('success');
      setFile(null);
      setGuestName('');
    }
  };

  return (
    <main className="upload-container">
      <div className="watercolor-bg"></div>
      
      <div className="upload-card">
        <h1 className="cursive text-terracotta title">Compartilhe esse momento!</h1>
        <p className="subtitle">Envie suas fotos e vídeos do Chá Revelação.</p>
        
        {status === 'success' ? (
          <div className="success-msg">
            <h3 className="cursive text-terracotta">Obrigado!</h3>
            <p>Sua foto foi enviada com sucesso para os pais. 💛</p>
            <button onClick={() => setStatus('idle')} className="btn-secondary">Enviar outra foto</button>
          </div>
        ) : (
          <form onSubmit={handleUpload}>
            <div className="form-group">
              <label>Seu Nome</label>
              <input 
                type="text" 
                placeholder="Ex: Titia Coruja" 
                value={guestName} 
                onChange={e => setGuestName(e.target.value)} 
                required 
              />
            </div>
            
            <div className="form-group">
              <label>Selecione a Foto/Vídeo</label>
              <div className="file-drop">
                <input 
                  type="file" 
                  accept="image/*,video/*" 
                  onChange={e => setFile(e.target.files?.[0] || null)} 
                  required 
                  id="file-input" 
                />
                <label htmlFor="file-input">
                  {file ? file.name : '📸 Toque aqui para escolher'}
                </label>
              </div>
            </div>
            
            <button type="submit" disabled={!file || status === 'uploading'} className="btn-primary">
              {status === 'uploading' ? 'Enviando (pode demorar)...' : 'Enviar Arquivo'}
            </button>
            {status === 'error' && <p className="error">Ops, algo deu errado. Tente novamente.</p>}
          </form>
        )}
      </div>
      <BackButton />
    </main>
  );
}
