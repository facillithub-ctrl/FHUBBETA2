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

  // Busca dados reais da tabela profiles com tratamento de erro básico
  const { data: profile } = await supabase
    .from("profiles")
    .select("nickname, full_name, avatar_url, is_verified, active_modules, organization_id, user_category")
    .eq("id", user.id)
    .single();

  // Monta o objeto com dados reais do banco
  const userData: UserProfile = {
    id: user.id,
    email: user.email!,
    full_name: profile?.full_name || null,
    nickname: profile?.nickname || null,
    avatar_url: profile?.avatar_url || null,
    is_verified: profile?.is_verified || false,
    active_modules: profile?.active_modules || [],
    organization_id: profile?.organization_id || null,
    user_category: profile?.user_category || null,
  };

  return (
    <DashboardClientLayout user={userData}>
      {children}
    </DashboardClientLayout>
  );
}