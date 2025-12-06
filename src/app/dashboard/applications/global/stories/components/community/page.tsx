// CAMINHO: src/app/dashboard/applications/global/stories/components/CommunityView.tsx
import { getActiveBookClub, getUpcomingEvents, getTopReaders, getStoriesFeed } from '../actions';
import BookClubWidget from './BookClubWidget'; // Importe os componentes criados acima
import EventsList from './EventsList';
import RankingWidget from './RankingWidget';
import Feed from './feeds/GeneralFeed'; // Seu feed existente, ou crie um específico

export default async function CommunityView() {
  // Busca dados em paralelo para performance
  const [bookClub, events, topReaders, communityPosts] = await Promise.all([
    getActiveBookClub(),
    getUpcomingEvents(),
    getTopReaders(),
    getStoriesFeed('all', 10) // Traz posts gerais para o feed da comunidade
  ]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-screen">
      
      {/* COLUNA PRINCIPAL (FEED) */}
      <div className="lg:col-span-8 space-y-6">
        {/* Banner de Boas Vindas (Opcional) */}
        <div className="bg-white p-6 rounded-2xl border border-gray-100 flex justify-between items-center">
            <div>
                <h1 className="text-xl font-bold text-gray-800">Comunidade Facillit</h1>
                <p className="text-sm text-gray-500 mt-1">Debata, compartilhe e evolua com outros leitores.</p>
            </div>
            <button className="bg-brand-purple text-white px-4 py-2 rounded-lg text-sm font-bold hover:shadow-lg transition-all">
                <i className="fas fa-plus mr-2"></i> Novo Tópico
            </button>
        </div>

        {/* Feed de Discussões */}
        <div className="bg-gray-50 rounded-xl">
             <Feed initialPosts={communityPosts} />
        </div>
      </div>

      {/* SIDEBAR (WIDGETS) */}
      <div className="lg:col-span-4 space-y-6">
        
        {/* Widget Clube do Livro */}
        <BookClubWidget club={bookClub} />

        {/* Widget Eventos */}
        <EventsList events={events} />

        {/* Widget Ranking */}
        <RankingWidget readers={topReaders} />

        {/* Widget Chat Rápido (Placeholder para futuro) */}
        <div className="bg-gradient-to-r from-pink-500 to-rose-500 rounded-2xl p-5 text-white cursor-pointer hover:shadow-lg transition-all">
            <div className="flex items-center justify-between">
                <h3 className="font-bold">Chat Geral</h3>
                <span className="bg-white/20 px-2 py-0.5 rounded text-xs">Online: 24</span>
            </div>
            <p className="text-xs opacity-90 mt-1">Converse em tempo real com a comunidade.</p>
        </div>

      </div>
    </div>
  );
}