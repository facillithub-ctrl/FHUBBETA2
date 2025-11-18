import createSupabaseServerClient from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import AccountClientPage from './AccountClientPage'; // O nosso componente de layout
import type { UserProfile } from '../types';

export default async function AccountPage() {
  const supabase = await createSupabaseServerClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    redirect('/login');
  }

  // 1. Busca o perfil COMPLETO do utilizador, incluindo o JSONB
  const { data: profileData, error } = await supabase
    .from('profiles')
    .select('*') // Seleciona todas as colunas
    .eq('id', user.id)
    .single();

  if (error || !profileData) {
    console.error("Erro ao buscar perfil para Account:", error);
    redirect('/dashboard');
  }

  // 2. Mapeia os dados para o tipo UserProfile
  // (Nota: 'category_details' será passado, mas não faz parte do tipo UserProfile,
  // vamos passá-lo como 'fullProfileData' para o cliente)
  const userProfile: UserProfile = {
    id: profileData.id,
    fullName: profileData.full_name,
    nickname: profileData.nickname,
    avatarUrl: profileData.avatar_url,
    userCategory: profileData.user_category,
    pronoun: profileData.pronoun,
    birthDate: profileData.birth_date,
    schoolName: profileData.school_name,
    organization_id: profileData.organization_id,
    target_exam: profileData.target_exam,
    active_modules: profileData.active_modules,
    verification_badge: profileData.verification_badge,
    has_completed_onboarding: profileData.has_completed_onboarding,
  };

  return (
    <div>
      {/* 3. Renderiza o componente cliente, passando todos os dados */}
      <AccountClientPage 
        userProfile={userProfile} 
        fullProfileData={profileData} // Passa todos os dados, incl. category_details
      />
    </div>
  );
}