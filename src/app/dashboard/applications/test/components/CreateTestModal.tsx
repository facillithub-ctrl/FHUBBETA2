"use client";

import { useState, useRef, useEffect, useTransition } from 'react';
import QuestionEditor from './QuestionEditor';
import { createFullTest } from '../actions';
import { useToast } from '@/contexts/ToastContext';
import createClient from '@/utils/supabase/client';
import Image from 'next/image';
import { Question } from '../types';

type Props = {
  isOpen: boolean; // Adicionado
  onClose: () => void;
  onSuccess: () => void; // Adicionado
  classes?: { id: string; name: string }[]; // Opcional
  isInstitutional?: boolean; // Opcional
};

const AI_PROMPT_TEMPLATE = `Crie um simulado JSON para a matéria [MATÉRIA]:
{
  "title": "...",
  "description": "...",
  "subject": "...",
  "difficulty": "medio",
  "questions": [
    {
      "statement": "...",
      "question_type": "multiple_choice",
      "options": ["A", "B", "C", "D"],
      "correct_option": 0,
      "metadata": { "bloom_taxonomy": "analisar" }
    }
  ]
}`;

export default function CreateTestModal({ isOpen, onClose, onSuccess, classes = [], isInstitutional = false }: Props) {
  const [testDetails, setTestDetails] = useState({
      title: '',
      description: '',
      test_type: 'avaliativo' as 'avaliativo' | 'pesquisa',
      cover_image_url: '',
      subject: '',
      difficulty: 'medio',
      duration_minutes: 60,
      class_id: ''
  });
  
  const [questions, setQuestions] = useState<Question[]>([]);
  const [step, setStep] = useState(1);
  const [importMode, setImportMode] = useState(false);
  const [jsonInput, setJsonInput] = useState('');
  
  const [isPending, startTransition] = useTransition();
  const [isUploading, setIsUploading] = useState(false);
  const { addToast } = useToast();
  const supabase = createClient();
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  // --- UPLOAD DE CAPA ---
  const handleCoverUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
        const fileExt = file.name.split('.').pop();
        const fileName = `cover-${Date.now()}.${fileExt}`;
        const filePath = `${fileName}`;

        const { error: uploadError } = await supabase.storage.from('test-covers').upload(filePath, file);
        if (uploadError) throw uploadError;

        const { data } = supabase.storage.from('test-covers').getPublicUrl(filePath);
        setTestDetails(prev => ({ ...prev, cover_image_url: data.publicUrl }));
        addToast({ title: "Sucesso", message: "Imagem carregada!", type: 'success' });
    } catch (error: any) {
        addToast({ title: "Erro", message: "Falha no upload da imagem.", type: 'error' });
    } finally {
        setIsUploading(false);
    }
  };

  // --- IMPORTAÇÃO JSON ---
  const processJsonImport = () => {
      try {
          const parsed = JSON.parse(jsonInput);
          setTestDetails(prev => ({ ...prev, ...parsed }));

          if (Array.isArray(parsed.questions)) {
              const mappedQs: Question[] = parsed.questions.map((q: any) => ({
                  id: crypto.randomUUID(),
                  question_type: q.question_type || 'multiple_choice',
                  points: q.points || 1,
                  content: { statement: q.statement || '', options: q.options || [], correct_option: q.correct_option },
                  metadata: {
                      bloom_taxonomy: q.metadata?.bloom_taxonomy || null,
                      ai_explanation: q.metadata?.ai_explanation || null
                  }
              }));
              setQuestions(mappedQs);
              addToast({ title: "Sucesso", message: "Questões importadas!", type: 'success' });
              setImportMode(false);
              setStep(2);
          }
      } catch (e) {
          addToast({ title: "JSON Inválido", message: "Verifique a formatação.", type: 'error' });
      }
  };

  // --- GESTÃO DE QUESTÕES ---
  const addQuestion = () => {
    setQuestions(prev => [...prev, {
        id: crypto.randomUUID(),
        question_type: 'multiple_choice',
        content: { statement: '', options: [''], correct_option: 0 },
        points: 1,
        metadata: { bloom_taxonomy: null }
    }]);
  };

  const updateQuestion = (updatedQ: Question) => setQuestions(qs => qs.map(q => q.id === updatedQ.id ? updatedQ : q));
  const removeQuestion = (id: string) => setQuestions(qs => qs.filter(q => q.id !== id));

  // --- SUBMIT ---
  const handleSubmit = () => {
    if (!testDetails.title) return addToast({ title: "Erro", message: "Título obrigatório.", type: 'error' });
    if (questions.length === 0) return addToast({ title: "Erro", message: "Adicione questões.", type: 'error' });

    startTransition(async () => {
        const result = await createFullTest({ ...testDetails }, questions);

        if (result.error) {
            addToast({ title: "Erro ao salvar", message: result.error, type: 'error' });
        } else {
            addToast({ title: "Sucesso!", message: "Simulado criado.", type: 'success' });
            onSuccess();
        }
    });
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-[100] flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-900 rounded-xl shadow-2xl w-full max-w-4xl h-[90vh] flex flex-col animate-in zoom-in-95">
        
        {/* Header */}
        <div className="p-5 border-b dark:border-gray-700 flex justify-between items-center bg-gray-50 dark:bg-gray-800">
            <h3 className="text-xl font-bold dark:text-white flex items-center gap-2">
                <i className="fas fa-edit text-royal-blue"></i> Criar Avaliação
            </h3>
            <div className="flex gap-2">
                {!importMode && step === 1 && (
                    <button onClick={() => setImportMode(true)} className="bg-purple-100 text-purple-700 px-3 py-1.5 rounded-lg text-sm font-bold flex items-center gap-2 hover:bg-purple-200">
                        <i className="fas fa-magic"></i> IA / JSON
                    </button>
                )}
                <button onClick={onClose} className="text-gray-500 hover:text-red-500 text-2xl">&times;</button>
            </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 bg-gray-50/50 dark:bg-gray-900 custom-scrollbar">
            
            {importMode ? (
                <div className="max-w-2xl mx-auto space-y-4">
                    <div className="bg-blue-50 p-4 rounded-lg border border-blue-100 text-sm">
                        <p className="font-bold text-blue-800 mb-2">Use IA para gerar o teste:</p>
                        <button onClick={() => navigator.clipboard.writeText(AI_PROMPT_TEMPLATE)} className="underline text-blue-600">Copiar Prompt</button>
                    </div>
                    <textarea 
                        className="w-full h-80 p-4 font-mono text-xs bg-gray-900 text-green-400 rounded-lg"
                        placeholder='Cole o JSON aqui...'
                        value={jsonInput}
                        onChange={e => setJsonInput(e.target.value)}
                    />
                    <div className="flex justify-end gap-2">
                        <button onClick={() => setImportMode(false)} className="px-4 py-2 rounded-lg bg-gray-200 font-bold text-gray-700">Cancelar</button>
                        <button onClick={processJsonImport} disabled={!jsonInput} className="px-4 py-2 rounded-lg bg-royal-blue text-white font-bold hover:bg-blue-700 disabled:opacity-50">Importar</button>
                    </div>
                </div>
            ) : (
                <>
                    {step === 1 && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
                            <div className="md:col-span-2 space-y-4">
                                <div>
                                    <label className="block text-sm font-bold mb-1">Título</label>
                                    <input type="text" className="w-full p-2 border rounded" value={testDetails.title} onChange={e => setTestDetails({...testDetails, title: e.target.value})} placeholder="Ex: Simulado ENEM" />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold mb-1">Descrição</label>
                                    <textarea className="w-full p-2 border rounded" rows={3} value={testDetails.description} onChange={e => setTestDetails({...testDetails, description: e.target.value})} placeholder="Instruções..." />
                                </div>
                            </div>

                            {/* UPLOAD CAPA */}
                            <div className="md:col-span-2 bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Capa do Simulado</label>
                                <div className="flex items-center gap-4">
                                    {testDetails.cover_image_url ? (
                                        <div className="relative group w-24 h-24">
                                            <Image src={testDetails.cover_image_url} alt="Capa" fill className="rounded-md object-cover border" />
                                            <button onClick={() => setTestDetails(p => ({...p, cover_image_url: ''}))} className="absolute top-0 right-0 bg-red-500 text-white rounded-full p-1 w-6 h-6 flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition">&times;</button>
                                        </div>
                                    ) : (
                                        <div className="w-24 h-24 rounded-md bg-gray-100 dark:bg-gray-700 flex items-center justify-center text-gray-400">
                                            <i className="fas fa-image text-2xl"></i>
                                        </div>
                                    )}
                                    <div className="flex-1">
                                        <input type="file" ref={fileInputRef} onChange={handleCoverUpload} accept="image/*" className="hidden" />
                                        <button type="button" onClick={() => fileInputRef.current?.click()} disabled={isUploading} className="bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 text-gray-700 dark:text-gray-300 px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 transition-colors">
                                            {isUploading ? <i className="fas fa-spinner fa-spin"></i> : <i className="fas fa-upload"></i>}
                                            Escolher Imagem
                                        </button>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium mb-1">Matéria</label>
                                    <select className="w-full p-2 border rounded bg-white dark:bg-gray-800" value={testDetails.subject} onChange={e => setTestDetails({...testDetails, subject: e.target.value})}>
                                        <option value="">Selecione...</option>
                                        <option value="Matemática">Matemática</option>
                                        <option value="Português">Português</option>
                                        <option value="Biologia">Biologia</option>
                                        <option value="História">História</option>
                                        <option value="Geografia">Geografia</option>
                                        <option value="Física">Física</option>
                                        <option value="Química">Química</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">Dificuldade</label>
                                    <select className="w-full p-2 border rounded bg-white dark:bg-gray-800" value={testDetails.difficulty} onChange={e => setTestDetails({...testDetails, difficulty: e.target.value})}>
                                        <option value="facil">Fácil</option>
                                        <option value="medio">Médio</option>
                                        <option value="dificil">Difícil</option>
                                    </select>
                                </div>
                            </div>

                            {/* SELECT DE TURMA SEGURO */}
                            {isInstitutional && (
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium mb-1">Atribuir a Turma</label>
                                    <select 
                                        className="w-full p-2 border rounded bg-white dark:bg-gray-800" 
                                        value={testDetails.class_id} 
                                        onChange={e => setTestDetails({...testDetails, class_id: e.target.value})}
                                    >
                                        <option value="">Selecione...</option>
                                        {/* SAFEGUARD: Verifica se classes existe antes do map */}
                                        {(classes || []).map(c => (
                                            <option key={c.id} value={c.id}>{c.name}</option>
                                        ))}
                                    </select>
                                </div>
                            )}
                        </div>
                    )}

                    {step === 2 && (
                        <div className="space-y-6">
                            <div className="flex justify-between items-center sticky top-0 bg-white dark:bg-gray-900 z-10 p-2 border-b dark:border-gray-700">
                                <h3 className="font-bold text-lg">Questões ({questions.length})</h3>
                                <button onClick={addQuestion} className="bg-royal-blue text-white px-3 py-1.5 rounded-lg font-bold text-sm flex items-center gap-2"><i className="fas fa-plus"></i> Adicionar</button>
                            </div>
                            
                            {/* SAFEGUARD: Verifica se questions existe antes do map */}
                            {(questions || []).map((q, i) => (
                                <div key={q.id} className="relative pl-8 animate-in slide-in-from-bottom-2">
                                    <div className="absolute left-0 top-6 w-6 h-6 rounded-full bg-royal-blue text-white flex items-center justify-center text-xs font-bold">{i + 1}</div>
                                    <QuestionEditor question={q} onUpdate={updateQuestion} onRemove={removeQuestion} isSurvey={testDetails.test_type === 'pesquisa'} />
                                </div>
                            ))}
                        </div>
                    )}
                </>
            )}
        </div>

        {/* Footer */}
        {!importMode && (
            <div className="p-4 border-t dark:border-gray-700 bg-white dark:bg-gray-800 flex justify-between rounded-b-lg">
                <button onClick={() => setStep(s => Math.max(1, s - 1))} disabled={step === 1} className="px-6 py-2 rounded-lg font-bold text-gray-600 hover:bg-gray-100 disabled:opacity-50">Voltar</button>
                {step < 2 ? (
                    <button onClick={() => setStep(2)} className="bg-royal-blue text-white px-6 py-2 rounded-lg font-bold hover:bg-blue-700">Próximo</button>
                ) : (
                    <button onClick={handleSubmit} disabled={isPending} className="bg-green-600 text-white px-8 py-2 rounded-lg font-bold hover:bg-green-700 flex items-center gap-2 shadow-lg">
                        {isPending ? <i className="fas fa-spinner fa-spin"></i> : <i className="fas fa-check"></i>} Publicar
                    </button>
                )}
            </div>
        )}
      </div>
    </div>
  );
}