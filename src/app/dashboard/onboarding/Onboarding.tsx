"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import createClient from '@/utils/supabase/client';
import type { UserProfile } from '../types';
import Link from 'next/link';
import { useToast } from '@/contexts/ToastContext';

const modulesData = [
    { slug: 'edu', icon: 'fa-graduation-cap', title: 'Facillit Edu', description: 'Gestão pedagógica e de alunos.', roles: ['aluno', 'professor', 'gestor', 'diretor'] }, // Adicionado 'diretor'
    { slug: 'games', icon: 'fa-gamepad', title: 'Facillit Games', description: 'Gamificação para aprender.', roles: ['aluno', 'vestibulando'] },
    { slug: 'write', icon: 'fa-pencil-alt', title: 'Facillit Write', description: 'Enviar e corrigir redações.', roles: ['aluno', 'professor', 'vestibulando'] },
    { slug: 'day', icon: 'fa-calendar-check', title: 'Facillit Day', description: 'Agenda, tarefas e hábitos.', roles: ['aluno', 'professor', 'gestor', 'vestibulando', 'diretor'] },
    { slug: 'play', icon: 'fa-play-circle', title: 'Facillit Play', description: 'Streaming educacional.', roles: ['aluno', 'professor', 'gestor', 'vestibulando', 'diretor'] },
    { slug: 'library', icon: 'fa-book-open', title: 'Facillit Library', description: 'Biblioteca e portfólios.', roles: ['aluno', 'professor', 'gestor', 'vestibulando', 'diretor'] },
    { slug: 'connect', icon: 'fa-users', title: 'Facillit Connect', description: 'Rede social de estudos.', roles: ['aluno', 'professor', 'gestor', 'vestibulando', 'diretor'] },
    { slug: 'coach-career', icon: 'fa-bullseye', title: 'Facillit Coach', description: 'Soft skills e orientação de carreira.', roles: ['aluno', 'professor', 'gestor', 'vestibulando', 'diretor'] },
    { slug: 'lab', icon: 'fa-flask', title: 'Facillit Lab', description: 'Laboratório virtual de STEM.', roles: ['aluno', 'professor', 'vestibulando'] },
    { slug: 'test', icon: 'fa-file-alt', title: 'Facillit Test', description: 'Simulados, quizzes e provas.', roles: ['aluno', 'professor', 'vestibulando'] },
    { slug: 'task', icon: 'fa-tasks', title: 'Facillit Task', description: 'Gestão de tarefas gerais.', roles: ['aluno', 'professor', 'gestor', 'vestibulando', 'diretor'] },
    { slug: 'create', icon: 'fa-lightbulb', title: 'Facillit Create', description: 'Mapas mentais e gráficos.', roles: ['aluno', 'professor', 'gestor', 'vestibulando', 'diretor'] },
];

