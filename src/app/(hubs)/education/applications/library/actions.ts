'use server'

import { createLibraryServerClient, createLibraryAdminClient } from '@/lib/librarySupabase';
import createClient from '@/utils/supabase/server';
import { revalidatePath } from 'next/cache';

// --- Interfaces ---
export interface RepositoryItem {
  id: string;
  title: string;
  type: 'folder' | 'pdf' | 'doc' | 'note' | 'creative_text' | 'image' | 'video' | 'link';
  updated_at: string;
  parent_folder_id: string | null;
  size?: string;
}

export interface TeacherStats {
  activeContents: number;
  totalViews: number;
  totalDownloads: number;
  engagedStudents: number;
}

export interface RecentActivityItem {
  id: string;
  studentName: string;
  action: string;
  time: string;
  contentTitle: string;
}

export interface LibraryInsights {
  booksRead: number;
  totalXP: number;
  currentLevel: number;
  nextLevelXP: number;
  streakDays: number;
  favoriteCategory: string;
  recentActivity: { date: string; count: number }[];
}

// ==============================================================================
// 1. AÇÕES DO ALUNO (Repositório Pessoal / Drive)
// ==============================================================================

export async function getUserRepository(folderId: string | null = null) {
  const authClient = await createClient();
  const { data: { user } } = await authClient.auth.getUser();

  if (!user) throw new Error('Unauthorized');

  const libDb = createLibraryServerClient();

  let query = libDb
    .from('user_repository_items')
    .select('*')
    .eq('user_id', user.id)
    .order('type', { ascending: true }) // Pastas primeiro
    .order('title', { ascending: true });

  if (folderId) {
    query = query.eq('parent_folder_id', folderId);
  } else {
    query = query.is('parent_folder_id', null);
  }

  const { data, error } = await query;

  if (error) throw new Error(error.message);
  return data as RepositoryItem[];
}

export async function createFolder(name: string, parentId: string | null) {
  const authClient = await createClient();
  const { data: { user } } = await authClient.auth.getUser();
  if (!user) return;

  const libDb = createLibraryServerClient();
  await libDb.from('user_repository_items').insert({
    user_id: user.id,
    title: name,
    type: 'folder',
    parent_folder_id: parentId
  });
  
  revalidatePath('/dashboard/applications/library');
}

// ==============================================================================
// 2. AÇÕES DO PROFESSOR (Publicação de Conteúdo Oficial)
// ==============================================================================

export async function publishOfficialContent(formData: FormData) {
  const authClient = await createClient();
  const { data: { user } } = await authClient.auth.getUser();
  
  if (!user) throw new Error('Unauthorized');

  // Extração dos dados do formulário
  const title = (formData.get('title') as string) || 'Sem Título';
  const description = (formData.get('description') as string) || '';
  const subject = (formData.get('subject') as string) || 'Geral';
  const type = (formData.get('type') as string) || 'book';
  const author = (formData.get('author') as string) || 'FHub Oficial';
  
  const file = formData.get('file') as File;
  const coverFile = formData.get('cover') as File;

  if (!file || file.size === 0) {
    throw new Error('Arquivo principal obrigatório.');
  }

  // IMPORTANTE: Usamos o cliente ADMIN para permissão de escrita no Storage
  const libDb = createLibraryAdminClient();

  // --- A. Upload do Arquivo Principal ---
  const cleanName = file.name.replace(/[^a-zA-Z0-9.-]/g, '');
  const fileName = `${Date.now()}-${cleanName}`;
  const fileBuffer = Buffer.from(await file.arrayBuffer());

  const { error: uploadError } = await libDb
    .storage
    .from('library-official')
    .upload(fileName, fileBuffer, {
      contentType: file.type,
      upsert: false
    });

  if (uploadError) {
    console.error('Erro detalhado do upload:', uploadError);
    throw new Error(`Falha no upload: ${uploadError.message}`);
  }

  const { data: { publicUrl: fileUrl } } = libDb
    .storage
    .from('library-official')
    .getPublicUrl(fileName);

  // --- B. Upload da Capa (Opcional) ---
  let coverUrl = null;
  if (coverFile && coverFile.size > 0) {
    const cleanCoverName = coverFile.name.replace(/[^a-zA-Z0-9.-]/g, '');
    const coverName = `covers/${Date.now()}-${cleanCoverName}`;
    const coverBuffer = Buffer.from(await coverFile.arrayBuffer());

    const { error: coverError } = await libDb.storage
      .from('library-official')
      .upload(coverName, coverBuffer, {
        contentType: coverFile.type,
        upsert: false
      });
    
    if (!coverError) {
      const { data } = libDb.storage.from('library-official').getPublicUrl(coverName);
      coverUrl = data.publicUrl;
    }
  }

  // --- C. Salvar Metadados no Banco ---
  const { error: dbError } = await libDb.from('official_contents').insert({
    title,
    description,
    subject,
    content_type: type,
    url: fileUrl,
    cover_image: coverUrl,
    author: author,
    metadata: { 
      size: file.size, 
      original_name: file.name,
      author_id: user.id 
    }
  });

  if (dbError) {
    console.error('Erro ao salvar no banco:', dbError);
    // Limpeza: remove o arquivo se falhar no banco para não deixar lixo
    await libDb.storage.from('library-official').remove([fileName]);
    throw new Error('Erro ao salvar registro no banco de dados');
  }

  revalidatePath('/dashboard/applications/library');
}

