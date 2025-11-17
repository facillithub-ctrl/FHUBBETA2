"use client";

import { useState } from 'react';
import type { StepProps, OnboardingData } from '../OnboardingFlow';
import { useToast } from '@/contexts/ToastContext';

// Tipo para a nossa Vertical, incluindo o 'slug'
type Vertical = {
  slug: OnboardingData['verticals'][number]; // 'students' | 'global' | 'schools' | etc.
  icon: string;
  title: string;
  description: string;
};

// Dados para os cartões de seleção
const verticalsData: Vertical[] = [
  {
    slug: 'students',
    icon: 'fa-graduation-cap',
    title: 'Estudar',
    description: 'Para o meu desenvolvimento académico e pessoal.',
  },
  {
    slug: 'global',
    icon: 'fa-globe',
    title: 'Organizar',
    description: 'Para a minha rotina, finanças e carreira.',
  },
  {
    slug: 'schools',
    icon: 'fa-school',
    title: 'Escola',
    description: 'Para gerir a minha instituição de ensino.',
  },
  {
    slug: 'enterprise',
    icon: 'fa-building',
    title: 'Empresa',
    description: 'Para gerir a minha equipa e operações.',
  },
  {
    slug: 'startups',
    icon: 'fa-rocket',
    title: 'Startup',
    description: 'Para construir e escalar o meu novo negócio.',
  },
];

// --- Sub-componente: Cartão de Seleção ---
const VerticalCard = ({ vertical, isSelected, onSelect }: {
  vertical: Vertical;
  isSelected: boolean;
  onSelect: () => void;
}) => (
  <button
    type="button"
    onClick={onSelect}
    className={`relative p-5 w-full border-2 rounded-xl text-left transition-all duration-200
      ${isSelected 
        ? 'border-brand-purple bg-brand-purple/5 dark:bg-brand-purple/10' 
        : 'border-gray-300 dark:border-gray-700 bg-bg-primary dark:bg-bg-secondary hover:border-brand-purple/50'
      }
    `}
  >
    {/* Ícone de "check" quando selecionado */}
    {isSelected && (
      <div className="absolute top-3 right-3 w-5 h-5 bg-brand-green rounded-full text-brand-purple flex items-center justify-center">
        <i className="fas fa-check text-xs"></i>
      </div>
    )}
    
    <div className="flex items-center gap-4">
      <i className={`fas ${vertical.icon} text-2xl w-8 text-center ${isSelected ? 'text-brand-purple' : 'text-text-secondary'}`}></i>
      <div>
        <h3 className="font-bold text-text-primary">{vertical.title}</h3>
        <p className="text-sm text-text-secondary">{vertical.description}</p>
      </div>
    </div>
  </button>
);


/**
 * ETAPA 3 (Cont.): Como deseja usar o Facillit?
 * Recolhe as verticais de interesse do utilizador.
 */
export default function Step2_Verticals({ onboardingData, setOnboardingData, onNext, onBack }: StepProps) {
  const { addToast } = useToast();
  
  // O estado local é inicializado com os dados do estado central
  const [selectedVerticals, setSelectedVerticals] = useState(onboardingData.verticals);

  // Função para adicionar/remover uma vertical da seleção
  const toggleVertical = (slug: Vertical['slug']) => {
    setSelectedVerticals(prev =>
      prev.includes(slug)
        ? prev.filter(v => v !== slug)
        : [...prev, slug]
    );
  };

  const handleContinue = () => {
    if (selectedVerticals.length === 0) {
      addToast({ title: "Selecione uma opção", message: "Precisa de escolher pelo menos uma forma de uso para continuar.", type: 'error' });
      return;
    }

    // 1. Atualiza o estado central no 'OnboardingFlow'
    setOnboardingData(prev => ({
      ...prev,
      verticals: selectedVerticals,
    }));
    
    // 2. Avança para a próxima etapa
    onNext();
  };

  return (
    <div className="w-full max-w-2xl bg-bg-primary dark:bg-bg-secondary p-8 rounded-xl shadow-lg mx-auto transition-all duration-300 animate-fade-in-right">
      <h1 className="text-3xl font-bold text-text-primary mb-2 text-center">Como deseja usar o Facillit Hub?</h1>
      <p className="text-text-secondary mb-8 text-center">Pode escolher mais do que uma opção. (Etapa 4 de 8)</p>
      
      <div className="space-y-4">
        {verticalsData.map(vertical => (
          <VerticalCard
            key={vertical.slug}
            vertical={vertical}
            isSelected={selectedVerticals.includes(vertical.slug)}
            onSelect={() => toggleVertical(vertical.slug)}
          />
        ))}
      </div>

      {/* Navegação */}
      <div className="flex justify-between items-center pt-8 mt-4 border-t dark:border-gray-700">
        <button type="button" onClick={onBack} className="text-sm font-medium text-text-secondary hover:text-text-primary">
          Voltar
        </button>
        <button
          onClick={handleContinue}
          className="py-3 px-8 bg-brand-purple text-white font-bold rounded-lg hover:opacity-90"
        >
          Continuar
        </button>
      </div>
    </div>
  );
}