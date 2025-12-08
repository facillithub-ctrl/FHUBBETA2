"use client";

import { useState, useTransition } from 'react';
import { SchoolClass, UserProfile } from '@/app/(hubs)/education/dashboard/types';
import { createClass, addUserToClass, removeUserFromClass } from '../actions';
import { useToast } from '@/contexts/ToastContext';
import ConfirmationModal from '@/components/ConfirmationModal';
import { useRouter } from 'next/navigation';

// 1. Criamos um tipo estendido que inclui 'role', pois UserProfile padrão não o tem.
type ClassMember = UserProfile & { role: string };

type ClassManagerProps = {
    organizationId: string;
    // 2. Atualizamos a definição das classes iniciais para usar ClassMember
    initialClasses: (SchoolClass & { members: ClassMember[] })[];
    organizationMembers: UserProfile[];
    initialUnassignedUsers: UserProfile[];
};

export default function ClassManager({ organizationId, initialClasses, organizationMembers, initialUnassignedUsers }: ClassManagerProps) {
    const [newClassName, setNewClassName] = useState('');
    
    // 3. Atualizamos o tipo do estado selectedClass para usar ClassMember
    const [selectedClass, setSelectedClass] = useState<(SchoolClass & { members: ClassMember[] }) | null>(null);
    
    const [userToAdd, setUserToAdd] = useState('');
    const [roleToAdd, setRoleToAdd] = useState<'student' | 'teacher'>('student');
    const [isPending, startTransition] = useTransition();
    const { addToast } = useToast();
    const router = useRouter(); 
    
    const [isModalOpen, setModalOpen] = useState(false);
    const [memberToRemove, setMemberToRemove] = useState<{classId: string, userId: string} | null>(null);

    const refreshData = () => {
        router.refresh();
        setSelectedClass(null);
    };

    const handleCreateClass = async () => {
        const trimmedName = newClassName.trim();
        if (!trimmedName) {
            addToast({ title: 'Atenção', message: 'O nome da turma não pode estar vazio.', type: 'error' });
            return;
        }

        startTransition(async () => {
            const result = await createClass(organizationId, trimmedName);
            
            if (result.error) {
                addToast({ title: 'Erro ao Criar Turma', message: result.error, type: 'error' });
            } else {
                setNewClassName('');
                addToast({ title: 'Sucesso', message: `Turma "${trimmedName}" criada com sucesso!`, type: 'success' });
                refreshData();
            }
        });
    };

    const handleAddUserToClass = async () => {
        if (!userToAdd || !selectedClass) {
            addToast({ title: 'Atenção', message: 'Selecione uma turma e um usuário para adicionar.', type: 'error' });
            return;
        }
        startTransition(async () => {
            const result = await addUserToClass(selectedClass.id, userToAdd, roleToAdd);
            if (result.error) {
                addToast({ title: 'Erro ao Adicionar', message: result.error, type: 'error' });
            } else {
                setUserToAdd('');
                addToast({ title: 'Sucesso', message: 'Usuário adicionado à turma!', type: 'success' });
                refreshData();
            }
        });
    };
    
    const openConfirmationModal = (classId: string, userId: string) => {
        setMemberToRemove({ classId, userId });
        setModalOpen(true);
    };

    const handleRemoveUserFromClass = () => {
        if (!memberToRemove) return;
        
        startTransition(async () => {
            const result = await removeUserFromClass(memberToRemove.classId, memberToRemove.userId);
            
            if (result.error) {
                addToast({ title: 'Erro ao Remover', message: result.error, type: 'error' });
            } else {
                addToast({ title: 'Sucesso', message: 'Usuário removido da turma!', type: 'success' });
                refreshData();
            }
            setModalOpen(false);
            setMemberToRemove(null);
        });
    };

    return (
        <div>
            <div className="mb-6 p-4 border dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-700/20">
                <h3 className="font-bold mb-2 dark:text-white">Criar Nova Turma</h3>
                <div className="flex flex-col sm:flex-row gap-2">
                    <input
                        type="text"
                        value={newClassName}
                        onChange={(e) => setNewClassName(e.target.value)}
                        placeholder="Nome da Turma (ex: 3º Ano A)"
                        className="w-full p-2 border rounded-md dark:bg-gray-800 dark:border-gray-600 dark:text-white"
                    />
                    <button onClick={handleCreateClass} disabled={isPending} className="bg-royal-blue text-white font-bold py-2 px-4 rounded-lg disabled:bg-gray-400 transition-colors hover:bg-opacity-90">
                        {isPending ? 'Criando...' : 'Criar'}
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-1">
                    <h3 className="font-bold mb-2 dark:text-white">Turmas Existentes</h3>
                    <ul className="space-y-2 max-h-96 overflow-y-auto">
                        {initialClasses.length > 0 ? initialClasses.map(c => (
                            <li key={c.id}>
                                <button onClick={() => setSelectedClass(c)} className={`w-full text-left p-3 rounded-lg border dark:border-gray-700 transition-all ${selectedClass?.id === c.id ? 'bg-blue-100 border-royal-blue dark:bg-blue-900/30 dark:border-royal-blue' : 'hover:bg-gray-50 dark:hover:bg-gray-800'}`}>
                                    <p className="font-semibold dark:text-white">{c.name}</p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">{c.members.length} {c.members.length === 1 ? 'membro' : 'membros'}</p>
                                </button>
                            </li>
                        )) : <p className="text-sm text-gray-500 p-3">Nenhuma turma criada ainda.</p>}
                    </ul>
                </div>

                {selectedClass ? (
                    <div className="md:col-span-2 p-4 border dark:border-gray-700 rounded-lg">
                        <h3 className="font-bold text-lg mb-4 dark:text-white">Gerir Turma: {selectedClass.name}</h3>

                        <div className="mb-6">
                            <h4 className="font-semibold mb-2 dark:text-white">Adicionar Membro</h4>
                            <div className="flex flex-col sm:flex-row gap-2">
                                <select value={userToAdd} onChange={e => setUserToAdd(e.target.value)} className="p-2 border rounded-md flex-grow dark:bg-gray-800 dark:border-gray-600 dark:text-white">
                                    <option value="">Selecione um usuário</option>
                                    {initialUnassignedUsers.map(user => <option key={user.id} value={user.id}>{user.fullName} ({user.userCategory})</option>)}
                                </select>
                                <select value={roleToAdd} onChange={e => setRoleToAdd(e.target.value as any)} className="p-2 border rounded-md dark:bg-gray-800 dark:border-gray-600 dark:text-white">
                                    <option value="student">Aluno</option>
                                    <option value="teacher">Professor</option>
                                </select>
                                <button onClick={handleAddUserToClass} disabled={isPending} className="bg-royal-blue text-white font-bold py-2 px-4 rounded-lg disabled:bg-gray-400 transition-colors hover:bg-opacity-90">
                                    {isPending ? 'Adicionando...' : 'Adicionar'}
                                </button>
                            </div>
                        </div>

                        <div>
                            <h4 className="font-semibold mb-2 dark:text-white">Membros da Turma</h4>
                            <ul className="space-y-2 max-h-60 overflow-y-auto">
                                {selectedClass.members.length > 0 ? selectedClass.members.map(member => (
                                    <li key={member.id} className="flex justify-between items-center p-2 bg-gray-50 dark:bg-gray-800 rounded-md">
                                        <span className="dark:text-white">
                                            {member.fullName} <span className="text-xs text-gray-500 dark:text-gray-400 capitalize">({member.role === 'teacher' ? 'Professor' : 'Aluno'})</span>
                                        </span>
                                        <button onClick={() => openConfirmationModal(selectedClass.id, member.id)} className="text-red-500 hover:text-red-700 text-sm font-medium">Remover</button>
                                    </li>
                                )) : (
                                    <p className="text-sm text-center text-gray-500 dark:text-gray-400 p-4">Esta turma ainda não tem membros.</p>
                                )}
                            </ul>
                        </div>
                    </div>
                ) : (
                    <div className="md:col-span-2 p-4 border dark:border-gray-700 rounded-lg flex items-center justify-center">
                        <p className="text-gray-500 dark:text-gray-400">Selecione uma turma para ver os detalhes.</p>
                    </div>
                )}
            </div>
            
             <ConfirmationModal
                isOpen={isModalOpen}
                onClose={() => setModalOpen(false)}
                onConfirm={handleRemoveUserFromClass}
                title="Confirmar Remoção"
                message="Tem a certeza de que deseja remover este utilizador da turma? Esta ação não pode ser desfeita."
                confirmText="Sim, Remover"
            />
        </div>
    );
}