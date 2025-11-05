// src/app/dashboard/applications/write/components/EssayCorrectionView.tsx
"use client";

import { useEffect, useState, ReactElement } from 'react';
// Certifique-se de que estes caminhos estão corretos em relação a EssayCorrectionView.tsx
import { Essay, EssayCorrection, Annotation, getEssayDetails, getCorrectionForEssay, AIFeedback } from '../actions'; //
import Image from 'next/image';
// Certifique-se de que estes caminhos estão corretos em relação a EssayCorrectionView.tsx
import { VerificationBadge } from '@/components/VerificationBadge'; //
import FeedbackTabs from './FeedbackTabs'; //

// --- TIPOS E SUB-COMPONENTES ---

// Define a forma dos dados de correção, incluindo o perfil aninhado do corretor e o feedback da IA
type CorrectionWithDetails = EssayCorrection & {
  profiles: { full_name: string | null; verification_badge: string | null }; // Detalhes do corretor
  ai_feedback: AIFeedback | null; // Detalhes do feedback da IA (pode ser nulo)
};

// Define os detalhes completos de uma redação, incluindo seu conteúdo, autor e correção (se disponível)
type FullEssayDetails = Essay & {
  correction: CorrectionWithDetails | null; // A correção associada à redação
  profiles: { full_name: string | null } | null; // Detalhes do autor da redação
};

// Detalhes estáticos sobre as competências da redação para exibição
const competencyDetails = [
  { title: "Competência 1: Domínio da Escrita Formal", description: "Avalia o domínio da modalidade escrita formal da língua portuguesa e da norma-padrão." }, //
  { title: "Competência 2: Compreensão do Tema e Estrutura", description: "Avalia a compreensão da proposta de redação e a aplicação de conceitos de várias áreas do conhecimento para desenvolver o tema, dentro da estrutura do texto dissertativo-argumentativo." }, //
  { title: "Competência 3: Argumentação", description: "Avalia a capacidade de selecionar, relacionar, organizar e interpretar informações, fatos e opiniões em defesa de um ponto de vista." }, //
  { title: "Competência 4: Coesão e Coerência", description: "Avalia o uso de mecanismos linguísticos (conjunções, preposições, etc.) para construir uma argumentação coesa e coerente." }, //
  { title: "Competência 5: Proposta de Intervenção", description: "Avalia a elaboração de uma proposta de intervenção para o problema abordado, que respeite os direitos humanos." }, //
];

// Estilos para diferentes marcadores de anotação
const markerStyles = {
    erro: { flag: 'text-red-500', highlight: 'bg-red-200 dark:bg-red-500/30 border-b-2 border-red-400' }, //
    acerto: { flag: 'text-green-500', highlight: 'bg-green-200 dark:bg-green-500/30' }, //
    sugestao: { flag: 'text-blue-500', highlight: 'bg-blue-200 dark:bg-blue-500/30' }, //
};

/**
 * Renderiza o texto da redação com anotações destacadas e tooltips.
 * @param text A string de conteúdo bruto da redação.
 * @param annotations Um array de anotações associadas à redação.
 * @returns Um elemento React contendo o texto anotado.
 */
