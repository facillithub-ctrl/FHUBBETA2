// CAMINHO: src/app/dashboard/applications/global/stories/page.tsx
"use client";

import { useState, useEffect } from 'react';
import Image from 'next/image';
import StoriesBar from './components/StoriesBar';
import PostCard from './components/PostCard'; // IMPORTANTE: Usa o novo PostCard
import CreatePostWidget from './components/CreatePostWidget';
import CreateReviewModal from './components/CreateReviewModal';
import { StoryCircle, BookReviewPost, UserProfile } from './types';
import createClient from '@/utils/supabase/client';

// --- DADOS MOCK RICOS E DIVERSIFICADOS ---

const INITIAL_POSTS: BookReviewPost[] = [
  {
    id: 'p1',
    type: 'video',
    user: { id: 'u1', name: 'Amanda Torres', username: '@amanda_reads', avatar_url: 'https://i.pravatar.cc/150?u=1', isVerified: true },
    createdAt: '2h',
    content: 'Gente, fiz esse vídeo rápido pra falar porque esse livro mudou minha perspectiva sobre arrependimentos! 😭 Assista até o final.',
    mediaUrl: 'https://m.media-amazon.com/images/I/81J6APjsWTL._AC_UF1000,1000_QL80_.jpg',
    isVideo: true,
    likes: 1240,
    commentsCount: 45,
    topComments: [
       { id: 'c1', user: 'Bruno Lima', text: 'Eu chorei tanto nessa parte!' },
       { id: 'c2', user: 'Carla Dias', text: 'Nora Seed é icônica.' }
    ],
    shares: 12,
    isLiked: true,
    tags: ['BookTok', 'Review', 'Emocionante'],
  },
  {
    id: 'p2',
    type: 'review', // Review Completa
    user: { id: 'u2', name: 'Bruno Lima', username: '@blima_books', avatar_url: 'https://i.pravatar.cc/150?u=2' },
    createdAt: '5h',
    bookTitle: 'Duna',
    bookAuthor: 'Frank Herbert',
    bookCover: 'https://m.media-amazon.com/images/I/81ym3QUd3KL._AC_UF1000,1000_QL80_.jpg',
    rating: 4.5,
    content: 'O universo de Duna é denso, mas recompensador. A política, a ecologia... Frank Herbert era um visionário. Quem aí já leu?',
    mediaUrl: 'https://m.media-amazon.com/images/I/81ym3QUd3KL._AC_UF1000,1000_QL80_.jpg',
    readingProgress: { current: 680, total: 680, percentage: 100, status: 'Concluído' },
    characters: [{ name: 'Paul Atreides', role: 'Protagonista' }, { name: 'Barão Harkonnen', role: 'Vilão' }],
    likes: 856,
    commentsCount: 120,
    topComments: [
       { id: 'c3', user: 'SciFi_Fan', text: 'Melhor sci-fi de todos os tempos.' }
    ],
    shares: 50,
    tags: ['SciFi', 'Classico', 'Duna'],
  },
  {
    id: 'p3',
    type: 'link', // Post de Link
    user: { id: 'u3', name: 'Facillit News', username: '@facillit_official', avatar_url: 'https://i.pravatar.cc/150?u=8', isVerified: true },
    createdAt: '1d',
    content: '5 Motivos para ler clássicos em 2025. O número 3 vai te surpreender!',
    mediaUrl: 'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?auto=format&fit=crop&q=80&w=1000',
    externalLink: { 
       title: 'Por que ler clássicos muda seu cérebro', 
       domain: 'blog.facillit.com', 
       url: '#' 
    },
    likes: 3400,
    commentsCount: 22,
    shares: 400,
    isSaved: true,
  },
  {
    id: 'p4',
    type: 'recommendation', // Recomendação
    user: { id: 'u4', name: 'Sofia Leitora', username: '@sofia_pages', avatar_url: 'https://i.pravatar.cc/150?u=4' },
    createdAt: '1d',
    content: 'Alguém me indica livros parecidos com "Jogos Vorazes"? Quero algo com distopia e ação! 👇',
    likes: 45,
    commentsCount: 18,
    topComments: [
       { id: 'c4', user: 'Pedro H.', text: 'Tenta ler "Divergente"!' },
       { id: 'c5', user: 'Ana Books', text: '"O Ceifador" é incrível também.' }
    ],
    shares: 2,
    tags: ['Indicação', 'Distopia'],
  }
];

const MOCK_STORIES: StoryCircle[] = [
   { id: '1', hasUnseen: true, user: { id: 'u1', name: 'Amanda', username: '@amanda', avatar_url: 'https://i.pravatar.cc/150?u=1' } },
   { id: '2', hasUnseen: true, user: { id: 'u2', name: 'Bruno', username: '@bruno', avatar_url: 'https://i.pravatar.cc/150?u=2' } },
   { id: '3', hasUnseen: false, user: { id: 'u3', name: 'Club Horror', username: '@horror', avatar_url: 'https://i.pravatar.cc/150?u=6' } },
   { id: '4', hasUnseen: true, user: { id: 'u4', name: 'Editora X', username: '@editorax', avatar_url: 'https://i.pravatar.cc/150?u=9', isVerified: true } },
   { id: '5', hasUnseen: false, user: { id: 'u5', name: 'Carla', username: '@carla', avatar_url: 'https://i.pravatar.cc/150?u=3' } },
];

