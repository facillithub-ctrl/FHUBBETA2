"use server";

import createSupabaseServerClient from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";
import { EssayPrompt } from "../dashboard/types";

// Helper de Segurança para verificar se o usuário é admin
async function isAdmin() {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return false;

  const { data: profile } = await supabase
    .from('profiles')
    .select('user_category')
    .eq('id', user.id)
    .single();

  return profile?.user_category === 'administrator';
}

//================================================================//
// GESTÃO DO MÓDULO WRITE (/admin/write)
//================================================================//

// Atualiza o selo de verificação de um usuário (aluno ou professor)
export async function updateUserVerification(userId: string, badge: string | null) {
    if (!(await isAdmin())) return { error: 'Acesso não autorizado.' };
    const supabase = await createSupabaseServerClient();
    
    const { error } = await supabase
        .from('profiles')
        .update({ verification_badge: badge })
        .eq('id', userId);

    if (error) {
        return { error: error.message };
    }

    revalidatePath('/admin/write');
    return { success: true };
}

// Busca dados gerais para o painel do Write
export async function getWriteModuleData() {
    if (!(await isAdmin())) return { error: 'Acesso não autorizado.' };
    const supabase = await createSupabaseServerClient();
    
    // Busca alunos
    const { data: students, error: studentsError } = await supabase
        .from('profiles')
        .select('id, full_name, user_category, created_at, verification_badge')
        .in('user_category', ['student', 'vestibulando', 'aluno'])
        .order('created_at', { ascending: false })
        .limit(50); // Limite para performance, idealmente paginado

    // Busca professores
    const { data: professors, error: professorsError } = await supabase
        .from('profiles')
        .select('id, full_name, verification_badge')
        .in('user_category', ['professor', 'teacher']);

    // Busca temas (prompts)
    const { data: prompts, error: promptsError } = await supabase
        .from('essay_prompts')
        .select('*')
        .order('created_at', { ascending: false });

    if (studentsError || professorsError || promptsError) {
        const error = studentsError || professorsError || promptsError;
        return { error: error?.message };
    }

    return { data: { students, professors, prompts } };
}

// Cria ou atualiza um tema de redação
export async function upsertPrompt(promptData: Partial<EssayPrompt>) {
    if (!(await isAdmin())) return { error: 'Acesso não autorizado.' };
    const supabase = await createSupabaseServerClient();
    
    // Remove campos undefined para evitar erro no update
    const cleanData = Object.fromEntries(
        Object.entries(promptData).filter(([_, v]) => v !== undefined && v !== null && v !== '')
    );

    const { data, error } = await supabase
        .from('essay_prompts')
        .upsert(promptData) // O ID determina se é update ou insert
        .select()
        .single();
    
    if (error) return { error: error.message };
    
    revalidatePath('/admin/write');
    return { data };
}

// Deleta um tema de redação
export async function deletePrompt(promptId: string) {
    if (!(await isAdmin())) return { error: 'Acesso não autorizado.' };
    const supabase = await createSupabaseServerClient();
    const { error } = await supabase.from('essay_prompts').delete().eq('id', promptId);

    if (error) return { error: error.message };

    revalidatePath('/admin/write');
    return { success: true };
}

// =================================================================
// GESTÃO DE INSTITUIÇÕES (/admin/schools)
// =================================================================

// Busca todas as organizações cadastradas
export async function getAllOrganizations() {
    if (!(await isAdmin())) return { error: 'Acesso não autorizado.' };
    const supabase = await createSupabaseServerClient();
    
    // Ajuste na query para contar membros se necessário, ou trazer owner
    const { data, error } = await supabase
        .from('organizations')
        .select('id, name, cnpj, created_at, owner_id'); // Removida relação complexa para simplificar por enquanto

    if (error) {
        return { error: error.message };
    }
    
    return { data };
}

// Cria uma nova organização
export async function createOrganization(name: string, cnpj: string | null) {
    if (!(await isAdmin())) return { error: 'Acesso não autorizado.' };
    const supabase = await createSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    const { data, error } = await supabase
        .from('organizations')
        .insert({ name, cnpj, owner_id: user!.id })
        .select()
        .single();
    
    if (error) {
        return { error: `Erro do banco de dados: ${error.message}` };
    }

    revalidatePath('/admin/schools');
    return { data };
}

// Gera código de convite para entrar em uma organização
export async function generateInviteCode(formData: { organizationId: string; role: 'diretor' | 'professor' | 'aluno'; fullName?: string; email?: string }) {
    if (!(await isAdmin())) return { error: 'Acesso não autorizado.' };
    const supabase = await createSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();

    // Gera um código aleatório simples: FHB-XXXXXX
    const codeSuffix = Math.random().toString(36).substring(2, 8).toUpperCase();
    const code = `FHB-${codeSuffix}`;

    const { data, error } = await supabase
        .from('invitation_codes')
        .insert({
            code: code,
            organization_id: formData.organizationId,
            role: formData.role,
            full_name: formData.fullName || null, // Opcional
            email: formData.email || null,       // Opcional
            created_by: user!.id,
            is_active: true
        })
        .select('code')
        .single();

    if (error) {
        return { error: `Erro ao gerar código: ${error.message}` };
    }
    
    revalidatePath('/admin/schools');
    return { data };
}