const renderAnnotatedText = (text: string, annotations: Annotation[] | null | undefined): ReactElement => {
    // Filtra apenas anotações de texto com uma seleção
    const textAnnotations = annotations?.filter(a => a.type === 'text' && a.selection) || []; //
    // Se não houver texto ou anotações, retorna o texto formatado com quebras de linha
    if (!text || textAnnotations.length === 0) {
        return <div className="whitespace-pre-wrap" dangerouslySetInnerHTML={{ __html: text.replace(/\n/g, '<br />') }} />; //
    }

    // Começa com o texto completo como um único elemento string em um array
    let result: (string | ReactElement)[] = [text]; //

    // Itera por cada anotação para dividir o texto e inserir elementos <mark>
    textAnnotations.forEach((anno, i) => {
        const newResult: (string | ReactElement)[] = [];
        result.forEach((node) => {
            // Se o nó já for um elemento React (uma marcação anterior), mantenha-o
            if (typeof node !== 'string') {
                newResult.push(node);
                return;
            }
            // Divide o nó string pelo texto selecionado da anotação
            const parts = node.split(anno.selection!); //
            for (let j = 0; j < parts.length; j++) {
                // Adiciona a parte antes da seleção
                newResult.push(parts[j]);
                // Se não for a última parte, adiciona a seleção destacada (<mark>)
                if (j < parts.length - 1) {
                    newResult.push(
                        <mark key={`${anno.id}-${i}-${j}`} className={`${markerStyles[anno.marker].highlight} relative group cursor-pointer px-1 rounded-sm`}>
                            {anno.selection}
                            {/* Tooltip exibido ao passar o mouse */}
                            <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 bg-black text-white text-xs rounded py-1 px-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">{anno.comment}</span>
                        </mark> //
                    );
                }
            }
        });
        // Atualiza o array de resultados para a próxima anotação
        result = newResult;
    });

    // Renderiza o array final de strings e elementos React, garantindo quebras de linha
    return (
        <div>
            {result.map((node, index) =>
                typeof node === 'string'
                    ? <span key={index} dangerouslySetInnerHTML={{ __html: node.replace(/\n/g, '<br />') }} />
                    : node
            )}
        </div> //
    );
};

/**
 * Componente modal para exibir detalhes sobre uma competência da redação.
 */
const CompetencyModal = ({ competencyIndex, onClose }: { competencyIndex: number | null, onClose: () => void }) => {
    if (competencyIndex === null) return null; // Não renderiza se nenhuma competência estiver selecionada
    const { title, description } = competencyDetails[competencyIndex];

    return (
        // Overlay
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center" onClick={onClose}>
            {/* Conteúdo do Modal */}
            <div className="bg-white dark:bg-dark-card p-6 rounded-lg shadow-xl max-w-md w-full mx-4" onClick={e => e.stopPropagation()}>
                <h3 className="text-lg font-bold mb-2 dark:text-white-text">{title}</h3>
                <p className="text-sm text-text-muted dark:text-dark-text-muted">{description}</p>
                <button onClick={onClose} className="mt-4 bg-royal-blue text-white py-2 px-4 rounded-lg text-sm font-bold">Entendi</button>
            </div>
        </div> //
    );
};

/**
 * Componente principal para exibir uma redação e os detalhes de sua correção.
 * Permite visualizar anotações em submissões de texto ou imagem e alternar entre
 * a visualização corrigida e uma comparação lado a lado (apenas para texto).
 */
