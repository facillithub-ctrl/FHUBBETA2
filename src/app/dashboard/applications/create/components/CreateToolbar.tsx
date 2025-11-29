'use client';

import React from 'react';
import { Editor } from '@tiptap/react';
import { 
  Bold, Italic, Underline, Strikethrough, 
  AlignLeft, AlignCenter, AlignRight, AlignJustify,
  Type, Palette, Highlighter, Layout, 
  Square, Circle, Image as ImageIcon, 
  Undo, Redo, Heading1, Heading2, 
  List, ListOrdered, Minus
} from 'lucide-react';

interface Props {
  editor: Editor | null;
}

export const Toolbar = ({ editor }: Props) => {
  if (!editor) return null;

  // Funções Auxiliares
  const setFont = (font: string) => editor.chain().focus().setFontFamily(font).run();
  const setSize = (size: string) => editor.chain().focus().setMark('textStyle', { fontSize: size }).run();

  return (
    <div className="sticky top-0 z-50 bg-white dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800 shadow-sm px-4 py-2 flex flex-col gap-2">
      
      {/* Linha 1: Controles Principais */}
      <div className="flex items-center gap-2 flex-wrap">
        
        {/* Histórico */}
        <div className="flex items-center gap-1 border-r border-zinc-200 dark:border-zinc-700 pr-2">
          <ToolBtn icon={Undo} onClick={() => editor.chain().focus().undo().run()} disabled={!editor.can().undo()} />
          <ToolBtn icon={Redo} onClick={() => editor.chain().focus().redo().run()} disabled={!editor.can().redo()} />
        </div>

        {/* Fonte e Tamanho */}
        <div className="flex items-center gap-2 border-r border-zinc-200 dark:border-zinc-700 pr-2">
          <select 
            className="h-8 text-xs bg-zinc-100 dark:bg-zinc-800 border-none rounded px-2 w-32 focus:ring-0"
            onChange={(e) => setFont(e.target.value)}
          >
            <option value="Inter">Inter (Padrão)</option>
            <option value="Serif">Serif</option>
            <option value="Monospace">Monospace</option>
            <option value="Comic Sans MS">Comic Sans</option>
          </select>
          
          <select 
             className="h-8 text-xs bg-zinc-100 dark:bg-zinc-800 border-none rounded px-2 w-16 focus:ring-0"
             onChange={(e) => console.log('Implementar Size Extension')} // Requer extensão adicional de fontSize
          >
            <option value="12px">12</option>
            <option value="14px">14</option>
            <option value="16px">16</option>
            <option value="24px">24</option>
            <option value="32px">32</option>
          </select>
        </div>

        {/* Estilos Básicos */}
        <div className="flex items-center gap-1 border-r border-zinc-200 dark:border-zinc-700 pr-2">
          <ToolBtn icon={Bold} onClick={() => editor.chain().focus().toggleBold().run()} active={editor.isActive('bold')} />
          <ToolBtn icon={Italic} onClick={() => editor.chain().focus().toggleItalic().run()} active={editor.isActive('italic')} />
          <ToolBtn icon={Underline} onClick={() => editor.chain().focus().toggleUnderline().run()} active={editor.isActive('underline')} />
          <ToolBtn icon={Strikethrough} onClick={() => editor.chain().focus().toggleStrike().run()} active={editor.isActive('strike')} />
        </div>

        {/* Cores */}
        <div className="flex items-center gap-2 border-r border-zinc-200 dark:border-zinc-700 pr-2">
          <div className="relative group flex items-center gap-1 cursor-pointer p-1 hover:bg-zinc-100 rounded">
            <Palette size={16} />
            <input 
              type="color" 
              className="w-4 h-4 p-0 border-none bg-transparent cursor-pointer"
              onInput={(e: any) => editor.chain().focus().setColor(e.target.value).run()}
            />
          </div>
          <ToolBtn 
            icon={Highlighter} 
            onClick={() => editor.chain().focus().toggleHighlight().run()} 
            active={editor.isActive('highlight')} 
            className="text-yellow-500"
          />
        </div>

        {/* Títulos */}
         <div className="flex items-center gap-1 border-r border-zinc-200 dark:border-zinc-700 pr-2">
          <ToolBtn icon={Heading1} onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()} active={editor.isActive('heading', { level: 1 })} />
          <ToolBtn icon={Heading2} onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} active={editor.isActive('heading', { level: 2 })} />
        </div>

        {/* Alinhamento */}
        <div className="flex items-center gap-1 border-r border-zinc-200 dark:border-zinc-700 pr-2">
          <ToolBtn icon={AlignLeft} onClick={() => editor.chain().focus().setTextAlign('left').run()} active={editor.isActive({ textAlign: 'left' })} />
          <ToolBtn icon={AlignCenter} onClick={() => editor.chain().focus().setTextAlign('center').run()} active={editor.isActive({ textAlign: 'center' })} />
          <ToolBtn icon={AlignRight} onClick={() => editor.chain().focus().setTextAlign('right').run()} active={editor.isActive({ textAlign: 'right' })} />
          <ToolBtn icon={AlignJustify} onClick={() => editor.chain().focus().setTextAlign('justify').run()} active={editor.isActive({ textAlign: 'justify' })} />
        </div>

      </div>

      {/* Linha 2: Ferramentas de Criação (Shapes, Layout) */}
      <div className="flex items-center gap-2 bg-zinc-50 dark:bg-zinc-800/50 p-1 rounded-md overflow-x-auto">
        <span className="text-[10px] uppercase font-bold text-zinc-400 px-2 select-none">Inserir:</span>
        
        {/* Formas */}
        <button 
          onClick={() => editor.commands.insertShape({ type: 'square', color: '#ef4444' })}
          className="flex items-center gap-1 px-2 py-1 text-xs hover:bg-zinc-200 dark:hover:bg-zinc-700 rounded transition"
        >
          <Square size={14} className="fill-red-500 stroke-red-600" />
          Quadrado
        </button>
        
        <button 
          onClick={() => editor.commands.insertShape({ type: 'circle', color: '#3b82f6' })}
          className="flex items-center gap-1 px-2 py-1 text-xs hover:bg-zinc-200 dark:hover:bg-zinc-700 rounded transition"
        >
          <Circle size={14} className="fill-blue-500 stroke-blue-600" />
          Círculo
        </button>

        <div className="w-[1px] h-4 bg-zinc-300 dark:bg-zinc-600 mx-1" />

        {/* Layout */}
        <button className="flex items-center gap-1 px-2 py-1 text-xs hover:bg-zinc-200 dark:hover:bg-zinc-700 rounded transition">
          <Layout size={14} />
          Colunas
        </button>

         <button className="flex items-center gap-1 px-2 py-1 text-xs hover:bg-zinc-200 dark:hover:bg-zinc-700 rounded transition">
          <ImageIcon size={14} />
          Mídia
        </button>

         <button 
            onClick={() => editor.chain().focus().setHorizontalRule().run()}
            className="flex items-center gap-1 px-2 py-1 text-xs hover:bg-zinc-200 dark:hover:bg-zinc-700 rounded transition"
        >
          <Minus size={14} />
          Divisor
        </button>

      </div>
    </div>
  );
};

const ToolBtn = ({ icon: Icon, onClick, active, disabled, className }: any) => (
  <button
    onClick={onClick}
    disabled={disabled}
    className={`p-1.5 rounded hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors ${active ? 'bg-zinc-200 dark:bg-zinc-700 text-blue-600' : 'text-zinc-600 dark:text-zinc-400'} ${disabled ? 'opacity-30' : ''} ${className}`}
  >
    <Icon size={18} />
  </button>
);