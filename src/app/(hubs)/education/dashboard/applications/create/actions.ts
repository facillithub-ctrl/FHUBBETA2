'use server';

import createClient from '@/utils/supabase/server';
import { redirect } from 'next/navigation';

export async function getCreateDocuments() {
  const supabase = await createClient();
  
  // 1. Verificar autenticação
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return [];
  }

  // 2. Buscar documentos reais
  const { data, error } = await supabase
    .from('documents') 
    .select('*')
    .eq('user_id', user.id)
    .order('updated_at', { ascending: false });

  if (error) {
    // Log detalhado para debug (não quebra a aplicação)
    console.error('Erro Supabase (getCreateDocuments):', JSON.stringify(error, null, 2));
    return []; 
  }

  return data || [];
}

export async function createNewDocument(type: string, title: string = 'Sem Título') {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) throw new Error('Usuário não autenticado');

  const { data, error } = await supabase
    .from('documents')
    .insert({
      user_id: user.id,
      title: title,
      type: type,
      content: {}, 
      status: 'draft'
    })
    .select()
    .single();

  if (error) {
    console.error('Erro ao criar documento:', error);
    throw new Error('Falha ao criar documento');
  }
  
  return data;
}

export async function getDocumentById(id: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return null;

  const { data, error } = await supabase
    .from('documents')
    .select('*')
    .eq('id', id)
    .eq('user_id', user.id) // Garante que só o dono acessa
    .single();

  if (error) return null;
  return data;
}

export async function saveDocumentContent(id: string, content: any) {
  const supabase = await createClient();
  
  const { error } = await supabase
    .from('documents')
    .update({ 
      content: content,
      updated_at: new Date().toISOString() 
    })
    .eq('id', id);

  if (error) throw error;
}