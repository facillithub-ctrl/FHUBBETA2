import { notFound } from 'next/navigation';
import createClient from '@/utils/supabase/server'; //
import PublicProfileView from './PublicProfileView';
import { Metadata } from 'next';

type Props = {
  params: { nickname: string };
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  // CORREÇÃO: Adicione 'await' aqui
  const supabase = await createClient();
  
  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name, nickname, bio, avatar_url')
    .eq('nickname', params.nickname)
    .single();

  if (!profile) return { title: 'Perfil não encontrado' };

  return {
    title: `${profile.full_name || profile.nickname} (@${profile.nickname}) - Facillit Hub`,
    description: profile.bio || `Confira o perfil de estudos de ${profile.nickname} no Facillit Hub.`,
    openGraph: {
      images: [profile.avatar_url || '/assets/images/MASCOTE/login.png'],
    },
  };
}

export default async function PublicProfilePage({ params }: Props) {
  // CORREÇÃO: Adicione 'await' aqui também
  const supabase = await createClient();

  // 1. Buscar dados do perfil
  const { data: profile, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('nickname', params.nickname)
    .single();

  // 2. Verificações de Segurança
  if (error || !profile) {
    notFound(); 
  }

  const privacy = profile.privacy_settings || {};
  
  if (!privacy.is_public) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-900 p-4 text-center">
        <i className="fas fa-lock text-4xl text-gray-400 mb-4"></i>
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Este perfil é privado</h1>
        <p className="text-gray-500 mt-2">O usuário @{params.nickname} optou por não compartilhar suas informações publicamente.</p>
        <a href="/" className="mt-6 text-royal-blue hover:underline">Voltar para a Home</a>
      </div>
    );
  }

  return <PublicProfileView profile={profile} />;
}