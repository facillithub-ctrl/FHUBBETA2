'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import TextStyle from '@tiptap/extension-text-style';
import FontFamily from '@tiptap/extension-font-family';
import { Color } from '@tiptap/extension-color';
import Highlight from '@tiptap/extension-highlight';
import TextAlign from '@tiptap/extension-text-align';
import Underline from '@tiptap/extension-underline';
import TaskList from '@tiptap/extension-task-list';
import TaskItem from '@tiptap/extension-task-item';
import Link from 'next/link';
import { 
  ArrowLeft, Save, Cloud, CheckCircle2, Loader2, Printer 
} from 'lucide-react';

import { ResizableShapeExtension } from '../extensions/ResizableShape';
import { ColumnExtension } from '../extensions/ColumnExtension';
import { Toolbar } from '../components/CreateToolbar';
import { getDocumentById, saveDocumentContent } from '../actions';
import { PageSettings, PAGE_SIZES, PAGE_MARGINS } from '../types';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function EditorPage({ params }: PageProps) {
  const resolvedParams = React.use(params);
  const { id } = resolvedParams;

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [docTitle, setDocTitle] = useState('Documento');
  
  // Estado do Layout (A4, Margens)
  const [pageSettings, setPageSettings] = useState<PageSettings>({
    size: 'a4',
    orientation: 'portrait',
    margin: 'normal',
    columns: 1
  });

  const saveTimerRef = useRef<NodeJS.Timeout | null>(null);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({ heading: { levels: [1, 2, 3] } }),
      TextStyle, FontFamily, Color, Underline,
      Highlight.configure({ multicolor: true }),
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
      TaskList, TaskItem.configure({ nested: true }),
      ResizableShapeExtension, // Agora funciona sem erro de tipo
      ColumnExtension,
    ],
    editorProps: {
      attributes: {
        // Classe mínima, o estilo real vem do container pai (getPageStyle)
        class: 'focus:outline-none prose prose-slate max-w-none h-full',
        style: 'min-height: 100%;',
      },
    },
    onUpdate: ({ editor }) => {
      setIsSaving(true);
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
      saveTimerRef.current = setTimeout(async () => {
        try {
          await saveDocumentContent(id, editor.getJSON());
        } finally {
          setIsSaving(false);
        }
      }, 2000);
    },
  });

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      const doc = await getDocumentById(id);
      if (mounted && doc) {
        setDocTitle(doc.title);
        if (editor && editor.isEmpty && doc.content) {
           editor.commands.setContent(doc.content);
        }
      }
      if (mounted) setIsLoading(false);
    };
    load();
    return () => { mounted = false; };
  }, [id, editor]);

  // Função para focar no editor clicando na "folha"
  const handlePageClick = (e: React.MouseEvent) => {
    if (editor && !editor.isFocused && e.target === e.currentTarget) {
      editor.commands.focus();
    }
  };

  // Estilo Dinâmico da Página (Word)
  const getPageStyle = () => {
    const size = PAGE_SIZES[pageSettings.size];
    const width = pageSettings.orientation === 'portrait' ? size.w : size.h;
    const height = pageSettings.orientation === 'portrait' ? size.h : size.w;
    const padding = PAGE_MARGINS[pageSettings.margin];

    return {
      width: width,
      minHeight: height,
      padding: padding,
      // Suporte a colunas visual
      columnCount: pageSettings.columns > 1 ? pageSettings.columns : 'auto',
      columnGap: '2rem',
    };
  };

  if (isLoading) return <div className="h-full flex items-center justify-center bg-[#F3F4F6]"><Loader2 className="animate-spin text-blue-600" /></div>;

  return (
    <div className="flex flex-col h-full bg-[#E3E5E8] dark:bg-[#0C0C0E] overflow-hidden">
      
      {/* Header */}
      <header className="h-14 bg-white dark:bg-[#1a1b1e] border-b border-gray-200 dark:border-white/10 flex items-center justify-between px-4 shrink-0 z-50">
        <div className="flex items-center gap-3">
          <Link href="/dashboard/applications/create" className="p-2 hover:bg-gray-100 rounded-lg text-gray-500">
            <ArrowLeft size={20} />
          </Link>
          <div>
            <h1 className="text-sm font-bold text-gray-800 dark:text-white leading-none">{docTitle}</h1>
            <div className="text-[10px] text-gray-400 mt-0.5 flex items-center gap-1.5">
               {isSaving ? <span className="text-blue-500 flex items-center gap-1"><Cloud size={10} /> Salvando...</span> : <span className="flex items-center gap-1"><CheckCircle2 size={10} className="text-emerald-500"/> Salvo</span>}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
           <button className="p-2 hover:bg-gray-100 dark:hover:bg-white/5 rounded-lg text-gray-600"><Printer size={18} /></button>
           <button onClick={() => saveDocumentContent(id, editor?.getJSON())} className="flex items-center gap-2 px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-full shadow-sm transition">
              <Save size={14} /> Salvar
           </button>
        </div>
      </header>

      {/* Toolbar */}
      <Toolbar 
        editor={editor} 
        pageSettings={pageSettings} 
        setPageSettings={setPageSettings} 
        onAddPage={() => editor?.chain().focus().setHorizontalRule().run()} 
        onPrint={() => window.print()}
      />

      {/* Canvas - Scroll Corrigido */}
      <div className="flex-1 overflow-y-auto bg-[#E3E5E8] dark:bg-[#0C0C0E] relative scrollbar-thin scrollbar-thumb-gray-300 p-8 print:p-0 print:bg-white">
        <div className="flex justify-center min-h-full pb-32 print:pb-0">
           
           {/* A Folha de Papel */}
           <div 
             className="bg-white dark:bg-[#151515] dark:text-gray-200 shadow-lg print:shadow-none transition-all duration-300 ease-in-out cursor-text relative"
             style={getPageStyle()}
             onClick={handlePageClick}
           >
             <EditorContent editor={editor} />
           </div>

        </div>
      </div>
      
      <style jsx global>{`
        @media print {
          @page { margin: 0; size: auto; }
          body { background: white; }
          .print\\:hidden, header, .sticky { display: none !important; }
          .ProseMirror hr { page-break-after: always; opacity: 0; } 
        }
        .ProseMirror hr {
          border-top: 2px dashed #ccc;
          margin: 2rem 0;
          position: relative;
        }
        .ProseMirror hr::after {
          content: 'Quebra de Página';
          position: absolute; right: 0; top: -10px; font-size: 10px; color: #999; background: #f0f0f0; padding: 2px 5px; border-radius: 4px;
        }
      `}</style>
    </div>
  );
}