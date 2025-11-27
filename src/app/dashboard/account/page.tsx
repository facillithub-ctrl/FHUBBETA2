import createSupabaseServerClient from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import AccountClientPage from './AccountClientPage';
import type { UserProfile } from '../types';

export default async function AccountPage() {
  const supabase = await createSupabaseServerClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    redirect('/login');
  }

  // 1. Busca o perfil COMPLETO do utilizador
  const { data: profileData, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  if (error || !profileData) {
    console.error("Erro ao buscar perfil para Account:", error);
    redirect('/dashboard');
  }

  // 2. Mapeia os dados para o tipo HÍBRIDO UserProfile
  // Agora o TypeScript reconhecerá as propriedades snake_case adicionadas ao tipo
  const userProfile: UserProfile = {
    id: profileData.id,
    email: user.email!, 

    // --- Padrão Novo (snake_case) ---
    full_name: profileData.full_name,
    nickname: profileData.nickname,
    avatar_url: profileData.avatar_url,
    is_verified: profileData.is_verified || false, 
    active_modules: profileData.active_modules,
    organization_id: profileData.organization_id,
    user_category: profileData.user_category,

    // --- Padrão Legado (camelCase) ---
    fullName: profileData.full_name,
    avatarUrl: profileData.avatar_url,
    userCategory: profileData.user_category,
    pronoun: profileData.pronoun,
    birthDate: profileData.birth_date,
    schoolName: profileData.school_name,
    target_exam: profileData.target_exam,
    verification_badge: profileData.verification_badge,
    has_completed_onboarding: profileData.has_completed_onboarding,
  };

  return (
    <div>
      <AccountClientPage 
        userProfile={userProfile} 
        fullProfileData={profileData}
      />
    </div>
  );
}