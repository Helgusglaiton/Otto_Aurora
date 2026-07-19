export const revalidate = 0;
import { redirect } from 'next/navigation';
import { getRevealedStatus } from '@/lib/settings';

export default async function RootPage() {
  const status = await getRevealedStatus();
  
  if (status === 'pendente') {
    redirect('/cha');
  } else {
    redirect('/bebe');
  }
}
