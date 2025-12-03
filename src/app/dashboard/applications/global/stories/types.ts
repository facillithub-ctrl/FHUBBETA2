// CAMINHO: src/app/dashboard/applications/global/stories/types.ts

// Tipos de verificação aceitos (ampliado para incluir qualquer string do banco)
export type VerificationType = 'blue' | 'gold' | 'green' | 'red' | string | null;

export type UserProfile = {
  id: string;
  name: string;
  avatar_url: string | null;
  username: string;
  isVerified?: boolean;
  badge?: VerificationType; // Agora aceita string genérica para não quebrar
  role?: 'student' | 'teacher' | 'admin';
  bio?: string;
  followers?: number;
  following?: number;
};

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

export type StoryPost = {
  id: string;
  category: StoryCategory;
  type: BookPostType | GamePostType | 'status' | 'media'; 
  user: UserProfile;
  createdAt: string; 
  
  content: string;       
  title?: string;        
  subtitle?: string;     
  coverImage?: string;   
  
  // Metadados completos
  metadata?: {
    tags?: string[]; 
    author?: string;       
    publisher?: string;    
    pages?: number; 
    genre?: string;        
    year?: string;         
    rating?: number;       
    mood?: string;         
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
    platform?: string;
    gameTitle?: string;
    achievementName?: string;
    achievementRarity?: string;
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