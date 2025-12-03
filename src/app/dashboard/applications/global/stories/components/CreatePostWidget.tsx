// CAMINHO: src/app/dashboard/applications/global/stories/components/CreatePostWidget.tsx
"use client";

import { createPost } from '../actions';
import { useRef } from 'react';

export default function CreatePostWidget({ userAvatar }: { userAvatar?: string | null }) {
  const formRef = useRef<HTMLFormElement>(null);

  const handleSubmit = async (formData: FormData) => {
    await createPost(formData);
    formRef.current?.reset();
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-6">
      <form ref={formRef} action={handleSubmit}>
        <div className="flex gap-4">
          <div className="w-10 h-10 rounded-full bg-gray-200 flex-shrink-0 overflow-hidden">
            {userAvatar ? (
               <img src={userAvatar} alt="User" className="w-full h-full object-cover" />
            ) : (
               <div className="w-full h-full flex items-center justify-center"><i className="fas fa-user text-gray-400"></i></div>
            )}
          </div>
          <div className="flex-1">
            <input 
              name="content"
              type="text" 
              placeholder="Que história você está vivendo hoje?" 
              className="w-full bg-gray-50 hover:bg-gray-100 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-purple/20 focus:bg-white transition-all"
              required
            />
          </div>
        </div>
        <div className="flex justify-between items-center mt-3 pt-2 border-t border-gray-50">
           <div className="flex gap-1 text-gray-400">
             <button type="button" className="p-2 hover:bg-brand-purple/5 hover:text-brand-purple rounded-lg transition-colors"><i className="fas fa-book"></i></button>
             <button type="button" className="p-2 hover:bg-brand-purple/5 hover:text-brand-purple rounded-lg transition-colors"><i className="fas fa-image"></i></button>
           </div>
           <button type="submit" className="px-4 py-1.5 bg-brand-purple text-white text-sm font-bold rounded-full hover:bg-brand-dark transition-colors">
             Publicar
           </button>
        </div>
      </form>
    </div>
  );
}