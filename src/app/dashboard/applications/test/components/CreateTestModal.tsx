"use client";

import { useState } from 'react';
import QuestionEditor from './QuestionEditor';
import { createFullTest } from '../actions';
import { useToast } from '@/contexts/ToastContext';
import { Question } from '../types';
import createClient from '@/utils/supabase/client'; // Client para upload

type CreateTestModalProps = {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
};

// Prompt padrão para facilitar a vida do usuário
const AI_PROMPT_TEMPLATE = `Crie um simulado no formato JSON para a matéria de [MATÉRIA] sobre o tema [TEMA]. 
O JSON deve conter:
1. "title": Título
2. "description": Descrição
3. "subject": Matéria
4. "difficulty": "facil" | "medio" | "dificil"
5. "duration_minutes": 60
6. "test_type": "avaliativo"
7. "questions": Array com objetos:
   - "statement": Enunciado
   - "question_type": "multiple_choice"
   - "options": ["A", "B", "C", "D"]
   - "correct_option": 0
   - "points": 1
   - "metadata": { "bloom_taxonomy": "analisar" }
Retorne APENAS o JSON puro.`;

export default function CreateTestModal({ isOpen, onClose, onSuccess }: CreateTestModalProps) {
    const [step, setStep] = useState(1);
    const [importMode, setImportMode] = useState(false);
    const [jsonInput, setJsonInput] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const { addToast } = useToast();
    const supabase = createClient();

    const [testDetails, setTestDetails] = useState({
        title: '',
        description: '',
        subject: '',
        duration_minutes: 60,
        difficulty: 'medio',
        test_type: 'avaliativo',
        cover_image_url: ''
    });

    const [questions, setQuestions] = useState<Question[]>([]);

    if (!isOpen) return null;

    // --- UPLOAD DE IMAGEM ---
    const handleCoverUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files || e.target.files.length === 0) return;
        const file = e.target.files[0];
        
        setIsUploading(true);
        try {
            const fileExt = file.name.split('.').pop();
            const fileName = `cover-${Date.now()}.${fileExt}`;
            const filePath = `${fileName}`;

            const { error: uploadError } = await supabase.storage
                .from('test-covers') // Certifique-se que este bucket existe e é público
                .upload(filePath, file);

            if (uploadError) throw uploadError;

            const { data } = supabase.storage.from('test-covers').getPublicUrl(filePath);
            setTestDetails(prev => ({ ...prev, cover_image_url: data.publicUrl }));
            addToast({ title: "Capa enviada!", message: "Imagem anexada com sucesso.", type: "success" });
        } catch (error: any) {
            console.error("Upload error:", error);
            addToast({ title: "Erro no upload", message: "Falha ao enviar imagem. Verifique o tamanho ou tente outra.", type: "error" });
        } finally {
            setIsUploading(false);
        }
    };

    // --- IMPORTAÇÃO JSON ---
    const processJsonImport = () => {
        try {
            const parsed = JSON.parse(jsonInput);
            setTestDetails(prev => ({ ...prev, ...parsed, difficulty: parsed.difficulty || 'medio', test_type: parsed.test_type || 'avaliativo' }));
            
            if (Array.isArray(parsed.questions)) {
                const mappedQs: Question[] = parsed.questions.map((q: any) => ({
                    id: crypto.randomUUID(),
                    question_type: q.question_type || 'multiple_choice',
                    points: q.points || 1,
                    content: { statement: q.statement || '', options: q.options || [], correct_option: q.correct_option },
                    metadata: { 
                        bloom_taxonomy: q.metadata?.bloom_taxonomy || null, // Importante: null se não existir
                        difficulty_level: q.metadata?.difficulty_level || 'medio'
                    }
                }));
                setQuestions(mappedQs);
                addToast({ title: "Importado!", message: `${mappedQs.length} questões carregadas.`, type: "success" });
                setImportMode(false);
                setStep(2);
            }
        } catch (e) {
            addToast({ title: "JSON Inválido", message: "Verifique a sintaxe do seu JSON.", type: "error" });
        }
    };

    // --- AÇÕES MANUAIS ---
    const handleAddQuestion = () => {
        setQuestions([...questions, {
            id: crypto.randomUUID(),
            question_type: 'multiple_choice',
            points: 1,
            content: { statement: '', options: ['', '', '', ''], correct_option: 0 },
            metadata: { bloom_taxonomy: 'lembrar', difficulty_level: 'medio' }
        }]);
    };

    const handleUpdateQuestion = (updatedQ: Question) => setQuestions(qs => qs.map(q => q.id === updatedQ.id ? updatedQ : q));
    const handleRemoveQuestion = (id: string) => setQuestions(qs => qs.filter(q => q.id !== id));

    const handleSubmit = async () => {
        if (!testDetails.title || !testDetails.subject) return addToast({ title: "Faltam dados", message: "Preencha Título e Matéria.", type: "warning" });
        if (questions.length === 0) return addToast({ title: "Sem questões", message: "Adicione pelo menos uma questão.", type: "error" });
        
        setIsSubmitting(true);
        const result = await createFullTest(testDetails, questions);
        setIsSubmitting(false);

        if (result.error) {
            addToast({ title: "Erro ao salvar", message: result.error, type: "error" });
        } else {
            addToast({ title: "Sucesso!", message: "Simulado criado.", type: "success" });
            onSuccess();
        }
    };

    return (
        <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white dark:bg-gray-900 w-full max-w-5xl h-[90vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
                
                {/* Header */}
                <div className="p-6 border-b dark:border-gray-700 flex justify-between items-center bg-gray-50 dark:bg-gray-800">
                    <h2 className="text-2xl font-bold dark:text-white flex items-center gap-2">
                        <i className="fas fa-edit text-royal-blue"></i> Criar Avaliação
                    </h2>
                    <div className="flex gap-2">
                        {!importMode && step === 1 && (
                            <button onClick={() => setImportMode(true)} className="bg-purple-100 text-purple-700 hover:bg-purple-200 px-4 py-2 rounded-lg font-bold text-sm flex items-center gap-2 transition-colors">
                                <i className="fas fa-magic"></i> Importar JSON
                            </button>
                        )}
                        <button onClick={onClose} className="text-gray-500 hover:text-red-500 bg-white dark:bg-gray-700 p-2 rounded-full w-10 h-10"><i className="fas fa-times"></i></button>
                    </div>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-8 custom-scrollbar bg-gray-50/30 dark:bg-gray-900">
                    {importMode ? (
                        <div className="max-w-3xl mx-auto space-y-4">
                            <div className="bg-blue-50 p-4 rounded-lg border border-blue-100 dark:bg-blue-900/20 text-sm text-blue-700 dark:text-blue-300">
                                <p className="mb-2 font-bold">Dica: Use IA para gerar.</p>
                                <button onClick={() => { navigator.clipboard.writeText(AI_PROMPT_TEMPLATE); addToast({title:"Copiado!", type:"success"}); }} className="underline">Copiar Prompt Padrão</button>
                            </div>
                            <textarea className="w-full h-96 p-4 font-mono text-xs bg-gray-900 text-green-400 rounded-xl" placeholder='Cole o JSON aqui...' value={jsonInput} onChange={e => setJsonInput(e.target.value)}></textarea>
                            <div className="flex justify-end gap-3">
                                <button onClick={() => setImportMode(false)} className="px-4 py-2 rounded-lg font-bold text-gray-600 hover:bg-gray-200">Cancelar</button>
                                <button onClick={processJsonImport} disabled={!jsonInput} className="bg-royal-blue text-white px-6 py-2 rounded-lg font-bold hover:bg-blue-700">Importar</button>
                            </div>
                        </div>
                    ) : (
                        <>
                            {step === 1 && (
                                <div className="space-y-6 max-w-3xl mx-auto animate-in fade-in">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="md:col-span-2">
                                            <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">Título</label>
                                            <input type="text" className="w-full p-3 border rounded-lg text-lg font-bold dark:bg-gray-800 dark:text-white" value={testDetails.title} onChange={e => setTestDetails({...testDetails, title: e.target.value})} />
                                        </div>
                                        
                                        {/* UPLOAD DE CAPA */}
                                        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
                                            <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Capa do Simulado</label>
                                            <div className="flex items-center gap-3">
                                                {testDetails.cover_image_url ? (
                                                    <img src={testDetails.cover_image_url} alt="Capa" className="w-16 h-16 rounded object-cover border" />
                                                ) : (
                                                    <div className="w-16 h-16 rounded bg-gray-100 dark:bg-gray-700 flex items-center justify-center text-gray-400"><i className="fas fa-image"></i></div>
                                                )}
                                                <div className="flex-1">
                                                    <label className="cursor-pointer bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 text-gray-700 dark:text-gray-300 px-4 py-2 rounded text-sm font-bold block text-center transition-colors">
                                                        {isUploading ? "Enviando..." : "Escolher Arquivo"}
                                                        <input type="file" accept="image/*" className="hidden" onChange={handleCoverUpload} disabled={isUploading} />
                                                    </label>
                                                    <input type="text" className="w-full mt-2 p-1.5 text-xs border rounded dark:bg-gray-900 dark:border-gray-600" placeholder="Ou cole URL..." value={testDetails.cover_image_url} onChange={e => setTestDetails({...testDetails, cover_image_url: e.target.value})} />
                                                </div>
                                            </div>
                                        </div>

                                        <div className="space-y-4">
                                            <div>
                                                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">Matéria</label>
                                                <select className="w-full p-3 border rounded-lg dark:bg-gray-800 dark:text-white" value={testDetails.subject} onChange={e => setTestDetails({...testDetails, subject: e.target.value})}>
                                                    <option value="">Selecione...</option>
                                                    <option value="Matemática">Matemática</option>
                                                    <option value="Português">Português</option>
                                                    <option value="Biologia">Biologia</option>
                                                    <option value="História">História</option>
                                                    <option value="Geografia">Geografia</option>
                                                    <option value="Física">Física</option>
                                                    <option value="Química">Química</option>
                                                    <option value="Inglês">Inglês</option>
                                                </select>
                                            </div>
                                            <div>
                                                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">Dificuldade</label>
                                                <select className="w-full p-3 border rounded-lg dark:bg-gray-800 dark:text-white" value={testDetails.difficulty} onChange={e => setTestDetails({...testDetails, difficulty: e.target.value})}>
                                                    <option value="facil">Fácil</option>
                                                    <option value="medio">Médio</option>
                                                    <option value="dificil">Difícil</option>
                                                </select>
                                            </div>
                                        </div>
                                    </div>
                                    <textarea className="w-full p-3 border rounded-lg h-24 dark:bg-gray-800 dark:text-white mt-4" placeholder="Instruções..." value={testDetails.description} onChange={e => setTestDetails({...testDetails, description: e.target.value})}></textarea>
                                </div>
                            )}

                            {step === 2 && (
                                <div className="space-y-8 animate-in slide-in-from-right-4">
                                     <div className="flex justify-between items-center sticky top-0 bg-white dark:bg-gray-800 z-10 p-2 border-b">
                                         <h3 className="font-bold text-xl dark:text-white">Questões ({questions.length})</h3>
                                         <button onClick={handleAddQuestion} className="bg-royal-blue text-white px-4 py-2 rounded-lg font-bold flex items-center gap-2 hover:bg-blue-700"><i className="fas fa-plus"></i> Adicionar</button>
                                     </div>
                                     {questions.map((q, i) => (
                                         <div key={q.id} className="relative pl-8">
                                             <div className="absolute left-0 top-6 w-6 h-6 rounded-full bg-royal-blue text-white flex items-center justify-center text-xs font-bold">{i + 1}</div>
                                             <QuestionEditor question={q} onUpdate={handleUpdateQuestion} onRemove={handleRemoveQuestion} isSurvey={testDetails.test_type === 'pesquisa'} />
                                         </div>
                                     ))}
                                </div>
                            )}

                            {step === 3 && (
                                <div className="max-w-xl mx-auto text-center space-y-6 animate-in zoom-in">
                                    <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto text-4xl shadow-lg"><i className="fas fa-check"></i></div>
                                    <h3 className="text-2xl font-bold dark:text-white">Confirmar Publicação</h3>
                                    <div className="bg-gray-50 dark:bg-gray-800 p-6 rounded-xl text-left border dark:border-gray-700 grid grid-cols-2 gap-4">
                                        <div><span className="text-xs text-gray-500 uppercase font-bold">Título</span><p className="font-medium">{testDetails.title}</p></div>
                                        <div><span className="text-xs text-gray-500 uppercase font-bold">Questões</span><p className="font-medium">{questions.length}</p></div>
                                        <div><span className="text-xs text-gray-500 uppercase font-bold">Matéria</span><p className="font-medium">{testDetails.subject}</p></div>
                                        <div><span className="text-xs text-gray-500 uppercase font-bold">Capa</span><p className="font-medium truncate text-blue-500">{testDetails.cover_image_url ? 'Imagem Anexada' : 'Sem Capa'}</p></div>
                                    </div>
                                </div>
                            )}
                        </>
                    )}
                </div>

                {/* Footer */}
                {!importMode && (
                    <div className="p-6 border-t dark:border-gray-700 bg-white dark:bg-gray-800 flex justify-between">
                        <button onClick={() => setStep(s => Math.max(1, s - 1))} disabled={step === 1} className="px-6 py-3 rounded-xl font-bold text-gray-600 hover:bg-gray-100 disabled:opacity-50">Voltar</button>
                        {step < 3 ? (
                             <button onClick={() => setStep(s => s + 1)} className="bg-royal-blue text-white px-8 py-3 rounded-xl font-bold hover:bg-blue-700 flex items-center gap-2">Próximo <i className="fas fa-arrow-right"></i></button>
                        ) : (
                            <button onClick={handleSubmit} disabled={isSubmitting} className="bg-green-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-green-700 flex items-center gap-2 shadow-lg">
                                {isSubmitting ? <i className="fas fa-spinner fa-spin"></i> : <i className="fas fa-check"></i>} Publicar Simulado
                            </button>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}