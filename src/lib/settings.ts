import { supabase } from './supabase';

export async function getRevealedStatus(): Promise<'pendente' | 'aurora' | 'otto'> {
  const { data } = await supabase
    .from('media')
    .select('file_url')
    .eq('guest_name', 'SYSTEM_SETTING')
    .eq('file_type', 'revealed')
    .maybeSingle();
    
  if (data?.file_url === 'aurora' || data?.file_url === 'otto') {
    return data.file_url as 'aurora' | 'otto';
  }
  return 'pendente';
}

export async function setRevealedStatus(status: 'pendente' | 'aurora' | 'otto') {
  const { data } = await supabase
    .from('media')
    .select('id')
    .eq('guest_name', 'SYSTEM_SETTING')
    .eq('file_type', 'revealed')
    .maybeSingle();

  if (data) {
    await supabase
      .from('media')
      .update({ file_url: status })
      .eq('id', data.id);
  } else {
    await supabase
      .from('media')
      .insert({
        guest_name: 'SYSTEM_SETTING',
        file_type: 'revealed',
        file_url: status,
        status: 'aprovado'
      });
  }
}
