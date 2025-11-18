"use client";

// --- Sub-componente: Cartão de Perfil ---
const ProfileInsightCard = ({ icon, title, children }: {
  icon: string;
  title: string;
  children: React.ReactNode;
}) => (
  <div className="bg-gray-50 dark:bg-gray-800/50 p-6 rounded-xl border dark:border-gray-700">
    <div className="flex items-center gap-3 mb-3">
      <i className={`fas ${icon} text-xl text-brand-purple`}></i>
      <h3 className="text-xl font-bold text-text-primary">{title}</h3>
    </div>
    <div className="space-y-2 text-sm text-text-secondary">
      {children}
    </div>
  </div>
);

// --- Sub-componente: Item de Habilidade ---
const SkillItem = ({ text, isStrong }: { text: string; isStrong: boolean }) => (
  <div className="flex items-center gap-2">
    <i className={`fas ${isStrong ? 'fa-check-circle text-green-500' : 'fa-lightbulb text-yellow-500'}`}></i>
    <span>{text}</span>
  </div>
);

/**
 * ETAPA 9 do Plano (Meu Perfil Inteligente)
 */
export default function AccountSmartProfile({ fullProfileData }: { fullProfileData: any }) {
  
  // 1. Extrai dados dinâmicos do perfil
  const modules = fullProfileData.active_modules || [];
  const studentGoals = fullProfileData.category_details?.students_config?.goals || [];
  const aiLevel = fullProfileData.category_details?.ai_config?.level || 'intermediario';

  // 2. Lógica dinâmica para construir os insights
  const showCognitive = modules.includes('write') || modules.includes('test');
  const showProductive = modules.includes('day') || modules.includes('task');
  const showFinancial = modules.includes('finances');
  const showProfessional = modules.includes('coach-career');

  return (
    <div className="p-6 md:p-10">
      <h2 className="text-2xl font-bold text-text-primary mb-1">Meu Perfil Inteligente</h2>
      <p className="text-text-secondary mb-8">
        Um resumo da sua vida digital, gerado pela IA da Facillit com base nos seus dados e módulos ativos.
      </p>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Perfil Cognitivo (9.1) */}
        {showCognitive ? (
          <ProfileInsightCard icon="fa-brain" title="Perfil Cognitivo (Students)">
            <p className="mb-3">Baseado nos módulos <strong>Write</strong> e <strong>Test</strong>.</p>
            {studentGoals.includes('escrita') && (
              <SkillItem isStrong={true} text="Foco principal em 'Melhorar Escrita'." />
            )}
            {studentGoals.includes('provas') && (
              <SkillItem isStrong={true} text="Foco principal em 'Passar em Provas'." />
            )}
            <SkillItem isStrong={false} text="Áreas de dificuldade: (Em breve, com dados de correção)" />
          </ProfileInsightCard>
        ) : (
          <ProfileInsightCard icon="fa-brain" title="Perfil Cognitivo (Students)">
            <p>Ative os módulos <strong>Facillit Write</strong> ou <strong>Facillit Test</strong> para desbloquear este perfil.</p>
          </ProfileInsightCard>
        )}

        {/* Perfil Produtivo (9.2) */}
        {showProductive ? (
          <ProfileInsightCard icon="fa-calendar-check" title="Perfil Produtivo (Global)">
            <p className="mb-3">Baseado no módulo <strong>Facillit Day</strong>.</p>
            <SkillItem isStrong={true} text="Rotina ideal: (Em breve, com dados do Day)" />
            <SkillItem isStrong={true} text="Metas concluídas: (Em breve)" />
          </ProfileInsightCard>
        ) : (
           <ProfileInsightCard icon="fa-calendar-check" title="Perfil Produtivo (Global)">
            <p>Ative o módulo <strong>Facillit Day</strong> para desbloquear este perfil.</p>
          </ProfileInsightCard>
        )}
        
        {/* Perfil Financeiro (9.3) */}
        {showFinancial ? (
          <ProfileInsightCard icon="fa-wallet" title="Perfil Financeiro (Finances)">
            <p className="mb-3">Baseado no módulo <strong>Facillit Finances</strong>.</p>
            <SkillItem isStrong={false} text="Comportamento financeiro: (Em breve)" />
          </ProfileInsightCard>
        ) : (
           <ProfileInsightCard icon="fa-wallet" title="Perfil Financeiro (Finances)">
            <p>Ative o módulo <strong>Facillit Finances</strong> para desbloquear este perfil.</p>
          </ProfileInsightCard>
        )}
        
        {/* Perfil Profissional (9.4) */}
        {showProfessional ? (
          <ProfileInsightCard icon="fa-bullseye" title="Perfil Profissional (C&C)">
            <p className="mb-3">Baseado no módulo <strong>Facillit C&C</strong>.</p>
            <SkillItem isStrong={true} text="Competências: (Em breve)" />
            <SkillItem isStrong={false} text="Pontos de melhoria: (Em breve)" />
          </ProfileInsightCard>
        ) : (
           <ProfileInsightCard icon="fa-bullseye" title="Perfil Profissional (C&C)">
            <p>Ative o módulo <strong>Facillit C&C</strong> para desbloquear este perfil.</p>
          </ProfileInsightCard>
        )}

      </div>
    </div>
  );
}