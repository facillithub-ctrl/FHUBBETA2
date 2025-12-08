"use client";

import { useToast } from '@/contexts/ToastContext';
import { useState, useEffect } from 'react';

// Componente para um Dispositivo
const DeviceCard = ({ icon, name, location, isCurrent = false }: {
  icon: string;
  name: string;
  location: string;
  isCurrent?: boolean;
}) => {
  const { addToast } = useToast();

  const handleLogout = () => {
    addToast({ title: 'Em Breve', message: 'A função de logout remoto será implementada.', type: 'error' });
  };

  return (
    <div className="flex items-center p-4 border border-gray-300 dark:border-gray-700 rounded-xl">
      <i className={`fas ${icon} w-8 text-center text-2xl ${isCurrent ? 'text-green-500' : 'text-text-secondary'}`}></i>
      <div className="ml-5 flex-grow">
        <h4 className="font-bold text-text-primary">
          {name} {isCurrent && <span className="text-sm font-normal text-green-500">(Este dispositivo)</span>}
        </h4>
        <p className="text-sm text-text-secondary">{location}</p>
      </div>
      {!isCurrent && (
        <button 
          onClick={handleLogout}
          className="ml-4 py-2 px-4 border border-gray-300 dark:border-gray-700 text-text-secondary font-bold rounded-lg text-sm hover:bg-gray-100 dark:hover:bg-gray-800"
        >
          Sair
        </button>
      )}
    </div>
  );
};

/**
 * ETAPA 8 do Plano (Dispositivos)
 */
export default function AccountDevices() {
  const [browser, setBrowser] = useState("Navegador Atual");

  // Tenta detetar o navegador (meramente visual)
  useEffect(() => {
    const ua = navigator.userAgent;
    if (ua.includes("Firefox")) setBrowser("Firefox em Windows");
    else if (ua.includes("Edg/")) setBrowser("Edge em Windows");
    else if (ua.includes("Chrome")) setBrowser("Chrome em Windows");
    else if (ua.includes("Safari")) setBrowser("Safari em Mac");
    else if (ua.includes("Android")) setBrowser("App Android");
    else if (ua.includes("iPhone")) setBrowser("App iOS");
  }, []);

  return (
    <div className="p-6 md:p-10">
      <h2 className="text-2xl font-bold text-text-primary mb-1">Dispositivos</h2>
      <p className="text-text-secondary mb-8">Veja e gira os dispositivos onde a sua conta está conectada.</p>
      
      {/* Lista de Dispositivos (Sessões Ativas) */}
      <div className="space-y-4">
        <DeviceCard
          icon="fa-desktop"
          name={browser}
          location="São Paulo, SP, Brasil • Agora"
          isCurrent={true}
        />
        <DeviceCard
          icon="fa-mobile-alt"
          name="Smartphone (Android)"
          location="São Paulo, SP, Brasil • Há 2 horas"
        />
        <DeviceCard
          icon="fa-tablet-alt"
          name="Tablet (iPad)"
          location="Campinas, SP, Brasil • Ontem"
        />
      </div>
    </div>
  );
}