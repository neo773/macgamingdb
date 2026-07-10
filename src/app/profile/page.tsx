import { redirect } from 'next/navigation';
import { getServerSession } from '@/modules/auth/utils/getServerSession';
import { ProfileClient } from './client';

export const dynamic = 'force-dynamic';

const ProfilePage = async () => {
  const session = await getServerSession();

  if (!session) {
    redirect('/');
  }

  return (
    <ProfileClient
      user={{
        id: session.user.id,
        name: session.user.name,
        email: session.user.email,
        image: session.user.image ?? null,
      }}
    />
  );
};

export default ProfilePage;
