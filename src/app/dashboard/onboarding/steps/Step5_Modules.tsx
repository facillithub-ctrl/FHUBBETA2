"use client";

import { useState } from 'react';
import Link from 'next/link';
import { useToast } from '@/contexts/ToastContext';
import type { StepProps } from '../OnboardingFlow'; // Importa o tipo

// 1. DADOS DOS MÓDULOS ATUALIZADOS
// Adicionei o role 'individual' a todos os módulos relevantes
// (todos exceto 'edu', que é estritamente institucional).
const modulesData = [
    { slug: 'edu', icon: 'fa-graduation-cap', title: 'Facillit Edu', description: 'Gestão pedagógica e de alunos.', roles: ['aluno', 'professor', 'gestor', 'diretor'] }, // Institucional
    { slug: 'games', icon: 'fa-gamepad', title: 'Facillit Games', description: 'Gamificação para aprender.', roles: ['aluno', 'vestibulando', 'individual'] },
    { slug: 'write', icon: 'fa-pencil-alt', title: 'Facillit Write', description: 'Enviar e corrigir redações.', roles: ['aluno', 'professor', 'vestibulando', 'individual'] },
    { slug: 'day', icon: 'fa-calendar-check', title: 'Facillit Day', description: 'Agenda, tarefas e hábitos.', roles: ['aluno', 'professor', 'gestor', 'vestibulando', 'diretor', 'individual'] },
    { slug: 'play', icon: 'fa-play-circle', title: 'Facillit Play', description: 'Streaming educacional.', roles: ['aluno', 'professor', 'gestor', 'vestibulando', 'diretor', 'individual'] },
    { slug: 'library', icon: 'fa-book-open', title: 'Facillit Library', description: 'Biblioteca e portfólios.', roles: ['aluno', 'professor', 'gestor', 'vestibulando', 'diretor', 'individual'] },
    { slug: 'connect', icon: 'fa-users', title: 'Facillit Connect', description: 'Rede social de estudos.', roles: ['aluno', 'professor', 'gestor', 'vestibulando', 'diretor', 'individual'] },
    { slug: 'coach-career', icon: 'fa-bullseye', title: 'Facillit Coach', description: 'Soft skills e orientação de carreira.', roles: ['aluno', 'professor', 'gestor', 'vestibulando', 'diretor', 'individual'] },
    { slug: 'lab', icon: 'fa-flask', title: 'Facillit Lab', description: 'Laboratório virtual de STEM.', roles: ['aluno', 'professor', 'vestibulando', 'individual'] },
    { slug: 'test', icon: 'fa-file-alt', title: 'Facillit Test', description: 'Simulados, quizzes e provas.', roles: ['aluno', 'professor', 'vestibulando', 'individual'] },
    { slug: 'task', icon: 'fa-tasks', title: 'Facillit Task', description: 'Gestão de tarefas gerais.', roles: ['aluno', 'professor', 'gestor', 'vestibulando', 'diretor', 'individual'] },
    { slug: 'create', icon: 'fa-lightbulb', title: 'Facillit Create', description: 'Mapas mentais e gráficos.', roles: ['aluno', 'professor', 'gestor', 'vestibulando', 'diretor', 'individual'] },
];

