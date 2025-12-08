"use client";

import { useState } from 'react';
import CreateTestModal from './CreateTestModal';

// O dashboard recebe 'dashboardData' que vem do getTeacherDashboardData no page.tsx
export default function TeacherTestDashboard({ dashboardData }: { dashboardData: any }) {
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    
    // Garante que classes e activeTests não sejam undefined
    const classes = dashboardData?.classes || [];
    const activeTests = dashboardData?.activeTests || [];
    const isInstitutional = dashboardData?.isInstitutional || false;

    return (
        <div className="p-6 space-y-8 animate-in fade-in">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-dark-text dark:text-white">Central de Avaliações</h1>
                    <p className="text-gray-500 mt-1">Crie, gerencie e analise o desempenho dos seus alunos.</p>
                </div>
                <button 
                    onClick={() => setIsCreateModalOpen(true)}
                    className="bg-royal-blue text-white font-bold py-3 px-6 rounded-xl hover:bg-blue-700 shadow-lg flex items-center gap-2 transform transition hover:-translate-y-1"
                >
                    <i className="fas fa-plus-circle"></i> Novo Simulado 2.0
                </button>
            </div>

            {/* Lista de Testes */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
                <div className="p-6 border-b dark:border-gray-700">
                    <h3 className="font-bold text-lg text-dark-text dark:text-white">Simulados Ativos</h3>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-gray-50 dark:bg-gray-700/50 text-gray-500 uppercase text-xs">
                            <tr>
                                <th className="px-6 py-4 font-semibold">Título</th>
                                <th className="px-6 py-4 font-semibold">Dificuldade</th>
                                <th className="px-6 py-4 font-semibold">Questões</th>
                                <th className="px-6 py-4 font-semibold text-right">Ações</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                            {activeTests.length > 0 ? activeTests.map((test: any) => (
                                <tr key={test.id} className="group hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                                    <td className="px-6 py-4 font-medium dark:text-white">{test.title}</td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2 py-1 rounded text-xs font-bold uppercase ${
                                            test.difficulty === 'facil' ? 'bg-green-100 text-green-700' :
                                            test.difficulty === 'dificil' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'
                                        }`}>
                                            {test.difficulty || 'médio'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-gray-500">{test.question_count}</td>
                                    <td className="px-6 py-4 text-right">
                                        <button className="text-gray-400 hover:text-royal-blue mx-2"><i className="fas fa-edit"></i></button>
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan={4} className="px-6 py-12 text-center text-gray-500">
                                        Nenhum simulado criado. Clique no botão acima para começar.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Modal de Criação (AGORA COM AS PROPS CORRETAS) */}
            {isCreateModalOpen && (
                <CreateTestModal 
                    isOpen={isCreateModalOpen} 
                    onClose={() => setIsCreateModalOpen(false)} 
                    onSuccess={() => { setIsCreateModalOpen(false); window.location.reload(); }}
                    classes={classes} // Passando as turmas
                    isInstitutional={isInstitutional} // Passando o contexto
                />
            )}
        </div>
    );
}