"use client";

import { useState, useTransition } from 'react';
import { useToast } from '@/contexts/ToastContext';
import { updateUserPassword } from '../actions'; // Importa a nova Server Action

// --- Sub-componente: Cartão de Ação ---
// Um cartão clicável que pode expandir para mostrar um formulário
const SecurityActionCard = ({ icon, title, description, children, actionText, onActionClick }: {
  icon: string;
  title: string;
  description: string;
  children?: React.ReactNode; // O formulário (quando expandido)
  actionText: string;
  onActionClick: () => void;
}) => (
  <div className="border border-gray-300 dark:border-gray-700 rounded-xl overflow-hidden">
    <button 
      onClick={onActionClick}
      className="w-full flex items-center p-6 text-left hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
    >
      <i className={`fas ${icon} w-8 text-center text-2xl text-text-secondary`}></i>
      <div className="ml-5 flex-grow">
        <h4 className="font-bold text-text-primary">{title}</h4>
        <p className="text-sm text-text-secondary">{description}</p>
      </div>
      {/* Mostra 'Configurar' ou 'Alterar' */}
      <span className="text-sm font-bold text-brand-purple ml-4">{actionText}</span>
    </button>
    
    {/* Onde o formulário "inline" irá aparecer */}
    {children && (
      <div className="p-6 border-t dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
        {children}
      </div>
    )}
  </div>
);

/**
 * ETAPA 3 do Plano (Segurança e Acesso)
 */
export default function AccountSecurity() {
  const { addToast } = useToast();
  const [isPending, startTransition] = useTransition();

  // --- Estado para Alteração de Senha ---
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword.length < 8) {
      addToast({ title: 'Senha muito curta', message: 'A senha precisa ter no mínimo 8 caracteres.', type: 'error' });
      return;
    }
    if (newPassword !== confirmPassword) {
      addToast({ title: 'Senhas não coincidem', message: 'Por favor, verifique a confirmação da senha.', type: 'error' });
      return;
    }

    startTransition(async () => {
      const result = await updateUserPassword(newPassword);
      if (result.error) {
        addToast({ title: 'Erro', message: result.error, type: 'error' });
      } else {
        addToast({ title: 'Sucesso!', message: 'Senha alterada com sucesso.', type: 'success' });
        setIsChangingPassword(false);
        setNewPassword('');
        setConfirmPassword('');
      }
    });
  };

  return (
    <div className="p-6 md:p-10">
      <h2 className="text-2xl font-bold text-text-primary mb-1">Segurança e login</h2>
      <p className="text-text-secondary mb-8">Gestão de senhas, autenticação de dois fatores e atividade da conta.</p>
      
      {/* Secção de Verificação (3.1 do PDF) */}
      <div className="space-y-6">
        <SecurityActionCard
          icon="fa-key"
          title="Senha"
          description={isChangingPassword ? "Crie uma senha forte" : "Última alteração: (data...)"}
          actionText={isChangingPassword ? "Cancelar" : "Alterar"}
          onActionClick={() => setIsChangingPassword(!isChangingPassword)}
        >
          {/* Formulário de Alteração de Senha (Expandido) */}
          {isChangingPassword && (
            <form onSubmit={handlePasswordSubmit} className="space-y-4">
              <div>
                <label htmlFor="newPassword" className="block text-sm font-medium text-text-secondary mb-1">Nova Senha</label>
                <input 
                  type="password"
                  id="newPassword"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-xl text-sm dark:bg-bg-primary dark:border-gray-700"
                  placeholder="Mínimo de 8 caracteres"
                />
              </div>
              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-text-secondary mb-1">Confirmar Nova Senha</label>
                <input 
                  type="password"
                  id="confirmPassword"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-xl text-sm dark:bg-bg-primary dark:border-gray-700"
                />
              </div>
              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={isPending}
                  className="py-2 px-6 bg-brand-purple text-white font-bold rounded-lg hover:opacity-90 disabled:opacity-50"
                >
                  {isPending ? "Salvando..." : "Salvar Senha"}
                </button>
              </div>
            </form>
          )}
        </SecurityActionCard>

        <SecurityActionCard
          icon="fa-mobile-alt"
          title="Autenticação de 2 Fatores (2FA)"
          description="Desativado"
          actionText="Configurar"
          onActionClick={() => { 
            addToast({ title: 'Em Breve', message: 'A autenticação de 2 fatores (2FA) está a ser implementada.', type: 'error' });
          }}
        />
      </div>

      {/* Secção de Auditoria (3.3 do PDF) */}
      <div className="mt-12">
        <h3 className="text-xl font-bold text-text-primary mb-6">Atividade Recente</h3>
        <div className="space-y-4">
          <div className="flex items-center p-4 border border-gray-300 dark:border-gray-700 rounded-xl">
            <i className="fas fa-desktop w-8 text-center text-2xl text-green-500"></i>
            <div className="ml-5">
              <h4 className="font-bold text-text-primary">Este Dispositivo</h4>
              <p className="text-sm text-text-secondary">Chrome em Windows (Sessão atual)</p>
            </div>
          </div>
          <div className="flex items-center p-4 border border-gray-300 dark:border-gray-700 rounded-xl">
            <i className="fas fa-mobile-alt w-8 text-center text-2xl text-text-secondary"></i>
            <div className="ml-5">
              <h4 className="font-bold text-text-primary">Smartphone (Android)</h4>
              <p className="text-sm text-text-secondary">São Paulo, SP • Há 2 horas</p>
            </div>
            <button className="ml-auto text-text-secondary hover:text-red-500" title="Desconectar">
                <i className="fas fa-sign-out-alt"></i>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}