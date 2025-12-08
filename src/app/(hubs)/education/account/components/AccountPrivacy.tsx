"use client";

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { useToast } from '@/contexts/ToastContext';
import { updateAccountProfile } from '../actions';
import { PrivacySettings } from '../../types';

// --- Sub-componente: Switch Toggle Personalizado ---
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
    className={`flex justify-between items-center p-4 border rounded-xl transition-all
      ${disabled ? 'opacity-60 cursor-not-allowed bg-gray-50 dark:bg-gray-800/50' : 'cursor-pointer hover:border-royal-blue/30'}
      ${checked ? 'border-royal-blue/50 bg-royal-blue/5' : 'border-gray-200 dark:border-gray-700'}
    `}
  >
    <div className="pr-4">
      <h4 className="font-bold text-gray-800 dark:text-gray-200">{title}</h4>
      <p className="text-sm text-gray-500 dark:text-gray-400">{description}</p>
    </div>
    <div className="relative inline-flex items-center">
      <input
        type="checkbox"
        id={id}
        checked={checked}
        onChange={onChange}
        disabled={disabled}
        className="sr-only peer"
      />
      <div className="w-11 h-6 bg-gray-200 rounded-full peer-checked:bg-royal-blue 
                      dark:bg-gray-700 peer-focus:ring-2 peer-focus:ring-royal-blue/50
                      peer-checked:after:translate-x-full peer-checked:after:border-white 
                      after:content-[''] after:absolute after:top-0.5 after:left-[2px] 
                      after:bg-white after:border-gray-300 after:border after:rounded-full 
                      after:h-5 after:w-5 after:transition-all"
      ></div>
    </div>
  </label>
);

// --- Sub-componente: Card de Ação Perigosa ---
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
      <h4 className="font-bold text-gray-800 dark:text-gray-200">{title}</h4>
      <p className="text-sm text-gray-500 dark:text-gray-400">{description}</p>
    </div>
    <button 
      onClick={onActionClick}
      className="ml-4 py-2 px-5 bg-red-600 text-white font-bold rounded-lg text-sm hover:bg-red-700 transition-colors"
    >
      {buttonText}
    </button>
  </div>
);

