// src/app/dashboard/applications/library/components/FileCard.tsx
import { LibraryItem } from '../types';

export default function FileCard({ item }: { item: LibraryItem }) {
  
  // Helper para ícones e cores
  const getIconInfo = (type: string) => {
    switch(type) {
      case 'folder': return { icon: 'fa-folder', color: 'text-yellow-400', bg: 'bg-yellow-50' };
      case 'pdf': return { icon: 'fa-file-pdf', color: 'text-red-500', bg: 'bg-red-50' };
      case 'doc': return { icon: 'fa-file-word', color: 'text-blue-500', bg: 'bg-blue-50' };
      case 'image': return { icon: 'fa-file-image', color: 'text-purple-500', bg: 'bg-purple-50' };
      case 'video': return { icon: 'fa-file-video', color: 'text-pink-500', bg: 'bg-pink-50' };
      case 'note': return { icon: 'fa-sticky-note', color: 'text-amber-500', bg: 'bg-amber-50' };
      default: return { icon: 'fa-file', color: 'text-gray-400', bg: 'bg-gray-50' };
    }
  };

  const { icon, color, bg } = getIconInfo(item.type);

  return (
    <div className="group relative bg-white border border-gray-100 rounded-xl p-4 hover:shadow-md transition-all duration-200 cursor-pointer hover:border-blue-200">
      
      {/* Menu de Contexto (Aparece no Hover) */}
      <button className="absolute top-2 right-2 text-gray-300 hover:text-gray-600 opacity-0 group-hover:opacity-100 transition-opacity p-1">
        <i className="fas fa-ellipsis-v"></i>
      </button>

      {/* Ícone */}
      <div className={`w-10 h-10 rounded-lg ${bg} flex items-center justify-center mb-3`}>
        <i className={`fas ${icon} ${color} text-lg`}></i>
      </div>

      {/* Infos */}
      <div className="space-y-1">
        <h4 className="text-sm font-medium text-gray-800 truncate" title={item.title}>
          {item.title}
        </h4>
        <div className="flex items-center justify-between text-[10px] text-gray-400">
          <span>{item.type === 'folder' ? 'Pasta' : item.size}</span>
          {/* Mostra data relativa ou "Hoje" */}
          <span>há 2d</span> 
        </div>
      </div>
    </div>
  );
}