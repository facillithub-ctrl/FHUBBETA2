import { redirect } from 'next/navigation';
import createSupabaseServerClient from '@/utils/supabase/server';
import type { UserProfile } from './types';
import DashboardClientLayout from './DashboardClientLayout';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createSupabaseServerClient();

  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }
  
  const { data: profile, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  if (error && error.code !== 'PGRST116') {
    console.error("Erro ao buscar perfil:", error); 
    // Não redireciona imediatamente para evitar loop se o erro for temporário, 
    // mas se não tiver perfil, o objeto abaixo lida com isso.
  }

  // Constrói o objeto UserProfile garantindo que não seja undefined
  const userProfile: UserProfile = profile ? {
    id: profile.id,
    fullName: profile.full_name,
    userCategory: profile.user_category,
    avatarUrl: profile.avatar_url,
    pronoun: profile.pronoun,
    nickname: profile.nickname,
    birthDate: profile.birth_date,
    schoolName: profile.school_name,
    organization_id: profile.organization_id,
    target_exam: profile.target_exam,
    verification_badge: profile.verification_badge,
    active_modules: profile.active_modules,
    has_completed_onboarding: profile.has_completed_onboarding,
  } : {
    // Fallback seguro para novos usuários sem perfil completo
    id: user.id,
    fullName: user.email?.split('@')[0] || 'Usuário',
    userCategory: null,
    avatarUrl: null,
    pronoun: null,
    nickname: null,
    birthDate: null,
    schoolName: null,
    organization_id: null,
    target_exam: null,
    verification_badge: null,
    active_modules: [],
    has_completed_onboarding: false,
  };

  return (
    <DashboardClientLayout userProfile={userProfile}>
      {children}
    </DashboardClientLayout>
  );
}