export default function Step5_Modules({ userProfile, onboardingData, setOnboardingData, onNext, onBack }: StepProps) {
    const [agreedToModuleTerms, setAgreedToModuleTerms] = useState(false);
    const { addToast } = useToast();

    const selectedModules = onboardingData.active_modules;

    const toggleModule = (slug: string) => {
        // A lógica de bloqueio para 'diretor' permanece
        if (userProfile.userCategory === 'diretor' && slug === 'edu') {
            addToast({ title: "Módulo Essencial", message: "O Facillit Edu é essencial para o seu perfil de diretor.", type: 'error' });
            return;
        }

        setOnboardingData(prev => {
            const newModules = prev.active_modules.includes(slug)
                ? prev.active_modules.filter(m => m !== slug)
                : [...prev.active_modules, slug];
            return { ...prev, active_modules: newModules };
        });
    };

    const handleContinue = () => {
        onNext();
    };
    
    // 2. CÁLCULO DE MÓDULOS DISPONÍVEIS
    // Agora, o 'userProfile.userCategory' (que é 'individual')
    // vai encontrar correspondências nos 'roles' e a lista será preenchida.
    const availableModules = modulesData.filter(module => 
        (userProfile.userCategory && module.roles.includes(userProfile.userCategory))
        || (userProfile.organization_id && module.roles.includes('aluno')) // Fallback para contas institucionais
    );

    const isContinueDisabled = !agreedToModuleTerms;

    return (
        <div className="w-full max-w-2xl bg-bg-primary dark:bg-bg-secondary p-8 rounded-xl shadow-lg mx-auto transition-all duration-300 animate-fade-in-right">
            {/* Títulos baseados no seu screenshot (image_b37062.png) */}
            <h1 className="text-3xl font-bold text-text-primary mb-2">Quais módulos ativamos?</h1>
            <p className="text-text-secondary mb-8">Personalize sua experiência. Comece com nossos módulos essenciais. Os outros serão liberados em breve!</p>
            
            {/* 3. LISTA DE MÓDULOS (agora deve aparecer) */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
                {availableModules.map(module => {
                    const isSelected = selectedModules.includes(module.slug);
                    
                    // 4. LÓGICA 'isSelectableForRole' REMOVIDA
                    // Todos os 'availableModules' agora são selecionáveis.

                    return (
                        <button
                            key={module.slug}
                            onClick={() => toggleModule(module.slug)}
                            // 5. 'disabled' REMOVIDO (exceto para diretor/edu)
                            disabled={userProfile.userCategory === 'diretor' && module.slug === 'edu'}
                            className={`relative p-4 border rounded-lg text-center transition-all duration-200
                                ${isSelected 
                                    ? 'bg-brand-purple text-white border-brand-purple ring-2 ring-brand-green' 
                                    : 'hover:border-brand-purple hover:bg-bg-primary dark:hover:bg-bg-primary/50'
                                }
                                ${userProfile.userCategory === 'diretor' && module.slug === 'edu' ? 'opacity-70 cursor-not-allowed' : ''}
                            `}
                        >
                            <i className={`fas ${module.icon} text-3xl mb-2 ${isSelected ? 'text-white' : 'text-brand-purple'}`}></i>
                            <h3 className="font-bold">{module.title}</h3>
                            <p className="text-xs opacity-80">{module.description}</p>
                            
                            {/* 6. LÓGICA "EM BREVE" REMOVIDA */}
                        </button>
                    )
                })}
            </div>
            
            {/* Checkbox de Termos (baseado no seu screenshot) */}
            <div className="mb-6">
                <label className="flex items-start gap-3 cursor-pointer">
                    <input 
                        type="checkbox" 
                        checked={agreedToModuleTerms}
                        onChange={(e) => setAgreedToModuleTerms(e.target.checked)}
                        className="h-5 w-5 mt-0.5 rounded border-gray-400 text-brand-purple focus:ring-brand-purple flex-shrink-0"
                    />
                    <span className="text-sm text-text-secondary">
                        Eu li e concordo com a <Link href="/recursos/politica-de-dado" target="_blank" className="font-bold text-brand-purple underline">Política de Dados do Módulo</Link>, permitindo o uso dos meus dados para aprimoramento do serviço e da IA.
                    </span>
                </label>
            </div>
            
            {/* Botões de navegação */}
            <div className="flex justify-between items-center pt-4 border-t dark:border-gray-700">
                <button type="button" onClick={onBack} className="text-sm font-medium text-text-secondary hover:text-text-primary">
                    Voltar
                </button>
                <button
                    onClick={handleContinue}
                    disabled={isContinueDisabled}
                    className="py-3 px-8 bg-brand-purple text-white font-bold rounded-lg disabled:bg-gray-400 disabled:cursor-not-allowed hover:opacity-90"
                >
                    Continuar
                </button>
            </div>
        </div>
    );
}