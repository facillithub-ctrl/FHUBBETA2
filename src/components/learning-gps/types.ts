export type ModuleType = 'write' | 'test' | 'games' | 'play' | 'create' | 'library' | 'teacher' | 'external';

export type ActionCategory = 'recommended' | 'pending' | 'quick';

export type LearningAction = {
    id: string;
    title: string;
    description: string;
    module: ModuleType;
    category: ActionCategory;
    priority: 'high' | 'medium' | 'low';
    link: string;
    // Novos campos visuais
    icon_name: string;
    bg_color: string;
    image_url?: string | null;
    button_text?: string;
    
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