"use client";

import { useState } from 'react';
import type { UserProfile } from '../types';
import createClient from '@/utils/supabase/client';
import { useRouter } from 'next/navigation';

// Importar os componentes de etapa (os caminhos "./steps/..." estão corretos aqui)
import Step1_Profile from './steps/Step1_Profile';
import Step2_Verticals from './steps/Step2_Verticals';
import Step3_AI from './steps/Step3_AI';
import Step4_VerticalsConfig from './steps/Step4_VerticalsConfig';
import Step5_Modules from './steps/Step5_Modules';
import Step6_Devices from './steps/Step6_Devices';
import Step7_Finish from './steps/Step7_Finish';

// Tipos de dados para o Onboarding
export type OnboardingData = {
  // ETAPA 1
  full_name: string;
  birth_date: string;
  country: string;
  language: string;
  avatar_url?: string;
  // ETAPA 2
  verticals: ('students' | 'global' | 'schools' | 'startups' | 'enterprise')[];
  // ETAPA 3
  ai_level: 'essencial' | 'intermediario' | 'profundo';
  ai_predictive: boolean;
  ai_cross_data: boolean;
  ai_performance_collection: boolean;
  // ETAPA 4
  students_config?: {
    study_phase: string;
    goals: string[];
  };
  // ETAPA 5
  active_modules: string[];
};

// Props que cada componente de Etapa irá receber
export type StepProps = {
  userProfile: UserProfile;
  onboardingData: OnboardingData;
  setOnboardingData: React.Dispatch<React.SetStateAction<OnboardingData>>;
  onNext: () => void;
  onBack: () => void;
};


export default function OnboardingFlow({ userProfile }: { userProfile: UserProfile }) {
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const [onboardingData, setOnboardingData] = useState<OnboardingData>({
    full_name: userProfile.fullName || '',
    birth_date: '',
    country: 'Brasil',
    language: 'Português (Brasil)',
    avatar_url: userProfile.avatarUrl || undefined,
    verticals: [],
    ai_level: 'intermediario',
    ai_predictive: true,
    ai_cross_data: true,
    ai_performance_collection: true,
    active_modules: userProfile.active_modules || ['write', 'test'],
  });

  const handleNext = () => setStep(s => s + 1);
  const handleBack = () => setStep(s => s - 1);

  // *** A LÓGICA DE FINALIZAÇÃO (ETAPA 8) ***
  const handleFinish = async () => {
    setIsLoading(true);
    
    // 1. Agrupa os dados complexos dentro do 'category_details' (JSONB)
    const categoryDetails = {
      country: onboardingData.country,
      language: onboardingData.language,
      verticals: onboardingData.verticals,
      ai_config: {
        level: onboardingData.ai_level,
        predictive: onboardingData.ai_predictive,
        cross_data: onboardingData.ai_cross_data,
        performance: onboardingData.ai_performance_collection
      },
      students_config: onboardingData.students_config
    };

    // 2. Prepara o objeto final para a tabela 'profiles'
    const finalProfileData = {
      full_name: onboardingData.full_name,
      birth_date: onboardingData.birth_date,
      avatar_url: onboardingData.avatar_url, // Salva o URL do avatar
      category_details: categoryDetails,     // Salva o JSON
      active_modules: onboardingData.active_modules, // Salva os módulos
      has_completed_onboarding: true, // A ETAPA FINAL!
      updated_at: new Date().toISOString(),
    };

    // 3. Faz o update no Supabase
    const { error } = await supabase
      .from('profiles')
      .update(finalProfileData)
      .eq('id', userProfile.id);

    if (error) {
      alert(`Erro ao finalizar: ${error.message}`);
      setIsLoading(false);
    } else {
      router.refresh();
    }
  };

  // O "Router" que mostra o componente da etapa correta
  const renderStep = () => {
    const props: StepProps = { 
      userProfile, 
      onboardingData, 
      setOnboardingData, 
      onNext: handleNext, 
      onBack: handleBack 
    };

    switch (step) {
      case 1:
        return <Step1_Profile {...props} />; // ETAPA 3 do plano
      case 2:
        return <Step2_Verticals {...props} />; // ETAPA 3 (continuação)
      case 3:
        return <Step3_AI {...props} />; // ETAPA 4
      case 4:
        return <Step4_VerticalsConfig {...props} />; // ETAPA 5
      case 5:
        return <Step5_Modules {...props} />; // ETAPA 6
      case 6:
        return <Step6_Devices {...props} />; // ETAPA 7
      case 7:
        return <Step7_Finish {...props} onFinish={handleFinish} isLoading={isLoading} />; // ETAPA 8
      default:
        return <Step1_Profile {...props} />;
    }
  };

  return (
    <div className="min-h-screen bg-bg-secondary dark:bg-bg-primary">
      <div className="container mx-auto max-w-3xl p-4 py-8">
        {renderStep()}
      </div>
    </div>
  );
}