// src/app/dashboard/applications/write/page.tsx
import { redirect } from 'next/navigation';
import createSupabaseServerClient from '@/utils/supabase/server';
import StudentDashboard from './components/StudentDashboard';
import TeacherDashboard from './components/TeacherDashboard';
import {
  getPrompts,
  getStudentStatistics,
  calculateWritingStreak,
  getUserStateRank,
  getFrequentErrors,
  getCurrentEvents,
  getCorrectedEssaysForTeacher,
  getPendingEssaysForTeacher
} from './actions';
import type { UserProfile } from '../../types';

export default async function WritePage() {
  const supabase = await createSupabaseServerClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  if (!profile) redirect('/login');

  // --- ALUNO ---
  if (['aluno', 'vestibulando'].includes(profile.user_category || '')) {
    const [
        essaysResult,
        promptsResult,
        statsResult,
        streakResult,
        rankResult,
        frequentErrorsResult,
        currentEventsResult,
    ] = await Promise.all([
      supabase.from('essays').select('id, title, status, submitted_at').eq('student_id', user.id).order('submitted_at', { ascending: false }),
      getPrompts(),
      getStudentStatistics(),
      calculateWritingStreak(),
      getUserStateRank(),
      getFrequentErrors(),
      getCurrentEvents(),
    ]);
    
    return (
      <StudentDashboard
        initialEssays={essaysResult.data || []}
        prompts={promptsResult.data || []}
        statistics={statsResult.data ?? null}
        streak={streakResult.data || 0}
        rankInfo={rankResult.data}
        frequentErrors={frequentErrorsResult.data || []}
        currentEvents={currentEventsResult.data || []}
        targetExam={profile.target_exam}
        examDate={null} 
      />
    );
  }

  // --- PROFESSOR / GESTOR ---
  if (['professor', 'gestor', 'administrator', 'diretor'].includes(profile.user_category || '')) {
     const [pendingRes, correctedRes] = await Promise.all([
        getPendingEssaysForTeacher(user.id, profile.organization_id),
        getCorrectedEssaysForTeacher(user.id, profile.organization_id)
     ]);
     
     // Transforma dados para o formato esperado (garante que profile não seja array)
     const formatData = (list: any[]) => list?.map(item => ({
         ...item,
         profiles: Array.isArray(item.profiles) ? item.profiles[0] : item.profiles
     })) || [];

    return (
        <TeacherDashboard
            userProfile={profile as UserProfile}
            pendingEssays={formatData(pendingRes.data || [])}
            correctedEssays={formatData(correctedRes.data || [])}
        />
    );
  }

  return <div className="p-8">Acesso não autorizado a este módulo.</div>;
}