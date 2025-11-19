"use client";

import { useState, useTransition, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { submitTestAttempt } from '../actions';
import type { TestWithQuestions, StudentAnswerPayload } from '../actions';
import Timer from './Timer';
import { useToast } from '@/contexts/ToastContext';
import ConfirmationModal from '@/components/ConfirmationModal';
import Image from 'next/image';

type Props = {
  test: TestWithQuestions;
  onFinish: () => void;
};

// --- COMPONENTES INTERNOS ---

// 1. Mapa da Prova (Sidebar de Navegação)
const QuestionMap = ({ 
  questions, currentIndex, answers, onSelect, isCollapsed, toggleCollapse 
}: { 
  questions: any[], currentIndex: number, answers: StudentAnswerPayload[], onSelect: (idx: number) => void, isCollapsed: boolean, toggleCollapse: () => void
}) => (
  <div className={`
      fixed md:relative z-30 top-0 bottom-0 left-0 bg-white dark:bg-dark-card border-r border-gray-200 dark:border-gray-800 
      transition-all duration-300 flex flex-col
      ${isCollapsed ? 'w-0 md:w-16 overflow-hidden' : 'w-64 shadow-2xl md:shadow-none'}
  `}>
      <div className="p-4 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between bg-gray-50 dark:bg-black/20">
          <span className="font-bold text-sm text-text-primary dark:text-white whitespace-nowrap">Mapa da Prova</span>
          <button onClick={toggleCollapse} className="md:hidden text-gray-500"><i className="fas fa-times"></i></button>
      </div>
      
      <div className="flex-1 overflow-y-auto p-3 custom-scrollbar">
          <div className="grid grid-cols-4 gap-2">
              {questions.map((q, idx) => {
                  const isAnswered = answers.find(a => a.questionId === q.id)?.answer !== null && answers.find(a => a.questionId === q.id)?.answer !== '';
                  const isCurrent = idx === currentIndex;
                  return (
                      <button
                          key={q.id}
                          onClick={() => onSelect(idx)}
                          className={`
                              h-10 rounded-lg text-xs font-bold transition-all border
                              ${isCurrent 
                                  ? 'bg-brand-purple text-white border-brand-purple shadow-md scale-105' 
                                  : isAnswered 
                                      ? 'bg-brand-green/10 text-brand-green-dark border-brand-green/30' 
                                      : 'bg-gray-50 dark:bg-gray-800 text-text-secondary border-transparent hover:bg-gray-100'
                              }
                          `}
                      >
                          {idx + 1}
                      </button>
                  );
              })}
          </div>
      </div>

      <div className="p-4 border-t border-gray-100 dark:border-gray-800 text-xs text-text-secondary space-y-2 bg-gray-50 dark:bg-black/20">
          <div className="flex items-center gap-2"><div className="w-3 h-3 rounded bg-brand-purple"></div> Atual</div>
          <div className="flex items-center gap-2"><div className="w-3 h-3 rounded bg-brand-green/20 border border-brand-green/30"></div> Respondida</div>
          <div className="flex items-center gap-2"><div className="w-3 h-3 rounded bg-gray-100 dark:bg-gray-800 border border-gray-200"></div> Pendente</div>
      </div>
  </div>
);

// 2. Opção de Resposta (Card Grande)
const OptionCard = ({ option, index, isSelected, onSelect }: { option: string, index: number, isSelected: boolean, onSelect: () => void }) => (
    <div 
        onClick={onSelect}
        className={`
            relative p-4 md:p-5 rounded-xl border-2 cursor-pointer transition-all duration-200 flex items-start gap-4 group
            ${isSelected 
                ? 'bg-brand-purple/5 border-brand-purple shadow-sm' 
                : 'bg-white dark:bg-dark-card border-gray-100 dark:border-gray-700 hover:border-brand-purple/40 hover:bg-gray-50 dark:hover:bg-gray-800'
            }
        `}
    >
        <div className={`
            flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold border transition-colors
            ${isSelected 
                ? 'bg-brand-purple text-white border-brand-purple' 
                : 'bg-gray-100 dark:bg-gray-700 text-text-secondary border-gray-200 dark:border-gray-600 group-hover:border-brand-purple/50'
            }
        `}>
            {String.fromCharCode(65 + index)}
        </div>
        <div className={`flex-grow text-sm md:text-base ${isSelected ? 'text-brand-purple font-semibold' : 'text-text-primary dark:text-white'}`}>
            {option}
        </div>
        {isSelected && <i className="fas fa-check-circle text-brand-purple text-xl absolute top-4 right-4"></i>}
    </div>
);

// --- MAIN COMPONENT ---

export default function AttemptView({ test, onFinish }: Props) {
    const [isSubmitting, startSubmitTransition] = useTransition();
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    // Inicializa com o tempo zerado e resposta nula
    const [answers, setAnswers] = useState<StudentAnswerPayload[]>(
        test.questions.map(q => ({ questionId: q.id, answer: null, time_spent: 0 }))
    );
    const [isSidebarCollapsed, setSidebarCollapsed] = useState(false);
    const [isConfirmModalOpen, setConfirmModalOpen] = useState(false);
    
    const router = useRouter();
    const { addToast } = useToast();
    
    const isSurvey = test.test_type === 'pesquisa';
    // Antifraude desativado para pesquisas
    const [isFraudAlertOpen, setFraudAlertOpen] = useState(!isSurvey);

    // Refs para controle de tempo
    const questionStartTimeRef = useRef<number>(Date.now());
    const totalTimeStartRef = useRef<number>(Date.now());

    // Efeito para salvar o tempo ao mudar de questão
    useEffect(() => {
        questionStartTimeRef.current = Date.now();
        document.getElementById('question-container')?.scrollTo(0,0);
    }, [currentQuestionIndex]);

    // Função para atualizar o tempo da questão atual antes de mudar
    const updateCurrentQuestionTime = useCallback(() => {
        const timeSpentNow = Math.round((Date.now() - questionStartTimeRef.current) / 1000);
        const currentQId = test.questions[currentQuestionIndex].id;
        
        setAnswers(prev => prev.map(a => 
            a.questionId === currentQId 
            ? { ...a, time_spent: (a.time_spent || 0) + timeSpentNow }
            : a
        ));
    }, [currentQuestionIndex, test.questions]);

    const changeQuestion = (newIndex: number) => {
        if (newIndex < 0 || newIndex >= test.questions.length) return;
        updateCurrentQuestionTime();
        setCurrentQuestionIndex(newIndex);
    };

    const handleAnswerChange = (questionId: string, answer: any) => {
        setAnswers(prev => prev.map(a => a.questionId === questionId ? { ...a, answer } : a));
    };

    const executeSubmit = useCallback((isAutoSubmit = false) => {
        updateCurrentQuestionTime(); // Salva o tempo da última
        const totalTimeSpent = Math.round((Date.now() - totalTimeStartRef.current) / 1000);
        setConfirmModalOpen(false);

        startSubmitTransition(async () => {
            // Calcula o payload final garantindo que o tempo da última questão está somado
            const currentQId = test.questions[currentQuestionIndex].id;
            const timeSpentLast = Math.round((Date.now() - questionStartTimeRef.current) / 1000);
            
            const finalAnswers = answers.map(a => 
                a.questionId === currentQId 
                ? { ...a, time_spent: (a.time_spent || 0) + timeSpentLast }
                : a
            );

            const result = await submitTestAttempt({
                test_id: test.id,
                answers: finalAnswers,
                time_spent: totalTimeSpent
            });

            if (result.error) {
                addToast({ title: "Erro", message: result.error, type: 'error' });
            } else {
                if (isAutoSubmit) {
                    addToast({ title: "Finalizado", message: "Simulado encerrado por segurança.", type: 'warning' });
                } else {
                    addToast({ title: "Sucesso", message: "Respostas enviadas!", type: 'success' });
                }
                onFinish();
            }
        });
    }, [answers, currentQuestionIndex, test, addToast, onFinish, updateCurrentQuestionTime]);

    // Antifraude Listeners
    useEffect(() => {
        if (isSurvey) return;
        const preventAction = (e: any) => { e.preventDefault(); addToast({ title: "Ação Bloqueada", message: "Função desativada durante a prova.", type: "error" }); };
        const handleVisibility = () => { if (document.hidden && !isFraudAlertOpen && !isConfirmModalOpen) executeSubmit(true); };

        document.addEventListener('copy', preventAction);
        document.addEventListener('paste', preventAction);
        document.addEventListener('contextmenu', preventAction);
        document.addEventListener('visibilitychange', handleVisibility);

        return () => {
            document.removeEventListener('copy', preventAction);
            document.removeEventListener('paste', preventAction);
            document.removeEventListener('contextmenu', preventAction);
            document.removeEventListener('visibilitychange', handleVisibility);
        };
    }, [isSurvey, isFraudAlertOpen, isConfirmModalOpen, executeSubmit, addToast]);

    // --- UI ---
    if (!test || !test.questions?.length) return null;
    const currentQuestion = test.questions[currentQuestionIndex];
    const currentAnswer = answers.find(a => a.questionId === currentQuestion.id)?.answer;

    return (
        <div className="fixed inset-0 z-50 bg-bg-secondary dark:bg-bg-primary flex h-screen w-screen overflow-hidden">
            {/* Alerta de Fraude (Modal Inicial) */}
            {!isSurvey && isFraudAlertOpen && (
                <div className="fixed inset-0 bg-black/90 backdrop-blur-lg z-[100] flex items-center justify-center p-4">
                    <div className="bg-white dark:bg-dark-card p-8 rounded-3xl max-w-md text-center border-t-4 border-red-500 shadow-2xl">
                        <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6 text-red-500 text-3xl">
                            <i className="fas fa-lock"></i>
                        </div>
                        <h2 className="text-2xl font-bold mb-2 text-text-primary dark:text-white">Ambiente Seguro</h2>
                        <p className="text-text-secondary mb-8 text-sm">
                            O foco é monitorado. Sair da tela ou tentar colar conteúdo resultará no envio automático da prova.
                        </p>
                        <button onClick={() => setFraudAlertOpen(false)} className="w-full py-3 rounded-xl bg-brand-purple text-white font-bold hover:scale-105 transition-transform">
                            Começar Prova
                        </button>
                    </div>
                </div>
            )}

            <ConfirmationModal 
                isOpen={isConfirmModalOpen} 
                title="Finalizar Prova?" 
                message="Você tem certeza? Verifique se respondeu todas as questões."
                onConfirm={() => executeSubmit()} 
                onClose={() => setConfirmModalOpen(false)}
                confirmText={isSubmitting ? "Enviando..." : "Sim, Entregar"}
            />

            {/* SIDEBAR (Mapa) */}
            <QuestionMap 
                questions={test.questions} 
                currentIndex={currentQuestionIndex} 
                answers={answers} 
                onSelect={changeQuestion}
                isCollapsed={isSidebarCollapsed}
                toggleCollapse={() => setSidebarCollapsed(!isSidebarCollapsed)}
            />

            {/* ÁREA PRINCIPAL */}
            <div className="flex-1 flex flex-col h-full relative">
                
                {/* Header Sticky */}
                <div className="bg-white/80 dark:bg-dark-card/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-800 p-4 flex justify-between items-center z-20">
                    <div className="flex items-center gap-3">
                        <button onClick={() => setSidebarCollapsed(!isSidebarCollapsed)} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800">
                            <i className="fas fa-bars text-text-secondary"></i>
                        </button>
                        <h1 className="font-bold text-text-primary dark:text-white truncate max-w-[200px] md:max-w-md">
                            {test.title}
                        </h1>
                    </div>
                    {!isSurvey && (
                         <div className="bg-gray-100 dark:bg-gray-800 px-4 py-2 rounded-xl font-mono text-sm font-bold text-brand-purple">
                             <Timer isRunning={!isFraudAlertOpen} durationInSeconds={(test.duration_minutes || 60) * 60} onTimeUp={() => executeSubmit(true)} />
                         </div>
                    )}
                </div>

                {/* Barra de Progresso */}
                <div className="h-1 w-full bg-gray-200 dark:bg-gray-800">
                    <div 
                        className="h-full bg-brand-green transition-all duration-500" 
                        style={{ width: `${((currentQuestionIndex + 1) / test.questions.length) * 100}%` }}
                    ></div>
                </div>

                {/* Conteúdo Scrollable */}
                <div id="question-container" className="flex-1 overflow-y-auto p-4 md:p-8 bg-bg-secondary dark:bg-bg-primary scroll-smooth pb-32">
                    <div className="max-w-4xl mx-auto">
                        
                        {/* Cartão da Questão */}
                        <div className="bg-white dark:bg-dark-card rounded-3xl shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden p-6 md:p-10">
                            
                            {/* Metadados da Questão */}
                            <div className="flex justify-between items-center mb-6 pb-4 border-b border-gray-100 dark:border-gray-800">
                                <span className="text-xs font-bold bg-gray-100 dark:bg-gray-800 px-3 py-1 rounded-full text-text-secondary uppercase">
                                    Questão {currentQuestionIndex + 1}
                                </span>
                                {currentQuestion.points > 0 && (
                                    <span className="text-xs font-medium text-text-muted">Vale {currentQuestion.points} pts</span>
                                )}
                            </div>

                            {/* Texto Base */}
                            {currentQuestion.content.base_text && (
                                <div className="mb-8 p-6 bg-gray-50 dark:bg-gray-800/40 rounded-2xl border-l-4 border-brand-purple/30 text-sm md:text-base leading-relaxed text-text-secondary italic">
                                    <div dangerouslySetInnerHTML={{ __html: currentQuestion.content.base_text }} />
                                </div>
                            )}

                            {/* Enunciado */}
                            <div className="text-lg md:text-xl font-medium text-text-primary dark:text-white leading-relaxed mb-8">
                                <div dangerouslySetInnerHTML={{ __html: currentQuestion.content.statement }} />
                            </div>

                            {/* Imagem */}
                            {currentQuestion.content.image_url && (
                                <div className="mb-8 relative h-64 w-full rounded-2xl overflow-hidden border border-gray-200 dark:border-gray-700">
                                    <Image src={currentQuestion.content.image_url} alt="Questão" fill className="object-contain" />
                                </div>
                            )}

                            {/* Área de Resposta */}
                            <div className="space-y-4">
                                {currentQuestion.question_type === 'multiple_choice' ? (
                                    <div className="grid gap-3">
                                        {currentQuestion.content.options?.map((opt, idx) => (
                                            <OptionCard 
                                                key={idx} 
                                                option={opt} 
                                                index={idx} 
                                                isSelected={currentAnswer === idx} 
                                                onSelect={() => handleAnswerChange(currentQuestion.id, idx)} 
                                            />
                                        ))}
                                    </div>
                                ) : (
                                    <div className="relative">
                                        <textarea 
                                            className="w-full min-h-[250px] p-6 rounded-2xl bg-gray-50 dark:bg-black/20 border-2 border-gray-200 dark:border-gray-700 focus:border-brand-purple focus:bg-white dark:focus:bg-dark-card transition-all outline-none text-text-primary dark:text-white resize-y"
                                            placeholder="Digite sua resposta dissertativa aqui..."
                                            value={currentAnswer?.toString() || ''}
                                            onChange={(e) => handleAnswerChange(currentQuestion.id, e.target.value)}
                                        />
                                        <div className="absolute bottom-4 right-4 text-xs text-text-muted font-mono">
                                            {/* CORREÇÃO AQUI: Convertemos para String antes de ler o length */}
                                            {String(currentAnswer || '').length} caracteres
                                        </div>
                                    </div>
                                )}
                            </div>

                        </div>
                    </div>
                </div>

                {/* Barra Inferior de Ação */}
                <div className="absolute bottom-0 w-full bg-white dark:bg-dark-card border-t border-gray-200 dark:border-gray-800 p-4 flex justify-between items-center z-20 shadow-2xl">
                    <button 
                        onClick={() => changeQuestion(currentQuestionIndex - 1)}
                        disabled={currentQuestionIndex === 0}
                        className="flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-sm text-text-secondary hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-50 transition-colors"
                    >
                        <i className="fas fa-arrow-left"></i> <span className="hidden md:inline">Anterior</span>
                    </button>

                    {currentQuestionIndex === test.questions.length - 1 ? (
                        <button 
                            onClick={() => setConfirmModalOpen(true)}
                            disabled={isSubmitting}
                            className="bg-green-600 hover:bg-green-500 text-white px-8 py-3 rounded-xl font-bold shadow-lg shadow-green-600/20 hover:-translate-y-1 transition-all flex items-center gap-2"
                        >
                            {isSubmitting ? <i className="fas fa-spinner fa-spin"></i> : <i className="fas fa-check-circle"></i>}
                            Finalizar Prova
                        </button>
                    ) : (
                        <button 
                            onClick={() => changeQuestion(currentQuestionIndex + 1)}
                            className="bg-brand-purple hover:bg-opacity-90 text-white px-8 py-3 rounded-xl font-bold shadow-lg shadow-brand-purple/20 hover:-translate-y-1 transition-all flex items-center gap-2"
                        >
                            Próxima <i className="fas fa-arrow-right"></i>
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}