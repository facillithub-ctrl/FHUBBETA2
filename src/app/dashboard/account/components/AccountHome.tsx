"use client";

import Image from "next/image";
import type { UserProfile } from "../../types";

type Props = {
  userProfile: UserProfile;
  fullProfileData: any;
  setActiveTab: (tab: string) => void;
};

// Componente para os cartões de "Acesso Rápido"
const QuickAccessCard = ({ title, description, icon, onClick }: {
  title: string;
  description: string;
  icon: string;
  onClick: () => void;
}) => (
  <button 
    onClick={onClick}
    className="w-full flex items-center p-4 border border-gray-300 dark:border-gray-700 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
  >
    <i className={`fas ${icon} w-8 text-center text-xl text-brand-purple`}></i>
    <div className="ml-4 text-left">
      <h4 className="font-bold text-text-primary">{title}</h4>
      <p className="text-sm text-text-secondary">{description}</p>
    </div>
    <i className="fas fa-chevron-right text-text-secondary ml-auto"></i>
  </button>
);

export default function AccountHome({ userProfile, fullProfileData, setActiveTab }: Props) {
  
  const facillitId = fullProfileData.facillit_id || 'FHB_???-???';
  
  return (
    <div className="p-6 md:p-10">
      <h2 className="text-2xl font-bold text-text-primary mb-1">Início</h2>
      <p className="text-text-secondary mb-8">
        Bem-vindo(a) ao seu centro de conta, {userProfile.fullName?.split(' ')[0]}.
      </p>

      {/* --- O CRACHÁ (Atualizado) --- */}
      <div className="w-full max-w-sm mx-auto p-6 rounded-2xl shadow-xl bg-bg-primary dark:bg-bg-secondary border dark:border-gray-700">
        
        <div className="flex items-center justify-between mb-4">
          {/* 1. CORREÇÃO DA FOTO DE PERFIL (Bug/Design) */}
          {/* Adicionamos um 'wrapper' com gradiente e padding (p-1) para criar a borda */}
          <div className="w-20 h-20 rounded-full p-1 bg-gradient-to-br from-brand-purple to-brand-green">
            <div className="w-full h-full rounded-full bg-white dark:bg-bg-secondary overflow-hidden">
              {userProfile.avatarUrl ? (
                <Image 
                  src={userProfile.avatarUrl} 
                  alt="Avatar" 
                  width={72} 
                  height={72} 
                  className="object-cover w-full h-full" 
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-2xl font-bold text-brand-purple">
                  {userProfile.fullName?.charAt(0) || 'F'}
                </div>
              )}
            </div>
          </div>
          
          <Image 
            src="/assets/images/accont.svg"
            alt="Facillit Account" 
            width={120} 
            height={25}
            className="dark:invert dark:opacity-80"
          />
        </div>

        {/* Informações */}
        <div className="space-y-2 mb-6">
          <div>
            <span className="text-sm text-text-secondary">Nome:</span>
            <p className="font-bold text-lg text-text-primary">{userProfile.fullName}</p>
          </div>
          <div>
            <span className="text-sm text-text-secondary">UserID:</span>
            {/* 2. Deixamos o ID em maiúsculas, como no mockup FHB00001 */}
            <p className="font-bold text-lg text-text-primary">{facillitId.toUpperCase()}</p>
          </div>
        </div>
        
        {/* 3. ADIÇÃO DO QR CODE E BOTÃO COMPARTILHAR */}
        <div className="flex items-center gap-4 my-6 p-4 bg-gray-100 dark:bg-gray-800 rounded-lg">
            <i className="fas fa-qrcode text-5xl text-brand-purple"></i>
            <div className="flex-grow">
                <h4 className="font-bold text-text-primary">Compartilhar Perfil</h4>
                <p className="text-xs text-text-secondary">Use o QR Code ou o link para partilhar o seu perfil público (Portfólio, etc.)</p>
                <button className="text-sm font-bold text-brand-purple hover:underline mt-1">
                    Gerar link
                </button>
            </div>
        </div>

        {/* Botão de Gerenciar */}
        <button 
          onClick={() => setActiveTab('profile')} // Leva para a aba "Perfil"
          className="w-full py-3 bg-gradient-to-r from-brand-purple to-brand-green text-white font-bold rounded-xl hover:opacity-90 transition-all"
        >
          Gerenciar minha conta
        </button>
      </div>
      
      {/* --- ACESSO RÁPIDO --- */}
      <div className="mt-12">
        <h3 className="text-xl font-bold text-text-primary mb-6">Acesso rápido</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <QuickAccessCard
            title="Segurança e Acesso"
            description="Altere sua senha e ative o 2FA."
            icon="fa-shield-alt"
            onClick={() => setActiveTab('security')}
          />
          <QuickAccessCard
            title="Pagamentos e Assinaturas"
            description="Veja seu plano e histórico."
            icon="fa-credit-card"
            onClick={() => setActiveTab('billing')}
          />
          <QuickAccessCard
            title="Dispositivos Conectados"
            description="Veja onde sua conta está ativa."
            icon="fa-desktop"
            onClick={() => setActiveTab('devices')}
          />
          <QuickAccessCard
            title="Privacidade e Dados"
            description="Controle seus dados e IA."
            icon="fa-lock"
            onClick={() => setActiveTab('privacy')}
          />
        </div>
      </div>
    </div>
  );
}