// src/app/dashboard/types.ts

// 1. Definição Híbrida de UserProfile (Suporta código Novo e Antigo)
export interface UserProfile {
  id: string;
  email: string;
  
  // Campos do Novo Design (snake_case do banco)
  full_name: string | null;
  nickname: string | null;
  avatar_url: string | null;
  is_verified: boolean;
  active_modules: string[] | null;
  organization_id?: string | null;
  user_category?: string | null;

  // Campos do Código Antigo (camelCase - para compatibilidade com Admin)
  fullName?: string | null;
  avatarUrl?: string | null;
  userCategory?: string | null;
  schoolName?: string | null;
  pronoun?: string | null;
  birthDate?: string | null;
  target_exam?: string | null;
  verification_badge?: string | null;
  has_completed_onboarding?: boolean;
  role?: 'student' | 'teacher';
}

// 2. Configuração Visual dos Módulos (Novo Design)
export const MODULE_DEFINITIONS: Record<string, { name: string; href: string; iconClass: string; color: string }> = {
  'write': { name: "Facillit Write", href: "/dashboard/applications/write", iconClass: "fa-pencil-alt", color: "text-purple-500" },
  'games': { name: "Facillit Games", href: "/dashboard/applications/games", iconClass: "fa-gamepad", color: "text-pink-500" },
  'day': { name: "Facillit Day", href: "/dashboard/applications/day", iconClass: "fa-calendar-check", color: "text-blue-500" },
  'play': { name: "Facillit Play", href: "/dashboard/applications/play", iconClass: "fa-play-circle", color: "text-red-500" },
  'library': { name: "Facillit Library", href: "/dashboard/applications/library", iconClass: "fa-book-open", color: "text-amber-500" },
  'connect': { name: "Facillit Connect", href: "/dashboard/applications/connect", iconClass: "fa-users", color: "text-indigo-500" },
  'coach-career': { name: "Facillit Coach", href: "/dashboard/applications/coach-career", iconClass: "fa-bullseye", color: "text-cyan-500" },
  'lab': { name: "Facillit Lab", href: "/dashboard/applications/lab", iconClass: "fa-flask", color: "text-green-500" },
  'test': { name: "Facillit Test", href: "/dashboard/applications/test", iconClass: "fa-file-alt", color: "text-yellow-600" },
  'task': { name: "Facillit Task", href: "/dashboard/applications/task", iconClass: "fa-tasks", color: "text-teal-500" },
  'create': { name: "Facillit Create", href: "/dashboard/applications/create", iconClass: "fa-lightbulb", color: "text-orange-500" },
  'edu': { name: "Facillit Edu", href: "/dashboard/applications/edu", iconClass: "fa-graduation-cap", color: "text-brand-purple" },
};

// 3. Tipos Restaurados para o Admin e Outros Componentes
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