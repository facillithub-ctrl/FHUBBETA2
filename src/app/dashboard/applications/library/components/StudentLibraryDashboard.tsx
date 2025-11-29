// ARQUIVO: src/app/dashboard/applications/library/components/StudentLibraryDashboard.tsx
'use client'

import { useState, useEffect } from 'react';
import LearningGPS from '@/components/learning-gps/LearningGPS';
import { getUserRepository, getStudentInsights, type LibraryInsights } from '../actions';
import { getPortfolioItems } from '../portfolio/actions';
import FileList from './FileList';
import PortfolioCard from '../portfolio/PortfolioCard';
import GamificationWidget from './GamificationWidget';
import InsightsGrid from './InsightsGrid';
import ContentPlayer from './ContentPlayer';
import DiscoverView from '../discover/DiscoverView'; // Importando o novo visual

export default function StudentLibraryDashboard({ 
  user, 
  initialDiscoverData 
}: { 
  user: any, 
  initialDiscoverData: any 
}) {
  // Começa na aba 'discover' para mostrar o novo layout
  const [activeTab, setActiveTab] = useState<'overview' | 'discover' | 'drive' | 'portfolio' | 'notes'>('discover');
  
  // Estados de Dados (Lazy Loading)
  const [driveItems, setDriveItems] = useState<any[]>([]);
  const [portfolioItems, setPortfolioItems] = useState<any[]>([]);
  const [insights, setInsights] = useState<LibraryInsights | null>(null);
  
  // Estado do Player (Vídeo/PDF)
  const [selectedContent, setSelectedContent] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);

  // Carregar dados das outras abas apenas quando clicar nelas
  useEffect(() => {
    async function loadTabData() {
      if (activeTab === 'overview' && !insights) {
        try { const data = await getStudentInsights(); setInsights(data); } catch (e) { console.error(e) }
      }
      if (activeTab === 'drive' && driveItems.length === 0) {
        setLoading(true);
        try { const items = await getUserRepository(null); setDriveItems(items || []); } catch (e) { console.error(e) }
        setLoading(false);
      }
      if (activeTab === 'portfolio' && portfolioItems.length === 0) {
        setLoading(true);
        try { const items = await getPortfolioItems(); setPortfolioItems(items || []); } catch (e) { console.error(e) }
        setLoading(false);
      }
    }
    loadTabData();
  }, [activeTab, insights, driveItems.length, portfolioItems.length]);

  return (
    <div className="max-w-screen-2xl mx-auto px-4 md:px-8 py-6 space-y-8 bg-[#F8F9FA] min-h-screen">
      
      {/* 1. Topo: GPS de Aprendizagem */}
      <section>
        <LearningGPS />
      </section>

      {/* 2. Menu de Navegação (Sticky) */}
      <div className="flex items-center justify-center md:justify-start border-b border-gray-200 sticky top-0 bg-[#F8F9FA]/95 backdrop-blur-sm z-30 pt-2 pb-1 transition-all">
        <nav className="flex space-x-3 md:space-x-6 overflow-x-auto scrollbar-hide py-2 px-1">
          <TabButton isActive={activeTab === 'discover'} onClick={() => setActiveTab('discover')} label="Explorar" icon="fa-compass" />
          <TabButton isActive={activeTab === 'overview'} onClick={() => setActiveTab('overview')} label="Meu Progresso" icon="fa-chart-pie" />
          <TabButton isActive={activeTab === 'drive'} onClick={() => setActiveTab('drive')} label="Meus Arquivos" icon="fa-folder" />
          <TabButton isActive={activeTab === 'portfolio'} onClick={() => setActiveTab('portfolio')} label="Portfólio" icon="fa-briefcase" />
          <TabButton isActive={activeTab === 'notes'} onClick={() => setActiveTab('notes')} label="Anotações" icon="fa-sticky-note" />
        </nav>
      </div>

      <div className="min-h-[600px] animate-fade-in pb-20">
        
        {/* === ABA 1: EXPLORAR (NOVO VISUAL) === */}
        {activeTab === 'discover' && (
           <DiscoverView 
              data={initialDiscoverData} 
              onContentSelect={setSelectedContent} 
           />
        )}

        {/* === ABA 2: VISÃO GERAL === */}
        {activeTab === 'overview' && insights && (
             <div className="animate-fade-in space-y-8 max-w-5xl mx-auto">
                 <GamificationWidget insights={insights} />
                 <InsightsGrid insights={insights} />
             </div>
        )}

        {/* === ABA 3: DRIVE (MEUS ARQUIVOS) === */}
        {activeTab === 'drive' && (
             <div className="animate-fade-in max-w-6xl mx-auto">
                 <div className="flex justify-between items-center mb-6 bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
                    <div>
                        <h2 className="text-xl font-bold text-gray-800">Meus Arquivos</h2>
                        <p className="text-sm text-gray-500">Gerencie seus documentos privados.</p>
                    </div>
                    <button className="bg-royal-blue text-white px-5 py-2.5 rounded-xl font-bold hover:bg-blue-700 transition-colors shadow-lg hover:shadow-blue-500/30 flex items-center gap-2">
                        <i className="fas fa-cloud-upload-alt"></i> Upload
                    </button>
                 </div>
                 {loading ? <LoadingSkeleton /> : <FileList initialItems={driveItems} folderId={null} />}
             </div>
        )}

        {/* === ABA 4: PORTFÓLIO === */}
        {activeTab === 'portfolio' && (
             <div className="animate-fade-in max-w-6xl mx-auto">
                 <div className="mb-8">
                    <h2 className="text-2xl font-bold text-gray-800">Meu Portfólio</h2>
                    <p className="text-gray-500">Seus melhores trabalhos visíveis para a comunidade.</p>
                 </div>
                 {loading ? <LoadingSkeleton /> : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {portfolioItems.map(item => <PortfolioCard key={item.id} item={item} />)}
                        {portfolioItems.length === 0 && (
                            <div className="col-span-full py-20 text-center border-2 border-dashed border-gray-200 rounded-2xl bg-gray-50">
                                <i className="fas fa-briefcase text-4xl text-gray-300 mb-4"></i>
                                <p className="text-gray-500 font-medium">Seu portfólio está vazio.</p>
                                <p className="text-sm text-gray-400">Publique redações ou projetos para aparecerem aqui.</p>
                            </div>
                        )}
                    </div>
                 )}
             </div>
        )}
        
        {/* === ABA 5: ANOTAÇÕES === */}
        {activeTab === 'notes' && (
            <div className="max-w-4xl mx-auto flex flex-col items-center justify-center h-96 border-2 border-dashed border-gray-200 rounded-2xl bg-white">
                <div className="w-16 h-16 bg-yellow-50 rounded-full flex items-center justify-center mb-4">
                    <i className="fas fa-sticky-note text-3xl text-yellow-400"></i>
                </div>
                <h3 className="text-lg font-bold text-gray-700">Bloco de Notas</h3>
                <p className="text-gray-500 mb-6">Suas anotações rápidas de estudo.</p>
                <button className="px-6 py-2 border border-gray-300 rounded-lg text-gray-600 font-medium hover:bg-gray-50 transition-colors">
                    Criar Nova Nota
                </button>
            </div>
        )}
      </div>

      {/* PLAYER GLOBAL (Overlay) */}
      {selectedContent && (
        <ContentPlayer 
            content={selectedContent} 
            onClose={() => setSelectedContent(null)} 
        />
      )}
    </div>
  );
}

// --- Componentes Auxiliares ---

const TabButton = ({ isActive, onClick, label, icon }: any) => (
    <button
      onClick={onClick}
      className={`
        flex items-center gap-2 whitespace-nowrap py-2.5 px-5 rounded-full font-bold text-sm transition-all duration-300 select-none
        ${isActive 
          ? 'bg-gray-900 text-white shadow-lg transform scale-105' 
          : 'bg-white text-gray-500 border border-gray-200 hover:border-gray-400 hover:text-gray-700'}
      `}
    >
      <i className={`fas ${icon} ${isActive ? 'text-yellow-400' : ''}`}></i>
      {label}
    </button>
);

const LoadingSkeleton = () => (
    <div className="animate-pulse space-y-6">
        <div className="h-12 bg-gray-200 rounded-xl w-1/3"></div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1,2,3].map(i => (
                <div key={i} className="h-64 bg-gray-200 rounded-2xl"></div>
            ))}
        </div>
    </div>
);