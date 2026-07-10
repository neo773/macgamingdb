import { redirect } from 'next/navigation';
import { getServerSession } from '@/modules/auth/utils/getServerSession';
import { LibraryClient } from './client';

export const dynamic = 'force-dynamic';

const LibraryPage = async () => {
  const session = await getServerSession();

  if (!session) {
    redirect('/');
  }

  return <LibraryClient />;
};

export default LibraryPage;