export default function BookgramPage() {
  const [posts, setPosts] = useState<BookReviewPost[]>(INITIAL_POSTS);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  
  // Perfil Completo
  const [currentUser, setCurrentUser] = useState<UserProfile>({
    id: 'loading',
    name: '...',
    avatar_url: null,
    username: '@...',
    bio: 'Leitor',
    followers: 0,
    following: 0,
    readCount: 0
  });

  useEffect(() => {
    const loadUser = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        // Tenta buscar dados reais
        const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single();
        
        setCurrentUser({
          id: user.id,
          name: profile?.full_name || user.email?.split('@')[0] || 'Visitante',
          avatar_url: profile?.avatar_url || 'https://i.pravatar.cc/150?u=me',
          username: profile?.username || `@${user.email?.split('@')[0]}`,
          isVerified: true, // Mock para visual "Premium"
          bio: profile?.bio || 'Apaixonado por ficção científica, café e dias chuvosos. 📚☕',
          followers: 1250,
          following: 342,
          readCount: 42
        });
      }
      setLoading(false);
    };
    loadUser();
  }, []);

  const handleCreatePost = (newPost: BookReviewPost) => {
    setPosts([newPost, ...posts]);
  };

  if (loading) return <div className="min-h-screen bg-[#FAFAFA] flex items-center justify-center"><div className="w-10 h-10 border-4 border-brand-purple border-t-transparent rounded-full animate-spin"></div></div>;

  return (
    <div className="min-h-screen bg-[#FAFAFA] text-dark-text font-sans pb-20">
      
      <CreateReviewModal 
        isOpen={isReviewModalOpen} 
        onClose={() => setIsReviewModalOpen(false)} 
        currentUser={currentUser} 
        onPostCreate={handleCreatePost} 
      />

      <div className="max-w-[1250px] mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 pt-6 px-4">
        
        {/* === SIDEBAR ESQUERDA (Perfil) === */}
        <aside className="hidden lg:block lg:col-span-3">
           <div className="sticky top-24">
              {/* Card de Perfil Completo */}
              <div className="bg-white rounded-[2rem] p-0 shadow-sm border border-gray-100 overflow-hidden relative group hover:shadow-md transition-all">
                 <div className="h-28 bg-gradient-to-r from-brand-purple to-indigo-600 relative">
                    <div className="absolute inset-0 bg-black/10"></div>
                 </div>
                 
                 <div className="px-6 pb-6 relative">
                    <div className="relative -mt-12 mb-4 flex justify-center">
                       <div className="w-24 h-24 rounded-full p-1 bg-white">
                          <div className="w-full h-full rounded-full overflow-hidden relative border-2 border-gray-100">
                             {currentUser.avatar_url && <Image src={currentUser.avatar_url} alt="Me" fill className="object-cover" />}
                          </div>
                       </div>
                       {currentUser.isVerified && (
                          <div className="absolute bottom-1 right-[35%] bg-white rounded-full p-1 shadow-sm text-brand-green">
                             <i className="fas fa-certificate text-lg"></i>
                          </div>
                       )}
                    </div>

                    <div className="text-center mb-6">
                       <h2 className="text-xl font-bold text-dark-text">{currentUser.name}</h2>
                       <p className="text-sm text-brand-purple font-medium mb-2">{currentUser.username}</p>
                       <p className="text-sm text-gray-500 italic leading-relaxed">"{currentUser.bio}"</p>
                    </div>

                    <div className="flex justify-between items-center py-4 border-t border-gray-50 text-center">
                       <div><span className="block font-bold text-lg text-dark-text">{currentUser.readCount}</span><span className="text-[10px] text-gray-400 uppercase tracking-wider">Livros</span></div>
                       <div className="w-px h-8 bg-gray-100"></div>
                       <div><span className="block font-bold text-lg text-dark-text">{currentUser.followers}</span><span className="text-[10px] text-gray-400 uppercase tracking-wider">Seguidores</span></div>
                       <div className="w-px h-8 bg-gray-100"></div>
                       <div><span className="block font-bold text-lg text-dark-text">{currentUser.following}</span><span className="text-[10px] text-gray-400 uppercase tracking-wider">Seguindo</span></div>
                    </div>
                 </div>
              </div>
              
              {/* Menu de Navegação */}
              <nav className="mt-6 space-y-1">
                 {[
                   { icon: 'fas fa-home', label: 'Feed Principal', active: true },
                   { icon: 'fas fa-compass', label: 'Explorar', active: false },
                   { icon: 'fas fa-users', label: 'Comunidades', active: false, badge: 3 },
                   { icon: 'fas fa-bookmark', label: 'Itens Salvos', active: false },
                 ].map((item) => (
                    <a key={item.label} href="#" className={`flex items-center justify-between px-5 py-3.5 rounded-2xl transition-all group ${item.active ? 'bg-white shadow-sm text-brand-purple font-bold' : 'text-gray-500 hover:bg-white/60 hover:text-dark-text'}`}>
                       <div className="flex items-center gap-4">
                          <i className={`${item.icon} w-5 text-center text-lg`}></i> 
                          <span>{item.label}</span>
                       </div>
                       {item.badge && <span className="bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">{item.badge}</span>}
                    </a>
                 ))}
              </nav>
           </div>
        </aside>

        {/* === FEED CENTRAL === */}
        <main className="lg:col-span-6">
           <StoriesBar stories={MOCK_STORIES} currentUser={currentUser} />
           <CreatePostWidget currentUser={currentUser} onOpenReviewModal={() => setIsReviewModalOpen(true)} />
           <div className="flex flex-col">
              {posts.map(post => <PostCard key={post.id} post={post} />)}
           </div>
           
           {/* Loader de fim de página */}
           <div className="py-8 flex flex-col items-center gap-2 text-gray-300">
              <i className="fas fa-circle-notch animate-spin text-xl"></i>
              <p className="text-xs font-medium uppercase tracking-widest">Carregando mais histórias...</p>
           </div>
        </main>

        {/* === SIDEBAR DIREITA (Sugestões e Links) === */}
        <aside className="hidden lg:block lg:col-span-3">
           <div className="sticky top-24 space-y-6">
              
              {/* Sugestões de Leitura */}
              <div className="bg-white rounded-[2rem] p-6 shadow-sm border border-gray-100">
                 <div className="flex justify-between items-center mb-5">
                    <h3 className="font-bold text-gray-800 text-sm">Para ler a seguir</h3>
                    <button className="text-xs text-brand-purple font-bold hover:underline">Ver tudo</button>
                 </div>
                 <div className="space-y-5">
                    {[1, 2, 3].map(i => (
                       <div key={i} className="flex gap-3 group cursor-pointer">
                          <div className="w-12 h-16 bg-gray-100 rounded-lg overflow-hidden relative shadow-sm group-hover:shadow-md transition-all">
                             <Image src={`https://m.media-amazon.com/images/I/81ym3QUd3KL._AC_UF1000,1000_QL80_.jpg`} alt="Book" fill className="object-cover" />
                          </div>
                          <div className="flex-1 min-w-0 py-1">
                             <p className="font-bold text-sm text-dark-text truncate group-hover:text-brand-purple transition-colors">O Senhor dos Anéis</p>
                             <p className="text-xs text-gray-500 mb-1">J.R.R. Tolkien</p>
                             <div className="flex text-[8px] text-yellow-400 gap-0.5">
                                <i className="fas fa-star"></i><i className="fas fa-star"></i><i className="fas fa-star"></i><i className="fas fa-star"></i><i className="fas fa-star"></i>
                             </div>
                          </div>
                          <button className="self-center text-gray-300 hover:text-brand-purple"><i className="fas fa-plus-circle"></i></button>
                       </div>
                    ))}
                 </div>
              </div>

              {/* Comunidades Sugeridas */}
              <div className="bg-gradient-to-br from-indigo-900 to-brand-purple rounded-[2rem] p-6 text-white shadow-lg relative overflow-hidden">
                 <div className="relative z-10">
                    <h3 className="font-bold text-lg mb-1">Clube do Terror</h3>
                    <p className="text-xs opacity-80 mb-4">Junte-se a 15k leitores corajosos.</p>
                    <div className="flex -space-x-2 mb-4">
                       {[1,2,3,4].map(i => (
                          <div key={i} className="w-8 h-8 rounded-full border-2 border-indigo-900 bg-gray-300 relative overflow-hidden">
                             <Image src={`https://i.pravatar.cc/150?u=${i+50}`} alt="User" fill className="object-cover" />
                          </div>
                       ))}
                       <div className="w-8 h-8 rounded-full border-2 border-indigo-900 bg-white/20 flex items-center justify-center text-[10px] font-bold">+2k</div>
                    </div>
                    <button className="w-full py-2 bg-white text-brand-purple rounded-xl text-xs font-bold hover:bg-gray-100 transition-colors">
                       Entrar na Comunidade
                    </button>
                 </div>
                 <i className="fas fa-ghost absolute -bottom-4 -right-4 text-9xl opacity-10"></i>
              </div>

              {/* Links Rápidos */}
              <div className="flex flex-wrap gap-x-4 gap-y-2 text-[11px] text-gray-400 px-2">
                 <a href="#" className="hover:text-dark-text transition-colors">Sobre</a>
                 <a href="#" className="hover:text-dark-text transition-colors">Ajuda</a>
                 <a href="#" className="hover:text-dark-text transition-colors">Blog</a>
                 <a href="#" className="hover:text-dark-text transition-colors">Privacidade</a>
                 <a href="#" className="hover:text-dark-text transition-colors">Termos</a>
                 <span className="w-full mt-2 opacity-50">© 2025 Facillit Stories</span>
              </div>

           </div>
        </aside>

      </div>
    </div>
  );
}