import createClient from '@/utils/supabase/server';
import { createNewDocument, deleteDocument } from './actions';
import Link from 'next/link';
import { FileText, Plus, Clock, MoreVertical, Trash2 } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function CreateDashboard() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: docs } = await supabase
    .from('facillit_create_documents')
    .select('id, title, updated_at')
    .eq('user_id', user?.id)
    .order('updated_at', { ascending: false });

  return (
    <div className="animate-in fade-in duration-500">
      <div className="flex justify-between items-end mb-8">
        <div>
          <h1 className="text-3xl font-bold font-dk-lemons text-gray-800">Meus Projetos</h1>
          <p className="text-gray-500 mt-1 font-letters">Gerencie seus resumos e documentos acadêmicos.</p>
        </div>
        
        <form action={createNewDocument}>
          <button type="submit" className="btn-primary flex items-center gap-2 bg-brand-purple text-white px-5 py-2.5 rounded-lg hover:bg-purple-800 transition shadow-md font-medium">
            <Plus size={18} />
            Criar Novo
          </button>
        </form>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {/* Card Criar */}
        <form action={createNewDocument} className="contents">
            <button className="h-64 border-2 border-dashed border-gray-300 rounded-xl flex flex-col items-center justify-center text-gray-400 hover:text-brand-purple hover:border-brand-purple hover:bg-purple-50 transition-all bg-white group cursor-pointer">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform group-hover:bg-purple-100">
                    <Plus size={32} />
                </div>
                <span className="font-dk-lemons text-lg">Documento em Branco</span>
            </button>
        </form>

        {/* Lista de Docs */}
        {docs?.map((doc) => (
          <div key={doc.id} className="h-64 bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-lg transition-all flex flex-col relative group overflow-hidden">
             <Link href={`/dashboard/applications/create/${doc.id}`} className="flex-1 p-6 flex flex-col">
                <div className="flex-1 flex items-center justify-center">
                   {/* Preview visual simplificado */}
                   <div className="w-full h-full bg-gray-50 rounded border border-gray-100 p-3 overflow-hidden opacity-50 group-hover:opacity-100 transition-opacity">
                      <div className="w-2/3 h-2 bg-gray-200 rounded mb-2"/>
                      <div className="w-full h-2 bg-gray-200 rounded mb-2"/>
                      <div className="w-full h-2 bg-gray-200 rounded mb-2"/>
                      <div className="w-1/2 h-2 bg-gray-200 rounded"/>
                   </div>
                </div>
                <div className="mt-4">
                  <h3 className="font-semibold text-gray-800 truncate" title={doc.title}>
                    {doc.title || 'Sem Título'}
                  </h3>
                  <div className="flex items-center gap-1 text-xs text-gray-400 mt-1">
                    <Clock size={12} />
                    <span>{new Date(doc.updated_at).toLocaleDateString()}</span>
                  </div>
                </div>
             </Link>
             
             {/* Ações Rápidas */}
             <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <form action={async () => { 'use server'; await deleteDocument(doc.id) }}>
                    <button className="p-2 hover:bg-red-50 text-gray-400 hover:text-red-500 rounded-lg transition-colors" title="Excluir">
                        <Trash2 size={16} />
                    </button>
                </form>
             </div>
          </div>
        ))}
      </div>
    </div>
  );
}