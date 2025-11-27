"use client";

import React, { useState } from "react";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  LineChart, Line, CartesianGrid
} from "recharts";
import AvailableTestCard from "./AvailableTestCard";
import ResultsView from "./ResultsView";
import { StudentDashboardData } from "../types";

// --- COMPONENTES AUXILIARES ---

const GamificationHeader = ({ data }: { data: any }) => {
  // Fallback seguro se data for undefined
  const safeData = data || { level: 1, current_xp: 0, next_level_xp: 1000, streak_days: 0, badges: [] };
  const progress = Math.min((safeData.current_xp / safeData.next_level_xp) * 100, 100);
  
  return (
    <div className="bg-gradient-to-r from-royal-blue to-indigo-800 rounded-2xl p-6 text-white mb-8 shadow-xl relative overflow-hidden">
      <div className="absolute top-0 right-0 p-4 opacity-10 text-9xl transform translate-x-10 -translate-y-10">
        <i className="fas fa-trophy"></i>
      </div>
      
      <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-5">
          <div className="relative">
            <div className="w-20 h-20 rounded-full bg-white/10 border-4 border-white/30 flex items-center justify-center text-3xl font-bold backdrop-blur-md shadow-lg">
              {safeData.level}
            </div>
            <div className="absolute -bottom-2 -right-2 bg-yellow-400 text-black text-xs font-bold px-2 py-0.5 rounded-full shadow">
              Nível
            </div>
          </div>
          <div>
            <h2 className="text-2xl font-bold">Explorador do Saber</h2>
            <div className="flex items-center gap-2 mt-1 text-blue-100 text-sm">
              <span>{safeData.current_xp} XP</span>
              <span className="w-1 h-1 rounded-full bg-blue-300"></span>
              <span>Próximo: {safeData.next_level_xp} XP</span>
            </div>
            <div className="w-48 h-2.5 bg-black/20 rounded-full mt-2 overflow-hidden">
              <div 
                className="h-full bg-yellow-400 shadow-[0_0_10px_rgba(250,204,21,0.5)] transition-all duration-1000 ease-out" 
                style={{ width: `${progress}%` }}
              ></div>
            </div>
          </div>
        </div>

        <div className="flex gap-4">
           <div className="bg-white/10 backdrop-blur-md p-3 rounded-xl min-w-[90px] text-center border border-white/5">
            <i className="fas fa-fire text-orange-400 text-xl mb-1 drop-shadow-md animate-pulse"></i>
            <div className="text-xl font-bold">{safeData.streak_days}</div>
            <div className="text-[10px] text-blue-100 uppercase tracking-wide">Dias Seguidos</div>
          </div>
          <div className="bg-white/10 backdrop-blur-md p-3 rounded-xl min-w-[90px] text-center border border-white/5">
            <i className="fas fa-medal text-yellow-300 text-xl mb-1 drop-shadow-md"></i>
            <div className="text-xl font-bold">{safeData.badges?.length || 0}</div>
            <div className="text-[10px] text-blue-100 uppercase tracking-wide">Conquistas</div>
          </div>
        </div>
      </div>
    </div>
  );
};

