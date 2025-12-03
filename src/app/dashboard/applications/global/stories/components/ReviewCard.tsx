// CAMINHO: src/app/dashboard/applications/global/stories/components/ReviewCard.tsx
"use client";

import { useState } from 'react';
import Image from 'next/image';

export type BookReviewData = {
  id: string;
  user: { 
    name: string; 
    avatar: string;
    username: string;
  };
  book: {
    title: string;
    author: string;
    coverUrl: string;
  };
  rating: number; 
  tags: string[];
  content: string;
  createdAt: string;
  likesCount: number;
  commentsCount: number;
  isLiked?: boolean;
};

export default function ReviewCard({ review }: { review: BookReviewData }) {
  const [isLiked, setIsLiked] = useState(review.isLiked || false);
  const [likesCount, setLikesCount] = useState(review.likesCount);

  const toggleLike = () => {
    if (isLiked) {
      setLikesCount(prev => prev - 1);
    } else {
      setLikesCount(prev => prev + 1);
    }
    setIsLiked(!isLiked);
  };

  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 mb-6 transition-all hover:shadow-md">
      {/* Header */}
      <div className="flex flex-col sm:flex-row gap-5 mb-5">
        <div className="w-24 h-36 bg-gray-200 rounded-lg shadow-md flex-shrink-0 relative overflow-hidden group">
           <Image 
             src={review.book.coverUrl} 
             alt={review.book.title} 
             fill
             className="object-cover transition-transform duration-500 group-hover:scale-110"
           />
        </div>

        <div className="flex-1">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="font-bold text-gray-900 text-xl leading-tight mb-1">{review.book.title}</h3>
              <p className="text-sm text-gray-500 mb-3 font-medium">{review.book.author}</p>
            </div>
            <button className="text-gray-400 hover:text-gray-600"><i className="fas fa-ellipsis-h"></i></button>
          </div>

          <div className="flex items-center gap-1 mb-3 bg-gray-50 inline-flex px-3 py-1.5 rounded-full border border-gray-100">
            {[1, 2, 3, 4, 5].map((star) => (
              <i key={star} className={`fas fa-star text-sm ${star <= review.rating ? 'text-yellow-400' : 'text-gray-300'}`}></i>
            ))}
            <span className="text-xs text-gray-600 ml-2 font-bold border-l border-gray-300 pl-2">{review.rating.toFixed(1)}</span>
          </div>

          <div className="flex flex-wrap gap-2">
            {review.tags.map(tag => (
              <span key={tag} className="px-2.5 py-1 bg-brand-purple/5 text-brand-purple text-[11px] font-bold uppercase tracking-wide rounded-md border border-brand-purple/10">
                {tag}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Conteúdo do Texto - CORREÇÃO DE ASPAS */}
      <div className="text-gray-700 text-sm leading-7 mb-6 border-l-4 border-gray-100 pl-4 italic">
        &quot;{review.content}&quot;
      </div>

      {/* Rodapé */}
      <div className="flex items-center justify-between pt-4 border-t border-gray-50">
        <div className="flex items-center gap-3">
           <div className="w-8 h-8 rounded-full bg-gray-200 relative overflow-hidden">
             <Image src={review.user.avatar} alt={review.user.name} fill className="object-cover" />
           </div>
           <div className="flex flex-col">
             <span className="text-xs font-bold text-gray-900">{review.user.name}</span>
             <span className="text-[10px] text-gray-400">{review.createdAt}</span>
           </div>
        </div>

        <div className="flex items-center gap-4 text-gray-500">
          <button onClick={toggleLike} className={`flex items-center gap-2 text-sm transition-colors group ${isLiked ? 'text-red-500' : 'hover:text-red-500'}`}>
            <i className={`${isLiked ? 'fas' : 'far'} fa-heart transform group-active:scale-125 transition-transform`}></i> 
            <span className="font-medium">{likesCount}</span>
          </button>
          <button className="flex items-center gap-2 text-sm hover:text-brand-purple transition-colors">
            <i className="far fa-comment-alt"></i> 
            <span className="font-medium">{review.commentsCount}</span>
          </button>
        </div>
      </div>
    </div>
  );
}