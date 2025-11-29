'use server'

// CORREÇÃO: Importando como default (sem chaves)
import createClient from '@/utils/supabase/server'; 
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

export async function createNewDocument() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) throw new Error("Unauthorized");

  const { data, error } = await supabase
    .from('facillit_create_documents')
    .insert({
      user_id: user.id,
      title: 'Sem Título',
      content_json: {},
      page_settings: { size: 'a4', orientation: 'portrait', bgColor: '#fdfbf7', lineStyle: 'none' }
    })
    .select('id')
    .single();

  if (error) {
    console.error('Erro ao criar:', error);
    throw new Error('Falha ao criar documento');
  }

  redirect(`/dashboard/applications/create/${data.id}`);
}

export async function saveDocument(id: string, content: any, title: string, plainText: string) {
  const supabase = await createClient();
  
  const { error } = await supabase
    .from('facillit_create_documents')
    .update({
      content_json: content,
      title: title,
      plain_text: plainText,
      updated_at: new Date().toISOString()
    })
    .eq('id', id);

  if (error) throw new Error('Falha ao salvar');
  
  revalidatePath(`/dashboard/applications/create/${id}`);
  return { success: true };
}

export async function getDocument(id: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('facillit_create_documents')
    .select('*')
    .eq('id', id)
    .single();

  if (error) return null;
  return data;
}

export async function generateAISummary(text: string) {
  // Simulação de IA
  return `Resumo Automático:\n\n${text.substring(0, 150)}...\n(Resumo gerado pela IA do Facillit)`;
}