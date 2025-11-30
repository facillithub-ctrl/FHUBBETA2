import { Suspense } from 'react'; // <--- Importe o Suspense
import { getChangelogPosts } from './actions';
import UpdatesFeedClient from './components/UpdatesFeedClient';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export const metadata = {
  title: 'Novidades e Atualizações | Facillit Hub',
  description: 'Acompanhe as melhorias, novas funcionalidades e correções do ecossistema Facillit.',
};

export const revalidate = 60;

export default async function UpdatesPage() {
  const updates = await getChangelogPosts();

  return (
    <div className="min-h-screen bg-gray-50 font-inter flex flex-col">
      <Header />
      
      <main className="flex-grow pt-32 pb-20">
        <div className="container mx-auto px-6 mb-16 text-center">
             <span className="px-4 py-1.5 rounded-full bg-purple-50 text-brand-purple text-xs font-bold uppercase tracking-wider mb-6 inline-block border border-purple-100">
                Changelog & Novidades
            </span>
            
            <h1 className="text-4xl md:text-6xl font-black mb-6 tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-brand-purple to-brand-green">
                O que há de novo?
            </h1>
            
            <p className="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed font-light">
                Acompanhe a evolução constante do Facillit Hub. <br className="hidden md:block"/>
                Novas funcionalidades, melhorias de performance e correções.
            </p>
        </div>

        {/* --- CORREÇÃO DO ERRO DE BUILD --- */}
        {/* O Suspense cria uma barreira para que o useSearchParams não quebre o build estático */}
        <Suspense fallback={
            <div className="container mx-auto px-4 max-w-5xl py-12 flex justify-center">
                <div className="animate-pulse flex flex-col items-center">
                    <div className="h-4 w-48 bg-gray-200 rounded mb-4"></div>
                    <div className="h-64 w-full max-w-2xl bg-gray-100 rounded-2xl"></div>
                </div>
            </div>
        }>
            <UpdatesFeedClient initialUpdates={updates} />
        </Suspense>

      </main>

      <Footer />
    </div>
  );
}