"use client";

import { useState, useEffect } from 'react';
import { getEssayDetails, submitCorrection } from '../actions';
import { useToast } from '@/contexts/ToastContext';
import Image from 'next/image';
import NativeRichTextEditor from '@/components/NativeRichTextEditor';

export default function CorrectionInterface({ essayId, onBack }: { essayId: string, onBack: () => void }) {
  const [essay, setEssay] = useState<any>(null);
  const [grades, setGrades] = useState({ c1: 0, c2: 0, c3: 0, c4: 0, c5: 0 });
  const [feedback, setFeedback] = useState('');
  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);
  const { addToast } = useToast();

  useEffect(() => {
    getEssayDetails(essayId).then(res => {
        if(res.data) setEssay(res.data);
        setLoading(false);
    });
  }, [essayId]);

  const handleAI = async () => {
    if (!essay?.content) return addToast({title: "Erro", message: "Sem texto para analisar", type: "error"});
    setAnalyzing(true);
    try {
        const res = await fetch('/api/generate-feedback', {
            method: 'POST',
            body: JSON.stringify({ text: essay.content, title: essay.title, theme: essay.prompts?.title })
        });
        const data = await res.json();
        
        if(data.error) throw new Error(data.error);

        // Preenche automaticamente
        setGrades({
            c1: data.grade_c1 || 0, c2: data.grade_c2 || 0, c3: data.grade_c3 || 0, c4: data.grade_c4 || 0, c5: data.grade_c5 || 0
        });
        
        // Preenche o feedback formatado
        const aiFeedbackText = `
            <h3>Análise da IA</h3>
            <p>${data.general_comment}</p>
            <ul>
                ${data.actionable_items.map((item: string) => `<li>${item}</li>`).join('')}
            </ul>
        `;
        setFeedback(aiFeedbackText);
        
        addToast({title: "Sucesso", message: "IA gerou a correção!", type: "success"});
    } catch (e) {
        addToast({title: "Erro IA", message: "Falha na análise", type: "error"});
    } finally {
        setAnalyzing(false);
    }
  };

  const handleSubmit = async () => {
    const final_grade = Object.values(grades).reduce((a,b) => a+b, 0);
    const res = await submitCorrection({
        essay_id: essayId,
        feedback,
        grade_c1: grades.c1, grade_c2: grades.c2, grade_c3: grades.c3, grade_c4: grades.c4, grade_c5: grades.c5,
        final_grade
    });
    
    if(res.error) addToast({title: "Erro", message: res.error, type: "error"});
    else {
        addToast({title: "Sucesso", message: "Correção enviada!", type: "success"});
        onBack();
    }
  };

  if (loading) return <div className="p-10 text-center">A carregar...</div>;
  if (!essay) return <div className="p-10 text-center">Redação não encontrada.</div>;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 p-4 pb-20">
        <div className="bg-white dark:bg-[#121212] p-6 rounded-lg shadow border border-gray-200 dark:border-gray-800">
            <h2 className="text-xl font-bold mb-4 text-gray-800 dark:text-white">{essay.title}</h2>
            <div className="prose dark:prose-invert max-w-none">
                {essay.image_submission_url ? 
                    <Image src={essay.image_submission_url} alt="Redação" width={600} height={800} className="w-full rounded" /> :
                    <div dangerouslySetInnerHTML={{ __html: essay.content }} />
                }
            </div>
        </div>

        <div className="bg-white dark:bg-[#121212] p-6 rounded-lg shadow border border-gray-200 dark:border-gray-800 h-fit sticky top-4">
            <div className="flex justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-800 dark:text-white">Correção</h2>
                <button onClick={handleAI} disabled={analyzing} className="bg-[#42047e] text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 hover:opacity-90">
                    {analyzing ? "A Analisar..." : "✨ Usar IA"}
                </button>
            </div>

            <div className="grid grid-cols-5 gap-2 mb-6">
                {[1,2,3,4,5].map(c => (
                    <div key={c}>
                        <label className="text-xs font-bold text-gray-500">C{c}</label>
                        <input 
                            type="number" step="20" max="200"
                            value={(grades as any)[`c${c}`]}
                            onChange={e => setGrades({...grades, [`c${c}`]: Number(e.target.value)})}
                            className="w-full border dark:border-gray-700 rounded p-1 text-center bg-transparent dark:text-white"
                        />
                    </div>
                ))}
            </div>
            
            <div className="mb-4 font-bold text-right text-xl text-[#42047e]">
                Total: {Object.values(grades).reduce((a,b) => a+b, 0)}
            </div>

            <div className="mb-6">
                <label className="block font-bold mb-2 text-gray-700 dark:text-gray-300">Feedback</label>
                <NativeRichTextEditor value={feedback} onChange={setFeedback} />
            </div>

            <div className="flex gap-2">
                <button onClick={onBack} className="flex-1 border py-2 rounded-lg font-bold text-gray-600 hover:bg-gray-100">Cancelar</button>
                <button onClick={handleSubmit} className="flex-1 bg-gradient-to-r from-[#42047e] to-[#07f49e] text-white py-2 rounded-lg font-bold hover:opacity-90">Enviar</button>
            </div>
        </div>
    </div>
  );
}