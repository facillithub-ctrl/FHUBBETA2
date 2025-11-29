// CAMINHO: src/app/dashboard/applications/library/page.tsx
import createClient from '@/utils/supabase/server';
import { getDiscoverContent } from './discover/actions';
import StudentLibraryDashboard from './components/StudentLibraryDashboard';
import TeacherLibraryDashboard from './components/TeacherLibraryDashboard';
import { redirect } from 'next/navigation';

export default async function LibraryPage() {
  const supabase = await createClient();
  
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) redirect('/login');

  // --- CORREÇÃO DA LÓGICA DE CARGO ---
  
  // 1. Buscamos SEMPRE o perfil no banco para garantir a informação correta.
  // O erro anterior era tentar pegar 'role' (que não existe) ou confiar só no metadata 'student'.
  const { data: profile } = await supabase
    .from('profiles')
    .select('user_category') // AQUI ESTAVA O ERRO: mudado de 'role' para 'user_category'
    .eq('id', user.id)
    .single();

  // 2. Normaliza o valor vindo do banco (ou usa fallback seguro)
  let userCategory = profile?.user_category;

  // Se não veio do banco, tentamos metadata como último recurso
  if (!userCategory) {
     userCategory = user.user_metadata?.role || user.user_metadata?.cargo || 'student';
  }

  // 3. Normalização
  const finalCategory = String(userCategory).trim().toLowerCase();

  // 4. Lista de permissões de professor
  const teacherRoles = ['teacher', 'professor', 'admin', 'educator', 'coordenador', 'master', 'diretor', 'gestor'];
  const isTeacher = teacherRoles.includes(finalCategory);

  // Debug (para confirmar no terminal)
  console.log(`[Library] User: ${user.email} | DB Category: ${profile?.user_category} | Final: ${finalCategory} | isTeacher: ${isTeacher}`);

  // Carrega conteúdo inicial apenas se for aluno
  const initialDiscoverData = !isTeacher ? await getDiscoverContent() : null;

  return (
    <div className="h-full bg-[#F8F9FA]">
      {isTeacher ? (
        <TeacherLibraryDashboard user={user} />
      ) : (
        <StudentLibraryDashboard user={user} initialDiscoverData={initialDiscoverData} />
      )}
    </div>
  );
}