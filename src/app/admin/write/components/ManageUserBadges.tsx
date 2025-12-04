// NOVO ARQUIVO: src/app/admin/write/components/ManageUserBadges.tsx

"use client";

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { updateUserVerification } from '../../actions'; 
import { VerificationBadge } from '@/components/VerificationBadge';
import { useToast } from '@/contexts/ToastContext';

type UserForBadgeManagement = { 
  id: string; 
  full_name: string | null; 
  user_category: string | null; // Mantido para exibição de contexto
  verification_badge: string | null;
};

// Opções globais de selo para toda a plataforma
const ALL_BADGE_OPTIONS = [
    { value: 'none', label: 'Nenhum' },
    { value: 'identity', label: 'Azul (Identidade Verificada)' },
    { value: 'educator', label: 'Verde (Educador Verificado)' },
    { value: 'official', label: 'Amarelo (Conta Oficial / Admin)' },
    { value: 'featured', label: 'Vermelho (Conta Destaque)' },
    { value: 'legacy', label: 'Roxo (Usuário Legado)' },
];

const UserRow = ({ user }: { user: UserForBadgeManagement }) => {
    const initialBadge = user.verification_badge;
    const [selectedBadge, setSelectedBadge] = useState(initialBadge || 'none');
    const [isPending, startTransition] = useTransition();
    const router = useRouter();
    const { addToast } = useToast();

    // Compara com o valor inicial para detectar mudanças
    const hasChanged = selectedBadge !== (initialBadge || 'none');

    const handleSave = () => {
        startTransition(async () => {
            const newBadge = selectedBadge === 'none' ? null : selectedBadge;
            const result = await updateUserVerification(user.id, newBadge);

            if (result.error) {
                addToast({ title: "Erro ao Atualizar", message: `Não foi possível atualizar o selo de ${user.full_name}: ${result.error}`, type: 'error' });
                setSelectedBadge(initialBadge || 'none'); // Volta ao estado original em caso de erro
            } else {
                addToast({ title: "Sucesso!", message: `O selo de ${user.full_name} foi atualizado para: ${newBadge || 'Nenhum'}.`, type: 'success' });
                router.refresh(); // Recarrega para refletir o novo badge
            }
        });
    };

    return (
        <tr className="border-b dark:border-gray-700">
            <td className="px-6 py-4 font-medium text-dark-text dark:text-white flex items-center gap-2">
                {user.full_name}
                <VerificationBadge badge={user.verification_badge} />
            </td>
            <td className="px-6 py-4 capitalize text-gray-500 dark:text-gray-400">
                {user.user_category}
            </td>
            <td className="px-6 py-4 flex items-center gap-2">
                <select
                    value={selectedBadge}
                    onChange={(e) => setSelectedBadge(e.target.value)}
                    disabled={isPending}
                    className="bg-gray-50 border border-gray-300 text-sm rounded-lg p-2 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                >
                    {ALL_BADGE_OPTIONS.map(option => (
                        <option key={option.value} value={option.value}>
                            {option.label}
                        </option>
                    ))}
                </select>
                {hasChanged && (
                    <button 
                        onClick={handleSave} 
                        disabled={isPending}
                        className="bg-brand-purple text-white text-xs font-bold py-2 px-3 rounded-lg hover:bg-brand-purple/90 disabled:bg-gray-400"
                    >
                        {isPending ? 'Salvando...' : 'Salvar'}
                    </button>
                )}
            </td>
        </tr>
    );
};

interface ManageUserBadgesProps {
    users: UserForBadgeManagement[];
    title: string;
    totalCount: number;
}

export default function ManageUserBadges({ users, title, totalCount }: ManageUserBadgesProps) {
    return (
        <div className="bg-white dark:bg-dark-card p-6 rounded-lg shadow-md">
            <h2 className="text-2xl font-bold mb-4 text-dark-text dark:text-white">{title}</h2>
            <p className="text-sm text-gray-500 mb-4">Total de Usuários: {totalCount}</p>
            <div className="max-h-96 overflow-auto">
                <table className="w-full text-sm text-left">
                    <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400 sticky top-0">
                        <tr>
                            <th scope="col" className="px-6 py-3">Nome</th>
                            <th scope="col" className="px-6 py-3">Categoria</th>
                            <th scope="col" className="px-6 py-3">Atribuir Selo</th>
                        </tr>
                    </thead>
                    <tbody>
                        {users.map(u => (
                            <UserRow key={u.id} user={u} />
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}