const GoalsTab = ({ competencyMap, history }: any) => (
  <div className="space-y-6 animate-in fade-in">
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Metas Ativas */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-100 dark:border-gray-700">
        <h3 className="font-bold text-lg mb-4 dark:text-white flex items-center gap-2">
          <i className="fas fa-bullseye text-red-500"></i> Minhas Metas
        </h3>
        <div className="space-y-4">
          <div className="p-4 border rounded-lg bg-gray-50 dark:bg-gray-700/50 border-gray-200 dark:border-gray-600">
            <div className="flex justify-between mb-2">
              <span className="font-semibold text-sm dark:text-white">Chegar ao Nível 10</span>
              <span className="text-xs font-bold text-royal-blue">80%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-600">
              <div className="bg-royal-blue h-2.5 rounded-full" style={{ width: '80%' }}></div>
            </div>
          </div>
          <div className="p-4 border rounded-lg bg-gray-50 dark:bg-gray-700/50 border-gray-200 dark:border-gray-600">
             <div className="flex justify-between mb-2">
              <span className="font-semibold text-sm dark:text-white">Dominar "Análise Combinatória"</span>
              <span className="text-xs font-bold text-yellow-500">Em andamento</span>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400">Complete 3 simulados de Matemática com nota &gt; 70%</p>
          </div>
           <button className="w-full py-2.5 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg text-gray-500 dark:text-gray-400 text-sm font-bold hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
             + Criar Nova Meta
           </button>
        </div>
      </div>

      {/* Radar de Competências */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 h-[400px] border border-gray-100 dark:border-gray-700">
         <h3 className="font-bold text-lg mb-2 dark:text-white flex items-center gap-2">
            <i className="fas fa-brain text-purple-500"></i> Mapa de Habilidades
         </h3>
         <ResponsiveContainer width="100%" height="90%">
            <RadarChart cx="50%" cy="50%" outerRadius="70%" data={competencyMap || []}>
                <PolarGrid stroke="#e5e7eb" />
                <PolarAngleAxis dataKey="axis" tick={{ fill: '#6b7280', fontSize: 12, fontWeight: 'bold' }} />
                <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                <Radar name="Aluno" dataKey="score" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.5} />
                <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
            </RadarChart>
        </ResponsiveContainer>
      </div>
    </div>

    {/* Gráfico de Evolução Temporal */}
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 h-[400px] border border-gray-100 dark:border-gray-700">
       <h3 className="font-bold text-lg mb-4 dark:text-white flex items-center gap-2">
          <i className="fas fa-chart-line text-blue-500"></i> Evolução de Notas
       </h3>
       <ResponsiveContainer width="100%" height="90%">
          <LineChart data={history || []}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
              <XAxis dataKey="date" tick={{ fill: '#9ca3af' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#9ca3af' }} axisLine={false} tickLine={false} domain={[0, 100]} />
              <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
              <Line type="monotone" dataKey="avgScore" stroke="#2563eb" strokeWidth={3} dot={{ r: 4, fill: '#2563eb', strokeWidth: 2, stroke: '#fff' }} activeDot={{ r: 8 }} />
          </LineChart>
      </ResponsiveContainer>
    </div>
  </div>
);

const TabsHeader = ({ activeTab, onChange }: { activeTab: string, onChange: (t: string) => void }) => (
  <div className="flex space-x-1 rounded-xl bg-gray-100 p-1 dark:bg-gray-800 mb-6 overflow-x-auto no-scrollbar">
      {['overview', 'browse', 'results', 'goals'].map((tab) => {
          const labels: any = { overview: 'Visão Geral', browse: 'Simulados', results: 'Histórico', goals: 'Metas e Evolução' };
          const icons: any = { overview: 'fa-home', browse: 'fa-search', results: 'fa-history', goals: 'fa-bullseye' };
          return (
              <button
                  key={tab}
                  onClick={() => onChange(tab)}
                  className={`w-full rounded-lg py-2.5 text-sm font-bold leading-5 ring-white ring-opacity-60 ring-offset-2 ring-offset-blue-400 focus:outline-none focus:ring-2 flex items-center justify-center gap-2 transition-all whitespace-nowrap px-4
                  ${activeTab === tab
                      ? 'bg-white text-royal-blue shadow dark:bg-gray-700 dark:text-white'
                      : 'text-gray-500 hover:bg-white/[0.12] hover:text-royal-blue dark:text-gray-400'}`}
              >
                  <i className={`fas ${icons[tab]}`}></i> {labels[tab]}
              </button>
          )
      })}
  </div>
);

type Props = {
  dashboardData: StudentDashboardData | null; // Pode ser nulo
  globalTests: any[];
  classTests: any[];
};

export default function StudentTestDashboard({ dashboardData, globalTests, classTests }: Props) {
  const [activeTab, setActiveTab] = useState("overview");

  const allTests = [...(globalTests || []), ...(classTests || [])];

  // Se não houver dados, mostramos um estado de carregamento ou vazio para a aba Overview
  const isDataMissing = !dashboardData;

  const renderContent = () => {
    switch (activeTab) {
        case "overview":
            if (isDataMissing) {
                return (
                    <div className="text-center p-12 bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
                        <div className="w-20 h-20 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mx-auto mb-6 text-royal-blue text-3xl">
                             <i className="fas fa-rocket"></i>
                        </div>
                        <h2 className="text-2xl font-bold mb-2 dark:text-white">Comece sua Jornada!</h2>
                        <p className="text-gray-500 mb-8 max-w-md mx-auto">Realize seu primeiro simulado para desbloquear análises de desempenho e gamificação.</p>
                        <button onClick={() => setActiveTab('browse')} className="bg-royal-blue text-white px-8 py-3 rounded-full font-bold hover:bg-blue-700 transition-colors">
                            Ver Simulados Disponíveis
                        </button>
                    </div>
                );
            }

            return (
                <div className="animate-in slide-in-from-left duration-300 space-y-8">
                    {/* Header Gamificado */}
                    <GamificationHeader data={dashboardData.gamification} />
                    
                    {/* Insights de IA */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {dashboardData.insights.map((insight, idx) => (
                           <div key={idx} className={`p-4 rounded-xl border-l-4 shadow-sm bg-white dark:bg-gray-800 dark:text-white flex flex-col ${
                                insight.type === 'weakness' ? 'border-red-500' : 
                                insight.type === 'strength' ? 'border-green-500' : 'border-blue-500'
                            }`}>
                                <div className="flex items-center gap-2 mb-2 font-bold text-xs uppercase opacity-70">
                                    <i className={`fas ${
                                        insight.type === 'weakness' ? 'fa-exclamation-triangle text-red-500' : 
                                        insight.type === 'strength' ? 'fa-chart-line text-green-500' : 'fa-lightbulb text-blue-500'
                                    }`}></i>
                                    {insight.type === 'weakness' ? 'Ponto de Atenção' : insight.type === 'strength' ? 'Ponto Forte' : 'Dica'}
                                </div>
                                <p className="font-medium text-sm mb-2">{insight.message}</p>
                                <p className="text-xs text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-700 p-2 rounded">💡 {insight.actionable_tip}</p>
                            </div>
                        ))}
                    </div>

                    {/* Cards de Navegação Rápida */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div 
                          onClick={() => setActiveTab('browse')}
                          className="group bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 cursor-pointer hover:border-royal-blue/50 transition-all"
                        >
                            <div className="w-12 h-12 bg-blue-100 text-royal-blue rounded-lg flex items-center justify-center text-xl mb-4 group-hover:scale-110 transition-transform">
                              <i className="fas fa-search"></i>
                            </div>
                            <h3 className="font-bold text-lg dark:text-white">Explorar Novos Simulados</h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Encontre testes por matéria, dificuldade ou banca.</p>
                        </div>

                        <div 
                          onClick={() => setActiveTab('results')}
                          className="group bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 cursor-pointer hover:border-purple-500/50 transition-all"
                        >
                            <div className="w-12 h-12 bg-purple-100 text-purple-600 rounded-lg flex items-center justify-center text-xl mb-4 group-hover:scale-110 transition-transform">
                              <i className="fas fa-chart-pie"></i>
                            </div>
                            <h3 className="font-bold text-lg dark:text-white">Ver Meus Resultados</h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Analise seu histórico e veja os gabaritos.</p>
                        </div>
                    </div>
                </div>
            );
        case "browse":
            return (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-in fade-in">
                    {allTests.length > 0 ? allTests.map((test: any) => (
                        <AvailableTestCard key={test.id} test={test} onStart={() => {}} onViewDetails={() => {}} />
                    )) : (
                      <div className="col-span-3 text-center py-12 text-gray-500">
                        Nenhum simulado disponível no momento.
                      </div>
                    )}
                </div>
            );
        case "results":
             if (isDataMissing || !dashboardData.recentAttempts) {
                return <div className="text-center py-10 text-gray-500">Sem histórico de resultados.</div>
             }
            return <ResultsView attempts={dashboardData.recentAttempts} onBack={() => setActiveTab('overview')} />;
        case "goals":
             if (isDataMissing) {
                return <div className="text-center py-10 text-gray-500">Realize simulados para visualizar suas metas.</div>
             }
            return <GoalsTab competencyMap={dashboardData.competencyMap} history={dashboardData.history} />;
        default: return null;
    }
  };

  return (
    <div className="w-full max-w-7xl mx-auto p-4 sm:p-6">
        <TabsHeader activeTab={activeTab} onChange={setActiveTab} />
        {renderContent()}
    </div>
  );
}