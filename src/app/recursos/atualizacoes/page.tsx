import { getChangelogPosts } from './actions';
import UpdatesFeedClient from './components/UpdatesClientPage';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export const metadata = {
  title: 'Novidades e Atualizações | Facillit Hub',
  description: 'Acompanhe as melhorias, novas funcionalidades e correções do ecossistema Facillit.',
};

// Revalida a página a cada 60 segundos para garantir que novas atualizações apareçam rápido
export const revalidate = 60;

export default async function UpdatesPage() {
  // Busca os dados diretamente do Sanity no servidor
  const updates = await getChangelogPosts();

  return (
    <div className="min-h-screen bg-gray-50 font-inter flex flex-col">
      <Header />
      
      <main className="flex-grow pt-32 pb-20">
        <div className="container mx-auto px-6 mb-16 text-center">
             <span className="px-4 py-1.5 rounded-full bg-purple-50 text-brand-purple text-xs font-bold uppercase tracking-wider mb-6 inline-block border border-purple-100">
                Changelog & Novidades
            </span>
            
            {/* Título com Gradiente da Marca */}
            <h1 className="text-4xl md:text-6xl font-black mb-6 tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-brand-purple via-purple-600 to-pink-500">
                O que há de novo?
            </h1>
            
            <p className="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed font-light">
                Acompanhe a evolução constante do Facillit Hub. <br className="hidden md:block"/>
                Novas funcionalidades, melhorias de performance e correções.
            </p>
        </div>

        {/* Passa os dados para o componente interativo (Client Side) */}
        <UpdatesFeedClient initialUpdates={updates} />
      </main>

      <Footer />
    </div>
  );
}