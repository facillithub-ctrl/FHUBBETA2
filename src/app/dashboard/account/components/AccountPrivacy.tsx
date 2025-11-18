"use client";

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { useToast } from '@/contexts/ToastContext';
import { updateAccountProfile } from '../actions'; // Usamos a mesma action

// --- Sub-componente: Interruptor (Toggle) ---
// (Idêntico ao do Onboarding, para consistência)
const SwitchRow = ({ id, title, description, checked, onChange, disabled = false }: {
  id: string;
  title: string;
  description: string;
  checked: boolean;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  disabled?: boolean;
}) => (
  <label 
    htmlFor={id} 
    className={`flex justify-between items-center p-4 border rounded-xl 
      ${disabled ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer hover:border-brand-purple/50'}
      ${checked ? 'border-brand-purple/50' : 'border-gray-300 dark:border-gray-700'}
    `}
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
        disabled={disabled}
        className="sr-only peer" // Esconde o checkbox padrão
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

// --- Sub-componente: Cartão de Ação de Risco ---
const DangerActionCard = ({ icon, title, description, buttonText, onActionClick }: {
  icon: string;
  title: string;
  description: string;
  buttonText: string;
  onActionClick: () => void;
}) => (
  <div className="flex items-center p-4 border border-red-500/30 dark:border-red-700/50 rounded-xl bg-red-50 dark:bg-red-900/10">
    <i className={`fas ${icon} w-8 text-center text-2xl text-red-600`}></i>
    <div className="ml-5 flex-grow">
      <h4 className="font-bold text-text-primary">{title}</h4>
      <p className="text-sm text-text-secondary">{description}</p>
    </div>
    <button 
      onClick={onActionClick}
      className="ml-4 py-2 px-5 bg-red-600 text-white font-bold rounded-lg text-sm hover:bg-red-700"
    >
      {buttonText}
    </button>
  </div>
);


/**
 * ETAPA 6 do Plano (Privacidade e Dados)
 */
export default function AccountPrivacy({ fullProfileData }: { fullProfileData: any }) {
  const router = useRouter();
  const { addToast } = useToast();
  const [isPending, startTransition] = useTransition();

  // 1. Inicializa o estado dos 'toggles' com os dados guardados
  const [aiConfig, setAiConfig] = useState(
    fullProfileData.category_details?.ai_config || {
      level: 'intermediario',
      predictive: true,
      cross_data: true,
      performance: true,
    }
  );

  const handleChange = (key: string, value: any) => {
    setAiConfig((prev: any) => ({ ...prev, [key]: value }));
  };

  const handleSaveAIConfig = () => {
    startTransition(async () => {
      // Usamos a 'updateAccountProfile' para salvar apenas os dados da IA
      // A action é inteligente e faz o 'merge' dos dados
      const result = await updateAccountProfile({
        // @ts-ignore
        ai_config: aiConfig
      }); 

      if (result.error) {
        addToast({ title: 'Erro', message: result.error, type: 'error' });
      } else {
        addToast({ title: 'Sucesso!', message: 'Preferências de IA atualizadas.', type: 'success' });
        router.refresh();
      }
    });
  };

  return (
    <div className="p-6 md:p-10">
      <h2 className="text-2xl font-bold text-text-primary mb-1">Privacidade e Dados</h2>
      <p className="text-text-secondary mb-8">Controle seus dados, permissões de IA e gestão da conta.</p>

      {/* Secção 6.2: Configurações de IA */}
      <div className="pb-8 border-b dark:border-gray-700">
        <h3 className="text-lg font-semibold text-text-primary mb-6">Configurações de IA</h3>
        <div className="space-y-4">
          <SwitchRow
            id="ai-predictive"
            title="Recomendações Preditivas"
            description="Permitir que a IA sugira ações, conteúdos e hábitos."
            checked={aiConfig.predictive}
            onChange={(e) => handleChange('predictive', e.target.checked)}
          />
          <SwitchRow
            id="ai-cross-data"
            title="Cruzamento de Dados entre Verticais"
            description="Ex: Usar dados do 'Write' para sugerir metas no 'Day'."
            checked={aiConfig.cross_data}
            onChange={(e) => handleChange('cross_data', e.target.checked)}
          />
          <SwitchRow
            id="ai-performance"
            title="Coleta de Desempenho (Anónima)"
            description="Permitir o uso de dados anónimos para evoluir os nossos módulos."
            checked={aiConfig.performance}
            onChange={(e) => handleChange('performance', e.target.checked)}
          />
        </div>
        <div className="flex justify-end mt-6">
          <button
            onClick={handleSaveAIConfig}
            disabled={isPending}
            className="py-2 px-6 bg-brand-purple text-white font-bold rounded-lg hover:opacity-90 disabled:opacity-50"
          >
            {isPending ? "Salvando..." : "Salvar Configurações de IA"}
          </button>
        </div>
      </div>

      {/* Secção 6.1: Controle de Dados */}
      <div className="py-8">
        <h3 className="text-lg font-semibold text-text-primary mb-6">Controle de Dados</h3>
        <div className="space-y-4">
          <DangerActionCard
            icon="fa-file-export"
            title="Exportar meus dados"
            description="Faça o download de todos os seus dados (redações, tarefas, finanças, etc.)."
            buttonText="Exportar"
            onActionClick={() => addToast({ title: 'Em Breve', message: 'A exportação de dados está a ser implementada.', type: 'error' })}
          />
          <DangerActionCard
            icon="fa-trash-alt"
            title="Eliminar conta"
            description="Esta ação é permanente e irá apagar todos os seus dados do Facillit Hub."
            buttonText="Eliminar"
            onActionClick={() => addToast({ title: 'Em Breve', message: 'A eliminação de conta está a ser implementada.', type: 'error' })}
          />
        </div>
      </div>
    </div>
  );
}