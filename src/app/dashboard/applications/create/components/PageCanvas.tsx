'use client';

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
// Imports nomeados para evitar erros de build
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
import { Color } from '@tiptap/extension-color'; // Opcional, para cores

import { useState } from 'react';
import CreateToolbar from './CreateToolbar';
import Ruler from './Ruler';
import { saveDocument } from '../actions';
import Link from 'next/link';
import { ArrowLeft, CheckCircle2, Cloud, FileText } from 'lucide-react';

interface PageCanvasProps {
  initialContent: any;
  documentId: string;
  initialTitle: string;
}

export default function PageCanvas({ initialContent, documentId, initialTitle }: PageCanvasProps) {
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
      Color,
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
      Placeholder.configure({ 
          placeholder: 'Comece a criar algo incrível...',
          emptyEditorClass: 'is-editor-empty before:content-[attr(data-placeholder)] before:text-gray-300 before:float-left before:pointer-events-none'
      }),
    ],
    immediatelyRender: false, // CRÍTICO para Next.js 15
    content: initialContent || {},
    editorProps: {
      attributes: {
        // Classes Tailwind otimizadas
        // w-[210mm] define a largura A4
        // min-h-[297mm] define altura A4 mínima
        class: `
          prose prose-lg max-w-none focus:outline-none 
          w-[210mm] min-h-[297mm] mx-auto 
          bg-white paper-shadow my-4 md:my-8 p-[15mm] md:p-[25mm] 
          font-letters text-gray-800 
          selection:bg-brand-purple/20 selection:text-brand-purple
        `,
        style: 'font-family: "Letters For Learners", sans-serif;',
      },
    },
    onUpdate: () => setSaveStatus('unsaved')
  });

  const handleSave = async () => {
    if (!editor) return;
    setSaveStatus('saving');
    try {
      await saveDocument(documentId, editor.getJSON(), title); // removido plainText se não usado na action
      setSaveStatus('saved');
    } catch (error) {
      console.error(error);
      alert("Erro ao salvar. Verifique sua conexão.");
      setSaveStatus('unsaved');
    }
  };

  return (
    <div className="flex flex-col h-screen bg-studio-dots overflow-hidden relative font-sans">
      
      {/* Header Mobile-First */}
      <div className="bg-white/80 backdrop-blur border-b border-gray-200 h-16 flex items-center justify-between px-4 md:px-6 shrink-0 z-50">
        <div className="flex items-center gap-3 w-full">
          <Link 
             href="/dashboard/applications/create" 
             className="w-10 h-10 flex items-center justify-center hover:bg-gray-100 rounded-full text-gray-500 transition-colors flex-shrink-0"
          >
            <ArrowLeft size={22} />
          </Link>
          
          <div className="flex flex-col w-full max-w-md">
             <input 
               value={title}
               onChange={(e) => { setTitle(e.target.value); setSaveStatus('unsaved'); }}
               className="text-lg md:text-xl font-bold font-dk-lemons bg-transparent border-none focus:ring-0 text-gray-800 w-full placeholder-gray-300 p-0 truncate"
               placeholder="Nome do Projeto"
             />
             <div className="flex items-center gap-2 text-[10px] md:text-xs font-medium text-gray-400">
                {saveStatus === 'saving' && <span className="flex items-center gap-1 text-brand-purple"><Cloud size={12} className="animate-bounce"/> Salvando...</span>}
                {saveStatus === 'saved' && <span className="flex items-center gap-1 text-green-600"><CheckCircle2 size={12}/> Salvo</span>}
                {saveStatus === 'unsaved' && <span className="text-orange-400">Alterações não salvas</span>}
             </div>
          </div>
        </div>
      </div>

      {/* Área de Trabalho */}
      <div 
        className="flex-1 overflow-y-auto cursor-default scroll-smooth relative" 
        onClick={() => editor?.commands.focus()}
      >
        <div className="flex flex-col items-center py-4 md:py-6 min-h-full">
          
          {/* Toolbar Flutuante */}
          <div className="sticky top-2 z-40 w-full px-2 md:px-0">
             <CreateToolbar editor={editor} onSave={handleSave} isSaving={saveStatus === 'saving'} />
          </div>
          
          {/* Container Scrollável Horizontalmente para Mobile (Folha A4) */}
          <div className="w-full overflow-x-auto px-4 md:px-0 flex justify-center pb-20">
             <div className="relative transform origin-top transition-transform duration-300">
                {/* Régua (Opcional, escondida em telas muito pequenas se necessário) */}
                <div className="hidden md:block">
                   <Ruler />
                </div>
                
                {/* O Papel */}
                <EditorContent editor={editor} />
             </div>
          </div>
          
        </div>
      </div>
    </div>
  );
}