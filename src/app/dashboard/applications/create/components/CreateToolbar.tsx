'use client';

import { Editor } from '@tiptap/react';
import { 
  Bold, Italic, Underline, AlignLeft, AlignCenter, AlignRight, AlignJustify,
  Image as ImageIcon, Table as TableIcon, Undo, Redo, Save, 
  Minus, Plus, Type
} from 'lucide-react';

interface ToolbarProps {
  editor: Editor | null;
  onSave: () => void;
  isSaving: boolean;
}

export default function CreateToolbar({ editor, onSave, isSaving }: ToolbarProps) {
  if (!editor) return null;

  const Button = ({ onClick, isActive, icon: Icon, title, className = '' }: any) => (
    <button
      onClick={onClick}
      title={title}
      className={`p-2 rounded-lg transition-all duration-200 flex-shrink-0 ${
        isActive 
          ? 'bg-purple-100 text-brand-purple shadow-sm' 
          : 'text-gray-500 hover:bg-gray-100 hover:text-gray-900'
      } ${className}`}
    >
      <Icon size={18} strokeWidth={isActive ? 2.5 : 2} />
    </button>
  );

  const addImage = () => {
    const url = window.prompt('URL da Imagem:');
    if (url) editor.chain().focus().setImage({ src: url }).run();
  };

  const addTable = () => {
    editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run();
  };

  // Funções de Tamanho de Fonte (Simuladas via TextStyle ou Heading se não houver extensão customizada)
  // Nota: Para tamanho exato em px, o ideal é uma extensão customizada, mas vamos usar headings e scale
  // como aproximação visual rápida ou TextStyle inline.
  
  return (
    <div className="w-full max-w-[210mm] mx-auto bg-white/95 backdrop-blur-md border border-gray-200/60 rounded-xl md:rounded-2xl px-2 py-2 flex items-center justify-between shadow-lg shadow-gray-200/50 gap-2 mb-4 sticky top-2 z-40 transition-all">
      
      {/* Container Scrollável Horizontalmente para Mobile */}
      <div className="flex items-center gap-1 overflow-x-auto scrollbar-hide pr-4 w-full mask-linear-fade">
        
        {/* Histórico */}
        <div className="flex gap-0.5 border-r border-gray-100 pr-1 mr-1 flex-shrink-0">
          <Button onClick={() => editor.chain().focus().undo().run()} icon={Undo} title="Desfazer" />
          <Button onClick={() => editor.chain().focus().redo().run()} icon={Redo} title="Refazer" />
        </div>

        {/* Tipografia da Marca (Dropdown ou Botões Rápidos) */}
        <div className="flex gap-1 border-r border-gray-100 pr-2 mr-1 flex-shrink-0">
           <button
             onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).setFontFamily('Multiara').run()}
             className={`px-3 py-1.5 rounded-lg text-sm whitespace-nowrap transition-colors ${editor.isActive('heading', { level: 1 }) ? 'bg-purple-100 text-brand-purple' : 'hover:bg-gray-50 text-gray-600'}`}
           >
             <span className="font-multiara text-lg">Título</span>
           </button>
           <button
             onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).setFontFamily('Dk Lemons').run()}
             className={`px-3 py-1.5 rounded-lg text-sm whitespace-nowrap transition-colors ${editor.isActive('heading', { level: 2 }) ? 'bg-purple-100 text-brand-purple' : 'hover:bg-gray-50 text-gray-600'}`}
           >
             <span className="font-dk-lemons">Subtítulo</span>
           </button>
           <button
             onClick={() => editor.chain().focus().setParagraph().setFontFamily('Letters For Learners').run()}
             className={`px-3 py-1.5 rounded-lg text-sm whitespace-nowrap transition-colors ${editor.isActive('paragraph') ? 'bg-purple-100 text-brand-purple' : 'hover:bg-gray-50 text-gray-600'}`}
           >
             <span className="font-letters font-bold">Corpo</span>
           </button>
        </div>

        {/* Estilos Básicos */}
        <div className="flex gap-0.5 border-r border-gray-100 pr-1 mr-1 flex-shrink-0">
          <Button onClick={() => editor.chain().focus().toggleBold().run()} isActive={editor.isActive('bold')} icon={Bold} />
          <Button onClick={() => editor.chain().focus().toggleItalic().run()} isActive={editor.isActive('italic')} icon={Italic} />
          <Button onClick={() => editor.chain().focus().toggleUnderline().run()} isActive={editor.isActive('underline')} icon={Underline} />
        </div>

        {/* Alinhamento */}
        <div className="flex gap-0.5 border-r border-gray-100 pr-1 mr-1 flex-shrink-0">
          <Button onClick={() => editor.chain().focus().setTextAlign('left').run()} isActive={editor.isActive({ textAlign: 'left' })} icon={AlignLeft} />
          <Button onClick={() => editor.chain().focus().setTextAlign('center').run()} isActive={editor.isActive({ textAlign: 'center' })} icon={AlignCenter} />
          <Button onClick={() => editor.chain().focus().setTextAlign('justify').run()} isActive={editor.isActive({ textAlign: 'justify' })} icon={AlignJustify} />
        </div>

        {/* Inserção */}
        <div className="flex gap-0.5 flex-shrink-0">
           <Button onClick={addImage} icon={ImageIcon} />
           <Button onClick={addTable} icon={TableIcon} />
        </div>
      </div>

      {/* Salvar (Fixo na direita) */}
      <div className="pl-2 border-l border-gray-100 flex-shrink-0">
        <button 
          onClick={onSave} 
          disabled={isSaving}
          className={`
            flex items-center gap-2 px-3 md:px-4 py-2 rounded-xl font-bold text-sm transition-all shadow-md
            ${isSaving 
               ? 'bg-gray-100 text-gray-400 cursor-wait' 
               : 'bg-brand-purple hover:bg-purple-700 text-white hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0'}
          `}
        >
          {isSaving ? (
            <Save size={18} className="animate-spin" />
          ) : (
            <>
               <Save size={18} /> 
               <span className="hidden md:inline">Salvar</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}