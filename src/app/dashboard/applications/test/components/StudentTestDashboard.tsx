"use client";

import React, { useState, useMemo } from "react";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell,
} from "recharts";
import AvailableTestCard from "./AvailableTestCard";
import SurveyCard from "./SurveyCard";
import AttemptView from "./AttemptView";
import TestDetailView from "./TestDetailView";
import ResultsView from "./ResultsView";
import Link from "next/link";
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

type KnowledgeTest = {
  id: string;
  title: string;
  subject: string | null;
  questions: { count: number }[];
};

type PerformanceData = { materia: string; nota: number; simulados: number };

type RecentAttempt = {
  tests: { title: string; subject: string | null };
  completed_at: string;
  score: number | null;
};

type DashboardData = {
  stats: {
    simuladosFeitos: number;
    mediaGeral: number;
    taxaAcerto: number;
    tempoMedio: number;
  };
  performanceBySubject: PerformanceData[];
  recentAttempts: RecentAttempt[];
};

type AttemptHistory = {
  id: string;
  completed_at: string | null;
  score: number | null;
  tests: {
    title: string | null;
    subject: string | null;
    questions: { count: number }[] | null;
  } | null;
};

type Props = {
  dashboardData: DashboardData | null;
  globalTests: TestCardInfo[];
  classTests: TestCardInfo[];
  knowledgeTests: KnowledgeTest[];
  campaigns: StudentCampaign[];
  consentedCampaignIds: string[];
};

// --- SUB-COMPONENTES CORRIGIDOS ---

const CampaignConsentModal = ({ onConfirm, onCancel }: { onConfirm: () => void, onCancel: () => void }) => ( 
    <div className="fixed inset-0 bg-black/60 z-[200] flex items-center justify-center p-4"> 
        <div className="bg-white dark:bg-dark-card p-6 rounded-lg shadow-xl max-w-lg w-full"> 
            <h2 className="text-2xl font-bold mb-4 dark:text-white">Termos da Campanha</h2> 
            <div className="text-sm text-gray-600 dark:text-gray-300 max-h-60 overflow-y-auto pr-2 mb-6"> 
                <p className="mb-2">Ao participar desta campanha, você concorda com as seguintes regras:</p> 
                <ul className="list-disc pl-5 space-y-1"> 
                    <li><strong>Tentativa Única:</strong> Cada simulado só pode ser realizado uma vez.</li> 
                    <li><strong>Antifraude:</strong> Não é permitido copiar/colar conteúdo ou sair da tela do teste.</li> 
                    <li><strong>Uso de Dados:</strong> Seus resultados serão usados para o ranking.</li> 
                </ul> 
                <p className="mt-4">Para mais detalhes, consulte os <a href="/recursos/termos-campanha" target="_blank" className="text-royal-blue underline">Termos e Condições</a>.</p> 
            </div> 
            <div className="flex justify-end gap-4"> 
                <button onClick={onCancel} className="bg-gray-200 text-gray-800 font-bold py-2 px-4 rounded-lg hover:bg-gray-300">Cancelar</button> 
                <button onClick={onConfirm} className="bg-royal-blue text-white font-bold py-2 px-4 rounded-lg hover:bg-opacity-90">Aceito e quero começar</button> 
            </div> 
        </div> 
    </div> 
);

const CampaignCard = ({ campaign, onStartTest }: { campaign: StudentCampaign, onStartTest: (testId: string, campaignId: string) => void }) => { 
    const endDate = new Date(campaign.end_date); 
    const now = new Date(); 
    const diffTime = endDate.getTime() - now.getTime(); 
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
    
    return ( 
        <div className="glass-card p-6 flex flex-col"> 
            <div className="flex justify-between items-start mb-2"> 
                {/* Truncate adicionado para evitar quebra em títulos longos */}
                <h3 className="text-xl font-bold dark:text-white truncate pr-2 flex-1" title={campaign.title}>{campaign.title}</h3> 
                <span className="text-xs font-semibold bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full flex-shrink-0"> 
                    {diffDays > 0 ? `Termina em ${diffDays} dias` : 'Termina hoje'} 
                </span> 
            </div> 
            <p className="text-sm text-dark-text-muted mb-4 line-clamp-2">{campaign.description}</p> 
            <div className="mb-4"> 
                <Link href="/recursos/termos-campanha" target="_blank" className="text-xs text-royal-blue underline font-semibold hover:opacity-80"> 
                    Regras da campanha 
                </Link> 
            </div> 
            <div className="space-y-2 mt-auto"> 
                {campaign.tests?.map(test => ( 
                    <div key={test.id} className="flex justify-between items-center p-3 rounded-md bg-white/50 dark:bg-white/5 border border-white/10 hover:bg-white/80 dark:hover:bg-white/10 transition-colors"> 
                        <div className="min-w-0 flex-1 mr-2"> 
                            <p className="font-semibold text-sm dark:text-white truncate">{test.title}</p> 
                            <p className="text-xs text-dark-text-muted">{test.question_count} questões</p> 
                        </div> 
                        <button onClick={() => onStartTest(test.id, campaign.campaign_id)} className="bg-royal-blue text-white text-xs font-bold py-1.5 px-4 rounded-md hover:bg-opacity-90 flex-shrink-0"> 
                            Iniciar 
                        </button> 
                    </div> 
                ))} 
            </div> 
        </div> 
    ); 
};

