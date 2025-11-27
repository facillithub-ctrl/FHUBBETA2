"use client";

import React, { useState } from "react";
import {
  Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  LineChart, Line, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer
} from "recharts";
import AvailableTestCard, { TestCardInfo } from "./AvailableTestCard";
import SurveyCard from "./SurveyCard"; // Assumindo que você tem ou usará o SurveyCard atualizado
import ResultsView from "./ResultsView";
import AttemptView from "./AttemptView";
import TestDetailView from "./TestDetailView";
import { getTestWithQuestions, submitCampaignConsent } from "../actions";
import { useToast } from "@/contexts/ToastContext";
import { StudentDashboardData, StudentCampaign } from "../types";

// --- COMPONENTES VISUAIS (HEADER & INSIGHTS) ---

const GamificationHeader = ({ data }: { data: any }) => {
  const safeData = data || { level: 1, current_xp: 0, next_level_xp: 1000, streak_days: 0, badges: [] };
  const progress = Math.min((safeData.current_xp / safeData.next_level_xp) * 100, 100);
  
  return (
    <div className="bg-gradient-to-r from-royal-blue to-indigo-800 rounded-2xl p-6 text-white mb-8 shadow-xl relative overflow-hidden animate-in fade-in">
      <div className="absolute top-0 right-0 p-4 opacity-10 text-9xl transform translate-x-10 -translate-y-10 pointer-events-none">
        <i className="fas fa-trophy"></i>
      </div>
      
      <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-5">
          <div className="relative">
            <div className="w-20 h-20 rounded-full bg-white/10 border-4 border-white/30 flex items-center justify-center text-3xl font-bold backdrop-blur-md shadow-lg">
              {safeData.level}
            </div>
            <div className="absolute -bottom-2 -right-2 bg-yellow-400 text-black text-xs font-bold px-2 py-0.5 rounded-full shadow">
              Lvl
            </div>
          </div>
          <div className="flex-1">
            <h2 className="text-2xl font-bold">Mestre do Conhecimento</h2>
            <div className="flex items-center justify-between mt-1 text-blue-100 text-xs font-semibold uppercase tracking-wide">
              <span>{safeData.current_xp} XP</span>
              <span>Próximo: {safeData.next_level_xp} XP</span>
            </div>
            <div className="w-full md:w-64 h-3 bg-black/20 rounded-full mt-1 overflow-hidden backdrop-blur-sm">
              <div 
                className="h-full bg-gradient-to-r from-yellow-400 to-orange-500 shadow-[0_0_15px_rgba(250,204,21,0.6)] transition-all duration-1000 ease-out" 
                style={{ width: `${progress}%` }}
              ></div>
            </div>
          </div>
        </div>

        <div className="flex gap-4">
           <div className="bg-white/10 backdrop-blur-md p-3 rounded-xl min-w-[100px] text-center border border-white/5 hover:bg-white/20 transition-colors">
            <i className="fas fa-fire text-orange-400 text-2xl mb-1 drop-shadow-md animate-pulse"></i>
            <div className="text-xl font-bold">{safeData.streak_days}</div>
            <div className="text-[10px] text-blue-100 uppercase tracking-wide font-bold">Dias Seguidos</div>
          </div>
          <div className="bg-white/10 backdrop-blur-md p-3 rounded-xl min-w-[100px] text-center border border-white/5 hover:bg-white/20 transition-colors">
            <i className="fas fa-medal text-yellow-300 text-2xl mb-1 drop-shadow-md"></i>
            <div className="text-xl font-bold">{safeData.badges?.length || 0}</div>
            <div className="text-[10px] text-blue-100 uppercase tracking-wide font-bold">Conquistas</div>
          </div>
        </div>
      </div>
    </div>
  );
};

