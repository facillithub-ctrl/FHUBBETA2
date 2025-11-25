"use client";

import { useEffect, useState, ReactElement } from 'react';
import Image from 'next/image';
import { 
    Essay, 
    EssayCorrection, 
    Annotation, 
    getEssayDetails, 
    getCorrectionForEssay, 
    AIFeedback 
} from '../actions';
import FeedbackTabs from './FeedbackTabs';
// Componente importado mas não usado no JSX atual, mantido para evitar quebra se for necessário depois
import { VerificationBadge } from '@/components/VerificationBadge'; 

// --- TIPOS E SUB-COMPONENTES ---

// CORREÇÃO 1: Usamos Omit para evitar conflito na propriedade 'ai_feedback' e permitimos profiles ser null
type CorrectionWithDetails = Omit<EssayCorrection, 'ai_feedback'> & {
  profiles: { full_name: string | null; verification_badge: string | null } | null;
  ai_feedback: AIFeedback | null;
};

type FullEssayDetails = Essay & {
  correction: CorrectionWithDetails | null;
  profiles: { full_name: string | null } | null;
};

// Detalhes estáticos sobre as competências da redação
const competencyDetails = [
  { title: "Competência 1: Domínio da Escrita Formal", description: "Avalia o domínio da modalidade escrita formal da língua portuguesa e da norma-padrão." },
  { title: "Competência 2: Compreensão do Tema e Estrutura", description: "Avalia a compreensão da proposta de redação e a aplicação de conceitos de várias áreas do conhecimento para desenvolver o tema, dentro da estrutura do texto dissertativo-argumentativo." },
  { title: "Competência 3: Argumentação", description: "Avalia a capacidade de selecionar, relacionar, organizar e interpretar informações, fatos e opiniões em defesa de um ponto de vista." },
  { title: "Competência 4: Coesão e Coerência", description: "Avalia o uso de mecanismos linguísticos (conjunções, preposições, etc.) para construir uma argumentação coesa e coerente." },
  { title: "Competência 5: Proposta de Intervenção", description: "Avalia a elaboração de uma proposta de intervenção para o problema abordado, que respeite os direitos humanos." },
];

const markerStyles = {
    erro: { flag: 'text-red-500', highlight: 'bg-red-200 dark:bg-red-500/30 border-b-2 border-red-400' },
    acerto: { flag: 'text-green-500', highlight: 'bg-green-200 dark:bg-green-500/30' },
    sugestao: { flag: 'text-blue-500', highlight: 'bg-blue-200 dark:bg-blue-500/30' },
};

/**
 * Renderiza o texto da redação com anotações destacadas e tooltips.
 */
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
                            <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 bg-black text-white text-xs rounded py-1 px-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">{anno.comment}</span>
                        </mark>
                    );
                }
            }
        });
        result = newResult;
    });

    return (
        <div>
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
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center" onClick={onClose}>
            <div className="bg-white dark:bg-dark-card p-6 rounded-lg shadow-xl max-w-md w-full mx-4" onClick={e => e.stopPropagation()}>
                <h3 className="text-lg font-bold mb-2 dark:text-white-text">{title}</h3>
                <p className="text-sm text-text-muted dark:text-dark-text-muted">{description}</p>
                <button onClick={onClose} className="mt-4 bg-royal-blue text-white py-2 px-4 rounded-lg text-sm font-bold">Entendi</button>
            </div>
        </div>
    );
};

