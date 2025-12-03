"use client";

import { useEffect, useState } from 'react';
import { getStoriesFeed } from '../../actions';
import { StoryPost } from '../../types';
import PostCard from '../PostCard';

interface BaseFeedProps {
  category: string;
  emptyMessage?: string;
  currentUserId?: string;
  onPostClick?: (post: StoryPost) => void; // <--- Adicionado
}

export default function BaseFeed({ category, emptyMessage, currentUserId, onPostClick }: BaseFeedProps) {
  const [posts, setPosts] = useState<StoryPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPosts = async () => {
    setLoading(true);
    setError(null);
    try {
      // Type assertion para evitar erro de string vs StoryCategory
      const data = await getStoriesFeed(category as any);
      setPosts(data);
    } catch (err) {
      console.error("Erro ao carregar feed:", err);
      setError("Falha ao carregar as histórias.");
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
          <div key={i} className="h-48 bg-gray-100 rounded-2xl border border-gray-200"></div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 text-center bg-red-50 text-red-500 rounded-2xl border border-red-100">
        <p>{error}</p>
        <button onClick={fetchPosts} className="mt-2 font-bold underline text-sm">Tentar novamente</button>
      </div>
    );
  }

  if (posts.length === 0) {
    return (
      <div className="py-16 text-center">
        <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl text-gray-300">
          <i className="fas fa-book-open"></i>
        </div>
        <p className="text-gray-400 font-medium text-sm">{emptyMessage || "Nada por aqui ainda."}</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      {posts.map((post) => (
        <PostCard 
          key={post.id} 
          post={post} 
          onCommentClick={onPostClick} // <--- Conectando
        />
      ))}
      
      <div className="py-10 text-center opacity-40">
        <div className="w-12 h-1 bg-gray-200 rounded-full mx-auto mb-2"></div>
      </div>
    </div>
  );
}