export default function AccountPrivacy({ fullProfileData }: { fullProfileData: any }) {
  const router = useRouter();
  const { addToast } = useToast();
  const [isPending, startTransition] = useTransition();

  // --- Estado 1: Configurações de Privacidade do Perfil ---
  // Inicialização segura
  const [privacyConfig, setPrivacyConfig] = useState<PrivacySettings>(
    fullProfileData.privacy_settings || {
      is_public: false,
      show_full_name: false,
      show_school: true,
      show_stats: true,
      show_grades: false,
      show_essays: false,
      show_badges: true
    }
  );

  // --- Estado 2: Configurações de Inteligência Artificial ---
  const [aiConfig, setAiConfig] = useState(
    fullProfileData.category_details?.ai_config || {
      level: 'intermediario',
      predictive: true,
      cross_data: true,
      performance: true,
    }
  );

  const handlePrivacyChange = (key: keyof PrivacySettings, value: boolean) => {
    setPrivacyConfig((prev) => ({ ...prev, [key]: value }));
  };

  const handleSavePrivacy = () => {
    startTransition(async () => {
      // @ts-ignore
      const result = await updateAccountProfile({
        privacy_settings: privacyConfig
      });

      if (result.error) {
        addToast({ title: 'Erro', message: result.error, type: 'error' });
      } else {
        addToast({ title: 'Salvo', message: 'Visibilidade do perfil atualizada.', type: 'success' });
        router.refresh();
      }
    });
  };

  const handleAIChange = (key: string, value: boolean) => {
    setAiConfig((prev: any) => ({ ...prev, [key]: value }));
  };

  const handleSaveAIConfig = () => {
    startTransition(async () => {
      // @ts-ignore
      const result = await updateAccountProfile({
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
    <div className="p-6 md:p-10 space-y-12 animate-in fade-in">
      <div>
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-1">Privacidade e Dados</h2>
        <p className="text-gray-500 mb-8">Gerencie quem pode ver suas conquistas, permissões de IA e a segurança da conta.</p>
      </div>

      {/* --- SEÇÃO 1: VISIBILIDADE DO PERFIL PÚBLICO --- */}
      <div className="pb-8 border-b dark:border-gray-700">
        <div className="flex flex-col md:flex-row md:justify-between md:items-end mb-6 gap-4">
            <div>
                <h3 className="text-lg font-bold text-gray-800 dark:text-white">Perfil Público Facillit</h3>
                <p className="text-sm text-gray-500">
                   Decida o que compartilhar. {privacyConfig.is_public ? 'Seu perfil está visível.' : 'Seu perfil está oculto.'}
                </p>
            </div>
            
            {/* Link para visualização (aparece apenas se perfil estiver ativo) */}
            {privacyConfig.is_public && fullProfileData.nickname && (
                <a 
                  href={`/u/${fullProfileData.nickname}`} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-sm font-medium text-royal-blue hover:underline flex items-center gap-2 bg-royal-blue/10 px-3 py-2 rounded-lg transition-colors"
                >
                    <i className="fas fa-external-link-alt text-xs"></i> Ver meu perfil público 
                </a>
            )}
        </div>
        
        <div className="space-y-4">
          <SwitchRow
            id="is-public"
            title="Ativar Perfil Público"
            description="Permite que seu perfil seja acessado via facillithub.com/u/seu-apelido."
            checked={privacyConfig.is_public}
            onChange={(e) => handlePrivacyChange('is_public', e.target.checked)}
          />

          {/* Opções condicionais - Só aparecem se o perfil for público */}
          <div className={`transition-all duration-300 ease-in-out overflow-hidden ${privacyConfig.is_public ? 'max-h-[1000px] opacity-100' : 'max-h-0 opacity-50'}`}>
            <div className="pl-4 ml-4 border-l-2 border-gray-100 dark:border-gray-800 space-y-4 mt-4">
                <h4 className="text-xs font-bold uppercase text-gray-400 mb-2">Detalhes de Exibição</h4>
                
                <SwitchRow
                    id="show-name"
                    title="Mostrar Nome Completo"
                    description={`Se desativado, exibiremos apenas seu apelido (@${fullProfileData.nickname || 'usuario'}).`}
                    checked={privacyConfig.show_full_name}
                    onChange={(e) => handlePrivacyChange('show_full_name', e.target.checked)}
                />
                
                <SwitchRow
                    id="show-grades"
                    title="Mostrar Minhas Médias (Notas)"
                    description="Exibir sua Média Geral e gráficos de evolução para visitantes."
                    checked={privacyConfig.show_grades}
                    onChange={(e) => handlePrivacyChange('show_grades', e.target.checked)}
                />

                <SwitchRow
                    id="show-essays"
                    title="Listar Últimas Redações"
                    description="Mostrar apenas os temas das redações que você escreveu (o texto permanece privado)."
                    checked={privacyConfig.show_essays}
                    onChange={(e) => handlePrivacyChange('show_essays', e.target.checked)}
                />

                <SwitchRow
                    id="show-badges"
                    title="Mostrar Conquistas (Badges)"
                    description="Exibir seu nível, medalhas desbloqueadas e dias de ofensiva."
                    checked={privacyConfig.show_badges}
                    onChange={(e) => handlePrivacyChange('show_badges', e.target.checked)}
                />
            </div>
          </div>
        </div>

        <div className="flex justify-end mt-6">
          <button
            onClick={handleSavePrivacy}
            disabled={isPending}
            className="py-2 px-6 bg-royal-blue text-white font-bold rounded-lg hover:opacity-90 disabled:opacity-50 transition-all shadow-lg shadow-royal-blue/20"
          >
            {isPending ? "Salvando..." : "Atualizar Visibilidade"}
          </button>
        </div>
      </div>

      {/* --- SEÇÃO 2: CONFIGURAÇÕES DE IA --- */}
      <div className="pb-8 border-b dark:border-gray-700">
        <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-6">Configurações de IA</h3>
        <div className="space-y-4">
          <SwitchRow
            id="ai-predictive"
            title="Recomendações Preditivas"
            description="Permitir que a IA sugira ações, conteúdos e hábitos baseados no seu uso."
            checked={aiConfig.predictive}
            onChange={(e) => handleAIChange('predictive', e.target.checked)}
          />
          <SwitchRow
            id="ai-cross-data"
            title="Cruzamento de Dados entre Verticais"
            description="Ex: Usar dados do módulo 'Write' para sugerir metas no 'Day'."
            checked={aiConfig.cross_data}
            onChange={(e) => handleAIChange('cross_data', e.target.checked)}
          />
          <SwitchRow
            id="ai-performance"
            title="Coleta de Desempenho (Anônima)"
            description="Permitir o uso de dados anônimos para treinar e evoluir nossos modelos."
            checked={aiConfig.performance}
            onChange={(e) => handleAIChange('performance', e.target.checked)}
          />
        </div>
        <div className="flex justify-end mt-6">
          <button
            onClick={handleSaveAIConfig}
            disabled={isPending}
            className="py-2 px-6 bg-brand-purple text-white font-bold rounded-lg hover:opacity-90 disabled:opacity-50 transition-all"
          >
            {isPending ? "Salvando..." : "Salvar Configurações de IA"}
          </button>
        </div>
      </div>

      {/* --- SEÇÃO 3: CONTROLE DE DADOS --- */}
      <div className="py-2">
        <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-6">Controle de Dados</h3>
        <div className="space-y-4">
          <DangerActionCard
            icon="fa-file-export"
            title="Exportar meus dados"
            description="Faça o download de todos os seus dados (redações, tarefas, histórico)."
            buttonText="Exportar"
            onActionClick={() => addToast({ title: 'Em Breve', message: 'A exportação de dados está em desenvolvimento.', type: 'info' })}
          />
          <DangerActionCard
            icon="fa-trash-alt"
            title="Eliminar conta"
            description="Esta ação é permanente e irá apagar todos os seus dados do Facillit Hub."
            buttonText="Eliminar"
            onActionClick={() => addToast({ title: 'Ação Bloqueada', message: 'Entre em contato com o suporte para excluir sua conta.', type: 'error' })}
          />
        </div>
      </div>
    </div>
  );
}