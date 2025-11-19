"use client";

import { useState, useEffect } from 'react';
import { Essay, EssayCorrection, getEssayDetails, submitCorrection, EssayPrompt } from '../actions'; // Importa as actions
import { useToast } from '@/contexts/ToastContext';
import Image from 'next/image';
import NativeRichTextEditor from '@/components/NativeRichTextEditor'; // Teu editor novo

type Props = {
  essayId: string;
  onBack: () => void;
};

export default function CorrectionInterface({ essayId, onBack }: Props) {
  const [essay, setEssay] = useState<Essay & { profiles: any, prompts: any } | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [isGeneratingAI, setIsGeneratingAI] = useState(false); // Estado da IA
  const { addToast } = useToast();

  // Estados do Formulário de Correção
  const [grades, setGrades] = useState({ c1: 0, c2: 0, c3: 0, c4: 0, c5: 0 });
  const [feedback, setFeedback] = useState('');
  
  useEffect(() => {
    const load = async () => {
        const res = await getEssayDetails(essayId);
        if (res.data) {
            // Fazemos um cast forçado seguro aqui ou ajustamos o tipo no getEssayDetails
            setEssay(res.data as any); 
        } else {
            addToast({ title: 'Erro', message: 'Redação não encontrada.', type: 'error' });
            onBack();
        }
        setLoading(false);
    };
    load();
  }, [essayId, addToast, onBack]);

  // 🟢 LÓGICA DA IA: Gera a correção e preenche o formulário
  const handleAIGenerate = async () => {
    if (!essay?.content) return;
    
    setIsGeneratingAI(true);
    addToast({ title: "IA a trabalhar...", message: "A analisar as 5 competências...", type: 'info' });

    try {
        const response = await fetch('/api/generate-feedback', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                text: essay.content,
                title: essay.title,
                theme: essay.prompts?.title
            })
        });

        const data = await response.json();
        if (!response.ok) throw new Error(data.error);

        // Preenche os inputs automaticamente
        setGrades({
            c1: data.grade_c1 || 0,
            c2: data.grade_c2 || 0,
            c3: data.grade_c3 || 0,
            c4: data.grade_c4 || 0,
            c5: data.grade_c5 || 0
        });

        // Preenche o editor de texto com o feedback geral + dicas
        const formattedFeedback = `
          <h3>Análise Geral</h3>
          <p>${data.general_comment}</p>
          <hr />
          <h3>Pontos de Atenção</h3>
          <ul>
            ${data.actionable_items?.map((item: string) => `<li>${item}</li>`).join('')}
          </ul>
        `;
        setFeedback(formattedFeedback);

        addToast({ title: "Sucesso!", message: "Sugestão de correção gerada. Por favor, revisa antes de enviar.", type: 'success' });

    } catch (error: any) {
        console.error(error);
        addToast({ title: "Erro na IA", message: "Falha ao gerar correção.", type: 'error' });
    } finally {
        setIsGeneratingAI(false);
    }
  };

  const handleSubmit = async () => {
    if (!essay) return;
    setSubmitting(true);

    const finalGrade = Object.values(grades).reduce((a, b) => a + b, 0);

    const correctionData = {
        essay_id: essay.id,
        feedback: feedback,
        grade_c1: grades.c1,
        grade_c2: grades.c2,
        grade_c3: grades.c3,
        grade_c4: grades.c4,
        grade_c5: grades.c5,
        final_grade: finalGrade,
        // Nota: Annotations podem ser adicionadas numa v2 do editor do professor
        annotations: [] 
    };

    const res = await submitCorrection(correctionData);

    if (res.error) {
        addToast({ title: "Erro", message: res.error, type: 'error' });
    } else {
        addToast({ title: "Corrigida!", message: "Redação enviada com sucesso.", type: 'success' });
        onBack();
    }
    setSubmitting(false);
  };

  if (loading) return <div className="p-8 text-center">A carregar dados...</div>;
  if (!essay) return null;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pb-20">
        {/* Coluna Esquerda: Redação do Aluno */}
        <div className="bg-white dark:bg-[#121212] p-6 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-800">
            <h2 className="text-xl font-bold mb-2 text-[#42047e]">{essay.title || "Sem Título"}</h2>
            <p className="text-sm text-gray-500 mb-6">Aluno: {essay.profiles?.full_name}</p>
            
            <div className="prose dark:prose-invert max-w-none bg-gray-50 dark:bg-gray-900 p-4 rounded-xl min-h-[500px]">
                {essay.image_submission_url ? (
                    <Image src={essay.image_submission_url} alt="Redação" width={600} height={800} className="w-full h-auto" />
                ) : (
                    <div dangerouslySetInnerHTML={{ __html: essay.content || '' }} />
                )}
            </div>
        </div>

        {/* Coluna Direita: Ferramentas de Correção */}
        <div className="bg-white dark:bg-[#121212] p-6 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-800 flex flex-col h-fit sticky top-6">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold">Avaliação</h2>
                <button 
                    onClick={handleAIGenerate} 
                    disabled={isGeneratingAI}
                    className="bg-gradient-to-r from-[#42047e] to-[#07f49e] text-white text-xs font-bold px-4 py-2 rounded-full hover:opacity-90 transition flex items-center gap-2 shadow-md"
                >
                   {isGeneratingAI ? <i className="fas fa-spinner fa-spin"></i> : <i className="fas fa-magic"></i>}
                   {isGeneratingAI ? "A Analisar..." : "Pré-Corrigir com IA"}
                </button>
            </div>

            {/* Inputs de Notas */}
            <div className="grid grid-cols-5 gap-2 mb-6">
                {[1, 2, 3, 4, 5].map((c) => (
                    <div key={c} className="flex flex-col items-center">
                        <label className="text-[10px] font-bold uppercase text-gray-500 mb-1">Comp. {c}</label>
                        <input 
                            type="number" 
                            min="0" max="200" step="40"
                            value={(grades as any)[`c${c}`]}
                            onChange={(e) => setGrades({ ...grades, [`c${c}`]: Number(e.target.value) })}
                            className="w-full text-center p-2 border rounded-lg font-bold focus:ring-[#07f49e] dark:bg-gray-800 dark:text-white"
                        />
                    </div>
                ))}
            </div>

            <div className="flex justify-between items-center mb-4 bg-gray-100 dark:bg-gray-800 p-3 rounded-lg">
                <span className="font-bold text-gray-700 dark:text-gray-300">Nota Final:</span>
                <span className="text-2xl font-black text-[#42047e] dark:text-[#07f49e]">
                    {Object.values(grades).reduce((a, b) => a + b, 0)}
                </span>
            </div>

            {/* Editor de Feedback do Professor */}
            <div className="flex-1 mb-6">
                <label className="block text-sm font-bold mb-2 text-gray-700 dark:text-gray-300">Feedback Escrito</label>
                <NativeRichTextEditor 
                    value={feedback} 
                    onChange={setFeedback} 
                    placeholder="Escreva os comentários para o aluno aqui..."
                />
            </div>

            <div className="flex gap-3">
                <button onClick={onBack} className="flex-1 py-3 rounded-xl border font-bold text-gray-500 hover:bg-gray-50">Cancelar</button>
                <button 
                    onClick={handleSubmit} 
                    disabled={submitting}
                    className="flex-1 py-3 rounded-xl bg-[#42047e] text-white font-bold hover:bg-[#350365] transition"
                >
                    {submitting ? 'A Enviar...' : 'Finalizar Correção'}
                </button>
            </div>
        </div>
    </div>
  );
}