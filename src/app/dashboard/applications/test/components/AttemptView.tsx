"use client";

import { useState, useEffect, useRef } from 'react';
import { submitTestAttempt, StudentAnswerPayload } from '../actions';
import { TestWithQuestions } from '../types';
import { useToast } from '@/contexts/ToastContext';

// --- COMPONENTES INTERNOS ---

// Modal de Confirmação Elegante
const ConfirmFinishModal = ({ 
    isOpen, 
    onCancel, 
    onConfirm, 
    unansweredCount 
}: { 
    isOpen: boolean; 
    onCancel: () => void; 
    onConfirm: () => void; 
    unansweredCount: number;
}) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full p-6 transform transition-all scale-100">
                <div className="text-center mb-6">
                    <div className="w-16 h-16 bg-yellow-100 text-yellow-600 rounded-full flex items-center justify-center mx-auto mb-4 text-3xl">
                        <i className="fas fa-flag-checkered"></i>
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                        Finalizar Avaliação?
                    </h3>
                    <p className="text-gray-500 text-sm">
                        {unansweredCount > 0 
                            ? `Atenção: Você deixou ${unansweredCount} questões sem resposta. Deseja enviar mesmo assim?`
                            : "Tem certeza que deseja entregar sua prova? Você não poderá alterar as respostas depois."
                        }
                    </p>
                </div>
                <div className="flex gap-3">
                    <button onClick={onCancel} className="flex-1 py-3 rounded-xl bg-gray-100 dark:bg-gray-700 font-bold text-gray-700 dark:text-gray-300 hover:bg-gray-200 transition-colors">
                        Revisar
                    </button>
                    <button onClick={onConfirm} className="flex-1 py-3 rounded-xl bg-royal-blue text-white font-bold hover:bg-blue-700 transition-colors shadow-lg">
                        Confirmar Envio
                    </button>
                </div>
            </div>
        </div>
    );
};

// Tela de Calculando (Loading com Animação)
const CalculatingScreen = () => (
    <div className="flex flex-col items-center justify-center h-[60vh] animate-in fade-in duration-500">
        <div className="relative w-32 h-32 mb-8">
            <div className="absolute inset-0 border-4 border-gray-200 rounded-full opacity-30"></div>
            <div className="absolute inset-0 border-4 border-royal-blue border-t-transparent rounded-full animate-spin"></div>
            <div className="absolute inset-0 flex items-center justify-center">
                <i className="fas fa-brain text-4xl text-royal-blue animate-pulse"></i>
            </div>
        </div>
        <h2 className="text-2xl font-bold dark:text-white mb-2 animate-pulse">Calculando Resultados...</h2>
        <p className="text-gray-500 text-sm">A inteligência artificial está analisando seu desempenho.</p>
    </div>
);

// Display do Timer
const TimerDisplay = ({ seconds }: { seconds: number }) => {
    const format = (s: number) => {
        const m = Math.floor(s / 60);
        const sec = s % 60;
        return `${m.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`;
    };
    return <span className="font-mono tabular-nums tracking-widest">{format(seconds)}</span>;
};

// --- COMPONENTE PRINCIPAL ---

type Props = {
  test: TestWithQuestions;
  onFinish: () => void;
};

