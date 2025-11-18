"use client";

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { useToast } from '@/contexts/ToastContext';
import { updateActiveModules } from '../actions';

// Lista mestra de todos os módulos
const allModules = [
  { slug: 'write', icon: 'fa-pencil-alt', title: 'Facillit Write', group: 'Students' },
  { slug: 'test', icon: 'fa-file-alt', title: 'Facillit Test', group: 'Students' },
  { slug: 'games', icon: 'fa-gamepad', title: 'Facillit Games', group: 'Students' },
  { slug: 'play', icon: 'fa-play-circle', title: 'Facillit Play', group: 'Students' },
  { slug: 'library', icon: 'fa-book-open', title: 'Facillit Library', group: 'Students' },
  { slug: 'create', icon: 'fa-lightbulb', title: 'Facillit Create', group: 'Students' },
  { slug: 'lab', icon: 'fa-flask', title: 'Facillit Lab', group: 'Schools' },
  { slug: 'edu', icon: 'fa-graduation-cap', title: 'Facillit Edu', group: 'Schools' },
  { slug: 'day', icon: 'fa-calendar-check', title: 'Facillit Day', group: 'Global' },
  { slug: 'finances', icon: 'fa-wallet', title: 'Facillit Finances', group: 'Global' },
  { slug: 'coach-career', icon: 'fa-bullseye', title: 'Facillit C&C', group: 'Global' },
  // ... (adicionar outros módulos como People, Center, etc., se necessário)
];

// --- Sub-componente: Interruptor (Toggle) ---
const ModuleToggle = ({ icon, title, group, checked, onChange, disabled = false }: {
  icon: string;
  title: string;
  group: string;
  checked: boolean;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  disabled?: boolean;
}) => (
  <label 
    htmlFor={`mod-${title}`} 
    className={`flex justify-between items-center p-4 border rounded-xl 
      ${disabled ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'}
      ${checked ? 'border-brand-purple/50' : 'border-gray-300 dark:border-gray-700'}
    `}
  >
    <div className="flex items-center gap-4">
        <i className={`fas ${icon} w-8 text-center text-xl ${checked ? 'text-brand-purple' : 'text-text-secondary'}`}></i>
        <div>
            <h4 className="font-bold text-text-primary">{title}</h4>
            <span className="text-xs font-semibold bg-gray-200 dark:bg-gray-700 text-text-secondary px-2 py-0.5 rounded-full">{group}</span>
        </div>
    </div>
    <div className="relative inline-flex items-center">
      <input
        type="checkbox"
        id={`mod-${title}`}
        checked={checked}
        onChange={onChange}
        disabled={disabled}
        className="sr-only peer"
      />
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
 * ETAPA 4 do Plano (Módulos e Integrações)
 */
export default function AccountModules({ fullProfileData }: { fullProfileData: any }) {
  const router = useRouter();
  const { addToast } = useToast();
  const [isPending, startTransition] = useTransition();

  // 1. Inicializa o estado com os módulos que o utilizador já tem
  const [activeModules, setActiveModules] = useState<string[]>(fullProfileData.active_modules || []);
  
  const handleToggle = (slug: string) => {
    setActiveModules(prev =>
      prev.includes(slug)
        ? prev.filter(m => m !== slug)
        : [...prev, slug]
    );
  };

  const handleSaveChanges = () => {
    startTransition(async () => {
      const result = await updateActiveModules(activeModules);
      if (result.error) {
        addToast({ title: 'Erro', message: result.error, type: 'error' });
      } else {
        addToast({ title: 'Sucesso!', message: 'Módulos atualizados. A página será recarregada.', type: 'success' });
        // Recarrega a página para atualizar a Sidebar principal
        router.refresh(); 
      }
    });
  };

  return (
    <div className="p-6 md:p-10">
      <h2 className="text-2xl font-bold text-text-primary mb-1">Módulos e Integrações</h2>
      <p className="text-text-secondary mb-8">Ative ou desative os módulos do ecossistema a qualquer momento.</p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {allModules.map(mod => (
          <ModuleToggle
            key={mod.slug}
            icon={mod.icon}
            title={mod.title}
            group={mod.group}
            checked={activeModules.includes(mod.slug)}
            onChange={() => handleToggle(mod.slug)}
            // Desativa módulos institucionais se não for uma conta institucional
            disabled={mod.group === 'Schools' && !fullProfileData.organization_id} 
          />
        ))}
      </div>
      
      {/* Botão de Salvar */}
      <div className="flex justify-end mt-8 border-t dark:border-gray-700 pt-6">
        <button
          onClick={handleSaveChanges}
          disabled={isPending}
          className="py-3 px-8 bg-brand-purple text-white font-bold rounded-lg hover:opacity-90 disabled:opacity-50"
        >
          {isPending ? "Salvando..." : "Salvar Alterações"}
        </button>
      </div>
    </div>
  );
}