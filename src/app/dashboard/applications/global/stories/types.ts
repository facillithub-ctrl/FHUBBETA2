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
};

export type CharacterInfo = {
  name: string;
  role?: string;
};

export type ReadingProgress = {
  current: number;
  total: number;
  percentage: number;
  status: 'Lendo' | 'Concluído' | 'Abandonado' | 'Quero Ler';
};

export type Comment = {
  id: string;
  user: string; // Nome do usuário
  text: string;
};

export type BookReviewPost = {
  id: string;
  type: 'review' | 'video' | 'quote' | 'status' | 'link' | 'recommendation';
  user: UserProfile;
  createdAt: string; 
  
  // Conteúdo do Livro
  bookTitle?: string;
  bookAuthor?: string;
  bookCover?: string;
  rating?: number; // 0-5
  
  // Conteúdo Rico
  content: string;
  mediaUrl?: string; // Imagem, Video ou Preview de Link
  isVideo?: boolean; 
  
  // Detalhes da Leitura
  readingProgress?: ReadingProgress;
  characters?: CharacterInfo[];
  
  // Links Externos
  externalLink?: {
    title?: string;
    domain?: string;
    url: string;
  };
  
  // Social
  likes: number;
  commentsCount: number;
  topComments?: Comment[]; // Comentários para exibir no feed
  shares: number;
  isLiked?: boolean;
  isSaved?: boolean;
  
  tags?: string[];
};