export default function EssayCorrectionView({ essayId, onBack }: {essayId: string, onBack: () => void}) {
    const [details, setDetails] = useState<FullEssayDetails | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [modalCompetency, setModalCompetency] = useState<number | null>(null);
    const [viewMode, setViewMode] = useState<'corrected' | 'comparison'>('corrected');

    useEffect(() => {
        const fetchDetails = async () => {
            setIsLoading(true);
            
            // Busca detalhes da redação
            const essayResult = await getEssayDetails(essayId);

            if (essayResult.data) {
                // Busca detalhes da correção
                const correctionResult = await getCorrectionForEssay(essayId);
                
                // CORREÇÃO 2: Conversão segura dos dados vindos da API para o estado local
                let compatCorrection: CorrectionWithDetails | null = null;

                if (correctionResult.data) {
                     // Garantimos que o objeto segue a estrutura CorrectionWithDetails
                     compatCorrection = {
                        ...correctionResult.data,
                        ai_feedback: correctionResult.data.ai_feedback || null,
                        profiles: correctionResult.data.profiles || null
                     };
                }

                // Monta o objeto final
                const fullDetails: FullEssayDetails = {
                    ...essayResult.data,
                    correction: compatCorrection,
                    // Garante compatibilidade caso profiles venha undefined
                    profiles: essayResult.data.profiles || null 
                };

                setDetails(fullDetails);
            } else {
                 console.error(`[EssayCorrectionView] Erro ao buscar redação:`, essayResult.error);
            }
            setIsLoading(false);
        };
        fetchDetails();
    }, [essayId]);

    if (isLoading) return <div className="text-center p-8 dark:text-white">A carregar a sua redação...</div>;
    if (!details) return <div className="text-center p-8 dark:text-white">Não foi possível carregar os detalhes da redação.</div>;

    const { title, content, correction, image_submission_url } = details;
    const annotations = correction?.annotations;
    const isTextView = content && !image_submission_url;

    return (
        <div>
            <CompetencyModal competencyIndex={modalCompetency} onClose={() => setModalCompetency(null)} />

            <div className="flex justify-between items-center mb-4">
                <button onClick={onBack} className="text-sm text-royal-blue font-bold">
                    <i className="fas fa-arrow-left mr-2"></i> Voltar
                </button>
                {isTextView && correction && (
                    <button
                        onClick={() => setViewMode(prev => prev === 'corrected' ? 'comparison' : 'corrected')}
                        className="text-sm bg-gray-200 dark:bg-gray-700 px-3 py-1.5 rounded-md font-semibold dark:text-white"
                    >
                       <i className={`fas ${viewMode === 'corrected' ? 'fa-exchange-alt' : 'fa-eye'} mr-2`}></i>
                       {viewMode === 'corrected' ? 'Comparar Versões' : 'Ver Correção'}
                    </button>
                )}
            </div>

            {viewMode === 'comparison' && isTextView ? (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <div>
                        <h2 className="font-bold text-xl mb-4 dark:text-white-text">Texto Original</h2>
                        <div className="bg-white dark:bg-dark-card p-6 rounded-lg shadow-md border dark:border-dark-border text-gray-700 dark:text-dark-text-muted whitespace-pre-wrap leading-relaxed">
                            {content && <div dangerouslySetInnerHTML={{ __html: content.replace(/\n/g, '<br />') }} />}
                        </div>
                    </div>
                    <div>
                        <h2 className="font-bold text-xl mb-4 dark:text-white-text">Texto Corrigido</h2>
                        <div className="bg-white dark:bg-dark-card p-6 rounded-lg shadow-md border dark:border-dark-border text-gray-700 dark:text-dark-text-muted leading-relaxed">
                            {content ? renderAnnotatedText(content, annotations) : <p>Conteúdo não disponível.</p>}
                        </div>
                    </div>
                </div>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <div className="bg-white dark:bg-dark-card p-6 rounded-lg shadow-md border dark:border-dark-border">
                        <h2 className="font-bold text-xl mb-4 dark:text-white-text">{title || "Redação sem Título"}</h2>
                        {image_submission_url ? (
                            <div className="relative w-full h-auto">
                                <Image src={image_submission_url} alt="Redação enviada" width={800} height={1100} className="rounded-lg object-contain"/>
                                {annotations?.filter(a => a.type === 'image').map(a => (
                                    <div key={a.id} className="absolute transform -translate-x-1 -translate-y-4 group text-xl" style={{ left: `${a.position?.x}%`, top: `${a.position?.y}%` }}>
                                        <i className={`fas fa-flag ${markerStyles[a.marker].flag}`}></i>
                                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 bg-black text-white text-xs rounded py-1 px-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                                            {a.comment}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-gray-700 dark:text-dark-text-muted leading-relaxed">
                                {content ? renderAnnotatedText(content, annotations) : <p>Esta redação não possui conteúdo textual para ser exibido.</p>}
                            </div>
                        )}
                    </div>

                    <div className="bg-white dark:bg-dark-card p-6 rounded-lg shadow-md border dark:border-dark-border">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="font-bold text-xl dark:text-white-text">Correção</h2>
                            {correction && <div className="text-2xl font-bold dark:text-white-text">{correction.final_grade}</div>}
                        </div>

                        {correction ? (
                            <div className="space-y-4">
                                {competencyDetails.map((_, i) => (
                                    <div key={i} className="flex justify-between items-center p-3 rounded-md bg-gray-50 dark:bg-gray-700/50">
                                        <div className="flex items-center gap-2">
                                            <span className="font-medium text-sm dark:text-white-text">Competência {i + 1}</span>
                                            <button onClick={() => setModalCompetency(i)} className="text-xs text-royal-blue">
                                                <i className="fas fa-info-circle"></i>
                                            </button>
                                        </div>
                                        <span className="font-bold text-sm dark:text-white-text">
                                            {/* Uso de 'as any' ou keyof para acesso dinâmico seguro */}
                                            {correction[`grade_c${i + 1}` as keyof EssayCorrection] as React.ReactNode}
                                        </span>
                                    </div>
                                ))}
                                <div className="border-t dark:border-gray-700 pt-4">
                                    <FeedbackTabs correction={correction} />
                                </div>
                            </div>
                        ) : (
                            <p className="text-center text-gray-500 py-8">A sua redação ainda está na fila para ser corrigida ou a correção não foi encontrada.</p>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}