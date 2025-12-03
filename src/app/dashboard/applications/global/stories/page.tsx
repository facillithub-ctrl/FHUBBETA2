"use client";

import { useState, useEffect } from 'react';
import Image from 'next/image';
import StoriesBar from './components/StoriesBar';
import PostCard from './components/PostCard'; 
import CreatePostWidget from './components/CreatePostWidget';
import CategoryTabs from './components/CategoryTabs';
import TrendingTerms from './components/TrendingTerms';
import CreateReviewModal from './components/CreateReviewModal';
import { StoryPost, UserProfile, StoryCategory, Community, StoryCircle } from './types';
import createClient from '@/utils/supabase/client';

// --- MOCK DATA: 3 POSTS POR CATEGORIA ---
const ALL_POSTS: StoryPost[] = [
  // --- LIVROS ---
  {
    id: 'b1', category: 'books', type: 'review',
    user: { id: 'u1', name: 'Amanda Torres', username: '@amanda_reads', avatar_url: 'https://i.pravatar.cc/150?u=1', isVerified: true },
    createdAt: '2h',
    title: 'A Biblioteca da Meia-Noite', subtitle: 'Matt Haig',
    coverImage: 'https://m.media-amazon.com/images/I/81J6APjsWTL._AC_UF1000,1000_QL80_.jpg',
    rating: 5,
    content: 'Uma reflexão profunda sobre as escolhas que fazemos. "A única maneira de aprender é viver". Chorei no final!',
    progress: { current: 300, total: 300, percentage: 100, status: 'Concluído' },
    likes: 1240, commentsCount: 45, shares: 12
  },
  {
    id: 'b2', category: 'books', type: 'status',
    user: { id: 'u20', name: 'Clube dos Clássicos', username: '@classicos', avatar_url: 'https://i.pravatar.cc/150?u=50' },
    createdAt: '5h',
    content: '📚 Leitura Coletiva: Estamos iniciando o capítulo 5 de "Dom Casmurro". Capitu tinha ou não tinha olhos de cigana oblíqua e dissimulada? Discussão nos comentários! 👇',
    likes: 890, commentsCount: 340, shares: 50
  },
  {
    id: 'b3', category: 'books', type: 'quote',
    user: { id: 'u99', name: 'Citações Literárias', username: '@citacoes', avatar_url: 'https://i.pravatar.cc/150?u=99' },
    createdAt: '1d',
    title: 'O Pequeno Príncipe', subtitle: 'Antoine de Saint-Exupéry',
    content: '“Tu te tornas eternamente responsável por aquilo que cativas.”',
    likes: 5400, commentsCount: 120, shares: 2000
  },

  // --- FILMES ---
  {
    id: 'm1', category: 'movies', type: 'video',
    user: { id: 'u2', name: 'Bruno Lima', username: '@cine_bruno', avatar_url: 'https://i.pravatar.cc/150?u=2', isVerified: true },
    createdAt: '25 min',
    title: 'Duna: Parte 2', subtitle: 'Denis Villeneuve',
    coverImage: 'https://m.media-amazon.com/images/M/MV5BMDBmYTZjNjUtN2M1MS00MTQ2LTk2ODgtNzc2M2QyZGE5NTVjXkEyXkFqcGdeQXVyNzAwMjU2MTY@._V1_.jpg',
    rating: 5,
    content: 'A escala disso é monumental. A trilha do Hans Zimmer tremeu a sala inteira! 🤯🏜️',
    metadata: { director: 'Denis Villeneuve', duration: '2h 46m' },
    isVideo: true, likes: 4520, commentsCount: 312, shares: 1050
  },
  {
    id: 'm2', category: 'movies', type: 'status',
    user: { id: 'u11', name: 'Sofia Filmes', username: '@sofia_cine', avatar_url: 'https://i.pravatar.cc/150?u=22' },
    createdAt: '8h',
    title: 'Pobres Criaturas',
    coverImage: 'https://m.media-amazon.com/images/M/MV5BNGIyYWMzNjktNDE3RC00NjZhLTk2ZWUtM2czODk2NMM5ODZiXkEyXkFqcGdeQXVyMTAyMjQ3NzQ1._V1_.jpg',
    content: 'Adicionado à watchlist! Emma Stone parece incrível nesse trailer. Alguém já viu?',
    progress: { current: 0, total: 1, percentage: 0, status: 'Quero Ler' },
    likes: 300, commentsCount: 40, shares: 8
  },
  {
    id: 'm3', category: 'movies', type: 'link',
    user: { id: 'u33', name: 'Omelete', username: '@omelete', avatar_url: 'https://i.pravatar.cc/150?u=33', isVerified: true },
    createdAt: '2h',
    title: 'Os Vingadores 5', subtitle: 'Notícia',
    content: 'Marvel anuncia novo diretor para a próxima fase do MCU. Confira os detalhes!',
    mediaUrl: 'https://images.unsplash.com/photo-1626814026160-2237a95fc5a0?auto=format&fit=crop&q=80&w=1000',
    externalLink: { title: 'Ler Matéria Completa', url: '#', domain: 'omelete.com.br' },
    likes: 1200, commentsCount: 400, shares: 300
  },

  // --- SÉRIES ---
  {
    id: 's1', category: 'series', type: 'status',
    user: { id: 'u8', name: 'Pedro Séries', username: '@pedro_tv', avatar_url: 'https://i.pravatar.cc/150?u=8' },
    createdAt: '3h',
    title: 'Succession', subtitle: 'HBO',
    coverImage: 'https://m.media-amazon.com/images/M/MV5BNTI4YjM3ZMi00YjI5LWJjYWEtZWJjMTI3YjFiZGE4XkEyXkFqcGdeQXVyNDAzNDk0MTQ@._V1_.jpg',
    content: 'Kendall Roy, você não cansa de me decepcionar? A atuação do Jeremy Strong nesse episódio foi de arrepiar. Temporada final insana! 📉👔',
    metadata: { season: 4, episode: 3 },
    likes: 980, commentsCount: 230, shares: 300
  },
  {
    id: 's2', category: 'series', type: 'video',
    user: { id: 'u44', name: 'Netflix Brasil', username: '@netflixbr', avatar_url: 'https://i.pravatar.cc/150?u=44', isVerified: true },
    createdAt: '5h',
    title: 'Stranger Things 5',
    content: 'Sneak peek exclusivo dos bastidores da última temporada! O Mundo Invertido vai tomar conta de Hawkins.',
    isVideo: true,
    mediaUrl: 'https://images.unsplash.com/photo-1626814026160-2237a95fc5a0?auto=format&fit=crop&q=80&w=1000', // Placeholder video thumb
    likes: 15000, commentsCount: 2000, shares: 5000
  },
  {
    id: 's3', category: 'series', type: 'review',
    user: { id: 'u55', name: 'Carol Series', username: '@carol_tv', avatar_url: 'https://i.pravatar.cc/150?u=55' },
    createdAt: '1d',
    title: 'The Bear', subtitle: 'Star+',
    coverImage: 'https://m.media-amazon.com/images/M/MV5BM2NiMzE1NjctOTA3ZC00ODUzLThhZjItYWNiZmU0N2EwMGFiXkEyXkFqcGdeQXVyMzE4MDg3Mzg@._V1_.jpg',
    rating: 5,
    content: 'Ansiedade pura em formato de série. "Fishes" é um dos melhores episódios da história da TV. Yes Chef!',
    likes: 780, commentsCount: 90, shares: 40
  },

  // --- ANIME ---
  {
    id: 'a1', category: 'anime', type: 'video',
    user: { id: 'u4', name: 'Otaku Zone', username: '@otakuzone', avatar_url: 'https://i.pravatar.cc/150?u=4' },
    createdAt: '5h',
    title: 'Jujutsu Kaisen',
    coverImage: 'https://m.media-amazon.com/images/M/MV5BNGY4MTg3NzgtMmFkZi00NTg5LWExMmEtMWI3YzI1ODdmMWQ1XkEyXkFqcGdeQXVyMjQwMDg0Ng@@._V1_.jpg',
    content: 'O arco de Shibuya está entregando TUDO! A animação da luta do Sukuna está nível filme. MAPPA não decepciona. 🔥🤞',
    metadata: { season: 2, episode: 16 },
    isVideo: true, likes: 5600, commentsCount: 420, shares: 1500
  },
  {
    id: 'a2', category: 'anime', type: 'status',
    user: { id: 'u66', name: 'One Piece Fandom', username: '@op_fandom', avatar_url: 'https://i.pravatar.cc/150?u=66' },
    createdAt: '12h',
    title: 'One Piece',
    content: 'O capítulo 1100 do mangá explicou tudo sobre o Kuma... Oda é um gênio, mas adora fazer a gente chorar. 😭⛵',
    likes: 3400, commentsCount: 500, shares: 1000
  },
  {
    id: 'a3', category: 'anime', type: 'progress',
    user: { id: 'u77', name: 'Newbie Otaku', username: '@novato', avatar_url: 'https://i.pravatar.cc/150?u=77' },
    createdAt: '2d',
    title: 'Attack on Titan',
    coverImage: 'https://m.media-amazon.com/images/M/MV5BNDFjYTIxMjctYTQ2ZC00OGQ4LWE3NzYtZWJkMjJhYzUyNDIyXkEyXkFqcGdeQXVyNDgyODgxNjE@._V1_.jpg',
    content: 'Começando a maratona agora! Me desejem sorte (e sem spoilers, por favor!). Sasageyo!',
    progress: { current: 1, total: 4, percentage: 25, status: 'Assistindo' },
    likes: 120, commentsCount: 30, shares: 2
  },

  // --- GAMES ---
  {
    id: 'g1', category: 'games', type: 'progress',
    user: { id: 'u5', name: 'Gamer Girl', username: '@juliegames', avatar_url: 'https://i.pravatar.cc/150?u=5', isVerified: true },
    createdAt: '2h',
    title: 'Elden Ring',
    coverImage: 'https://image.api.playstation.com/vulcan/ap/rnd/202110/2000/phvVT0qZfcRms5qDAk0SI3CM.png',
    content: 'EU NÃO ACREDITO! Malenia derrotada depois de 3 dias tentando! ⚔️💍',
    metadata: { platform: 'PS5', achievement: 'Shardbearer Malenia' },
    progress: { current: 95, total: 100, percentage: 95, status: 'Jogando' },
    likes: 2100, commentsCount: 156, shares: 45
  },
  {
    id: 'g2', category: 'games', type: 'link',
    user: { id: 'u88', name: 'IGN Brasil', username: '@ign_br', avatar_url: 'https://i.pravatar.cc/150?u=88', isVerified: true },
    createdAt: '4h',
    title: 'GTA VI: Trailer Breakdown',
    content: 'Analisamos quadro a quadro o trailer de GTA VI. Você viu esse detalhe na placa do carro?',
    mediaUrl: 'https://images.unsplash.com/photo-1593642702821-c8da6771f0c6?auto=format&fit=crop&q=80&w=1000',
    externalLink: { title: 'Ver Análise', url: '#', domain: 'ign.com' },
    likes: 5000, commentsCount: 230, shares: 800
  },
  {
    id: 'g3', category: 'games', type: 'review',
    user: { id: 'u99', name: 'Retro Gamer', username: '@retro', avatar_url: 'https://i.pravatar.cc/150?u=99' },
    createdAt: '6h',
    title: 'Super Mario Wonder',
    coverImage: 'https://images.unsplash.com/photo-1612404730960-5c71579fca11?auto=format&fit=crop&q=80&w=1000',
    rating: 5,
    content: 'A Nintendo trouxe a magia de volta aos jogos 2D. É pura criatividade e diversão. O efeito Wonder é surpreendente a cada fase!',
    likes: 450, commentsCount: 20, shares: 10
  },

  // --- ESPORTES ---
  {
    id: 'sp1', category: 'sports', type: 'match',
    user: { id: 'u12', name: 'NBA Brasil', username: '@nbabrasil', avatar_url: 'https://i.pravatar.cc/150?u=30', isVerified: true },
    createdAt: '10h',
    title: 'NBA Finals',
    metadata: { league: 'NBA', homeTeam: 'Celtics', awayTeam: 'Mavericks', score: '106 - 99' },
    content: 'Celtics abrem 3-0 na série! Jaylen Brown e Tatum imparáveis hoje. 🏀🍀',
    likes: 8900, commentsCount: 560, shares: 2100
  },
  {
    id: 'sp2', category: 'sports', type: 'video',
    user: { id: 'u3', name: 'TNT Sports', username: '@tntsportsbr', avatar_url: 'https://i.pravatar.cc/150?u=12', isVerified: true },
    createdAt: '1h',
    title: 'Golaço da Rodada',
    content: 'Olha o que o Messi fez ontem à noite! Simplesmente de outro planeta. 👽⚽',
    isVideo: true,
    mediaUrl: 'https://images.unsplash.com/photo-1579952363873-27f3bde9be2e?auto=format&fit=crop&q=80&w=1000',
    likes: 12000, commentsCount: 900, shares: 3000
  },
  {
    id: 'sp3', category: 'sports', type: 'status',
    user: { id: 'u100', name: 'Cartoleiro Pro', username: '@cartola', avatar_url: 'https://i.pravatar.cc/150?u=100' },
    createdAt: '2d',
    content: 'Quem mais escalou o Arrascaeta e se deu bem? 🎩⚽ #CartolaFC #Brasileirao',
    likes: 300, commentsCount: 150, shares: 10
  },

  // --- PODCASTS ---
  {
    id: 'pd1', category: 'podcasts', type: 'link',
    user: { id: 'u13', name: 'Dev Superior', username: '@devsuperior', avatar_url: 'https://i.pravatar.cc/150?u=35' },
    createdAt: '12h',
    title: 'Carreira em Tech 2025',
    content: 'Dicas valiosas sobre o mercado de trabalho atual. Júnior, Pleno ou Senior, vale a pena ouvir.',
    metadata: { duration: '55min' },
    externalLink: { label: 'Ouvir Episódio', url: '#', domain: 'facillit.com' },
    likes: 560, commentsCount: 30, shares: 120
  },
  {
    id: 'pd2', category: 'podcasts', type: 'recommendation',
    user: { id: 'u101', name: 'Maria Cast', username: '@mariacast', avatar_url: 'https://i.pravatar.cc/150?u=101' },
    createdAt: '1d',
    content: 'Alguém tem indicação de podcasts de True Crime que não sejam muito pesados? Quero algo mais investigativo.',
    likes: 80, commentsCount: 25, shares: 2
  },
  {
    id: 'pd3', category: 'podcasts', type: 'status',
    user: { id: 'u102', name: 'Flow Podcast', username: '@flow', avatar_url: 'https://i.pravatar.cc/150?u=102', isVerified: true },
    createdAt: '3h',
    content: 'Hoje a conversa é com um astronauta da NASA! Mande suas perguntas. 🚀🎙️',
    likes: 5000, commentsCount: 1200, shares: 400
  }
];

