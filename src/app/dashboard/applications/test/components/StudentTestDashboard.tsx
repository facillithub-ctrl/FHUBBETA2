"use client";

import React, { useState } from "react";
import {
  Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  LineChart, Line, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer,
  BarChart, Bar, PieChart, Pie, Cell, Legend
} from "recharts";
import AvailableTestCard, { TestCardInfo } from "./AvailableTestCard";
import SurveyCard from "./SurveyCard";
import ResultsView from "./ResultsView";
import AttemptView from "./AttemptView";
import TestDetailView from "./TestDetailView";
import { getTestWithQuestions, submitCampaignConsent, generateTurboTest } from "../actions";
import { useToast } from "@/contexts/ToastContext";
import { StudentDashboardData, StudentCampaign, DifficultyLevel } from "../types";

// --- CORES DO TEMA ---
const COLORS = {
  primary: '#4F46E5', // Royal Blue
  secondary: '#10B981', // Emerald
  accent: '#F59E0B', // Amber
  danger: '#EF4444', // Red
  chart: ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d']
};

// --- COMPONENTES VISUAIS (HEADER & INSIGHTS) ---

const GamificationHeader = ({ data }: { data: any }) => {
  const safeData = data || { level: 1, current_xp: 0, next_level_xp: 100, streak_days: 0, badges: [] };
  
  // Cálculo de progresso corrigido para a nova lógica linear
  // Se o nível é 2, o XP varia de 100 a 199. Se current_xp é 150, o progresso no nível deve ser 50%
  // Progress = (XP_Atual % 100)
  // Exemplo: 250 XP total. Nível 3. Progresso = 50.
  const progress = safeData.current_xp % 100;
  
  return (
    <div className="bg-brand-gradient rounded-2xl p-6 text-white mb-8 shadow-xl relative overflow-hidden animate-in fade-in duration-700">
      <div className="absolute top-0 right-0 p-4 opacity-10 text-9xl transform translate-x-10 -translate-y-10 pointer-events-none">
        <i className="fas fa-trophy"></i>
      </div>
      
      <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-5">
          <div className="relative group">
            <div className="w-24 h-24 rounded-full bg-white/10 border-4 border-white/30 flex items-center justify-center text-4xl font-bold backdrop-blur-md shadow-lg group-hover:scale-110 transition-transform duration-300">
              {safeData.level}
            </div>
            <div className="absolute -bottom-2 -right-2 bg-yellow-400 text-black text-xs font-bold px-3 py-1 rounded-full shadow border-2 border-indigo-900">
              NÍVEL
            </div>
          </div>
          <div className="flex-1">
            <h2 className="text-3xl font-bold tracking-tight">Mestre do Conhecimento</h2>
            <div className="flex items-center justify-between mt-2 text-blue-100 text-xs font-bold uppercase tracking-wide">
              <span>{safeData.current_xp} XP Total</span>
              <span>Próximo Nível: {safeData.next_level_xp} XP</span>
            </div>
            <div className="w-full md:w-72 h-4 bg-black/30 rounded-full mt-2 overflow-hidden backdrop-blur-sm border border-white/10">
              <div 
                className="h-full bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 shadow-[0_0_15px_rgba(250,204,21,0.6)] transition-all duration-1000 ease-out relative" 
                style={{ width: `${progress}%` }}
              >
                <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex gap-4">
           <div className="bg-white/10 backdrop-blur-md p-4 rounded-xl min-w-[110px] text-center border border-white/10 hover:bg-white/20 transition-all hover:-translate-y-1 cursor-help group">
            <i className="fas fa-fire text-orange-400 text-3xl mb-2 drop-shadow-md group-hover:animate-bounce"></i>
            <div className="text-2xl font-black">{safeData.streak_days}</div>
            <div className="text-[10px] text-blue-100 uppercase tracking-wide font-bold">Dias Seguidos</div>
          </div>
          <div className="bg-white/10 backdrop-blur-md p-4 rounded-xl min-w-[110px] text-center border border-white/10 hover:bg-white/20 transition-all hover:-translate-y-1 cursor-help group">
            <i className="fas fa-medal text-yellow-300 text-3xl mb-2 drop-shadow-md group-hover:rotate-12 transition-transform"></i>
            <div className="text-2xl font-black">{safeData.badges?.length || 0}</div>
            <div className="text-[10px] text-blue-100 uppercase tracking-wide font-bold">Conquistas</div>
          </div>
        </div>
      </div>
    </div>
  );
};

