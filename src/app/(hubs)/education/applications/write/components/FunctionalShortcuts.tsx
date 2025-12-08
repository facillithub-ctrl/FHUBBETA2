"use client";

import Link from 'next/link';

type ShortcutAction = {
    label: string;
    href: string;
    icon: string;
};

type ModuleShortcutProps = {
    moduleName: string;
    icon: string;
    colorFrom: string;
    colorTo: string;
    actions: ShortcutAction[];
};

const ModuleCard = ({ moduleName, icon, colorFrom, colorTo, actions }: ModuleShortcutProps) => (
    <div className="bg-white dark:bg-dark-card rounded-2xl p-1 border border-gray-100 dark:border-dark-border shadow-sm hover:shadow-md transition-all group h-full flex flex-col">
        <div className={`bg-gradient-to-r ${colorFrom} ${colorTo} p-4 rounded-xl text-white mb-2`}>
            <div className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                    <div className="bg-white/20 p-2 rounded-lg backdrop-blur-sm w-10 h-10 flex items-center justify-center">
                        <i className={`fas ${icon}`}></i>
                    </div>
                    <span className="font-bold text-md">{moduleName}</span>
                </div>
            </div>
        </div>
        <div className="p-2 space-y-1 flex-1">
            {actions.map((action, idx) => (
                <Link key={idx} href={action.href} className="flex items-center justify-between p-2.5 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors text-sm text-gray-600 dark:text-gray-300 group/item">
                    <div className="flex items-center gap-3">
                        <div className="w-6 flex justify-center">
                            <i className={`fas ${action.icon} text-gray-400 group-hover/item:text-[#42047e] transition-colors`}></i>
                        </div>
                        <span className="font-medium">{action.label}</span>
                    </div>
                    <i className="fas fa-chevron-right text-[10px] text-gray-300 group-hover/item:text-[#42047e]"></i>
                </Link>
            ))}
        </div>
    </div>
);

export default function FunctionalShortcuts() {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <ModuleCard 
                moduleName="Facillit Write" 
                icon="fa-pen-nib" 
                colorFrom="from-[#42047e]" 
                colorTo="to-[#07f49e]"
                actions={[
                    { label: "Nova Redação", href: "/dashboard/applications/write?action=new", icon: "fa-plus" },
                    { label: "Histórico", href: "/dashboard/applications/write?tab=history", icon: "fa-history" },
                    { label: "Temas da Semana", href: "/dashboard/applications/write?view=prompts", icon: "fa-lightbulb" }
                ]}
            />

            <ModuleCard 
                moduleName="Facillit Test" 
                icon="fa-check-double" 
                colorFrom="from-pink-500" 
                colorTo="to-rose-500"
                actions={[
                    { label: "Simulado Rápido", href: "/dashboard/applications/test?mode=quick", icon: "fa-stopwatch" },
                    { label: "Gramática", href: "/dashboard/applications/test?topic=grammar", icon: "fa-spell-check" },
                    { label: "Questões de Crase", href: "/dashboard/applications/test?tag=crase", icon: "fa-align-left" }
                ]}
            />

            <ModuleCard 
                moduleName="Facillit Library" 
                icon="fa-book" 
                colorFrom="from-blue-500" 
                colorTo="to-cyan-500"
                actions={[
                    { label: "Citações", href: "/dashboard/applications/library?cat=quotes", icon: "fa-quote-left" },
                    { label: "Alusões Históricas", href: "/dashboard/applications/library?cat=history", icon: "fa-landmark" },
                    { label: "Constituição", href: "/dashboard/applications/library?cat=law", icon: "fa-balance-scale" }
                ]}
            />

            <ModuleCard 
                moduleName="Facillit Edu" 
                icon="fa-graduation-cap" 
                colorFrom="from-orange-500" 
                colorTo="to-amber-500"
                actions={[
                    { label: "Minhas Aulas", href: "/dashboard/applications/edu", icon: "fa-video" },
                    { label: "Tarefas", href: "/dashboard/applications/edu/tasks", icon: "fa-tasks" },
                    { label: "Tira-Dúvidas", href: "/dashboard/applications/edu/forum", icon: "fa-question-circle" }
                ]}
            />
        </div>
    );
}