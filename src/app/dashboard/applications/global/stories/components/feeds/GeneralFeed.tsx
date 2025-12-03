"use client";

import { useEffect, useState } from 'react';
import { getStoriesFeed } from '../../actions';
import { StoryPost, StoryCategory } from '../../types';
import PostCard from '../PostCard';

export default function GeneralFeed({ category }: { category: StoryCategory }) {
  const [posts, setPosts] = useState<StoryPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPosts = async () => {
      setLoading(true);
      try {
        const data = await getStoriesFeed(category);
        setPosts(data);
      } catch (error) {
        console.error("Feed error:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchPosts();
  }, [category]);

  if (loading) {
    return (
       <div className="flex justify-center py-10">
          <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
       </div>
    );
  }

  if (posts.length === 0) {
    return (
       <div className="text-center py-12 text-slate-500">
          <p>Nenhum post encontrado nesta categoria.</p>
       </div>
    );
  }

  return (
    <div className="flex flex-col border-t border-slate-200 dark:border-slate-800 sm:border-none">
      {posts.map((post) => (
        <PostCard key={post.id} post={post} />
      ))}
    </div>
  );
}