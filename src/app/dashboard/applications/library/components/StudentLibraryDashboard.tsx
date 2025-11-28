// src/app/dashboard/applications/library/components/StudentLibraryDashboard.tsx
'use client'

import { useState, useEffect } from 'react';
import LearningGPS from '@/components/learning-gps/LearningGPS';
import { getUserRepository, getStudentInsights, type LibraryInsights } from '../actions';
import { getPortfolioItems } from '../portfolio/actions';
import Image from 'next/image';
import FileList from './FileList';
import PortfolioCard from '../portfolio/PortfolioCard';
import GamificationWidget from './GamificationWidget';
import InsightsGrid from './InsightsGrid';

export default function StudentLibraryDashboard({ 
  user, 
  initialDiscoverData = { featured: [], math: [], literature: [], science: [] } 
}: { 
  user: any, 
  initialDiscoverData?: any 
}) {
  const [activeTab, setActiveTab] = useState<'overview' | 'discover' | 'drive' | 'portfolio' | 'notes'>('overview');
  
  // Estados de Dados
  const [driveItems, setDriveItems] = useState<any[]>([]);
  const [portfolioItems, setPortfolioItems] = useState<any[]>([]);
  const [insights, setInsights] = useState<LibraryInsights | null>(null);
  
  const [loading, setLoading] = useState(false);

  // Efeito para carregar dados sob demanda (Lazy Loading)
  useEffect(() => {
    async function loadTabData() {
      // 1. Carregar Insights na aba Visão Geral
      if (activeTab === 'overview' && !insights) {
        try {
            const data = await getStudentInsights();
            setInsights(data);
        } catch (e) { console.error("Erro ao carregar insights:", e) }
      }
      
      // 2. Carregar Arquivos do Drive
      if (activeTab === 'drive' && driveItems.length === 0) {
        setLoading(true);
        try {
          const items = await getUserRepository(null);
          setDriveItems(items || []);
        } catch (e) { console.error("Erro ao carregar drive:", e) }
        setLoading(false);
      }

      // 3. Carregar Portfólio
      if (activeTab === 'portfolio' && portfolioItems.length === 0) {
        setLoading(true);
        try {
          const items = await getPortfolioItems();
          setPortfolioItems(items || []);
        } catch (e) { console.error("Erro ao carregar portfólio:", e) }
        setLoading(false);
      }
    }
    loadTabData();
  }, [activeTab, insights, driveItems.length, portfolioItems.length]);

  // Helper para banner de destaque
  const hasFeatured = initialDiscoverData?.featured && initialDiscoverData.featured.length > 0;
  const featuredItem = hasFeatured ? initialDiscoverData.featured[0] : null;

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-8">
      
      {/* --- SEÇÃO 1: GPS DE APRENDIZAGEM --- */}
      <section>
        <LearningGPS />
      </section>

      {/* --- SEÇÃO 2: NAVEGAÇÃO POR ABAS --- */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8 overflow-x-auto scrollbar-hide" aria-label="Tabs">
          <TabButton 
            isActive={activeTab === 'overview'} 
            onClick={() => setActiveTab('overview')} 
            label="Visão Geral" 
            icon="fa-chart-pie"
          />
          <TabButton 
            isActive={activeTab === 'discover'} 
            onClick={() => setActiveTab('discover')} 
            label="Descobrir" 
            icon="fa-compass"
          />
          <TabButton 
            isActive={activeTab === 'drive'} 
            onClick={() => setActiveTab('drive')} 
            label="Meu Acervo" 
            icon="fa-folder"
          />
          <TabButton 
            isActive={activeTab === 'portfolio'} 
            onClick={() => setActiveTab('portfolio')} 
            label="Portfólio" 
            icon="fa-briefcase"
          />
          <TabButton 
            isActive={activeTab === 'notes'} 
            onClick={() => setActiveTab('notes')} 
            label="Anotações" 
            icon="fa-sticky-note"
          />
        </nav>
      </div>

      {/* --- SEÇÃO 3: CONTEÚDO DAS ABAS --- */}
      <div className="min-h-[500px]">
        
        {/* ABA: VISÃO GERAL (GAMIFICATION + INSIGHTS) */}
        {activeTab === 'overview' && (
            <div className="animate-fade-in space-y-8">
                {insights ? (
                    <>
                        {/* Widget de Nível e XP */}
                        <GamificationWidget insights={insights} />
                        
                        <div className="space-y-4">
                          <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                            <i className="fas fa-chart-line text-royal-blue"></i>
                            Seu Desempenho de Leitura
                          </h3>
                          {/* Grid de Estatísticas */}
                          <InsightsGrid insights={insights} />
                        </div>
                    </>
                ) : (
                    <div className="py-20 flex flex-col items-center justify-center text-gray-400">
                       <i className="fas fa-circle-notch fa-spin text-3xl mb-4 text-royal-blue"></i>
                       <p>Calculando seu progresso...</p>
                    </div>
                )}
            </div>
        )}

        {/* ABA: DESCOBRIR (NETFLIX STYLE) */}
        {activeTab === 'discover' && (
          <div className="animate-fade-in">
            {/* Banner Destaque */}
            <div className="relative h-72 rounded-2xl overflow-hidden mb-10 shadow-xl group bg-gray-900">
               {featuredItem ? (
                 <Image 
                   src={featuredItem.cover_image || '/assets/images/placeholder-module.png'} 
                   alt="Destaque" fill className="object-cover opacity-60 group-hover:opacity-40 transition-opacity duration-500"
                 />
               ) : (
                 <div className="absolute inset-0 flex items-center justify-center text-white/20">
                   <i className="fas fa-book text-6xl"></i>
                 </div>
               )}
               
               <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent flex flex-col justify-end p-8 text-white">
                 <div className="transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                    <span className="bg-yellow-400 text-black text-[10px] font-extrabold px-3 py-1 rounded-full uppercase tracking-wider mb-3 inline-block shadow-sm">Destaque da Semana</span>
                    <h2 className="text-4xl font-bold mb-3 leading-tight">{featuredItem?.title || 'Bem-vindo à Biblioteca'}</h2>
                    <p className="max-w-2xl opacity-90 text-base line-clamp-2 mb-6 text-gray-200">
                    {featuredItem?.description || 'Explore milhares de conteúdos educacionais selecionados para impulsionar seu aprendizado.'}
                    </p>
                    <button className="bg-white text-royal-blue px-6 py-3 rounded-lg font-bold hover:bg-gray-100 transition-colors flex items-center gap-2 shadow-lg">
                        <i className="fas fa-book-open"></i> Ler Agora
                    </button>
                 </div>
               </div>
            </div>

            <SectionList title="Matemática e Lógica" items={initialDiscoverData?.math || []} />
            <SectionList title="Clássicos da Literatura" items={initialDiscoverData?.literature || []} />
            <SectionList title="Ciências e Biologia" items={initialDiscoverData?.science || []} />
          </div>
        )}

        {/* ABA: MEU ACERVO (DRIVE) */}
        {activeTab === 'drive' && (
          <div className="animate-fade-in">
             <div className="flex justify-between items-center mb-6 bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
                <div>
                    <h2 className="text-xl font-bold text-gray-800">Meus Arquivos</h2>
                    <p className="text-sm text-gray-500">Gerencie seus documentos e uploads.</p>
                </div>
                <button className="bg-royal-blue text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors flex items-center gap-2 shadow-md">
                  <i className="fas fa-cloud-upload-alt"></i> Upload
                </button>
             </div>
             {loading ? <LoadingSkeleton /> : <FileList initialItems={driveItems} folderId={null} />}
          </div>
        )}

        {/* ABA: PORTFÓLIO */}
        {activeTab === 'portfolio' && (
          <div className="animate-fade-in">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h2 className="text-xl font-bold text-gray-800">Projetos Publicados</h2>
                    <p className="text-sm text-gray-500">Seu cartão de visitas profissional.</p>
                </div>
             </div>
             {loading ? <LoadingSkeleton /> : (
               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                 {portfolioItems.map(item => <PortfolioCard key={item.id} item={item} />)}
                 {portfolioItems.length === 0 && (
                    <div className="col-span-full py-16 text-center bg-gray-50 rounded-xl border border-dashed border-gray-200">
                        <i className="fas fa-briefcase text-4xl text-gray-300 mb-3"></i>
                        <p className="text-gray-500 font-medium">Nenhum projeto no portfólio ainda.</p>
                        <p className="text-sm text-gray-400 mt-1">Envie redações do Write ou projetos do Create para cá.</p>
                    </div>
                 )}
               </div>
             )}
          </div>
        )}

        {/* ABA: ANOTAÇÕES */}
        {activeTab === 'notes' && (
          <div className="animate-fade-in flex flex-col items-center justify-center h-80 text-gray-400 border-2 border-dashed border-gray-200 rounded-xl bg-gray-50">
             <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-sm mb-4">
                <i className="fas fa-sticky-note text-3xl text-yellow-400"></i>
             </div>
             <h3 className="text-lg font-bold text-gray-600">Suas anotações</h3>
             <p className="text-sm mb-6">Crie notas rápidas durante seus estudos.</p>
             <button className="bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-lg text-sm hover:bg-gray-50 transition-colors">
                Criar Nova Nota
             </button>
          </div>
        )}

      </div>
    </div>
  );
}

