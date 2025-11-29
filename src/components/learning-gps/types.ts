export type ModuleType = 'write' | 'test' | 'games' | 'play' | 'create' | 'library' | 'edu' | 'external';

export type ActionCategory = 'recommended' | 'pending' | 'quick' | 'recovery';

export type TargetRole = 'all' | 'student' | 'teacher' | 'director';

export type TriggerCondition = 
    | 'always'              // Sempre visível
    | 'low_grammar_score'   // Nota baixa na C1 (Redação)
    | 'low_activity'        // Sem login há X dias
    | 'high_performance';   // Nota alta (Desafios avançados)

export type LearningAction = {
    id: string;
    title: string;
    description: string;
    module: ModuleType;
    category: ActionCategory;
    priority: 'high' | 'medium' | 'low';
    link: string;
    
    // Visual
    icon_name: string;
    bg_color: string;
    image_url?: string | null;
    button_text?: string;
    
    // Lógica Inteligente
    target_role?: TargetRole;       // Quem vê?
    trigger_condition?: TriggerCondition; // Quando vê?
    
    reason?: string;
    estimatedTime?: string;
};

export type GPSData = {
    actions: LearningAction[];
    stats: {
        completedToday: number;
        streak: number;
    };
};
export type GPSItemType = 'recommendation' | 'shortcut' | 'system';

export interface GPSAction {
  id: string;
  title: string;
  description: string;
  module: 'write' | 'test' | 'library' | 'games';
  link: string;
  icon_name: string; // Nome do ícone Lucide
  bg_color?: string;
  priority?: 'high' | 'medium' | 'low';
  type: GPSItemType;
  source?: string; // 'Professor', 'IA', 'Sistema'
}

export interface GPSModuleGroup {
    module: string;
    label: string;
    icon: string;
    color: string;
    actions: GPSAction[];
}