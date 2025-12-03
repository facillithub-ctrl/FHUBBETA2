"use client";

import { useState } from 'react';
import { UserProfile, StoryPost, BookPostType } from '../types';

type Props = {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserProfile;
  onPostCreate: (post: Partial<StoryPost>) => void;
};

// Configuração dos Tipos de Post
const POST_TYPES: { id: BookPostType; label: string; icon: string; desc: string }[] = [
  { id: 'review', label: 'Resenha', icon: 'fas fa-book-open', desc: 'Análise aprofundada com nota e texto.' },
  { id: 'rating', label: 'Avaliação Rápida', icon: 'fas fa-star', desc: 'Apenas nota e categorias.' },
  { id: 'recommendation', label: 'Recomendação', icon: 'fas fa-thumbs-up', desc: 'Indique para um público específico.' },
  { id: 'indication', label: 'Indicação', icon: 'fas fa-bullhorn', desc: 'Sugestão simples e direta.' },
  { id: 'promotion', label: 'Promoção', icon: 'fas fa-tag', desc: 'Divulgue ofertas e preços.' },
  { id: 'discussion', label: 'Debate', icon: 'fas fa-comments', desc: 'Levante uma questão para a comunidade.' },
  { id: 'first-impressions', label: '1ª Impressões', icon: 'fas fa-eye', desc: 'Reação inicial e progresso.' },
  { id: 'quote', label: 'Citação', icon: 'fas fa-quote-right', desc: 'Destaque um trecho favorito.' },
  { id: 'technical', label: 'Ficha Técnica', icon: 'fas fa-list-alt', desc: 'Dados técnicos do livro.' },
  { id: 'ranking', label: 'Top Lista', icon: 'fas fa-list-ol', desc: 'Crie um ranking (Top 3, Top 5...)' },
];

