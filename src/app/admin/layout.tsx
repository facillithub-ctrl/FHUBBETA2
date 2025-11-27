import { redirect } from 'next/navigation';
import createSupabaseServerClient from '@/utils/supabase/server';
import type { UserProfile } from '@/app/dashboard/types';
import AdminClientLayout from './AdminClientLayout';

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createSupabaseServerClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    redirect('/login');
  }

  // Busca o perfil completo
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  // Verificação de segurança: Apenas administradores
  if (!profile || profile.user_category !== 'administrator') {
    redirect('/dashboard');
  }
  
  // Monta o objeto UserProfile, mapeando os campos do banco para o tipo do frontend
  const userProfile: UserProfile = {
    id: profile.id,
    fullName: profile.full_name, // Mapeamento crítico: full_name (BD) -> fullName (Type)
    userCategory: profile.user_category,
    avatarUrl: profile.avatar_url,
    pronoun: profile.pronoun,
    nickname: profile.nickname,
    has_completed_onboarding: profile.has_completed_onboarding,
    active_modules: profile.active_modules,
    birthDate: profile.birth_date,
    schoolName: profile.school_name,
    organization_id: profile.organization_id,
    target_exam: profile.target_exam,
    verification_badge: profile.verification_badge,
    email: user.email // Opcional, útil para fallback
  };

  return (
    <AdminClientLayout userProfile={userProfile}>
      {children}
    </AdminClientLayout>
  );
}