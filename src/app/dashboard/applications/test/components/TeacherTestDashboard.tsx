"use client";

import { useState } from 'react';
import CreateTestModal from './CreateTestModal';

export default function TeacherTestDashboard({ dashboardData }: { dashboardData: any }) {
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    
    return (
        <div className="p-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-dark-text dark:text-white">Central de Avaliações</h1>
                    <p className="text-gray-500 mt-1">Gerencie simulados, acompanhe a turma e crie avaliações inteligentes.</p>
                </div>
                <button 
                    onClick={() => setIsCreateModalOpen(true)}
                    className="bg-royal-blue text-white font-bold py-3 px-6 rounded-xl hover:bg-blue-700 shadow-lg flex items-center gap-2 transform transition hover:-translate-y-1"
                >
                    <i className="fas fa-plus-circle"></i> Novo Simulado 2.0
                </button>
            </div>

            {/* Cards de Resumo da Turma */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-5 border-l-4 border-royal-blue">
                    <p className="text-xs text-gray-500 uppercase font-bold">Média da Turma</p>
                    <p className="text-3xl font-bold text-dark-text dark:text-white mt-1">72%</p>
                    <p className="text-xs text-green-500 mt-1 flex items-center gap-1"><i className="fas fa-arrow-up"></i> +5% essa semana</p>
                </div>
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-5 border-l-4 border-red-500">
                    <p className="text-xs text-gray-500 uppercase font-bold">Alunos em Risco</p>
                    <p className="text-3xl font-bold text-dark-text dark:text-white mt-1">3</p>
                    <button className="text-xs text-red-500 underline mt-1 hover:text-red-700">Ver lista</button>
                </div>
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-5 border-l-4 border-green-500">
                    <p className="text-xs text-gray-500 uppercase font-bold">Simulados Ativos</p>
                    <p className="text-3xl font-bold text-dark-text dark:text-white mt-1">{dashboardData?.activeTests?.length || 0}</p>
                </div>
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-5 border-l-4 border-purple-500">
                    <p className="text-xs text-gray-500 uppercase font-bold">Taxa de Engajamento</p>
                    <p className="text-3xl font-bold text-dark-text dark:text-white mt-1">88%</p>
                </div>
            </div>

            {/* Lista de Testes Ativos */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
                <div className="p-6 border-b dark:border-gray-700">
                    <h3 className="font-bold text-lg text-dark-text dark:text-white">Simulados Criados</h3>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="text-xs text-gray-500 uppercase bg-gray-50 dark:bg-gray-700/50">
                            <tr>
                                <th className="px-6 py-4 font-semibold">Título</th>
                                <th className="px-6 py-4 font-semibold">Realizações</th>
                                <th className="px-6 py-4 font-semibold">Dificuldade</th>
                                <th className="px-6 py-4 font-semibold">Status</th>
                                <th className="px-6 py-4 font-semibold text-right">Ações</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                            {dashboardData?.activeTests?.length > 0 ? dashboardData.activeTests.map((test: any) => (
                                <tr key={test.id} className="group hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                                    <td className="px-6 py-4 font-medium dark:text-white">{test.title}</td>
                                    <td className="px-6 py-4 text-gray-500">{test.test_attempts?.[0]?.count || 0} alunos</td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2 py-1 rounded text-xs font-bold ${
                                            test.difficulty === 'facil' ? 'bg-green-100 text-green-700' :
                                            test.difficulty === 'medio' ? 'bg-yellow-100 text-yellow-700' :
                                            'bg-red-100 text-red-700'
                                        }`}>
                                            {test.difficulty?.toUpperCase()}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4"><span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-bold flex w-fit items-center gap-1"><span className="w-2 h-2 rounded-full bg-green-500"></span> Ativo</span></td>
                                    <td className="px-6 py-4 text-right">
                                        <button className="text-gray-400 hover:text-royal-blue mx-2 transition-colors" title="Ver Relatório"><i className="fas fa-chart-pie"></i></button>
                                        <button className="text-gray-400 hover:text-royal-blue mx-2 transition-colors" title="Editar"><i className="fas fa-edit"></i></button>
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                                        Nenhum simulado criado ainda. Clique em "Novo Simulado" para começar.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Modal de Criação */}
            {isCreateModalOpen && (
                <CreateTestModal 
                    isOpen={isCreateModalOpen} 
                    onClose={() => setIsCreateModalOpen(false)} 
                    onSuccess={() => { setIsCreateModalOpen(false); window.location.reload(); }} 
                />
            )}
        </div>
    );
}