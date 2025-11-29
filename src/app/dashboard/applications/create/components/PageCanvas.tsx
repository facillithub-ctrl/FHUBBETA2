'use client';

import { useEditor, EditorContent, Extension } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';

// --- IMPORTAÇÃO DE TODAS AS EXTENSÕES NECESSÁRIAS ---
import { Image } from '@tiptap/extension-image';
import { Youtube } from '@tiptap/extension-youtube';
import { Table } from '@tiptap/extension-table';
import { TableRow } from '@tiptap/extension-table-row';
import { TableCell } from '@tiptap/extension-table-cell';
import { TableHeader } from '@tiptap/extension-table-header';
import { TextAlign } from '@tiptap/extension-text-align';
import { TextStyle } from '@tiptap/extension-text-style';
import { FontFamily } from '@tiptap/extension-font-family';
import { Underline } from '@tiptap/extension-underline';
import { Color } from '@tiptap/extension-color';
import { Highlight } from '@tiptap/extension-highlight';
import { Link as TiptapLink } from '@tiptap/extension-link';
import { CharacterCount } from '@tiptap/extension-character-count';
import { TaskList } from '@tiptap/extension-task-list';
import { TaskItem } from '@tiptap/extension-task-item';
import { Placeholder } from '@tiptap/extension-placeholder';
import { Subscript } from '@tiptap/extension-subscript';
import { Superscript } from '@tiptap/extension-superscript';

import { useState, useEffect } from 'react';
import CreateToolbar from './CreateToolbar';
import Ruler from './Ruler';
import { saveDocument } from '../actions';
import Link from 'next/link';
import { ArrowLeft, CheckCircle2, Cloud } from 'lucide-react';

// --- EXTENSÃO CUSTOMIZADA PARA TAMANHO DA FONTE (ESSENCIAL) ---
const FontSize = Extension.create({
  name: 'fontSize',
  addOptions() {
    return {
      types: ['textStyle'],
    };
  },
  addGlobalAttributes() {
    return [
      {
        types: this.options.types,
        attributes: {
          fontSize: {
            default: null,
            parseHTML: element => element.style.fontSize.replace(/['"]+/g, ''),
            renderHTML: attributes => {
              if (!attributes.fontSize) return {};
              return { style: `font-size: ${attributes.fontSize}` };
            },
          },
        },
      },
    ];
  },
  addCommands() {
    return {
      setFontSize: (fontSize: string) => ({ chain }: any) => {
        return chain().setMark('textStyle', { fontSize }).run();
      },
      unsetFontSize: () => ({ chain }: any) => {
        return chain().setMark('textStyle', { fontSize: null }).removeEmptyTextStyle().run();
      },
    };
  },
});

interface PageCanvasProps {
  initialContent: any;
  documentId: string;
  initialTitle: string;
}

export default function PageCanvas({ initialContent, documentId, initialTitle }: PageCanvasProps) {
  const [title, setTitle] = useState(initialTitle);
  const [saveStatus, setSaveStatus] = useState<'saved' | 'saving' | 'unsaved'>('saved');

  // Previne erro de "Unknown node type" com conteúdo padrão seguro
  const defaultContent = {
    type: 'doc',
    content: [
      { type: 'heading', attrs: { level: 1 }, content: [{ type: 'text', text: initialTitle || 'Novo Projeto' }] },
      { type: 'paragraph', content: [] }
    ]
  };

  const safeContent = (initialContent && Object.keys(initialContent).length > 0) ? initialContent : defaultContent;

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3, 4, 5, 6] },
        dropcursor: { color: '#8B5CF6', width: 2 },
        codeBlock: false, // Desabilitamos para usar extensão especifica se necessario
      }),
      // Mídia
      Image.configure({ inline: true, allowBase64: true }),
      Youtube.configure({ width: 480, height: 320 }),
      // Tabelas
      Table.configure({ resizable: true, HTMLAttributes: { class: 'border-collapse table-auto w-full my-4' } }),
      TableRow, TableHeader, TableCell,
      // Estilo e Formatação
      TextStyle, 
      FontSize, 
      FontFamily,
      Underline,
      Subscript,
      Superscript,
      Color,
      Highlight.configure({ multicolor: true }),
      // Funcionalidades
      TiptapLink.configure({ 
        openOnClick: false, 
        autolink: true,
        HTMLAttributes: { class: 'text-blue-600 underline cursor-pointer hover:text-blue-800' } 
      }),
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
      CharacterCount,
      TaskList,
      TaskItem.configure({ nested: true }),
      Placeholder.configure({ 
          placeholder: 'Comece a escrever...',
          emptyEditorClass: 'is-editor-empty before:content-[attr(data-placeholder)] before:text-gray-300 before:float-left before:pointer-events-none'
      }),
    ],
    immediatelyRender: false, // CRÍTICO: Previne erro de hidratação no Next.js 15
    content: safeContent,
    editorProps: {
      attributes: {
        // Estilo da "Folha de Papel"
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

  // Autosave
  useEffect(() => {
    const interval = setInterval(() => {
        if (saveStatus === 'unsaved' && editor) handleSave();
    }, 5000);
    return () => clearInterval(interval);
  }, [saveStatus, editor]);

  const handleSave = async () => {
    if (!editor) return;
    setSaveStatus('saving');
    try {
      await saveDocument(documentId, editor.getJSON(), title);
      setSaveStatus('saved');
    } catch (error) {
      console.error(error);
      setSaveStatus('unsaved');
    }
  };

  return (
    <div className="flex flex-col h-screen bg-studio-dots overflow-hidden relative font-sans">
      
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-md border-b border-gray-200 h-16 flex items-center justify-between px-4 md:px-6 shrink-0 z-50">
        <div className="flex items-center gap-3 w-full">
          <Link href="/dashboard/applications/create" className="hover:bg-gray-100 p-2 rounded-full text-gray-500 transition-colors">
            <ArrowLeft size={20} />
          </Link>
          <div className="flex flex-col w-full max-w-md">
             <input 
               value={title}
               onChange={(e) => { setTitle(e.target.value); setSaveStatus('unsaved'); }}
               className="text-lg font-bold font-dk-lemons bg-transparent border-none focus:ring-0 text-gray-800 w-full placeholder-gray-300 p-0 truncate"
               placeholder="Título do Documento"
             />
             <div className="flex items-center gap-2 text-[10px] text-gray-400">
                {saveStatus === 'saving' && <span className="flex items-center gap-1 text-brand-purple"><Cloud size={12} className="animate-bounce"/> Salvando...</span>}
                {saveStatus === 'saved' && <span className="flex items-center gap-1 text-green-600"><CheckCircle2 size={12}/> Salvo</span>}
                {saveStatus === 'unsaved' && <span className="text-orange-400">Alterações pendentes</span>}
             </div>
          </div>
        </div>
      </div>

      {/* Área Principal */}
      <div className="flex-1 overflow-y-auto cursor-default scroll-smooth relative" onClick={() => editor?.commands.focus()}>
        <div className="flex flex-col items-center py-4 md:py-6 min-h-full">
          
          <div className="sticky top-4 z-40 w-full px-2 md:px-0 mb-4">
             <CreateToolbar editor={editor} onSave={handleSave} isSaving={saveStatus === 'saving'} />
          </div>
          
          <div className="w-full overflow-x-auto px-4 md:px-0 flex justify-center pb-32">
             <div className="relative transform origin-top transition-all duration-500">
                <div className="hidden md:block"><Ruler /></div>
                <EditorContent editor={editor} />
             </div>
          </div>
          
        </div>
      </div>
    </div>
  );
}