const StatCard = ({ title, value, icon, unit }: { title: string; value: string | number; icon: string, unit?: string }) => ( 
    <div className="glass-card p-5 flex items-center justify-between h-full"> 
        <div className="min-w-0"> 
            <p className="text-sm text-dark-text-muted truncate mb-1">{title}</p> 
            <p className="text-2xl font-bold text-dark-text dark:text-white truncate">
                {value}<span className="text-base ml-1 font-normal text-dark-text-muted">{unit}</span>
            </p> 
        </div> 
        <div className="text-3xl text-lavender-blue ml-3 flex-shrink-0"> 
            <i className={`fas ${icon}`}></i> 
        </div> 
    </div> 
);

const ActionCard = ({ title, description, icon, actionText, onClick }: { title: string; description: string; icon: string; actionText: string; onClick: () => void;}) => ( 
    <div className="glass-card p-5 flex items-center gap-4 hover:border-royal-blue/30 transition-colors cursor-pointer group" onClick={onClick}> 
        <div className="bg-royal-blue/10 text-royal-blue w-12 h-12 flex items-center justify-center rounded-xl text-xl group-hover:bg-royal-blue group-hover:text-white transition-colors flex-shrink-0"> 
            <i className={`fas ${icon}`}></i> 
        </div> 
        <div className="min-w-0"> 
            <h3 className="font-bold text-dark-text dark:text-white truncate">{title}</h3> 
            <p className="text-sm text-dark-text-muted truncate">{description}</p> 
            <p className="text-sm font-bold text-royal-blue mt-1 group-hover:underline"> {actionText} </p> 
        </div> 
    </div> 
);

const KnowledgeTestWidget = ({ test, onStart }: { test: KnowledgeTest; onStart: (testId: string) => void; }) => ( 
    <div className="glass-card p-6 flex flex-col h-full bg-gradient-to-br from-purple-500/10 to-indigo-500/10 border-purple-500/20"> 
        <h3 className="font-bold mb-2 dark:text-white">Teste seu Conhecimento</h3> 
        <p className="text-lg font-semibold text-dark-text dark:text-white flex-grow line-clamp-2">{test.title}</p> 
        <p className="text-xs text-dark-text-muted mb-4 mt-2">{test.questions[0]?.count || 0} questões • {test.subject}</p> 
        <button onClick={() => onStart(test.id)} className="mt-auto bg-white/80 dark:bg-white/90 text-royal-blue font-bold py-2 px-6 rounded-lg hover:bg-white transition-transform hover:scale-105 w-full shadow-sm"> 
            Começar 
        </button> 
    </div> 
);

const subjectColors: { [key: string]: string } = { Matemática: "#8b5cf6", Física: "#ec4899", Química: "#3b82f6", Biologia: "#22c55e", Português: "#f97316", Default: "#6b7280" };

const PerformanceChart = ({ data }: { data: PerformanceData[] }) => ( 
    <div className="glass-card p-6 h-[350px]">
        <h3 className="font-bold mb-6 text-dark-text dark:text-white">Performance por Matéria</h3>
        <ResponsiveContainer width="100%" height="85%">
            <BarChart data={data} layout="vertical" margin={{ top: 0, right: 30, left: 40, bottom: 0 }}>
                <XAxis type="number" hide domain={[0, 100]} />
                <YAxis type="category" dataKey="materia" axisLine={false} tickLine={false} width={90} tick={{ fill: "#a0a0a0", fontSize: 12 }} />
                <Tooltip 
                    cursor={{ fill: "rgba(255, 255, 255, 0.05)" }} 
                    contentStyle={{ backgroundColor: '#1A1A1D', borderColor: '#2c2c31', borderRadius: '8px', color: '#fff' }}
                />
                <Bar dataKey="nota" barSize={12} radius={[0, 4, 4, 0]}>
                    {data.map((entry) => (<Cell key={`cell-${entry.materia}`} fill={subjectColors[entry.materia] || subjectColors.Default} />))}
                </Bar>
            </BarChart>
        </ResponsiveContainer>
    </div> 
);

