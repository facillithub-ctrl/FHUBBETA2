import { notFound } from 'next/navigation';
import createClient from '@/utils/supabase/server';
import PublicProfileView from './PublicProfileView';
import ProfileHeader from './components/ProfileHeader';
import ProfileFooter from './components/ProfileFooter';
import { getPublicProfile } from './actions'; // Importando a nova função
import { Metadata } from 'next';

type Props = {
  params: Promise<{ nickname: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { nickname } = await params;
  const profile = await getPublicProfile(nickname); // Reusando a função para consistência

  if (!profile) return { title: 'Perfil não encontrado' };

  return {
    title: `${profile.full_name || profile.nickname} (@${profile.nickname}) - Facillit Hub`,
    description: profile.bio || `Confira o perfil de estudos de ${profile.nickname}.`,
    openGraph: {
      images: [profile.avatar_url || '/assets/images/MASCOTE/login.png'],
    },
  };
}

export default async function PublicProfilePage({ params }: Props) {
  const { nickname } = await params;
  const supabase = await createClient();

  // 1. Identificar Visitante
  const { data: { user: authUser } } = await supabase.auth.getUser();
  let currentUserProfile = null;

  if (authUser) {
      const { data } = await supabase.from('profiles').select('id, nickname, avatar_url').eq('id', authUser.id).single();
      currentUserProfile = data;
  }

  // 2. Buscar Perfil Completo (Com Stats reais)
  const profile = await getPublicProfile(nickname);

  if (!profile) notFound();

  // 3. Buscar Seguidores (Mantido separado pois é relacional e específico da view)
  const { count: followersCount } = await supabase
    .from('follows')
    .select('*', { count: 'exact', head: true })
    .eq('following_id', profile.id);

  const { count: followingCount } = await supabase
    .from('follows')
    .select('*', { count: 'exact', head: true })
    .eq('follower_id', profile.id);

  let isFollowing = false;
  if (currentUserProfile) {
    const { data: followCheck } = await supabase
      .from('follows')
      .select('id')
      .eq('follower_id', currentUserProfile.id)
      .eq('following_id', profile.id)
      .single();
    if (followCheck) isFollowing = true;
  }

  const isOwner = currentUserProfile?.id === profile.id;
  const privacy = profile.privacy_settings || {};

  // Tela de Bloqueio (Privado)
  // AJUSTE: O perfil é PÚBLICO por padrão. Só bloqueia se is_public for explicitamente false.
  const isProfilePrivate = privacy.is_public === false;

  if (isProfilePrivate && !isOwner) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-900">
        <ProfileHeader currentUser={currentUserProfile} />
        <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
            <div className="w-24 h-24 bg-gray-200 dark:bg-gray-800 rounded-full flex items-center justify-center mb-6">
                <i className="fas fa-lock text-4xl text-gray-400"></i>
            </div>
            <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Este perfil é privado</h1>
            <p className="text-gray-500 mt-2 max-w-md">
                O estudante <strong>@{nickname}</strong> optou por restringir o acesso às suas informações.
            </p>
        </div>
        <ProfileFooter />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-900">
      <ProfileHeader currentUser={currentUserProfile} />
      
      <main className="flex-1">
        <PublicProfileView 
            profile={profile}
            isOwner={isOwner}
            currentUser={currentUserProfile}
            initialIsFollowing={isFollowing}
            followersCount={followersCount || 0}
            followingCount={followingCount || 0}
        />
      </main>

      <ProfileFooter />
    </div>
  );
}