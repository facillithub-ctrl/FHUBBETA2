'use client';

import React from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import TextStyle from '@tiptap/extension-text-style';
import FontFamily from '@tiptap/extension-font-family';
import { Color } from '@tiptap/extension-color';
import Highlight from '@tiptap/extension-highlight';
import TextAlign from '@tiptap/extension-text-align';
import Underline from '@tiptap/extension-underline';
import { ShapeExtension } from '../extensions/ShapeExtension';
import { Toolbar } from '../components/CreateToolbar';
import { ArrowLeft, Share2, Save } from 'lucide-react';
import Link from 'next/link';

export default function EditorPage({ params }: { params: { id: string } }) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      TextStyle,
      FontFamily,
      Color,
      Underline,
      Highlight.configure({ multicolor: true }),
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
      ShapeExtension,
    ],
    content: `
      <h2>Documento ${params.id}</h2>
      <p>Comece a criar seu mapa mental, resumo ou slide aqui. Use a barra acima para personalizar.</p>
    `,
    editorProps: {
      attributes: {
        class: 'prose prose-zinc max-w-none focus:outline-none min-h-[800px] p-8 bg-white shadow-sm mx-auto my-8 border border-zinc-200',
        style: 'width: 210mm; min-height: 297mm;', // Formato A4
      },
    },
  });

  return (
    <div className="flex flex-col h-screen bg-zinc-100 dark:bg-zinc-950">
      
      {/* Header de Navegação */}
      <header className="h-14 bg-white dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between px-4 shrink-0">
        <div className="flex items-center gap-4">
          <Link href="/dashboard/applications/create" className="p-2 hover:bg-zinc-100 rounded-full transition">
            <ArrowLeft size={20} className="text-zinc-600" />
          </Link>
          <div className="flex flex-col">
            <h1 className="text-sm font-bold text-zinc-900 dark:text-white">Projeto de História - Resumo</h1>
            <span className="text-[10px] text-zinc-500">Última edição há 2 min</span>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <button className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-zinc-700 bg-white border border-zinc-300 hover:bg-zinc-50 rounded-md transition">
            <Save size={16} />
            Salvar
          </button>
          <button className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md transition shadow-sm">
            <Share2 size={16} />
            Compartilhar
          </button>
        </div>
      </header>

      {/* Barra de Ferramentas Fixa */}
      <Toolbar editor={editor} />

      {/* Área de Edição (Canvas com Scroll) */}
      <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-zinc-300 dark:scrollbar-thumb-zinc-700 flex justify-center py-8">
        <EditorContent editor={editor} />
      </div>
    </div>
  );
}