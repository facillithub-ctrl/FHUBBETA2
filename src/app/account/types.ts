export interface UserProfile {
  id: string;
  full_name: string | null;
  username: string | null;
  website: string | null;
  avatar_url: string | null;
  cover_url: string | null;
  // adicione outros campos conforme sua tabela 'profiles' no Supabase
}