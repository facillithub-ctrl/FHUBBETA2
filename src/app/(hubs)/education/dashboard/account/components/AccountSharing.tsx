"use client";

import { useToast } from '@/contexts/ToastContext';

/**
 * ETAPA 7 do Plano (Pessoas e Compartilhamento)
 */
export default function AccountSharing({ fullProfileData }: { fullProfileData: any }) {
  const { addToast } = useToast();
  const isInstitutional = !!fullProfileData.organization_id;
  const schoolName = fullProfileData.school_name || "Instituição";

  return (
    <div className="p-6 md:p-10">
      <h2 className="text-2xl font-bold text-text-primary mb-1">Pessoas e Compartilhamento</h2>
      <p className="text-text-secondary mb-8">Gira as suas ligações institucionais e permissões de partilha.</p>

      {/* Secção 7.3: Acesso Institucional */}
      <div className="pb-8 border-b dark:border-gray-700">
        <h3 className="text-lg font-semibold text-text-primary mb-6">Acesso Institucional</h3>
        
        {isInstitutional ? (
          // O que o utilizador vê se JÁ ESTIVER numa instituição
          <div className="p-4 border border-green-500/30 rounded-xl bg-green-50 dark:bg-green-900/10">
            <h4 className="font-bold text-text-primary">Você está conectado(a) a uma instituição</h4>
            <p className="text-sm text-text-secondary mb-4">
              A sua conta está vinculada à: <span className="font-bold">{schoolName}</span>.
            </p>
            <button 
              onClick={() => addToast({ title: 'Ação Bloqueada', message: 'A desvinculação deve ser solicitada ao administrador da sua instituição.', type: 'error' })}
              className="py-2 px-5 bg-red-600 text-white font-bold rounded-lg text-sm hover:bg-red-700"
            >
              Desvincular
            </button>
          </div>
        ) : (
          // O que o utilizador vê se for uma CONTA INDIVIDUAL
          <div className="p-4 border border-gray-300 dark:border-gray-700 rounded-xl">
            <h4 className="font-bold text-text-primary">Vincular a uma Instituição</h4>
            <p className="text-sm text-text-secondary mb-4">
              Se a sua escola ou empresa usa o Facillit Hub, insira o código de convite para se juntar.
            </p>
            <form className="flex gap-2">
              <input
                type="text"
                placeholder="FHB-XXXXXX"
                className="flex-grow p-3 border border-gray-300 rounded-xl text-sm dark:bg-bg-primary dark:border-gray-700"
              />
              <button 
                type="submit"
                onClick={(e) => {
                  e.preventDefault();
                  addToast({ title: 'Em Breve', message: 'A vinculação de contas institucionais será ativada aqui.', type: 'error' });
                }}
                className="py-3 px-6 bg-brand-purple text-white font-bold rounded-lg"
              >
                Vincular
              </button>
            </form>
          </div>
        )}
      </div>

      {/* Secção 7.1: Gerenciar Conexões (Placeholder) */}
      <div className="py-8 border-b dark:border-gray-700">
        <h3 className="text-lg font-semibold text-text-primary mb-6">Gerenciar Conexões</h3>
        <p className="text-sm text-text-secondary">
          (Em breve: Aqui você poderá ver e gerir os seus Professores, Alunos e Mentores.)
        </p>
      </div>
      
    </div>
  );
}