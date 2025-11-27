export type BloomTaxonomy = 'lembrar' | 'compreender' | 'aplicar' | 'analisar' | 'avaliar' | 'criar';
export type DifficultyLevel = 'facil' | 'medio' | 'dificil' | 'muito_dificil';
export type CognitiveSkill = 'interpretacao' | 'calculo' | 'memorizacao' | 'analise_grafica' | 'logica' | 'gramatica' | 'vocabulario';

export type QuestionMetadata = {
  bloom_taxonomy?: BloomTaxonomy | null;
  cognitive_skill?: CognitiveSkill | null;
  estimated_time_seconds?: number;
  difficulty_level?: DifficultyLevel | null;
  ai_explanation?: string | null;
};

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
  difficulty?: DifficultyLevel;
  hasAttempted?: boolean;
  question_count?: number;
  points?: number;
  subject?: string;
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
  insights: any[];
  performanceBySubject: { materia: string; nota: number; simulados: number }[];
  history: { date: string; avgScore: number }[];
  competencyMap: { axis: string; score: number; fullMark: number }[];
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