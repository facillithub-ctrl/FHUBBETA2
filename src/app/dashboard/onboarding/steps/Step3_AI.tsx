"use client";

import type { StepProps, OnboardingData } from '../OnboardingFlow';

// --- Sub-componente: Seletor de Nível ---
type Level = OnboardingData['ai_level'];
const levels: { slug: Level; title: string; desc: string }[] = [
  { slug: 'essencial', title: 'Essencial', desc: 'Apenas o necessário para o sistema funcionar.' },
  { slug: 'intermediario', title: 'Intermediário', desc: 'Recomendado. Personalização balanceada.' },
  { slug: 'profundo', title: 'Profundo', desc: 'Experiência totalmente preditiva e conectada.' },
];

const SegmentedControl = ({ value, onChange }: { 
  value: Level; 
  onChange: (value: Level) => void;
}) => (
  <div className="flex w-full p-1 bg-gray-200 dark:bg-gray-800 rounded-lg">
    {levels.map(level => (
      <button
        key={level.slug}
        type="button"
        onClick={() => onChange(level.slug)}
        className={`w-1/3 p-2 rounded-md text-sm font-bold transition-all
          ${value === level.slug 
            ? 'bg-bg-primary dark:bg-bg-secondary shadow-md' 
            : 'text-text-secondary hover:bg-white/50'
          }
        `}
      >
        {level.title}
      </button>
    ))}
  </div>
);

// --- Sub-componente: Interruptor (Toggle) ---
const SwitchRow = ({ id, title, description, checked, onChange }: {
  id: string;
  title: string;
  description: string;
  checked: boolean;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}) => (
  <label 
    htmlFor={id} 
    className="flex justify-between items-center p-4 border border-gray-300 dark:border-gray-700 rounded-xl cursor-pointer hover:border-brand-purple/50"
  >
    <div className="pr-4">
      <h4 className="font-bold text-text-primary">{title}</h4>
      <p className="text-sm text-text-secondary">{description}</p>
    </div>
    <div className="relative inline-flex items-center">
      <input
        type="checkbox"
        id={id}
        checked={checked}
        onChange={onChange}
        className="sr-only peer" // Esconde o checkbox padrão
      />
      {/* Esta é a UI do "toggle" */}
      <div className="w-11 h-6 bg-gray-200 rounded-full peer-checked:bg-brand-green 
                      dark:bg-gray-700 peer-focus:ring-2 peer-focus:ring-brand-purple/50
                      peer-checked:after:translate-x-full peer-checked:after:border-white 
                      after:content-[''] after:absolute after:top-0.5 after:left-[2px] 
                      after:bg-white after:border-gray-300 after:border after:rounded-full 
                      after:h-5 after:w-5 after:transition-all"
      ></div>
    </div>
  </label>
);


/**
 * ETAPA 4 do Plano (Step 3 do Código): Configurações de personalização de IA
 * Recolhe: Nível de IA e permissões de dados.
 */
export default function Step3_AI({ onboardingData, setOnboardingData, onNext, onBack }: StepProps) {

  const { ai_level, ai_predictive, ai_cross_data, ai_performance_collection } = onboardingData;

  // Função genérica para atualizar o estado central
  const handleChange = (
    key: keyof OnboardingData, 
    value: OnboardingData[keyof OnboardingData]
  ) => {
    setOnboardingData(prev => ({ ...prev, [key]: value }));
  };

  return (
    <div className="w-full max-w-2xl bg-bg-primary dark:bg-bg-secondary p-8 rounded-xl shadow-lg mx-auto transition-all duration-300 animate-fade-in-right">
      <h1 className="text-3xl font-bold text-text-primary mb-2 text-center">Configure sua experiência com IA</h1>
      <p className="text-text-secondary mb-8 text-center">
        Escolha como nossa inteligência artificial pode personalizar sua jornada. (Etapa 5 de 8)
      </p>
      
      <div className="space-y-6">
        {/* 1. Nível de Personalização */}
        <div>
          <label className="block text-sm font-medium text-text-secondary mb-2">
            Nível de Personalização da IA
          </label>
          <SegmentedControl 
            value={ai_level} 
            onChange={(value) => handleChange('ai_level', value)} 
          />
          <p className="text-xs text-text-secondary mt-2 text-center">
            {levels.find(l => l.slug === ai_level)?.desc}
          </p>
        </div>

        {/* 2. Switches de Permissão */}
        <div className="space-y-4">
          <SwitchRow
            id="ai-predictive"
            title="Recomendações Preditivas"
            description="Permitir que a IA sugira ações, conteúdos e hábitos."
            checked={ai_predictive}
            onChange={(e) => handleChange('ai_predictive', e.target.checked)}
          />
          <SwitchRow
            id="ai-cross-data"
            title="Cruzamento de Dados entre Verticais"
            description="Ex: Usar dados do 'Write' (Estudos) para sugerir metas no 'Day' (Global)."
            checked={ai_cross_data}
            onChange={(e) => handleChange('ai_cross_data', e.target.checked)}
          />
          <SwitchRow
            id="ai-performance"
            title="Coleta de Desempenho (Anónima)"
            description="Permitir o uso de dados anónimos para evoluir os nossos módulos."
            checked={ai_performance_collection}
            onChange={(e) => handleChange('ai_performance_collection', e.target.checked)}
          />
        </div>
      </div>

      {/* Navegação */}
      <div className="flex justify-between items-center pt-8 mt-6 border-t dark:border-gray-700">
        <button type="button" onClick={onBack} className="text-sm font-medium text-text-secondary hover:text-text-primary">
          Voltar
        </button>
        <button
          onClick={onNext}
          className="py-3 px-8 bg-brand-purple text-white font-bold rounded-lg hover:opacity-90"
        >
          Continuar
        </button>
      </div>
    </div>
  );
}