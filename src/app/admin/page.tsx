import { getWriteModuleData } from '../admin/actions';
import ManageStudents from './components/ManageStudents';
import ManageProfessors from './components/ManageProfessors';
import ManagePrompts from './components/ManagePrompts';

export default async function AdminWritePage() {
    const { data, error } = await getWriteModuleData();

    if (error) {
        return (
            <div className="p-6 bg-red-50 border border-red-200 rounded-lg text-red-700">
                <h3 className="font-bold text-lg mb-2"><i className="fas fa-exclamation-triangle mr-2"></i>Erro ao carregar módulo</h3>
                <p>{error}</p>
            </div>
        );
    }

    const prompts = data?.prompts || [];
    const students = data?.students || [];
    const professors = data?.professors || [];

    return (
        <div className="space-y-8">
            <div className="flex justify-between items-center border-b border-gray-200 dark:border-gray-700 pb-6">
                <div>
                    <h1 className="text-3xl font-bold text-dark-text dark:text-white">Módulo de Redação (Admin)</h1>
                    <p className="text-text-muted dark:text-gray-400 mt-1">Gerencie temas globais, verifique alunos e aprove professores.</p>
                </div>
            </div>
            
            {/* Seção Principal: Temas */}
            <section id="temas" className="scroll-mt-20">
                <div className="flex items-center gap-2 mb-4">
                    <div className="h-8 w-1 bg-royal-blue rounded-full"></div>
                    <h2 className="text-xl font-bold text-dark-text dark:text-white">Biblioteca de Temas</h2>
                </div>
                {/* O componente ManagePrompts já contém a lista e o modal de criação */}
                <ManagePrompts prompts={prompts} />
            </section>

            <hr className="dark:border-gray-700" />

            {/* Grid para Gestão de Pessoas */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                <section>
                    <div className="flex items-center gap-2 mb-4">
                        <div className="h-8 w-1 bg-green-500 rounded-full"></div>
                        <h2 className="text-xl font-bold text-dark-text dark:text-white">Alunos & Selos</h2>
                    </div>
                    <ManageStudents students={students} />
                </section>

                <section>
                    <div className="flex items-center gap-2 mb-4">
                        <div className="h-8 w-1 bg-purple-500 rounded-full"></div>
                        <h2 className="text-xl font-bold text-dark-text dark:text-white">Professores</h2>
                    </div>
                    <ManageProfessors professors={professors} />
                </section>
            </div>
        </div>
    );
}