// CAMINHO: src/app/dashboard/applications/global/stories/types.ts

export type UserProfile = {
  id: string;
  name: string;
  avatar_url: string | null;
  username: string;
  isVerified?: boolean;
  bio?: string;
  followers?: number;
  following?: number;
  readCount?: number;
  role?: 'student' | 'teacher' | 'admin';
};

export type StoryCircle = {
  id: string;
  user: UserProfile;
  hasUnseen: boolean;
  isLive?: boolean;
  category?: StoryCategory;
};

// Categorias de conteúdo
export type StoryCategory = 'all' | 'books' | 'movies' | 'series' | 'anime' | 'sports' | 'podcasts' | 'games' | 'book-club';

// Tipos de postagem
export type PostType = 'review' | 'video' | 'quote' | 'status' | 'link' | 'recommendation' | 'match' | 'progress';

export type CharacterInfo = {
  name: string;
  role?: string;
};

export type ReadingProgress = {
  current: number;
  total: number;
  percentage: number;
  status: 'Lendo' | 'Concluído' | 'Abandonado' | 'Quero Ler' | 'Assistindo' | 'Jogando';
};

export type Comment = {
  id: string;
  user: string;
  text: string;
};

// --- TIPO PRINCIPAL DO POST ---
export type StoryPost = {
  id: string;
  category: StoryCategory;
  type: PostType;
  user: UserProfile;
  createdAt: string; 
  
  // Conteúdo Principal
  title?: string;
  subtitle?: string;
  coverImage?: string;
  rating?: number; // 0-5
  
  content: string;
  mediaUrl?: string; // Imagem, Video ou Preview de Link
  isVideo?: boolean; 
  
  // Dados Específicos de Nicho
  progress?: ReadingProgress;
  characters?: CharacterInfo[];
  
  // Metadados flexíveis
  metadata?: {
    director?: string;
    season?: number;
    episode?: number;
    duration?: string;
    platform?: string;
    achievement?: string;
    league?: string;
    homeTeam?: string;
    awayTeam?: string;
    score?: string;
  };

  externalLink?: {
    title?: string;
    domain?: string;
    url: string;
    label?: string;
  };
  
  // Engajamento Social
  likes: number;
  commentsCount: number;
  topComments?: Comment[]; // Preview de comentários
  shares: number;
  isLiked?: boolean;
  isSaved?: boolean;
  
  tags?: string[];
};

// --- ALIAS PARA COMPATIBILIDADE ---
// Isso resolve o erro "no types não tem BookReviewPost"
export type BookReviewPost = StoryPost;

// Tipo para as Comunidades
export type Community = {
  id: string;
  name: string;
  members: number;
  image: string;
  category: StoryCategory;
};