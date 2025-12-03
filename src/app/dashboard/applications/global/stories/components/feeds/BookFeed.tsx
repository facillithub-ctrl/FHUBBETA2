"use client";

import { useEffect, useState } from 'react';
import { getStoriesFeed } from '../../actions';
import { StoryPost } from '../../types';
import PostCard from '../PostCard';

interface Props {
  userId?: string;
  onPostClick?: (post: StoryPost) => void;
  // Agora aceita uma categoria opcional para filtrar, default 'all'
  category?: 'all' | 'books' | 'movies' | 'general' | string;
}

export default function BookFeed({ userId, onPostClick, category = 'all' }: Props) {
  const [posts, setPosts] = useState<StoryPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPosts = async () => {
      setLoading(true);
      try {
        // category as any para flexibilidade, mas o actions trata 'all' corretamente
        const data = await getStoriesFeed(category as any);
        setPosts(data);
      } catch (error) {
        console.error("Feed error:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, [category, userId]); // Recarrega se mudar a categoria

  if (loading) {
    return (
       <div className="flex justify-center py-12">
          <div className="w-8 h-8 border-2 border-brand-purple border-t-transparent rounded-full animate-spin"></div>
       </div>
    );
  }

  if (posts.length === 0) {
    return (
       <div className="text-center py-16 px-4">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl text-gray-400">
             <i className="far fa-newspaper"></i>
          </div>
          <h3 className="text-gray-900 font-bold mb-1">Nada por aqui ainda</h3>
          <p className="text-gray-500 text-sm">Seja o primeiro a compartilhar algo!</p>
       </div>
    );
  }

  return (
    <div className="flex flex-col">
      {posts.map((post) => (
        <PostCard 
          key={post.id} 
          post={post} 
          currentUserId={userId}
          onCommentClick={onPostClick}
        />
      ))}
      
      <div className="py-8 text-center text-xs text-gray-400 uppercase tracking-widest font-semibold opacity-50">
         Fim do Feed
      </div>
    </div>
  );
}