export async function getTeacherDashboardData() {
  const libDb = createLibraryServerClient(); 
  const authClient = await createClient();

  // 1. Estatísticas
  const [contentsRes, progressRes] = await Promise.all([
    libDb.from('official_contents').select('id', { count: 'exact' }),
    libDb.from('user_library_progress').select('user_id, status')
  ]);

  const totalContents = contentsRes.count || 0;
  const allProgress = progressRes.data || [];

  const uniqueStudents = new Set(allProgress.map(p => p.user_id)).size;
  const totalCompleted = allProgress.filter(p => p.status === 'completed').length;

  const stats: TeacherStats = {
    activeContents: totalContents,
    totalViews: allProgress.length,
    totalDownloads: totalCompleted,
    engagedStudents: uniqueStudents
  };

  // 2. Atividade Recente (Cross-Database Join)
  const { data: recentProgress } = await libDb
    .from('user_library_progress')
    .select('created_at, user_id, status, official_contents(title)')
    .order('created_at', { ascending: false })
    .limit(5);

  let recentActivity: RecentActivityItem[] = [];

  if (recentProgress && recentProgress.length > 0) {
    const userIds = recentProgress.map(p => p.user_id);
    
    // Busca nomes no banco de Auth/Profiles
    const { data: profiles } = await authClient
      .from('profiles')
      .select('id, full_name')
      .in('id', userIds);
    
    const profileMap: Record<string, string> = {};
    profiles?.forEach(p => { profileMap[p.id] = p.full_name || 'Aluno'; });

    recentActivity = recentProgress.map((item: any) => ({
      id: item.created_at + item.user_id,
      studentName: profileMap[item.user_id] || 'Aluno Desconhecido',
      action: item.status === 'completed' ? 'concluiu' : 'iniciou',
      time: item.created_at,
      contentTitle: item.official_contents?.title || 'Conteúdo'
    }));
  }

  return { stats, recentActivity };
}

export async function getOfficialContentsList() {
    const libDb = createLibraryServerClient();
    const { data } = await libDb
        .from('official_contents')
        .select('*')
        .order('created_at', { ascending: false });
    return data || [];
}

// ==============================================================================
// 3. GAMIFICATION & INSIGHTS DO ALUNO
// ==============================================================================

function calculateLevel(xp: number) {
  const level = Math.floor(Math.sqrt(xp / 100));
  return level < 1 ? 1 : level;
}

export async function getStudentInsights(): Promise<LibraryInsights> {
  const authClient = await createClient();
  const { data: { user } } = await authClient.auth.getUser();

  if (!user) throw new Error('Unauthorized');

  const libDb = createLibraryServerClient();

  const { data: progress } = await libDb
    .from('user_library_progress')
    .select(`
      status,
      xp_earned,
      last_read_at,
      official_contents ( subject )
    `)
    .eq('user_id', user.id);

  if (!progress || progress.length === 0) {
    return {
      booksRead: 0,
      totalXP: 0,
      currentLevel: 1,
      nextLevelXP: 100,
      streakDays: 0,
      favoriteCategory: 'Nenhuma',
      recentActivity: []
    };
  }

  const booksRead = progress.filter(p => p.status === 'completed').length;
  const totalXP = progress.reduce((acc, curr) => acc + (curr.xp_earned || 0), 0);
  const currentLevel = calculateLevel(totalXP);
  const nextLevelXP = Math.pow(currentLevel + 1, 2) * 100;

  const subjects: Record<string, number> = {};
  progress.forEach(p => {
    // @ts-ignore
    const subj = p.official_contents?.subject || 'Outros';
    subjects[subj] = (subjects[subj] || 0) + 1;
  });
  const favoriteCategory = Object.keys(subjects).reduce((a, b) => subjects[a] > subjects[b] ? a : b, 'Variados');

  return {
    booksRead,
    totalXP,
    currentLevel,
    nextLevelXP,
    streakDays: booksRead > 0 ? 1 : 0, // Mock simples de streak
    favoriteCategory,
    recentActivity: []
  };
}

// ==============================================================================
// 4. REGISTRAR CONCLUSÃO E GANHAR XP
// ==============================================================================

export async function completeContent(contentId: string) {
  const authClient = await createClient();
  const { data: { user } } = await authClient.auth.getUser();
  if (!user) return;

  const libDb = createLibraryServerClient();
  const xpReward = 150; // XP por conclusão

  // Verifica se já leu para não duplicar XP infinito
  const { data: existing } = await libDb
    .from('user_library_progress')
    .select('id, status')
    .eq('user_id', user.id)
    .eq('content_id', contentId)
    .single();

  if (existing) {
    // Se já existia, só atualiza se não estava completo
    if (existing.status !== 'completed') {
        await libDb.from('user_library_progress').update({
          status: 'completed',
          progress_percentage: 100,
          xp_earned: xpReward,
          last_read_at: new Date().toISOString()
        }).eq('id', existing.id);
    }
  } else {
    // Se é a primeira vez
    await libDb.from('user_library_progress').insert({
      user_id: user.id,
      content_id: contentId,
      status: 'completed',
      progress_percentage: 100,
      xp_earned: xpReward
    });
  }
}

// ==============================================================================
// 5. GPS & DEEP LINKING
// ==============================================================================

export async function getLibraryContentById(contentId: string) {
  const libDb = createLibraryServerClient();
  
  // Tenta buscar em conteúdos oficiais
  const { data: official, error } = await libDb
    .from('official_contents')
    .select('*')
    .eq('id', contentId)
    .single();
  
  if (official) return official;

  return null;
}