export default function Onboarding({ userProfile }: { userProfile: UserProfile }) {
    const supabase = createClient();
    const router = useRouter();
    // MODIFICAÇÃO: Se for diretor, 'edu' vem pré-selecionado
    const [selectedModules, setSelectedModules] = useState<string[]>(
        userProfile.userCategory === 'diretor' ? ['edu', 'write', 'test'] : ['write', 'test']
    );
    const [agreedToModuleTerms, setAgreedToModuleTerms] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const { addToast } = useToast();

    const toggleModule = (slug: string) => {
        // MODIFICAÇÃO: Diretor não pode desmarcar o módulo Edu
        if (userProfile.userCategory === 'diretor' && slug === 'edu') {
            addToast({ title: "Módulo Essencial", message: "O Facillit Edu é essencial para o seu perfil de diretor.", type: 'error' });
            return;
        }

        const selectableModules = ['write', 'test'];
        if (!selectableModules.includes(slug)) return;
        
        setSelectedModules(prev =>
            prev.includes(slug) ? prev.filter(m => m !== slug) : [...prev, slug]
        );
    };

    const handleContinue = async () => {
        setIsLoading(true);
        const { data: { user } } = await supabase.auth.getUser();

        if (user) {
            const finalModules = userProfile.userCategory === 'diretor' 
                ? Array.from(new Set(['edu', ...selectedModules])) 
                : selectedModules;

            const { error } = await supabase
                .from('profiles')
                .update({
                    active_modules: finalModules,
                    has_completed_onboarding: true
                })
                .eq('id', user.id);

            if (!error) {
                // Redireciona para o painel correto após o onboarding
                const redirectPath = userProfile.userCategory === 'diretor' ? '/dashboard/applications/edu' : '/dashboard';
                window.location.assign(redirectPath);
            } else {
                addToast({ title: "Erro ao Salvar", message: "Não foi possível salvar sua seleção. Tente novamente.", type: 'error'});
                setIsLoading(false);
            }
        } else {
            addToast({ title: "Erro de Autenticação", message: "Usuário não encontrado. Por favor, faça login novamente.", type: 'error'});
            setIsLoading(false);
        }
    };
    
    const availableModules = modulesData.filter(module => 
        userProfile.userCategory && module.roles.includes(userProfile.userCategory)
    );

    const isContinueDisabled = isLoading || !agreedToModuleTerms || (selectedModules.length === 0);

    return (
        <div className="min-h-screen bg-background-light flex items-center justify-center p-4">
            <div className="w-full max-w-2xl bg-white p-8 rounded-xl shadow-lg">
                <h1 className="text-3xl font-bold text-dark-text mb-2">Bem-vindo(a) ao Facillit Hub!</h1>
                <p className="text-text-muted mb-8">Personalize sua experiência. Comece com nossos módulos essenciais. Os outros serão liberados em breve!</p>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
                    {availableModules.map(module => {
                        // MODIFICAÇÃO: Lógica para habilitar/desabilitar módulos
                        const isSelectableForRole = ['write', 'test'].includes(module.slug) || (userProfile.userCategory === 'diretor' && module.slug === 'edu');
                        const isSelected = selectedModules.includes(module.slug);

                        return (
                            <button
                                key={module.slug}
                                onClick={() => toggleModule(module.slug)}
                                disabled={!isSelectableForRole}
                                className={`relative p-4 border rounded-lg text-center transition-all duration-200
                                    ${isSelected ? 'bg-royal-blue text-white border-royal-blue ring-2 ring-blue-300' 
                                                : isSelectableForRole ? 'hover:border-royal-blue hover:bg-blue-50' 
                                                                : 'bg-gray-100 opacity-60 cursor-not-allowed'}
                                `}
                            >
                                <i className={`fas ${module.icon} text-3xl mb-2 ${isSelected ? 'text-white' : isSelectableForRole ? 'text-royal-blue' : 'text-gray-400'}`}></i>
                                <h3 className="font-bold">{module.title}</h3>
                                <p className="text-xs opacity-80">{module.description}</p>
                                {!isSelectableForRole && (
                                    <span className="absolute top-2 right-2 bg-gray-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                                        Em Breve
                                    </span>
                                )}
                            </button>
                        )
                    })}
                </div>
                
                <div className="mb-6">
                    <label className="flex items-start gap-3 cursor-pointer">
                        <input 
                            type="checkbox" 
                            checked={agreedToModuleTerms}
                            onChange={(e) => setAgreedToModuleTerms(e.target.checked)}
                            className="h-5 w-5 mt-1 rounded border-gray-300 text-royal-blue focus:ring-royal-blue flex-shrink-0"
                        />
                        <span className="text-sm text-gray-600">
                            Eu li e concordo com a <Link href="/recursos/politica-de-dado" target="_blank" className="font-bold text-royal-blue underline">Política de Dados do Módulo</Link>, permitindo o uso dos meus dados para aprimoramento do serviço e da IA.
                        </span>
                    </label>
                </div>
                
                <button
                    onClick={handleContinue}
                    disabled={isContinueDisabled}
                    className="w-full py-3 bg-royal-blue text-white font-bold rounded-lg disabled:bg-gray-400 disabled:cursor-not-allowed hover:bg-opacity-90"
                >
                    {isLoading ? 'Salvando...' : 'Continuar para a Dashboard'}
                </button>
            </div>
        </div>
    );
}