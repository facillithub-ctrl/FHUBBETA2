'use client';

import React from 'react';
import { StoryPost } from '../types';
import dynamic from 'next/dynamic';

const ReviewPost = dynamic(() => import('./feeds/books/components/ReviewPost'));
const QuotePost = dynamic(() => import('./feeds/books/components/QuotePost'));
const RankingPost = dynamic(() => import('./feeds/books/components/RankingPost'));
const DiscussionPost = dynamic(() => import('./feeds/books/components/DiscussionPost'));
const PromotionPost = dynamic(() => import('./feeds/books/components/PromotionPost'));
const FirstImpressionsPost = dynamic(() => import('./feeds/books/components/FirstImpressionsPost'));
const PostCard = dynamic(() => import('./PostCard')); 

interface PostDispatcherProps {
  post: StoryPost;
}

export function PostDispatcher({ post }: PostDispatcherProps) {
  // Debug visual se precisar
  // console.log("Dispatching:", post.type);

  switch (post.type) {
    case 'book_review': return <ReviewPost data={post} />;
    case 'book_quote': return <QuotePost data={post} />;
    case 'book_ranking': return <RankingPost data={post} />;
    case 'book_discussion': return <DiscussionPost data={post} />;
    case 'book_promotion': return <PromotionPost data={post} />;
    case 'book_first_impressions': return <FirstImpressionsPost data={post} />;
    default: return <PostCard post={post} />;
  }
}