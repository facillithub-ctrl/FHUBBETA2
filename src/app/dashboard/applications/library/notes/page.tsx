// src/app/dashboard/applications/library/notes/page.tsx
import { createLibraryServerClient } from '@/lib/librarySupabase';
import createClient from '@/utils/supabase/server';

export default async function NotesPage() {
  const authClient = await createClient();
  const { data: { user } } = await authClient.auth.getUser();
  const libDb = createLibraryServerClient();
  
  const { data: notes } = await libDb
    .from('user_repository_items')
    .select('*')
    .eq('user_id', user?.id)
    .eq('type', 'note')
    .order('updated_at', { ascending: false });

  return (
    <div className="max-w-5xl mx-auto px-6 h-full flex flex-col">
      <header className="mb-6 flex justify-between items-center py-4">
        <h1 className="text-2xl font-bold text-gray-900">Minhas Anotações</h1>
        <button className="bg-yellow-400 text-black px-4 py-2 rounded-lg font-bold text-sm shadow-sm hover:bg-yellow-500 transition-colors flex items-center gap-2">
          <i className="fas fa-plus"></i> Nova Nota
        </button>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 auto-rows-max">
        {notes?.map((note) => (
          <div key={note.id} className="bg-yellow-50 p-5 rounded-xl shadow-sm hover:shadow-md transition-shadow cursor-pointer border border-yellow-100 group relative min-h-[200px] flex flex-col">
            <h3 className="font-bold text-gray-800 mb-2 truncate pr-6">{note.title}</h3>
            <p className="text-sm text-gray-600 line-clamp-6 flex-1 font-handwriting">
              {note.text_content || 'Sem conteúdo...'}
            </p>
            <div className="text-[10px] text-gray-400 mt-4 text-right">
              {new Date(note.updated_at).toLocaleDateString()}
            </div>
            
            <button className="absolute top-4 right-4 text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity">
              <i className="fas fa-trash"></i>
            </button>
          </div>
        ))}
        
        {/* Empty State Card (New Note) */}
        <div className="border-2 border-dashed border-gray-200 p-5 rounded-xl flex flex-col items-center justify-center text-gray-400 cursor-pointer hover:border-royal-blue hover:text-royal-blue transition-colors min-h-[200px]">
          <i className="fas fa-plus-circle text-2xl mb-2"></i>
          <span className="text-sm font-medium">Criar nota rápida</span>
        </div>
      </div>
    </div>
  );
}