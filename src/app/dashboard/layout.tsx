import createClient from "@/utils/supabase/server"; // <--- Alterado: Removemos as chaves { } para usar o export default
import { redirect } from "next/navigation";
import DashboardClientLayout from "./DashboardClientLayout";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Como o teu createSupabaseServerClient é async, o await aqui está corretíssimo
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Mock de dados do usuário para passar ao Client Component
  // Futuramente, você buscará isso da tabela 'profiles'
  const userData = {
    id: user.id,
    email: user.email,
    name: user.user_metadata?.name || "Estudante Facillit",
    avatar_url: user.user_metadata?.avatar_url,
    is_verified: true // Exemplo
  };

  return (
    <DashboardClientLayout user={userData}>
      {children}
    </DashboardClientLayout>
  );
}