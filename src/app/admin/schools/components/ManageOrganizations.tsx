"use client";

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { createOrganization, generateInviteCode } from '../../actions';
import { useToast } from '@/contexts/ToastContext';
// import ConfirmationModal from '@/components/ConfirmationModal'; // Mantido import se necessário, mas não usado no snippet

type Organization = {
    id: string;
    name: string;
    cnpj: string | null;
    created_at: string;
    owner_id?: string; // Adicionado para corresponder ao retorno da query
    // Tornado opcional (?) pois a query no actions.ts não retorna mais os perfis
    profiles?: { full_name: string | null }[] | null; 
};

// Componente do Modal de Criação
const CreateOrgModal = ({ isOpen, onClose, onSave, isPending }: { isOpen: boolean, onClose: () => void, onSave: (name: string, cnpj: string | null) => void, isPending: boolean }) => {
    const [name, setName] = useState('');
    const [cnpj, setCnpj] = useState('');

    if (!isOpen) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(name, cnpj || null);
    };

    return (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
            <div className="bg-white dark:bg-dark-card rounded-lg shadow-xl w-full max-w-md" onClick={e => e.stopPropagation()}>
                <form onSubmit={handleSubmit}>
                    <div className="p-6">
                        <h3 className="text-lg font-bold mb-4">Nova Instituição</h3>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium mb-1">Nome da Instituição</label>
                                <input type="text" value={name} onChange={e => setName(e.target.value)} required className="w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">CNPJ (Opcional)</label>
                                <input type="text" value={cnpj} onChange={e => setCnpj(e.target.value)} className="w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600" />
                            </div>
                        </div>
                    </div>
                    <div className="p-4 bg-gray-50 dark:bg-gray-800 flex justify-end gap-2 rounded-b-lg">
                        <button type="button" onClick={onClose} className="bg-gray-200 text-gray-800 font-bold py-2 px-4 rounded-lg">Cancelar</button>
                        <button type="submit" disabled={isPending} className="bg-royal-blue text-white font-bold py-2 px-4 rounded-lg disabled:bg-gray-400">
                            {isPending ? 'Criando...' : 'Criar'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

// Componente do Modal de Geração de Código
const GenerateCodeModal = ({ org, onClose, onGenerate, isPending }: { org: Organization | null, onClose: () => void, onGenerate: (role: 'diretor' | 'professor' | 'aluno') => void, isPending: boolean }) => {
    const [role, setRole] = useState<'diretor' | 'professor' | 'aluno'>('aluno');

    if (!org) return null;

    return (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
            <div className="bg-white dark:bg-dark-card rounded-lg shadow-xl w-full max-w-md" onClick={e => e.stopPropagation()}>
                <div className="p-6">
                    <h3 className="text-lg font-bold">Gerar Código para:</h3>
                    <p className="text-royal-blue font-semibold mb-4">{org.name}</p>
                    <div>
                        <label className="block text-sm font-medium mb-1">Tipo de Usuário (Perfil)</label>
                        <select value={role} onChange={e => setRole(e.target.value as any)} className="w-full p-2 border rounded-md bg-white dark:bg-gray-700 dark:border-gray-600">
                            <option value="aluno">Aluno</option>
                            <option value="professor">Professor</option>
                            <option value="diretor">Diretor</option>
                        </select>
                    </div>
                </div>
                <div className="p-4 bg-gray-50 dark:bg-gray-800 flex justify-end gap-2 rounded-b-lg">
                    <button type="button" onClick={onClose} className="bg-gray-200 text-gray-800 font-bold py-2 px-4 rounded-lg">Cancelar</button>
                    <button type="button" onClick={() => onGenerate(role)} disabled={isPending} className="bg-royal-blue text-white font-bold py-2 px-4 rounded-lg disabled:bg-gray-400">
                        {isPending ? 'Gerando...' : 'Gerar'}
                    </button>
                </div>
            </div>
        </div>
    );
};

// Componente Principal
export default function ManageOrganizations({ initialOrganizations }: { initialOrganizations: Organization[] }) {
    const [isCreateModalOpen, setCreateModalOpen] = useState(false);
    const [orgForCode, setOrgForCode] = useState<Organization | null>(null);
    const [generatedCode, setGeneratedCode] = useState<string | null>(null);
    const [isPending, startTransition] = useTransition();
    const { addToast } = useToast();
    const router = useRouter();

    const handleCreateOrg = (name: string, cnpj: string | null) => {
        startTransition(async () => {
            const result = await createOrganization(name, cnpj);
            if (result.error) {
                addToast({ title: 'Erro', message: result.error, type: 'error' });
            } else {
                addToast({ title: 'Sucesso', message: `Instituição "${name}" criada.`, type: 'success' });
                setCreateModalOpen(false);
                router.refresh();
            }
        });
    };
    
    const handleGenerateCode = (role: 'diretor' | 'professor' | 'aluno') => {
        if (!orgForCode) return;
        startTransition(async () => {
            const result = await generateInviteCode({ organizationId: orgForCode.id, role });
             if (result.error) {
                addToast({ title: 'Erro', message: result.error, type: 'error' });
            } else if (result.data?.code) {
                addToast({ title: 'Código Gerado!', message: 'Copie o código e envie para o usuário.', type: 'success' });
                setGeneratedCode(result.data.code);
            }
        });
    };

    const closeCodeModal = () => {
        setOrgForCode(null);
        setGeneratedCode(null);
    };

    return (
        <div className="bg-white dark:bg-dark-card p-6 rounded-lg shadow-md">
            <CreateOrgModal isOpen={isCreateModalOpen} onClose={() => setCreateModalOpen(false)} onSave={handleCreateOrg} isPending={isPending} />
            <GenerateCodeModal org={orgForCode} onClose={closeCodeModal} onGenerate={handleGenerateCode} isPending={isPending} />

            {generatedCode && (
                 <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
                    <div className="bg-white dark:bg-dark-card rounded-lg shadow-xl w-full max-w-md p-6 text-center">
                        <h3 className="text-lg font-bold mb-2">Código Gerado com Sucesso!</h3>
                        <p className="mb-4 text-text-muted">Envie este código para o novo usuário:</p>
                        <div className="p-3 bg-gray-100 rounded-lg font-mono text-xl tracking-widest">{generatedCode}</div>
                        <button onClick={closeCodeModal} className="mt-6 bg-royal-blue text-white font-bold py-2 px-6 rounded-lg">Fechar</button>
                    </div>
                </div>
            )}

            <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold">Todas as Instituições</h2>
                <button onClick={() => setCreateModalOpen(true)} className="bg-royal-blue text-white font-bold py-2 px-4 rounded-lg">
                    <i className="fas fa-plus mr-2"></i> Criar Instituição
                </button>
            </div>

            <div className="max-h-[60vh] overflow-auto">
                <table className="w-full text-sm text-left">
                    <thead className="text-xs uppercase bg-gray-50 dark:bg-gray-700 sticky top-0">
                        <tr>
                            <th scope="col" className="px-6 py-3">Nome</th>
                            <th scope="col" className="px-6 py-3">CNPJ</th>
                            <th scope="col" className="px-6 py-3">Data de Criação</th>
                            <th scope="col" className="px-6 py-3">Ações</th>
                        </tr>
                    </thead>
                    <tbody>
                        {initialOrganizations.map(org => (
                            <tr key={org.id} className="border-b dark:border-gray-700">
                                <td className="px-6 py-4 font-medium">{org.name}</td>
                                <td className="px-6 py-4">{org.cnpj || '-'}</td>
                                <td className="px-6 py-4">{new Date(org.created_at).toLocaleDateString('pt-BR')}</td>
                                <td className="px-6 py-4">
                                    <button onClick={() => setOrgForCode(org)} className="font-medium text-royal-blue hover:underline">
                                        Gerar Código
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}