'use client';

import React from 'react';
import { Editor } from '@tiptap/react';
import { 
  Bold, Italic, Underline, Strikethrough, 
  AlignLeft, AlignCenter, AlignRight, AlignJustify,
  List, ListOrdered, CheckSquare, 
  Undo, Redo, 
  Image as ImageIcon, Link as LinkIcon, 
  Heading1, Heading2, Heading3, 
  Quote, Code, Highlighter, Palette,
  MoreVertical, FileDown, Eye, Share2, Sparkles, Minus
} from 'lucide-react';

interface Props {
  editor: Editor | null;
}

export const EditorToolbar = ({ editor }: Props) => {
  if (!editor) return null;

  const addImage = () => {
    const url = window.prompt('URL da imagem:');
    if (url) editor.chain().focus().setImage({ src: url }).run();
  };

  const setLink = () => {
    const previousUrl = editor.getAttributes('link').href;
    const url = window.prompt('URL:', previousUrl);
    if (url === null) return;
    if (url === '') {
      editor.chain().focus().extendMarkRange('link').unsetLink().run();
      return;
    }
    editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
  };

  return (
    <div className="sticky top-0 z-40 w-full bg-white dark:bg-zinc-950 border-b border-zinc-200 dark:border-zinc-800 shadow-sm transition-all">
      {/* Topo: Título e Ações Globais */}
      <div className="flex items-center justify-between px-4 h-14 border-b border-zinc-100 dark:border-zinc-800">
        <div className="flex items-center gap-4">
          <input 
            type="text" 
            defaultValue="Sem Título" 
            className="text-sm font-medium bg-transparent border-none focus:ring-0 p-0 text-zinc-900 dark:text-zinc-100 w-64 placeholder-zinc-400"
            placeholder="Nome do Documento"
          />
          <span className="text-[10px] uppercase tracking-wider font-semibold text-zinc-400 bg-zinc-100 dark:bg-zinc-800 px-2 py-0.5 rounded">
            Rascunho
          </span>
        </div>

        <div className="flex items-center gap-2">
           <button className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-purple-600 bg-purple-50 hover:bg-purple-100 rounded-md transition-colors border border-purple-100">
            <Sparkles size={14} />
            IA Assistant
          </button>
          <div className="w-[1px] h-4 bg-zinc-200 dark:bg-zinc-700 mx-1" />
          <ActionButton icon={Eye} label="Visualizar" />
          <ActionButton icon={FileDown} label="Exportar" />
          <button className="flex items-center gap-2 px-4 py-1.5 text-xs font-medium text-white bg-zinc-900 hover:bg-zinc-800 rounded-md transition-colors shadow-sm">
            <Share2 size={14} />
            Compartilhar
          </button>
        </div>
      </div>

      {/* Baixo: Ferramentas de Edição (Estilo Word/Docs) */}
      <div className="flex items-center gap-1 px-4 py-2 overflow-x-auto scrollbar-hide">
        
        {/* Histórico */}
        <div className="flex items-center gap-0.5 pr-2 border-r border-zinc-200 dark:border-zinc-800">
          <ToolbarBtn onClick={() => editor.chain().focus().undo().run()} disabled={!editor.can().undo()} icon={Undo} />
          <ToolbarBtn onClick={() => editor.chain().focus().redo().run()} disabled={!editor.can().redo()} icon={Redo} />
        </div>

        {/* Tipografia */}
        <div className="flex items-center gap-0.5 px-2 border-r border-zinc-200 dark:border-zinc-800">
          <ToolbarBtn 
            onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()} 
            isActive={editor.isActive('heading', { level: 1 })} 
            icon={Heading1} 
            label="H1"
          />
          <ToolbarBtn 
            onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} 
            isActive={editor.isActive('heading', { level: 2 })} 
            icon={Heading2} 
            label="H2"
          />
          <ToolbarBtn 
            onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} 
            isActive={editor.isActive('heading', { level: 3 })} 
            icon={Heading3} 
            label="H3"
          />
        </div>

        {/* Estilo de Texto */}
        <div className="flex items-center gap-0.5 px-2 border-r border-zinc-200 dark:border-zinc-800">
          <ToolbarBtn onClick={() => editor.chain().focus().toggleBold().run()} isActive={editor.isActive('bold')} icon={Bold} />
          <ToolbarBtn onClick={() => editor.chain().focus().toggleItalic().run()} isActive={editor.isActive('italic')} icon={Italic} />
          <ToolbarBtn onClick={() => editor.chain().focus().toggleUnderline().run()} isActive={editor.isActive('underline')} icon={Underline} />
          <ToolbarBtn onClick={() => editor.chain().focus().toggleStrike().run()} isActive={editor.isActive('strike')} icon={Strikethrough} />
          <ToolbarBtn onClick={() => editor.chain().focus().toggleCode().run()} isActive={editor.isActive('code')} icon={Code} />
          <ToolbarBtn onClick={() => editor.chain().focus().toggleHighlight().run()} isActive={editor.isActive('highlight')} icon={Highlighter} className="text-yellow-600" />
        </div>

        {/* Alinhamento */}
        <div className="flex items-center gap-0.5 px-2 border-r border-zinc-200 dark:border-zinc-800">
          <ToolbarBtn onClick={() => editor.chain().focus().setTextAlign('left').run()} isActive={editor.isActive({ textAlign: 'left' })} icon={AlignLeft} />
          <ToolbarBtn onClick={() => editor.chain().focus().setTextAlign('center').run()} isActive={editor.isActive({ textAlign: 'center' })} icon={AlignCenter} />
          <ToolbarBtn onClick={() => editor.chain().focus().setTextAlign('right').run()} isActive={editor.isActive({ textAlign: 'right' })} icon={AlignRight} />
          <ToolbarBtn onClick={() => editor.chain().focus().setTextAlign('justify').run()} isActive={editor.isActive({ textAlign: 'justify' })} icon={AlignJustify} />
        </div>

        {/* Listas */}
        <div className="flex items-center gap-0.5 px-2 border-r border-zinc-200 dark:border-zinc-800">
          <ToolbarBtn onClick={() => editor.chain().focus().toggleBulletList().run()} isActive={editor.isActive('bulletList')} icon={List} />
          <ToolbarBtn onClick={() => editor.chain().focus().toggleOrderedList().run()} isActive={editor.isActive('orderedList')} icon={ListOrdered} />
          <ToolbarBtn onClick={() => editor.chain().focus().toggleTaskList().run()} isActive={editor.isActive('taskList')} icon={CheckSquare} />
        </div>

        {/* Inserção */}
        <div className="flex items-center gap-0.5 px-2">
          <ToolbarBtn onClick={() => editor.chain().focus().toggleBlockquote().run()} isActive={editor.isActive('blockquote')} icon={Quote} />
          <ToolbarBtn onClick={() => editor.chain().focus().setHorizontalRule().run()} icon={Minus} />
          <ToolbarBtn onClick={setLink} isActive={editor.isActive('link')} icon={LinkIcon} />
          <ToolbarBtn onClick={addImage} icon={ImageIcon} />
        </div>

      </div>
    </div>
  );
};

// Subcomponentes da Toolbar
const ToolbarBtn = ({ onClick, isActive, icon: Icon, disabled, className, label }: any) => (
  <button
    onClick={onClick}
    disabled={disabled}
    className={`
      p-1.5 rounded-md flex items-center gap-1 transition-all
      ${isActive 
        ? 'bg-zinc-200 dark:bg-zinc-700 text-zinc-900 dark:text-white shadow-inner' 
        : 'text-zinc-500 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:text-zinc-900'}
      ${disabled ? 'opacity-30 cursor-not-allowed' : ''}
      ${className}
    `}
    title={label}
  >
    <Icon size={18} strokeWidth={2.5} />
  </button>
);

const ActionButton = ({ icon: Icon, label }: any) => (
  <button className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-md transition-colors">
    <Icon size={14} />
    <span className="hidden sm:inline">{label}</span>
  </button>
);