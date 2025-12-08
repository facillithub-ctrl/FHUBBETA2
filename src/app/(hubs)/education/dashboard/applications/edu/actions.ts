"use server";

import createSupabaseServerClient from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";
import { UserProfile } from "../../types";

/**
 * Helper de segurança para verificar se o usuário logado é um administrador da plataforma
 * OU um diretor da organização especificada.
 */
async function isOrganizationManager(organizationId: string): Promise<boolean> {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return false;

  const { data: profile } = await supabase
    .from('profiles')
    .select('user_category, organization_id')
    .eq('id', user.id)
    .single();

  if (!profile) return false;

  // Administradores da plataforma podem gerenciar qualquer organização
  if (profile.user_category === 'administrator') {
    return true;
  }

  // Diretores só podem gerenciar a sua própria organização
  if (profile.user_category === 'diretor' && profile.organization_id === organizationId) {
    return true;
  }

  return false;
}

// =================================================================
// == FUNÇÕES DE BUSCA DE DADOS (DATA FETCHING)
// =================================================================

/**
 * Busca todos os dados de uma organização, incluindo membros e turmas.
 */
export async function getOrganizationData(orgId: string) {
    const supabase = await createSupabaseServerClient();
    
    const { data: organization, error: orgError } = await supabase
        .from('organizations')
        .select('*')
        .eq('id', orgId)
        .single();
    
    if (orgError) {
        console.error("Erro ao buscar organização:", orgError.message);
        return null;
    }

    const { data: members } = await supabase
        .from('profiles')
        .select('*')
        .eq('organization_id', orgId);

    const { data: classes, error: classesError } = await supabase
        .from('school_classes')
        .select(`
            id, name, organization_id,
            class_members (
                role,
                profiles!inner ( id, full_name, user_category )
            )
        `)
        .eq('organization_id', orgId);

    if (classesError) {
        console.error("Erro ao buscar turmas:", classesError.message);
        return null;
    }
    
    const formattedClasses = classes?.map(c => ({
        id: c.id,
        name: c.name,
        organization_id: c.organization_id,
        members: c.class_members.map((m: any) => ({
            ...m.profiles,
            fullName: m.profiles.full_name,
            role: m.role
        }))
    })) || [];
    
    const { data: unassignedUsers } = await supabase.rpc('get_unassigned_users', { org_id: orgId });
    
    return {
        organization,
        members: members || [],
        classes: formattedClasses,
        unassignedUsers: unassignedUsers || [],
    };
}

/**
 * Busca usuários de uma organização que não estão em nenhuma turma.
 */
export async function getUnassignedUsers(orgId: string): Promise<UserProfile[]> {
    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase.rpc('get_unassigned_users', { org_id: orgId });
    if (error) {
        console.error("Erro ao buscar usuários não designados:", error);
        return [];
    }
    return data as UserProfile[];
}


// =================================================================
// == FUNÇÕES DE MODIFICAÇÃO DE DADOS (MUTATIONS)
// =================================================================

/**
 * Cria uma nova turma dentro de uma organização.
 */
export async function createClass(organizationId: string, name: string) {
    // Verificação de permissão aprimorada
    if (!(await isOrganizationManager(organizationId))) {
        return { error: 'Acesso não autorizado para criar turmas nesta instituição.' };
    }

    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase
        .from('school_classes')
        .insert({ organization_id: organizationId, name: name })
        .select('id, name, organization_id')
        .single();
        
    if (error) {
        if (error.code === '23505') {
            return { error: `Já existe uma turma chamada "${name}" nesta instituição.` };
        }
        return { error: `Erro do banco de dados: ${error.message}` };
    }

    revalidatePath('/dashboard/applications/edu');
    return { data };
}

/**
 * Adiciona um usuário a uma turma.
 */
export async function addUserToClass(classId: string, userId: string, role: 'student' | 'teacher') {
    const supabase = await createSupabaseServerClient();
    
    // Busca o organization_id da turma para validar a permissão
    const { data: classData, error: classError } = await supabase
        .from('school_classes')
        .select('organization_id')
        .eq('id', classId)
        .single();
    
    if (classError || !classData) {
        return { error: 'Turma não encontrada.' };
    }

    if (!(await isOrganizationManager(classData.organization_id))) {
        return { error: 'Acesso não autorizado para modificar esta turma.' };
    }

    const { data, error } = await supabase
        .from('class_members')
        .insert({ class_id: classId, user_id: userId, role: role });
        
    if (error) {
        return { error: "Não foi possível adicionar o usuário. Ele já pode pertencer a esta turma." };
    }
    
    revalidatePath('/dashboard/applications/edu');
    return { data: { success: true } };
}

/**
 * Remove um usuário de uma turma.
 */
export async function removeUserFromClass(classId: string, userId: string) {
    const supabase = await createSupabaseServerClient();

    // Busca o organization_id da turma para validar a permissão
    const { data: classData, error: classError } = await supabase
        .from('school_classes')
        .select('organization_id')
        .eq('id', classId)
        .single();

    if (classError || !classData) {
        return { error: 'Turma não encontrada.' };
    }
    
    if (!(await isOrganizationManager(classData.organization_id))) {
        return { error: 'Acesso não autorizado para modificar esta turma.' };
    }

    const { error } = await supabase
        .from('class_members')
        .delete()
        .eq('class_id', classId)
        .eq('user_id', userId);
        
    if (error) {
        return { error: "Não foi possível remover o usuário." };
    }
    
    revalidatePath('/dashboard/applications/edu');
    return { data: { success: true } };
}