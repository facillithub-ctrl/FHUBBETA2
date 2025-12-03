// CAMINHO: src/app/stories/page.tsx
import { redirect } from 'next/navigation';
import createClient from '@/utils/supabase/server';
import Link from 'next/link';

export default async function StoriesPage() {
  const supabase = await createClient();
  
  // Verifica autenticação (obrigatório ter conta)
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) {
    redirect('/login?next=/stories');
  }

  // Busca perfil básico para o header
  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name, avatar_url')
    .eq('id', user.id)
    .single();

  return (
    <div className="min-h-screen bg-[#FAFAFA]">
      {/* Header Simplificado do Stories (Estilo Rede Social) */}
      <header className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm px-4 py-3">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <Link href="/dashboard" className="flex items-center gap-2 text-gray-500 hover:text-brand-purple transition-colors">
            <i className="fas fa-arrow-left"></i>
            <span className="hidden sm:inline">Voltar ao Hub</span>
          </Link>
          
          <h1 className="text-xl font-bold text-brand-purple flex items-center gap-2">
            <i className="fas fa-book-reader"></i> Facillit Stories
          </h1>

          <div className="flex items-center gap-3">
            <span className="text-sm font-medium text-gray-700 hidden sm:block">
              {profile?.full_name?.split(' ')[0]}
            </span>
            <div className="w-8 h-8 rounded-full bg-gray-200 overflow-hidden border border-gray-300">
               {profile?.avatar_url ? (
                 <img src={profile.avatar_url} alt="Perfil" className="w-full h-full object-cover" />
               ) : (
                 <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">
                   <i className="fas fa-user"></i>
                 </div>
               )}
            </div>
          </div>
        </div>
      </header>

      {/* Layout de Feed (3 Colunas: Menu, Feed, Sugestões) */}
      <main className="max-w-5xl mx-auto pt-6 px-4 grid grid-cols-1 md:grid-cols-4 gap-6">
        
        {/* Sidebar Esquerda (Menu) */}
        <aside className="hidden md:block space-y-4">
           <nav className="bg-white rounded-xl shadow-sm p-4 border border-gray-100 sticky top-24">
             <ul className="space-y-2">
               <li>
                 <a href="#" className="flex items-center gap-3 px-3 py-2 rounded-lg bg-brand-purple/10 text-brand-purple font-bold">
                   <i className="fas fa-home w-5"></i> Feed
                 </a>
               </li>
               <li>
                 <a href="#" className="flex items-center gap-3 px-3 py-2 rounded-lg text-gray-600 hover:bg-gray-50 transition-colors">
                   <i className="fas fa-compass w-5"></i> Explorar
                 </a>
               </li>
               <li>
                 <a href="#" className="flex items-center gap-3 px-3 py-2 rounded-lg text-gray-600 hover:bg-gray-50 transition-colors">
                   <i className="fas fa-users w-5"></i> Comunidades
                 </a>
               </li>
               <hr className="border-gray-100 my-2" />
               <p className="px-3 text-xs font-bold text-gray-400 uppercase mb-2">Minhas Listas</p>
               <li>
                 <a href="#" className="flex items-center justify-between px-3 py-2 rounded-lg text-gray-600 hover:bg-gray-50 transition-colors text-sm">
                   <span>📖 Lendo Agora</span>
                   <span className="bg-gray-100 text-gray-500 text-xs px-2 py-0.5 rounded-full">3</span>
                 </a>
               </li>
               <li>
                 <a href="#" className="flex items-center justify-between px-3 py-2 rounded-lg text-gray-600 hover:bg-gray-50 transition-colors text-sm">
                   <span>✅ Lidos</span>
                   <span className="bg-gray-100 text-gray-500 text-xs px-2 py-0.5 rounded-full">12</span>
                 </a>
               </li>
             </ul>
           </nav>
        </aside>

        {/* Coluna Central (Feed) */}
        <div className="md:col-span-2 space-y-6">
           {/* Criar Post */}
           <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-100">
             <div className="flex gap-3">
               <div className="w-10 h-10 rounded-full bg-gray-200 flex-shrink-0"></div>
               <input 
                 type="text" 
                 placeholder="Começou a ler algo novo? Conte para todos..." 
                 className="flex-1 bg-gray-50 rounded-full px-4 text-sm focus:outline-none focus:ring-2 focus:ring-brand-purple/20 transition-all"
               />
             </div>
             <div className="flex justify-between items-center mt-3 pt-3 border-t border-gray-50">
               <div className="flex gap-2 text-gray-400 text-sm">
                 <button className="hover:text-brand-purple"><i className="fas fa-image"></i></button>
                 <button className="hover:text-brand-purple"><i className="fas fa-book"></i></button>
               </div>
               <button className="px-4 py-1.5 bg-brand-purple text-white text-sm font-bold rounded-full hover:bg-brand-dark transition-colors">
                 Publicar
               </button>
             </div>
           </div>

           {/* Placeholder de Posts */}
           <div className="text-center py-10">
             <div className="inline-block p-4 rounded-full bg-gray-100 text-gray-400 text-2xl mb-3">
               <i className="fas fa-stream"></i>
             </div>
             <h3 className="text-gray-600 font-medium">Seu feed está silencioso</h3>
             <p className="text-sm text-gray-400 mt-1">Siga leitores ou entre em comunidades para ver atualizações.</p>
           </div>
        </div>

        {/* Sidebar Direita (Recomendações) */}
        <aside className="hidden md:block space-y-4">
           <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-100 sticky top-24">
             <h3 className="font-bold text-dark-text mb-4 text-sm">Sugestões para você</h3>
             <div className="space-y-4">
               {/* Item Sugestão */}
               <div className="flex items-center gap-3">
                 <div className="w-10 h-10 rounded bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold text-xs">
                    SCI-FI
                 </div>
                 <div className="flex-1 min-w-0">
                   <p className="text-sm font-bold truncate">Ficção Científica</p>
                   <p className="text-xs text-gray-400">Comunidade Global</p>
                 </div>
                 <button className="text-brand-purple hover:bg-brand-purple/10 p-1.5 rounded-full transition-colors">
                   <i className="fas fa-plus"></i>
                 </button>
               </div>
               
               <div className="flex items-center gap-3">
                 <div className="w-10 h-10 rounded bg-pink-100 flex items-center justify-center text-pink-600 font-bold text-xs">
                    ROM
                 </div>
                 <div className="flex-1 min-w-0">
                   <p className="text-sm font-bold truncate">Clube do Romance</p>
                   <p className="text-xs text-gray-400">Comunidade Global</p>
                 </div>
                 <button className="text-brand-purple hover:bg-brand-purple/10 p-1.5 rounded-full transition-colors">
                   <i className="fas fa-plus"></i>
                 </button>
               </div>
             </div>
             <button className="w-full mt-4 text-xs font-bold text-brand-purple hover:underline">Ver tudo</button>
           </div>
        </aside>

      </main>
    </div>
  );
}