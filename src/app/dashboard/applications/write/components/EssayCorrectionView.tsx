"use client";

import { useEffect, useState } from 'react';
import { getEssayDetails, getCorrectionForEssay } from '../actions';
import Image from 'next/image';

export default function EssayCorrectionView({ essayId, onBack }: { essayId: string, onBack: () => void }) {
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const load = async () => {
            const [essayRes, correctionRes] = await Promise.all([
                getEssayDetails(essayId),
                getCorrectionForEssay(essayId)
            ]);
            
            if (essayRes.data) {
                // Se a correção vier, usamos. Se não, é null.
                setData({ 
                    essay: essayRes.data, 
                    correction: correctionRes.data || null 
                });
            }
            setLoading(false);
        };
        load();
    }, [essayId]);

    if (loading) return <div className="p-10 text-center animate-pulse text-[#42047e]">A carregar...</div>;
    if (!data) return <div className="p-10 text-center">Erro ao carregar dados.</div>;

    const { essay, correction } = data;

    // Lógica robusta: Se tem objeto de correção, está corrigida.
    const isCorrected = !!correction;

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-[#0a0a0a] p-6">
            <button onClick={onBack} className="mb-4 text-[#42047e] font-bold flex items-center gap-2 hover:underline">
                ← Voltar
            </button>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="bg-white dark:bg-[#121212] p-6 rounded-xl shadow border border-gray-200 dark:border-gray-800">
                    <h1 className="text-2xl font-bold mb-4 text-gray-800 dark:text-white">{essay.title || "Sem Título"}</h1>
                    <div className="prose dark:prose-invert max-w-none text-gray-600 dark:text-gray-300">
                        {essay.image_submission_url ? (
                            <Image src={essay.image_submission_url} alt="Redação" width={800} height={1000} className="w-full rounded" />
                        ) : (
                            <div dangerouslySetInnerHTML={{ __html: essay.content || "<p>Conteúdo indisponível</p>" }} />
                        )}
                    </div>
                </div>

                <div className="space-y-6">
                    {isCorrected ? (
                        <div className="bg-white dark:bg-[#121212] p-6 rounded-xl shadow border-t-4 border-[#42047e]">
                            <div className="flex justify-between items-center mb-6 border-b border-gray-100 dark:border-gray-800 pb-4">
                                <div>
                                    <p className="text-sm text-gray-500">Corrigido por</p>
                                    <p className="font-bold text-gray-800 dark:text-white">{correction.profiles?.full_name || "Professor"}</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-sm text-gray-500">Nota Final</p>
                                    <p className="text-4xl font-black text-[#42047e]">{correction.final_grade}</p>
                                </div>
                            </div>

                            <div className="space-y-3 mb-6">
                                {[1, 2, 3, 4, 5].map(c => (
                                    <div key={c} className="flex justify-between p-2 bg-gray-50 dark:bg-gray-900 rounded">
                                        <span className="text-sm font-bold text-gray-600 dark:text-gray-400">Competência {c}</span>
                                        <span className="font-bold text-[#42047e]">
                                            {correction[`grade_c${c}`] ?? '-'}
                                        </span>
                                    </div>
                                ))}
                            </div>

                            <div>
                                <h3 className="font-bold mb-2 text-gray-800 dark:text-white">Feedback</h3>
                                <div className="prose dark:prose-invert text-sm text-gray-600 dark:text-gray-300" dangerouslySetInnerHTML={{ __html: correction.feedback || "Sem comentários." }} />
                            </div>
                        </div>
                    ) : (
                        <div className="bg-yellow-50 dark:bg-yellow-900/20 p-6 rounded-xl border border-yellow-200 dark:border-yellow-800 text-center">
                            <p className="text-yellow-700 dark:text-yellow-500 font-bold">A aguardar correção...</p>
                            <p className="text-xs text-yellow-600/80 mt-2">A tua redação está na fila.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}