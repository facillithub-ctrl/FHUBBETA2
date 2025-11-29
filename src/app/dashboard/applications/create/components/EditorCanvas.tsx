'use client';

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
// CORREÇÃO: Usando Named Imports (chaves) para todas as extensões
import { Image } from '@tiptap/extension-image';
import { Table } from '@tiptap/extension-table';
import { TableRow } from '@tiptap/extension-table-row';
import { TableCell } from '@tiptap/extension-table-cell';
import { TableHeader } from '@tiptap/extension-table-header';
import { TextAlign } from '@tiptap/extension-text-align';
import { TextStyle } from '@tiptap/extension-text-style';
import { FontFamily } from '@tiptap/extension-font-family';
import { Underline } from '@tiptap/extension-underline';
import { Placeholder } from '@tiptap/extension-placeholder';

import { useState } from 'react';
import CreateToolbar from './CreateToolbar';
import Ruler from './Ruler';
import { saveDocument } from '../actions';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

interface EditorCanvasProps {
  initialContent: any;
  documentId: string;
  initialTitle: string;
}

export default function EditorCanvas({ initialContent, documentId, initialTitle }: EditorCanvasProps) {
  const [title, setTitle] = useState(initialTitle);
  const [isSaving, setIsSaving] = useState(false);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3] },
        dropcursor: { color: '#8B5CF6' }
      }),
      Image,
      Table.configure({ 
        resizable: true,
      }),
      TableRow,
      TableHeader,
      TableCell,
      TextStyle,
      FontFamily,
      Underline,
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
      Placeholder.configure({ placeholder: 'Comece a escrever...' }),
    ],
    immediatelyRender: false, // Previne erro de hidratação (SSR)
    content: initialContent || {},
    editorProps: {
      attributes: {
        // Classes Tailwind em uma única linha para evitar "InvalidCharacterError"
        class: 'prose prose-lg max-w-none focus:outline-none min-h-[1123px] w-[210mm] mx-auto bg-white shadow-xl my-8 p-[20mm] font-letters text-gray-800 selection:bg-purple-200',
        style: 'font-family: "Letters For Learners", sans-serif;',
      },
    },
  });

  const handleSave = async () => {
    if (!editor) return;
    setIsSaving(true);
    try {
      await saveDocument(documentId, editor.getJSON(), title);
    } catch (error) {
      console.error(error);
      alert("Erro ao salvar");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-gray-100 overflow-hidden">
      
      {/* Header do Editor */}
      <div className="bg-white border-b border-gray-200 h-14 flex items-center justify-between px-4 shrink-0">
        <div className="flex items-center gap-4">
          <Link href="/dashboard/applications/create" className="p-2 hover:bg-gray-100 rounded-full text-gray-500">
            <ArrowLeft size={20} />
          </Link>
          <input 
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="text-lg font-bold font-dk-lemons border-none focus:ring-0 w-96 placeholder-gray-400"
            placeholder="Título do Documento"
          />
        </div>
        <div className="text-xs text-gray-400 font-medium">
            {isSaving ? 'Salvando...' : 'Alterações salvas'}
        </div>
      </div>

      {/* Barra de Ferramentas */}
      <div className="shrink-0 z-20">
        <CreateToolbar editor={editor} onSave={handleSave} isSaving={isSaving} />
      </div>

      {/* Container de Rolagem (Mesa de Trabalho) */}
      <div 
        className="flex-1 overflow-y-auto bg-gray-200/50 bg-grid-pattern cursor-default scroll-smooth" 
        onClick={() => editor?.commands.focus()}
      >
        <div className="flex flex-col items-center py-8 min-h-full">
          
          {/* Régua Horizontal */}
          <div className="sticky top-0 z-10 bg-gray-100 shadow-sm mb-2 select-none">
            <Ruler />
          </div>

          {/* O Papel (Editor) */}
          <EditorContent editor={editor} />
          
        </div>
      </div>
    </div>
  );
}