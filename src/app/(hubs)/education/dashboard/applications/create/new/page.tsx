'use client';

import { useEffect, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { createNewDocument } from '../actions';
import { Loader2 } from 'lucide-react';

export default function NewDocumentPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const type = searchParams.get('type') || 'doc';
  const hasCreated = useRef(false);

  useEffect(() => {
    if (hasCreated.current) return;
    hasCreated.current = true;

    const init = async () => {
      try {
        // Cria no banco de dados (Gera UUID real)
        const doc = await createNewDocument(type, 'Sem Título');
        
        // Redireciona para a página de edição com o UUID válido
        if (doc && doc.id) {
          router.replace(`/dashboard/applications/create/${doc.id}`);
        }
      } catch (error) {
        console.error('Erro ao criar documento:', error);
        // Fallback em caso de erro
        router.push('/dashboard/applications/create');
      }
    };

    init();
  }, [type, router]);

  return (
    <div className="h-screen flex flex-col items-center justify-center bg-[#F8F9FA] dark:bg-[#09090B]">
      <Loader2 className="w-8 h-8 animate-spin text-blue-600 mb-4" />
      <p className="text-zinc-500 font-medium animate-pulse">Preparando seu ambiente de criação...</p>
    </div>
  );
}