// --- SUB-COMPONENTES AUXILIARES ---

const TabButton = ({ isActive, onClick, label, icon }: any) => (
    <button
      onClick={onClick}
      className={`
        flex items-center gap-2 whitespace-nowrap py-4 px-4 border-b-2 font-medium text-sm transition-all duration-200
        ${isActive 
          ? 'border-royal-blue text-royal-blue bg-blue-50/50' 
          : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 hover:bg-gray-50'}
      `}
    >
      <i className={`fas ${icon} ${isActive ? 'text-royal-blue' : 'text-gray-400'}`}></i>
      {label}
    </button>
);

const SectionList = ({ title, items }: { title: string, items: any[] }) => {
  if (!items || items.length === 0) return null;

  return (
    <div className="mb-12">
      <div className="flex justify-between items-end mb-4 px-1">
        <h3 className="text-xl font-bold text-gray-800">{title}</h3>
        <button className="text-sm text-royal-blue font-medium hover:underline">Ver tudo</button>
      </div>
      
      <div className="flex gap-5 overflow-x-auto pb-6 pt-2 px-1 scrollbar-thin scrollbar-thumb-gray-200 scrollbar-track-transparent hover:scrollbar-thumb-gray-300">
        {items.map((item) => (
          <div key={item.id} className="min-w-[180px] w-[180px] flex-shrink-0 group cursor-pointer">
            <div className="relative aspect-[2/3] mb-3 rounded-lg overflow-hidden shadow-md group-hover:shadow-xl group-hover:-translate-y-1 transition-all duration-300 bg-gray-100">
              <Image 
                src={item.cover_image || '/assets/images/placeholder-book.png'} 
                alt={item.title} 
                fill 
                className="object-cover" 
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors"></div>
            </div>
            <h4 className="text-sm font-bold text-gray-900 truncate leading-snug" title={item.title}>{item.title}</h4>
            <p className="text-xs text-gray-500 mt-1 truncate">{item.author || 'Autor desconhecido'}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

const LoadingSkeleton = () => (
  <div className="animate-pulse space-y-4">
    <div className="h-40 bg-gray-200 rounded-xl"></div>
    <div className="grid grid-cols-3 gap-4">
        <div className="h-32 bg-gray-200 rounded-xl"></div>
        <div className="h-32 bg-gray-200 rounded-xl"></div>
        <div className="h-32 bg-gray-200 rounded-xl"></div>
    </div>
  </div>
);