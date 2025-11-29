'use client';

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
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
import { ArrowLeft, Cloud, CheckCircle2 } from 'lucide-react';

interface EditorCanvasProps {
  initialContent: any;
  documentId: string;
  initialTitle: string;
}

export default function EditorCanvas({ initialContent, documentId, initialTitle }: EditorCanvasProps) {
  const [title, setTitle] = useState(initialTitle);
  const [saveStatus, setSaveStatus] = useState<'saved' | 'saving' | 'unsaved'>('saved');

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3] },
        dropcursor: { color: '#8B5CF6', width: 2 }
      }),
      Image.configure({ inline: true }),
      Table.configure({ resizable: true, HTMLAttributes: { class: 'border-collapse table-auto w-full' } }),
      TableRow,
      TableHeader,
      TableCell,
      TextStyle,
      FontFamily,
      Underline,
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
      Placeholder.configure({ 
          placeholder: 'Comece a digitar seu resumo incrível...',
          emptyEditorClass: 'is-editor-empty before:content-[attr(data-placeholder)] before:text-gray-300 before:float-left before:pointer-events-none'
      }),
    ],
    immediatelyRender: false,
    content: initialContent || {},
    editorProps: {
      attributes: {
        // Estilização da "Folha de Papel"
        class: 'prose prose-lg max-w-none focus:outline-none min-h-[1123px] w-[210mm] mx-auto bg-white paper-shadow my-8 p-[25mm] font-letters text-gray-800 selection:bg-purple-100 selection:text-purple-900',
        style: 'font-family: "Letters For Learners", sans-serif;',
      },
    },
    onUpdate: () => setSaveStatus('unsaved')
  });

  const handleSave = async () => {
    if (!editor) return;
    setSaveStatus('saving');
    try {
      await saveDocument(documentId, editor.getJSON(), title);
      setSaveStatus('saved');
    } catch (error) {
      console.error(error);
      alert("Erro ao salvar. Verifique sua conexão.");
      setSaveStatus('unsaved');
    }
  };

  return (
    <div className="flex flex-col h-screen bg-studio-dots overflow-hidden relative font-sans">
      
      {/* Header Minimalista do Editor */}
      <div className="bg-white/80 backdrop-blur border-b border-gray-200 h-16 flex items-center justify-between px-6 shrink-0 z-50">
        <div className="flex items-center gap-4 w-full">
          <Link 
             href="/dashboard/applications/create" 
             className="w-10 h-10 flex items-center justify-center hover:bg-gray-100 rounded-full text-gray-500 transition-colors"
             title="Voltar para Projetos"
          >
            <ArrowLeft size={22} />
          </Link>
          
          <div className="h-8 w-px bg-gray-200 mx-2 hidden sm:block"></div>

          <input 
            value={title}
            onChange={(e) => { setTitle(e.target.value); setSaveStatus('unsaved'); }}
            className="text-xl font-bold font-dk-lemons bg-transparent border-none focus:ring-0 text-gray-800 w-full md:w-96 placeholder-gray-300 p-0"
            placeholder="Nome do seu Projeto"
          />
        </div>

        <div className="flex items-center gap-3 text-xs font-medium text-gray-400 whitespace-nowrap">
            {saveStatus === 'saving' && <span className="flex items-center gap-1 text-brand-purple"><Cloud size={14} className="animate-bounce"/> Salvando...</span>}
            {saveStatus === 'saved' && <span className="flex items-center gap-1 text-green-600"><CheckCircle2 size={14}/> Salvo</span>}
            {saveStatus === 'unsaved' && <span className="text-orange-400">Não salvo</span>}
        </div>
      </div>

      {/* Área de Trabalho */}
      <div 
        className="flex-1 overflow-y-auto studio-scrollbar cursor-default scroll-smooth" 
        onClick={() => editor?.commands.focus()}
      >
        <div className="flex flex-col items-center py-6 min-h-full">
          
          {/* Toolbar Flutuante */}
          <CreateToolbar editor={editor} onSave={handleSave} isSaving={saveStatus === 'saving'} />
          
          {/* Container do Papel com Régua */}
          <div className="relative z-0">
             <Ruler />
             <EditorContent editor={editor} />
          </div>
          
          <div className="h-20"></div> {/* Espaço extra no final */}
        </div>
      </div>
    </div>
  );
}