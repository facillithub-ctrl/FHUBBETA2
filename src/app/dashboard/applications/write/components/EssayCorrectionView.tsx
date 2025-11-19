"use client";

import { useEffect, useState, ReactElement } from 'react';
import { Essay, EssayCorrection, Annotation, getEssayDetails, getCorrectionForEssay, AIFeedback } from '../actions';
import Image from 'next/image';
import FeedbackTabs from './FeedbackTabs';

// Tipos para o componente
type FullEssayDetails = Essay & {
  correction: EssayCorrection | null;
  profiles: { full_name: string | null } | null;
};

const competencyDetails = [
  { title: "Competência 1: Norma Culta", description: "Domínio da modalidade escrita formal da língua portuguesa." },
  { title: "Competência 2: Tema e Estrutura", description: "Compreensão da proposta e aplicação de conceitos de várias áreas." },
  { title: "Competência 3: Argumentação", description: "Capacidade de selecionar, relacionar, organizar e interpretar informações." },
  { title: "Competência 4: Coesão", description: "Conhecimento dos mecanismos linguísticos necessários para a construção da argumentação." },
  { title: "Competência 5: Proposta de Intervenção", description: "Elaboração de proposta de intervenção para o problema abordado." },
];

const markerStyles = {
    erro: { flag: 'text-red-500', highlight: 'bg-red-200 dark:bg-red-500/30 border-b-2 border-red-400' },
    acerto: { flag: 'text-green-500', highlight: 'bg-green-200 dark:bg-green-500/30' },
    sugestao: { flag: 'text-blue-500', highlight: 'bg-blue-200 dark:bg-blue-500/30' },
};

const renderAnnotatedText = (text: string, annotations: Annotation[] | null | undefined): ReactElement => {
    const textAnnotations = annotations?.filter(a => a.type === 'text' && a.selection) || [];
    if (!text || textAnnotations.length === 0) {
        return <div className="whitespace-pre-wrap" dangerouslySetInnerHTML={{ __html: text.replace(/\n/g, '<br />') }} />;
    }

    let result: (string | ReactElement)[] = [text];

    textAnnotations.forEach((anno, i) => {
        const newResult: (string | ReactElement)[] = [];
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
                        <mark key={`${anno.id}-${i}-${j}`} className={`${markerStyles[anno.marker].highlight} relative group cursor-pointer px-1 rounded-sm`}>
                            {anno.selection}
                            <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 bg-black text-white text-xs rounded py-1 px-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10 shadow-lg">
                                {anno.comment}
                            </span>
                        </mark>
                    );
                }
            }
        });
        result = newResult;
    });

    return (
        <div className="leading-relaxed">
            {result.map((node, index) =>
                typeof node === 'string'
                    ? <span key={index} dangerouslySetInnerHTML={{ __html: node.replace(/\n/g, '<br />') }} />
                    : node
            )}
        </div>
    );
};

const CompetencyModal = ({ competencyIndex, onClose }: { competencyIndex: number | null, onClose: () => void }) => {
    if (competencyIndex === null) return null;
    const { title, description } = competencyDetails[competencyIndex];

    return (
        <div className="fixed inset-0 bg-black/60 z-[100] flex items-center justify-center backdrop-blur-sm" onClick={onClose}>
            <div className="bg-white dark:bg-dark-card p-6 rounded-2xl shadow-2xl max-w-md w-full mx-4 border border-gray-200 dark:border-gray-700 transform scale-100 transition-all" onClick={e => e.stopPropagation()}>
                <h3 className="text-lg font-bold mb-2 dark:text-white">{title}</h3>
                <p className="text-sm text-text-muted dark:text-gray-300">{description}</p>
                <button onClick={onClose} className="mt-6 w-full bg-royal-blue text-white py-2 px-4 rounded-xl text-sm font-bold hover:bg-opacity-90 transition-colors">
                    Entendi
                </button>
            </div>
        </div>
    );
};

