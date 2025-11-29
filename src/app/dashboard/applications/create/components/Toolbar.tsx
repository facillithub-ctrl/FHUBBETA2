import { Editor } from '@tiptap/react';
import { 
  Bold, Italic, AlignLeft, AlignCenter, 
  Type, Layout, Image as ImageIcon 
} from 'lucide-react';

export default function Toolbar({ editor }: { editor: Editor | null }) {
  if (!editor) return null;

  return (
    <div className="w-full bg-white border-b border-gray-200 p-2 flex items-center gap-4 sticky top-0 z-50 shadow-sm">
      {/* Grupo: Texto Básico */}
      <div className="flex gap-1 border-r pr-4">
        <button
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={`p-2 rounded hover:bg-gray-100 ${editor.isActive('bold') ? 'bg-gray-200' : ''}`}
        >
          <Bold size={18} />
        </button>
        {/* ... Italic, Underline */}
      </div>

      {/* Grupo: Estilos Pré-definidos (Mágica Estética) */}
      <div className="flex gap-2 border-r pr-4 items-center">
        <button
          onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).setFontFamily('Multiara').run()}
          className="px-3 py-1 rounded hover:bg-purple-50 text-purple-700 font-multiara text-xl"
        >
          Título
        </button>
        <button
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).setFontFamily('Dk Lemons').run()}
          className="px-3 py-1 rounded hover:bg-blue-50 text-blue-700 font-dk-lemons text-lg"
        >
          Subtítulo
        </button>
        <button
          onClick={() => editor.chain().focus().setParagraph().setFontFamily('Letters For Learners').run()}
          className="px-3 py-1 rounded hover:bg-green-50 text-green-700 font-letters"
        >
          Corpo
        </button>
      </div>

      {/* Grupo: Inserção */}
      <div className="flex gap-1">
        <button className="flex items-center gap-2 px-3 py-1 text-sm bg-gray-100 rounded hover:bg-gray-200">
           <Layout size={16}/> Config. Página
        </button>
      </div>
    </div>
  );
}