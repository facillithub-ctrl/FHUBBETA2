"use client";

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { upsertUpdate, deleteUpdate } from '../mutations'; 
import type { Update } from '@/app/(hubs)/education/dashboard/types';
import { useToast } from '@/contexts/ToastContext';
import ConfirmationModal from '@/components/ConfirmationModal';
import RichTextEditor from '@/components/DynamicRichTextEditor';

type Props = {
    updates: Update[];
};

export default function ManageUpdates({ updates }: Props) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentUpdate, setCurrentUpdate] = useState<Partial<Update> | null>(null);
    const [isPending, startTransition] = useTransition();
    const [isConfirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
    const [updateToDelete, setUpdateToDelete] = useState<string | null>(null);
    const router = useRouter();
    const { addToast } = useToast();

    const handleOpenModal = (update: Partial<Update> | null) => {
        setCurrentUpdate(update || { content: '' }); 
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setCurrentUpdate(null);
    };

    const handleDeleteClick = (updateId: string) => {
        setUpdateToDelete(updateId);
        setConfirmDeleteOpen(true);
    };

    const executeDelete = () => {
        if (!updateToDelete) return;
        startTransition(async () => {
            const result = await deleteUpdate(updateToDelete);
            if (result.error) {
                addToast({ title: "Erro", message: result.error, type: 'error' });
            } else {
                addToast({ title: "Sucesso", message: "Atualização excluída.", type: 'success' });
                router.refresh();
            }
            setConfirmDeleteOpen(false);
            setUpdateToDelete(null);
        });
    };

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!currentUpdate) return;
        startTransition(async () => {
            const result = await upsertUpdate(currentUpdate);
            if (result.error) {
                addToast({ title: "Erro", message: result.error, type: 'error' });
            } else {
                addToast({ title: "Sucesso", message: "Atualização salva.", type: 'success' });
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
                message="Tem certeza que deseja excluir esta atualização?"
                onConfirm={executeDelete}
                onClose={() => setConfirmDeleteOpen(false)}
                confirmText="Sim, Excluir"
            />
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold text-dark-text dark:text-white">Gerenciar Atualizações</h2>
                <button onClick={() => handleOpenModal(null)} className="bg-royal-blue text-white font-bold py-2 px-4 rounded-lg hover:bg-opacity-90">
                    <i className="fas fa-plus mr-2"></i> Nova Atualização
                </button>
            </div>
            <div className="max-h-96 overflow-auto">
                <ul className="divide-y dark:divide-gray-700">
                    {updates.map(update => (
                        <li key={update.id} className="py-3 flex justify-between items-center">
                            <div>
                                <p className="font-medium text-dark-text dark:text-white">{update.title}</p>
                                <p className="text-xs text-gray-500">{new Date(update.created_at).toLocaleDateString('pt-BR')}</p>
                            </div>
                            <div className="space-x-2">
                                <button onClick={() => handleOpenModal(update)} className="text-blue-500 hover:underline">Editar</button>
                                <button onClick={() => handleDeleteClick(update.id)} disabled={isPending} className="text-red-500 hover:underline disabled:opacity-50">Excluir</button>
                            </div>
                        </li>
                    ))}
                </ul>
            </div>

            {isModalOpen && currentUpdate && (
                <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
                    <div className="bg-white dark:bg-dark-card rounded-lg shadow-xl w-full max-w-3xl max-h-[90vh] flex flex-col">
                        <form onSubmit={handleSubmit} className="flex flex-col h-full">
                            <div className="p-4 border-b dark:border-gray-700">
                                <h3 className="text-lg font-bold">{currentUpdate.id ? 'Editar' : 'Nova'} Atualização</h3>
                            </div>
                            <div className="p-6 space-y-4 overflow-y-auto">
                                <div>
                                    <label className="block text-sm font-medium mb-1">Título</label>
                                    <input type="text" value={currentUpdate.title || ''} onChange={e => setCurrentUpdate(p => p ? ({ ...p, title: e.target.value }) : null)} required className="w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600" />
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium mb-1">Módulo</label>
                                        <select value={currentUpdate.module_slug || 'general'} onChange={e => setCurrentUpdate(p => p ? ({ ...p, module_slug: e.target.value }) : null)} className="w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 bg-white">
                                            <option value="general">Geral</option>
                                            <option value="facillit-write">Facillit Write</option>
                                            <option value="facillit-test">Facillit Test</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-1">Categoria</label>
                                        {/* ✅ CORREÇÃO APLICADA AQUI */}
                                        <select 
                                            value={currentUpdate.category || ''} 
                                            onChange={e => setCurrentUpdate(p => p ? ({ ...p, category: e.target.value as Update['category'] }) : null)} 
                                            className="w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 bg-white"
                                        >
                                            <option value="">Selecione...</option>
                                            <option>Nova Funcionalidade</option>
                                            <option>Melhoria</option>
                                            <option>Correção</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-1">Versão (Opcional)</label>
                                        <input type="text" value={currentUpdate.version || ''} onChange={e => setCurrentUpdate(p => p ? ({ ...p, version: e.target.value }) : null)} placeholder="Ex: 1.2.0" className="w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600" />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">Conteúdo</label>
                                    <RichTextEditor
                                        value={currentUpdate.content || ''}
                                        onChange={value => setCurrentUpdate(p => p ? ({ ...p, content: value }) : null)}
                                        placeholder="Escreva os detalhes da atualização..."
                                    />
                                </div>
                            </div>
                            <div className="p-4 border-t dark:border-gray-700 flex justify-end gap-2 mt-auto">
                                <button type="button" onClick={handleCloseModal} className="bg-gray-200 text-gray-800 font-bold py-2 px-4 rounded-lg hover:bg-gray-300">Cancelar</button>
                                <button type="submit" disabled={isPending} className="bg-royal-blue text-white font-bold py-2 px-4 rounded-lg disabled:bg-gray-400">
                                    {isPending ? 'Salvando...' : 'Salvar'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}