export default function EssayCorrectionView({ essayId, onBack }: {essayId: string, onBack: () => void}) {
    const [details, setDetails] = useState<FullEssayDetails | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);
    const [modalCompetency, setModalCompetency] = useState<number | null>(null);
    const [viewMode, setViewMode] = useState<'corrected' | 'comparison'>('corrected');

    useEffect(() => {
        const fetchDetails = async () => {
            setIsLoading(true);
            setErrorMsg(null);

            const essayResult = await getEssayDetails(essayId);
            
            if (essayResult.error) {
                setErrorMsg(`Erro ao carregar redação: ${essayResult.error}`);
                setIsLoading(false);
                return;
            }

            if (essayResult.data) {
                const correctionResult = await getCorrectionForEssay(essayId);

                if (correctionResult.error) {
                    console.error("Erro na busca da correção:", correctionResult.error);
                    setErrorMsg(`Aviso: Detalhes da correção não carregaram completamente.`);
                }

                const fullDetails = {
                    ...(essayResult.data as FullEssayDetails),
                    correction: correctionResult.data ? correctionResult.data : null,
                };
                setDetails(fullDetails);
            }
            setIsLoading(false);
        };
        fetchDetails();
    }, [essayId]);

    if (isLoading) return <div className="flex h-64 items-center justify-center"><div className="animate-spin text-brand-purple text-4xl"><i className="fas fa-circle-notch"></i></div></div>;
    
    if (!details && errorMsg) return (
        <div className="p-8 text-center flex flex-col items-center justify-center h-full">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4 text-red-500 text-2xl"><i className="fas fa-exclamation-triangle"></i></div>
            <p className="text-lg font-bold text-gray-800 dark:text-white mb-2">Ocorreu um erro</p>
            <p className="text-sm text-gray-500 mb-6">{errorMsg}</p>
            <button onClick={onBack} className="text-brand-purple font-bold hover:underline">Voltar ao Painel</button>
        </div>
    );

    if (!details) return <div className="text-center p-8">Redação não encontrada.</div>;

    const { title, content, correction, image_submission_url } = details;
    const annotations = correction?.annotations;
    const isTextView = content && !image_submission_url;

    return (
        <div className="animate-fade-in">
            {errorMsg && (
                <div className="bg-yellow-50 text-yellow-800 p-3 rounded-xl mb-6 text-sm flex items-center gap-3 border border-yellow-200">
                    <i className="fas fa-exclamation-triangle"></i> {errorMsg}
                </div>
            )}

            <CompetencyModal competencyIndex={modalCompetency} onClose={() => setModalCompetency(null)} />

            <div className="flex justify-between items-center mb-6">
                <button onClick={onBack} className="text-sm text-text-secondary hover:text-brand-purple font-bold flex items-center gap-2 transition-colors">
                    <i className="fas fa-arrow-left"></i> Voltar
                </button>
                {isTextView && correction && (
                    <div className="bg-gray-100 dark:bg-gray-800 p-1 rounded-lg flex text-xs font-bold">
                        <button
                            onClick={() => setViewMode('corrected')}
                            className={`px-3 py-1.5 rounded-md transition-all ${viewMode === 'corrected' ? 'bg-white dark:bg-gray-700 shadow-sm text-brand-purple' : 'text-gray-500 hover:text-gray-700'}`}
                        >
                            Correção
                        </button>
                        <button
                            onClick={() => setViewMode('comparison')}
                            className={`px-3 py-1.5 rounded-md transition-all ${viewMode === 'comparison' ? 'bg-white dark:bg-gray-700 shadow-sm text-brand-purple' : 'text-gray-500 hover:text-gray-700'}`}
                        >
                            Comparação
                        </button>
                    </div>
                )}
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                 {/* COLUNA ESQUERDA: CONTEÚDO DA REDAÇÃO */}
                 <div className="lg:col-span-7 bg-white dark:bg-dark-card p-6 md:p-8 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-800 h-fit">
                    <h2 className="font-black text-2xl mb-6 text-text-primary dark:text-white">{title || "Redação sem Título"}</h2>
                    
                    {image_submission_url ? (
                         <div className="relative w-full rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700 bg-gray-50">
                            <Image src={image_submission_url} alt="Redação" width={800} height={1100} className="w-full h-auto object-contain"/>
                            {/* Anotações em imagem */}
                            {annotations?.filter(a => a.type === 'image').map((a, idx) => (
                                <div key={a.id || idx} className="absolute w-6 h-6 bg-red-500 rounded-full text-white flex items-center justify-center text-xs font-bold cursor-pointer group transform -translate-x-1/2 -translate-y-1/2 hover:scale-110 transition-transform shadow-md border-2 border-white" style={{ left: `${a.position?.x}%`, top: `${a.position?.y}%` }}>
                                    {idx + 1}
                                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 bg-black/90 backdrop-blur-sm text-white text-xs rounded-lg p-3 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10 shadow-xl">
                                        {a.comment}
                                    </div>
                                </div>
                            ))}
                         </div>
                    ) : (
                        <div className="text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-wrap font-serif text-lg">
                            {viewMode === 'comparison' 
                                ? content 
                                : (content ? renderAnnotatedText(content, annotations) : <p className="text-text-muted italic">Sem conteúdo de texto.</p>)
                            }
                        </div>
                    )}
                 </div>

                 {/* COLUNA DIREITA: PAINEL DE CORREÇÃO */}
                 <div className="lg:col-span-5 space-y-6">
                     
                     {/* Card de Nota Final */}
                     <div className="bg-white dark:bg-dark-card p-6 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-800">
                        <div className="flex justify-between items-center mb-2">
                            <h3 className="font-bold text-lg dark:text-white">Nota Final</h3>
                            {correction ? (
                                <span className="text-xs font-bold bg-green-100 text-green-700 px-2 py-1 rounded-full">Corrigida</span>
                            ) : (
                                <span className="text-xs font-bold bg-yellow-100 text-yellow-700 px-2 py-1 rounded-full">Em Análise</span>
                            )}
                        </div>
                        
                        {correction ? (
                            <div className="flex items-baseline gap-2">
                                <span className={`text-5xl font-black ${correction.final_grade >= 900 ? 'text-brand-green' : correction.final_grade >= 700 ? 'text-brand-purple' : 'text-yellow-500'}`}>
                                    {correction.final_grade}
                                </span>
                                <span className="text-text-muted font-medium">/ 1000</span>
                            </div>
                        ) : (
                            <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-xl text-center">
                                <i className="fas fa-clock text-2xl text-gray-400 mb-2"></i>
                                <p className="text-sm text-text-muted">Aguardando correção dos professores.</p>
                            </div>
                        )}
                     </div>

                     {/* Card de Competências */}
                     {correction && (
                        <div className="bg-white dark:bg-dark-card p-6 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-800">
                            <h3 className="font-bold text-lg dark:text-white mb-4">Detalhamento</h3>
                            <div className="space-y-3">
                                {competencyDetails.map((comp, i) => {
                                    const gradeKey = `grade_c${i + 1}` as keyof EssayCorrection;
                                    const grade = correction[gradeKey] as number;
                                    const percentage = (grade / 200) * 100;
                                    
                                    return (
                                        <div key={i} className="group">
                                            <div className="flex justify-between items-center mb-1">
                                                <div className="flex items-center gap-2">
                                                    <button onClick={() => setModalCompetency(i)} className="text-gray-400 hover:text-brand-purple transition-colors">
                                                        <i className="fas fa-info-circle"></i>
                                                    </button>
                                                    <span className="text-xs font-bold text-text-secondary uppercase tracking-wider">C{i + 1}</span>
                                                </div>
                                                <span className="text-sm font-bold dark:text-white">{grade}</span>
                                            </div>
                                            <div className="h-2 w-full bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                                                <div 
                                                    className={`h-full rounded-full transition-all duration-1000 ${grade >= 160 ? 'bg-brand-green' : grade >= 120 ? 'bg-brand-purple' : 'bg-yellow-400'}`} 
                                                    style={{ width: `${percentage}%` }}
                                                ></div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                     )}

                     {/* Abas de Feedback */}
                     {correction && (
                        <div className="bg-white dark:bg-dark-card rounded-3xl shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden">
                            <FeedbackTabs correction={correction} />
                        </div>
                     )}
                 </div>
            </div>
        </div>
    );
}