"use client";

import { useEffect, useState, ReactNode } from 'react';
import { Essay, EssayCorrection, Annotation, getEssayDetails, getCorrectionForEssay } from '../actions';
import Image from 'next/image';
import { VerificationBadge } from '@/components/VerificationBadge';
import FeedbackTabs from './FeedbackTabs';

type FullEssayDetails = Essay & {
  correction: EssayCorrection | null;
  profiles: { full_name: string | null } | null;
};

// Dados estáticos das competências
const competencyDetails = [
  { title: "C1: Norma Culta", description: "Domínio da modalidade escrita formal da língua portuguesa." },
  { title: "C2: Tema e Estrutura", description: "Compreensão da proposta e aplicação de conceitos das várias áreas de conhecimento." },
  { title: "C3: Argumentação", description: "Capacidade de selecionar, relacionar, organizar e interpretar informações." },
  { title: "C4: Coesão", description: "Conhecimento dos mecanismos linguísticos necessários para a construção da argumentação." },
  { title: "C5: Proposta de Intervenção", description: "Elaboração de proposta de intervenção para o problema abordado, respeitando os direitos humanos." },
];

// Estilos dos marcadores no texto
const markerStyles = {
    erro: { flag: 'text-red-500', highlight: 'bg-red-100 border-b-2 border-red-400 dark:bg-red-900/30' },
    acerto: { flag: 'text-green-500', highlight: 'bg-green-100 border-b-2 border-green-400 dark:bg-green-900/30' },
    sugestao: { flag: 'text-blue-500', highlight: 'bg-blue-100 border-b-2 border-blue-400 dark:bg-blue-900/30' },
};

// Função auxiliar para renderizar texto com anotações
const renderAnnotatedText = (text: string, annotations: Annotation[] | null | undefined): ReactNode => {
    const textAnnotations = annotations?.filter(a => a.type === 'text' && a.selection) || [];
    if (!text || textAnnotations.length === 0) {
        return <div className="whitespace-pre-wrap font-serif text-lg leading-relaxed text-gray-800 dark:text-gray-200" dangerouslySetInnerHTML={{ __html: text.replace(/\n/g, '<br />') }} />;
    }

    let result: (string | ReactNode)[] = [text];

    textAnnotations.forEach((anno, i) => {
        const newResult: (string | ReactNode)[] = [];
        result.forEach((node) => {
            if (typeof node !== 'string') {
                newResult.push(node);
                return;
            }
            const parts = node.split(anno.selection!);
            for (let j = 0; j < parts.length; j++) {
                newResult.push(parts[j]);
                if (j < parts.length - 1) {
                    newResult.push(
                        <mark key={`${anno.id}-${i}-${j}`} className={`${markerStyles[anno.marker].highlight} relative group cursor-pointer px-0.5 rounded transition-colors`}>
                            {anno.selection}
                            <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 bg-gray-900 text-white text-xs rounded-lg p-3 shadow-xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50">
                                <span className="font-bold block mb-1 uppercase text-[10px] tracking-wider opacity-70">{anno.marker}</span>
                                {anno.comment}
                                <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-gray-900"></div>
                            </span>
                        </mark>
                    );
                }
            }
        });
        result = newResult;
    });

    return (
        <div className="font-serif text-lg leading-relaxed text-gray-800 dark:text-gray-200">
            {result.map((node, index) =>
                typeof node === 'string'
                    ? <span key={index} dangerouslySetInnerHTML={{ __html: node.replace(/\n/g, '<br />') }} />
                    : node
            )}
        </div>
    );
};

