"use client";

import { useState, useEffect } from 'react';
import RichTextEditor from '@/components/DynamicRichTextEditor'; // Ou NativeRichTextEditor se preferir
import { Question, QuestionContent, BloomTaxonomy } from '../types';

type Props = {
  question: Question;
  onUpdate: (updatedQuestion: Question) => void;
  onRemove: (questionId: string) => void;
  isSurvey: boolean;
};

const BLOOM_OPTIONS: { val: BloomTaxonomy, label: string, color: string }[] = [
    { val: 'lembrar', label: 'Lembrar', color: 'bg-yellow-100 text-yellow-800' },
    { val: 'compreender', label: 'Compreender', color: 'bg-orange-100 text-orange-800' },
    { val: 'aplicar', label: 'Aplicar', color: 'bg-blue-100 text-blue-800' },
    { val: 'analisar', label: 'Analisar', color: 'bg-indigo-100 text-indigo-800' },
    { val: 'avaliar', label: 'Avaliar', color: 'bg-purple-100 text-purple-800' },
    { val: 'criar', label: 'Criar', color: 'bg-pink-100 text-pink-800' }
];

export default function QuestionEditor({ question, onUpdate, onRemove, isSurvey }: Props) {
  const [localQuestion, setLocalQuestion] = useState<Question>(question);
  
  // Estado local para controlar se o Bloom está ativo ("o botão de check")
  const [useBloom, setUseBloom] = useState(!!question.metadata?.bloom_taxonomy);

  useEffect(() => {
    setLocalQuestion(question);
  }, [question]);

  const handleUpdate = (field: string, value: any) => {
    const updatedQuestion = { ...localQuestion };
    
    if (field.startsWith('content.')) {
        const contentField = field.split('.')[1] as keyof QuestionContent;
        updatedQuestion.content = { ...updatedQuestion.content, [contentField]: value };
    } else if (field.startsWith('metadata.')) {
        const metaField = field.split('.')[1];
        // Garante que metadata existe antes de atribuir
        updatedQuestion.metadata = { ...(updatedQuestion.metadata || {}), [metaField]: value };
    } else {
        // @ts-ignore - Permite atualização dinâmica de campos raiz
        updatedQuestion[field] = value;
    }
    
    setLocalQuestion(updatedQuestion);
    onUpdate(updatedQuestion);
  };

  // Função do "Botão de Check" para Taxonomia
  const toggleBloom = (enabled: boolean) => {
      setUseBloom(enabled);
      if (enabled) {
          // Se ativou, define um valor padrão IMEDIATAMENTE para não ser vazio
          handleUpdate('metadata.bloom_taxonomy', 'lembrar');
      } else {
          // Se desativou, define como NULL/Undefined para limpar
          handleUpdate('metadata.bloom_taxonomy', null);
      }
  };

  return (
    <div className="p-5 border rounded-xl bg-white dark:bg-gray-800 shadow-sm space-y-4 transition-all hover:border-royal-blue/30">
        
        {/* CABEÇALHO DA QUESTÃO (Pontos, Tipo, Excluir) */}
        <div className="flex justify-between items-start border-b pb-3 dark:border-gray-700">
            <div className="flex items-center gap-3">
                 <span className="bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 px-3 py-1 rounded-md text-sm font-bold">
                    {localQuestion.points} pts
                 </span>
                 <select
                    value={localQuestion.question_type}
                    onChange={(e) => handleUpdate('question_type', e.target.value)}
                    className="text-sm font-semibold p-1.5 border rounded-md dark:bg-gray-700 dark:border-gray-600 bg-transparent outline-none focus:ring-2 focus:ring-royal-blue/20"
                 >
                    <option value="multiple_choice">Múltipla Escolha</option>
                    <option value="dissertation">Dissertativa</option>
                    <option value="true_false">V ou F</option>
                </select>
            </div>
            <button 
                type="button" 
                onClick={() => onRemove(question.id)} 
                className="text-gray-400 hover:text-red-500 transition-colors p-1 rounded-md hover:bg-red-50 dark:hover:bg-red-900/20"
                title="Remover questão"
            >
                <i className="fas fa-trash-alt"></i>
            </button>
        </div>

        {/* --- CONTROLE DE TAXONOMIA DE BLOOM --- */}
        <div className="bg-gray-50 dark:bg-gray-700/30 p-3 rounded-lg border border-gray-100 dark:border-gray-700">
            <div className="flex items-center justify-between mb-2">
                <label className="flex items-center gap-2 cursor-pointer">
                    <input 
                        type="checkbox" 
                        checked={useBloom} 
                        onChange={(e) => toggleBloom(e.target.checked)}
                        className="w-4 h-4 text-royal-blue rounded border-gray-300 focus:ring-royal-blue"
                    />
                    <span className="text-sm font-bold text-gray-700 dark:text-gray-300">Definir Taxonomia de Bloom?</span>
                </label>
            </div>

            {useBloom && (
                <div className="flex flex-wrap gap-2 animate-in fade-in slide-in-from-top-1">
                    {BLOOM_OPTIONS.map((opt) => (
                        <button
                            key={opt.val}
                            type="button"
                            onClick={() => handleUpdate('metadata.bloom_taxonomy', opt.val)}
                            className={`px-3 py-1 rounded-full text-xs font-bold border transition-all ${
                                localQuestion.metadata?.bloom_taxonomy === opt.val 
                                ? `${opt.color} border-current ring-2 ring-offset-1 ring-royal-blue/20` 
                                : 'bg-white dark:bg-gray-800 text-gray-500 border-gray-200 dark:border-gray-600 hover:bg-gray-100'
                            }`}
                        >
                            {opt.label}
                        </button>
                    ))}
                </div>
            )}
        </div>
      
        {/* --- ENUNCIADO --- */}
        <div className="space-y-2">
            <label className="text-xs font-bold text-gray-400 uppercase">Enunciado</label>
            <RichTextEditor
                value={localQuestion.content.statement}
                onChange={(value) => handleUpdate('content.statement', value)}
                placeholder="Digite a pergunta..."
                height={100} // Certifique-se que o RichTextEditor aceita essa prop ou a ignora
            />
        </div>

        {/* --- ALTERNATIVAS (Apenas para Múltipla Escolha) --- */}
        {localQuestion.question_type === 'multiple_choice' && (
            <div className="space-y-2">
                <div className="flex justify-between items-center">
                    <h5 className="text-xs font-bold text-gray-500 uppercase">Alternativas</h5>
                    <button 
                        type="button" 
                        onClick={() => handleUpdate('content.options', [...(localQuestion.content.options || []), ''])} 
                        className="text-xs text-royal-blue hover:underline font-bold"
                    >
                        + Adicionar
                    </button>
                </div>
                {(localQuestion.content.options || []).map((option, index) => (
                    <div key={index} className="flex items-center gap-2">
                        {!isSurvey && (
                            <div className="relative flex items-center justify-center w-6 h-6">
                                <input
                                    type="radio"
                                    name={`correct_${question.id}`}
                                    checked={localQuestion.content.correct_option === index}
                                    onChange={() => handleUpdate('content.correct_option', index)}
                                    className="peer h-4 w-4 cursor-pointer text-royal-blue focus:ring-royal-blue"
                                    title="Marcar como correta"
                                />
                                <span className="absolute text-green-500 opacity-0 peer-checked:opacity-100 pointer-events-none text-lg">
                                    <i className="fas fa-check-circle"></i>
                                </span>
                            </div>
                        )}
                        <input
                            type="text"
                            value={option}
                            onChange={(e) => {
                                const newOpts = [...(localQuestion.content.options || [])];
                                newOpts[index] = e.target.value;
                                handleUpdate('content.options', newOpts);
                            }}
                            className="flex-grow p-2 text-sm border rounded bg-white dark:bg-gray-800 dark:border-gray-600 focus:border-royal-blue outline-none transition-colors"
                            placeholder={`Opção ${String.fromCharCode(65 + index)}`}
                        />
                        <button 
                            type="button" 
                            onClick={() => {
                                const newOpts = localQuestion.content.options?.filter((_, i) => i !== index);
                                handleUpdate('content.options', newOpts);
                            }} 
                            className="text-gray-400 hover:text-red-500 transition-colors"
                            title="Remover opção"
                        >
                            <i className="fas fa-times"></i>
                        </button>
                    </div>
                ))}
            </div>
        )}
    </div>
  );
}