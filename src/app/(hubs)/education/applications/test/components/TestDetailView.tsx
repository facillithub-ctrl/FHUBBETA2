"use client";

import { useEffect, useState } from 'react';
// CORREÇÃO: Importar de '../types' em vez de '../actions'
import type { TestWithQuestions } from '../types';

type Props = {
  test: TestWithQuestions;
  onBack: () => void;
  onStartTest: (testData: TestWithQuestions) => void;
};

export default function TestDetailView({ test, onBack, onStartTest }: Props) {
  const [sanitizedQuestions, setSanitizedQuestions] = useState<{ id: string, statement: string }[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const sanitizeHtml = async () => {
      // Importação dinâmica para evitar erro de SSR (Server Side Rendering) com DOMPurify
      const DOMPurify = (await import('dompurify')).default;
      const sanitized = test.questions.map(q => ({
        id: q.id,
        statement: DOMPurify.sanitize(q.content.statement)
      }));
      setSanitizedQuestions(sanitized);
      setIsLoading(false);
    };
    sanitizeHtml();
  }, [test.questions]);

  return (
    <div>
      <div className="mb-6 flex justify-between items-center">
        <button onClick={onBack} className="text-sm text-royal-blue hover:underline font-medium flex items-center gap-2">
          <i className="fas fa-arrow-left"></i> Voltar para a lista
        </button>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-8">
        <div className="flex flex-col md:flex-row justify-between items-start gap-4">
            <div>
                <div className="flex items-center gap-3 mb-2">
                    <h1 className="text-3xl font-bold text-dark-text dark:text-white">{test.title}</h1>
                    {test.hasAttempted && (
                        <span className="bg-green-100 text-green-700 text-xs font-bold px-2 py-1 rounded-full border border-green-200">
                            Concluído
                        </span>
                    )}
                </div>
                
                <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400 mb-4">
                    <span className="flex items-center gap-1"><i className="far fa-clock"></i> {test.duration_minutes} min</span>
                    <span className="flex items-center gap-1"><i className="fas fa-layer-group"></i> {test.subject || 'Geral'}</span>
                    <span className="flex items-center gap-1"><i className="fas fa-list-ol"></i> {test.question_count || test.questions.length} questões</span>
                </div>

                <p className="text-gray-600 dark:text-gray-300 leading-relaxed max-w-2xl">
                    {test.description || "Sem descrição disponível."}
                </p>
            </div>

            <button
                onClick={() => onStartTest(test)}
                className="bg-royal-blue text-white font-bold py-3 px-8 rounded-xl shadow-lg hover:bg-blue-700 hover:shadow-blue-500/30 transition-all transform hover:-translate-y-1 flex items-center gap-2 flex-shrink-0"
            >
                {test.hasAttempted ? 'Refazer Simulado' : 'Iniciar Simulado'} <i className="fas fa-play"></i>
            </button>
        </div>

        <hr className="my-8 border-gray-100 dark:border-gray-700" />
        
        <h2 className="text-xl font-bold mb-6 dark:text-white">Prévia das Questões</h2>
        <div className="space-y-6">
          {isLoading ? (
            <div className="flex flex-col gap-4">
                {[1, 2].map(i => (
                    <div key={i} className="h-24 bg-gray-100 dark:bg-gray-700 rounded-lg animate-pulse"></div>
                ))}
            </div>
          ) : test.questions.length > 0 ? (
            test.questions.map((q, index) => {
                const sanitizedQuestion = sanitizedQuestions.find(sq => sq.id === q.id);
                return (
                  <div key={q.id} className="p-6 border rounded-xl dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/50">
                    <div className="flex justify-between items-start mb-3">
                        <span className="font-bold text-gray-500 text-xs uppercase tracking-wider">Questão {index + 1}</span>
                        {q.points > 0 && <span className="text-xs font-bold text-gray-400">{q.points} pts</span>}
                    </div>
                    
                    {sanitizedQuestion && (
                      <div 
                        className="prose dark:prose-invert max-w-none text-gray-800 dark:text-gray-200 mb-4"
                        dangerouslySetInnerHTML={{ __html: sanitizedQuestion.statement }} 
                      />
                    )}
                    
                    {q.question_type === 'multiple_choice' && (
                      <div className="space-y-2 pl-4 border-l-2 border-gray-200 dark:border-gray-600">
                        {(q.content.options || []).map((option, optIndex) => (
                          <div 
                            key={optIndex}
                            className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-400"
                          >
                            <span className="w-6 h-6 rounded-full border flex items-center justify-center text-xs font-bold flex-shrink-0">
                                {String.fromCharCode(65 + optIndex)}
                            </span>
                            <span>{option}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
            })
          ) : (
            <div className="text-center py-10 border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-xl">
                <i className="fas fa-clipboard-list text-4xl text-gray-300 mb-2"></i>
                <p className="text-gray-500">Nenhuma questão disponível para visualização.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}