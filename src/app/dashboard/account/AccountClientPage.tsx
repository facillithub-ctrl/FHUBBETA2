"use client";

import { useState } from 'react';
import { UserProfile } from '../types';
import AccountSidebar from './components/AccountSidebar';

// Importação de todos os componentes das abas
import AccountHome from './components/AccountHome';
import AccountEditProfile from './components/AccountEditProfile';
import AccountSmartProfile from './components/AccountSmartProfile';
import AccountSecurity from './components/AccountSecurity';
import AccountPrivacy from './components/AccountPrivacy';
import AccountDevices from './components/AccountDevices';
import AccountModules from './components/AccountModules';
import AccountSharing from './components/AccountSharing';
import AccountAdminCenter from './components/AccountAdminCenter';

type Props = {
  userProfile: UserProfile;
  fullProfileData: any; // Dados completos vindos do banco
};

export default function AccountClientPage({ userProfile, fullProfileData }: Props) {
  // Aba padrão
  const [activeTab, setActiveTab] = useState('overview');

  // Verificação segura de Admin
  const isAdmin = userProfile?.userCategory === 'admin' || userProfile?.userCategory === 'administrator';

  const renderContent = () => {
    switch (activeTab) {
      case 'overview':
        return (
          <AccountHome 
            userProfile={userProfile} 
            fullProfileData={fullProfileData} 
            setActiveTab={setActiveTab} 
          />
        );
      
      case 'profile':
        return <AccountEditProfile profile={userProfile} />;
        
      case 'smart-profile':
        return <AccountSmartProfile 
            // O componente pode esperar 'profile' ou 'fullProfileData' dependendo da implementação anterior
            // Passando ambos para garantir compatibilidade
            profile={userProfile} 
            stats={fullProfileData} // Se ele usar stats
            fullProfileData={fullProfileData} // Se ele usar fullData
        />;
        
      case 'security':
        return <AccountSecurity userEmail={userProfile.email} />;
        
      case 'privacy':
        return <AccountPrivacy fullProfileData={fullProfileData} profile={userProfile} />;
        
      case 'devices':
        return <AccountDevices />;
        
      case 'modules':
        return <AccountModules fullProfileData={fullProfileData} />;
        
      case 'sharing':
        return <AccountSharing fullProfileData={fullProfileData} />;
        
      case 'billing':
        return (
          <div className="flex flex-col items-center justify-center h-64 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4 text-gray-400">
               <i className="fas fa-credit-card text-2xl"></i>
            </div>
            <h3 className="text-lg font-bold text-gray-700">Faturamento</h3>
            <p className="text-gray-500">O histórico de pagamentos estará disponível em breve.</p>
          </div>
        );

      case 'admin':
        return isAdmin 
          ? <AccountAdminCenter profile={userProfile} organization={null} /> 
          : <div className="p-8 text-center text-gray-500">Acesso restrito a administradores.</div>;
        
      default:
        return (
          <AccountHome 
            userProfile={userProfile} 
            fullProfileData={fullProfileData} 
            setActiveTab={setActiveTab} 
          />
        );
    }
  };

  return (
    <div className="flex flex-col lg:flex-row min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
      {/* Sidebar de Navegação */}
      <div className="w-full lg:w-64 shrink-0 p-4 lg:p-6">
        <AccountSidebar 
            activeTab={activeTab} 
            setActiveTab={setActiveTab} 
            isAdmin={isAdmin} 
        />
      </div>

      {/* Área de Conteúdo Principal */}
      <div className="flex-1 p-4 lg:p-8 overflow-y-auto">
        <div className="max-w-5xl mx-auto bg-white dark:bg-dark-card rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 p-6 md:p-8 min-h-[600px] animate-fade-in">
            {renderContent()}
        </div>
      </div>
    </div>
  );
}