const RecentTests = ({ data }: { data: RecentAttempt[] }) => { 
    const getIconForSubject = (subject: string | null) => { 
        switch (subject) { case "Matemática": return "∫"; case "Física": return "⚡️"; case "Química": return "⚗️"; default: return "📝"; } 
    }; 
    
    return ( 
        <div className="glass-card p-6 h-full flex flex-col">
            <h3 className="font-bold mb-4 text-dark-text dark:text-white">Últimos Simulados</h3>
            <div className="space-y-3 flex-1 overflow-y-auto pr-1 custom-scrollbar">
                {data.map((simulado, i) => { 
                    const test = simulado.tests; 
                    return (
                        <div key={i} className={`p-3 rounded-lg flex items-center justify-between bg-white/50 dark:bg-white/5 border border-gray-100 dark:border-white/10`}>
                            <div className="flex items-center gap-3 min-w-0 flex-1 mr-2">
                                <div className="text-xl w-8 h-8 flex items-center justify-center bg-gray-100 dark:bg-white/10 rounded-full flex-shrink-0">
                                    {getIconForSubject(test.subject)}
                                </div>
                                <div className="min-w-0">
                                    <p className="font-semibold text-sm text-dark-text dark:text-white truncate" title={test.title}>{test.title}</p>
                                    <p className="text-xs text-dark-text-muted">{new Date(simulado.completed_at!).toLocaleDateString("pt-BR", { day: "2-digit", month: "short" })}</p>
                                </div>
                            </div>
                            <div className="text-right flex-shrink-0">
                                <p className="font-bold text-lg text-lavender-blue">{simulado.score?.toFixed(0)}%</p>
                                <p className="text-[10px] text-dark-text-muted uppercase">acertos</p>
                            </div>
                        </div> 
                    ); 
                })}
                {data.length === 0 && <p className="text-sm text-gray-500 text-center py-4">Nenhum simulado recente.</p>}
            </div>
        </div> 
    ); 
};

