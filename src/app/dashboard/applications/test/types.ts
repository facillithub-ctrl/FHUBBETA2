export type BloomTaxonomy = 'lembrar' | 'compreender' | 'aplicar' | 'analisar' | 'avaliar' | 'criar';
export type CognitiveSkill = 'interpretacao' | 'calculo' | 'memorizacao' | 'analise_grafica' | 'logica' | 'gramatica' | 'vocabulario';
export type DifficultyLevel = 'facil' | 'medio' | 'dificil' | 'muito_dificil';

export type QuestionMetadata = {
  bloom_taxonomy?: BloomTaxonomy;
  cognitive_skill?: CognitiveSkill;
  estimated_time_seconds?: number;
  difficulty_level?: DifficultyLevel;
  ai_explanation?: string;
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
  question_type: 'multiple_choice' | 'dissertation' | 'true_false';
  content: QuestionContent;
  points: number;
  metadata?: QuestionMetadata;
};

export type TestWithQuestions = {
  id: string;
  title: string;
  description?: string;
  subject: string;
  duration_minutes: number;
  difficulty: DifficultyLevel;
  questions: Question[];
  created_at: string;
};

export type GamificationStats = {
  level: number;
  current_xp: number;
  next_level_xp: number;
  streak_days: number;
  badges: string[];
};

export type AIInsight = {
  id: string;
  type: 'strength' | 'weakness' | 'habit';
  message: string;
  actionable_tip: string;
  related_module_url?: string;
};

export type PerformanceMetric = {
  materia: string;
  nota: number;
  simulados: number;
};

export type StudentDashboardData = {
  gamification: GamificationStats;
  insights: AIInsight[];
  performanceBySubject: PerformanceMetric[];
  competencyMap: { axis: string; score: number; fullMark: number }[];
  history: { date: string; avgScore: number }[];
  recentAttempts: any[];
};