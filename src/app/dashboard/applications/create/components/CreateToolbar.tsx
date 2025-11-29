'use client';

import { Editor } from '@tiptap/react';
import { 
  Bold, Italic, AlignLeft, AlignCenter, AlignRight, 
  Save, Sparkles 
} from 'lucide-react';

interface ToolbarProps {
  editor: Editor | null;
  onSave: () => void;
  isSaving: boolean;
  onGenerateSummary: () => void;
}

export default function CreateToolbar({ editor, onSave, isSaving, onGenerateSummary }: ToolbarProps) {
  if (!editor) return null;

  return (
    <div className="w-full bg-white/90 backdrop-blur-md border-b border-purple-100 p-3 flex items-center justify-between sticky top-0 z-50 shadow-sm">
      
      <div className="flex items-center gap-4">
        {/* Estilos Acadêmicos */}
        <div className="flex bg-gray-100 p-1 rounded-lg gap-1">
          <button
            onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).setFontFamily('Multiara').run()}
            className={`px-3 py-1 rounded transition-colors ${editor.isActive('heading', { level: 1 }) ? 'bg-purple-600 text-white' : 'hover:bg-gray-200'}`}
          >
            <span className="font-multiara text-lg">Título</span>
          </button>
          
          <button
            onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).setFontFamily('Dk Lemons').run()}
            className={`px-3 py-1 rounded transition-colors ${editor.isActive('heading', { level: 2 }) ? 'bg-purple-600 text-white' : 'hover:bg-gray-200'}`}
          >
            <span className="font-dk-lemons">Subtítulo</span>
          </button>
          
          <button
            onClick={() => editor.chain().focus().setParagraph().setFontFamily('Letters For Learners').run()}
            className={`px-3 py-1 rounded transition-colors ${editor.isActive('paragraph') ? 'bg-purple-600 text-white' : 'hover:bg-gray-200'}`}
          >
            <span className="font-letters font-bold">Corpo</span>
          </button>
        </div>

        <div className="w-px h-6 bg-gray-300 mx-2" />

        {/* Formatação */}
        <div className="flex gap-1">
          <button onClick={() => editor.chain().focus().toggleBold().run()} className={`p-2 rounded hover:bg-purple-50 ${editor.isActive('bold') ? 'text-purple-600 bg-purple-100' : ''}`}>
            <Bold size={18} />
          </button>
          <button onClick={() => editor.chain().focus().toggleItalic().run()} className={`p-2 rounded hover:bg-purple-50 ${editor.isActive('italic') ? 'text-purple-600 bg-purple-100' : ''}`}>
            <Italic size={18} />
          </button>
          <button onClick={() => editor.chain().focus().setTextAlign('left').run()} className={`p-2 rounded hover:bg-purple-50 ${editor.isActive({ textAlign: 'left' }) ? 'text-purple-600' : ''}`}>
            <AlignLeft size={18} />
          </button>
           <button onClick={() => editor.chain().focus().setTextAlign('center').run()} className={`p-2 rounded hover:bg-purple-50 ${editor.isActive({ textAlign: 'center' }) ? 'text-purple-600' : ''}`}>
            <AlignCenter size={18} />
          </button>
        </div>
      </div>

      <div className="flex items-center gap-3">
         <button 
            onClick={onGenerateSummary}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-amber-400 to-orange-500 text-white rounded-full text-sm font-bold shadow hover:shadow-lg transition-all"
         >
            <Sparkles size={16} />
            Resumo IA
         </button>

         <button 
            onClick={onSave}
            disabled={isSaving}
            className="flex items-center gap-2 px-4 py-2 bg-purple-700 text-white rounded-lg text-sm font-medium hover:bg-purple-800 transition-colors disabled:opacity-50"
         >
            <Save size={16} />
            {isSaving ? 'Salving...' : 'Salvar'}
         </button>
      </div>
    </div>
  );
}