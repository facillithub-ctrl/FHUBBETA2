// Adicionar ao src/app/dashboard/applications/library/actions.ts
'use server'

import { createLibraryServerClient } from '@/lib/librarySupabase';
import { revalidatePath } from 'next/cache';

export async function publishOfficialContent(formData: FormData) {
  const title = formData.get('title') as string;
  const description = formData.get('description') as string;
  const subject = formData.get('subject') as string;
  const type = formData.get('type') as string;
  const file = formData.get('file') as File;

  const libDb = createLibraryServerClient();

  // 1. Upload do Arquivo para o Storage do Supabase (Bucket: library-official)
  // Nota: Você precisa criar o bucket 'library-official' no Supabase
  const fileName = `${Date.now()}-${file.name}`;
  const { data: uploadData, error: uploadError } = await libDb
    .storage
    .from('library-official')
    .upload(fileName, file);

  if (uploadError) throw new Error('Falha no upload');

  // 2. Gerar URL pública
  const { data: { publicUrl } } = libDb
    .storage
    .from('library-official')
    .getPublicUrl(fileName);

  // 3. Salvar metadados no banco
  await libDb.from('official_contents').insert({
    title,
    description,
    subject,
    content_type: type,
    url: publicUrl,
    // Em um cenário real, pegamos o ID do autor da sessão
    metadata: { size: file.size }
  });

  revalidatePath('/dashboard/applications/library');
}