"use client";

import { useState, useRef } from 'react';
import Image from 'next/image';
import { UserProfile, BookPostType } from '../types';
import { Upload, X, Camera, Star, ListOrdered, Quote, Tag, MessageCircle, Eye, FileText, ThumbsUp, Megaphone } from 'lucide-react';

type Props = {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserProfile;
  onPostCreate: (formData: FormData) => void;
};

// Configuração dos Tipos de Post com Ícones Lucide
const POST_TYPES: { id: BookPostType; label: string; icon: React.ElementType; desc: string }[] = [
  { id: 'review', label: 'Resenha', icon: FileText, desc: 'Análise aprofundada com nota.' },
  { id: 'rating', label: 'Avaliação', icon: Star, desc: 'Apenas nota rápida.' },
  { id: 'ranking', label: 'Top Lista', icon: ListOrdered, desc: 'Crie um ranking (Top 3, 5...)' },
  { id: 'recommendation', label: 'Recomendação', icon: ThumbsUp, desc: 'Indique para um público.' },
  { id: 'indication', label: 'Indicação', icon: Megaphone, desc: 'Sugestão simples.' },
  { id: 'promotion', label: 'Promoção', icon: Tag, desc: 'Oferta e preço.' },
  { id: 'discussion', label: 'Debate', icon: MessageCircle, desc: 'Levante uma questão.' },
  { id: 'first-impressions', label: '1ª Impressões', icon: Eye, desc: 'Reação inicial.' },
  { id: 'quote', label: 'Citação', icon: Quote, desc: 'Trecho favorito.' },
  { id: 'technical', label: 'Ficha', icon: FileText, desc: 'Dados técnicos.' },
];

// Utilitário de Compressão de Imagem
const compressImage = async (file: File, quality = 0.7, maxWidth = 800): Promise<File> => {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = document.createElement('img');
      img.src = event.target?.result as string;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0, width, height);

        canvas.toBlob((blob) => {
          if (blob) {
            resolve(new File([blob], file.name, { type: 'image/jpeg', lastModified: Date.now() }));
          } else {
            resolve(file);
          }
        }, 'image/jpeg', quality);
      };
    };
  });
};