const TabsHeader = ({ activeTab, onChange }: { activeTab: string, onChange: (t: string) => void }) => (
  <div className="flex space-x-2 rounded-xl bg-white dark:bg-gray-800 p-2 mb-8 overflow-x-auto no-scrollbar shadow-sm border border-gray-100 dark:border-gray-700">
      {[
          { id: 'overview', label: 'Visão Geral', icon: 'fa-chart-pie' },
          { id: 'analytics', label: 'Análise Profunda', icon: 'fa-microscope' }, 
          { id: 'ai_study', label: 'Smart Coach IA', icon: 'fa-robot' }, 
          { id: 'browse', label: 'Simulados & Treinos', icon: 'fa-book-open' },
          { id: 'results', label: 'Histórico', icon: 'fa-history' },
      ].map((tab) => (
          <button
              key={tab.id}
              onClick={() => onChange(tab.id)}
              className={`flex-1 min-w-[140px] rounded-lg py-3 text-sm font-bold leading-5 ring-white ring-opacity-60 ring-offset-2 ring-offset-blue-400 focus:outline-none focus:ring-2 flex items-center justify-center gap-2 transition-all
              ${activeTab === tab.id
                  ? 'bg-royal-blue text-white shadow-lg shadow-blue-500/30 transform scale-[1.02]'
                  : 'text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700/50'}`}
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

  const safeStats = dashboardData?.stats || { simuladosFeitos: 0, mediaGeral: 0, taxaAcerto: 0, tempoMedio: 0, questionsAnsweredTotal: 0 };
  const allTests = [...(globalTests || []), ...(classTests || [])];

  // --- HANDLERS ---
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
          setView("attempt"); 
      } catch (e) {
          console.error(e);
          addToast({ title: "Erro", message: "Erro inesperado ao iniciar.", type: "error" });
      } finally {
          setIsLoading(false);
      }
  };

  const handleStartTurbo = async () => {
      setIsLoading(true);
      addToast({ title: "IA Trabalhando", message: "Analisando seus erros e gerando treino...", type: "info" });
      
      try {
          const result = await generateTurboTest();
          
          if (result.error) {
              addToast({ title: "Erro", message: result.error, type: "error" });
          } else if (result.testId) {
              await handleInitiateTest(result.testId);
              addToast({ title: "Pronto!", message: "Modo Turbo iniciado. Boa sorte!", type: "success" });
          }
      } catch (e) {
          addToast({ title: "Erro", message: "Falha na conexão com a IA.", type: "error" });
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
      window.location.reload();
  };

  // --- SUB-RENDERIZADORES (ABAS) ---

  const renderOverview = () => (
      <div className="animate-in slide-in-from-left duration-300 space-y-8">
          <GamificationHeader data={dashboardData?.gamification} />
          
          {/* KPIs Principais */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { label: 'Simulados Feitos', value: safeStats.simuladosFeitos, color: 'text-royal-blue', icon: 'fa-clipboard-check' },
                { label: 'Média Geral', value: `${safeStats.mediaGeral}%`, color: 'text-green-500', icon: 'fa-chart-line' },
                { label: 'Questões Resolvidas', value: safeStats.questionsAnsweredTotal || 0, color: 'text-purple-500', icon: 'fa-list-ol' },
                { label: 'Tempo Médio/Questão', value: `${safeStats.tempoMedio}m`, color: 'text-orange-500', icon: 'fa-stopwatch' },
              ].map((stat, idx) => (
                <div key={idx} className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 flex items-center gap-4 transition-transform hover:scale-[1.02]">
                    <div className={`w-12 h-12 rounded-full bg-gray-50 dark:bg-gray-700 flex items-center justify-center text-xl ${stat.color}`}>
                        <i className={`fas ${stat.icon}`}></i>
                    </div>
                    <div>
                        <div className={`text-2xl font-black ${stat.color}`}>{stat.value}</div>
                        <div className="text-xs text-gray-500 uppercase font-bold tracking-wider">{stat.label}</div>
                    </div>
                </div>
              ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Gráfico de Evolução Recente */}
              <div className="lg:col-span-2 bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
                  <h3 className="font-bold text-lg mb-6 flex items-center gap-2 dark:text-white">
                      <i className="fas fa-chart-area text-royal-blue"></i> Evolução de Desempenho
                  </h3>
                  <div className="h-[300px] w-full">
                      <ResponsiveContainer width="100%" height="100%">
                          <LineChart data={dashboardData?.history || []}>
                              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                              <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{fill: '#9CA3AF', fontSize: 12}} />
                              <YAxis axisLine={false} tickLine={false} tick={{fill: '#9CA3AF', fontSize: 12}} domain={[0, 100]} />
                              <Tooltip 
                                contentStyle={{backgroundColor: '#fff', borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'}}
                              />
                              <Line type="monotone" dataKey="avgScore" stroke={COLORS.primary} strokeWidth={3} dot={{r: 4, fill: COLORS.primary}} activeDot={{r: 6}} />
                          </LineChart>
                      </ResponsiveContainer>
                  </div>
              </div>

              {/* Sugestões Rápidas (Mini IA) */}
              <div className="bg-gradient-to-b from-indigo-50 to-white dark:from-gray-800 dark:to-gray-900 p-6 rounded-2xl shadow-sm border border-indigo-100 dark:border-gray-700">
                  <h3 className="font-bold text-lg mb-4 flex items-center gap-2 text-indigo-900 dark:text-white">
                      <i className="fas fa-bolt text-yellow-500"></i> Recomendados Agora
                  </h3>
                  <div className="space-y-3">
                      {allTests.slice(0, 3).map((test: any) => (
                          <div key={test.id} onClick={() => handleViewDetails(test.id)} className="bg-white dark:bg-gray-800 p-3 rounded-xl border border-gray-100 dark:border-gray-700 hover:shadow-md cursor-pointer transition-all flex items-center justify-between group">
                              <div>
                                  <div className="text-xs font-bold text-royal-blue uppercase">{test.subject || 'Geral'}</div>
                                  <div className="font-semibold text-sm dark:text-gray-200 line-clamp-1">{test.title}</div>
                              </div>
                              <i className="fas fa-chevron-right text-gray-300 group-hover:text-royal-blue transition-colors"></i>
                          </div>
                      ))}
                      <button onClick={() => setActiveTab('browse')} className="w-full mt-2 py-2 text-sm text-indigo-600 font-bold hover:bg-indigo-50 rounded-lg transition-colors">
                          Ver Biblioteca Completa
                      </button>
                  </div>
              </div>
          </div>
      </div>
  );

  const renderAnalytics = () => {
    const bloomData = dashboardData?.bloomAnalysis || [];
    const errorData = dashboardData?.errorAnalysis || [];
    const heatmapData = dashboardData?.heatmapData || [];

    return (
      <div className="space-y-8 animate-in fade-in">
          {/* Bloom e Erros */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Radar Chart Bloom */}
              <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
                  <h3 className="font-bold text-lg mb-2 dark:text-white">Taxonomia de Bloom (Habilidades)</h3>
                  <p className="text-sm text-gray-500 mb-6">Entenda seu nível de profundidade cognitiva.</p>
                  <div className="h-[300px]">
                      {bloomData.length > 0 ? (
                        <ResponsiveContainer width="100%" height="100%">
                            <RadarChart cx="50%" cy="50%" outerRadius="80%" data={bloomData}>
                                <PolarGrid gridType="polygon" />
                                <PolarAngleAxis dataKey="skill" tick={{ fill: '#6B7280', fontSize: 12 }} />
                                <PolarRadiusAxis angle={30} domain={[0, 100]} />
                                <Radar name="Você" dataKey="score" stroke={COLORS.primary} fill={COLORS.primary} fillOpacity={0.4} />
                                <Tooltip />
                            </RadarChart>
                        </ResponsiveContainer>
                      ) : (
                          <div className="flex items-center justify-center h-full text-gray-400 text-sm">Dados insuficientes para análise.</div>
                      )}
                  </div>
              </div>

              {/* Pie Chart Erros */}
              <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
                  <h3 className="font-bold text-lg mb-2 dark:text-white">Análise de Causa Raiz de Erros</h3>
                  <p className="text-sm text-gray-500 mb-6">Por que você está perdendo pontos?</p>
                  <div className="h-[300px] flex items-center justify-center">
                      {errorData.length > 0 ? (
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={errorData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={80}
                                    paddingAngle={5}
                                    dataKey="count"
                                >
                                    {errorData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS.chart[index % COLORS.chart.length]} />
                                    ))}
                                </Pie>
                                <Tooltip />
                                <Legend verticalAlign="bottom" height={36}/>
                            </PieChart>
                        </ResponsiveContainer>
                      ) : (
                        <div className="flex items-center justify-center h-full text-gray-400 text-sm">Sem erros registrados ainda. Parabéns?</div>
                      )}
                  </div>
              </div>
          </div>

          {/* Heatmap de Matéria vs Dificuldade */}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
              <h3 className="font-bold text-lg mb-6 dark:text-white">Mapa de Calor: Matéria vs. Dificuldade</h3>
              <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                      <thead>
                          <tr>
                              <th className="text-left p-2 text-gray-500 font-medium">Matéria</th>
                              <th className="p-2 text-gray-500 font-medium">Fácil</th>
                              <th className="p-2 text-gray-500 font-medium">Médio</th>
                              <th className="p-2 text-gray-500 font-medium">Difícil</th>
                          </tr>
                      </thead>
                      <tbody>
                        {heatmapData.length > 0 ? Array.from(new Set(heatmapData.map(d => d.subject))).map((subject) => (
                            <tr key={subject} className="border-t border-gray-50 dark:border-gray-700">
                                <td className="p-3 font-semibold dark:text-gray-200">{subject}</td>
                                {['facil', 'medio', 'dificil'].map((diff) => {
                                    const item = heatmapData.find(d => d.subject === subject && d.difficulty === diff);
                                    const score = item ? item.score : 0;
                                    // Função de cor baseada na nota
                                    let bgClass = "bg-gray-100 dark:bg-gray-700";
                                    let textClass = "text-gray-400";
                                    if (item) {
                                        if (score >= 80) { bgClass = "bg-green-100 dark:bg-green-900/30"; textClass = "text-green-600 dark:text-green-400"; }
                                        else if (score >= 50) { bgClass = "bg-yellow-100 dark:bg-yellow-900/30"; textClass = "text-yellow-600 dark:text-yellow-400"; }
                                        else { bgClass = "bg-red-100 dark:bg-red-900/30"; textClass = "text-red-600 dark:text-red-400"; }
                                    }

                                    return (
                                        <td key={diff} className="p-2 text-center">
                                            <div className={`py-2 px-4 rounded-lg font-bold ${bgClass} ${textClass}`}>
                                                {item ? `${score}%` : '-'}
                                            </div>
                                        </td>
                                    );
                                })}
                            </tr>
                        )) : (
                           <tr><td colSpan={4} className="p-4 text-center text-gray-400">Realize simulados para gerar o mapa de calor.</td></tr> 
                        )}
                      </tbody>
                  </table>
              </div>
          </div>
      </div>
    );
  };

  const renderAIStudy = () => {
    const studyRoute = dashboardData?.studyRoute || [];
    const insights = dashboardData?.insights || [];
    
    return (
        <div className="space-y-8 animate-in fade-in">
            {/* Banner Modo Turbo */}
            <div className="bg-brand-gradient rounded-2xl p-8 text-white shadow-lg relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-6 group">
                <div className="relative z-10">
                    <h2 className="text-3xl font-black italic uppercase tracking-wider mb-2 flex items-center gap-3">
                        <i className="fas fa-bolt text-yellow-300 animate-pulse"></i> Modo Turbo 5&apos;
                    </h2>
                    <p className="text-violet-100 text-lg max-w-lg">
                        Nossa IA identificou seus pontos fracos. Gere um treino flash de 5 minutos focado APENAS no que você precisa.
                    </p>
                </div>
                <button 
                    onClick={handleStartTurbo}
                    disabled={isLoading}
                    className="relative z-10 bg-white text-violet-600 px-8 py-4 rounded-xl font-black text-lg shadow-xl hover:scale-105 active:scale-95 transition-all uppercase tracking-widest disabled:opacity-70 disabled:cursor-not-allowed"
                >
                    {isLoading ? <i className="fas fa-circle-notch fa-spin"></i> : "INICIAR AGORA"}
                </button>
                <div className="absolute inset-0 bg-[url('/assets/images/noise.png')] opacity-10"></div>
                <div className="absolute -right-10 -bottom-20 text-[180px] opacity-10 rotate-12 group-hover:rotate-6 transition-transform duration-700">
                    <i className="fas fa-stopwatch"></i>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Rota de Estudos */}
                <div className="lg:col-span-2">
                    <h3 className="font-bold text-xl mb-4 dark:text-white flex items-center gap-2">
                        <i className="fas fa-route text-royal-blue"></i> Rota de Estudos Dinâmica
                    </h3>
                    <div className="space-y-4">
                        {studyRoute.length > 0 ? studyRoute.map((item, idx) => (
                            <div key={item.id} className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-200 dark:border-gray-700 flex items-start gap-4 hover:shadow-md transition-shadow relative overflow-hidden">
                                <div className={`absolute left-0 top-0 bottom-0 w-1 ${item.priority === 'high' ? 'bg-red-500' : item.priority === 'medium' ? 'bg-yellow-500' : 'bg-blue-400'}`}></div>
                                <div className="mt-1 bg-gray-100 dark:bg-gray-700 w-10 h-10 rounded-full flex items-center justify-center text-gray-600 dark:text-gray-300">
                                    <i className={`fas ${item.type === 'video' ? 'fa-play' : item.type === 'practice' ? 'fa-dumbbell' : 'fa-book'}`}></i>
                                </div>
                                <div className="flex-1">
                                    <div className="flex justify-between items-start">
                                        <h4 className="font-bold text-lg dark:text-gray-200">{item.title}</h4>
                                        <span className="text-xs font-bold bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded text-gray-500">
                                            <i className="fas fa-clock mr-1"></i>{item.estimated_time}
                                        </span>
                                    </div>
                                    <p className="text-sm text-royal-blue font-medium mt-1"><i className="fas fa-magic mr-1"></i> {item.reason}</p>
                                </div>
                                <button className="self-center bg-gray-50 hover:bg-royal-blue hover:text-white text-gray-400 p-3 rounded-lg transition-colors">
                                    <i className="fas fa-arrow-right"></i>
                                </button>
                            </div>
                        )) : (
                            <div className="p-8 text-center text-gray-400 bg-gray-50 dark:bg-gray-800 rounded-xl border border-dashed border-gray-200 dark:border-gray-700">
                                <i className="fas fa-check-circle text-4xl mb-2 text-green-400"></i>
                                <p>Tudo em dia! Sem pontos fracos críticos detectados no momento.</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Insights AI */}
                <div>
                    <h3 className="font-bold text-xl mb-4 dark:text-white flex items-center gap-2">
                        <i className="fas fa-brain text-purple-500"></i> Insights
                    </h3>
                    <div className="space-y-4">
                        {insights.length > 0 ? insights.map((insight) => (
                            <div key={insight.id} className="bg-purple-50 dark:bg-purple-900/20 p-5 rounded-xl border border-purple-100 dark:border-purple-800">
                                <div className="flex items-center gap-2 mb-2">
                                    <i className={`fas ${insight.type === 'pattern' ? 'fa-fingerprint' : 'fa-exclamation-triangle'} text-purple-600 dark:text-purple-400`}></i>
                                    <span className="text-xs font-bold uppercase text-purple-600 dark:text-purple-400">{insight.type === 'pattern' ? 'Padrão Identificado' : 'Ponto de Atenção'}</span>
                                </div>
                                <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed font-medium">
                                    &quot;{insight.message}&quot;
                                </p>
                            </div>
                        )) : (
                            <div className="text-sm text-gray-400 text-center p-4">A IA está aprendendo com seus resultados...</div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
  };

  const renderBrowse = () => (
      <div className="space-y-6 animate-in fade-in">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
              <h2 className="text-xl font-bold dark:text-white"><i className="fas fa-search mr-2 text-royal-blue"></i> Explorar Simulados</h2>
              <div className="flex gap-2 w-full md:w-auto">
                  <select className="flex-1 p-2 border rounded-lg bg-gray-50 dark:bg-gray-700 dark:border-gray-600 text-sm focus:ring-2 focus:ring-royal-blue outline-none">
                      <option>Todas as Matérias</option>
                      <option>Matemática</option>
                      <option>Português</option>
                      <option>Ciências da Natureza</option>
                  </select>
                  <select className="flex-1 p-2 border rounded-lg bg-gray-50 dark:bg-gray-700 dark:border-gray-600 text-sm focus:ring-2 focus:ring-royal-blue outline-none">
                      <option>Dificuldade</option>
                      <option>Fácil</option>
                      <option>Médio</option>
                      <option>Difícil</option>
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
                      <p className="text-gray-500 font-medium">Nenhum simulado encontrado com estes filtros.</p>
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
              <div className="relative">
                  <div className="w-20 h-20 border-4 border-gray-200 rounded-full"></div>
                  <div className="w-20 h-20 border-4 border-royal-blue border-t-transparent rounded-full animate-spin absolute top-0 left-0"></div>
              </div>
              <p className="text-gray-500 font-bold mt-4 animate-pulse">Preparando ambiente de prova...</p>
          </div>
      );
  }

  return (
    <div className="w-full max-w-7xl mx-auto p-4 sm:p-6 pb-20">
        <TabsHeader activeTab={activeTab} onChange={setActiveTab} />
        
        {activeTab === 'overview' && renderOverview()}
        {activeTab === 'analytics' && renderAnalytics()}
        {activeTab === 'ai_study' && renderAIStudy()}
        {activeTab === 'browse' && renderBrowse()}
        {activeTab === 'results' && <ResultsView attempts={dashboardData?.recentAttempts || []} onBack={() => setActiveTab('overview')} />}
    </div>
  );
}