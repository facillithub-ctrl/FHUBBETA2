"use client";
import Image from 'next/image';
import Link from 'next/link';
import { UserProfile } from '../types';

interface StoryCircle {
  id: string;
  user: { avatar_url: string | null; name: string; username: string };
  hasUnseen: boolean;
}

// Dados mockados para os círculos de stories
const mockStories: StoryCircle[] = [
    { id: '1', user: { avatar_url: '/assets/images/time/pedro.JPG', name: 'Pedro', username: 'pedro_r' }, hasUnseen: true },
    { id: '2', user: { avatar_url: '/assets/images/time/igor.jpg', name: 'Igor', username: 'igor_dev' }, hasUnseen: false },
    { id: '3', user: { avatar_url: null, name: 'Comunidade', username: 'community' }, hasUnseen: true },
    { id: '4', user: { avatar_url: null, name: 'Facillit', username: 'facillit' }, hasUnseen: false },
    // Adicionar mais, se necessário
];

export default function StoriesBar({ currentUser }: { currentUser: UserProfile | null }) {
  const userAvatar = currentUser?.avatar_url || '/assets/images/accont.svg';

  return (
    <div className="flex space-x-6 overflow-x-auto scrollbar-hide px-4 sm:px-6 py-2">
      
      {/* Botão de Criação/Meu Story */}
      <div className="flex flex-col items-center flex-shrink-0 cursor-pointer group">
         <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center border-2 border-dashed border-gray-300 relative overflow-hidden transition-all group-hover:scale-105">
            {currentUser?.avatar_url ? (
               <Image src={userAvatar} alt="Seu Story" fill className="object-cover rounded-full" />
            ) : (
               <i className="fas fa-plus text-lg text-gray-500"></i>
            )}
            {/* Círculo + para indicar que pode postar */}
            <div className="absolute bottom-0 right-0 w-5 h-5 bg-white border-2 border-white rounded-full flex items-center justify-center text-brand-purple">
               <i className="fas fa-plus text-xs"></i>
            </div>
         </div>
         <span className="text-xs font-medium text-gray-700 mt-1.5">Seu Story</span>
      </div>

      {/* Stories Fixos Solicitados (Links de Navegação) */}
      <Link href="/dashboard/notifications" className="flex flex-col items-center flex-shrink-0 cursor-pointer group pt-1">
          <div className="w-14 h-14 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 transition-all group-hover:scale-105 border-4 border-white shadow-sm">
             <i className="far fa-bell text-2xl"></i>
          </div>
          <span className="text-xs font-medium text-gray-600 mt-1.5">Alertas</span>
      </Link>
      
      <Link href="/dashboard/saved" className="flex flex-col items-center flex-shrink-0 cursor-pointer group pt-1">
          <div className="w-14 h-14 rounded-full bg-yellow-50 flex items-center justify-center text-yellow-600 transition-all group-hover:scale-105 border-4 border-white shadow-sm">
             <i className="far fa-bookmark text-2xl"></i>
          </div>
          <span className="text-xs font-medium text-gray-600 mt-1.5">Salvos</span>
      </Link>

      {/* Stories Mockados */}
      {mockStories.map(story => (
         <div key={story.id} className="flex flex-col items-center flex-shrink-0 cursor-pointer group">
             <div className={`w-16 h-16 rounded-full p-[2px] relative transition-all group-hover:scale-105 ${story.hasUnseen ? 'bg-gradient-to-tr from-brand-purple to-brand-green' : 'bg-gray-200'}`}>
                 <div className="w-full h-full bg-white rounded-full p-[2px]">
                    <div className="w-full h-full rounded-full bg-gray-100 flex items-center justify-center relative overflow-hidden">
                       {story.user.avatar_url ? (
                           <Image src={story.user.avatar_url} alt={story.user.name} fill className="object-cover rounded-full" />
                       ) : (
                           <i className="fas fa-user text-xl text-gray-400"></i>
                       )}
                    </div>
                 </div>
             </div>
             <span className="text-xs font-medium text-gray-700 mt-1.5">{story.user.name.split(' ')[0]}</span>
         </div>
      ))}
    </div>
  );
}