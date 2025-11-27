import createClient from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import DashboardClientLayout from "./DashboardClientLayout";
import { UserProfile } from "./types";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Busca dados reais da tabela profiles
  const { data: profile } = await supabase
    .from("profiles")
    .select("*") // Seleciona tudo para garantir que temos todos os campos
    .eq("id", user.id)
    .single();

  // Monta o objeto HÍBRIDO (compatível com novo e antigo design)
  const userData: UserProfile = {
    id: user.id,
    email: user.email!,
    
    // --- Padrão Novo (snake_case) ---
    full_name: profile?.full_name || user.user_metadata?.full_name || "Estudante",
    nickname: profile?.nickname || user.user_metadata?.name?.split(' ')[0] || "Visitante",
    avatar_url: profile?.avatar_url || user.user_metadata?.avatar_url,
    is_verified: profile?.is_verified || false,
    active_modules: profile?.active_modules || [],
    organization_id: profile?.organization_id || null,
    user_category: profile?.user_category || null,

    // --- Padrão Legado (camelCase - Mapeamento) ---
    fullName: profile?.full_name || user.user_metadata?.full_name,
    avatarUrl: profile?.avatar_url || user.user_metadata?.avatar_url,
    userCategory: profile?.user_category,
    schoolName: profile?.school_name, // Supondo que exista no select *
    pronoun: profile?.pronoun,
    birthDate: profile?.birth_date,
    target_exam: profile?.target_exam,
    verification_badge: profile?.verification_badge,
    has_completed_onboarding: profile?.has_completed_onboarding
  };

  return (
    <DashboardClientLayout user={userData}>
      {children}
    </DashboardClientLayout>
  );
}