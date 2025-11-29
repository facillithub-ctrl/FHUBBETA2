'use server'

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
      title: 'Novo Projeto',
      content_json: {},
      page_settings: { size: 'a4', orientation: 'portrait', bgColor: '#ffffff' }
    })
    .select('id')
    .single();

  if (error) throw new Error('Falha ao criar documento');

  redirect(`/dashboard/applications/create/${data.id}`);
}

export async function saveDocument(id: string, content: any, title: string) {
  const supabase = await createClient();
  
  const { error } = await supabase
    .from('facillit_create_documents')
    .update({
      content_json: content,
      title: title,
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

export async function deleteDocument(id: string) {
    const supabase = await createClient();
    await supabase.from('facillit_create_documents').delete().eq('id', id);
    revalidatePath('/dashboard/applications/create');
}