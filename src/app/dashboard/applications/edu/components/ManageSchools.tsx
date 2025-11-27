"use client";

import { useState } from 'react';
import { Organization, SchoolClass, UserProfile } from '@/app/dashboard/types';
import ClassManager from './ClassManager';

// CORREÇÃO: Definimos ClassMember para incluir 'role', satisfazendo o ClassManager
type ClassMember = UserProfile & { role: string };

type ManageSchoolsProps = {
    organization: Organization;
    // CORREÇÃO: Atualizado de UserProfile[] para ClassMember[]
    classes: (SchoolClass & { members: ClassMember[] })[];
    members: UserProfile[];
    unassignedUsers: UserProfile[];
};

export default function ManageSchools({ organization, classes: initialClasses, members, unassignedUsers: initialUnassignedUsers }: ManageSchoolsProps) {
    const [activeTab, setActiveTab] = useState('classes'); 

    return (
        <div className="bg-white dark:bg-dark-card p-6 rounded-lg shadow">
            <div className="border-b border-gray-200 dark:border-gray-700">
                <nav className="flex space-x-4" aria-label="Tabs">
                    <button 
                        onClick={() => setActiveTab('details')} 
                        className={`py-2 px-4 font-medium text-sm transition-colors ${activeTab === 'details' ? 'border-b-2 border-royal-blue text-royal-blue' : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'}`}
                    >
                        Detalhes da Instituição
                    </button>
                    <button 
                        onClick={() => setActiveTab('classes')} 
                        className={`py-2 px-4 font-medium text-sm transition-colors ${activeTab === 'classes' ? 'border-b-2 border-royal-blue text-royal-blue' : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'}`}
                    >
                        Gerenciar Turmas
                    </button>
                </nav>
            </div>

            <div className="mt-6">
                {activeTab === 'details' && (
                    <div className="space-y-4">
                        <h2 className="text-2xl font-bold dark:text-white">{organization.name}</h2>
                        <div>
                            <dt className="text-sm font-medium text-gray-500">CNPJ</dt>
                            <dd className="mt-1 text-sm text-gray-900 dark:text-gray-200">{organization.cnpj || 'Não informado'}</dd>
                        </div>
                    </div>
                )}
                {activeTab === 'classes' && (
                    <ClassManager
                        organizationId={organization.id}
                        initialClasses={initialClasses}
                        organizationMembers={members}
                        initialUnassignedUsers={initialUnassignedUsers}
                    />
                )}
            </div>
        </div>
    );
}