const TabsHeader = ({ activeTab, onChange }: { activeTab: string, onChange: (t: string) => void }) => (
  <div className="flex space-x-1 rounded-xl bg-gray-100 p-1 dark:bg-gray-800 mb-8 overflow-x-auto no-scrollbar shadow-inner">
      {[
          { id: 'overview', label: 'Visão Geral', icon: 'fa-chart-pie' },
          { id: 'browse', label: 'Simulados', icon: 'fa-book-open' },
          { id: 'results', label: 'Meus Resultados', icon: 'fa-history' },
          { id: 'goals', label: 'Metas', icon: 'fa-bullseye' }
      ].map((tab) => (
          <button
              key={tab.id}
              onClick={() => onChange(tab.id)}
              className={`w-full rounded-lg py-3 text-sm font-bold leading-5 ring-white ring-opacity-60 ring-offset-2 ring-offset-blue-400 focus:outline-none focus:ring-2 flex items-center justify-center gap-2 transition-all whitespace-nowrap px-4
              ${activeTab === tab.id
                  ? 'bg-white text-royal-blue shadow-md dark:bg-gray-700 dark:text-white transform scale-[1.02]'
                  : 'text-gray-500 hover:bg-white/[0.5] hover:text-royal-blue dark:text-gray-400 dark:hover:bg-gray-700/50'}`}
          >
              <i className={`fas ${tab.icon}`}></i> {tab.label}
          </button>
      ))}
  </div>
);

type Props = {
  dashboardData: StudentDashboardData | null;
  globalTests: any[];
  classTests: any[];
  knowledgeTests: any[];
  campaigns: StudentCampaign[];
  consentedCampaignIds: string[];
};

