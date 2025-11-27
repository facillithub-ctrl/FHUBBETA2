"use client";

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import createClient from '@/utils/supabase/client';
import { upsertPrompt, deletePrompt } from '../actions';
import type { EssayPrompt } from '@/app/dashboard/types';
import Image from 'next/image';
import { useToast } from '@/contexts/ToastContext';
import ConfirmationModal from '@/components/ConfirmationModal';

type Props = {
    prompts: EssayPrompt[];
};

// Tipo auxiliar para o formulário (tags como string para facilitar edição)
type PromptFormData = Omit<Partial<EssayPrompt>, 'tags'> & {
    tags: string;
};

const categories = [
    'Ciência e Tecnologia', 'Sociedade', 'Meio Ambiente', 'Cultura', 'Educação', 'Saúde', 'Economia', 'Política', 'Filosofia', 'Geopolítica'
];

// Componente Seletor de Dificuldade
const DifficultySelector = ({ value, onChange }: { value: number, onChange: (value: number) => void }) => {
    const levels = [
        { val: 1, label: 'Muito Fácil', color: 'bg-green-400' },
        { val: 2, label: 'Fácil', color: 'bg-green-500' },
        { val: 3, label: 'Médio', color: 'bg-yellow-400' },
        { val: 4, label: 'Difícil', color: 'bg-orange-500' },
        { val: 5, label: 'Muito Difícil', color: 'bg-red-500' }
    ];
    return (
        <div>
            <label className="block text-sm font-bold mb-2 dark:text-gray-300">Nível de Dificuldade</label>
            <div className="flex gap-2">
                {levels.map((lvl) => (
                    <button
                        key={lvl.val}
                        type="button"
                        onClick={() => onChange(lvl.val)}
                        className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all border-2 ${
                            value === lvl.val
                                ? `${lvl.color} text-white border-transparent shadow-md transform scale-105`
                                : 'bg-transparent border-gray-200 dark:border-gray-700 text-gray-500 hover:border-gray-300'
                        }`}
                        title={lvl.label}
                    >
                        {lvl.val}
                    </button>
                ))}
            </div>
            <p className="text-xs text-right mt-1 text-gray-500">{levels.find(l => l.val === value)?.label}</p>
        </div>
    );
};

export default function ManagePrompts({ prompts }: Props) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentPrompt, setCurrentPrompt] = useState<PromptFormData | null>(null);
    const [isPending, startTransition] = useTransition();
    const [isUploading, setIsUploading] = useState(false);
    const router = useRouter();
    const supabase = createClient();
    const { addToast } = useToast();
    const [isConfirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
    const [promptToDelete, setPromptToDelete] = useState<string | null>(null);

    const handleOpenModal = (prompt: EssayPrompt | null) => {
        const promptData: PromptFormData = prompt ? {
            ...prompt,
            // Formata datas para o input type="date"
            publication_date: prompt.publication_date ? new Date(prompt.publication_date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
            deadline: prompt.deadline ? new Date(prompt.deadline).toISOString().slice(0, 16) : '',
            // Converte array de tags para string
            tags: Array.isArray(prompt.tags) ? prompt.tags.join(', ') : '',
        } : { 
            difficulty: 3, 
            tags: '', 
            category: 'Sociedade',
            publication_date: new Date().toISOString().split('T')[0] 
        };
        
        setCurrentPrompt(promptData);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setCurrentPrompt(null);
    };
    
    const handleDeleteClick = (promptId: string) => {
        setPromptToDelete(promptId);
        setConfirmDeleteOpen(true);
    };

    const executeDelete = () => {
        if (!promptToDelete) return;

        startTransition(async () => {
            const result = await deletePrompt(promptToDelete);
            if (result.error) {
                addToast({ title: "Erro", message: result.error, type: 'error' });
            } else {
                addToast({ title: "Sucesso", message: "Tema excluído.", type: 'success' });
                router.refresh();
            }
            setConfirmDeleteOpen(false);
            setPromptToDelete(null);
        });
    };

    const handleFileUpload = async (file: File, bucket: string = 'essay_prompts'): Promise<string | null> => {
        setIsUploading(true);
        const fileExt = file.name.split('.').pop();
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
        const filePath = `covers/${fileName}`;

        const { error: uploadError } = await supabase.storage
            .from(bucket)
            .upload(filePath, file);
        
        if (uploadError) {
            addToast({ title: "Erro no Upload", message: uploadError.message, type: 'error' });
            setIsUploading(false);
            return null;
        }

        const { data } = supabase.storage.from(bucket).getPublicUrl(filePath);
        setIsUploading(false);
        return data.publicUrl;
    };

    const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>, field: 'image_url' | 'motivational_text_3_image_url') => {
        const file = e.target.files?.[0];
        if (!file) return;
        
        const publicUrl = await handleFileUpload(file);
        if (publicUrl) {
            setCurrentPrompt(prev => prev ? ({ ...prev, [field]: publicUrl }) : null);
        }
    };
    
    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!currentPrompt) return;

        startTransition(async () => {
            const submissionData = {
                ...currentPrompt,
                // Converte string de tags de volta para array
                tags: currentPrompt.tags.split(',').map(tag => tag.trim()).filter(Boolean)
            };
            
            const result = await upsertPrompt(submissionData);
            if (result.error) {
                addToast({ title: "Erro ao Salvar", message: result.error, type: 'error' });
            } else {
                addToast({ title: "Tema Salvo", message: "O tema foi publicado com sucesso.", type: 'success' });
                handleCloseModal();
                router.refresh();
            }
        });
    };

    return (
        <div className="bg-white dark:bg-dark-card p-6 rounded-lg shadow-md">
            <ConfirmationModal
                isOpen={isConfirmDeleteOpen}
                title="Excluir Tema"
                message="Tem a certeza? Isso removerá o tema para todos os alunos e professores."
                onConfirm={executeDelete}
                onClose={() => setConfirmDeleteOpen(false)}
                confirmText="Sim, Excluir"
            />
            
            <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-dark-text dark:text-white">Temas de Redação Globais</h2>
                    <p className="text-sm text-gray-500">Gerencie os temas disponíveis para toda a plataforma.</p>
                </div>
                <button onClick={() => handleOpenModal(null)} className="bg-royal-blue text-white font-bold py-2 px-6 rounded-lg hover:bg-opacity-90 flex items-center gap-2 shadow transition-transform hover:scale-105">
                    <i className="fas fa-plus"></i> Novo Tema
                </button>
            </div>

            {/* Lista de Temas */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {prompts.map(prompt => (
                    <div key={prompt.id} className="group border dark:border-gray-700 rounded-xl overflow-hidden bg-white dark:bg-gray-800 hover:shadow-lg transition-all flex flex-col">
                        <div className="h-36 bg-gray-200 dark:bg-gray-700 relative overflow-hidden">
                            {prompt.image_url ? (
                                <Image src={prompt.image_url} alt={prompt.title} fill className="object-cover transition-transform duration-500 group-hover:scale-110" />
                            ) : (
                                <div className="flex items-center justify-center h-full text-gray-400">
                                    <i className="fas fa-image text-4xl"></i>
                                </div>
                            )}
                            <div className="absolute top-2 right-2">
                                <span className="bg-black/70 text-white text-[10px] px-2 py-1 rounded-full backdrop-blur-sm">
                                    {prompt.category || 'Geral'}
                                </span>
                            </div>
                        </div>
                        <div className="p-4 flex-1 flex flex-col">
                            <h3 className="font-bold text-lg mb-1 line-clamp-2 text-dark-text dark:text-white leading-tight">{prompt.title}</h3>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mb-3 font-mono">{prompt.source || 'Autoral'}</p>
                            
                            <div className="flex items-center gap-2 mt-auto pt-4 border-t dark:border-gray-700">
                                <button onClick={() => handleOpenModal(prompt)} className="flex-1 text-sm bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 py-2 rounded-md font-bold hover:bg-royal-blue hover:text-white transition-colors">
                                    <i className="fas fa-edit mr-1"></i> Editar
                                </button>
                                <button onClick={() => handleDeleteClick(prompt.id)} disabled={isPending} className="px-3 py-2 text-red-500 bg-red-50 dark:bg-red-900/20 rounded-md hover:bg-red-100 dark:hover:bg-red-900/40 transition-colors">
                                    <i className="fas fa-trash"></i>
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* MODAL DE CRIAÇÃO/EDIÇÃO */}
            {isModalOpen && currentPrompt && (
                <div className="fixed inset-0 bg-black/60 z-[100] flex items-center justify-center p-4 overflow-y-auto">
                    <div className="bg-white dark:bg-dark-card rounded-xl shadow-2xl w-full max-w-4xl flex flex-col animate-fade-in my-auto">
                        <div className="p-5 border-b dark:border-gray-700 flex justify-between items-center bg-gray-50 dark:bg-gray-800 rounded-t-xl sticky top-0 z-10">
                            <h3 className="text-xl font-bold text-dark-text dark:text-white">
                                {currentPrompt.id ? 'Editar Tema' : 'Criar Novo Tema'}
                            </h3>
                            <button onClick={handleCloseModal} className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 text-2xl">&times;</button>
                        </div>
                        
                        <form id="prompt-form" onSubmit={handleSubmit} className="p-6 space-y-6 overflow-y-auto max-h-[80vh]">
                            
                            {/* Seção 1: Dados Principais */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-bold mb-1 dark:text-gray-300">Título <span className="text-red-500">*</span></label>
                                        <input type="text" value={currentPrompt.title || ''} onChange={e => setCurrentPrompt(p => p ? ({ ...p, title: e.target.value }) : null)} required className="w-full p-2.5 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:ring-2 focus:ring-royal-blue focus:outline-none" placeholder="Ex: Os desafios da inteligência artificial" />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                         <div>
                                            <label className="block text-sm font-bold mb-1 dark:text-gray-300">Fonte</label>
                                            <input type="text" value={currentPrompt.source || ''} onChange={e => setCurrentPrompt(p => p ? ({ ...p, source: e.target.value }) : null)} className="w-full p-2.5 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white" placeholder="Ex: ENEM 2024" />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-bold mb-1 dark:text-gray-300">Categoria</label>
                                            <select value={currentPrompt.category || ''} onChange={e => setCurrentPrompt(p => p ? ({ ...p, category: e.target.value }) : null)} className="w-full p-2.5 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white bg-white dark:bg-gray-700">
                                                {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                                            </select>
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold mb-1 dark:text-gray-300">Proposta de Redação</label>
                                        <textarea rows={6} value={currentPrompt.description || ''} onChange={e => setCurrentPrompt(p => p ? ({ ...p, description: e.target.value }) : null)} className="w-full p-2.5 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white" placeholder="Digite a proposta completa e instruções..." />
                                    </div>
                                </div>

                                <div className="space-y-6">
                                     <div>
                                        <label className="block text-sm font-bold mb-2 dark:text-gray-300">Capa do Tema</label>
                                        <div className="flex items-start gap-4 p-3 border border-dashed rounded-lg dark:border-gray-600 bg-gray-50 dark:bg-gray-800/50">
                                            <div className="flex-1">
                                                <input type="file" onChange={(e) => handleImageChange(e, 'image_url')} accept="image/*" className="w-full text-sm file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-bold file:bg-royal-blue file:text-white hover:file:bg-blue-700" />
                                                <input type="text" value={currentPrompt.cover_image_source || ''} onChange={e => setCurrentPrompt(p => p ? ({ ...p, cover_image_source: e.target.value }) : null)} placeholder="Créditos da imagem (opcional)" className="w-full mt-2 p-1.5 text-xs border rounded dark:bg-gray-700 dark:border-gray-600" />
                                            </div>
                                            {currentPrompt.image_url && (
                                                <div className="relative h-20 w-20 rounded overflow-hidden border border-gray-300">
                                                    <Image src={currentPrompt.image_url} alt="Capa" fill className="object-cover" />
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    <DifficultySelector 
                                        value={currentPrompt.difficulty || 3}
                                        onChange={value => setCurrentPrompt(p => p ? ({...p, difficulty: value}) : null)}
                                    />

                                    <div>
                                        <label className="block text-sm font-bold mb-1 dark:text-gray-300">Tags</label>
                                        <input type="text" value={currentPrompt.tags} onChange={e => setCurrentPrompt(p => p ? ({ ...p, tags: e.target.value }) : null)} placeholder="Ex: Saúde, Tecnologia, Atualidades" className="w-full p-2.5 border rounded-lg dark:bg-gray-700 dark:border-gray-600" />
                                    </div>
                                </div>
                            </div>

                            <hr className="dark:border-gray-700" />

                            {/* Seção 2: Textos Motivadores */}
                            <div className="bg-blue-50 dark:bg-blue-900/10 p-5 rounded-xl border border-blue-100 dark:border-blue-800/30">
                                <h4 className="font-bold text-lg mb-4 text-royal-blue dark:text-blue-400 flex items-center gap-2">
                                    <i className="fas fa-quote-left"></i> Textos Motivadores
                                </h4>
                                <div className="grid grid-cols-1 gap-4">
                                    <div>
                                        <label className="block text-xs font-bold uppercase text-gray-500 mb-1">Texto I</label>
                                        <textarea rows={3} value={currentPrompt.motivational_text_1 || ''} onChange={e => setCurrentPrompt(p => p ? ({ ...p, motivational_text_1: e.target.value }) : null)} className="w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 text-sm" placeholder="Texto de apoio..." />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold uppercase text-gray-500 mb-1">Texto II</label>
                                        <textarea rows={3} value={currentPrompt.motivational_text_2 || ''} onChange={e => setCurrentPrompt(p => p ? ({ ...p, motivational_text_2: e.target.value }) : null)} className="w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 text-sm" placeholder="Outro texto de apoio..." />
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                                        <div>
                                            <label className="block text-xs font-bold uppercase text-gray-500 mb-1">Texto III (Imagem/Gráfico)</label>
                                            <input type="file" onChange={(e) => handleImageChange(e, 'motivational_text_3_image_url')} accept="image/*" className="w-full text-sm" />
                                            {currentPrompt.motivational_text_3_image_url && <div className="mt-2 relative h-24 w-full bg-gray-100 rounded flex items-center justify-center overflow-hidden"><Image src={currentPrompt.motivational_text_3_image_url} alt="Texto 3" width={150} height={100} className="object-contain h-full" /></div>}
                                        </div>
                                        <div className="space-y-2">
                                            <input type="text" value={currentPrompt.motivational_text_3_description || ''} onChange={e => setCurrentPrompt(p => p ? ({ ...p, motivational_text_3_description: e.target.value }) : null)} placeholder="Legenda da imagem" className="w-full p-2 border rounded-md text-sm dark:bg-gray-700 dark:border-gray-600" />
                                            <input type="text" value={currentPrompt.motivational_text_3_image_source || ''} onChange={e => setCurrentPrompt(p => p ? ({ ...p, motivational_text_3_image_source: e.target.value }) : null)} placeholder="Fonte do gráfico/imagem" className="w-full p-2 border rounded-md text-sm dark:bg-gray-700 dark:border-gray-600" />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Seção 3: Datas */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-bold mb-1 dark:text-gray-300">Data de Publicação</label>
                                    <input type="date" value={currentPrompt.publication_date || ''} onChange={e => setCurrentPrompt(p => p ? ({ ...p, publication_date: e.target.value }) : null)} className="w-full p-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600" />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold mb-1 dark:text-gray-300">Prazo de Entrega (Opcional)</label>
                                    <input type="datetime-local" value={currentPrompt.deadline || ''} onChange={e => setCurrentPrompt(p => p ? ({ ...p, deadline: e.target.value }) : null)} className="w-full p-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600" />
                                </div>
                            </div>

                        </form>
                        <div className="p-5 border-t dark:border-gray-700 flex justify-end gap-3 bg-gray-50 dark:bg-gray-800 rounded-b-xl sticky bottom-0 z-10">
                            <button type="button" onClick={handleCloseModal} className="px-5 py-2.5 rounded-lg font-bold text-gray-600 hover:bg-gray-200 dark:text-gray-300 dark:hover:bg-gray-700 transition-colors">
                                Cancelar
                            </button>
                            <button type="submit" form="prompt-form" disabled={isPending || isUploading} className="px-8 py-2.5 rounded-lg font-bold text-white bg-royal-blue hover:bg-opacity-90 shadow-lg transition-transform hover:scale-105 disabled:bg-gray-400 disabled:scale-100">
                                {isPending || isUploading ? 'Processando...' : 'Salvar e Publicar'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}