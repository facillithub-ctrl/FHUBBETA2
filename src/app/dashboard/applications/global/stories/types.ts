// CAMINHO: src/app/dashboard/applications/global/stories/types.ts

// --- PERFIL DE USUÁRIO ---
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

// --- STORY CIRCLES (Círculos de Stories no topo) ---
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
  | 'sports' 
  | 'podcasts' 
  | 'games' 
  | 'book-club';

// --- SUBTIPOS DE LIVROS ---
export type BookPostType = 
  | 'review'             // Resenha completa
  | 'rating'             // Avaliação rápida
  | 'recommendation'     // "Recomendado para..."
  | 'indication'         // Indicação simples
  | 'promotion'          // Oferta/Promoção
  | 'discussion'         // Debate/Pergunta
  | 'first-impressions'  // Primeiras impressões (com mood)
  | 'quote'              // Citação visual
  | 'technical'          // Ficha Técnica
  | 'ranking';           // Top X Listas

// --- TIPOS GERAIS DE POSTAGEM ---
// Une os tipos específicos de livros com os tipos genéricos do sistema
export type PostType = 
  | BookPostType 
  | 'video' 
  | 'quote' // Mantido para compatibilidade legado, mas preferir o do BookPostType se for livro
  | 'status' 
  | 'link' 
  | 'recommendation' // Mantido para legado
  | 'match' 
  | 'progress';

// --- ELEMENTOS AUXILIARES ---

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

// Estrutura para itens de Ranking (ex: Top 5 Livros)
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
  type: PostType;
  user: UserProfile;
  createdAt: string; 
  
  // Conteúdo Principal
  title?: string;
  subtitle?: string; // Usado para "Autor" em livros ou legendas curtas
  coverImage?: string;
  rating?: number; // 0-5
  
  content: string;
  mediaUrl?: string; // Imagem, Video ou Preview de Link
  isVideo?: boolean; 
  
  // Dados Específicos de Nicho (Estruturas fixas)
  progress?: ReadingProgress;
  characters?: CharacterInfo[];
  
  // --- METADADOS FLEXÍVEIS (JSONB) ---
  // Contém todos os campos específicos para cada tipo de layout
  metadata?: {
    // >>>> LIVROS
    author?: string;       // Redundância explícita do autor do livro
    publisher?: string;    // Editora
    pages?: number | string; // Número de páginas
    genre?: string;        // Gênero literário
    year?: string;         // Ano de lançamento
    
    // Subtipo: Quote
    quote?: string;        // Texto da citação (se diferente do content)
    quotePage?: string;    // Página da citação
    
    // Subtipo: Promotion
    price?: number;
    oldPrice?: number;
    discountPercent?: number;
    coupon?: string;
    
    // Subtipo: First Impressions / Review
    mood?: string;         // Emoção (Empolgado, Confuso, Triste, etc.)
    
    // Subtipo: Recommendation
    reasons?: string[];      // Lista de motivos ("Por que ler?")
    targetAudience?: string; // "Recomendado para..."
    
    // Subtipo: Ranking
    rankingItems?: RankingItem[];

    // >>>> FILMES / SÉRIES
    director?: string;
    season?: number;
    episode?: number;
    duration?: string;
    
    // >>>> GAMES
    platform?: string;
    achievement?: string;
    
    // >>>> ESPORTES
    league?: string;
    homeTeam?: string;
    awayTeam?: string;
    score?: string;
  };

  // Links Externos (Compra, Referência, Spotify, etc.)
  externalLink?: {
    title?: string;
    domain?: string;
    url: string;
    label?: string; // Ex: "Comprar na Amazon", "Ouvir no Spotify"
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
// Isso resolve erros de legado onde "BookReviewPost" era referenciado
export type BookReviewPost = StoryPost;

// --- COMUNIDADES ---
export type Community = {
  id: string;
  name: string;
  members: number;
  image: string;
  category: StoryCategory;
};