// facillithub-ctrl/fhubbeta2/FHUBBETA2-2a11ce6e0e3b57e80795e04299e58a66a7ac9ee9/src/app/dashboard/applications/test/types.ts

export type BloomTaxonomy = 'lembrar' | 'compreender' | 'aplicar' | 'analisar' | 'avaliar' | 'criar';
export type DifficultyLevel = 'facil' | 'medio' | 'dificil' | 'muito_dificil';
export type CognitiveSkill = 'interpretacao' | 'calculo' | 'memorizacao' | 'analise_grafica' | 'logica' | 'gramatica' | 'vocabulario';
export type QuestionType = 'multiple_choice' | 'dissertation' | 'true_false' | 'association' | 'gap_fill';
export type MediaType = 'text' | 'image' | 'audio' | 'video' | 'graph';

export type ErrorType = 'distracao' | 'lacuna_conteudo' | 'interpretacao' | 'calculo' | 'tempo_insuficiente';

export type QuestionMetadata = {
  bloom_taxonomy?: BloomTaxonomy | null;
  cognitive_skill?: CognitiveSkill | null;
  estimated_time_seconds?: number;
  difficulty_level?: DifficultyLevel | null;
  ai_explanation?: string | null;
  media_type?: MediaType;
  requires_formulas?: boolean;
  interdisciplinary_tags?: string[];
};

export type QuestionContent = {
  base_text?: string | null;
  statement: string;
  image_url?: string | null;
  options?: string[];
  correct_option?: number;
  solution_commentary?: string; // Explicação didática
};

export type Question = {
  id: string;
  test_id?: string;
  question_type: QuestionType;
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
  tags?: string[]; // Para balanceamento de assuntos
  is_adaptive?: boolean; // Para simulados adaptativos
};

// --- Tipos para Dashboards e Analítica Avançada ---

export type CompetencyPoint = {
    subject: string;
    score: number; // 0 a 100
    fullMark: number;
};

export type BloomAnalysis = {
    skill: BloomTaxonomy;
    score: number; // Porcentagem de domínio
    total_questions: number;
};

export type ErrorAnalysis = {
    type: ErrorType;
    count: number;
    percentage: number;
};

export type AIStudySuggestion = {
    id: string;
    type: 'video' | 'text' | 'flashcard' | 'practice';
    title: string;
    estimated_time: string;
    priority: 'high' | 'medium' | 'low';
    reason: string; // Ex: "Você errou 3 questões disto"
    action_link?: string;
};

export type AIInsight = {
    id: string;
    type: 'strength' | 'weakness' | 'pattern';
    message: string; // Ex: "Você acerta 92% quando tem gráfico, mas cai para 40% sem."
    confidence: number;
};

export type StudentDashboardData = {
  stats: {
    simuladosFeitos: number;
    mediaGeral: number;
    taxaAcerto: number;
    tempoMedio: number;
    questionsAnsweredTotal: number;
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
  competencyMap: CompetencyPoint[];
  recentAttempts: any[];
  
  // Novos campos para analítica profunda
  bloomAnalysis: BloomAnalysis[];
  errorAnalysis: ErrorAnalysis[];
  studyRoute: AIStudySuggestion[];
  heatmapData: { subject: string; difficulty: DifficultyLevel; score: number }[];
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