// src/app/dashboard/applications/library/components/PublishContentModal.tsx
'use client'

import { useState, useRef } from 'react';
import { publishOfficialContent } from '../actions';
import Image from 'next/image';

export default function PublishContentModal({ onClose, userId }: { onClose: () => void, userId: string }) {
  const [loading, setLoading] = useState(false);
  const [coverPreview, setCoverPreview] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  
  // Refs para manipular inputs de arquivo escondidos
  const fileInputRef = useRef<HTMLInputElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFileName(e.target.files[0].name);
    }
  };

  const handleCoverChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setCoverPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    try {
        const formData = new FormData(e.currentTarget);
        await publishOfficialContent(formData);
        onClose();
    } catch (error) {
        alert('Erro ao publicar. Verifique o console.');
        console.error(error);
    } finally {
        setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 bg-white border-b border-gray-100 flex justify-between items-center sticky top-0 z-10">
          <div>
            <h3 className="font-bold text-xl text-gray-800">Publicar Novo Conteúdo</h3>
            <p className="text-xs text-gray-400">Adicione materiais para toda a instituição</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-gray-50 hover:bg-gray-100 flex items-center justify-center text-gray-500 transition-colors">
            <i className="fas fa-times"></i>
          </button>
        </div>
        
        {/* Scrollable Body */}
        <div className="overflow-y-auto p-6 custom-scrollbar">
          <form id="publish-form" onSubmit={handleSubmit} className="space-y-6">
            
            {/* Seção Principal: Capa e Dados Básicos */}
            <div className="flex flex-col md:flex-row gap-6">
                {/* Upload de Capa */}
                <div className="w-full md:w-1/3 space-y-2">
                    <label className="block text-xs font-bold text-gray-500 uppercase">Capa do Material</label>
                    <div 
                        onClick={() => coverInputRef.current?.click()}
                        className="relative aspect-[3/4] rounded-xl bg-gray-50 border-2 border-dashed border-gray-200 hover:border-royal-blue/50 hover:bg-blue-50/10 cursor-pointer transition-all flex flex-col items-center justify-center overflow-hidden group"
                    >
                        <input 
                            ref={coverInputRef}
                            type="file" 
                            name="cover" 
                            accept="image/*" 
                            className="hidden" 
                            onChange={handleCoverChange}
                        />
                        
                        {coverPreview ? (
                            <>
                                <Image src={coverPreview} alt="Preview" fill className="object-cover" />
                                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                                    <p className="text-white text-xs font-bold"><i className="fas fa-sync mr-1"></i> Trocar</p>
                                </div>
                            </>
                        ) : (
                            <div className="text-center p-4">
                                <div className="w-10 h-10 bg-white rounded-full shadow-sm flex items-center justify-center mx-auto mb-2 text-royal-blue">
                                    <i className="fas fa-image"></i>
                                </div>
                                <p className="text-xs text-gray-500 font-medium">Carregar Capa</p>
                                <p className="text-[10px] text-gray-400 mt-1">Recomendado: Vertical</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Campos de Texto */}
                <div className="flex-1 space-y-4">
                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Título</label>
                        <input name="title" required type="text" className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-royal-blue/20 focus:border-royal-blue outline-none transition-all" placeholder="Ex: A Revolução Francesa" />
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Autor / Professor</label>
                        <input name="author" type="text" className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-royal-blue/20 outline-none" placeholder="Ex: Prof. Silva" />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Matéria</label>
                            <select name="subject" className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg outline-none cursor-pointer">
                                <option>Geral</option>
                                <option>Matemática</option>
                                <option>Português</option>
                                <option>História</option>
                                <option>Geografia</option>
                                <option>Física</option>
                                <option>Química</option>
                                <option>Biologia</option>
                                <option>Filosofia</option>
                                <option>Inglês</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Tipo</label>
                            <select name="type" className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg outline-none cursor-pointer">
                                <option value="book">E-book / PDF</option>
                                <option value="article">Artigo</option>
                                <option value="slide">Slides</option>
                                <option value="video">Vídeo MP4</option>
                            </select>
                        </div>
                    </div>
                </div>
            </div>

            {/* Descrição */}
            <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Descrição do Conteúdo</label>
                <textarea name="description" rows={3} className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-royal-blue/20 focus:border-royal-blue outline-none transition-all resize-none" placeholder="Faça um breve resumo..."></textarea>
            </div>

            {/* Upload do Arquivo Principal */}
            <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Arquivo do Conteúdo</label>
                <div 
                    onClick={() => fileInputRef.current?.click()}
                    className={`border-2 border-dashed rounded-xl p-6 text-center transition-all cursor-pointer ${fileName ? 'border-green-300 bg-green-50' : 'border-gray-300 hover:bg-gray-50'}`}
                >
                    <input 
                        ref={fileInputRef}
                        type="file" 
                        name="file" 
                        className="hidden" 
                        required 
                        onChange={handleFileChange}
                    />
                    
                    {fileName ? (
                         <div className="flex items-center justify-center gap-3 text-green-700">
                             <div className="w-10 h-10 bg-white rounded-full shadow-sm flex items-center justify-center"><i className="fas fa-check"></i></div>
                             <div className="text-left">
                                 <p className="font-bold text-sm">Arquivo selecionado!</p>
                                 <p className="text-xs opacity-80">{fileName}</p>
                             </div>
                         </div>
                    ) : (
                        <>
                            <i className="fas fa-cloud-upload-alt text-3xl text-gray-300 mb-2"></i>
                            <p className="text-sm text-gray-600 font-medium">Clique para carregar o arquivo (PDF, Vídeo, PPT)</p>
                            <p className="text-xs text-gray-400">Máximo 50MB</p>
                        </>
                    )}
                </div>
            </div>

          </form>
        </div>

        {/* Footer com Ações */}
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex justify-end gap-3 sticky bottom-0 z-10">
            <button type="button" onClick={onClose} className="px-5 py-2 text-gray-600 font-medium hover:bg-gray-200 rounded-lg transition-colors">Cancelar</button>
            <button 
                type="submit" 
                form="publish-form" 
                disabled={loading} 
                className="px-6 py-2 bg-royal-blue text-white font-bold rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center gap-2 shadow-lg shadow-blue-500/30"
            >
                {loading && <i className="fas fa-spinner fa-spin"></i>}
                {loading ? 'Enviando...' : 'Publicar Material'}
            </button>
        </div>
      </div>
    </div>
  );
}