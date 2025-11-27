// src/app/dashboard/types.ts

// Define a estrutura de um perfil de utilizador
export type UserProfile = {
  id: string;
  fullName: string | null;
  email?: string | null;
  nickname: string | null;
  avatarUrl: string | null;
  userCategory: string | null;
  pronoun: string | null;
  birthDate: string | null;
  schoolName: string | null;
  organization_id: string | null;
  target_exam: string | null;
  active_modules: string[] | null;
  verification_badge: string | null;
  has_completed_onboarding?: boolean;
  role?: 'student' | 'teacher';
};

// ✅ ADICIONADO: Define a estrutura das estatísticas do usuário
export type UserStats = {
  streak: number;
  rank: number | null;
  xp: number;
  coins: number;
};

export type Organization = {
    id: string;
    name: string;
    cnpj: string | null;
};

export type SchoolClass = {
    id: string;
    name: string;
    organization_id: string;
};

export type Update = {
  id: string;
  created_at: string;
  title: string;
  content: string;
  version: string | null;
  module_slug: string | null;
  category: 'Nova Funcionalidade' | 'Melhoria' | 'Correção' | null;
};

export type EssayPrompt = {
    id: string;
    title: string;
    description: string | null;
    source: string | null;
    image_url: string | null;
    category: string | null;
    publication_date: string | null;
    deadline: string | null;
    cover_image_source: string | null;
    motivational_text_1: string | null;
    motivational_text_2: string | null;
    motivational_text_3_description: string | null;
    motivational_text_3_image_url: string | null;
    motivational_text_3_image_source: string | null;
    difficulty: number | null;
    tags: string[] | null;
};