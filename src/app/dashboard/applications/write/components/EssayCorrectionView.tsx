"use client";

import { useEffect, useState } from 'react';
import { Essay, EssayCorrection, Annotation, getEssayDetails, getCorrectionForEssay, AIFeedback } from '../actions';
import Image from 'next/image';
import FeedbackTabs from './FeedbackTabs';

type FullEssayDetails = Essay & {
  correction: (EssayCorrection & { profiles: any, ai_feedback: any }) | null;
  profiles: { full_name: string | null } | null;
};

const renderAnnotatedText = (text: string, annotations: Annotation[] | null | undefined) => {
    if (!text) return null;
    const textAnnotations = annotations?.filter(a => a.type === 'text' && a.selection) || [];
    
    if (textAnnotations.length === 0) return <div className="whitespace-pre-wrap">{text}</div>;

    let parts: (string | React.ReactNode)[] = [text];

    textAnnotations.forEach((anno) => {
        const newParts: (string | React.ReactNode)[] = [];
        parts.forEach(part => {
            if (typeof part === 'string') {
                const index = part.indexOf(anno.selection!);
                if (index !== -1) {
                    const before = part.substring(0, index);
                    const match = part.substring(index, index + anno.selection!.length);
                    const after = part.substring(index + anno.selection!.length);
                    
                    if (before) newParts.push(before);
                    newParts.push(
                        <span 
                            key={anno.id} 
                            className={`border-b-2 ${anno.marker === 'erro' ? 'border-red-500 bg-red-100 dark:bg-red-900/30' : anno.marker === 'acerto' ? 'border-green-500 bg-green-100 dark:bg-green-900/30' : 'border-blue-500 bg-blue-100 dark:bg-blue-900/30'} relative group cursor-help`}
                        >
                            {match}
                            <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 w-max max-w-xs px-2 py-1 bg-black text-white text-xs rounded opacity-0 group-hover:opacity-100 pointer-events-none z-10">
                                {anno.comment}
                            </span>
                        </span>
                    );
                    if (after) newParts.push(after);
                } else {
                    newParts.push(part);
                }
            } else {
                newParts.push(part);
            }
        });
        parts = newParts;
    });

    return <div className="whitespace-pre-wrap leading-relaxed">{parts}</div>;
};

export default function EssayCorrectionView({ essayId, onBack }: {essayId: string, onBack: () => void}) {
    const [details, setDetails] = useState<FullEssayDetails | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchDetails = async () => {
            const essayResult = await getEssayDetails(essayId);
            if (essayResult.data) {
                const correctionResult = await getCorrectionForEssay(essayId);
                setDetails({
                    ...(essayResult.data as FullEssayDetails),
                    correction: correctionResult.data as any,
                });
            }
            setIsLoading(false);
        };
        fetchDetails();
    }, [essayId]);

    if (isLoading) return <div className="text-center p-8">Carregando correção...</div>;
    if (!details) return <div className="text-center p-8">Erro ao carregar detalhes.</div>;

    const { title, content, correction, image_submission_url } = details;

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <button onClick={onBack} className="text-sm font-bold text-royal-blue flex items-center gap-2"><i className="fas fa-arrow-left"></i> Voltar</button>
                <h1 className="text-2xl font-bold dark:text-white">Visualização da Correção</h1>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="bg-white dark:bg-dark-card p-6 rounded-lg shadow border dark:border-dark-border">
                    <h2 className="font-bold text-xl mb-4 dark:text-white">{title}</h2>
                    {image_submission_url ? (
                        <div className="relative w-full">
                             <Image src={image_submission_url} alt="Redação" width={800} height={1000} className="w-full rounded-md" />
                             {correction?.annotations?.filter(a => a.type === 'image').map(a => (
                                <div 
                                    key={a.id} 
                                    className={`absolute border-2 group ${a.marker === 'erro' ? 'border-red-500 bg-red-500/20' : a.marker === 'acerto' ? 'border-green-500 bg-green-500/20' : 'border-blue-500 bg-blue-500/20'}`}
                                    style={{ left: `${a.position!.x}%`, top: `${a.position!.y}%`, width: `${a.position!.width}%`, height: `${a.position!.height}%` }}
                                >
                                    <span className="absolute -top-8 left-0 bg-black text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                                        {a.comment}
                                    </span>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="prose dark:prose-invert max-w-none bg-gray-50 dark:bg-gray-900/50 p-4 rounded-md">
                            {renderAnnotatedText(content!, correction?.annotations)}
                        </div>
                    )}
                </div>

                <div className="bg-white dark:bg-dark-card p-6 rounded-lg shadow border dark:border-dark-border space-y-6">
                    <div className="flex justify-between items-center border-b dark:border-gray-700 pb-4">
                        <h2 className="font-bold text-xl dark:text-white">Nota Final</h2>
                        <span className="text-3xl font-bold text-royal-blue">{correction?.final_grade}</span>
                    </div>

                    <div className="space-y-3">
                        {[1, 2, 3, 4, 5].map(i => (
                            <div key={i} className="flex justify-between items-center bg-gray-50 dark:bg-gray-800 p-3 rounded">
                                <span className="text-sm font-medium dark:text-gray-300">Competência {i}</span>
                                <span className="font-bold dark:text-white">{correction?.[`grade_c${i}` as keyof EssayCorrection]}</span>
                            </div>
                        ))}
                    </div>

                    <div className="pt-2">
                        <FeedbackTabs correction={correction} />
                    </div>
                </div>
            </div>
        </div>
    );
}