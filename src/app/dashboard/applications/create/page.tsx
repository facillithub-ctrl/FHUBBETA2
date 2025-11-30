import createClient from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import StudentCreateDashboard from './components/StudentCreateDashboard';
import { getCreateDocuments } from './actions';

export default async function CreatePage() {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  if (!profile) redirect('/login');

  const documents = await getCreateDocuments();

  return (
    <div className="h-full bg-[#F8F9FA] dark:bg-[#09090B]">
      <StudentCreateDashboard 
        documents={documents} 
        userProfile={profile} 
      />
    </div>
  );
}