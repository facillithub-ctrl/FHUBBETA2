"use client";

import React, { useState, useMemo } from "react";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell,
} from "recharts";
import AttemptView from "./AttemptView";
import TestDetailView from "./TestDetailView";
import ResultsView from "./ResultsView";
import Image from "next/image";
import { 
    getTestWithQuestions, 
    type TestWithQuestions, 
    getQuickTest, 
    getStudentResultsHistory,
    type StudentCampaign,
    submitCampaignConsent
} from '../actions';
import { useToast } from "@/contexts/ToastContext";

// --- TIPOS ---
type TestCardInfo = {
  id: string;
  title: string;
  subject: string | null;
  question_count: number;
  duration_minutes: number;
  difficulty: 'Fácil' | 'Médio' | 'Difícil';
  avg_score: number;
  total_attempts: number;
  points: number;
  test_type: 'avaliativo' | 'pesquisa';
  hasAttempted: boolean;
  cover_image_url?: string | null;
  collection?: string | null;
  class_id?: string | null;
  is_campaign_test?: boolean;
};

type KnowledgeTest = { id: string; title: string; subject: string | null; questions: { count: number }[]; };
type PerformanceData = { materia: string; nota: number; simulados: number };
type RecentAttempt = { tests: { title: string; subject: string | null }; completed_at: string; score: number | null; };
type DashboardData = {
  stats: { simuladosFeitos: number; mediaGeral: number; taxaAcerto: number; tempoMedio: number; };
  performanceBySubject: PerformanceData[];
  recentAttempts: RecentAttempt[];
};
type AttemptHistory = { id: string; completed_at: string | null; score: number | null; tests: { title: string | null; subject: string | null; questions: { count: number }[] | null; } | null; };

type Props = {
  dashboardData: DashboardData | null;
  globalTests: TestCardInfo[];
  classTests: TestCardInfo[];
  knowledgeTests: KnowledgeTest[];
  campaigns: StudentCampaign[];
  consentedCampaignIds: string[];
};

// --- COMPONENTES VISUAIS ---

const TestHero = ({ onQuickTest }: { onQuickTest: () => void }) => (
  <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-royal-blue to-brand-purple text-white p-8 mb-8 shadow-xl">
    <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
      <div>
        <span className="inline-block px-3 py-1 bg-white/10 backdrop-blur-md rounded-full text-xs font-bold border border-white/20 mb-3 text-brand-green">
          <i className="fas fa-bolt mr-1"></i> Modo Desafio
        </span>
        <h1 className="text-3xl md:text-4xl font-black mb-2 tracking-tight">Domine o Conhecimento 🧠</h1>
        <p className="text-white/90 text-lg max-w-xl leading-relaxed">
          Pratique com simulados inteligentes, acompanhe sua evolução e conquiste sua aprovação.
        </p>
      </div>
      <button 
          onClick={onQuickTest}
          className="group bg-brand-green text-brand-purple font-black py-3 px-8 rounded-2xl shadow-lg hover:bg-white hover:scale-105 transition-all flex items-center gap-3"
      >
          <i className="fas fa-play text-xl"></i>
          <span>Teste Rápido</span>
      </button>
    </div>
    {/* Elementos de Fundo */}
    <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none"></div>
    <div className="absolute bottom-0 left-20 w-32 h-32 bg-brand-green/10 rounded-full blur-2xl pointer-events-none"></div>
  </div>
);

