'use client';

import { useEditor, EditorContent, Extension } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';

// --- IMPORTAÇÃO DAS EXTENSÕES ---
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
import { ArrowLeft, CheckCircle2, Cloud, AlertCircle } from 'lucide-react';

// --- EXTENSÃO CUSTOMIZADA PARA TAMANHO DA FONTE ---
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

interface EditorCanvasProps {
  initialContent: any;
  documentId: string;
  initialTitle: string;
}

export default function EditorCanvas({ initialContent, documentId, initialTitle }: EditorCanvasProps) {
  const [title, setTitle] = useState(initialTitle);
  const [saveStatus, setSaveStatus] = useState<'saved' | 'saving' | 'unsaved' | 'error'>('saved');

  // Garante que o conteúdo inicial seja válido
  const safeContent = (initialContent && Object.keys(initialContent).length > 0) 
    ? initialContent 
    : { type: 'doc', content: [{ type: 'paragraph' }] };

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3, 4, 5, 6] },
        dropcursor: { color: '#8B5CF6', width: 2 },
        codeBlock: false,
      }),
      // Mídia
      Image.configure({ inline: true, allowBase64: true }),
      Youtube.configure({ width: 480, height: 320 }),
      // Tabelas
      Table.configure({ resizable: true, HTMLAttributes: { class: 'border-collapse table-auto w-full my-4' } }),
      TableRow, TableHeader, TableCell,
      // Estilos
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
          placeholder: 'Comece a escrever sua ideia...',
          emptyEditorClass: 'is-editor-empty before:content-[attr(data-placeholder)] before:text-gray-300 before:float-left before:pointer-events-none'
      }),
    ],
    editorProps: {
      attributes: {
        // CORREÇÃO AQUI: String única, sem quebras de linha
        class: 'prose prose-lg max-w-none focus:outline-none w-[210mm] min-h-[297mm] mx-auto bg-white paper-shadow my-8 p-[20mm] font-letters text-gray-800 selection:bg-brand-purple/20 selection:text-brand-purple',
        style: 'font-family: "Letters For Learners", sans-serif;',
      },
    },
    immediatelyRender: false,
    content: safeContent,
    onUpdate: () => setSaveStatus('unsaved'),
  });

  // Autosave
  useEffect(() => {
    const interval = setInterval(() => {
        if (saveStatus === 'unsaved' && editor) handleSave();
    }, 4000);
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
      setSaveStatus('error');
    }
  };

  return (
    <div className="flex flex-col h-screen bg-studio-dots overflow-hidden relative font-sans">
      
      {/* HEADER */}
      <div className="bg-white/90 backdrop-blur-md border-b border-gray-200 h-16 flex items-center justify-between px-4 lg:px-8 shrink-0 z-50">
        <div className="flex items-center gap-4 w-full max-w-3xl">
          <Link href="/dashboard/applications/create" className="p-2 hover:bg-gray-100 rounded-full text-gray-500 transition-colors">
            <ArrowLeft size={20} />
          </Link>
          
          <div className="h-6 w-px bg-gray-300 mx-1 hidden sm:block"></div>

          <div className="flex flex-col flex-1">
             <input 
               value={title}
               onChange={(e) => { setTitle(e.target.value); setSaveStatus('unsaved'); }}
               className="text-xl font-bold font-dk-lemons bg-transparent border-none focus:ring-0 text-gray-800 w-full placeholder-gray-300 p-0 leading-tight truncate"
               placeholder="Título do Documento"
             />
             <div className="flex items-center gap-2 text-[10px] font-medium uppercase tracking-wide text-gray-400 mt-0.5">
                {saveStatus === 'saving' && <span className="flex items-center gap-1 text-brand-purple"><Cloud size={10} className="animate-bounce"/> Salvando</span>}
                {saveStatus === 'saved' && <span className="flex items-center gap-1 text-green-600"><CheckCircle2 size={10}/> Salvo</span>}
                {saveStatus === 'unsaved' && <span className="text-orange-400">Não salvo</span>}
                {saveStatus === 'error' && <span className="flex items-center gap-1 text-red-500"><AlertCircle size={10}/> Erro ao salvar</span>}
             </div>
          </div>
        </div>
      </div>

      {/* ÁREA PRINCIPAL DO EDITOR */}
      <div className="flex-1 overflow-y-auto cursor-default scroll-smooth relative bg-studio-dots" onClick={() => editor?.commands.focus()}>
        <div className="flex flex-col items-center py-6 min-h-full">
          
          {/* BARRA DE FERRAMENTAS FLUTUANTE */}
          <div className="sticky top-4 z-40 w-full px-4 mb-6 max-w-[214mm]">
             <CreateToolbar editor={editor} onSave={handleSave} isSaving={saveStatus === 'saving'} />
          </div>
          
          {/* FOLHA DE PAPEL */}
          <div className="w-full overflow-x-auto px-4 md:px-0 flex justify-center pb-32">
             <div className="relative transform transition-all duration-300 origin-top">
                <div className="hidden md:block select-none opacity-50 hover:opacity-100 transition-opacity">
                   <Ruler />
                </div>
                <EditorContent editor={editor} />
             </div>
          </div>
          
        </div>
      </div>
    </div>
  );
}