const COMMUNITIES: Community[] = [
  { id: 'c1', name: 'Clube do Terror', members: 15400, category: 'books', image: 'https://i.pravatar.cc/150?u=90' },
  { id: 'c2', name: 'Cinéfilos Cult', members: 8200, category: 'movies', image: 'https://i.pravatar.cc/150?u=91' },
  { id: 'c3', name: 'Otakus Brasil', members: 22100, category: 'anime', image: 'https://i.pravatar.cc/150?u=92' },
  { id: 'c4', name: 'Cartola FC Dicas', members: 45000, category: 'sports', image: 'https://i.pravatar.cc/150?u=93' },
];

const MOCK_STORIES: StoryCircle[] = [
   { id: '1', hasUnseen: true, category: 'books', user: { id: 'u1', name: 'Amanda', username: '@amanda', avatar_url: 'https://i.pravatar.cc/150?u=1' } },
   { id: '2', hasUnseen: true, category: 'movies', user: { id: 'u2', name: 'Bruno', username: '@bruno', avatar_url: 'https://i.pravatar.cc/150?u=2' } },
   { id: '3', hasUnseen: true, category: 'sports', user: { id: 'u3', name: 'TNT', username: '@tnt', avatar_url: 'https://i.pravatar.cc/150?u=12' } },
   { id: '4', hasUnseen: false, category: 'games', user: { id: 'u5', name: 'Julie', username: '@julie', avatar_url: 'https://i.pravatar.cc/150?u=5' } },
   { id: '5', hasUnseen: false, category: 'anime', user: { id: 'u4', name: 'Otaku', username: '@otaku', avatar_url: 'https://i.pravatar.cc/150?u=4' } },
];