export default function AttemptView({ test, onFinish }: Props) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [timeSpent, setTimeSpent] = useState(0);
  const [warnings, setWarnings] = useState(0);
  const [status, setStatus] = useState<'active' | 'calculating' | 'result'>('active');
  const [resultData, setResultData] = useState<{ score: number, attemptId: string } | null>(null);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  
  const { addToast } = useToast();
  const question = test.questions[currentQuestionIndex];
  const progress = Math.round(((Object.keys(answers).length) / test.questions.length) * 100);

  // --- EFEITOS ---

  // Timer
  useEffect(() => {
    if (status !== 'active') return;
    const timer = setInterval(() => setTimeSpent(prev => prev + 1), 1000);
    return () => clearInterval(timer);
  }, [status]);

  // Anti-Cheat (Visibilidade) - CORRIGIDO O ERRO DO TOAST
  useEffect(() => {
    const handleVisibility = () => {
        if (document.hidden && status === 'active') {
            setWarnings(prev => {
                const newCount = prev + 1;
                // setTimeout joga para o próximo ciclo de render, evitando o erro "Cannot update..."
                setTimeout(() => {
                    addToast({ 
                        title: "Modo Foco", 
                        message: `Saída de tela detectada (${newCount}).`, 
                        type: "warning" 
                    });
                }, 0);
                return newCount;
            });
        }
    };
    document.addEventListener("visibilitychange", handleVisibility);
    return () => document.removeEventListener("visibilitychange", handleVisibility);
  }, [status, addToast]);

  // --- HANDLERS ---

  const handleAnswerSelect = (val: any) => {
    setAnswers(prev => ({ ...prev, [question.id]: val }));
  };

  const handleRequestFinish = () => {
      setIsConfirmOpen(true);
  };

  const handleConfirmSubmit = async () => {
    setIsConfirmOpen(false);
    setStatus('calculating');

    try {
        const formattedAnswers: StudentAnswerPayload[] = Object.entries(answers).map(([qId, val]) => ({
            question_id: qId,
            answer: val,
            time_spent_seconds: 0
        }));

        // Pequeno delay artificial para dar sensação de processamento
        await new Promise(r => setTimeout(r, 1500));

        const result = await submitTestAttempt(test.id, formattedAnswers, timeSpent);

        if (result.error) throw new Error(result.error);

        setResultData({ score: result.score || 0, attemptId: result.attemptId || '' });
        setStatus('result');

    } catch (error: any) {
        console.error(error);
        addToast({ title: "Erro", message: error.message || "Falha ao enviar.", type: "error" });
        setStatus('active');
    }
  };

  // --- RENDERIZAÇÃO ---

  if (status === 'calculating') return <CalculatingScreen />;

  if (status === 'result' && resultData) {
      const isPass = resultData.score >= 60;
      return (
          <div className="max-w-xl mx-auto mt-10 p-6 bg-white dark:bg-gray-800 rounded-3xl shadow-2xl text-center animate-in zoom-in-95">
              <div className={`w-24 h-24 mx-auto rounded-full flex items-center justify-center mb-6 text-5xl ${isPass ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                  <i className={`fas ${isPass ? 'fa-trophy' : 'fa-chart-bar'}`}></i>
              </div>
              <h2 className="text-3xl font-black mb-2 text-gray-800 dark:text-white">{resultData.score}%</h2>
              <p className="text-gray-500 mb-8">{isPass ? 'Excelente desempenho!' : 'Bom esforço, continue praticando.'}</p>
              
              <div className="grid grid-cols-2 gap-4 mb-8">
                  <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
                      <p className="text-xs uppercase font-bold text-gray-400">Tempo</p>
                      <p className="text-lg font-mono font-bold"><TimerDisplay seconds={timeSpent} /></p>
                  </div>
                  <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
                      <p className="text-xs uppercase font-bold text-gray-400">Alertas</p>
                      <p className={`text-lg font-bold ${warnings > 0 ? 'text-red-500' : 'text-green-500'}`}>{warnings}</p>
                  </div>
              </div>

              <button onClick={onFinish} className="w-full py-3.5 rounded-xl bg-royal-blue text-white font-bold shadow-lg hover:bg-blue-700 transition-all active:scale-95">
                  Voltar ao Painel
              </button>
          </div>
      );
  }

  // MODO ATIVO (PROVA)
  return (
    <div className="min-h-screen pb-20 animate-in fade-in">
      
      {/* HEADER FIXO (Sticky) */}
      <div className="sticky top-0 z-40 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b dark:border-gray-700 shadow-sm">
          <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
              
              {/* Info Esquerda */}
              <div className="flex items-center gap-4">
                  <div className="hidden md:block">
                      <h2 className="font-bold text-sm dark:text-white truncate max-w-[200px]">{test.title}</h2>
                      <div className="h-1.5 w-24 bg-gray-200 rounded-full mt-1 overflow-hidden">
                          <div className="h-full bg-green-500 transition-all duration-500" style={{ width: `${progress}%` }}></div>
                      </div>
                  </div>
                  <div className="md:hidden text-xs font-bold text-gray-500">
                      Q{currentQuestionIndex + 1}/{test.questions.length}
                  </div>
              </div>

              {/* Timer Central (Mobile e Desktop) */}
              <div className="absolute left-1/2 transform -translate-x-1/2 bg-blue-50 dark:bg-blue-900/30 text-royal-blue px-4 py-1.5 rounded-full font-bold text-lg flex items-center gap-2 shadow-inner border border-blue-100 dark:border-blue-800">
                  <i className="far fa-clock text-sm animate-pulse"></i>
                  <TimerDisplay seconds={timeSpent} />
              </div>

              {/* Botão Finalizar Único */}
              <button 
                  onClick={handleRequestFinish}
                  className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-bold text-sm shadow-md transition-all active:scale-95 flex items-center gap-2"
              >
                  <span className="hidden sm:inline">Finalizar</span> <i className="fas fa-check"></i>
              </button>
          </div>
      </div>

      <div className="max-w-4xl mx-auto p-4 md:p-6 space-y-6 mt-4">
          {/* Conteúdo da Questão */}
          <div className="bg-white dark:bg-gray-800 p-6 md:p-10 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700 min-h-[400px] flex flex-col relative">
              
              <div className="mb-6 flex justify-between items-start">
                  <span className="bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 px-3 py-1 rounded-md text-xs font-bold uppercase tracking-wider">
                      Questão {currentQuestionIndex + 1}
                  </span>
                  {question.points > 0 && <span className="text-xs font-bold text-yellow-600 bg-yellow-50 px-2 py-1 rounded border border-yellow-100">{question.points} pts</span>}
              </div>

              {/* Enunciado */}
              <div className="mb-8">
                  {question.content.base_text && (
                      <div className="mb-6 p-5 bg-gray-50 dark:bg-gray-700/30 rounded-xl text-sm leading-relaxed border-l-4 border-royal-blue/20" dangerouslySetInnerHTML={{ __html: question.content.base_text }} />
                  )}
                  <div className="text-lg md:text-xl font-medium text-gray-800 dark:text-white leading-relaxed" dangerouslySetInnerHTML={{ __html: question.content.statement }} />
              </div>

              {/* Opções */}
              <div className="space-y-3 flex-grow">
                  {question.question_type === 'multiple_choice' && question.content.options?.map((opt, idx) => {
                      const isSelected = answers[question.id] === idx;
                      return (
                          <div 
                              key={idx}
                              onClick={() => handleAnswerSelect(idx)}
                              className={`group p-4 rounded-xl border-2 cursor-pointer transition-all duration-200 flex items-start gap-4 ${
                                  isSelected 
                                  ? 'border-royal-blue bg-blue-50 dark:bg-blue-900/20 shadow-md transform scale-[1.01]' 
                                  : 'border-gray-100 dark:border-gray-700 hover:border-royal-blue/30 hover:bg-gray-50 dark:hover:bg-gray-700/30'
                              }`}
                          >
                              <div className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs border-2 transition-colors flex-shrink-0 ${
                                  isSelected ? 'bg-royal-blue text-white border-royal-blue' : 'bg-white text-gray-400 border-gray-200'
                              }`}>
                                  {String.fromCharCode(65 + idx)}
                              </div>
                              <span className={`text-sm md:text-base ${isSelected ? 'text-royal-blue font-semibold' : 'text-gray-700 dark:text-gray-300'}`}>{opt}</span>
                          </div>
                      )
                  })}
              </div>

              {/* Navegação entre Questões */}
              <div className="flex justify-between items-center mt-10 pt-6 border-t dark:border-gray-700">
                  <button 
                      onClick={() => setCurrentQuestionIndex(p => Math.max(0, p - 1))}
                      disabled={currentQuestionIndex === 0}
                      className="text-gray-500 hover:text-royal-blue font-bold disabled:opacity-30 transition-colors flex items-center gap-2 px-4 py-2 hover:bg-gray-100 rounded-lg"
                  >
                      <i className="fas fa-arrow-left"></i> Anterior
                  </button>
                  
                  {currentQuestionIndex < test.questions.length - 1 ? (
                      <button 
                          onClick={() => setCurrentQuestionIndex(p => p + 1)}
                          className="bg-royal-blue hover:bg-blue-700 text-white px-6 py-2.5 rounded-xl font-bold shadow-lg shadow-blue-500/20 transition-all flex items-center gap-2 transform active:scale-95"
                      >
                          Próxima <i className="fas fa-arrow-right"></i>
                      </button>
                  ) : (
                      <button 
                          onClick={handleRequestFinish}
                          className="bg-green-600 hover:bg-green-700 text-white px-6 py-2.5 rounded-xl font-bold shadow-lg shadow-green-500/20 transition-all flex items-center gap-2 transform active:scale-95"
                      >
                          Finalizar <i className="fas fa-check"></i>
                      </button>
                  )}
              </div>
          </div>

          {/* Navegador de Bolinhas */}
          <div className="flex flex-wrap gap-2 justify-center pb-8">
              {test.questions.map((_, idx) => {
                  const isAnswered = answers[test.questions[idx].id] !== undefined;
                  const isCurrent = currentQuestionIndex === idx;
                  return (
                      <button
                        key={idx}
                        onClick={() => setCurrentQuestionIndex(idx)}
                        className={`w-3 h-3 rounded-full transition-all duration-300 ${
                            isCurrent ? 'bg-royal-blue scale-150 ring-2 ring-blue-200' :
                            isAnswered ? 'bg-blue-400' :
                            'bg-gray-200 dark:bg-gray-700'
                        }`}
                        title={`Questão ${idx + 1}`}
                      />
                  )
              })}
          </div>
      </div>

      <ConfirmFinishModal 
          isOpen={isConfirmOpen} 
          onCancel={() => setIsConfirmOpen(false)} 
          onConfirm={handleConfirmSubmit} 
          unansweredCount={test.questions.length - Object.keys(answers).length} 
      />
    </div>
  );
}