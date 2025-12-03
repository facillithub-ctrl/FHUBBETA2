// CAMINHO: src/app/dashboard/applications/global/stories/types.ts

// --- PERFIL DE USUÁRIO ---
export type UserProfile = {
  id: string;
  name: string;
  avatar_url: string | null;
  username: string;
  isVerified?: boolean;
  // Adicionado para compatibilidade com o componente VerificationBadge
  badge?: string | null; 
  bio?: string;
  role?: 'student' | 'teacher' | 'admin';
  level?: number; 
  readCount?: number;
  followers?: number;
  following?: number;
};

// --- STORY CIRCLES (Círculos de Stories no topo) ---
export type StoryCircle = {
  id: string;
  user: UserProfile;
  hasUnseen: boolean;
  isLive?: boolean;
  category?: StoryCategory;
};

// --- CATEGORIAS GERAIS ---
export type StoryCategory = 
  | 'all' 
  | 'books' 
  | 'movies' 
  | 'series' 
  | 'anime' 
  | 'games' 
  | 'sports' 
  | 'podcasts' 
  | 'general';

// --- FORMATOS ESPECÍFICOS ---
export type BookPostType = 
  | 'review'             
  | 'rating'             
  | 'recommendation'     
  | 'indication'         
  | 'promotion'          
  | 'discussion'         
  | 'first-impressions'  
  | 'quote'              
  | 'technical'          
  | 'ranking';           

export type GamePostType = 
  | 'game-review'       
  | 'achievement'       
  | 'clip'              
  | 'setup'             
  | 'looking-for-group' 
  | 'ranking';          

export type Comment = {
  id: string;
  user: UserProfile;
  text: string;
  createdAt: string;
};

export type RankingItem = {
  position: number;
  title: string;
  author?: string;
  image?: string;
  description?: string;
};

// --- TIPO PRINCIPAL DO POST (STORYPOST) ---
export type StoryPost = {
  id: string;
  category: StoryCategory;
  
  // União de todos os tipos possíveis
  type: BookPostType | GamePostType | 'status' | 'media'; 
  
  user: UserProfile;
  createdAt: string; 
  timestamp?: string; // Útil para ordenação precisa se necessário
  
  content: string;       
  title?: string;        
  subtitle?: string;     
  coverImage?: string;   
  mediaUrl?: string;     
  isVideo?: boolean; 
  
  metadata?: {
    tags?: string[]; 
    
    // >>>> DADOS DE LIVRO / OBRA
    author?: string;       
    publisher?: string;    
    pages?: number; 
    genre?: string;        
    year?: string;         
    
    // >>>> AVALIAÇÃO
    rating?: number;       
    mood?: string;         
    
    // >>>> RECOMENDAÇÃO
    reasons?: string[];      
    targetAudience?: string; 
    
    // >>>> PROMOÇÃO
    price?: number;
    oldPrice?: number;
    discountPercent?: number;
    coupon?: string;
    linkUrl?: string; 
    
    // >>>> PROGRESSO
    progress?: number; 
    
    // >>>> QUOTE
    quoteText?: string;    
    quotePage?: string;    
    
    // >>>> RANKING
    rankingItems?: RankingItem[];
    
    // >>>> GAMES
    platform?: 'PlayStation' | 'Xbox' | 'PC' | 'Nintendo' | 'Mobile';
    gameTitle?: string;
    achievementName?: string;
    achievementRarity?: 'Common' | 'Rare' | 'Epic' | 'Legendary';
    score?: string;
    rank?: string;
    graphics?: number;
    gameplay?: number;
    story?: number;
  };

  likes: number;
  commentsCount: number;
  topComments?: Comment[]; 
  isLiked?: boolean;
  isSaved?: boolean;
};

export type BookReviewPost = StoryPost;