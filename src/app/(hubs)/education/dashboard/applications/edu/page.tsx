import createSupabaseServerClient from "@/utils/supabase/server";
import { redirect } from 'next/navigation';
// ✅ CORREÇÃO FINAL: Apontando para o local correto das actions E dos componentes
import { getOrganizationData, getUnassignedUsers } from './actions'; 
import { UserProfile } from "@/app/(hubs)/education/dashboard/types";
import ManageSchools from './components/ManageSchools'; 

// Componente para a visão do Aluno/Professor (Placeholder)
const StudentTeacherEduView = () => {
    return (
        <div>
            <h1 className="text-3xl font-bold text-dark-text dark:text-white">Módulo Facillit Edu</h1>
            <p className="text-text-muted dark:text-gray-400 mt-2">
                Bem-vindo(a)! Em breve, você verá aqui suas turmas, materiais e atividades.
            </p>
        </div>
    );
};

// Componente para a visão do Diretor
const DirectorEduView = async ({ organizationId }: { organizationId: string }) => {
    const organizationData = await getOrganizationData(organizationId);
    // getUnassignedUsers pode retornar null em caso de erro, então tratamos isso
    const unassignedUsers: UserProfile[] = organizationData?.unassignedUsers || [];

    return (
        <div>
            <h1 className="text-3xl font-bold mb-6 text-dark-text dark:text-white">Painel de Gestão - Facillit Edu</h1>
            {organizationData ? (
                <ManageSchools 
                    organization={organizationData.organization}
                    classes={organizationData.classes}
                    members={organizationData.members}
                    unassignedUsers={unassignedUsers}
                />
            ) : (
                <div className="bg-white dark:bg-dark-card p-6 rounded-lg shadow">
                    <p className="text-center text-text-muted">Não foi possível carregar os dados da sua instituição.</p>
                </div>
            )}
        </div>
    );
};

export default async function FacillitEduPage() {
    const supabase = await createSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return redirect('/login');
    }

    const { data: profile } = await supabase
        .from('profiles')
        .select('organization_id, user_category')
        .eq('id', user.id)
        .single();

    if (!profile) {
        return redirect('/login');
    }
    
    // Roteamento baseado no perfil do usuário
    switch (profile.user_category) {
        case 'diretor':
            if (!profile.organization_id) {
                return (
                    <div>
                        <h1 className="text-2xl font-bold mb-4">Ação Necessária</h1>
                        <p>Seu perfil de diretor não está vinculado a nenhuma instituição. Entre em contato com o suporte.</p>
                    </div>
                );
            }
            return <DirectorEduView organizationId={profile.organization_id} />;
        
        case 'aluno':
        case 'vestibulando':
        case 'professor':
            return <StudentTeacherEduView />;

        default:
            return redirect('/dashboard');
    }
}