// src/app/dashboard/types.ts

export interface UserProfile {
  id: string;
  email: string;
  full_name: string | null;
  nickname: string | null;
  avatar_url: string | null;
  is_verified: boolean;
  active_modules: string[] | null;
  organization_id?: string | null;
  user_category?: string | null; // 'aluno', 'professor', etc.
}

// Configuração visual dos módulos reais do sistema
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