export default function CreateReviewModal({ isOpen, onClose, onPostCreate }: Props) {
  const [step, setStep] = useState<1 | 2>(1);
  const [selectedType, setSelectedType] = useState<BookPostType>('review');
  const [loading, setLoading] = useState(false);
  
  // Estado para Imagem
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Estado do Formulário
  const [formData, setFormData] = useState({
    title: '',
    author: '', 
    content: '',
    rating: 0,
    tags: '',
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
    rankingItems: [
        { position: 1, title: '' }, 
        { position: 2, title: '' }, 
        { position: 3, title: '' },
        { position: 4, title: '' },
        { position: 5, title: '' }
    ]
  });

  if (!isOpen) return null;

  // Handlers
  const handleImageSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setPreviewUrl(URL.createObjectURL(file));
      try {
        const compressed = await compressImage(file);
        setSelectedFile(compressed);
      } catch {
        setSelectedFile(file);
      }
    }
  };

  const handleReasonChange = (index: number, value: string) => {
    const newReasons = [...formData.reasons];
    newReasons[index] = value;
    setFormData({ ...formData, reasons: newReasons });
  };

  const handleRankingChange = (index: number, value: string) => {
    const newItems = formData.rankingItems.map((item, idx) => 
        idx === index ? { ...item, title: value } : item
    );
    setFormData({ ...formData, rankingItems: newItems });
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
        const validRankingItems = formData.rankingItems.filter(i => i.title.trim() !== '');
        const validReasons = formData.reasons.filter(r => r.trim() !== '');

        // 1. Construir metadados
        const metadata = {
            tags: formData.tags.split(',').map(t => t.trim()).filter(t => t),
            author: formData.author,
            publisher: formData.publisher,
            pages: formData.pages ? parseInt(formData.pages) : undefined,
            genre: formData.genre,
            rating: (selectedType === 'review' || selectedType === 'rating') ? formData.rating : undefined,
            price: formData.price ? parseFloat(formData.price) : undefined,
            oldPrice: formData.oldPrice ? parseFloat(formData.oldPrice) : undefined,
            discountPercent: (formData.price && formData.oldPrice) 
                ? Math.round((1 - (parseFloat(formData.price) / parseFloat(formData.oldPrice))) * 100) 
                : undefined,
            linkUrl: selectedType === 'promotion' ? formData.affiliateLink : undefined,
            targetAudience: formData.targetAudience,
            reasons: validReasons,
            mood: formData.mood,
            progress: selectedType === 'first-impressions' ? formData.progress : undefined,
            quoteText: formData.quote,
            quotePage: formData.quotePage,
            rankingItems: validRankingItems,
        };

        // 2. Criar FormData
        const data = new FormData();
        data.append('category', 'books');
        data.append('type', selectedType);
        data.append('title', formData.title || 'Post sem título');
        data.append('subtitle', formData.author); 
        data.append('content', formData.content);
        data.append('metadata', JSON.stringify(metadata));

        if (selectedFile) {
            data.append('file', selectedFile);
        }

        await onPostCreate(data);
        
        // Reset e Fechar
        setStep(1);
        setFormData({ ...formData, title: '', content: '', tags: '', rankingItems: formData.rankingItems.map(i => ({...i, title: ''})) });
        setSelectedFile(null);
        setPreviewUrl(null);

    } catch (error) {
        console.error("Erro submit:", error);
        alert("Erro ao criar post.");
    } finally {
        setLoading(false);
    }
  };

  // Renderização dos Campos Específicos
  const renderSpecificFields = () => {
    switch(selectedType) {
        case 'review':
        case 'rating':
            return (
               <div className="space-y-4 animate-in fade-in">
                  <div>
                     <label className="text-xs font-bold text-gray-500 uppercase">Sua Nota</label>
                     <div className="flex gap-2 mt-1">
                        {[1,2,3,4,5].map(star => (
                           <button key={star} onClick={() => setFormData({...formData, rating: star})} className={`text-2xl transition-transform hover:scale-110 ${formData.rating >= star ? 'text-yellow-400' : 'text-gray-200'}`}>★</button>
                        ))}
                     </div>
                  </div>
                  {selectedType === 'review' && (
                     <textarea 
                        className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 text-sm h-32 focus:ring-2 focus:ring-purple-500 outline-none resize-none"
                        placeholder="Escreva sua resenha completa aqui..."
                        value={formData.content}
                        onChange={e => setFormData({...formData, content: e.target.value})}
                     />
                  )}
               </div>
            );
        case 'ranking':
            return (
               <div className="space-y-3 animate-in fade-in">
                  <label className="text-xs font-bold text-gray-500 uppercase flex justify-between">
                      <span>Itens do Ranking</span>
                      <span className="text-[10px] text-gray-400 font-normal">Preencha na ordem</span>
                  </label>
                  {formData.rankingItems.map((item, i) => (
                     <div key={i} className="flex gap-3 items-center group">
                        <div className="w-6 h-6 rounded-full bg-purple-100 text-purple-600 font-bold text-xs flex items-center justify-center flex-shrink-0 border border-purple-200">
                            {item.position}
                        </div>
                        <input 
                           className="flex-1 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:bg-white focus:border-purple-300 transition-colors"
                           placeholder={`Item #${item.position}`}
                           value={item.title}
                           onChange={e => handleRankingChange(i, e.target.value)}
                        />
                     </div>
                  ))}
               </div>
            );
        case 'quote':
            return (
               <div className="space-y-3 animate-in fade-in">
                   <textarea 
                     className="w-full bg-gray-900 border border-gray-700 rounded-lg px-6 py-6 text-lg font-serif italic text-white h-32 outline-none resize-none text-center placeholder-gray-600"
                     placeholder='"Digite a citação aqui..."'
                     value={formData.quote}
                     onChange={e => setFormData({...formData, quote: e.target.value})}
                  />
                  <input 
                     className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-xs text-center outline-none"
                     placeholder="Ex: Página 42"
                     value={formData.quotePage}
                     onChange={e => setFormData({...formData, quotePage: e.target.value})}
                  />
               </div>
            );
        case 'promotion':
            return (
               <div className="space-y-3 animate-in fade-in">
                  <div className="grid grid-cols-2 gap-3">
                     <input type="number" className="bg-red-50 border-red-100 text-red-600 font-bold rounded-lg px-3 py-2 text-sm placeholder-red-300" placeholder="Preço Atual (R$)" value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})} />
                     <input type="number" className="bg-gray-50 border-gray-200 rounded-lg px-3 py-2 text-sm" placeholder="Preço Antigo" value={formData.oldPrice} onChange={e => setFormData({...formData, oldPrice: e.target.value})} />
                  </div>
                  <input className="w-full bg-gray-50 border-gray-200 rounded-lg px-3 py-2 text-sm" placeholder="Link de Afiliado/Loja" value={formData.affiliateLink} onChange={e => setFormData({...formData, affiliateLink: e.target.value})} />
               </div>
            );
        case 'recommendation':
             return (
                <div className="space-y-3 animate-in fade-in">
                   <input className="w-full bg-emerald-50 border-emerald-100 text-emerald-800 rounded-lg px-3 py-2 text-sm placeholder-emerald-400" placeholder="Recomendado para... (Ex: Fãs de Harry Potter)" value={formData.targetAudience} onChange={e => setFormData({...formData, targetAudience: e.target.value})} />
                   <label className="text-xs font-bold text-gray-500 uppercase mt-2 block">3 Motivos</label>
                   {formData.reasons.map((r, i) => (
                      <input key={i} className="w-full bg-gray-50 border-gray-200 rounded-lg px-3 py-2 text-sm" placeholder={`Motivo ${i+1}`} value={r} onChange={e => handleReasonChange(i, e.target.value)} />
                   ))}
                </div>
             );
        case 'technical':
             return (
                <div className="grid grid-cols-2 gap-3 animate-in fade-in">
                   <input className="col-span-2 bg-gray-50 border-gray-200 rounded-lg px-3 py-2 text-sm" placeholder="Editora" value={formData.publisher} onChange={e => setFormData({...formData, publisher: e.target.value})} />
                   <input className="bg-gray-50 border-gray-200 rounded-lg px-3 py-2 text-sm" placeholder="Gênero" value={formData.genre} onChange={e => setFormData({...formData, genre: e.target.value})} />
                   <input className="bg-gray-50 border-gray-200 rounded-lg px-3 py-2 text-sm" placeholder="Nº Páginas" value={formData.pages} onChange={e => setFormData({...formData, pages: e.target.value})} />
                </div>
             );
        case 'first-impressions':
            return (
                <div className="space-y-4 animate-in fade-in">
                    <div className="bg-gray-50 p-3 rounded-xl border border-gray-100">
                        <label className="text-xs font-bold text-gray-500 uppercase mb-2 block">Progresso de Leitura ({formData.progress}%)</label>
                        <input 
                            type="range" 
                            min="0" 
                            max="100" 
                            value={formData.progress} 
                            onChange={e => setFormData({...formData, progress: parseInt(e.target.value)})}
                            className="w-full accent-purple-600 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                         <button onClick={() => setFormData({...formData, mood: 'Empolgado'})} className={`py-2 rounded-lg text-sm border ${formData.mood === 'Empolgado' ? 'bg-green-50 border-green-200 text-green-700 font-bold' : 'border-gray-200 text-gray-500'}`}>🤩 Empolgado</button>
                         <button onClick={() => setFormData({...formData, mood: 'Confuso'})} className={`py-2 rounded-lg text-sm border ${formData.mood === 'Confuso' ? 'bg-orange-50 border-orange-200 text-orange-700 font-bold' : 'border-gray-200 text-gray-500'}`}>🤔 Confuso</button>
                         <button onClick={() => setFormData({...formData, mood: 'Triste'})} className={`py-2 rounded-lg text-sm border ${formData.mood === 'Triste' ? 'bg-blue-50 border-blue-200 text-blue-700 font-bold' : 'border-gray-200 text-gray-500'}`}>😢 Triste</button>
                         <button onClick={() => setFormData({...formData, mood: 'Chocado'})} className={`py-2 rounded-lg text-sm border ${formData.mood === 'Chocado' ? 'bg-purple-50 border-purple-200 text-purple-700 font-bold' : 'border-gray-200 text-gray-500'}`}>😱 Chocado</button>
                    </div>
                    <textarea 
                        className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm h-24 outline-none"
                        placeholder="O que você está achando até agora?"
                        value={formData.content}
                        onChange={e => setFormData({...formData, content: e.target.value})}
                    />
                </div>
            );
        default: 
            return (
               <textarea 
                  className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm h-32 outline-none"
                  placeholder={selectedType === 'discussion' ? "Qual a pergunta para o debate?" : "Escreva aqui..."}
                  value={formData.content}
                  onChange={e => setFormData({...formData, content: e.target.value})}
               />
            );
    }
  };

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm">
      <div className="bg-white rounded-2xl w-full max-w-xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="px-5 py-4 border-b border-gray-100 flex justify-between items-center bg-white">
          <div className="flex items-center gap-3">
             {step === 2 && (
                <button onClick={() => setStep(1)} className="text-gray-400 hover:text-gray-700 transition-colors"><i className="fas fa-arrow-left"></i></button>
             )}
             <h2 className="font-bold text-gray-800 text-lg">
                {step === 1 ? 'Criar Nova Postagem' : POST_TYPES.find(t => t.id === selectedType)?.label}
             </h2>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-full hover:bg-gray-100 flex items-center justify-center text-gray-400 transition-colors">
             <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-5 custom-scrollbar">
           {step === 1 ? (
              // SELEÇÃO DE TIPO
              <div className="grid grid-cols-2 gap-3">
                 {POST_TYPES.map(type => (
                    <button 
                       key={type.id}
                       onClick={() => { setSelectedType(type.id); setStep(2); }}
                       className="flex items-center gap-3 p-3 rounded-xl border border-gray-100 hover:border-purple-300 hover:bg-purple-50/50 transition-all text-left group"
                    >
                       <div className="w-10 h-10 rounded-full bg-gray-50 text-gray-500 group-hover:bg-white group-hover:text-purple-600 flex items-center justify-center shadow-sm transition-colors border border-gray-200 flex-shrink-0">
                          <type.icon size={18} />
                       </div>
                       <div>
                           <span className="font-bold text-sm text-gray-700 group-hover:text-purple-700 block">{type.label}</span>
                           <span className="text-[10px] text-gray-400 leading-tight">{type.desc}</span>
                       </div>
                    </button>
                 ))}
              </div>
           ) : (
              // FORMULÁRIO
              <div>
                 {/* Upload de Capa + Campos Básicos */}
                 <div className="space-y-4 mb-6 bg-gray-50 p-4 rounded-xl border border-gray-100">
                    <div className="flex gap-4">
                        <div 
                          className="w-24 h-32 bg-white rounded-lg flex-shrink-0 flex items-center justify-center border border-dashed border-gray-300 relative overflow-hidden group hover:border-purple-400 transition-colors cursor-pointer"
                          onClick={() => fileInputRef.current?.click()}
                        >
                           {previewUrl ? (
                              <>
                                  <Image src={previewUrl} alt="Capa" fill className="object-cover" />
                                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                                      <Upload className="text-white w-6 h-6" />
                                  </div>
                              </>
                           ) : (
                              <div className="text-center p-2">
                                 <Camera className="text-gray-300 mb-1 mx-auto" size={24} />
                                 <p className="text-[9px] text-gray-400 leading-tight font-bold">ADICIONAR CAPA</p>
                              </div>
                           )}
                           <input 
                              type="file" 
                              accept="image/*"
                              ref={fileInputRef}
                              className="hidden"
                              onChange={handleImageSelect}
                           />
                        </div>

                        <div className="flex-1 space-y-3">
                           <div>
                              <label className="text-[10px] font-bold text-gray-400 uppercase mb-1 block">
                                  {selectedType === 'ranking' ? 'Título da Lista' : 'Título da Obra'}
                              </label>
                              <input 
                                  className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-purple-500 outline-none font-bold text-gray-800"
                                  placeholder="Digite aqui..."
                                  value={formData.title}
                                  onChange={e => setFormData({...formData, title: e.target.value})}
                              />
                           </div>
                           <div>
                              <input 
                                  className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none"
                                  placeholder="Autor / Subtítulo (Opcional)"
                                  value={formData.author}
                                  onChange={e => setFormData({...formData, author: e.target.value})}
                              />
                           </div>
                        </div>
                    </div>
                 </div>

                 {renderSpecificFields()}
                 
                 <div className="mt-4 pt-4 border-t border-gray-100">
                    <input 
                       className="w-full text-xs text-gray-500 placeholder-gray-400 outline-none bg-transparent"
                       placeholder="#Tags (separadas por vírgula)... ex: #suspense, #classico"
                       value={formData.tags}
                       onChange={e => setFormData({...formData, tags: e.target.value})}
                    />
                 </div>
              </div>
           )}
        </div>

        {/* Footer */}
        {step === 2 && (
           <div className="p-4 border-t border-gray-100 flex justify-end gap-3 bg-gray-50">
              <button onClick={onClose} className="px-4 py-2 text-gray-500 text-sm font-bold hover:bg-gray-200 rounded-lg transition-colors">Cancelar</button>
              <button 
                 onClick={handleSubmit} 
                 disabled={loading || !formData.title}
                 className="px-6 py-2 bg-purple-600 text-white text-sm font-bold rounded-lg hover:bg-purple-700 shadow-lg shadow-purple-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 transition-all"
              >
                 {loading ? "Publicando..." : "Publicar"}
              </button>
           </div>
        )}
      </div>
    </div>
  );
}