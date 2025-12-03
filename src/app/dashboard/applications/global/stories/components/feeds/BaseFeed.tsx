"use client";

import { useEffect, useState } from 'react';
import { getStoriesFeed } from '../../actions';
import { StoryPost } from '../../types';
// IMPORTANTE: Usa o PostCard (que contém a lógica de despacho visual)
import PostCard from '../PostCard';

interface BaseFeedProps {
  category: string;
  emptyMessage?: string;
  currentUserId?: string;
}

export default function BaseFeed({ category, emptyMessage, currentUserId }: BaseFeedProps) {
  const [posts, setPosts] = useState<StoryPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPosts = async () => {
    setLoading(true);
    setError(null);
    try {
      // Busca os posts do servidor baseado na categoria (ex: 'books')
      const data = await getStoriesFeed(category as any); // Type assertion para garantir compatibilidade
      setPosts(data);
    } catch (err) {
      console.error("Erro ao carregar feed:", err);
      setError("Falha ao carregar as histórias. Verifique sua conexão.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, [category]);

  if (loading) {
    return (
      <div className="flex flex-col gap-6 animate-pulse">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-white rounded-[1.5rem] p-5 border border-gray-100 h-64">
             <div className="flex gap-3 mb-4">
                <div className="w-11 h-11 bg-gray-200 rounded-full"></div>
                <div className="space-y-2">
                   <div className="w-32 h-4 bg-gray-200 rounded"></div>
                   <div className="w-20 h-3 bg-gray-100 rounded"></div>
                </div>
             </div>
             <div className="w-full h-32 bg-gray-100 rounded-xl"></div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="py-12 text-center bg-red-50 text-red-500 rounded-[1.5rem] border border-red-100">
        <i className="fas fa-exclamation-circle text-2xl mb-2"></i>
        <p className="text-sm font-medium">{error}</p>
        <button 
          onClick={fetchPosts} 
          className="mt-3 text-xs font-bold bg-white px-4 py-2 rounded-full shadow-sm hover:shadow-md transition-all text-red-600 border border-red-100"
        >
          Tentar novamente
        </button>
      </div>
    );
  }

  if (posts.length === 0) {
    return (
      <div className="py-16 text-center">
        <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl text-gray-300 border border-gray-100">
          <i className="fas fa-book-open"></i>
        </div>
        <p className="text-gray-400 font-medium text-sm max-w-xs mx-auto">
          {emptyMessage || "Nada por aqui ainda. Seja o primeiro a postar!"}
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      {posts.map((post) => (
        <PostCard key={post.id} post={post} />
      ))}
      
      <div className="py-8 text-center opacity-40">
        <div className="w-10 h-1 bg-gray-200 rounded-full mx-auto mb-2"></div>
        <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">
          Você chegou ao fim
        </p>
      </div>
    </div>
  );
}