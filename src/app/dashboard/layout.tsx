// src/app/dashboard/layout.tsx
import { redirect } from 'next/navigation';
import createSupabaseServerClient from '@/utils/supabase/server';
import type { UserProfile, UserStats } from './types'; // Importe UserStats
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
    .select('id, full_name, user_category, avatar_url, pronoun, nickname, birth_date, school_name, has_completed_onboarding, active_modules, target_exam, verification_badge, organization_id')
    .eq('id', user.id)
    .single();

  if (error && error.code !== 'PGRST116') {
    console.error("Erro ao buscar perfil:", error); 
    await supabase.auth.signOut();
    redirect('/login');
  }

  const userProfile: UserProfile = profile ? {
    id: profile.id,
    fullName: profile.full_name,
    userCategory: profile.user_category,
    avatarUrl: profile.avatar_url,
    pronoun: profile.pronoun,
    nickname: profile.nickname,
    birthDate: profile.birth_date,
    schoolName: profile.school_name,
    has_completed_onboarding: profile.has_completed_onboarding,
    active_modules: profile.active_modules,
    target_exam: profile.target_exam,
    verification_badge: profile.verification_badge,
    organization_id: profile.organization_id,
  } : {
    id: user.id,
    fullName: null,
    userCategory: null,
    avatarUrl: null,
    pronoun: null,
    nickname: null,
    birthDate: null,
    schoolName: null,
    has_completed_onboarding: false,
    active_modules: [],
    target_exam: null,
    verification_badge: null,
    organization_id: null,
  };

  // ✅ ADICIONADO: Dados de estatísticas (pode vir do DB futuramente)
  const userStats: UserStats = {
    streak: 0, // Implementar lógica real de streak futuramente
    rank: null,
    xp: 0,
    coins: 0
  };

  // Passamos userStats para o componente cliente
  return (
    <DashboardClientLayout userProfile={userProfile} stats={userStats}>
      {children}
    </DashboardClientLayout>
  );
}