const StatCard = ({ label, value, unit, icon, color }: { label: string, value: string | number, unit?: string, icon: string, color: string }) => (
  <div className="glass-card p-5 flex items-center gap-4 h-full group hover:-translate-y-1 transition-transform duration-300">
     <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-xl ${color} bg-opacity-10`}>
        <i className={`fas ${icon} ${color.replace('bg-', 'text-')}`}></i>
     </div>
     <div>
        <p className="text-xs text-text-secondary font-bold uppercase tracking-wider">{label}</p>
        <h3 className="text-2xl font-black text-text-primary dark:text-white">
            {value}<span className="text-sm font-medium text-text-muted ml-1">{unit}</span>
        </h3>
     </div>
  </div>
);

// Card de Teste Estilo "Netflix/Cover"
const TestCard = ({ test, onStart }: { test: TestCardInfo, onStart: () => void }) => {
    // Gera um gradiente baseado na matéria se não houver capa
    const subjectColor = useMemo(() => {
        const colors: any = {
            'Matemática': 'from-blue-600 to-indigo-900',
            'Português': 'from-orange-500 to-red-700',
            'História': 'from-yellow-600 to-orange-800',
            'Geografia': 'from-emerald-600 to-teal-800',
            'Física': 'from-purple-600 to-fuchsia-900',
            'Química': 'from-cyan-600 to-blue-800',
            'Biologia': 'from-green-500 to-emerald-700',
            'Inglês': 'from-red-500 to-blue-600',
        };
        return colors[test.subject || ''] || 'from-gray-700 to-gray-900';
    }, [test.subject]);

    return (
        <div 
            onClick={onStart}
            className="group relative bg-white dark:bg-dark-card rounded-2xl overflow-hidden border border-gray-100 dark:border-gray-800 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1 cursor-pointer flex flex-col h-full"
        >
            {/* Capa */}
            <div className={`relative h-40 w-full bg-gradient-to-br ${subjectColor}`}>
                {test.cover_image_url && (
                    <Image 
                        src={test.cover_image_url} 
                        alt={test.title} 
                        fill 
                        className="object-cover opacity-90 group-hover:scale-105 transition-transform duration-500" 
                    />
                )}
                <div className="absolute top-3 left-3 z-10">
                     <span className="px-2 py-1 bg-black/40 backdrop-blur-md text-white text-[10px] font-bold rounded-lg uppercase tracking-wider border border-white/10">
                        {test.subject || 'Geral'}
                     </span>
                </div>
                {test.hasAttempted && (
                    <div className="absolute inset-0 bg-black/60 flex items-center justify-center backdrop-blur-[2px]">
                        <span className="flex items-center gap-2 text-white font-bold bg-green-600/90 px-4 py-2 rounded-full shadow-lg">
                            <i className="fas fa-check-circle"></i> Concluído
                        </span>
                    </div>
                )}
            </div>

            {/* Conteúdo */}
            <div className="p-5 flex flex-col flex-grow">
                <div className="flex justify-between items-start mb-2">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded text-white ${
                        test.test_type === 'pesquisa' ? 'bg-pink-500' : 'bg-royal-blue'
                    }`}>
                        {test.test_type === 'pesquisa' ? 'Pesquisa' : 'Simulado'}
                    </span>
                    {test.difficulty && (
                        <div className="flex gap-0.5">
                            {[...Array(3)].map((_, i) => (
                                <div key={i} className={`w-1.5 h-1.5 rounded-full ${
                                    i < (test.difficulty === 'Fácil' ? 1 : test.difficulty === 'Médio' ? 2 : 3) 
                                    ? 'bg-yellow-400' : 'bg-gray-200 dark:bg-gray-700'
                                }`}></div>
                            ))}
                        </div>
                    )}
                </div>

                <h3 className="font-bold text-text-primary dark:text-white mb-1 leading-snug line-clamp-2 group-hover:text-brand-purple transition-colors">
                    {test.title}
                </h3>
                
                <div className="mt-auto pt-4 flex items-center justify-between text-xs text-text-secondary border-t border-gray-100 dark:border-gray-800">
                    <span className="flex items-center gap-1.5"><i className="fas fa-list-ol"></i> {test.question_count}qs</span>
                    <span className="flex items-center gap-1.5"><i className="fas fa-clock"></i> {test.duration_minutes}min</span>
                </div>
            </div>
        </div>
    );
};

const PerformanceChart = ({ data }: { data: PerformanceData[] }) => {
    if (!data || data.length === 0) return null;
    return (
        <div className="bg-white dark:bg-dark-card rounded-3xl p-6 shadow-sm border border-gray-100 dark:border-gray-800 h-full flex flex-col">
            <h3 className="font-bold text-lg text-text-primary dark:text-white mb-6 flex items-center gap-2">
                <i className="fas fa-chart-bar text-brand-purple"></i> Desempenho por Matéria
            </h3>
            <div className="flex-grow min-h-[250px]">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={data} layout="vertical" margin={{ left: 0 }}>
                        <XAxis type="number" hide domain={[0, 100]} />
                        <YAxis type="category" dataKey="materia" width={90} tick={{ fill: '#9CA3AF', fontSize: 11, fontWeight: 600 }} axisLine={false} tickLine={false} />
                        <Tooltip 
                            cursor={{ fill: 'rgba(0,0,0,0.05)' }}
                            contentStyle={{ backgroundColor: '#1A1A1D', borderColor: '#333', borderRadius: '12px', color: '#fff' }}
                        />
                        <Bar dataKey="nota" barSize={12} radius={[0, 4, 4, 0]}>
                             {data.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.nota >= 70 ? '#07F49E' : entry.nota >= 50 ? '#5E55F9' : '#EF4444'} />
                            ))}
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}

