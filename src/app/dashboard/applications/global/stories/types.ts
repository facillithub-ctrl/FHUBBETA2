// CAMINHO: src/app/dashboard/applications/global/stories/types.ts

// --- CORREÇÃO: Adicionado para resolver o erro de build ---
export type VerificationType = 'blue' | 'gold' | 'green' | 'none' | null;

// --- PERFIL DE USUÁRIO ---
export type UserProfile = {
  id: string;
  name: string;
  avatar_url: string | null;
  username: string;
  isVerified?: boolean;
  // Compatibilidade com o componente VerificationBadge
  badge?: VerificationType | string | null; 
  bio?: string;
  role?: 'student' | 'teacher' | 'admin';
  level?: number; 
  readCount?: number;
  followers?: number;
  following?: number;
};

// --- STORY CIRCLES ---
export type StoryCircle = {
  id: string;
  user: UserProfile;
  hasUnseen: boolean;
  isLive?: boolean;
  category?: StoryCategory;
};

// --- CATEGORIAS ---
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

// --- FORMATOS ESPECÍFICOS (Mantidos) ---
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

// --- TIPO PRINCIPAL DO POST ---
export type StoryPost = {
  id: string;
  category: StoryCategory;
  
  // União de todos os tipos possíveis
  type: BookPostType | GamePostType | 'status' | 'media'; 
  
  user: UserProfile;
  createdAt: string; 
  timestamp?: string;
  
  content: string;       
  title?: string;        
  subtitle?: string;     
  coverImage?: string;   
  mediaUrl?: string;     
  isVideo?: boolean; 
  
  // Metadados Ricos (Mantidos)
  metadata?: {
    tags?: string[]; 
    
    // LIVROS
    author?: string;       
    publisher?: string;    
    pages?: number; 
    genre?: string;        
    year?: string;  
   
    // AVALIAÇÃO
    rating?: number;       
    mood?: string;         
    
    // RECOMENDAÇÃO
    reasons?: string[];      
    targetAudience?: string; 
    
    // PROMOÇÃO
    price?: number;
    oldPrice?: number;
    discountPercent?: number;
    coupon?: string;
    linkUrl?: string; 
    
    // PROGRESSO
    progress?: number; 
    
    // QUOTE
    quoteText?: string;    
    quotePage?: string;    
    
    // RANKING
    rankingItems?: RankingItem[];
    
    // GAMES
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