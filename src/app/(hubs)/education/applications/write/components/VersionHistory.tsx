"use client";

import { useEffect, useState } from 'react';
import createClient from '@/utils/supabase/client';

type EssayVersion = {
  id: string;
  created_at: string;
  version_number: number;
  content: string;
};

type Props = {
  essayId: string;
  onSelectVersion: (content: string) => void;
};

async function getEssayVersions(essayId: string): Promise<EssayVersion[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('essay_versions')
    .select('*')
    .eq('essay_id', essayId)
    .order('version_number', { ascending: false });

  if (error) {
    console.error('Erro ao buscar versões:', error);
    return [];
  }
  return data;
}


export default function VersionHistory({ essayId, onSelectVersion }: Props) {
  const [versions, setVersions] = useState<EssayVersion[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchVersions = async () => {
      setIsLoading(true);
      const data = await getEssayVersions(essayId);
      setVersions(data);
      setIsLoading(false);
    };

    fetchVersions();
  }, [essayId]);

  return (
    <div className="mt-6 p-4 border rounded-lg bg-gray-50 dark:bg-dark-card/50">
      <h3 className="font-bold text-lg mb-3 dark:text-white-text">Histórico de Versões</h3>
      {isLoading ? (
        <p className="text-sm text-text-muted">Carregando histórico...</p>
      ) : versions.length > 0 ? (
        <ul className="space-y-2 max-h-48 overflow-y-auto">
          {versions.map((version) => (
            <li key={version.id} className="flex justify-between items-center p-2 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700">
              <div>
                <span className="font-semibold text-sm">Versão {version.version_number}</span>
                <span className="text-xs text-text-muted ml-2">
                  {new Date(version.created_at).toLocaleString('pt-BR')}
                </span>
              </div>
              <div>
                <button className="text-xs font-medium text-gray-500 mr-3" disabled>Comparar</button>
                <button
                  onClick={() => onSelectVersion(version.content)}
                  className="text-xs font-medium text-royal-blue hover:underline"
                >
                  Restaurar
                </button>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-sm text-text-muted">Nenhuma versão anterior salva.</p>
      )}
    </div>
  );
}