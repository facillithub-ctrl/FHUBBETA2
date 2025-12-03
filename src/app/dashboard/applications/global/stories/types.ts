// CAMINHO: src/app/dashboard/applications/global/stories/types.ts

// --- PERFIL DE USUÁRIO ---
export type UserProfile = {
  id: string;
  name: string;
  avatar_url: string | null;
  username: string;
  isVerified?: boolean;
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

// --- CATEGORIAS GERAIS (CORRIGIDO) ---
// Adicionamos 'sports' e 'podcasts' para bater com o CategoryTabs.tsx
export type StoryCategory = 
  | 'all' 
  | 'books' 
  | 'movies' 
  | 'series' 
  | 'anime' 
  | 'games' 
  | 'sports'    // <--- Adicionado
  | 'podcasts'  // <--- Adicionado
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

// --- GAMES ---
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
  
  content: string;       
  title?: string;        
  subtitle?: string;     
  coverImage?: string;   
  mediaUrl?: string;     
  isVideo?: boolean; 
  
  metadata?: {
    author?: string;       
    publisher?: string;    
    pages?: number; 
    genre?: string;        
    year?: string;         
    rating?: number;       
    mood?: string;         
    tags?: string[];       
    reasons?: string[];      
    targetAudience?: string; 
    price?: number;
    oldPrice?: number;
    discountPercent?: number;
    coupon?: string;
    linkUrl?: string; 
    progress?: number; 
    quoteText?: string;    
    quotePage?: string;    
    rankingItems?: RankingItem[];
    
    // Games
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