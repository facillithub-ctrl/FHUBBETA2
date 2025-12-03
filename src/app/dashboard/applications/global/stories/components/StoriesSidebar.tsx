// CAMINHO: src/app/dashboard/applications/global/stories/components/StoriesSidebar.tsx
import Link from 'next/link';

export default function StoriesSidebar() {
  return (
    <div className="hidden lg:block lg:col-span-3 space-y-6">
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 sticky top-6">
        <nav className="space-y-1">
          <Link href="/dashboard/applications/global/stories" className="flex items-center gap-3 px-4 py-3 rounded-lg bg-brand-purple/10 text-brand-purple font-bold border-l-4 border-brand-purple">
            <i className="fas fa-home w-5 text-center"></i> Feed Global
          </Link>
          <a href="#" className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-600 hover:bg-gray-50 transition-colors">
             <i className="fas fa-compass w-5 text-center"></i> Explorar
          </a>
        </nav>
        
        <hr className="my-4 border-gray-100" />
        
        <h3 className="font-bold text-gray-400 text-xs uppercase tracking-wider mb-3 px-4">Minhas Listas</h3>
        <ul className="space-y-1">
           <li className="flex justify-between items-center px-4 py-2 hover:bg-gray-50 rounded-lg cursor-pointer group">
              <span className="text-sm text-gray-600 font-medium flex items-center gap-2">
                 <span className="w-2 h-2 rounded-full bg-green-400"></span> Lendo
              </span>
              <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">3</span>
           </li>
           {/* Adicione mais listas aqui dinamicamente se quiser */}
        </ul>
      </div>
    </div>
  );
}