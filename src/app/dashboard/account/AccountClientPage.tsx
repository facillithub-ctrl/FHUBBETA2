"use client";

import { useState } from 'react';
import type { UserProfile } from '../types';
import AccountSidebar from './components/AccountSidebar';
import AccountHome from './components/AccountHome'; 
import ProfileInfo from './components/ProfileInfo';
import AccountSecurity from './components/AccountSecurity';
import AccountPrivacy from './components/AccountPrivacy';
import AccountDevices from './components/AccountDevices';
import AccountModules from './components/AccountModules';     // 1. IMPORTADO
import AccountSharing from './components/AccountSharing';     // 1. IMPORTADO
import AccountSmartProfile from './components/AccountSmartProfile'; // 1. IMPORTADO

type Props = {
  userProfile: UserProfile;
  fullProfileData: any; 
};

export default function AccountClientPage({ userProfile, fullProfileData }: Props) {
  const [activeTab, setActiveTab] = useState('home');

  // Função para renderizar o componente da aba correta
  const renderActiveTab = () => {
    switch (activeTab) {
      case 'home':
        return <AccountHome 
                  userProfile={userProfile} 
                  fullProfileData={fullProfileData} 
                  setActiveTab={setActiveTab}
                />;
      case 'profile':
        return <ProfileInfo userProfile={userProfile} fullProfileData={fullProfileData} />;
      case 'security':
        return <AccountSecurity />;
      case 'privacy':
        return <AccountPrivacy fullProfileData={fullProfileData} />;
      case 'devices':
        return <AccountDevices />;
      
      // 2. SUBSTITUÍDOS OS PLACEHOLDERS
      case 'modules':
        return <AccountModules fullProfileData={fullProfileData} />;
      case 'sharing':
        return <AccountSharing fullProfileData={fullProfileData} />;
      case 'smart_profile':
        return <AccountSmartProfile fullProfileData={fullProfileData} />;
        
      // Placeholders restantes
      case 'billing':
        return <div className="p-8"><h2>Pagamentos e Assinaturas (Em breve)</h2></div>;
      case 'admin_center':
        return <div className="p-8"><h2>Admin Center (Em breve)</h2></div>;

      default:
        return <AccountHome 
                  userProfile={userProfile} 
                  fullProfileData={fullProfileData} 
                  setActiveTab={setActiveTab} 
                />;
    }
  };

  return (
    <div className="flex flex-col md:flex-row gap-6">
      
      {/* Sidebar Fixa à Esquerda */}
      <div className="md:w-1/4 lg:w-1/5 flex-shrink-0">
        <AccountSidebar activeTab={activeTab} setActiveTab={setActiveTab} />
      </div>

      {/* Área de Conteúdo à Direita */}
      <div className="flex-grow bg-bg-primary dark:bg-bg-secondary rounded-xl shadow-lg overflow-hidden">
        {renderActiveTab()}
      </div>
    </div>
  );
}