import React from 'react';
import { StoryPost } from '../../../types';

// Componentes de Visualização
import ReviewPost from './components/ReviewPost';
import RankingPost from './components/RankingPost';
import QuotePost from './components/QuotePost';
import PromotionPost from './components/PromotionPost';
import RecommendationPost from './components/RecommendationPost';
import DiscussionPost from './components/DiscussionPost';
import FirstImpressionsPost from './components/FirstImpressionsPost';
import TechnicalPost from './components/TechnicalPost';

export default function BookPostDispatcher({ post }: { post: StoryPost }) {
  switch (post.type) {
    case 'review':
    case 'rating': // Usa o mesmo layout de Review, mas focado na nota
      return <ReviewPost post={post} />;
      
    case 'ranking':
      return <RankingPost post={post} />;
      
    case 'quote':
      return <QuotePost post={post} />;
      
    case 'promotion':
      return <PromotionPost post={post} />;
      
    case 'recommendation':
    case 'indication':
      return <RecommendationPost post={post} />;
      
    case 'discussion':
      return <DiscussionPost post={post} />;
      
    case 'first-impressions':
      return <FirstImpressionsPost post={post} />;
      
    case 'technical':
      return <TechnicalPost post={post} />;
      
    default:
      // Fallback para conteúdo genérico se o tipo não tiver layout específico
      return (
        <div className="text-sm text-slate-700 whitespace-pre-wrap">
          {post.content}
        </div>
      );
  }
}