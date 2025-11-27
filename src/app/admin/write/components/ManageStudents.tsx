"use client";

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { updateUserVerification } from '../../actions';
import { VerificationBadge } from '@/components/VerificationBadge';
import { useToast } from '@/contexts/ToastContext';

type Student = {
    id: string;
    full_name: string | null;
    user_category: string | null;
    created_at: string | null;
    verification_badge: string | null;
};

const StudentRow = ({ student }: { student: Student }) => {
    const [selectedBadge, setSelectedBadge] = useState(student.verification_badge || 'none');
    const [isPending, startTransition] = useTransition();
    const router = useRouter();
    const { addToast } = useToast();
    
    const hasChanged = selectedBadge !== (student.verification_badge || 'none');

    const handleSave = () => {
        startTransition(async () => {
            const newBadge = selectedBadge === 'none' ? null : selectedBadge;
            const result = await updateUserVerification(student.id, newBadge);

            if (result.error) {
                addToast({ title: "Erro ao Atualizar", message: `Não foi possível atualizar o aluno: ${result.error}`, type: 'error' });
                setSelectedBadge(student.verification_badge || 'none');
            } else {
                addToast({ title: "Sucesso!", message: "O selo do aluno foi atualizado.", type: 'success' });
                router.refresh();
            }
        });
    };

    return (
        <tr className="border-b dark:border-gray-700">
            <td className="px-6 py-4 font-medium text-dark-text dark:text-white flex items-center gap-2">
                {student.full_name}
                <VerificationBadge badge={student.verification_badge} />
            </td>
            <td className="px-6 py-4 capitalize text-text-muted dark:text-gray-400">{student.user_category}</td>
            <td className="px-6 py-4 flex items-center gap-2">
                <select
                    value={selectedBadge}
                    onChange={(e) => setSelectedBadge(e.target.value)}
                    disabled={isPending}
                    className="bg-gray-50 border border-gray-300 text-sm rounded-lg p-2 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                >
                    <option value="none">Nenhum</option>
                    <option value="blue">Azul (Identidade Verificada)</option>
                    <option value="red">Vermelho (Aluno Destaque)</option>
                </select>
                {hasChanged && (
                    <button 
                        onClick={handleSave} 
                        disabled={isPending}
                        className="bg-green-500 text-white text-xs font-bold py-2 px-3 rounded-lg hover:bg-green-600 disabled:bg-gray-400"
                    >
                        {isPending ? 'Salvando...' : 'Salvar'}
                    </button>
                )}
            </td>
        </tr>
    );
};


export default function ManageStudents({ students }: { students: Student[] }) {
    return (
        <div className="bg-white dark:bg-dark-card p-6 rounded-lg shadow-md">
            <h2 className="text-2xl font-bold mb-4 text-dark-text dark:text-white">Gerenciar Alunos</h2>
            <p className="text-sm text-gray-500 mb-4">Total de Alunos e Vestibulandos: {students.length}</p>
            <div className="max-h-96 overflow-auto">
                <table className="w-full text-sm text-left">
                    <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400 sticky top-0">
                        <tr>
                            <th scope="col" className="px-6 py-3">Nome</th>
                            <th scope="col" className="px-6 py-3">Tipo</th>
                            <th scope="col" className="px-6 py-3">Ação (Atribuir Selo)</th>
                        </tr>
                    </thead>
                    <tbody>
                        {students.map(s => (
                            <StudentRow key={s.id} student={s} />
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}