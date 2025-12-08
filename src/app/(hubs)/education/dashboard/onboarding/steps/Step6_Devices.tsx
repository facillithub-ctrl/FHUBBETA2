"use client";

import { useState, useEffect } from 'react';
import type { StepProps } from '../OnboardingFlow';

// --- Sub-componente: Interruptor (Toggle) ---
// (Reutilizado da Etapa 3)
const SwitchRow = ({ id, title, description, checked, onChange }: {
  id: string;
  title: string;
  description: string;
  checked: boolean;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}) => (
  <label 
    htmlFor={id} 
    className="flex justify-between items-center p-4 border border-gray-300 dark:border-gray-700 rounded-xl cursor-pointer hover:border-brand-purple/50"
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

/**
 * ETAPA 7 do Plano (Step 6 do Código): Configurações de Dispositivos
 * Pede permissão para Notificações e Sincronização.
 */
export default function Step6_Devices({ onboardingData, setOnboardingData, onNext, onBack }: StepProps) {
  
  // (Numa app real, 'isSyncEnabled' seria 'true' por defeito e guardado no estado)
  const [isSyncEnabled, setIsSyncEnabled] = useState(true);
  const [browser, setBrowser] = useState("este navegador");

  // Tenta detetar o navegador (meramente visual)
  useEffect(() => {
    const ua = navigator.userAgent;
    if (ua.includes("Firefox")) setBrowser("este Firefox");
    else if (ua.includes("SamsungBrowser")) setBrowser("este Samsung Browser");
    else if (ua.includes("Opera") || ua.includes("OPR")) setBrowser("este Opera");
    else if (ua.includes("Edge")) setBrowser("este Edge");
    else if (ua.includes("Chrome")) setBrowser("este Chrome");
    else if (ua.includes("Safari")) setBrowser("este Safari");
  }, []);

  // Função para pedir permissão de Notificação ao navegador
  const requestNotificationPermission = () => {
    if (!("Notification" in window)) {
      alert("Este navegador não suporta notificações no desktop.");
    } else if (Notification.permission === "granted") {
      alert("As notificações já estão ativadas!");
    } else if (Notification.permission !== "denied") {
      Notification.requestPermission().then((permission) => {
        if (permission === "granted") {
          alert("Notificações ativadas com sucesso!");
        }
      });
    }
  };

  const handleContinue = () => {
    // (Poderíamos salvar 'isSyncEnabled' no onboardingData aqui se fosse necessário)
    onNext();
  };

  return (
    <div className="w-full max-w-2xl bg-bg-primary dark:bg-bg-secondary p-8 rounded-xl shadow-lg mx-auto transition-all duration-300 animate-fade-in-right">
      <h1 className="text-3xl font-bold text-text-primary mb-2 text-center">Últimas Configurações</h1>
      <p className="text-text-secondary mb-8 text-center">
        Configure como este dispositivo acede à sua conta. (Etapa 7 de 8)
      </p>
      
      <div className="space-y-6">
        
        {/* 1. Dispositivo Atual */}
        <div className="flex items-center p-4 border border-gray-300 dark:border-gray-700 rounded-xl">
          <i className="fas fa-desktop text-3xl text-brand-purple w-12 text-center"></i>
          <div className="ml-4">
            <h4 className="font-bold text-text-primary">Dispositivo Atual</h4>
            <p className="text-sm text-text-secondary">
              Você está a configurar o Facillit Hub em <span className="font-bold">{browser}</span>.
            </p>
          </div>
        </div>

        {/* 2. Permissões */}
        <div className="space-y-4">
          <SwitchRow
            id="sync-toggle"
            title="Sincronização de Dados"
            description="Manter-me conectado e sincronizar os meus dados entre dispositivos."
            checked={isSyncEnabled}
            onChange={(e) => setIsSyncEnabled(e.target.checked)}
          />
          
          {/* Botão para Notificações */}
          <div 
            className="flex justify-between items-center p-4 border border-gray-300 dark:border-gray-700 rounded-xl"
          >
            <div className="pr-4">
              <h4 className="font-bold text-text-primary">Notificações</h4>
              <p className="text-sm text-text-secondary">Receber alertas de prazos, correções e eventos.</p>
            </div>
            <button
              type="button"
              onClick={requestNotificationPermission}
              className="py-2 px-4 bg-brand-green text-brand-purple font-bold rounded-lg text-sm hover:opacity-90"
            >
              Ativar
            </button>
          </div>
        </div>
      </div>

      {/* Navegação */}
      <div className="flex justify-between items-center pt-8 mt-6 border-t dark:border-gray-700">
        <button type="button" onClick={onBack} className="text-sm font-medium text-text-secondary hover:text-text-primary">
          Voltar
        </button>
        <button
          onClick={handleContinue}
          className="py-3 px-8 bg-brand-purple text-white font-bold rounded-lg hover:opacity-90"
        >
          Continuar
        </button>
      </div>
    </div>
  );
}