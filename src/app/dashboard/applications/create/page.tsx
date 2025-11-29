// CORREÇÃO AQUI: Importação sem chaves (Default Import)
import createClient from '@/utils/supabase/server'; 
import { createNewDocument } from './actions';
import Link from 'next/link';
import { FileText, Plus, Clock, Layout } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function CreateDashboard() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  // Busca os documentos do usuário
  const { data: docs } = await supabase
    .from('facillit_create_documents')
    .select('id, title, updated_at')
    .eq('user_id', user?.id)
    .order('updated_at', { ascending: false });

  return (
    <div className="p-8 max-w-7xl mx-auto min-h-screen">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
        <div>
          <h1 className="text-4xl font-multiara text-brand-purple mb-2">Facillit Create</h1>
          <p className="text-gray-600 font-letters text-lg">Seu estúdio criativo de resumos acadêmicos.</p>
        </div>
        
        <form action={createNewDocument}>
          <button 
            type="submit" 
            className="bg-brand-purple hover:bg-purple-800 text-white px-6 py-3 rounded-xl flex items-center gap-2 shadow-lg hover:shadow-xl transition-all font-bold"
          >
            <Plus size={20} />
            Novo Resumo
          </button>
        </form>
      </header>

      {/* Grid de Documentos */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
        
        {/* Card Criar Novo */}
        <form action={createNewDocument} className="contents">
            <button className="border-2 border-dashed border-gray-300 rounded-xl flex flex-col items-center justify-center text-gray-400 hover:text-brand-purple hover:border-brand-purple hover:bg-purple-50 transition-all h-64 bg-white/50 cursor-pointer">
                <div className="bg-gray-100 p-4 rounded-full mb-3 group-hover:bg-purple-100 transition-colors">
                    <Plus size={32} className="opacity-50" />
                </div>
                <span className="font-medium font-letters text-lg">Criar em Branco</span>
            </button>
        </form>

        {/* Lista */}
        {docs?.map((doc) => (
          <Link href={`/dashboard/applications/create/${doc.id}`} key={doc.id}>
            <div className="group bg-white rounded-xl p-6 border border-gray-200 hover:border-brand-purple hover:shadow-md transition-all h-64 flex flex-col justify-between relative overflow-hidden cursor-pointer">
              <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-bl from-purple-100 to-transparent rounded-bl-full -mr-8 -mt-8 transition-all group-hover:from-purple-200" />
              
              <div className="mt-2 relative z-10">
                <div className="w-12 h-12 bg-purple-50 rounded-xl flex items-center justify-center text-brand-purple mb-4 group-hover:scale-110 transition-transform shadow-sm">
                  <FileText size={24} />
                </div>
                <h3 className="font-dk-lemons text-xl text-gray-800 line-clamp-2 leading-tight group-hover:text-brand-purple transition-colors">
                  {doc.title || 'Sem Título'}
                </h3>
              </div>
              
              <div className="flex items-center gap-2 text-xs text-gray-400 mt-4 border-t pt-3">
                <Clock size={12} />
                <span>{new Date(doc.updated_at).toLocaleDateString()}</span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}