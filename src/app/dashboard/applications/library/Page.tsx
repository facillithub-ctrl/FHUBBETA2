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

  // --- LÓGICA BLINDADA DE VERIFICAÇÃO DE ROLE ---
  
  // 1. Prioridade: Metadados do Auth (Carrega instantâneo, sem query extra)
  let rawRole = user.user_metadata?.role || user.user_metadata?.cargo || user.app_metadata?.role;

  // 2. Fallback: Se não tiver no Auth, busca na tabela profiles
  if (!rawRole) {
    try {
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();
      rawRole = profile?.role;
    } catch (e) {
      console.error('Erro ao buscar perfil:', e);
    }
  }

  // 3. Normalização (Remove espaços e converte para minúsculo)
  const userRole = rawRole ? String(rawRole).trim().toLowerCase() : 'student';

  // 4. Lista de permissões de professor
  const teacherRoles = ['teacher', 'professor', 'admin', 'educator', 'coordenador', 'master'];
  const isTeacher = teacherRoles.includes(userRole);

  // Debug no servidor (Aparecerá no seu terminal onde roda o npm run dev)
  console.log(`[Library Auth] Email: ${user.email} | Role detectada: "${userRole}" | É Professor? ${isTeacher ? 'SIM' : 'NÃO'}`);

  // Busca dados iniciais (apenas se for aluno, para economizar recursos)
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