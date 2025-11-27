// Define as roles de usuário
export type UserRole = 'student' | 'teacher' | 'professor' | 'admin' | 'administrator' | 'diretor';

export type UserProfile = {
  id: string;
  email?: string; 

  // --- Campos Legados (camelCase) ---
  fullName: string | null;
  nickname: string | null;
  avatarUrl: string | null;
  userCategory: string | null; // Mantendo compatibilidade com string, mas idealmente seria UserRole
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
  bloom_taxonomy?: BloomTaxonomy | null;
  cognitive_skill?: CognitiveSkill | null;
  estimated_time_seconds?: number;
  difficulty_level?: DifficultyLevel | null;
  ai_explanation?: string | null;
};

// --- Tipos para o Módulo Write (Essay) ---
export type EssayPrompt = {
  id: string;
  title: string;
  description: string | null;
  supporting_texts?: any; // jsonb
  source?: string | null;
  created_at?: string;
  organization_id?: string | null;
  image_url?: string | null;
  
  // Textos Motivadores
  motivational_text_1?: string | null;
  motivational_text_2?: string | null;
  
  // Texto Motivador 3 (Imagem) - Adicionado para corrigir o erro
  motivational_text_3_image_url?: string | null;
  motivational_text_3_description?: string | null;
  motivational_text_3_image_source?: string | null;

  category?: string | null;
  publication_date?: string | null;
  deadline?: string | null;
  cover_image_source?: string | null;
  difficulty?: number | null; // smallint no banco
  tags?: string[] | null;
  class_id?: string | null;
};

// --- Tipos para o Módulo Test ---
export type QuestionContent = {
  base_text?: string | null;
  statement: string;
  image_url?: string | null;
  options?: string[];
  correct_option?: number;
};

export type Question = {
  id: string;
  test_id?: string;
  question_type: 'multiple_choice' | 'dissertation' | 'true_false';
  content: QuestionContent;
  points: number;
  thematic_axis?: string | null;
  metadata?: QuestionMetadata;
};

export type TestWithQuestions = {
  id: string;
  title: string;
  description: string | null;
  created_by: string;
  created_at: string;
  duration_minutes: number;
  questions: Question[];
  is_knowledge_test?: boolean;
  related_prompt_id?: string | null;
  cover_image_url?: string | null;
  collection?: string | null;
  class_id?: string | null;
  serie?: string | null;
  test_type: 'avaliativo' | 'pesquisa';
  difficulty?: DifficultyLevel | string | null;
  hasAttempted?: boolean;
  question_count?: number;
  points?: number;
  subject?: string | null;
};

export type StudentDashboardData = {
  stats: {
    simuladosFeitos: number;
    mediaGeral: number;
    taxaAcerto: number;
    tempoMedio: number;
  };
  gamification: {
    level: number;
    current_xp: number;
    next_level_xp: number;
    streak_days: number;
    badges: string[];
  };
  insights: AIInsight[];
  performanceBySubject: { materia: string; nota: number; simulados: number }[];
  history: { date: string; avgScore: number }[];
  competencyMap: CompetencyData[];
  recentAttempts: any[];
};

export type StudentCampaign = {
    campaign_id: string;
    title: string;
    description: string | null;
    end_date: string;
    tests: {
        id: string;
        title: string;
        subject: string | null;
        question_count: number;
    }[];
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

// --- Organizações e Escolas ---
export type Organization = {
    id: string;
    name: string;
    cnpj: string | null;
    owner_id?: string;
    created_at?: string;
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