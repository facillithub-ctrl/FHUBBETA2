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
  // Gamificação leve (Opcional)
  level?: number; 
  readCount?: number;
  followers?: number;
  following?: number;
};

// --- STORY CIRCLES (Círculos de Stories no topo) ---
// Usado pelo componente StoriesBar
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
  | 'general';

// --- FORMATOS ESPECÍFICOS DE LIVROS (E OUTRAS MÍDIAS) ---
// Estes são os tipos que definem qual componente visual será carregado
export type BookPostType = 
  | 'review'             // Análise aprofundada
  | 'rating'             // Avaliação rápida
  | 'recommendation'     // "Recomendado para..."
  | 'indication'         // Indicação simples
  | 'promotion'          // Oferta/Promoção
  | 'discussion'         // Debate/Pergunta
  | 'first-impressions'  // Primeiras impressões (com barra de progresso)
  | 'quote'              // Citação visual
  | 'technical'          // Ficha Técnica
  | 'ranking';           // Top X Listas

// --- TIPOS DE CONTEÚDO AUXILIAR ---
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
  
  // O 'type' decide o layout. Se não for livro, usa 'status' ou 'media'
  type: BookPostType | 'status' | 'media'; 
  
  user: UserProfile;
  createdAt: string; 
  
  // Conteúdo Base (Comum a todos)
  content: string;       // Texto principal ou descrição
  title?: string;        // Título do Livro/Filme/Post
  subtitle?: string;     // Autor do Livro ou Subtítulo
  coverImage?: string;   // Capa do livro ou Imagem do post
  mediaUrl?: string;     // Para vídeos ou mídia extra
  isVideo?: boolean; 
  
  // --- METADADOS FLEXÍVEIS (JSONB) ---
  // Aqui vive a mágica de cada formato específico
  metadata?: {
    // >>>> DADOS DE LIVRO / OBRA
    author?: string;       
    publisher?: string;    
    pages?: number; 
    genre?: string;        
    year?: string;         
    
    // >>>> AVALIAÇÃO
    rating?: number;       // 0 a 5
    mood?: string;         // Emoção (ex: "Chocado", "Feliz")
    tags?: string[];       // Ex: ["Romance", "Plot Twist"]
    
    // >>>> RECOMENDAÇÃO
    reasons?: string[];      // Lista de motivos ("Por que ler?")
    targetAudience?: string; // "Recomendado para..."
    
    // >>>> PROMOÇÃO
    price?: number;
    oldPrice?: number;
    discountPercent?: number;
    coupon?: string;
    linkUrl?: string; // Link de afiliado ou externo
    
    // >>>> PROGRESSO (First Impressions)
    progress?: number; // Porcentagem (0-100)
    
    // >>>> QUOTE
    quoteText?: string;    // Se for diferente do content
    quotePage?: string;    
    
    // >>>> RANKING
    rankingItems?: RankingItem[];

    // >>>> GAMES / FILMES (Expansível)
    platform?: string;
    director?: string;
  };

  // Engajamento Social
  likes: number;
  commentsCount: number;
  topComments?: Comment[]; 
  isLiked?: boolean;
  isSaved?: boolean;
};

// --- ALIAS PARA COMPATIBILIDADE ---
export type BookReviewPost = StoryPost;