export default function EssayCorrectionView({ essayId, onBack }: {essayId: string, onBack: () => void}) {
    const [details, setDetails] = useState<FullEssayDetails | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [viewMode, setViewMode] = useState<'corrected' | 'clean'>('corrected');

    useEffect(() => {
        const fetchDetails = async () => {
            setIsLoading(true);
            const essayResult = await getEssayDetails(essayId);

            if (essayResult.data) {
                const correctionResult = await getCorrectionForEssay(essayId);
                setDetails({
                    ...(essayResult.data as FullEssayDetails),
                    correction: correctionResult.data || null,
                });
            }
            setIsLoading(false);
        };
        fetchDetails();
    }, [essayId]);

    if (isLoading) return (
        <div className="flex items-center justify-center min-h-[400px]">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#42047e]"></div>
        </div>
    );
    
    if (!details) return <div className="text-center p-8 text-red-500">Erro ao carregar redação.</div>;

    const { title, content, correction, image_submission_url } = details;
    const annotations = correction?.annotations;
    const finalGrade = correction?.final_grade || 0;

    // Cor da nota
    const gradeColor = finalGrade >= 900 ? 'text-[#07f49e]' : finalGrade >= 700 ? 'text-green-500' : finalGrade >= 500 ? 'text-yellow-500' : 'text-red-500';
    const gradePercent = (finalGrade / 1000) * 100;

    return (
        <div className="animate-fade-in-up pb-10">
            {/* Topbar de Navegação */}
            <div className="flex justify-between items-center mb-6">
                <button onClick={onBack} className="flex items-center text-sm text-gray-500 hover:text-[#42047e] font-bold transition-colors">
                    <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center mr-2">
                        <i className="fas fa-arrow-left"></i>
                    </div>
                    Voltar ao Painel
                </button>
                
                <div className="flex items-center gap-2">
                    {content && (
                        <button
                            onClick={() => setViewMode(prev => prev === 'corrected' ? 'clean' : 'corrected')}
                            className="flex items-center gap-2 text-xs font-bold bg-white dark:bg-dark-card px-4 py-2 rounded-full shadow-sm border border-gray-200 hover:border-[#42047e] transition-all"
                        >
                           <i className={`fas ${viewMode === 'corrected' ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                           {viewMode === 'corrected' ? 'Ver Texto Limpo' : 'Ver Marcações'}
                        </button>
                    )}
                </div>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
                
                {/* COLUNA DA ESQUERDA: TEXTO DA REDAÇÃO (7 cols) */}
                <div className="xl:col-span-7 space-y-6">
                    <div className="bg-white dark:bg-dark-card p-8 rounded-3xl shadow-sm border border-gray-100 dark:border-dark-border min-h-[600px]">
                        <h1 className="font-black text-2xl mb-6 text-dark-text dark:text-white border-b pb-4 border-gray-100 dark:border-gray-800">
                            {title || "Redação sem Título"}
                        </h1>
                        
                        {image_submission_url ? (
                            <div className="relative w-full h-auto">
                                <Image src={image_submission_url} alt="Redação enviada" width={800} height={1100} className="rounded-xl shadow-lg object-contain"/>
                                {annotations?.filter(a => a.type === 'image').map(a => (
                                    <div key={a.id} className="absolute transform -translate-x-1 -translate-y-4 group" style={{ left: `${a.position?.x}%`, top: `${a.position?.y}%` }}>
                                        <i className={`fas fa-map-marker-alt text-2xl drop-shadow-md ${markerStyles[a.marker].flag}`}></i>
                                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 bg-gray-900 text-white text-xs rounded-lg p-3 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10 shadow-xl">
                                            {a.comment}
                                            <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-gray-900"></div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="prose max-w-none">
                                {viewMode === 'corrected' 
                                    ? renderAnnotatedText(content || '', annotations)
                                    : <div className="font-serif text-lg leading-relaxed whitespace-pre-wrap text-gray-800 dark:text-gray-200">{content}</div>
                                }
                            </div>
                        )}
                    </div>
                </div>

                {/* COLUNA DA DIREITA: CORREÇÃO E FEEDBACK (5 cols) */}
                <div className="xl:col-span-5 space-y-6">
                    
                    {/* Card da Nota */}
                    <div className="bg-white dark:bg-dark-card p-6 rounded-3xl shadow-lg border border-gray-100 dark:border-dark-border relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-full h-2 bg-gray-100">
                            <div className="h-full bg-gradient-to-r from-[#42047e] to-[#07f49e] transition-all duration-1000" style={{ width: `${gradePercent}%` }}></div>
                        </div>
                        
                        <div className="flex justify-between items-center mt-2">
                            <div>
                                <p className="text-sm text-gray-500 font-bold uppercase tracking-wider">Nota Final</p>
                                <div className={`text-5xl font-black mt-1 ${gradeColor}`}>
                                    {finalGrade}
                                    <span className="text-lg text-gray-300 font-medium ml-1">/1000</span>
                                </div>
                            </div>
                            {correction?.profiles && (
                                <div className="text-right">
                                    <p className="text-xs text-gray-400 mb-1">Corrigido por</p>
                                    <div className="flex items-center justify-end gap-2">
                                        <span className="font-bold text-sm">{correction.profiles.full_name}</span>
                                        <VerificationBadge badge={correction.profiles.verification_badge} />
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Competências */}
                    <div className="bg-white dark:bg-dark-card rounded-3xl shadow-sm border border-gray-100 dark:border-dark-border overflow-hidden">
                        <div className="p-4 bg-gray-50 dark:bg-gray-800/50 border-b border-gray-100 dark:border-gray-700 font-bold text-gray-700 dark:text-gray-200">
                            Detalhamento por Competência
                        </div>
                        <div className="divide-y divide-gray-100 dark:divide-gray-800">
                            {correction && competencyDetails.map((comp, i) => {
                                const grade = correction[`grade_c${i + 1}` as keyof EssayCorrection] as number;
                                const percentage = (grade / 200) * 100;
                                const barColor = grade === 200 ? 'bg-[#07f49e]' : grade >= 160 ? 'bg-green-500' : grade >= 120 ? 'bg-yellow-400' : 'bg-red-400';

                                return (
                                    <div key={i} className="p-4 hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors group">
                                        <div className="flex justify-between items-center mb-2">
                                            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">{comp.title.split(':')[0]}</span>
                                            <span className="font-black text-dark-text dark:text-white">{grade} <span className="text-gray-300 text-xs font-normal">/200</span></span>
                                        </div>
                                        <div className="w-full bg-gray-100 rounded-full h-2 mb-2 dark:bg-gray-700">
                                            <div className={`${barColor} h-2 rounded-full transition-all duration-700`} style={{ width: `${percentage}%` }}></div>
                                        </div>
                                        <p className="text-xs text-gray-400 hidden group-hover:block transition-all">{comp.description}</p>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Tabs de Feedback */}
                    <div className="bg-white dark:bg-dark-card rounded-3xl shadow-sm border border-gray-100 dark:border-dark-border p-6">
                        <FeedbackTabs correction={correction} />
                    </div>

                </div>
            </div>
        </div>
    );
}