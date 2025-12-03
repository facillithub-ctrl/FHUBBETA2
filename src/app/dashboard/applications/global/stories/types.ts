// CAMINHO: src/app/dashboard/applications/global/stories/types.ts

export type Profile = {
  id: string;
  full_name: string | null;
  avatar_url: string | null;
  username?: string | null;
};

export type StoryPost = {
  id: string;
  user_id: string;
  content: string | null;
  book_title?: string | null;
  book_author?: string | null;
  book_cover_url?: string | null;
  rating?: number | null;
  created_at: string;
  likes_count: number;
  comments_count: number;
  
  // Joins
  profiles?: Profile;
  user_has_liked?: boolean; // Campo calculado no backend
};

export type StoryList = {
  id: string;
  type: 'reading' | 'read' | 'want_to_read' | 'custom';
  name: string;
  count?: number;
};

type BookReview = {
  id: string;
  user: { name: string; avatar: string };
  book_title: string;
  book_author: string;
  book_cover: string;
  rating: number; // 1-5
  tags: string[]; // ex: "Chocante", "Leitura Rápida", "Plot Twist"
  text: string;
  created_at: string;
};

type ReadingLog = {
  id: string;
  book_title: string;
  total_pages: number;
  current_page: number;
  last_update: string; // "Há 2 horas"
  status: 'Lendo' | 'Pausado';
};

type QuotePost = {
  id: string;
  text: string;
  page?: number;
  book_title: string;
  theme: 'dark' | 'light' | 'paper'; // Temas visuais
};

type Comment = {
  id: string;
  user_name: string;
  user_avatar: string;
  text: string;
  likes: number;
  time_ago: string;
  replies?: Comment[]; // Aninhamento
};