export default function StoriesPage() {
  const [activeCategory, setActiveCategory] = useState<StoryCategory>('all');
  const [posts, setPosts] = useState<StoryPost[]>(ALL_POSTS);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  
  const [currentUser, setCurrentUser] = useState<UserProfile>({
    id: 'loading', name: '...', avatar_url: null, username: '@...',
    followers: 0, following: 0, readCount: 0
  });

  useEffect(() => {
    const loadUser = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single();
        setCurrentUser({
          id: user.id,
          name: profile?.full_name || 'Visitante',
          avatar_url: profile?.avatar_url || 'https://i.pravatar.cc/150?u=me',
          username: profile?.username || `@${user.email?.split('@')[0]}`,
          isVerified: true,
          bio: profile?.bio || 'Explorador cultural do Facillit Hub.',
          followers: 1250, following: 342, readCount: 42
        });
      }
      setLoading(false);
    };
    loadUser();
  }, []);

  const getPostsForCategory = () => {
    if (activeCategory === 'all') return posts;
    let filtered = posts.filter(p => p.category === activeCategory);
    
    if (filtered.length === 0) {
       return [
         {
            id: `mock-${activeCategory}-1`, category: activeCategory, type: 'status',
            user: { id: 'bot', name: 'Facillit Bot', username: '@bot', avatar_url: null },
            createdAt: 'Agora',
            content: `Seja o primeiro a postar sobre ${activeCategory}!`,
            likes: 0, commentsCount: 0, shares: 0
         }
       ] as StoryPost[];
    }
    return filtered;
  };

  const displayedPosts = getPostsForCategory();

  const handleCreatePost = (newPost: StoryPost) => {
    setPosts([newPost, ...posts]);
  };

  const handleSimplePost = (text: string) => {
    const newPost: StoryPost = {
      id: Date.now().toString(),
      category: activeCategory === 'all' ? 'books' : activeCategory,
      type: 'status',
      user: currentUser,
      createdAt: 'Agora',
      content: text,
      likes: 0, commentsCount: 0, shares: 0
    };
    setPosts([newPost, ...posts]);
  };

  if (loading) return <div className="min-h-screen bg-[#FDFDFD] flex items-center justify-center"><div className="w-10 h-10 border-4 border-brand-purple border-t-transparent rounded-full animate-spin"></div></div>;

  return (
    <div className="min-h-screen bg-[#FDFDFD] text-slate-900 font-sans">
      
      {/* Modal de Review */}
      <CreateReviewModal 
        isOpen={isReviewModalOpen} 
        onClose={() => setIsReviewModalOpen(false)} 
        currentUser={currentUser} 
        onPostCreate={handleCreatePost} 
      />

      <div className="max-w-[1250px] mx-auto grid grid-cols-1 lg:grid-cols-12 gap-0 lg:gap-8 px-0 lg:px-4">
        
        {/* === COLUNA CENTRAL: FEED === */}
        <main className="lg:col-span-8 min-h-screen relative">
           
           {/* HEADER - ROLA JUNTO COM A PÁGINA (NÃO É STICKY/FIXED) */}
           <div className="bg-[#FDFDFD] pt-6 pb-2 px-4 border-b border-gray-100">
              <div className="flex items-center justify-between mb-4">
                 <div className="relative w-32 h-8">
                    <Image src="/assets/images/marcas/Stories.png" alt="Stories" fill className="object-contain object-left" priority />
                 </div>
                 <div className="flex gap-3">
                    <button className="w-9 h-9 rounded-full bg-white border border-gray-100 flex items-center justify-center text-gray-500 hover:text-brand-purple shadow-sm transition-all"><i className="fas fa-search"></i></button>
                    <button className="w-9 h-9 rounded-full bg-white border border-gray-100 flex items-center justify-center text-gray-500 hover:text-brand-purple shadow-sm transition-all relative">
                       <i className="far fa-bell"></i>
                       <span className="absolute top-0 right-0 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white"></span>
                    </button>
                 </div>
              </div>
              <StoriesBar stories={MOCK_STORIES} currentUser={currentUser} />
              <div className="mt-4">
                 <CategoryTabs activeCategory={activeCategory} onSelect={setActiveCategory} />
              </div>
           </div>

           {/* MOBILE: PERFIL E COMUNIDADES (Topo do Feed) */}
           <div className="lg:hidden px-4 mt-6">
              <div className="bg-brand-gradient rounded-2xl p-4 text-white shadow-lg flex items-center gap-4 mb-4">
                 <div className="w-14 h-14 rounded-full border-2 border-white/30 overflow-hidden bg-white/20 relative flex-shrink-0">
                    {currentUser.avatar_url && <Image src={currentUser.avatar_url} alt="Me" fill className="object-cover" />}
                 </div>
                 <div className="flex-1 min-w-0">
                    <h2 className="font-bold text-base truncate">{currentUser.name}</h2>
                    <p className="text-white/80 text-xs truncate mb-1">{currentUser.username}</p>
                    <div className="flex gap-3 text-[10px] opacity-90">
                       <span><b>{currentUser.readCount}</b> Lidos</span>
                       <span><b>{currentUser.followers}</b> Fãs</span>
                    </div>
                 </div>
              </div>
              
              <div className="flex gap-3 overflow-x-auto scrollbar-hide pb-2">
                 {COMMUNITIES.map(comm => (
                    <div key={comm.id} className="flex-shrink-0 w-32 bg-white border border-gray-100 rounded-xl p-2 flex flex-col items-center text-center shadow-sm">
                       <div className="w-8 h-8 rounded-full bg-gray-100 overflow-hidden relative mb-1">
                          <Image src={comm.image} alt={comm.name} fill className="object-cover" />
                       </div>
                       <p className="text-[10px] font-bold text-slate-800 truncate w-full">{comm.name}</p>
                    </div>
                 ))}
              </div>
           </div>

           <div className="py-6 px-4">
              <CreatePostWidget currentUser={currentUser} onPostCreate={handleSimplePost} />
              <TrendingTerms category={activeCategory} />

              <div className="flex flex-col gap-8 mt-8">
                 {displayedPosts.map(post => (
                    <PostCard key={post.id} post={post} />
                 ))}
              </div>
              
              <div className="py-20 text-center opacity-40">
                 <div className="w-12 h-1 bg-gray-200 rounded-full mx-auto mb-2"></div>
                 <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Você viu tudo</p>
              </div>
           </div>
        </main>

        {/* === COLUNA DIREITA: PERFIL & WIDGETS (Desktop Only - Sticky) === */}
        <aside className="hidden lg:block lg:col-span-4 pl-6">
           <div className="sticky top-8 space-y-8 pb-10 pt-6">
              
              {/* Card Perfil */}
              <div className="bg-brand-gradient rounded-[2rem] p-6 text-white shadow-xl shadow-purple-200 relative overflow-hidden group hover:scale-[1.02] transition-transform duration-300">
                 <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-10 -mt-10 blur-2xl"></div>
                 <div className="relative z-10 flex items-center gap-4">
                    <div className="w-16 h-16 rounded-full border-2 border-white/30 p-1">
                       <div className="w-full h-full rounded-full overflow-hidden bg-white/20 relative">
                          {currentUser.avatar_url && <Image src={currentUser.avatar_url} alt="Me" fill className="object-cover" />}
                       </div>
                    </div>
                    <div>
                       <h2 className="font-bold text-lg leading-tight">{currentUser.name}</h2>
                       <p className="text-white/70 text-xs mb-3">{currentUser.username}</p>
                       <div className="flex gap-4 text-xs font-medium bg-black/20 inline-flex px-3 py-1 rounded-lg backdrop-blur-sm">
                          <span><b>{currentUser.readCount}</b> Lidos</span>
                          <span className="w-px h-3 bg-white/20"></span>
                          <span><b>{currentUser.followers}</b> Fãs</span>
                       </div>
                    </div>
                 </div>
              </div>

              {/* Comunidades */}
              <div className="bg-white rounded-[2rem] p-6 shadow-sm border border-gray-100">
                 <div className="flex justify-between items-center mb-6">
                    <h3 className="font-bold text-slate-800 text-sm">Seus Clubes</h3>
                    <button className="text-xs text-brand-purple font-bold hover:underline">Ver todos</button>
                 </div>
                 <div className="space-y-3">
                    {COMMUNITIES.map(comm => (
                       <div key={comm.id} className="flex items-center gap-3 p-2 -mx-2 hover:bg-gray-50 rounded-xl transition-colors cursor-pointer group">
                          <div className="w-10 h-10 rounded-lg bg-gray-100 overflow-hidden relative shadow-sm border border-gray-100">
                             <Image src={comm.image} alt={comm.name} fill className="object-cover" />
                          </div>
                          <div className="flex-1 min-w-0">
                             <p className="font-bold text-xs text-slate-700 truncate group-hover:text-brand-purple transition-colors">{comm.name}</p>
                             <p className="text-[10px] text-gray-400">{comm.members.toLocaleString()} membros</p>
                          </div>
                          <i className="fas fa-chevron-right text-[10px] text-gray-300 group-hover:text-brand-purple transition-colors"></i>
                       </div>
                    ))}
                 </div>
                 <button className="w-full mt-5 py-2.5 border-2 border-dashed border-gray-200 rounded-xl text-xs font-bold text-gray-500 hover:border-brand-purple hover:text-brand-purple transition-all flex items-center justify-center gap-2 hover:bg-purple-50">
                    <i className="fas fa-plus"></i> Criar Clube
                 </button>
              </div>

              {/* Links Footer */}
              <div className="flex flex-wrap gap-x-4 gap-y-2 text-[10px] text-gray-400 px-2 justify-center">
                 <a href="#" className="hover:text-dark-text transition-colors">Sobre</a>
                 <a href="#" className="hover:text-dark-text transition-colors">Blog</a>
                 <a href="#" className="hover:text-dark-text transition-colors">Carreiras</a>
                 <a href="#" className="hover:text-dark-text transition-colors">Privacidade</a>
                 <span className="w-full text-center mt-2 opacity-50">Facillit Stories © 2025</span>
              </div>

           </div>
        </aside>

      </div>
    </div>
  );
}