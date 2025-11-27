"use client";

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import createClient from '@/utils/supabase/client';
import { upsertPrompt, deletePrompt } from '../../actions';
import type { EssayPrompt } from '@/app/dashboard/types';
import Image from 'next/image';
import { useToast } from '@/contexts/ToastContext';
import ConfirmationModal from '@/components/ConfirmationModal';

type Props = {
    prompts: EssayPrompt[];
};

type PromptFormData = Omit<Partial<EssayPrompt>, 'tags'> & {
    tags: string;
};

const categories = [
    'Ciência e Tecnologia', 'Sociedade', 'Meio Ambiente', 'Cultura', 'Educação', 'Saúde', 'Economia', 'Política', 'Filosofia', 'Geopolítica'
];

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
            publication_date: prompt.publication_date ? new Date(prompt.publication_date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
            deadline: prompt.deadline ? new Date(prompt.deadline).toISOString().slice(0, 16) : '',
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
                addToast({ title: "Erro ao Excluir", message: result.error, type: 'error' });
            } else {
                addToast({ title: "Sucesso", message: "Tema excluído com sucesso.", type: 'success' });
                router.refresh();
            }
            setConfirmDeleteOpen(false);
            setPromptToDelete(null);
        });
    };

    const handleFileUpload = async (file: File): Promise<string | null> => {
        setIsUploading(true);
        const fileExt = file.name.split('.').pop();
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
        const filePath = `covers/${fileName}`;

        const { error: uploadError } = await supabase.storage
            .from('essay_prompts')
            .upload(filePath, file);
        
        if (uploadError) {
            addToast({ title: "Erro no Upload", message: uploadError.message, type: 'error' });
            setIsUploading(false);
            return null;
        }

        const { data } = supabase.storage.from('essay_prompts').getPublicUrl(filePath);
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
            // CORREÇÃO AQUI: Converter string vazia para null no deadline
            const submissionData = {
                ...currentPrompt,
                deadline: currentPrompt.deadline ? currentPrompt.deadline : null,
                tags: currentPrompt.tags.split(',').map(tag => tag.trim()).filter(Boolean)
            };
            
            const result = await upsertPrompt(submissionData);
            if (result.error) {
                addToast({ title: "Erro ao Salvar", message: result.error, type: 'error' });
            } else {
                addToast({ title: "Tema Salvo", message: "O tema foi salvo e publicado.", type: 'success' });
                handleCloseModal();
                router.refresh();
            }
        });
    };

    return (
        <div className="bg-white dark:bg-dark-card p-6 rounded-lg shadow-md">
            <ConfirmationModal
                isOpen={isConfirmDeleteOpen}
                title="Confirmar Exclusão"
                message="Tem a certeza que deseja excluir este tema? Esta ação removerá o tema para todos os utilizadores globais."
                onConfirm={executeDelete}
                onClose={() => setConfirmDeleteOpen(false)}
                confirmText="Sim, Excluir"
            />
            
            <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-dark-text dark:text-white">Gerir Temas de Redação</h2>
                    <p className="text-sm text-gray-500">Crie temas visíveis para todos os utilizadores da plataforma (Globais).</p>
                </div>
                <button onClick={() => handleOpenModal(null)} className="bg-royal-blue text-white font-bold py-2 px-6 rounded-lg hover:bg-opacity-90 flex items-center gap-2 shadow-lg transition-transform hover:scale-105">
                    <i className="fas fa-plus"></i> Novo Tema
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-h-[800px] overflow-y-auto p-1">
                {prompts.map(prompt => (
                    <div key={prompt.id} className="group border dark:border-gray-700 rounded-xl overflow-hidden hover:shadow-lg transition-all bg-white dark:bg-gray-800 flex flex-col">
                        <div className="h-36 bg-gray-200 dark:bg-gray-700 relative overflow-hidden">
                            {prompt.image_url ? (
                                <Image src={prompt.image_url} alt={prompt.title} fill className="object-cover transition-transform duration-500 group-hover:scale-110" />
                            ) : (
                                <div className="flex items-center justify-center h-full text-gray-400">
                                    <i className="fas fa-image text-4xl"></i>
                                </div>
                            )}
                            <div className="absolute top-2 right-2 flex gap-1">
                                <span className="bg-black/60 text-white text-[10px] px-2 py-1 rounded-full backdrop-blur-sm">
                                    {prompt.category || 'Geral'}
                                </span>
                            </div>
                        </div>
                        <div className="p-4 flex-1 flex flex-col">
                            <h3 className="font-bold text-lg mb-1 line-clamp-2 text-dark-text dark:text-white leading-tight">{prompt.title}</h3>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mb-3 font-mono">{prompt.source || 'Autoral'}</p>
                            
                            <div className="flex items-center gap-2 mt-auto pt-4 border-t dark:border-gray-700">
                                <button onClick={() => handleOpenModal(prompt)} className="flex-1 text-sm bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 py-2 rounded-md font-bold hover:bg-blue-100 transition-colors">
                                    Editar
                                </button>
                                <button onClick={() => handleDeleteClick(prompt.id)} disabled={isPending} className="px-3 py-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md transition-colors disabled:opacity-50">
                                    <i className="fas fa-trash"></i>
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {isModalOpen && currentPrompt && (
                <div className="fixed inset-0 bg-black/60 z-[100] flex items-center justify-center p-4 overflow-y-auto">
                    <div className="bg-white dark:bg-dark-card rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col animate-fade-in my-auto">
                        <div className="p-5 border-b dark:border-gray-700 flex justify-between items-center bg-gray-50 dark:bg-gray-800 rounded-t-xl sticky top-0 z-10">
                            <h3 className="text-xl font-bold text-dark-text dark:text-white">
                                {currentPrompt.id ? 'Editar Tema' : 'Criar Novo Tema'}
                            </h3>
                            <button onClick={handleCloseModal} className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 text-2xl">&times;</button>
                        </div>
                        
                        <form id="prompt-form" onSubmit={handleSubmit} className="p-6 space-y-6 overflow-y-auto custom-scrollbar">
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-bold mb-1 dark:text-gray-300">Título do Tema <span className="text-red-500">*</span></label>
                                        <input type="text" value={currentPrompt.title || ''} onChange={e => setCurrentPrompt(p => p ? ({ ...p, title: e.target.value }) : null)} required className="w-full p-2.5 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:ring-2 focus:ring-royal-blue focus:outline-none" placeholder="Ex: Os desafios da mobilidade urbana" />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                         <div>
                                            <label className="block text-sm font-bold mb-1 dark:text-gray-300">Fonte / Origem</label>
                                            <input type="text" value={currentPrompt.source || ''} onChange={e => setCurrentPrompt(p => p ? ({ ...p, source: e.target.value }) : null)} className="w-full p-2.5 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white" placeholder="Ex: ENEM 2023, Autoral" />
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
                                        <textarea rows={8} value={currentPrompt.description || ''} onChange={e => setCurrentPrompt(p => p ? ({ ...p, description: e.target.value }) : null)} className="w-full p-2.5 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:ring-2 focus:ring-royal-blue focus:outline-none" placeholder="Instruções gerais sobre o tema..." />
                                    </div>
                                </div>

                                <div className="space-y-6">
                                     <div>
                                        <label className="block text-sm font-bold mb-2 dark:text-gray-300">Capa do Tema</label>
                                        <div className="flex items-start gap-4 p-3 border border-dashed rounded-lg dark:border-gray-600 bg-gray-50 dark:bg-gray-800/50">
                                            <div className="flex-1">
                                                <input type="file" onChange={(e) => handleImageChange(e, 'image_url')} accept="image/*" className="w-full text-sm file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-royal-blue/10 file:text-royal-blue hover:file:bg-royal-blue/20" />
                                                {isUploading && <p className="text-xs text-blue-500 mt-1">A carregar imagem...</p>}
                                                <input type="text" value={currentPrompt.cover_image_source || ''} onChange={e => setCurrentPrompt(p => p ? ({ ...p, cover_image_source: e.target.value }) : null)} placeholder="Créditos da imagem (opcional)" className="w-full mt-2 p-2 text-xs border rounded dark:bg-gray-700 dark:border-gray-600" />
                                            </div>
                                            {currentPrompt.image_url && (
                                                <div className="relative h-24 w-24 rounded-lg overflow-hidden border border-gray-200">
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
                                        <label className="block text-sm font-bold mb-1 dark:text-gray-300">Tags (separadas por vírgula)</label>
                                        <input type="text" value={currentPrompt.tags} onChange={e => setCurrentPrompt(p => p ? ({ ...p, tags: e.target.value }) : null)} placeholder="Ex: Cidadania, Direitos Humanos" className="w-full p-2.5 border rounded-lg dark:bg-gray-700 dark:border-gray-600" />
                                    </div>
                                </div>
                            </div>

                            <hr className="dark:border-gray-700" />

                            <div className="bg-blue-50 dark:bg-blue-900/10 p-5 rounded-xl border border-blue-100 dark:border-blue-800/30">
                                <h4 className="font-bold text-lg mb-4 text-royal-blue dark:text-blue-400">Textos Motivadores</h4>
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
                                            <label className="block text-xs font-bold uppercase text-gray-500 mb-1">Texto III (Imagem)</label>
                                            <input type="file" onChange={(e) => handleImageChange(e, 'motivational_text_3_image_url')} accept="image/*" className="w-full text-sm" />
                                            {currentPrompt.motivational_text_3_image_url && <div className="mt-2 relative h-24 w-full bg-gray-100 rounded flex items-center justify-center overflow-hidden"><Image src={currentPrompt.motivational_text_3_image_url} alt="Texto 3" width={150} height={100} className="object-contain h-full" /></div>}
                                        </div>
                                        <div className="space-y-2">
                                            <input type="text" value={currentPrompt.motivational_text_3_description || ''} onChange={e => setCurrentPrompt(p => p ? ({ ...p, motivational_text_3_description: e.target.value }) : null)} placeholder="Legenda da imagem" className="w-full p-2 border rounded-md text-sm dark:bg-gray-700 dark:border-gray-600" />
                                            <input type="text" value={currentPrompt.motivational_text_3_image_source || ''} onChange={e => setCurrentPrompt(p => p ? ({ ...p, motivational_text_3_image_source: e.target.value }) : null)} placeholder="Fonte da imagem" className="w-full p-2 border rounded-md text-sm dark:bg-gray-700 dark:border-gray-600" />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-bold mb-1 dark:text-gray-300">Data de Publicação</label>
                                    <input type="date" value={currentPrompt.publication_date || ''} onChange={e => setCurrentPrompt(p => p ? ({ ...p, publication_date: e.target.value }) : null)} className="w-full p-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600" />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold mb-1 dark:text-gray-300">Prazo Final (Opcional)</label>
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