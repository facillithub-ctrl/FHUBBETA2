// CAMINHO: src/app/dashboard/applications/global/stories/components/CreateReviewModal.tsx
"use client";

import { useState } from 'react';
import Image from 'next/image';
import { UserProfile, BookReviewPost } from '../types';

export default function CreateReviewModal({ 
  isOpen, 
  onClose, 
  currentUser, 
  onPostCreate 
}: { 
  isOpen: boolean; 
  onClose: () => void; 
  currentUser: UserProfile; 
  onPostCreate: (post: BookReviewPost) => void; 
}) {
  // --- CORREÇÃO: Hooks movidos para o topo (antes do return) ---
  const [bookTitle, setBookTitle] = useState('');
  const [rating, setRating] = useState(0);
  const [reviewText, setReviewText] = useState('');
  const [progress, setProgress] = useState(0);
  const [totalPages, setTotalPages] = useState(300);
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [characters, setCharacters] = useState<{name: string, role: string}[]>([]);
  const [charName, setCharName] = useState('');
  const [charRole, setCharRole] = useState('');

  // Se não estiver aberto, não renderiza nada (mas os hooks já foram registrados)
  if (!isOpen) return null;

  const mockCover = "https://m.media-amazon.com/images/I/81ym3QUd3KL._AC_UF1000,1000_QL80_.jpg";

  const handleAddTag = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && tagInput.trim()) {
      e.preventDefault();
      setTags([...tags, tagInput.trim()]);
      setTagInput('');
    }
  };

  const handleAddCharacter = () => {
    if (charName.trim()) {
      setCharacters([...characters, { name: charName, role: charRole || 'Personagem' }]);
      setCharName('');
      setCharRole('');
    }
  };

  const handleSubmit = () => {
    const newPost: BookReviewPost = {
      id: Date.now().toString(),
      type: 'review',
      user: currentUser,
      createdAt: 'Agora',
      content: reviewText,
      bookTitle: bookTitle || 'Livro Sem Título',
      bookAuthor: 'Autor Desconhecido',
      bookCover: mockCover,
      rating: rating,
      tags: tags,
      readingProgress: {
        current: progress,
        total: totalPages,
        percentage: Math.round((progress / totalPages) * 100),
        status: progress >= totalPages ? 'Concluído' : 'Lendo'
      },
      characters: characters,
      mediaUrl: mockCover,
      likes: 0,
      commentsCount: 0,
      shares: 0,
      isLiked: false,
      isSaved: false
    };

    onPostCreate(newPost);
    onClose();
    
    // Resetar campos
    setBookTitle('');
    setRating(0);
    setReviewText('');
    setTags([]);
    setCharacters([]);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
      <div className="bg-white w-full max-w-2xl rounded-[2rem] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="px-8 py-5 border-b border-gray-100 flex justify-between items-center bg-white sticky top-0 z-10">
          <h2 className="text-xl font-bold text-dark-text flex items-center gap-2">
            <i className="fas fa-feather-alt text-brand-purple"></i> Nova Avaliação
          </h2>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-gray-50 text-gray-400 hover:bg-gray-100 hover:text-red-500 transition-colors flex items-center justify-center">
            <i className="fas fa-times"></i>
          </button>
        </div>

        {/* Corpo com Scroll */}
        <div className="flex-1 overflow-y-auto p-8 space-y-8 custom-scrollbar">
          
          {/* 1. O Livro */}
          <section className="space-y-4">
             <label className="text-xs font-bold text-gray-400 uppercase tracking-wider block">Qual livro você está lendo?</label>
             <div className="flex gap-6">
                <div className="w-24 h-36 bg-gray-100 rounded-xl flex-shrink-0 relative overflow-hidden border border-gray-200 group cursor-pointer shadow-sm">
                   <Image src={mockCover} alt="Capa" fill className="object-cover" />
                   <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <i className="fas fa-camera text-white text-xl"></i>
                   </div>
                </div>
                <div className="flex-1 space-y-4">
                   <div>
                     <input 
                       type="text" 
                       placeholder="Título do Livro" 
                       className="w-full text-2xl font-bold border-b-2 border-gray-100 focus:border-brand-purple focus:outline-none py-2 bg-transparent placeholder-gray-300 transition-colors"
                       value={bookTitle}
                       onChange={e => setBookTitle(e.target.value)}
                     />
                   </div>
                   <div>
                      <p className="text-xs font-bold text-gray-400 uppercase mb-2">Sua Nota</p>
                      <div className="flex items-center gap-2">
                          {[1, 2, 3, 4, 5].map(star => (
                            <button key={star} onClick={() => setRating(star)} className="text-3xl hover:scale-110 transition-transform focus:outline-none">
                              <i className={`fas fa-star ${rating >= star ? 'text-yellow-400' : 'text-gray-200'}`}></i>
                            </button>
                          ))}
                          {rating > 0 && <span className="text-lg font-bold text-dark-text ml-2">{rating}.0</span>}
                      </div>
                   </div>
                </div>
             </div>
          </section>

          {/* 2. Progresso */}
          <section className="space-y-4 bg-gray-50 p-6 rounded-2xl border border-gray-100">
             <div className="flex justify-between items-center">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Seu Progresso</label>
                <div className="flex items-center gap-2">
                   <span className="text-xs font-bold text-brand-purple bg-brand-purple/10 px-2 py-1 rounded-md">
                      {Math.round((progress/totalPages)*100)}%
                   </span>
                </div>
             </div>
             
             <input 
               type="range" 
               min="0" 
               max={totalPages} 
               value={progress} 
               onChange={e => setProgress(Number(e.target.value))}
               className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-brand-purple"
             />
             
             <div className="flex justify-between text-sm text-gray-600 font-medium pt-1">
                <span>Página 0</span>
                <div className="flex items-center gap-1">
                   <input 
                     type="number" 
                     value={progress} 
                     onChange={e => setProgress(Number(e.target.value))}
                     className="w-16 text-center bg-white rounded-md border border-gray-200 py-1 focus:border-brand-purple outline-none" 
                   /> 
                   <span className="text-gray-400">/ {totalPages}</span>
                </div>
             </div>
          </section>

          {/* 3. A Resenha */}
          <section className="space-y-3">
             <label className="text-xs font-bold text-gray-400 uppercase tracking-wider block">Sua Opinião</label>
             <textarea 
               placeholder="O que você achou da história? Os personagens são cativantes? Escreva sua resenha aqui..." 
               className="w-full h-40 p-5 bg-gray-50 rounded-2xl border border-gray-100 focus:border-brand-purple/50 focus:bg-white focus:ring-4 focus:ring-brand-purple/10 transition-all resize-none text-sm leading-relaxed"
               value={reviewText}
               onChange={e => setReviewText(e.target.value)}
             ></textarea>
          </section>

          {/* 4. Personagens e Tags */}
          <div className="grid md:grid-cols-2 gap-8">
             <section className="space-y-3">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider block">Personagens Marcantes</label>
                <div className="flex gap-2 mb-3">
                   <input 
                     type="text" 
                     placeholder="Nome" 
                     className="flex-1 bg-gray-50 border border-gray-100 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-brand-purple"
                     value={charName}
                     onChange={e => setCharName(e.target.value)}
                   />
                   <button 
                     onClick={handleAddCharacter} 
                     className="w-10 h-10 bg-brand-purple text-white rounded-xl flex items-center justify-center hover:bg-brand-dark transition-colors shadow-md"
                     disabled={!charName.trim()}
                   >
                     <i className="fas fa-plus"></i>
                   </button>
                </div>
                <div className="flex flex-wrap gap-2">
                   {characters.map((char, idx) => (
                      <div key={idx} className="bg-white border border-gray-200 rounded-lg pl-1 pr-3 py-1 flex items-center gap-2 shadow-sm animate-fade-in">
                         <div className="w-6 h-6 rounded-md bg-brand-purple/10 text-xs text-brand-purple flex items-center justify-center font-bold uppercase">
                           {char.name[0]}
                         </div>
                         <div className="text-xs font-bold text-gray-700">{char.name}</div>
                      </div>
                   ))}
                   {characters.length === 0 && <p className="text-xs text-gray-300 italic">Nenhum personagem adicionado</p>}
                </div>
             </section>

             <section className="space-y-3">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider block">Tags</label>
                <div className="relative">
                  <i className="fas fa-hashtag absolute left-4 top-3 text-gray-300 text-sm"></i>
                  <input 
                    type="text" 
                    placeholder="Adicione tags (Enter)" 
                    className="w-full bg-gray-50 border border-gray-100 rounded-xl pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:border-brand-purple"
                    value={tagInput}
                    onChange={e => setTagInput(e.target.value)}
                    onKeyDown={handleAddTag}
                  />
                </div>
                <div className="flex flex-wrap gap-2">
                   {tags.map((tag, i) => (
                      <span key={i} className="bg-white border border-brand-purple/20 text-brand-purple text-xs px-3 py-1.5 rounded-full font-bold shadow-sm animate-fade-in">
                         #{tag}
                      </span>
                   ))}
                   {tags.length === 0 && <p className="text-xs text-gray-300 italic">Nenhuma tag</p>}
                </div>
             </section>
          </div>

        </div>

        {/* Footer Actions */}
        <div className="px-8 py-5 border-t border-gray-100 bg-gray-50 flex justify-between items-center">
           <button onClick={onClose} className="text-gray-500 font-bold text-sm hover:text-dark-text transition-colors">
             Cancelar
           </button>
           <button 
             onClick={handleSubmit} 
             disabled={!bookTitle}
             className="px-8 py-3 bg-gradient-to-r from-brand-purple to-brand-dark text-white font-bold text-sm rounded-xl shadow-lg shadow-brand-purple/20 hover:scale-105 hover:shadow-brand-purple/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
           >
             Publicar no Feed
           </button>
        </div>

      </div>
    </div>
  );
}