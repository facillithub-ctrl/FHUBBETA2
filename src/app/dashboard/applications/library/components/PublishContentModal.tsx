// src/app/dashboard/applications/library/components/PublishContentModal.tsx
'use client'

import { useState } from 'react';
import { publishOfficialContent } from '../actions'; // Server action criada anteriormente

export default function PublishContentModal({ onClose, userId }: { onClose: () => void, userId: string }) {
  const [loading, setLoading] = useState(false);
  
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.currentTarget);
    
    // Aqui conectamos com a Server Action real
    await publishOfficialContent(formData);
    
    setLoading(false);
    onClose();
    // Ideal: Adicionar um Toast de sucesso aqui
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
      <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden animate-fade-in-up">
        <div className="px-6 py-4 bg-gray-50 border-b border-gray-100 flex justify-between items-center">
          <h3 className="font-bold text-gray-800">Publicar Conteúdo Oficial</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <i className="fas fa-times"></i>
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Título do Material</label>
            <input name="title" required type="text" className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-royal-blue/20 focus:border-royal-blue outline-none transition-all" placeholder="Ex: Introdução à Química Orgânica" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Matéria</label>
              <select name="subject" className="w-full px-4 py-2 border border-gray-200 rounded-lg outline-none bg-white">
                <option>Matemática</option>
                <option>Português</option>
                <option>História</option>
                <option>Biologia</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tipo</label>
              <select name="type" className="w-full px-4 py-2 border border-gray-200 rounded-lg outline-none bg-white">
                <option value="book">Livro / E-book</option>
                <option value="article">Artigo</option>
                <option value="slide">Slides</option>
                <option value="video">Vídeo Aula</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Descrição</label>
            <textarea name="description" rows={3} className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-royal-blue/20 focus:border-royal-blue outline-none transition-all" placeholder="Sobre o que é este conteúdo..."></textarea>
          </div>

          <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:bg-gray-50 transition-colors cursor-pointer relative">
            <input type="file" name="file" className="absolute inset-0 opacity-0 cursor-pointer" required />
            <i className="fas fa-cloud-upload-alt text-3xl text-gray-400 mb-2"></i>
            <p className="text-sm text-gray-600 font-medium">Clique para fazer upload do arquivo</p>
            <p className="text-xs text-gray-400">PDF, DOCX, PPTX ou MP4 (Máx. 50MB)</p>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <button type="button" onClick={onClose} className="px-4 py-2 text-gray-600 font-medium hover:bg-gray-100 rounded-lg transition-colors">Cancelar</button>
            <button type="submit" disabled={loading} className="px-6 py-2 bg-royal-blue text-white font-bold rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center gap-2">
              {loading && <i className="fas fa-spinner fa-spin"></i>}
              {loading ? 'Publicando...' : 'Publicar Agora'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}