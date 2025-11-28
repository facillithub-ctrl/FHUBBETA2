"use server";

import createClient from "@/utils/supabase/server";
import { revalidatePath } from 'next/cache';

// --- BUSCAR AÇÕES EXISTENTES ---
export async function getGPSActions() {
    const supabase = await createClient();
    const { data } = await supabase
        .from('system_suggested_actions')
        .select('*')
        .order('created_at', { ascending: false });
    
    return data || [];
}

// --- NOVO: BUSCAR RECURSOS PARA O SELETOR (TESTES E TEMAS) ---
export async function getResourcesForSelector(module: string) {
    const supabase = await createClient();
    
    if (module === 'test') {
        const { data } = await supabase
            .from('tests')
            .select('id, title')
            .eq('is_public', true) // Apenas testes públicos/visíveis
            .order('created_at', { ascending: false })
            .limit(50);
        return data || [];
    }
    
    if (module === 'write') {
        // Assumindo que a tabela de temas se chama 'essay_prompts'
        const { data } = await supabase
            .from('essay_prompts') 
            .select('id, title')
            .eq('is_active', true)
            .order('created_at', { ascending: false })
            .limit(50);
        return data || [];
    }

    return [];
}

// --- CRIAR OU ATUALIZAR AÇÃO ---
export async function createOrUpdateGPSAction(data: any) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    const payload = {
        title: data.title,
        description: data.description,
        module: data.module,
        action_link: data.action_link,
        priority: data.priority,
        active: data.active,
        icon_name: data.icon_name || 'Star',
        bg_color: data.bg_color || 'bg-blue-600',
        image_url: data.image_url || null,
        button_text: data.button_text || 'Acessar',
        created_by: user?.id
    };

    try {
        if (data.id) {
            const { error } = await supabase.from('system_suggested_actions').update(payload).eq('id', data.id);
            if (error) throw new Error(error.message);
        } else {
            const { error } = await supabase.from('system_suggested_actions').insert(payload);
            if (error) throw new Error(error.message);
        }

        revalidatePath('/admin/gps');
        revalidatePath('/dashboard'); 
        return { success: true };

    } catch (error: any) {
        console.error("Erro ao salvar:", error);
        return { success: false, error: error.message };
    }
}

export async function deleteGPSAction(id: string) {
    const supabase = await createClient();
    await supabase.from('system_suggested_actions').delete().eq('id', id);
    revalidatePath('/admin/gps');
    return { success: true };
}