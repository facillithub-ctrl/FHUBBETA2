"use server";

import createClient from "@/utils/supabase/server";
import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import { revalidatePath } from 'next/cache';

// --- CONFIGURAÇÃO DO CLIENTE ADMIN DA LIBRARY ---
const getLibraryAdminClient = () => {
    const url = process.env.NEXT_PUBLIC_LIBRARY_SUPABASE_URL;
    const key = process.env.LIBRARY_SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_LIBRARY_SUPABASE_ANON_KEY;
    
    if (!url || !key) return null;
    
    return createSupabaseClient(url, key, {
        auth: { persistSession: false }
    });
};

export async function getResourcesForSelector(module: string) {
    const supabase = await createClient();
    
    try {
        if (module === 'test') {
            const { data } = await supabase.from('tests').select('id, title').order('created_at', { ascending: false }).limit(50);
            return data || [];
        }
        
        if (module === 'write') {
            const { data } = await supabase.from('essay_prompts').select('id, title').order('created_at', { ascending: false }).limit(50);
            return data || [];
        }

        if (module === 'library') {
            const libDb = getLibraryAdminClient();
            if (!libDb) return [];

            // Busca na tabela official_contents (padrão do Facillit Library)
            const { data } = await libDb.from('official_contents').select('id, title').order('created_at', { ascending: false }).limit(50);
            return data || [];
        }
    } catch (err) {
        console.error("Erro ao buscar recursos:", err);
        return [];
    }
    return [];
}

export async function createOrUpdateGPSAction(data: any) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    // Validação básica para evitar salvar sem link
    if (!data.action_link) {
        return { success: false, error: "O link da ação é obrigatório." };
    }

    const payload = {
        title: data.title,
        description: data.description,
        module: data.module,
        action_link: data.action_link,
        priority: data.priority,
        active: data.active,
        icon_name: data.icon_name || 'Star',
        bg_color: data.bg_color || 'bg-blue-600',
        button_text: data.button_text || 'Acessar',
        target_role: data.target_role || 'all',
        trigger_condition: data.trigger_condition || 'always',
        created_by: user?.id
    };

    try {
        if (data.id) {
            await supabase.from('system_suggested_actions').update(payload).eq('id', data.id);
        } else {
            await supabase.from('system_suggested_actions').insert(payload);
        }
        revalidatePath('/admin/gps');
        return { success: true };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

export async function getGPSActions() {
    const supabase = await createClient();
    const { data } = await supabase.from('system_suggested_actions').select('*').order('created_at', { ascending: false });
    return data || [];
}

export async function deleteGPSAction(id: string) {
    const supabase = await createClient();
    await supabase.from('system_suggested_actions').delete().eq('id', id);
    revalidatePath('/admin/gps');
    return { success: true };
}