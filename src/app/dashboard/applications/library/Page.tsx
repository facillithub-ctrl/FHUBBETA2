import createSupabaseServerClient from '@/utils/supabase/server';
import StudentLibraryDashboard from './components/StudentLibraryDashboard';
import TeacherLibraryDashboard from './components/TeacherLibraryDashboard';
import { redirect } from 'next/navigation';

export default async function LibraryPage() {
  const supabase = await createSupabaseServerClient();
  
  // Verifica sessão
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) {
    redirect('/login');
  }

  // Busca role do usuário (ajuste 'profiles' e 'role' conforme seu banco real)
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  // Define padrão como 'student' se não encontrar
  const userRole = profile?.role || 'student';

  return (
    <div className="h-full bg-[#F8F9FA]">
      {/* Renderiza a Dashboard correta baseada no cargo */}
      {userRole === 'teacher' || userRole === 'admin' ? (
        <TeacherLibraryDashboard user={user} />
      ) : (
        <StudentLibraryDashboard user={user} />
      )}
    </div>
  );
}