import createClient from '@/utils/supabase/server';
import { createNewDocument, deleteDocument } from './actions';
import Link from 'next/link';
import { 
  FileText, Plus, Clock, MoreHorizontal, 
  Presentation, Network, Trash2, Search 
} from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function CreateDashboard() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: docs } = await supabase
    .from('facillit_create_documents')
    .select('id, title, updated_at, plain_text') // plain_text pode ser usado para preview curto
    .eq('user_id', user?.id)
    .order('updated_at', { ascending: false });

  return (
    <div className="space-y-10">
      
      {/* Seção de Boas-vindas e Ações Rápidas */}
      <section className="bg-brand-gradient rounded-3xl p-8 md:p-12 text-white shadow-xl shadow-purple-900/10 relative overflow-hidden">
        {/* Elementos decorativos de fundo */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-16 -mt-16 blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-purple-500/20 rounded-full -ml-10 -mb-10 blur-2xl"></div>

        <div className="relative z-10">
           <h2 className="font-dk-lemons text-3xl md:text-4xl mb-2">O que vamos criar hoje?</h2>
           <p className="font-letters text-purple-100 text-lg max-w-xl">
             Selecione uma ferramenta para materializar seu conhecimento. Construa resumos, slides ou mapas mentais.
           </p>

           <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
              {/* Card Criar Resumo (Funcional) */}
              <form action={createNewDocument} className="w-full">
                <button type="submit" className="w-full bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/20 p-4 rounded-2xl flex items-center gap-4 text-left transition-all hover:scale-[1.02] group">
                   <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center text-brand-purple shadow-lg group-hover:rotate-6 transition-transform">
                      <FileText size={24} />
                   </div>
                   <div>
                      <span className="block font-bold">Novo Resumo</span>
                      <span className="text-xs text-purple-200">Editor de texto rico</span>
                   </div>
                </button>
              </form>

              {/* Card Criar Slide (Placeholder Visual) */}
              <button className="w-full bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/20 p-4 rounded-2xl flex items-center gap-4 text-left transition-all hover:scale-[1.02] group cursor-not-allowed opacity-70">
                 <div className="w-12 h-12 bg-blue-400 rounded-xl flex items-center justify-center text-white shadow-lg group-hover:rotate-6 transition-transform">
                    <Presentation size={24} />
                 </div>
                 <div>
                    <span className="block font-bold">Apresentação</span>
                    <span className="text-xs text-purple-200">Em breve</span>
                 </div>
              </button>

              {/* Card Criar Mapa Mental (Placeholder Visual) */}
              <button className="w-full bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/20 p-4 rounded-2xl flex items-center gap-4 text-left transition-all hover:scale-[1.02] group cursor-not-allowed opacity-70">
                 <div className="w-12 h-12 bg-emerald-400 rounded-xl flex items-center justify-center text-white shadow-lg group-hover:rotate-6 transition-transform">
                    <Network size={24} />
                 </div>
                 <div>
                    <span className="block font-bold">Mapa Mental</span>
                    <span className="text-xs text-purple-200">Em breve</span>
                 </div>
              </button>
           </div>
        </div>
      </section>

      {/* Seção de Projetos Recentes */}
      <section>
        <div className="flex items-center justify-between mb-6">
           <h3 className="font-dk-lemons text-2xl text-gray-800">Seus Projetos</h3>
           <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
              <input 
                 type="text" 
                 placeholder="Buscar..." 
                 className="pl-9 pr-4 py-2 bg-white border border-gray-200 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-brand-purple/20 focus:border-brand-purple w-64"
              />
           </div>
        </div>

        {(!docs || docs.length === 0) ? (
           <div className="text-center py-20 bg-white rounded-3xl border-2 border-dashed border-gray-100">
              <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-300">
                 <FileText size={40} />
              </div>
              <p className="font-dk-lemons text-gray-400 text-lg">Nenhum projeto ainda</p>
              <p className="font-letters text-gray-400">Comece criando um resumo incrível acima.</p>
           </div>
        ) : (
           <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {docs.map((doc) => (
                <div key={doc.id} className="group relative bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col h-72 overflow-hidden">
                   
                   {/* Área de Preview do Documento */}
                   <Link href={`/dashboard/applications/create/${doc.id}`} className="flex-1 bg-gray-50/50 p-6 relative overflow-hidden cursor-pointer">
                      <div className="w-full h-full bg-white shadow-sm border border-gray-100 rounded-lg p-4 transform group-hover:scale-105 transition-transform duration-500">
                         {/* Miniatura do Texto (Simulada) */}
                         <div className="space-y-2 opacity-40">
                            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                            <div className="h-3 bg-gray-100 rounded w-full"></div>
                            <div className="h-3 bg-gray-100 rounded w-full"></div>
                            <div className="h-3 bg-gray-100 rounded w-5/6"></div>
                            <div className="h-3 bg-gray-100 rounded w-full"></div>
                         </div>
                      </div>
                      
                      {/* Badge do Tipo */}
                      <div className="absolute top-3 right-3 bg-white/90 backdrop-blur px-2 py-1 rounded-md text-[10px] font-bold text-brand-purple border border-purple-100 shadow-sm">
                         DOC
                      </div>
                   </Link>

                   {/* Rodapé do Card */}
                   <div className="p-4 bg-white border-t border-gray-50 flex items-center justify-between relative z-10">
                      <div className="overflow-hidden">
                         <h4 className="font-bold text-gray-800 truncate text-sm" title={doc.title}>
                            {doc.title || 'Sem Título'}
                         </h4>
                         <div className="flex items-center gap-1 text-[10px] text-gray-400 mt-0.5">
                            <Clock size={10} />
                            <span>Editado em {new Date(doc.updated_at).toLocaleDateString()}</span>
                         </div>
                      </div>

                      {/* Botão de Opções / Excluir */}
                      <div className="flex items-center gap-1">
                          <form action={async () => { 'use server'; await deleteDocument(doc.id) }}>
                             <button className="p-1.5 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors" title="Excluir">
                                <Trash2 size={16} />
                             </button>
                          </form>
                      </div>
                   </div>
                </div>
              ))}
           </div>
        )}
      </section>
    </div>
  );
}