export default function EssayCorrectionView({ essayId, onBack }: {essayId: string, onBack: () => void}) {
    // Estado para detalhes da redação, status de carregamento, modal de competência e modo de visualização
    const [details, setDetails] = useState<FullEssayDetails | null>(null); //
    const [isLoading, setIsLoading] = useState(true); //
    const [modalCompetency, setModalCompetency] = useState<number | null>(null); //
    const [viewMode, setViewMode] = useState<'corrected' | 'comparison'>('corrected'); //

    // Busca os detalhes da redação e da correção quando o componente monta ou essayId muda
    useEffect(() => {
        const fetchDetails = async () => {
            setIsLoading(true);
            console.log(`[EssayCorrectionView] Iniciando busca para essayId: ${essayId}`); // LOG 1: Verifica ID recebido

            // Busca os detalhes principais da redação (conteúdo, informações do autor)
            const essayResult = await getEssayDetails(essayId); //
            console.log("[EssayCorrectionView] Resultado getEssayDetails:", essayResult); // LOG 2: Verifica os dados brutos da redação

            if (essayResult.data) {
                // Busca os detalhes da correção (notas, feedback, anotações, informações do corretor)
                const correctionResult = await getCorrectionForEssay(essayId); //
                console.log("[EssayCorrectionView] Resultado getCorrectionForEssay:", correctionResult); // LOG 3: Verifica os dados brutos da correção

                 // Combina os dados da correção com o feedback da IA processado
                // A função getCorrectionForEssay já trata o ai_feedback corretamente
                const finalCorrection: CorrectionWithDetails | null = correctionResult.data
                    ? { ...correctionResult.data }
                    : null; //


                // Combina os detalhes da redação e da correção no objeto de estado final
                const fullDetails = {
                    ...(essayResult.data as FullEssayDetails),
                    correction: finalCorrection,
                }; //
                console.log("[EssayCorrectionView] Detalhes finais montados para o estado:", fullDetails); // LOG 4: Verifica o objeto combinado final
                setDetails(fullDetails);

                // LOG 5: Aviso específico se a correção não foi encontrada ou está vazia
                if (!finalCorrection) {
                    console.warn(`[EssayCorrectionView] Atenção: Correção não encontrada ou retornou vazia para essayId: ${essayId}. Verifique se a correção existe no DB e se o RLS permite a leitura.`); //
                }

            } else {
                 // LOG 6: Erro ao buscar os detalhes básicos da redação
                 console.error(`[EssayCorrectionView] Erro ao buscar detalhes da redação (essayId: ${essayId}):`, essayResult.error); //
            }
            setIsLoading(false);
        };
        fetchDetails();
    }, [essayId]); // Dependência: re-executa se essayId mudar


    // Exibição do estado de carregamento
    if (isLoading) return <div className="text-center p-8">A carregar a sua redação...</div>; //
    // Exibição do estado de erro/não encontrado
    if (!details) return <div className="text-center p-8">Não foi possível carregar os detalhes da redação. Verifique o console do navegador (F12) para mais informações sobre erros.</div>; // Mensagem mais informativa

    // Desestrutura os detalhes para facilitar o acesso no JSX
    const { title, content, correction, image_submission_url } = details; //
    const annotations = correction?.annotations; //

    // Determina se a submissão da redação é baseada em texto
    const isTextView = content && !image_submission_url; //

    // Renderiza a UI do componente
    return (
        <div>
            {/* Modal de detalhes da competência */}
            <CompetencyModal competencyIndex={modalCompetency} onClose={() => setModalCompetency(null)} />

            {/* Cabeçalho com botão Voltar e alternador de Modo de Visualização */}
            <div className="flex justify-between items-center mb-4">
                <button onClick={onBack} className="text-sm text-royal-blue font-bold">
                    <i className="fas fa-arrow-left mr-2"></i> Voltar
                </button>
                {/* Mostra o botão de alternar comparação apenas para redações de texto com correção */}
                {isTextView && correction && (
                    <button
                        onClick={() => setViewMode(prev => prev === 'corrected' ? 'comparison' : 'corrected')}
                        className="text-sm bg-gray-200 dark:bg-gray-700 px-3 py-1.5 rounded-md font-semibold"
                    >
                       <i className={`fas ${viewMode === 'corrected' ? 'fa-exchange-alt' : 'fa-eye'} mr-2`}></i>
                       {viewMode === 'corrected' ? 'Comparar Versões' : 'Ver Correção'}
                    </button> //
                )}
            </div>

            {/* Renderização condicional baseada no viewMode */}
            {viewMode === 'comparison' && isTextView ? (
                // Visualização de comparação lado a lado (Apenas Texto)
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Coluna do Texto Original */}
                    <div>
                        <h2 className="font-bold text-xl mb-4 dark:text-white-text">Texto Original</h2>
                        <div className="bg-white dark:bg-dark-card p-6 rounded-lg shadow-md border dark:border-dark-border text-gray-700 dark:text-dark-text-muted whitespace-pre-wrap leading-relaxed">
                            {/* Renderiza o conteúdo original com quebras de linha */}
                            {content && <div dangerouslySetInnerHTML={{ __html: content.replace(/\n/g, '<br />') }} />}
                        </div>
                    </div>
                    {/* Coluna do Texto Corrigido */}
                    <div>
                        <h2 className="font-bold text-xl mb-4 dark:text-white-text">Texto Corrigido</h2>
                        <div className="bg-white dark:bg-dark-card p-6 rounded-lg shadow-md border dark:border-dark-border text-gray-700 dark:text-dark-text-muted leading-relaxed">
                            {/* Renderiza o texto com as anotações aplicadas */}
                            {content ? renderAnnotatedText(content, annotations) : <p>Conteúdo não disponível.</p>}
                        </div>
                    </div>
                </div> //
            ) : (
                // Visualização Padrão (Redação + Painel de Correção)
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Coluna do Conteúdo da Redação */}
                    <div className="bg-white dark:bg-dark-card p-6 rounded-lg shadow-md border dark:border-dark-border">
                        <h2 className="font-bold text-xl mb-4 dark:text-white-text">{title || "Redação sem Título"}</h2>
                        {/* Renderiza a submissão de imagem ou o texto anotado */}
                        {image_submission_url ? (
                            <div className="relative w-full h-auto">
                                <Image src={image_submission_url} alt="Redação enviada" width={800} height={1100} className="rounded-lg object-contain"/>
                                {/* Renderiza as flags de anotação na imagem */}
                                {annotations?.filter(a => a.type === 'image').map(a => (
                                    <div key={a.id} className="absolute transform -translate-x-1 -translate-y-4 group text-xl" style={{ left: `${a.position?.x}%`, top: `${a.position?.y}%` }}>
                                        <i className={`fas fa-flag ${markerStyles[a.marker].flag}`}></i>
                                        {/* Tooltip para anotações de imagem */}
                                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 bg-black text-white text-xs rounded py-1 px-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                                            {a.comment}
                                        </div>
                                    </div> //
                                ))}
                            </div> //
                        ) : (
                            <div className="text-gray-700 dark:text-dark-text-muted leading-relaxed">
                                {content ? renderAnnotatedText(content, annotations) : <p>Esta redação não possui conteúdo textual para ser exibido.</p>}
                            </div> //
                        )}
                    </div>

                    {/* Coluna dos Detalhes da Correção */}
                    <div className="bg-white dark:bg-dark-card p-6 rounded-lg shadow-md border dark:border-dark-border">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="font-bold text-xl dark:text-white-text">Correção</h2>
                            {/* Exibe a nota final se a correção existir */}
                            {correction && <div className="text-2xl font-bold dark:text-white-text">{correction.final_grade}</div>}
                        </div>

                        {/* Renderiza os detalhes da correção se disponíveis, caso contrário mostra uma mensagem placeholder */}
                        {correction ? (
                            <div className="space-y-4">
                                {/* Notas por competência */}
                                {competencyDetails.map((_, i) => (
                                    <div key={i} className="flex justify-between items-center p-3 rounded-md bg-gray-50 dark:bg-gray-700/50">
                                        <div className="flex items-center gap-2">
                                            <span className="font-medium text-sm dark:text-white-text">Competência {i + 1}</span>
                                            {/* Botão de informação para abrir o modal de competência */}
                                            <button onClick={() => setModalCompetency(i)} className="text-xs text-royal-blue">
                                                <i className="fas fa-info-circle"></i>
                                            </button>
                                        </div>
                                        <span className="font-bold text-sm dark:text-white-text">
                                            {/* Acessa a nota dinamicamente */}
                                            {correction[`grade_c${i + 1}` as keyof EssayCorrection] as React.ReactNode}
                                        </span>
                                    </div> //
                                ))}
                                {/* Abas de Feedback (Humano, IA, Plano de Ação) */}
                                <div className="border-t dark:border-gray-700 pt-4">
                                    <FeedbackTabs correction={correction} />
                                </div>
                            </div> //
                        ) : (
                            // Mensagem exibida se a correção não for encontrada
                            <p className="text-center text-gray-500 py-8">A sua redação ainda está na fila para ser corrigida ou a correção não foi encontrada.</p> //
                        )}
                    </div>
                </div> //
            )}
        </div>
    );
}