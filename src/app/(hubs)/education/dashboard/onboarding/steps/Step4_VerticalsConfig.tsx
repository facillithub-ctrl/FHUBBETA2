"use client";

import { useState, useEffect } from 'react';
import type { StepProps, OnboardingData } from '../OnboardingFlow';
import { useToast } from '@/contexts/ToastContext';

// --- Sub-componente: Configuração "Students" ---
//
const StudentsConfig = ({ data, onSave }: {
  data: OnboardingData['students_config'];
  onSave: (config: OnboardingData['students_config']) => void;
}) => {
  const [studyPhase, setStudyPhase] = useState(data?.study_phase || '');
  const [goals, setGoals] = useState<string[]>(data?.goals || []);

  const allGoals = [
    { slug: 'provas', title: 'Passar em Provas/Vestibular', icon: 'fa-file-alt' },
    { slug: 'escrita', title: 'Melhorar minha Escrita', icon: 'fa-pencil-alt' },
    { slug: 'organizacao', title: 'Organizar meus Estudos', icon: 'fa-calendar-check' },
    { slug: 'jogos', title: 'Aprender com Jogos', icon: 'fa-gamepad' },
  ];

  const toggleGoal = (slug: string) => {
    setGoals(prev => prev.includes(slug) ? prev.filter(g => g !== slug) : [...prev, slug]);
  };

  // Salva os dados no estado "pai" ao desmontar (ou ao clicar em "Continuar")
  useEffect(() => {
    return () => {
      onSave({ study_phase: studyPhase, goals: goals });
    };
  }, [studyPhase, goals, onSave]);

  return (
    <div className="space-y-6">
      <h3 className="text-xl font-bold text-text-primary">Metas de Estudante</h3>
      
      {/* Fase de Estudo */}
      <div>
        <label htmlFor="studyPhase" className="block text-sm font-medium text-text-secondary mb-1">
          Qual seu ano ou fase de estudo?
        </label>
        <select 
          id="studyPhase" 
          value={studyPhase}
          onChange={(e) => setStudyPhase(e.target.value)}
          className="w-full p-3 border border-gray-300 rounded-xl text-sm dark:bg-bg-primary dark:border-gray-700"
        >
          <option value="">Selecione...</option>
          <option value="fundamental_2">Ensino Fundamental II (6º-9º)</option>
          <option value="ensino_medio">Ensino Médio (1º-3º)</option>
          <option value="vestibular">Pré-Vestibular</option>
          <option value="graduacao">Ensino Superior</option>
          <option value="outro">Outro</option>
        </select>
      </div>

      {/* Objetivos Principais */}
      <div>
        <label className="block text-sm font-medium text-text-secondary mb-2">
          Quais seus objetivos principais? (multi-escolha)
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {allGoals.map(goal => {
            const isSelected = goals.includes(goal.slug);
            return (
              <button
                key={goal.slug}
                type="button"
                onClick={() => toggleGoal(goal.slug)}
                className={`p-4 border-2 rounded-xl text-left transition-all ${
                  isSelected ? 'border-brand-purple bg-brand-purple/5' : 'border-gray-300 dark:border-gray-700 hover:border-brand-purple/50'
                }`}
              >
                <i className={`fas ${goal.icon} mb-2 ${isSelected ? 'text-brand-purple' : 'text-text-secondary'}`}></i>
                <p className="font-bold text-sm text-text-primary">{goal.title}</p>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};


// --- Sub-componente: Configuração "Schools/Enterprise" ---
//
const InstitutionalConfig = ({ vertical, onSave }: {
  vertical: 'schools' | 'enterprise' | 'startups';
  onSave: (code: string) => void;
}) => {
  const [code, setCode] = useState('');
  
  const titles = {
    schools: 'Vincular à sua Escola',
    enterprise: 'Vincular à sua Empresa',
    startups: 'Vincular à sua Startup',
  };
  const labels = {
    schools: 'Insira o código da sua instituição',
    enterprise: 'Insira o código da sua empresa',
    startups: 'Insira o código da sua startup',
  };

  return (
    <div className="space-y-4">
      <h3 className="text-xl font-bold text-text-primary">{titles[vertical]}</h3>
      <p className="text-sm text-text-secondary">
        Para conectar-se à sua organização, por favor, insira o código de convite fornecido pelo seu administrador.
      </p>
      <div className="relative">
        <label htmlFor="code" className="block text-sm font-medium text-text-secondary mb-1">
          {labels[vertical]}
        </label>
        <i className="fas fa-barcode absolute left-3 top-10 text-text-secondary opacity-50"></i>
        <input 
          type="text" 
          id="code"
          value={code}
          onChange={(e) => {
            setCode(e.target.value.toUpperCase());
            onSave(e.target.value.toUpperCase());
          }}
          placeholder="FHB-XXXXXX"
          className="w-full p-3 pl-10 border border-gray-300 rounded-xl text-sm dark:bg-bg-primary dark:border-gray-700"
        />
      </div>
    </div>
  );
};


/**
 * ETAPA 5 do Plano (Step 4 do Código): Ativação Inteligente de Verticais
 * Mostra formulários com base no que foi selecionado na Etapa 2 (Step2_Verticals).
 */
export default function Step4_VerticalsConfig({ onboardingData, setOnboardingData, onNext, onBack }: StepProps) {
  const { addToast } = useToast();
  const { verticals } = onboardingData;

  // Filtra as verticais que precisam de configuração nesta etapa
  const verticalsToConfigure = verticals.filter(v => ['students', 'schools', 'enterprise', 'startups'].includes(v));

  // 1. LÓGICA DE PULO AUTOMÁTICO
  // Se o utilizador só escolheu 'global', pulamos esta etapa.
  useEffect(() => {
    if (verticalsToConfigure.length === 0) {
      addToast({ title: "Tudo pronto!", message: "Vamos para a próxima etapa.", type: 'success' });
      onNext();
    }
  }, [verticalsToConfigure.length, onNext, addToast]);

  // Função para salvar os dados da sub-etapa no estado central
  const handleSaveConfig = (key: keyof OnboardingData, config: any) => {
    setOnboardingData(prev => ({
      ...prev,
      [key]: config,
    }));
  };

  // Se for para pular, renderiza um ecrã de carregamento
  if (verticalsToConfigure.length === 0) {
    return (
      <div className="w-full max-w-2xl bg-bg-primary dark:bg-bg-secondary p-8 rounded-xl shadow-lg mx-auto text-center">
        <i className="fas fa-spinner fa-spin text-4xl text-brand-purple"></i>
        <p className="text-text-secondary mt-4">A preparar a próxima etapa...</p>
      </div>
    );
  }

  // Se houver verticais para configurar, mostra o formulário
  return (
    <div className="w-full max-w-2xl bg-bg-primary dark:bg-bg-secondary p-8 rounded-xl shadow-lg mx-auto transition-all duration-300 animate-fade-in-right">
      <h1 className="text-3xl font-bold text-text-primary mb-2 text-center">Vamos configurar as suas áreas</h1>
      <p className="text-text-secondary mb-8 text-center">
        Precisamos de mais alguns detalhes sobre as áreas que selecionou. (Etapa 6 de 8)
      </p>
      
      <div className="space-y-8">
        {/* Renderiza o formulário de Estudante, se selecionado */}
        {verticals.includes('students') && (
          <StudentsConfig 
            data={onboardingData.students_config}
            onSave={(config) => handleSaveConfig('students_config', config)}
          />
        )}

        {/* Renderiza o formulário da Escola, se selecionado */}
        {verticals.includes('schools') && (
          <InstitutionalConfig 
            vertical="schools"
            onSave={(code) => { /* Lógica de validação do código virá aqui */ }}
          />
        )}

        {/* Renderiza o formulário de Empresa, se selecionado */}
        {verticals.includes('enterprise') && (
          <InstitutionalConfig 
            vertical="enterprise"
            onSave={(code) => { /* Lógica de validação do código virá aqui */ }}
          />
        )}
        
        {/* Renderiza o formulário de Startup, se selecionado */}
        {verticals.includes('startups') && (
          <InstitutionalConfig 
            vertical="startups"
            onSave={(code) => { /* Lógica de validação do código virá aqui */ }}
          />
        )}
      </div>

      {/* Navegação */}
      <div className="flex justify-between items-center pt-8 mt-6 border-t dark:border-gray-700">
        <button type="button" onClick={onBack} className="text-sm font-medium text-text-secondary hover:text-text-primary">
          Voltar
        </button>
        <button
          onClick={onNext} // A validação dos formulários pode ser adicionada aqui
          className="py-3 px-8 bg-brand-purple text-white font-bold rounded-lg hover:opacity-90"
        >
          Continuar
        </button>
      </div>
    </div>
  );
}