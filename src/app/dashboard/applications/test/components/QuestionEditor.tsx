"use client";

import { useState, useEffect } from 'react';
import RichTextEditor from '@/components/DynamicRichTextEditor';
import { Question, QuestionContent, QuestionMetadata } from '../types';

type Props = {
  question: Question;
  onUpdate: (updatedQuestion: Question) => void;
  onRemove: (questionId: string) => void;
  isSurvey: boolean;
};

const BLOOM_OPTIONS = ['lembrar', 'compreender', 'aplicar', 'analisar', 'avaliar', 'criar'];
const SKILL_OPTIONS = ['interpretacao', 'calculo', 'memorizacao', 'analise_grafica', 'logica', 'gramatica', 'vocabulario'];
const DIFFICULTY_OPTIONS = ['facil', 'medio', 'dificil', 'muito_dificil'];

export default function QuestionEditor({ question, onUpdate, onRemove, isSurvey }: Props) {
  const [localQuestion, setLocalQuestion] = useState<Question>(question);
  const [showAdvanced, setShowAdvanced] = useState(false);

  useEffect(() => {
    setLocalQuestion(question);
  }, [question]);

  const handleUpdate = (field: string, value: any) => {
    const updatedQuestion = { ...localQuestion };
    
    if (field.startsWith('content.')) {
        const key = field.split('.')[1] as keyof QuestionContent;
        // @ts-ignore
        updatedQuestion.content = { ...updatedQuestion.content, [key]: value };
    } else if (field.startsWith('metadata.')) {
        const key = field.split('.')[1] as keyof QuestionMetadata;
        updatedQuestion.metadata = { ...(updatedQuestion.metadata || {}), [key]: value };
    } else {
        // @ts-ignore
        updatedQuestion[field] = value;
    }

    setLocalQuestion(updatedQuestion);
    onUpdate(updatedQuestion);
  };
  
  const handleOptionChange = (index: number, value: string) => {
    const newOptions = [...(localQuestion.content.options || [])];
    newOptions[index] = value;
    handleUpdate('content.options', newOptions);
  };

  const addOption = () => {
    const newOptions = [...(localQuestion.content.options || []), ''];
    handleUpdate('content.options', newOptions);
  };

  const removeOption = (index: number) => {
    const newOptions = (localQuestion.content.options || []).filter((_, i) => i !== index);
    let newCorrectOption = localQuestion.content.correct_option;
    if (newCorrectOption === index) {
      newCorrectOption = undefined;
    } else if (newCorrectOption && newCorrectOption > index) {
      newCorrectOption = newCorrectOption - 1;
    }
    
    const updatedQuestion = { 
        ...localQuestion, 
        content: { ...localQuestion.content, options: newOptions, correct_option: newCorrectOption }
    };
    setLocalQuestion(updatedQuestion);
    onUpdate(updatedQuestion);
  };

  return (
    <div className="p-6 border rounded-xl bg-white dark:bg-gray-800 shadow-sm space-y-5 relative transition-all duration-200 hover:shadow-md">
        {/* Cabeçalho */}
        <div className="flex justify-between items-start border-b pb-4 dark:border-gray-700">
            <div className="flex flex-wrap items-center gap-3">
                 <div className="bg-royal-blue/10 text-royal-blue px-3 py-1 rounded-md text-sm font-bold">
                    Questão de {localQuestion.points} pts
                 </div>
                 <select
                    value={localQuestion.question_type}
                    onChange={(e) => handleUpdate('question_type', e.target.value)}
                    className="font-semibold text-sm p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:ring-2 focus:ring-royal-blue/50 outline-none"
                 >
                    <option value="multiple_choice">Múltipla Escolha</option>
                    <option value="dissertation">Dissertativa</option>
                    <option value="true_false">Verdadeiro / Falso</option>
                </select>
            </div>
            <div className="flex gap-2">
                <button 
                    type="button" 
                    onClick={() => setShowAdvanced(!showAdvanced)} 
                    className={`text-sm px-3 py-1.5 rounded-md transition-colors flex items-center gap-2 ${showAdvanced ? 'bg-royal-blue text-white' : 'text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700'}`}
                >
                  <i className={`fas ${showAdvanced ? 'fa-chevron-up' : 'fa-sliders-h'}`}></i> 
                  {showAdvanced ? 'Ocultar Detalhes' : 'Avançado'}
                </button>
                <button 
                    type="button" 
                    onClick={() => onRemove(question.id)} 
                    className="text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 text-sm px-3 py-1.5 rounded-md transition-colors"
                >
                  <i className="fas fa-trash-alt"></i>
                </button>
            </div>
        </div>
      
      {/* Área de Metadados Avançados (Bloom 2.0) */}
      {showAdvanced && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 bg-gray-50 dark:bg-gray-700/30 rounded-lg animate-in fade-in slide-in-from-top-2 border border-gray-100 dark:border-gray-700">
              <div>
                  <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase mb-1 block">Taxonomia (Bloom)</label>
                  <select 
                    className="w-full p-2 text-sm border rounded bg-white dark:bg-gray-800 dark:border-gray-600 outline-none focus:border-royal-blue"
                    value={localQuestion.metadata?.bloom_taxonomy || ''}
                    onChange={(e) => handleUpdate('metadata.bloom_taxonomy', e.target.value)}
                  >
                      <option value="">Selecione...</option>
                      {BLOOM_OPTIONS.map(o => <option key={o} value={o}>{o.charAt(0).toUpperCase() + o.slice(1)}</option>)}
                  </select>
              </div>
              <div>
                  <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase mb-1 block">Habilidade</label>
                  <select 
                    className="w-full p-2 text-sm border rounded bg-white dark:bg-gray-800 dark:border-gray-600 outline-none focus:border-royal-blue"
                    value={localQuestion.metadata?.cognitive_skill || ''}
                    onChange={(e) => handleUpdate('metadata.cognitive_skill', e.target.value)}
                  >
                       <option value="">Selecione...</option>
                      {SKILL_OPTIONS.map(o => <option key={o} value={o}>{o.charAt(0).toUpperCase() + o.slice(1).replace('_', ' ')}</option>)}
                  </select>
              </div>
              <div>
                  <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase mb-1 block">Dificuldade</label>
                  <select 
                    className="w-full p-2 text-sm border rounded bg-white dark:bg-gray-800 dark:border-gray-600 outline-none focus:border-royal-blue"
                    value={localQuestion.metadata?.difficulty_level || ''}
                    onChange={(e) => handleUpdate('metadata.difficulty_level', e.target.value)}
                  >
                       <option value="">Selecione...</option>
                      {DIFFICULTY_OPTIONS.map(o => <option key={o} value={o}>{o.charAt(0).toUpperCase() + o.slice(1).replace('_', ' ')}</option>)}
                  </select>
              </div>
              <div>
                  <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase mb-1 block">Tempo (min)</label>
                  <input 
                    type="number" 
                    className="w-full p-2 text-sm border rounded bg-white dark:bg-gray-800 dark:border-gray-600 outline-none focus:border-royal-blue"
                    placeholder="Ex: 3"
                    value={localQuestion.metadata?.estimated_time_seconds ? localQuestion.metadata.estimated_time_seconds / 60 : ''}
                    onChange={(e) => handleUpdate('metadata.estimated_time_seconds', Number(e.target.value) * 60)}
                  />
              </div>
          </div>
      )}

      {/* Conteúdo Principal */}
      <div className="space-y-4">
        <div>
            <label className="text-xs font-bold text-gray-400 uppercase mb-1 block">Texto Base / Contexto (Opcional)</label>
            <RichTextEditor
                value={localQuestion.content.base_text || ''}
                onChange={(value) => handleUpdate('content.base_text', value)}
                placeholder="Insira textos de apoio, imagens ou gráficos aqui..."
                height={120}
            />
        </div>

        <div>
             <label className="text-sm font-bold text-dark-text dark:text-white mb-2 block">Enunciado da Questão <span className="text-red-500">*</span></label>
             <RichTextEditor
                value={localQuestion.content.statement}
                onChange={(value) => handleUpdate('content.statement', value)}
                placeholder="Digite a pergunta principal..."
            />
        </div>
      </div>

      {/* Alternativas */}
      {localQuestion.question_type === 'multiple_choice' && (
        <div className="space-y-3 mt-6 p-4 bg-gray-50/50 dark:bg-gray-800/30 rounded-lg border border-gray-100 dark:border-gray-700">
          <h5 className="text-xs font-bold text-gray-500 uppercase flex items-center gap-2">
            <i className="fas fa-list-ul"></i> Alternativas
          </h5>
          <div className="space-y-2">
            {(localQuestion.content.options || []).map((option: string, index: number) => (
                <div key={index} className="flex items-center gap-3 group">
                    {!isSurvey && (
                        <div className="relative flex items-center justify-center cursor-pointer" title="Marcar como correta">
                             <input
                                type="radio"
                                name={`correct_option_${question.id}`}
                                checked={localQuestion.content.correct_option === index}
                                onChange={() => handleUpdate('content.correct_option', index)}
                                className="peer h-5 w-5 cursor-pointer appearance-none rounded-full border-2 border-gray-300 checked:border-royal-blue checked:bg-royal-blue transition-all"
                            />
                            <div className="absolute text-white text-[10px] pointer-events-none opacity-0 peer-checked:opacity-100">
                                <i className="fas fa-check"></i>
                            </div>
                        </div>
                    )}
                    <span className="font-mono text-gray-400 font-bold w-5 flex-shrink-0">{String.fromCharCode(65 + index)})</span>
                    <input
                        type="text"
                        value={option}
                        onChange={(e) => handleOptionChange(index, e.target.value)}
                        className="flex-grow p-2.5 bg-white border border-gray-200 rounded-lg text-sm focus:border-royal-blue focus:ring-2 focus:ring-royal-blue/20 transition-all dark:bg-gray-900 dark:border-gray-700 dark:text-white"
                        placeholder={`Alternativa ${String.fromCharCode(65 + index)}`}
                    />
                    <button 
                        type="button" 
                        onClick={() => removeOption(index)} 
                        className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 p-2 rounded-md transition-all"
                        title="Remover alternativa"
                    >
                        <i className="fas fa-times"></i>
                    </button>
                </div>
            ))}
          </div>
          <button 
            type="button" 
            onClick={addOption} 
            className="mt-2 text-sm font-bold text-royal-blue hover:text-blue-700 flex items-center gap-2 px-3 py-2 rounded-md hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors w-full justify-center border border-dashed border-royal-blue/30 hover:border-royal-blue"
          >
              <i className="fas fa-plus-circle"></i> Adicionar Alternativa
          </button>
        </div>
      )}

      {/* Campo de Explicação com IA */}
      <div className="pt-4 mt-4 border-t dark:border-gray-700">
           <div className="flex justify-between items-center mb-2">
               <label className="text-xs font-bold text-green-600 dark:text-green-400 uppercase flex items-center gap-2">
                   <i className="fas fa-magic"></i> Explicação do Gabarito (AI)
               </label>
               <button type="button" className="text-[10px] text-royal-blue hover:underline bg-blue-50 px-2 py-0.5 rounded">
                   <i className="fas fa-robot mr-1"></i>Gerar com IA
               </button>
           </div>
           <textarea
                className="w-full p-3 text-sm border rounded-lg bg-green-50/30 border-green-100 dark:bg-gray-800 dark:border-gray-600 focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition-all"
                rows={2}
                placeholder="Explique o raciocínio da resposta correta (será exibido ao aluno após a correção)..."
                value={localQuestion.metadata?.ai_explanation || ''}
                onChange={(e) => handleUpdate('metadata.ai_explanation', e.target.value)}
           />
       </div>
    </div>
  );
}