// --- COMPONENTE PRINCIPAL ---
export default function StudentTestDashboard({ dashboardData, globalTests, classTests, knowledgeTests, campaigns, consentedCampaignIds }: Props) {
  const [view, setView] = useState<"dashboard" | "browse" | "attempt" | "detail" | "results">("dashboard");
  const [selectedTest, setSelectedTest] = useState<TestWithQuestions | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [resultsHistory, setResultsHistory] = useState<AttemptHistory[]>([]);
  const [filter, setFilter] = useState<'all' | 'class' | 'global' | 'campaign'>('all');

  const [consentModal, setConsentModal] = useState<{isOpen: boolean, testId?: string, campaignId?: string}>({isOpen: false});

  const { addToast } = useToast();

  const myConsentedCampaignIds = useMemo(() => new Set(consentedCampaignIds), [consentedCampaignIds]);

  const handleStartTest = (testData: TestWithQuestions) => { setSelectedTest(testData); setView("attempt"); };
  const handleFinishAttempt = () => { setView("dashboard"); window.location.reload(); };

  const handleViewDetails = async (testId: string) => {
    setIsLoading(true);
    const { data } = await getTestWithQuestions(testId);
    if (data) {
        if (!data.hasAttempted && data.test_type === 'avaliativo') {
            addToast({ title: "Gabarito Indisponível", message: "Você precisa resolver o simulado antes de conferir o gabarito.", type: "error" });
            setIsLoading(false);
            return;
        }
        setSelectedTest(data);
        setView("detail");
    } else {
        addToast({ title: "Erro", message: "Não foi possível carregar os detalhes do simulado.", type: "error" });
    }
    setIsLoading(false);
  };

  const handleInitiateTest = async (testId: string, campaignId?: string) => {
    if (campaignId && !myConsentedCampaignIds.has(campaignId)) {
        setConsentModal({ isOpen: true, testId, campaignId });
        return;
    }
    setIsLoading(true);
    const { data } = await getTestWithQuestions(testId);
    if (data) {
        if (data.hasAttempted) {
            addToast({ title: "Já Realizado", message: "Você já concluiu este teste.", type: "error" });
            setIsLoading(false);
            return;
        }
        handleStartTest(data);
    } else {
        addToast({ title: "Erro", message: "Não foi possível iniciar o simulado.", type: "error" });
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

  const handleStartQuickTest = async () => { setIsLoading(true); const { data, error } = await getQuickTest(); if (error) { addToast({title: "Erro", message: error, type: "error"}); } else if (data) { handleStartTest(data); } setIsLoading(false); };

  const handleViewResults = async () => {
    setIsLoading(true);
    const { data, error } = await getStudentResultsHistory();
    if (error) { addToast({title: "Erro", message: error, type: "error"}); } else if (data) {
        const mappedData = data.map(attempt => ({ ...attempt, tests: Array.isArray(attempt.tests) ? attempt.tests[0] : attempt.tests, }));
        setResultsHistory(mappedData as unknown as AttemptHistory[]);
        setView("results");
    }
    setIsLoading(false);
  };

  const handleBackToDashboard = () => { setView("dashboard"); setSelectedTest(null); };

  const allCampaignTests = useMemo(() => {
    if (!campaigns || !Array.isArray(campaigns)) { return []; }
    return campaigns.flatMap(c => c.tests.map(t => {
        const baseTest = [...globalTests, ...classTests].find(gt => gt.id === t.id);
        if (!baseTest) return null;
        return { ...baseTest, is_campaign_test: true, campaignId: c.campaign_id };
    })).filter(Boolean) as (TestCardInfo & { campaignId: string })[]
  }, [campaigns, globalTests, classTests]);

  const filteredTests = useMemo(() => {
        const classTestsWithType = classTests.map(t => ({...t, type: 'class'}));
        const globalTestsWithType = globalTests.map(t => ({...t, type: 'global'}));
        const campaignTestsWithType = allCampaignTests.map(t => ({...t, type: 'campaign'}));

        let testsToShow: (TestCardInfo & { type: string, campaignId?: string })[] = [];
        if (filter === 'all' || filter === 'class') testsToShow.push(...classTestsWithType);
        if (filter === 'all' || filter === 'global') testsToShow.push(...globalTestsWithType);
        if (filter === 'all' || filter === 'campaign') testsToShow.push(...campaignTestsWithType);

        const uniqueTests = new Map<string, TestCardInfo & { type: string, campaignId?: string }>();
        testsToShow.forEach(test => {
            const existing = uniqueTests.get(test.id);
            if (!existing || test.type === 'campaign') { uniqueTests.set(test.id, test); }
        });
        return Array.from(uniqueTests.values());
  }, [classTests, globalTests, allCampaignTests, filter]);

  const TestBrowser = () => (
        <div>
             <div className="mb-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                 <h2 className="text-2xl font-bold text-dark-text dark:text-white">Explorar Simulados e Pesquisas</h2>
                 <div className="flex items-center gap-2 rounded-lg bg-gray-200 dark:bg-gray-700 p-1 overflow-x-auto max-w-full">
                     {['all', 'campaign', 'class', 'global'].map((f) => (
                         <button 
                             key={f}
                             onClick={() => setFilter(f as any)} 
                             className={`px-3 py-1 text-sm font-semibold rounded-md whitespace-nowrap transition-colors ${filter === f ? 'bg-white dark:bg-gray-800 shadow text-royal-blue' : 'text-gray-600 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'}`}
                         >
                             {f === 'all' ? 'Todos' : f === 'campaign' ? 'Campanhas' : f === 'class' ? 'Da Turma' : 'Globais'}
                         </button>
                     ))}
                 </div>
            </div>
            {filteredTests.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pb-10">
                    {filteredTests.map(test => (
                        test.test_type === 'pesquisa' ? (
                            <SurveyCard key={test.id} survey={test} onStart={(surveyId) => handleInitiateTest(surveyId, (test as any).campaignId)} />
                        ) : (
                            <AvailableTestCard key={test.id} test={test} onStart={(testId) => handleInitiateTest(testId, (test as any).campaignId)} onViewDetails={handleViewDetails} />
                        )
                    ))}
                </div>
            ) : (
                <div className="text-center p-12 glass-card">
                    <i className="fas fa-search text-4xl text-gray-400 mb-4"></i>
                    <p className="text-lg text-gray-500">Nenhum item encontrado para este filtro.</p>
                </div>
            )}
        </div>
    );

  const MainDashboard = () => (
    <>
      <h1 className="text-3xl font-bold text-dark-text dark:text-white mb-6">Meu Desempenho em Testes</h1>
      {!dashboardData ? (
         <div className="p-12 text-center border-2 border-dashed rounded-xl glass-card">
           <div className="w-16 h-16 bg-royal-blue/10 rounded-full flex items-center justify-center mx-auto mb-4 text-royal-blue text-2xl"><i className="fas fa-rocket"></i></div>
           <h2 className="text-xl font-bold mb-2 dark:text-white">Comece sua jornada!</h2>
           <p className="text-sm text-dark-text-muted mb-6 max-w-md mx-auto">Faça seu primeiro simulado para ver suas estatísticas e acompanhar seu progresso.</p>
           <button onClick={() => setView("browse")} className="bg-royal-blue text-white font-bold py-3 px-8 rounded-full hover:bg-opacity-90 shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-1">Ver Simulados</button>
         </div>
      ) : (
        <div className="space-y-8 pb-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <StatCard title="Simulados Feitos" value={dashboardData.stats.simuladosFeitos} icon="fa-file-alt" />
            <StatCard title="Média Geral" value={`${dashboardData.stats.mediaGeral.toFixed(0)}`} icon="fa-chart-bar" unit="%" />
            <StatCard title="Taxa de Acerto" value={`${dashboardData.stats.taxaAcerto.toFixed(0)}`} icon="fa-check-circle" unit="%" />
            <StatCard title="Tempo Médio" value={`${(dashboardData.stats.tempoMedio / 60).toFixed(0)}`} unit="min" icon="fa-clock" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <ActionCard title="Teste Rápido" description="10 questões • 15 minutos" icon="fa-bolt" actionText="Começar agora" onClick={handleStartQuickTest} />
            <ActionCard title="Praticar" description="Escolha um simulado" icon="fa-stream" actionText="Ver todos" onClick={() => setView("browse")} />
            <ActionCard title="Meus Resultados" description="Análise detalhada" icon="fa-chart-pie" actionText="Ver relatórios" onClick={handleViewResults} />
          </div>

          {campaigns && campaigns.length > 0 && (
                 <div>
                    <h2 className="text-2xl font-bold mb-6 text-dark-text dark:text-white flex items-center gap-2"><i className="fas fa-trophy text-yellow-500"></i> Campanhas Ativas</h2>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {campaigns.map(campaign => (
                            <CampaignCard key={campaign.campaign_id} campaign={campaign} onStartTest={handleInitiateTest} />
                        ))}
                    </div>
                </div>
            )}

          <div className="grid grid-cols-1 lg:grid-cols-8 gap-6">
            <div className="lg:col-span-5">
                {dashboardData.performanceBySubject?.length > 0 ? ( <PerformanceChart data={dashboardData.performanceBySubject} /> ) : ( <div className="glass-card p-6 h-[350px] flex items-center justify-center text-gray-500">Sem dados de performance ainda.</div> )}
            </div>
            <div className="lg:col-span-3">
                {dashboardData.recentAttempts?.length > 0 ? ( <RecentTests data={dashboardData.recentAttempts} /> ) : ( <div className="glass-card p-6 h-[350px] flex items-center justify-center text-gray-500">Nenhum simulado recente.</div> )}
            </div>
          </div>

          {knowledgeTests && knowledgeTests.length > 0 && (
            <div>
                <h2 className="text-2xl font-bold mb-6 text-dark-text dark:text-white">Recomendados para Você</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {knowledgeTests.slice(0, 3).map(kt => (
                        <KnowledgeTestWidget key={kt.id} test={kt} onStart={handleInitiateTest} />
                    ))}
                </div>
            </div>
          )}
        </div>
      )}
    </>
  );

  const renderContent = () => {
    if (isLoading) { return <div className="flex items-center justify-center h-96"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-royal-blue"></div></div>; }
    switch (view) {
      case "browse": return ( <><button onClick={handleBackToDashboard} className="text-sm font-bold text-royal-blue mb-6 flex items-center gap-2 hover:underline"><i className="fas fa-arrow-left"></i> Voltar ao Dashboard</button><TestBrowser /></> );
      case "attempt": if (!selectedTest) { setView("browse"); return null; } return <AttemptView test={selectedTest} onFinish={handleFinishAttempt} />;
      case "detail": if (!selectedTest) { setView("browse"); return null; } return <TestDetailView test={selectedTest} onBack={() => setView("browse")} onStartTest={handleStartTest} />;
      case "results": return <ResultsView attempts={resultsHistory} onBack={handleBackToDashboard} />;
      case "dashboard": default: return <MainDashboard />;
    }
  };

  return (
      <div className="w-full">
        {consentModal.isOpen && (
            <CampaignConsentModal
                onConfirm={handleConfirmConsent}
                onCancel={() => setConsentModal({isOpen: false})}
            />
        )}
        {renderContent()}
    </div>
  );
}