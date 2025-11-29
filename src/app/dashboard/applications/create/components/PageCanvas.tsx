'use client';

import { useEditor, EditorContent, Extension } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';

// --- EXTENSÕES ---
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
import { ShapeExtension } from '../extensions/ShapeExtension';

import { useState, useEffect } from 'react';
import CreateToolbar from './CreateToolbar';
import Ruler from './Ruler';
import EditorBubbleMenu from './EditorBubbleMenu'; // Importação nova
import { saveDocument } from '../actions';
import Link from 'next/link';
import { ArrowLeft, Menu, X, CheckCircle2, AlertCircle } from 'lucide-react';

const FontSize = Extension.create({
  name: 'fontSize',
  addOptions() { return { types: ['textStyle'] }; },
  addGlobalAttributes() {
    return [{
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
    }];
  },
  addCommands() {
    return {
      setFontSize: (fontSize: string) => ({ chain }: any) => chain().setMark('textStyle', { fontSize }).run(),
      unsetFontSize: () => ({ chain }: any) => chain().setMark('textStyle', { fontSize: null }).removeEmptyTextStyle().run(),
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
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [pageSettings, setPageSettings] = useState({ size: 'a4', margin: 'normal' });

  const getPageStyle = () => {
    let width = '210mm'; 
    let minHeight = '297mm';
    let padding = '25mm';

    if (pageSettings.size === 'letter') { width = '216mm'; minHeight = '279mm'; }
    if (pageSettings.size === 'legal') { width = '216mm'; minHeight = '356mm'; }
    if (pageSettings.margin === 'narrow') padding = '12.7mm';
    if (pageSettings.margin === 'wide') padding = '50mm';

    return { width, minHeight, padding };
  };

  const safeContent = (initialContent && Object.keys(initialContent).length > 0) ? initialContent : { type: 'doc', content: [{ type: 'paragraph' }] };

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3, 4, 5, 6] },
        dropcursor: { color: '#8B5CF6', width: 2 },
        codeBlock: false,
      }),
      Image.configure({ inline: true, allowBase64: true }),
      Youtube.configure({ width: 480, height: 320 }),
      Table.configure({ resizable: true }),
      TableRow, TableHeader, TableCell,
      TextStyle, FontSize, FontFamily, Underline, Subscript, Superscript, Color,
      Highlight.configure({ multicolor: true }),
      TiptapLink.configure({ openOnClick: false, autolink: true }),
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
      CharacterCount, TaskList, TaskItem.configure({ nested: true }),
      Placeholder.configure({ placeholder: 'Comece a criar...' }),
      ShapeExtension, 
    ],
    editorProps: {
      attributes: {
        class: 'prose prose-lg max-w-none focus:outline-none bg-white font-letters text-gray-800 selection:bg-brand-purple/20 h-full min-h-[500px]',
        style: 'font-family: "Letters For Learners", sans-serif;',
      },
    },
    immediatelyRender: false,
    content: safeContent,
    onUpdate: () => setSaveStatus('unsaved'),
  });

  useEffect(() => {
    const interval = setInterval(() => { if (saveStatus === 'unsaved') handleSave(); }, 5000);
    return () => clearInterval(interval);
  }, [saveStatus, editor]);

  const handleSave = async () => {
    if (!editor) return;
    setSaveStatus('saving');
    try {
      await saveDocument(documentId, editor.getJSON(), title);
      setSaveStatus('saved');
    } catch {
      setSaveStatus('error');
    }
  };

  const handleExportPDF = () => window.print();
  const pageStyle = getPageStyle();

  return (
    <div className="flex h-screen bg-[#f0f2f5] overflow-hidden font-sans">
      <aside className={`flex-shrink-0 bg-white border-r border-gray-200 transition-all duration-300 z-50 ${isSidebarOpen ? 'w-80 translate-x-0' : 'w-0 -translate-x-full overflow-hidden'} fixed inset-y-0 left-0 md:relative no-print shadow-xl md:shadow-none`}>
        <button onClick={() => setIsSidebarOpen(false)} className="md:hidden absolute top-2 right-2 p-2 text-gray-500 hover:text-red-500 z-50"><X size={20}/></button>
        <CreateToolbar 
            editor={editor} 
            onSave={handleSave} 
            isSaving={saveStatus === 'saving'} 
            onExport={handleExportPDF} 
            pageSettings={pageSettings} 
            setPageSettings={setPageSettings} 
        />
      </aside>

      <main className="flex-1 flex flex-col h-full relative w-full">
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-4 shrink-0 z-40 no-print">
          <div className="flex items-center gap-4 w-full">
            <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-2 hover:bg-gray-100 rounded text-gray-600"><Menu size={20} /></button>
            <Link href="/dashboard/applications/create" className="p-2 hover:bg-gray-100 rounded text-gray-500"><ArrowLeft size={20} /></Link>
            <div className="flex-1 max-w-2xl flex flex-col justify-center">
               <input 
                  value={title} 
                  onChange={(e) => { setTitle(e.target.value); setSaveStatus('unsaved'); }} 
                  className="text-lg font-bold font-dk-lemons w-full border-none focus:ring-0 p-0 text-gray-800 placeholder-gray-300 bg-transparent" 
                  placeholder="Título do Documento" 
               />
               <div className="flex items-center gap-1.5 h-4">
                 {saveStatus === 'saving' && <span className="text-[10px] text-gray-400 uppercase font-bold tracking-wider flex items-center gap-1"><span className="w-1.5 h-1.5 bg-yellow-400 rounded-full animate-pulse"></span> Salvando...</span>}
                 {saveStatus === 'saved' && <span className="text-[10px] text-green-500 uppercase font-bold tracking-wider flex items-center gap-1"><CheckCircle2 size={10} /> Salvo</span>}
                 {saveStatus === 'error' && <span className="text-[10px] text-red-500 uppercase font-bold tracking-wider flex items-center gap-1"><AlertCircle size={10} /> Erro ao salvar</span>}
               </div>
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto bg-studio-dots p-4 md:p-8 flex justify-center cursor-text" onClick={() => editor?.commands.focus()}>
           <div 
              className="bg-white paper-shadow transition-all duration-300 relative editor-print-container flex flex-col" 
              style={{ width: pageStyle.width, minHeight: pageStyle.minHeight }}
           >
              <div className="w-full h-6 border-b border-gray-100 no-print relative">
                  <Ruler width={pageStyle.width} />
              </div>
              
              <div style={{ padding: pageStyle.padding, flex: 1 }}>
                <EditorBubbleMenu editor={editor} />
                <EditorContent editor={editor} className="outline-none editor-pages h-full" />
              </div>
           </div>
        </div>
      </main>
      
      {isSidebarOpen && <div className="fixed inset-0 bg-black/20 z-40 md:hidden" onClick={() => setIsSidebarOpen(false)}></div>}
    </div>
  );
}