import React from 'react';
import { redirect } from 'next/navigation';
import createClient from '@/utils/supabase/server';
import StoriesClientPage from './components/StoriesClientPage';

export default async function StoriesPage() {
  const supabase = await createClient();
  
  // 1. Autenticação e Dados do Usuário
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  // 2. Buscar perfil completo para exibir avatar, nome, badges, etc.
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  // Mapear para o tipo UserProfile usado no front
  const currentUser = {
    id: user.id,
    name: profile?.full_name || 'Leitor',
    username: profile?.nickname || 'usuario',
    avatar_url: profile?.avatar_url,
    verification_badge: profile?.verification_badge,
    role: profile?.user_category || 'student',
  };

  // 3. Renderizar o Client Component que gerencia o estado da interface
  return <StoriesClientPage currentUser={currentUser} />;
}