export default function StudentTestDashboard({ dashboardData, globalTests, classTests, campaigns, consentedCampaignIds }: Props) {
  const [activeTab, setActiveTab] = useState("overview");
  const [view, setView] = useState<"dashboard" | "attempt" | "detail" | "results">("dashboard");
  const [selectedTest, setSelectedTest] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { addToast } = useToast();

  // Combina todos os testes disponíveis
  const allTests = [...(globalTests || []), ...(classTests || [])];

  // --- HANDLERS ---

  // Função crítica: Inicia o teste
  const handleInitiateTest = async (testId: string) => {
      setIsLoading(true);
      try {
          const { data, error } = await getTestWithQuestions(testId);
          
          if (error || !data) {
              addToast({ title: "Erro", message: "Não foi possível carregar o teste.", type: "error" });
              return;
          }

          if (data.hasAttempted) {
              addToast({ title: "Atenção", message: "Você está refazendo este teste.", type: "info" });
          }

          setSelectedTest(data);
          setView("attempt"); // Muda a view inteira para o modo de prova
      } catch (e) {
          console.error(e);
          addToast({ title: "Erro", message: "Erro inesperado ao iniciar.", type: "error" });
      } finally {
          setIsLoading(false);
      }
  };

  const handleViewDetails = async (testId: string) => {
      setIsLoading(true);
      const { data } = await getTestWithQuestions(testId);
      if (data) {
          setSelectedTest(data);
          setView("detail");
      }
      setIsLoading(false);
  };

  const handleFinishAttempt = () => {
      setView("dashboard");
      addToast({ title: "Parabéns!", message: "Simulado finalizado.", type: "success" });
      // Idealmente recarregar dados aqui
      window.location.reload();
  };

  // --- RENDERIZAÇÃO DAS ABAS ---

  const renderOverview = () => (
      <div className="animate-in slide-in-from-left duration-300 space-y-8">
          <GamificationHeader data={dashboardData?.gamification} />
          
          {/* Estatísticas Rápidas */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 flex flex-col items-center justify-center text-center">
                  <span className="text-3xl font-black text-royal-blue">{dashboardData?.stats.simuladosFeitos || 0}</span>
                  <span className="text-xs text-gray-500 uppercase font-bold mt-1">Simulados Feitos</span>
              </div>
              <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 flex flex-col items-center justify-center text-center">
                  <span className="text-3xl font-black text-green-500">{dashboardData?.stats.mediaGeral || 0}%</span>
                  <span className="text-xs text-gray-500 uppercase font-bold mt-1">Média Geral</span>
              </div>
              {/* ... Outros cards ... */}
          </div>

          {/* Atalho para Biblioteca */}
          <div className="flex justify-between items-center">
              <h3 className="font-bold text-xl dark:text-white">Recomendados para Você</h3>
              <button onClick={() => setActiveTab('browse')} className="text-royal-blue font-bold text-sm hover:underline">Ver todos &rarr;</button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {allTests.slice(0, 3).map((test: any) => (
                  <AvailableTestCard 
                      key={test.id} 
                      test={test} 
                      onStart={handleInitiateTest} 
                      onViewDetails={handleViewDetails} 
                  />
              ))}
          </div>
      </div>
  );

  const renderBrowse = () => (
      <div className="space-y-6 animate-in fade-in">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm">
              <h2 className="text-xl font-bold dark:text-white"><i className="fas fa-search mr-2 text-royal-blue"></i> Explorar Simulados</h2>
              <div className="flex gap-2">
                  <select className="p-2 border rounded-lg bg-gray-50 dark:bg-gray-700 dark:border-gray-600 text-sm">
                      <option>Todas as Matérias</option>
                      <option>Matemática</option>
                      <option>Português</option>
                  </select>
                  <select className="p-2 border rounded-lg bg-gray-50 dark:bg-gray-700 dark:border-gray-600 text-sm">
                      <option>Todas as Dificuldades</option>
                      <option>Fácil</option>
                      <option>Médio</option>
                  </select>
              </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {allTests.length > 0 ? allTests.map((test: any) => (
                  test.test_type === 'pesquisa' ? (
                      <SurveyCard 
                          key={test.id} 
                          survey={test} 
                          onStart={handleInitiateTest} 
                      />
                  ) : (
                      <AvailableTestCard 
                          key={test.id} 
                          test={test} 
                          onStart={handleInitiateTest} 
                          onViewDetails={handleViewDetails} 
                      />
                  )
              )) : (
                  <div className="col-span-3 text-center py-20 bg-gray-50 dark:bg-gray-800 rounded-xl border-dashed border-2 dark:border-gray-700">
                      <i className="fas fa-ghost text-4xl text-gray-300 mb-4"></i>
                      <p className="text-gray-500 font-medium">Nenhum simulado encontrado.</p>
                  </div>
              )}
          </div>
      </div>
  );

  // --- RENDERIZAÇÃO CONDICIONAL PRINCIPAL ---

  if (view === "attempt" && selectedTest) {
      return <AttemptView test={selectedTest} onFinish={handleFinishAttempt} />;
  }

  if (view === "detail" && selectedTest) {
      return <TestDetailView test={selectedTest} onBack={() => setView("dashboard")} onStartTest={() => handleInitiateTest(selectedTest.id)} />;
  }

  if (isLoading) {
      return (
          <div className="flex flex-col items-center justify-center h-[60vh]">
              <div className="w-16 h-16 border-4 border-royal-blue border-t-transparent rounded-full animate-spin mb-4"></div>
              <p className="text-gray-500 font-bold animate-pulse">Carregando...</p>
          </div>
      );
  }

  return (
    <div className="w-full max-w-7xl mx-auto p-4 sm:p-6 pb-20">
        <TabsHeader activeTab={activeTab} onChange={setActiveTab} />
        
        {activeTab === 'overview' && renderOverview()}
        {activeTab === 'browse' && renderBrowse()}
        {activeTab === 'results' && <ResultsView attempts={dashboardData?.recentAttempts || []} onBack={() => setActiveTab('overview')} />}
        {activeTab === 'goals' && (
            <div className="text-center py-20 bg-white dark:bg-gray-800 rounded-xl shadow-sm">
                <div className="w-20 h-20 bg-yellow-100 text-yellow-600 rounded-full flex items-center justify-center mx-auto text-3xl mb-4"><i className="fas fa-hard-hat"></i></div>
                <h3 className="text-xl font-bold dark:text-white">Área de Metas em Construção</h3>
                <p className="text-gray-500 mt-2">Em breve você poderá definir objetivos personalizados.</p>
            </div>
        )}
    </div>
  );
}