export default function CreateReviewModal({ isOpen, onClose, currentUser, onPostCreate }: Props) {
  const [step, setStep] = useState<1 | 2>(1);
  const [selectedType, setSelectedType] = useState<BookPostType>('review');
  const [loading, setLoading] = useState(false);

  // Estado Único para todos os campos
  const [formData, setFormData] = useState({
    title: '',
    author: '', // Mapeado para metadata.author ou subtitle
    content: '',
    rating: 0,
    coverImage: '',
    tags: '',
    // Campos Específicos
    targetAudience: '',
    reasons: ['', '', ''],
    price: '',
    oldPrice: '',
    affiliateLink: '',
    mood: 'Empolgado',
    progress: 0,
    quote: '',
    quotePage: '',
    publisher: '',
    pages: '',
    genre: '',
    rankingItems: [{ position: 1, title: '' }, { position: 2, title: '' }, { position: 3, title: '' }]
  });

  if (!isOpen) return null;

  const handleReasonChange = (index: number, value: string) => {
    const newReasons = [...formData.reasons];
    newReasons[index] = value;
    setFormData({ ...formData, reasons: newReasons });
  };

  const handleRankingChange = (index: number, value: string) => {
    const newItems = [...formData.rankingItems];
    newItems[index].title = value;
    setFormData({ ...formData, rankingItems: newItems });
  };

  const handleSubmit = async () => {
    setLoading(true);
    
    // Constrói o objeto StoryPost baseado no tipo
    const newPost: Partial<StoryPost> = {
      category: 'books',
      type: selectedType,
      title: formData.title,
      content: formData.content,
      coverImage: formData.coverImage || 'https://via.placeholder.com/300x450?text=Capa', // Placeholder se vazio
      tags: formData.tags.split(',').map(t => t.trim()).filter(t => t),
      
      // Metadados Dinâmicos
      metadata: {
        author: formData.author,
        // Promotion
        price: formData.price ? parseFloat(formData.price) : undefined,
        oldPrice: formData.oldPrice ? parseFloat(formData.oldPrice) : undefined,
        // Recommendation
        targetAudience: formData.targetAudience,
        reasons: formData.reasons.filter(r => r),
        // First Impressions
        mood: formData.mood,
        // Technical
        publisher: formData.publisher,
        pages: formData.pages ? parseInt(formData.pages) : undefined,
        genre: formData.genre,
        // Quote
        quote: formData.quote,
        quotePage: formData.quotePage,
        // Ranking
        rankingItems: formData.rankingItems.filter(i => i.title),
      },
      
      // Campos diretos
      rating: selectedType === 'review' || selectedType === 'rating' ? formData.rating : undefined,
      progress: selectedType === 'first-impressions' ? { 
         current: 0, total: 100, percentage: formData.progress, status: 'Lendo' 
      } : undefined,
      
      externalLink: selectedType === 'promotion' ? {
         url: formData.affiliateLink,
         label: 'Ver Oferta'
      } : undefined
    };

    // Ajustes finos
    if (selectedType === 'indication') newPost.tags?.push('Indicação');

    await onPostCreate(newPost);
    setLoading(false);
    setStep(1); // Reset
    setFormData({ ...formData, title: '', content: '' }); // Limpa básico
  };

  // --- RENDERIZADORES DE FORMULÁRIO ---
  
  const renderCommonFields = () => (
    <div className="space-y-4 mb-4">
      <div className="flex gap-4">
          <div className="w-24 h-32 bg-gray-100 rounded-lg flex-shrink-0 flex items-center justify-center border border-dashed border-gray-300 relative overflow-hidden group">
             {formData.coverImage ? (
                <img src={formData.coverImage} alt="Capa" className="w-full h-full object-cover" />
             ) : (
                <div className="text-center p-2">
                   <i className="fas fa-camera text-gray-400"></i>
                   <p className="text-[9px] text-gray-400">URL Capa</p>
                </div>
             )}
             <input 
                type="text" 
                placeholder="Cole URL da imagem" 
                className="absolute inset-0 opacity-0 cursor-pointer"
                onChange={(e) => setFormData({...formData, coverImage: e.target.value})} // Simplificação: input invisível cobre tudo
             />
          </div>
          <div className="flex-1 space-y-3">
             <input 
                className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-purple-500 outline-none"
                placeholder="Título do Livro"
                value={formData.title}
                onChange={e => setFormData({...formData, title: e.target.value})}
             />
             <input 
                className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none"
                placeholder="Autor"
                value={formData.author}
                onChange={e => setFormData({...formData, author: e.target.value})}
             />
          </div>
      </div>
    </div>
  );

  const renderSpecificFields = () => {
    switch(selectedType) {
        case 'review':
        case 'rating':
            return (
               <div className="space-y-4">
                  <div>
                     <label className="text-xs font-bold text-gray-500 uppercase">Sua Nota (0-5)</label>
                     <div className="flex gap-2 mt-1">
                        {[1,2,3,4,5].map(star => (
                           <button key={star} onClick={() => setFormData({...formData, rating: star})} className={`text-2xl ${formData.rating >= star ? 'text-yellow-400' : 'text-gray-200'}`}>★</button>
                        ))}
                     </div>
                  </div>
                  {selectedType === 'review' && (
                     <textarea 
                        className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm h-32 focus:ring-2 focus:ring-purple-500 outline-none resize-none"
                        placeholder="Escreva sua resenha completa..."
                        value={formData.content}
                        onChange={e => setFormData({...formData, content: e.target.value})}
                     />
                  )}
               </div>
            );
        
        case 'recommendation':
            return (
               <div className="space-y-3">
                  <input 
                     className="w-full bg-emerald-50 border border-emerald-100 rounded-lg px-3 py-2 text-sm text-emerald-800 placeholder-emerald-400 outline-none"
                     placeholder="Recomendado para quem? (Ex: Fãs de Suspense)"
                     value={formData.targetAudience}
                     onChange={e => setFormData({...formData, targetAudience: e.target.value})}
                  />
                  <label className="text-xs font-bold text-gray-500 uppercase block mt-2">3 Motivos para ler:</label>
                  {formData.reasons.map((r, i) => (
                     <input 
                        key={i}
                        className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none"
                        placeholder={`Motivo ${i+1}`}
                        value={r}
                        onChange={e => handleReasonChange(i, e.target.value)}
                     />
                  ))}
               </div>
            );

        case 'promotion':
            return (
               <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                     <input 
                        type="number"
                        className="w-full bg-red-50 border border-red-100 rounded-lg px-3 py-2 text-sm text-red-600 font-bold placeholder-red-300 outline-none"
                        placeholder="Preço Atual (R$)"
                        value={formData.price}
                        onChange={e => setFormData({...formData, price: e.target.value})}
                     />
                     <input 
                        type="number"
                        className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none"
                        placeholder="Preço Antigo"
                        value={formData.oldPrice}
                        onChange={e => setFormData({...formData, oldPrice: e.target.value})}
                     />
                  </div>
                  <input 
                     className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none"
                     placeholder="Link da Oferta (Afiliado)"
                     value={formData.affiliateLink}
                     onChange={e => setFormData({...formData, affiliateLink: e.target.value})}
                  />
               </div>
            );

        case 'first-impressions':
            return (
               <div className="space-y-3">
                  <div className="flex justify-between">
                     <label className="text-xs font-bold text-gray-500">Progresso: {formData.progress}%</label>
                  </div>
                  <input 
                     type="range" min="0" max="100" 
                     className="w-full accent-purple-600"
                     value={formData.progress}
                     onChange={e => setFormData({...formData, progress: parseInt(e.target.value)})}
                  />
                  <select 
                     className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none"
                     value={formData.mood}
                     onChange={e => setFormData({...formData, mood: e.target.value})}
                  >
                     <option value="Empolgado">🤩 Empolgado</option>
                     <option value="Confuso">🤔 Confuso</option>
                     <option value="Surpreso">😮 Surpreso</option>
                     <option value="Decepcionado">😞 Decepcionado</option>
                  </select>
                  <textarea 
                     className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm h-24 outline-none resize-none"
                     placeholder="Primeiras impressões..."
                     value={formData.content}
                     onChange={e => setFormData({...formData, content: e.target.value})}
                  />
               </div>
            );

        case 'ranking':
            return (
               <div className="space-y-3">
                  <input 
                     className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm font-bold outline-none"
                     placeholder="Título do Top (Ex: Melhores Vilões)"
                     value={formData.title}
                     onChange={e => setFormData({...formData, title: e.target.value})}
                  />
                  {formData.rankingItems.map((item, i) => (
                     <div key={i} className="flex gap-2 items-center">
                        <span className="font-black text-gray-300 w-6 text-center">{item.position}</span>
                        <input 
                           className="flex-1 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none"
                           placeholder="Nome do Livro/Personagem"
                           value={item.title}
                           onChange={e => handleRankingChange(i, e.target.value)}
                        />
                     </div>
                  ))}
               </div>
            );

        case 'quote':
            return (
               <div className="space-y-3">
                   <textarea 
                     className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-lg font-serif italic text-gray-600 h-32 outline-none resize-none text-center"
                     placeholder='"Digite a citação aqui..."'
                     value={formData.quote}
                     onChange={e => setFormData({...formData, quote: e.target.value})}
                  />
                  <input 
                     className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-xs text-center outline-none"
                     placeholder="Página / Capítulo"
                     value={formData.quotePage}
                     onChange={e => setFormData({...formData, quotePage: e.target.value})}
                  />
               </div>
            );

        case 'technical':
            return (
               <div className="grid grid-cols-2 gap-3">
                  <input className="col-span-2 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm" placeholder="Editora" value={formData.publisher} onChange={e => setFormData({...formData, publisher: e.target.value})} />
                  <input className="bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm" placeholder="Gênero" value={formData.genre} onChange={e => setFormData({...formData, genre: e.target.value})} />
                  <input type="number" className="bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm" placeholder="Páginas" value={formData.pages} onChange={e => setFormData({...formData, pages: e.target.value})} />
               </div>
            );

        default: // Discussion, Indication
            return (
               <textarea 
                  className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm h-32 outline-none resize-none"
                  placeholder={selectedType === 'discussion' ? "Qual sua pergunta para a comunidade?" : "Por que você indica este livro?"}
                  value={formData.content}
                  onChange={e => setFormData({...formData, content: e.target.value})}
               />
            );
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* HEADER */}
        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
          <div className="flex items-center gap-2">
             {step === 2 && (
                <button onClick={() => setStep(1)} className="mr-2 text-gray-400 hover:text-gray-700">
                   <i className="fas fa-arrow-left"></i>
                </button>
             )}
             <h2 className="font-bold text-gray-800">
                {step === 1 ? 'O que você vai postar?' : POST_TYPES.find(t => t.id === selectedType)?.label}
             </h2>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-full hover:bg-gray-100 flex items-center justify-center text-gray-500">
             <i className="fas fa-times"></i>
          </button>
        </div>

        {/* BODY */}
        <div className="flex-1 overflow-y-auto p-6">
           
           {/* STEP 1: SELEÇÃO DE TIPO */}
           {step === 1 && (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                 {POST_TYPES.map(type => (
                    <button 
                       key={type.id}
                       onClick={() => { setSelectedType(type.id); setStep(2); }}
                       className="flex flex-col items-center justify-center p-4 rounded-xl border border-gray-100 hover:border-purple-200 hover:bg-purple-50 transition-all group text-center h-32"
                    >
                       <div className="w-10 h-10 rounded-full bg-gray-100 group-hover:bg-white group-hover:text-purple-600 flex items-center justify-center text-gray-500 mb-2 text-xl shadow-sm transition-colors">
                          <i className={type.icon}></i>
                       </div>
                       <span className="font-bold text-sm text-gray-700 group-hover:text-purple-700">{type.label}</span>
                       <span className="text-[10px] text-gray-400 mt-1 leading-tight">{type.desc}</span>
                    </button>
                 ))}
              </div>
           )}

           {/* STEP 2: FORMULÁRIO */}
           {step === 2 && (
              <div>
                 {/* Campos comuns aparecem para quase todos, exceto Ranking que tem titulo proprio */}
                 {selectedType !== 'ranking' && renderCommonFields()}
                 
                 {/* Campos Específicos */}
                 {renderSpecificFields()}
                 
                 {/* Tags (Comum a todos) */}
                 <div className="mt-4 pt-4 border-t border-gray-100">
                    <input 
                       className="w-full text-xs text-gray-500 placeholder-gray-400 outline-none"
                       placeholder="Tags (separadas por vírgula)... ex: #suspense, #classico"
                       value={formData.tags}
                       onChange={e => setFormData({...formData, tags: e.target.value})}
                    />
                 </div>
              </div>
           )}
        </div>

        {/* FOOTER */}
        {step === 2 && (
           <div className="p-4 border-t border-gray-100 flex justify-end gap-3 bg-gray-50">
              <button onClick={onClose} className="px-4 py-2 text-gray-500 text-sm font-bold hover:bg-gray-100 rounded-lg">Cancelar</button>
              <button 
                 onClick={handleSubmit} 
                 disabled={loading}
                 className="px-6 py-2 bg-purple-600 text-white text-sm font-bold rounded-lg hover:bg-purple-700 shadow-lg shadow-purple-200 disabled:opacity-50 flex items-center gap-2"
              >
                 {loading ? <i className="fas fa-spinner fa-spin"></i> : <i className="fas fa-paper-plane"></i>}
                 Publicar
              </button>
           </div>
        )}

      </div>
    </div>
  );
}