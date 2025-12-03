// CAMINHO: src/app/dashboard/applications/global/stories/post-example/page.tsx
import { Metadata } from 'next';
import ReviewCard, { BookReviewData } from './components/ReviewCard';
import QuoteCard, { QuoteData } from './components/QuoteCard';
import CommentsSection, { CommentData } from './components/CommentsSection';
import ReadingLogItem, { ReadingLogData } from './components/ReadingLogItem';

export const metadata: Metadata = {
  title: 'Post Example | Facillit Stories',
};

// --- DADOS FAKE PARA DEMONSTRAÇÃO ---

const mockReview: BookReviewData = {
  id: '1',
  user: {
    name: 'Amanda Torres',
    username: '@amandareads',
    avatar: 'https://i.pravatar.cc/150?u=a042581f4e29026024d'
  },
  book: {
    title: 'A Biblioteca da Meia-Noite',
    author: 'Matt Haig',
    coverUrl: 'https://m.media-amazon.com/images/I/81J6APjsWTL._AC_UF1000,1000_QL80_.jpg' // Placeholder cover
  },
  rating: 4.5,
  tags: ['Reflexivo', 'Ficção', 'Saúde Mental'],
  content: 'Este livro me pegou de um jeito que eu não esperava. A ideia de viver todas as vidas que você poderia ter vivido é aterrorizante e libertadora ao mesmo tempo. Nora Seed é uma personagem tão real... Recomendo muito para quem está se sentindo perdido.',
  createdAt: '2 horas atrás',
  likesCount: 142,
  commentsCount: 24,
  isLiked: true
};

const mockQuote: QuoteData = {
  id: 'q1',
  text: "A única maneira de aprender é viver.",
  bookTitle: "A Biblioteca da Meia-Noite",
  author: "Matt Haig",
  page: 205,
  theme: "paper"
};

const mockReadingLogs: ReadingLogData[] = [
  {
    id: 'l1',
    bookTitle: 'Duna',
    bookCover: 'https://m.media-amazon.com/images/I/81ym3QUd3KL._AC_UF1000,1000_QL80_.jpg',
    totalPages: 680,
    currentPage: 145,
    lastUpdate: 'Há 15 min',
    status: 'Lendo'
  },
  {
    id: 'l2',
    bookTitle: '1984',
    bookCover: 'https://m.media-amazon.com/images/I/61t0bDTXB7L._AC_UF1000,1000_QL80_.jpg',
    totalPages: 320,
    currentPage: 320,
    lastUpdate: 'Ontem',
    status: 'Concluído'
  }
];

const mockComments: CommentData[] = [
  {
    id: 'c1',
    user: { name: 'Bruno Lima', avatar: 'https://i.pravatar.cc/150?u=a042581f4e29026704d' },
    text: 'Eu amei esse livro! O final me fez chorar horrores.',
    likes: 12,
    timeAgo: '1h',
    replies: [
        {
            id: 'r1',
            user: { name: 'Amanda Torres', avatar: 'https://i.pravatar.cc/150?u=a042581f4e29026024d' },
            text: 'Simmm! A parte do jogo de xadrez...',
            likes: 3,
            timeAgo: '45m'
        }
    ]
  },
  {
    id: 'c2',
    user: { name: 'Carla Dias', avatar: 'https://i.pravatar.cc/150?u=a04258114e29026702d' },
    text: 'Achei o começo meio lento, mas depois engrena.',
    likes: 5,
    timeAgo: '30m'
  }
];

export default function PostExamplePage() {
  return (
    <div className="min-h-screen bg-[#F8F9FA] pb-20">
      
      {/* Navbar Simulada (apenas visual para contexto) */}
      <div className="bg-white border-b border-gray-200 px-6 py-3 sticky top-0 z-50 mb-8">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
           <div className="flex items-center gap-2 font-bold text-brand-purple">
             <i className="fas fa-arrow-left text-gray-400 mr-2"></i>
             Voltar ao Feed
           </div>
           <div className="text-sm font-bold text-gray-500">Visualização de Post</div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* COLUNA CENTRAL: Conteúdo Principal */}
        <div className="lg:col-span-8">
            <h1 className="text-2xl font-bold text-gray-800 mb-6">Resenha em Destaque</h1>
            
            {/* 1. Componente de Review */}
            <ReviewCard review={mockReview} />

            <div className="my-8">
                <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-4">Citação Favorita</h3>
                {/* 2. Componente de Citação */}
                <QuoteCard quote={mockQuote} />
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                {/* 3. Componente de Comentários */}
                <CommentsSection comments={mockComments} />
            </div>
        </div>

        {/* COLUNA DIREITA: Sidebar e Contexto */}
        <div className="lg:col-span-4 space-y-8">
            
            {/* Widget de Perfil Mini */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 text-center">
                <div className="w-20 h-20 rounded-full bg-gray-200 mx-auto mb-3 overflow-hidden relative">
                    <img src={mockReview.user.avatar} className="object-cover w-full h-full" />
                </div>
                <h3 className="font-bold text-lg">{mockReview.user.name}</h3>
                <p className="text-gray-500 text-sm mb-4">{mockReview.user.username}</p>
                <button className="w-full py-2 bg-brand-purple text-white rounded-lg font-bold text-sm hover:bg-brand-dark transition-colors shadow-sm">
                    Seguir
                </button>
            </div>

            {/* Widget: O que estou lendo (Reading Log) */}
            <div>
                <div className="flex justify-between items-center mb-4">
                    <h3 className="font-bold text-gray-700 text-sm uppercase">Progresso de Leitura</h3>
                </div>
                <div className="space-y-2">
                    {mockReadingLogs.map(log => (
                        <ReadingLogItem key={log.id} log={log} />
                    ))}
                </div>
            </div>

            {/* Widget: Sugestões */}
            <div className="bg-gradient-to-br from-indigo-600 to-purple-700 rounded-2xl p-6 text-white shadow-lg relative overflow-hidden">
                <div className="relative z-10">
                    <h3 className="font-bold text-lg mb-2">Clube do Livro</h3>
                    <p className="text-sm opacity-90 mb-4">Participe da discussão ao vivo sobre "A Biblioteca da Meia-Noite" hoje às 19h.</p>
                    <button className="bg-white text-indigo-600 px-4 py-2 rounded-lg font-bold text-sm shadow-sm hover:bg-gray-50">
                        Inscrever-se
                    </button>
                </div>
                <i className="fas fa-comments absolute -bottom-4 -right-4 text-8xl opacity-10"></i>
            </div>

        </div>

      </div>
    </div>
  );
}