// --- COMPONENTE PRINCIPAL ---

export default function StudentTestDashboard({ dashboardData, globalTests, classTests, knowledgeTests, campaigns, consentedCampaignIds }: Props) {
  const [view, setView] = useState<"dashboard" | "browse" | "attempt" | "detail" | "results">("dashboard");
  const [selectedTest, setSelectedTest] = useState<TestWithQuestions | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [resultsHistory, setResultsHistory] = useState<AttemptHistory[]>([]);
  const [filter, setFilter] = useState<'all' | 'class' | 'global' | 'campaign'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  
  const [consentModal, setConsentModal] = useState<{isOpen: boolean, testId?: string, campaignId?: string}>({isOpen: false});
  const { addToast } = useToast();
  const myConsentedCampaignIds = useMemo(() => new Set(consentedCampaignIds), [consentedCampaignIds]);

  // --- PREPARAÇÃO DE DADOS ---
  const allCampaignTests = useMemo(() => {
    if (!campaigns || !Array.isArray(campaigns)) return [];
    return campaigns.flatMap(c => c.tests.map(t => {
        const baseTest = [...globalTests, ...classTests].find(gt => gt.id === t.id);
        if (!baseTest) return null;
        return { ...baseTest, is_campaign_test: true, campaignId: c.campaign_id };
    })).filter(Boolean) as (TestCardInfo & { campaignId: string })[];
  }, [campaigns, globalTests, classTests]);

  const filteredTests = useMemo(() => {
        const classTestsWithType = classTests.map(t => ({...t, type: 'class'}));
        const globalTestsWithType = globalTests.map(t => ({...t, type: 'global'}));
        const campaignTestsWithType = allCampaignTests.map(t => ({...t, type: 'campaign'}));
        let testsToShow: any[] = [];

        if (filter === 'all' || filter === 'class') testsToShow.push(...classTestsWithType);
        if (filter === 'all' || filter === 'global') testsToShow.push(...globalTestsWithType);
        if (filter === 'all' || filter === 'campaign') testsToShow.push(...campaignTestsWithType);

        if (searchQuery) {
            testsToShow = testsToShow.filter(t => t.title.toLowerCase().includes(searchQuery.toLowerCase()) || t.subject?.toLowerCase().includes(searchQuery.toLowerCase()));
        }
        // Deduplicação
        const uniqueTests = new Map();
        testsToShow.forEach(test => uniqueTests.set(test.id, test));
        return Array.from(uniqueTests.values());
  }, [classTests, globalTests, allCampaignTests, filter, searchQuery]);

  // --- HANDLERS ---
  const handleStartTest = (testData: TestWithQuestions) => { setSelectedTest(testData); setView("attempt"); };
  const handleFinishAttempt = () => { setView("dashboard"); window.location.reload(); };
  const handleBackToDashboard = () => { setView("dashboard"); setSelectedTest(null); };

  const handleInitiateTest = async (testId: string, campaignId?: string) => {
    if (campaignId && !myConsentedCampaignIds.has(campaignId)) {
        setConsentModal({ isOpen: true, testId, campaignId });
        return;
    }
    setIsLoading(true);
    const { data } = await getTestWithQuestions(testId);
    if (data) {
        if (data.hasAttempted) {
            addToast({ title: "Já Concluído", message: "Você já realizou este teste.", type: "info" });
        } else {
            handleStartTest(data);
        }
    } else {
        addToast({ title: "Erro", message: "Falha ao carregar teste.", type: "error" });
    }
    setIsLoading(false);
  };

  const handleConfirmConsent = async () => {
      const { testId, campaignId } = consentModal;
      if (!testId || !campaignId) return;
      setConsentModal({ isOpen: false });
      await submitCampaignConsent(campaignId);
      myConsentedCampaignIds.add(campaignId);
      handleInitiateTest(testId, campaignId);
  };

  const handleStartQuickTest = async () => { 
      setIsLoading(true); 
      const { data, error } = await getQuickTest(); 
      if (data) handleStartTest(data);
      else addToast({ title: "Erro", message: error, type: "error" });
      setIsLoading(false); 
  };

  const handleViewResults = async () => {
      setIsLoading(true);
      const { data } = await getStudentResultsHistory();
      if (data) {
          // @ts-ignore
          setResultsHistory(data.map(d => ({...d, tests: Array.isArray(d.tests) ? d.tests[0] : d.tests})));
          setView("results");
      }
      setIsLoading(false);
  };

  // --- SUB-VIEWS ---

  const TestBrowser = () => (
    <div className="animate-fade-in pb-20">
        {/* Barra de Controle */}
        <div className="sticky top-4 z-20 bg-white/80 dark:bg-black/60 backdrop-blur-xl p-3 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm mb-8 flex flex-col md:flex-row gap-4 items-center">
             <div className="relative flex-grow w-full md:w-auto">
                 <i className="fas fa-search absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"></i>
                 <input 
                    type="text" 
                    placeholder="Buscar por título ou matéria..." 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-transparent border-none focus:ring-0 text-sm text-text-primary dark:text-white placeholder-gray-400"
                 />
             </div>
             <div className="flex gap-2 overflow-x-auto w-full md:w-auto pb-2 md:pb-0 no-scrollbar">
                 {['all', 'class', 'campaign', 'global'].map(opt => (
                     <button
                        key={opt}
                        onClick={() => setFilter(opt as any)}
                        className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                            filter === opt 
                            ? 'bg-brand-purple text-white shadow-lg shadow-brand-purple/20' 
                            : 'bg-gray-100 dark:bg-gray-800 text-text-secondary hover:bg-gray-200 dark:hover:bg-gray-700'
                        }`}
                     >
                         {opt === 'all' ? 'Todos' : opt === 'class' ? 'Minha Turma' : opt === 'campaign' ? 'Campanhas' : 'Globais'}
                     </button>
                 ))}
             </div>
        </div>

        {filteredTests.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredTests.map(test => (
                    <TestCard 
                        key={test.id} 
                        test={test} 
                        onStart={() => handleInitiateTest(test.id, (test as any).campaignId)} 
                    />
                ))}
            </div>
        ) : (
            <div className="text-center py-20">
                <div className="inline-block p-6 rounded-full bg-gray-50 dark:bg-gray-800 mb-4">
                    <i className="fas fa-search text-3xl text-gray-300"></i>
                </div>
                <p className="text-text-muted">Nenhum teste encontrado.</p>
            </div>
        )}
    </div>
  );

  const MainDashboard = () => (
    <div className="animate-fade-in pb-20">
      <TestHero onQuickTest={handleStartQuickTest} />

      {!dashboardData ? (
         <div className="text-center py-16 glass-card">
             <p className="text-lg text-text-secondary mb-4">Ainda não tens dados suficientes.</p>
             <button onClick={() => setView("browse")} className="text-brand-purple font-bold hover:underline">Explorar Testes Disponíveis</button>
         </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Métricas Bento Grid */}
          <div className="lg:col-span-3"><StatCard label="Simulados" value={dashboardData.stats.simuladosFeitos} icon="fa-file-alt" color="bg-blue-500 text-white" /></div>
          <div className="lg:col-span-3"><StatCard label="Média Geral" value={dashboardData.stats.mediaGeral.toFixed(0)} unit="%" icon="fa-chart-line" color="bg-purple-500 text-white" /></div>
          <div className="lg:col-span-3"><StatCard label="Acertos" value={dashboardData.stats.taxaAcerto.toFixed(0)} unit="%" icon="fa-check-circle" color="bg-green-500 text-white" /></div>
          <div className="lg:col-span-3"><StatCard label="Tempo/Prova" value={(dashboardData.stats.tempoMedio / 60).toFixed(0)} unit="min" icon="fa-clock" color="bg-orange-500 text-white" /></div>

          {/* Gráfico Principal */}
          <div className="lg:col-span-8 min-h-[350px]">
             <PerformanceChart data={dashboardData.performanceBySubject} />
          </div>

          {/* Ações Rápidas e Campanhas */}
          <div className="lg:col-span-4 flex flex-col gap-6">
              {campaigns && campaigns.length > 0 && (
                  <div className="bg-gradient-to-br from-gray-900 to-black text-white rounded-3xl p-6 shadow-lg relative overflow-hidden">
                      <div className="relative z-10">
                          <h3 className="font-bold mb-4 flex items-center gap-2"><i className="fas fa-trophy text-yellow-400"></i> Campanhas</h3>
                          <div className="space-y-3">
                              {campaigns.slice(0, 2).map(c => (
                                  <div key={c.campaign_id} className="bg-white/10 p-3 rounded-xl hover:bg-white/20 transition-colors cursor-pointer" onClick={() => setView("browse")}>
                                      <p className="font-bold text-sm truncate">{c.title}</p>
                                      <p className="text-xs text-gray-400">{c.tests.length} testes disponíveis</p>
                                  </div>
                              ))}
                          </div>
                      </div>
                      <div className="absolute top-0 right-0 w-32 h-32 bg-brand-purple blur-3xl opacity-30"></div>
                  </div>
              )}
              
              <div className="glass-card p-6 flex-1">
                  <h3 className="font-bold mb-4 dark:text-white">Atalhos</h3>
                  <div className="grid gap-3">
                      <button onClick={() => setView("browse")} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-left">
                          <span className="text-sm font-bold text-text-primary dark:text-white"><i className="fas fa-th-large mr-2 text-brand-purple"></i> Ver Todos os Testes</span>
                          <i className="fas fa-chevron-right text-xs text-gray-400"></i>
                      </button>
                      <button onClick={handleViewResults} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-left">
                          <span className="text-sm font-bold text-text-primary dark:text-white"><i className="fas fa-history mr-2 text-brand-purple"></i> Histórico de Notas</span>
                          <i className="fas fa-chevron-right text-xs text-gray-400"></i>
                      </button>
                  </div>
              </div>
          </div>
          
          {/* Knowledge Tests Suggestion */}
          {knowledgeTests && knowledgeTests.length > 0 && (
             <div className="lg:col-span-12 mt-4">
                 <div className="flex justify-between items-center mb-4">
                     <h3 className="font-bold text-lg text-text-primary dark:text-white">Pratique por Matéria</h3>
                 </div>
                 <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                     {knowledgeTests.slice(0, 5).map(kt => (
                         <button 
                            key={kt.id} 
                            onClick={() => handleInitiateTest(kt.id)}
                            className="p-4 bg-white dark:bg-dark-card border border-gray-100 dark:border-gray-800 rounded-2xl hover:border-brand-purple hover:shadow-md transition-all text-left"
                         >
                             <p className="text-xs font-bold text-text-secondary uppercase mb-1">{kt.subject}</p>
                             <p className="font-bold text-sm text-text-primary dark:text-white truncate">{kt.title}</p>
                         </button>
                     ))}
                 </div>
             </div>
          )}
        </div>
      )}
    </div>
  );

  // --- RENDERIZAÇÃO ---
  const renderContent = () => {
    if (isLoading) return <div className="h-96 flex items-center justify-center"><div className="animate-spin text-brand-purple text-4xl"><i className="fas fa-circle-notch"></i></div></div>;
    
    switch (view) {
      case "browse": return ( <> <button onClick={handleBackToDashboard} className="mb-4 text-sm font-bold text-text-secondary hover:text-brand-purple flex items-center gap-2"><i className="fas fa-arrow-left"></i> Voltar</button> <TestBrowser /> </> );
      case "attempt": if (!selectedTest) { setView("browse"); return null; } return <AttemptView test={selectedTest} onFinish={handleFinishAttempt} />;
      case "detail": if (!selectedTest) { setView("browse"); return null; } return <TestDetailView test={selectedTest} onBack={() => setView("browse")} onStartTest={handleStartTest} />;
      case "results": return <ResultsView attempts={resultsHistory} onBack={handleBackToDashboard} />;
      case "dashboard": default: return <MainDashboard />;
    }
  };

  // Modal de Consentimento (Campanha)
  const ConsentModal = () => (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[200] flex items-center justify-center p-4 animate-fade-in">
         <div className="bg-white dark:bg-dark-card rounded-3xl p-6 max-w-md w-full shadow-2xl border border-gray-200 dark:border-gray-700">
             <h2 className="text-xl font-bold mb-4 dark:text-white">Termos da Campanha</h2>
             <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-xl text-sm text-text-secondary mb-6">
                 <p className="mb-2">Ao iniciar, você concorda:</p>
                 <ul className="list-disc pl-5 space-y-1">
                     <li>O teste é de <strong>tentativa única</strong>.</li>
                     <li>Não é permitido sair da tela (monitoramento ativo).</li>
                     <li>Seu resultado entrará no ranking da campanha.</li>
                 </ul>
             </div>
             <div className="flex justify-end gap-3">
                 <button onClick={() => setConsentModal({isOpen: false})} className="px-4 py-2 rounded-xl text-sm font-bold text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800">Cancelar</button>
                 <button onClick={handleConfirmConsent} className="px-6 py-2 rounded-xl text-sm font-bold bg-brand-purple text-white hover:bg-opacity-90">Aceitar e Começar</button>
             </div>
         </div>
    </div>
  );

  return <div className="max-w-7xl mx-auto">{consentModal.isOpen && <ConsentModal />}{renderContent()}</div>;
}