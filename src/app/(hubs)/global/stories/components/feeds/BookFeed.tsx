"use client";

import { useEffect, useState } from 'react';
import { getStoriesFeed } from '../../actions';
import { StoryPost } from '../../types';
import PostCard from '../PostCard';
import { RefreshCw } from 'lucide-react';

interface Props {
  userId?: string;
  category?: string;
}

export default function BookFeed({ userId, category = 'all' }: Props) {
  const [posts, setPosts] = useState<StoryPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const fetchPosts = async () => {
    setLoading(true);
    setError(false);
    try {
      const data = await getStoriesFeed(category as any);
      setPosts(data);
    } catch (e) {
      console.error(e);
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, [category]);

  // SKELETON LOADER (Para não ficar tela branca)
  if (loading) {
    return (
       <div className="space-y-0 divide-y divide-gray-100">
          {[1, 2, 3].map(i => (
             <div key={i} className="p-4 bg-white animate-pulse flex gap-3">
                <div className="w-10 h-10 bg-gray-200 rounded-full shrink-0"></div>
                <div className="flex-1 space-y-3 py-1">
                   <div className="h-2 bg-gray-200 rounded w-1/3"></div>
                   <div className="h-2 bg-gray-200 rounded w-3/4"></div>
                   <div className="h-20 bg-gray-100 rounded w-full mt-2"></div>
                </div>
             </div>
          ))}
       </div>
    );
  }

  if (error) {
      return (
          <div className="py-12 text-center">
              <p className="text-sm text-red-500 mb-2">Erro ao carregar feed.</p>
              <button onClick={fetchPosts} className="flex items-center gap-2 mx-auto text-sm font-bold text-brand-purple hover:bg-purple-50 px-4 py-2 rounded-full transition-colors">
                  <RefreshCw size={16} /> Tentar novamente
              </button>
          </div>
      )
  }

  if (posts.length === 0) {
    return (
       <div className="flex flex-col items-center justify-center py-20 px-6 text-center bg-white min-h-[300px]">
          <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
             <i className="fas fa-book-open text-gray-300 text-xl"></i>
          </div>
          <h3 className="text-gray-900 font-bold text-base">Nada por aqui ainda</h3>
          <p className="text-gray-500 text-sm max-w-xs mx-auto">
            Este espaço está esperando por suas histórias. Comece a tendência!
          </p>
       </div>
    );
  }

  return (
    // 'bg-[#f7f9f9]' dá o tom levemente cinza do fundo, e os posts são brancos
    <div className="bg-[#f7f9f9] min-h-screen pb-20">
      <div className="divide-y divide-gray-100 border-b border-gray-100">
        {posts.map((post) => (
          <PostCard 
            key={post.id} 
            post={post} 
            currentUserId={userId}
          />
        ))}
      </div>
      
      <div className="py-8 flex justify-center">
         <span className="text-xs font-semibold text-gray-400 uppercase tracking-widest">• Fim do conteúdo •</span>
      </div>
    </div>
  );
}