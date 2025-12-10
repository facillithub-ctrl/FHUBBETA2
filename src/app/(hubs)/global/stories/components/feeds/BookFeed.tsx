"use client";

import { useEffect, useState } from 'react';
import { getStoriesFeed, togglePostLike } from '../../actions';
import { StoryPost } from '../../types';
import { PostDispatcher } from '../PostDispatcher';
import { MessageCircle, Heart, Share2, MoreHorizontal, Bookmark } from 'lucide-react';
import CommentsSection from '../CommentsSection';

interface Props {
  userId?: string;
  category?: string;
}

export default function BookFeed({ userId, category = 'all' }: Props) {
  const [posts, setPosts] = useState<StoryPost[]>([]);
  const [loading, setLoading] = useState(true);

  // Auto-refresh simples ao focar na janela (opcional)
  const refreshFeed = async () => {
    try {
      const data = await getStoriesFeed(category as any);
      setPosts(data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { refreshFeed(); }, [category]);

  if (loading && posts.length === 0) {
    return (
       <div className="flex flex-col items-center justify-center py-24 space-y-4">
          <div className="w-6 h-6 border-2 border-slate-900 border-t-transparent rounded-full animate-spin"></div>
       </div>
    );
  }

  return (
    <div className="flex flex-col divide-y divide-gray-100 dark:divide-gray-800">
      {posts.map((post) => (
        <FeedItem key={post.id} post={post} />
      ))}
      <div className="h-24 flex items-center justify-center text-xs text-gray-400 font-medium tracking-wide">
         FIM DOS RESULTADOS
      </div>
    </div>
  );
}

// Sub-componente para gerenciar estado de cada post individualmente (Like/Comment)
function FeedItem({ post }: { post: StoryPost }) {
    const [isLiked, setIsLiked] = useState(post.isLiked);
    const [likesCount, setLikesCount] = useState(post.likes);
    const [showComments, setShowComments] = useState(false);

    const handleLike = async () => {
        // Otimistic Update
        const newLikedState = !isLiked;
        setIsLiked(newLikedState);
        setLikesCount(prev => newLikedState ? prev + 1 : prev - 1);
        
        await togglePostLike(post.id);
    };

    return (
        <article className="px-4 py-3 hover:bg-gray-50/50 transition-colors cursor-pointer group">
            <div className="flex gap-3">
                {/* Avatar */}
                <div className="flex-shrink-0">
                    <div className="w-10 h-10 rounded-full bg-gray-200 overflow-hidden relative border border-gray-100">
                        {post.user.avatar_url ? (
                            <img src={post.user.avatar_url} alt={post.user.name} className="w-full h-full object-cover" />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center bg-brand-purple text-white font-bold text-xs">
                                {post.user.name[0]}
                            </div>
                        )}
                    </div>
                </div>

                {/* Conteúdo */}
                <div className="flex-1 min-w-0">
                    {/* Header: Nome + Meta */}
                    <div className="flex justify-between items-start">
                        <div className="flex items-center gap-1.5 overflow-hidden">
                            <span className="font-bold text-[15px] text-gray-900 truncate hover:underline decoration-1">{post.user.name}</span>
                            {post.user.isVerified && <span className="text-brand-purple text-[10px] bg-purple-50 px-1 rounded-sm border border-purple-100 font-bold">PRO</span>}
                            <span className="text-gray-500 text-[14px] truncate font-normal">@{post.user.username}</span>
                            <span className="text-gray-400 text-[13px] font-normal">· {post.createdAt}</span>
                        </div>
                        <button className="text-gray-400 hover:text-brand-purple hover:bg-purple-50 p-1 rounded-full transition-colors opacity-0 group-hover:opacity-100">
                            <MoreHorizontal size={16} />
                        </button>
                    </div>

                    {/* Dispatcher: Renderiza o layout correto (Review, Ranking, etc) */}
                    <div className="mt-1 text-[15px] text-gray-900 leading-relaxed font-normal">
                        <PostDispatcher post={post} />
                    </div>

                    {/* Action Bar (Linha Fina) */}
                    <div className="flex items-center justify-between mt-3 max-w-md">
                        <ActionButton 
                            icon={MessageCircle} 
                            count={post.commentsCount} 
                            color="blue" 
                            onClick={() => setShowComments(!showComments)}
                        />
                        <ActionButton icon={Share2} count={0} color="green" />
                        <ActionButton 
                            icon={Heart} 
                            count={likesCount} 
                            color="pink" 
                            active={isLiked}
                            onClick={(e) => { e.stopPropagation(); handleLike(); }}
                        />
                        <ActionButton icon={Bookmark} count={0} color="purple" />
                    </div>

                    {/* Seção de Comentários (Expansível) */}
                    {showComments && (
                        <div className="mt-4 border-t border-gray-100 animate-in slide-in-from-top-2">
                            <CommentsSection postId={post.id} />
                        </div>
                    )}
                </div>
            </div>
        </article>
    );
}

function ActionButton({ icon: Icon, count, color, active, onClick }: any) {
    const colors = {
        blue: 'hover:text-blue-500 hover:bg-blue-50',
        green: 'hover:text-green-500 hover:bg-green-50',
        pink: 'hover:text-pink-600 hover:bg-pink-50',
        purple: 'hover:text-purple-600 hover:bg-purple-50',
    };
    
    return (
        <button 
            onClick={onClick}
            className={`flex items-center gap-1.5 group text-gray-500 transition-all ${colors[color as keyof typeof colors]} ${active ? 'text-pink-600' : ''}`}
        >
            <div className="p-1.5 rounded-full transition-colors relative">
                <Icon size={18} className={active ? 'fill-current' : ''} />
            </div>
            {count > 0 && <span className="text-xs font-medium">{count}</span>}
        </button>
    );
}