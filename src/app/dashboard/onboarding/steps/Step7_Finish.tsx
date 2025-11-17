"use client";

// 1. A importação de tipos é do ficheiro pai (../)
import type { OnboardingData, UserProfile } from '../OnboardingFlow';

// Props especiais para a etapa final
type FinalStepProps = {
  userProfile: UserProfile;
  onboardingData: OnboardingData;
  onFinish: () => void;
  onBack: () => void;
  isLoading: boolean;
};

/**
 * ETAPA 8 do Plano (Step 7 do Código): Finalização
 * Ecrã final que aciona a submissão de todos os dados.
 */
export default function Step7_Finish({ onFinish, onBack, isLoading }: FinalStepProps) {
  return (
    <div className="w-full max-w-2xl bg-bg-primary dark:bg-bg-secondary p-8 rounded-xl shadow-lg mx-auto transition-all duration-300 animate-fade-in-right">
      
      {/* Ícone de Sucesso/Conclusão */}
      <div className="text-center mb-6">
        <div className="mx-auto bg-brand-green/10 text-brand-green w-20 h-20 rounded-full flex items-center justify-center">
          <i className="fas fa-flag-checkered text-4xl"></i>
        </div>
      </div>

      <h1 className="text-3xl font-bold text-text-primary mb-2 text-center">Tudo pronto!</h1>
      <p className="text-text-secondary mb-8 text-center">
        O seu Dashboard Inteligente está configurado. Estamos a aplicar as suas personalizações e a prepará-lo para si. (Etapa 8 de 8)
      </p>
      
      {/* Navegação Final */}
      <div className="flex justify-between items-center pt-8 mt-6 border-t dark:border-gray-700">
        <button 
          type="button" 
          onClick={onBack} 
          disabled={isLoading} 
          className="text-sm font-medium text-text-secondary hover:text-text-primary disabled:opacity-50"
        >
          Voltar
        </button>
        <button
          onClick={onFinish}
          disabled={isLoading}
          // Usamos o verde (brand-green) para o botão final de "Go"
          className="py-3 px-8 bg-brand-green text-brand-purple font-bold rounded-lg hover:opacity-90 disabled:opacity-50"
        >
          {isLoading ? "A finalizar..." : "Ir para o Dashboard"}
        </button>
      </div>
    </div>
  );
}