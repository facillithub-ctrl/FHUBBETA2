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

  // Busca o perfil completo do usuário
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  // Verificação de segurança: garante que o usuário é um administrador
  if (!profile || profile.user_category !== 'administrator') {
    redirect('/dashboard');
  }
  
  // Constrói o objeto UserProfile HÍBRIDO (compatível com admin antigo e dashboard nova)
  const userProfile: UserProfile = {
    id: profile.id,
    email: user.email!, // Adicionado: Obrigatório
    
    // --- Campos Novos (snake_case) ---
    full_name: profile.full_name,
    nickname: profile.nickname,
    avatar_url: profile.avatar_url,
    is_verified: profile.is_verified || false,
    active_modules: profile.active_modules,
    organization_id: profile.organization_id,
    user_category: profile.user_category,

    // --- Campos Legados (camelCase - Mapeamento para Admin) ---
    fullName: profile.full_name,
    userCategory: profile.user_category,
    avatarUrl: profile.avatar_url,
    pronoun: profile.pronoun,
    has_completed_onboarding: profile.has_completed_onboarding,
    birthDate: profile.birth_date,
    schoolName: profile.school_name,
    target_exam: profile.target_exam,
    verification_badge: profile.verification_badge,
  };

  // Renderiza o Client Layout e passa o userProfile completo
  return (
    <AdminClientLayout userProfile={userProfile}>
      {children}
    </AdminClientLayout>
  );
}