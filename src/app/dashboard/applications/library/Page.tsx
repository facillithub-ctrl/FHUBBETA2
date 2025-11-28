// src/app/dashboard/applications/library/page.tsx
import createClient from '@/utils/supabase/server';
import { getDiscoverContent } from './discover/actions';
import StudentLibraryDashboard from './components/StudentLibraryDashboard';
import TeacherLibraryDashboard from './components/TeacherLibraryDashboard';
import { redirect } from 'next/navigation';

export default async function LibraryPage() {
  const supabase = await createClient();
  
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) redirect('/login');

  // --- LÓGICA DE ROLE ROBUSTA ---
  
  // 1. Busca em vários lugares possíveis (Metadata ou App Metadata)
  let rawRole = user.user_metadata?.role || user.user_metadata?.cargo || user.app_metadata?.role || null;

  // 2. Se não achou, tenta no perfil (Fallback)
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

  // 3. Normaliza para evitar erros de Case Sensitive (Ex: "Teacher" vira "teacher")
  const userRole = rawRole ? String(rawRole).toLowerCase().trim() : 'student';

  // 4. Verifica se é educador (aceita vários termos)
  const isTeacher = ['teacher', 'professor', 'admin', 'educator', 'coordenador'].includes(userRole);

  // Debug no Terminal do VS Code
  console.log(`[Library Auth] User: ${user.email} | Raw Role: ${rawRole} | Normalized: ${userRole} | IsTeacher: ${isTeacher}`);

  // Busca dados iniciais apenas se for aluno (para performance)
  const initialDiscoverData = !isTeacher ? await getDiscoverContent() : null;

  return (
    <div className="h-full bg-[#F8F9FA]">
      {/* DEBUG VISUAL TEMPORÁRIO: Se estiver com dúvidas, descomente a linha abaixo para ver o que o sistema leu na tela 
         <div className="bg-red-100 text-red-800 p-2 text-xs text-center">DEBUG: Role lida = <strong>{userRole}</strong> (É professor? {isTeacher ? 'SIM' : 'NÃO'})</div>
      */}

      {isTeacher ? (
        <TeacherLibraryDashboard user={user} />
      ) : (
        <StudentLibraryDashboard user={user} initialDiscoverData={initialDiscoverData} />
      )}
    </div>
  );
}