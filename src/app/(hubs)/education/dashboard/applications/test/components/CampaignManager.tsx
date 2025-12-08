"use client";

import { useState, useEffect, useTransition, useCallback } from 'react';
import { getCampaignsForTeacher, getTestsForTeacher, deleteCampaign, Campaign, Test } from '../actions';
import CreateCampaignModal from './CreateCampaignModal';
import { useToast } from '@/contexts/ToastContext';
import ConfirmationModal from '@/components/ConfirmationModal';

const CampaignManager = () => {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [tests, setTests] = useState<Test[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isConfirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  const [campaignToManage, setCampaignToManage] = useState<Campaign | null>(null);
  const [isPending, startTransition] = useTransition();
  const { addToast } = useToast();

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    const [campaignsRes, testsRes] = await Promise.all([
      getCampaignsForTeacher(),
      getTestsForTeacher()
    ]);

    if (campaignsRes.error) {
      addToast({ title: "Erro", message: "Não foi possível carregar as campanhas.", type: "error" });
    } else {
      setCampaigns(campaignsRes.data || []);
    }

    if (testsRes.error) {
        addToast({ title: "Erro", message: "Não foi possível carregar suas avaliações.", type: "error" });
    } else {
        setTests(testsRes.data || []);
    }
    setIsLoading(false);
  }, [addToast]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleOpenModal = (campaign: Campaign | null) => {
    setCampaignToManage(campaign);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setCampaignToManage(null);
    setIsModalOpen(false);
  };

  const handleDeleteClick = (campaign: Campaign) => {
    setCampaignToManage(campaign);
    setConfirmDeleteOpen(true);
  };

  const executeDelete = () => {
    if (!campaignToManage) return;

    startTransition(async () => {
        const result = await deleteCampaign(campaignToManage.id);
        if (result.error) {
            addToast({ title: "Erro ao Excluir", message: result.error, type: 'error' });
        } else {
            addToast({ title: "Sucesso", message: "Campanha excluída.", type: 'success' });
            fetchData(); // Recarrega os dados
        }
        setConfirmDeleteOpen(false);
        setCampaignToManage(null);
    });
  };

  const getStatus = (startDate: string, endDate: string) => {
    const now = new Date();
    const start = new Date(startDate);
    const end = new Date(endDate);
    if (now < start) return { text: 'Agendada', color: 'bg-blue-100 text-blue-800' };
    if (now > end) return { text: 'Concluída', color: 'bg-gray-200 text-gray-800' };
    return { text: 'Ativa', color: 'bg-green-100 text-green-800' };
  };

  return (
    <>
    {isModalOpen && (
        <CreateCampaignModal
            tests={tests}
            existingCampaign={campaignToManage}
            onClose={handleCloseModal}
            onCampaignSaved={() => {
              fetchData();
              handleCloseModal();
            }}
        />
    )}
    <ConfirmationModal
        isOpen={isConfirmDeleteOpen}
        title="Confirmar Exclusão"
        message={`Tem certeza que deseja excluir a campanha "${campaignToManage?.title}"? Esta ação é irreversível.`}
        onConfirm={executeDelete}
        onClose={() => setConfirmDeleteOpen(false)}
        confirmText="Sim, Excluir"
    />
    <div className="bg-white dark:bg-dark-card p-6 rounded-lg shadow-md">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold text-dark-text dark:text-white">Gerenciar Campanhas</h2>
        <button onClick={() => handleOpenModal(null)} className="bg-royal-blue text-white font-bold py-2 px-4 rounded-lg hover:bg-opacity-90">
          <i className="fas fa-plus mr-2"></i> Nova Campanha
        </button>
      </div>

      {isLoading ? <p>Carregando campanhas...</p> : (
        <div className="max-h-96 overflow-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400 sticky top-0">
              <tr>
                <th scope="col" className="px-6 py-3">Nome da Campanha</th>
                <th scope="col" className="px-6 py-3">Status</th>
                <th scope="col" className="px-6 py-3">Período</th>
                <th scope="col" className="px-6 py-3">Nº de Testes</th>
                <th scope="col" className="px-6 py-3">Ações</th>
              </tr>
            </thead>
            <tbody>
              {campaigns.length > 0 ? campaigns.map((campaign) => {
                const status = getStatus(campaign.start_date, campaign.end_date);
                return (
                  <tr key={campaign.id} className="border-b dark:border-gray-700">
                    <td className="px-6 py-4 font-medium text-dark-text dark:text-white">{campaign.title}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${status.color}`}>
                        {status.text}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-xs">
                        {new Date(campaign.start_date).toLocaleDateString('pt-BR')} - {new Date(campaign.end_date).toLocaleDateString('pt-BR')}
                    </td>
                    <td className="px-6 py-4">{campaign.campaign_tests.length}</td>
                    <td className="px-6 py-4 space-x-3">
                      <button onClick={() => addToast({title: "Em Breve", message: "A visualização de resultados da campanha está em desenvolvimento.", type: 'error'})} className="font-medium text-green-600 hover:underline">Resultados</button>
                      <button onClick={() => handleOpenModal(campaign)} className="font-medium text-blue-600 dark:text-blue-500 hover:underline">Editar</button>
                      <button onClick={() => handleDeleteClick(campaign)} disabled={isPending} className="font-medium text-red-600 dark:text-red-500 hover:underline disabled:opacity-50">Excluir</button>
                    </td>
                  </tr>
                );
              }) : (
                <tr>
                    <td colSpan={5} className="text-center py-8 text-gray-500">Nenhuma campanha criada ainda.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
    </>
  );
};

export default CampaignManager;