"use client";

import { StoryPost } from '../../../types';

// Importe os componentes que criamos (e crie Placeholders para os que faltam por enquanto)
import ReviewPost from './components/ReviewPost';
import RankingPost from './components/RankingPost';
import QuotePost from './components/QuotePost';
import PromotionPost from './components/PromotionPost';

// Placeholder simples para tipos que ainda vamos criar visualmente
const DefaultBookPost = ({ post }: { post: StoryPost }) => (
    <div className="mt-2 p-4 bg-gray-50 rounded-lg border border-gray-100">
        <h3 className="font-bold text-gray-800">{post.title}</h3>
        <p className="text-sm text-gray-600 mt-2">{post.content}</p>
    </div>
);

export default function BookPostDispatcher({ post }: { post: StoryPost }) {
  // A mágica acontece aqui: SEPARAÇÃO TOTAL DE VISUAL
  switch (post.type) {
    case 'review':
    case 'rating': // Pode compartilhar o mesmo layout ou ter um próprio
      return <ReviewPost post={post} />;
      
    case 'ranking':
      return <RankingPost post={post} />;
      
    case 'quote':
      return <QuotePost post={post} />;
      
    case 'promotion':
      return <PromotionPost post={post} />;
    
    // Futuros tipos (crie os arquivos depois)
    case 'recommendation':
    case 'first-impressions':
    case 'discussion':
    case 'technical':
    default:
      // Fallback para o review padrão se não tiver específico ainda, ou o genérico
      return <ReviewPost post={post} />; 
  }
}