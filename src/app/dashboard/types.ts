export type UserProfile = {
  id: string;
  email?: string; 

  // --- Campos Legados (camelCase) ---
  fullName: string | null;
  nickname: string | null;
  avatarUrl: string | null;
  userCategory: string | null;
  pronoun: string | null;
  birthDate: string | null;
  schoolName: string | null;
  
  // --- Campos Novos (snake_case) ---
  full_name?: string | null;
  avatar_url?: string | null;
  is_verified?: boolean;
  user_category?: string | null;
  
  // --- Gamificação (Novo Test 2.0) ---
  level?: number;
  current_xp?: number;
  next_level_xp?: number;
  streak_days?: number;
  badges?: string[];

  // --- Campos Comuns / Híbridos ---
  organization_id: string | null;
  target_exam: string | null;
  active_modules: string[] | null;
  verification_badge: string | null;
  has_completed_onboarding?: boolean;
};

// --- Tipos Pedagógicos Avançados ---
export type BloomTaxonomy = 'lembrar' | 'compreender' | 'aplicar' | 'analisar' | 'avaliar' | 'criar';
export type CognitiveSkill = 'interpretacao' | 'calculo' | 'memorizacao' | 'analise_grafica' | 'logica' | 'gramatica' | 'vocabulario';
export type DifficultyLevel = 'facil' | 'medio' | 'dificil' | 'muito_dificil';

export type QuestionMetadata = {
  bloom_level?: BloomTaxonomy;
  cognitive_skill?: CognitiveSkill;
  estimated_time_seconds?: number;
  difficulty?: DifficultyLevel;
  ai_explanation?: string;
};

// --- Insights e Analytics ---
export type AIInsight = {
  id: string;
  type: 'strength' | 'weakness' | 'habit';
  message: string;
  actionable_tip: string;
  related_module_url?: string;
};

export type CompetencyData = {
  axis: string; // Nome da competência/eixo
  score: number; // 0-100
  fullMark: number; // Sempre 100
};

// ... (Manter os outros tipos existentes como Organization, SchoolClass, etc.)
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