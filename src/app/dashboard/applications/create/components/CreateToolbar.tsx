'use client';

import { Editor } from '@tiptap/react';
import { 
  Bold, Italic, Underline, AlignLeft, AlignCenter, AlignRight, AlignJustify,
  Image as ImageIcon, Table as TableIcon, Heading1, Heading2, 
  List, ListOrdered, Undo, Redo, Save
} from 'lucide-react';

interface ToolbarProps {
  editor: Editor | null;
  onSave: () => void;
  isSaving: boolean;
}

export default function CreateToolbar({ editor, onSave, isSaving }: ToolbarProps) {
  if (!editor) return null;

  const Button = ({ onClick, isActive, icon: Icon, title }: any) => (
    <button
      onClick={onClick}
      title={title}
      className={`p-2 rounded hover:bg-gray-100 transition-colors ${
        isActive ? 'bg-purple-100 text-purple-700' : 'text-gray-600'
      }`}
    >
      <Icon size={18} />
    </button>
  );

  const addImage = () => {
    const url = window.prompt('URL da Imagem:');
    if (url) editor.chain().focus().setImage({ src: url }).run();
  };

  const addTable = () => {
    editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run();
  };

  return (
    <div className="w-full bg-white border-b border-gray-200 px-4 py-2 flex items-center justify-between sticky top-0 z-40 shadow-sm gap-4 flex-wrap">
      
      {/* Grupo: Histórico */}
      <div className="flex gap-1 border-r pr-2 border-gray-200">
        <Button onClick={() => editor.chain().focus().undo().run()} icon={Undo} title="Desfazer" />
        <Button onClick={() => editor.chain().focus().redo().run()} icon={Redo} title="Refazer" />
      </div>

      {/* Grupo: Estilos de Texto */}
      <div className="flex gap-1 border-r pr-2 border-gray-200">
        <Button 
          onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).setFontFamily('Multiara').run()} 
          isActive={editor.isActive('heading', { level: 1 })}
          icon={Heading1} 
          title="Título (Multiara)" 
        />
        <Button 
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).setFontFamily('Dk Lemons').run()} 
          isActive={editor.isActive('heading', { level: 2 })}
          icon={Heading2} 
          title="Subtítulo (Dk Lemons)" 
        />
        <div className="w-px h-6 bg-gray-200 mx-1 self-center" />
        <Button onClick={() => editor.chain().focus().toggleBold().run()} isActive={editor.isActive('bold')} icon={Bold} />
        <Button onClick={() => editor.chain().focus().toggleItalic().run()} isActive={editor.isActive('italic')} icon={Italic} />
        <Button onClick={() => editor.chain().focus().toggleUnderline().run()} isActive={editor.isActive('underline')} icon={Underline} />
      </div>

      {/* Grupo: Alinhamento e Listas */}
      <div className="flex gap-1 border-r pr-2 border-gray-200">
        <Button onClick={() => editor.chain().focus().setTextAlign('left').run()} isActive={editor.isActive({ textAlign: 'left' })} icon={AlignLeft} />
        <Button onClick={() => editor.chain().focus().setTextAlign('center').run()} isActive={editor.isActive({ textAlign: 'center' })} icon={AlignCenter} />
        <Button onClick={() => editor.chain().focus().setTextAlign('right').run()} isActive={editor.isActive({ textAlign: 'right' })} icon={AlignRight} />
        <Button onClick={() => editor.chain().focus().setTextAlign('justify').run()} isActive={editor.isActive({ textAlign: 'justify' })} icon={AlignJustify} />
        <div className="w-px h-6 bg-gray-200 mx-1 self-center" />
        <Button onClick={() => editor.chain().focus().toggleBulletList().run()} isActive={editor.isActive('bulletList')} icon={List} />
        <Button onClick={() => editor.chain().focus().toggleOrderedList().run()} isActive={editor.isActive('orderedList')} icon={ListOrdered} />
      </div>

      {/* Grupo: Inserir Objetos */}
      <div className="flex gap-1 border-r pr-2 border-gray-200">
        <Button onClick={addImage} icon={ImageIcon} title="Inserir Imagem" />
        <Button onClick={addTable} icon={TableIcon} title="Inserir Tabela" />
      </div>

      {/* Salvar */}
      <div className="ml-auto">
        <button 
          onClick={onSave} 
          disabled={isSaving}
          className="flex items-center gap-2 bg-brand-purple hover:bg-purple-800 text-white px-4 py-2 rounded-lg font-medium transition-colors text-sm disabled:opacity-50"
        >
          <Save size={16} />
          {isSaving ? 'Salvando...' : 'Salvar'}
        </button>
      </div>
    </div>
  );
}