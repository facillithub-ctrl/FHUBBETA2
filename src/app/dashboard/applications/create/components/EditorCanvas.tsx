'use client';

import { useEditor, EditorContent, Extension } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { Image } from '@tiptap/extension-image';
import { TextAlign } from '@tiptap/extension-text-align';
import { TextStyle } from '@tiptap/extension-text-style';
import { Color } from '@tiptap/extension-color';
import { Underline } from '@tiptap/extension-underline';
import { Link as TiptapLink } from '@tiptap/extension-link';
import { Placeholder } from '@tiptap/extension-placeholder';
// Extensões Personalizadas
import { ShapeExtension } from '../extensions/ShapeExtension';
import { Columns, Column } from '../extensions/ColumnExtension';

import { useState, useEffect } from 'react';
import CreateToolbar from './CreateToolbar';
import Ruler from './Ruler';
import EditorBubbleMenu from './EditorBubbleMenu';
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

  const safeContent = (initialContent && Object.keys(initialContent).length > 0) 
    ? initialContent 
    : { type: 'doc', content: [{ type: 'paragraph' }] };

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        dropcursor: { color: '#8B5CF6', width: 2 },
      }),
      Image.configure({ inline: true, allowBase64: true }),
      TextAlign.configure({ types: ['heading', 'paragraph', 'image'] }),
      TextStyle, FontSize, Underline, Color,
      TiptapLink.configure({ openOnClick: false, autolink: true }),
      Placeholder.configure({ placeholder: 'Comece a criar...' }),
      ShapeExtension,
      Columns, 
      Column,
    ],
    editorProps: {
      attributes: {
        class: 'prose prose-lg max-w-none focus:outline-none h-full',
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

  const pageStyle = getPageStyle();

  return (
    <div className="flex h-screen bg-[#f3f4f6] overflow-hidden font-sans">
      <aside className={`flex-shrink-0 bg-white border-r border-gray-200 transition-all duration-300 z-50 ${isSidebarOpen ? 'w-80 translate-x-0' : 'w-0 -translate-x-full overflow-hidden'} fixed inset-y-0 left-0 md:relative no-print shadow-xl md:shadow-none`}>
        <button onClick={() => setIsSidebarOpen(false)} className="md:hidden absolute top-2 right-2 p-2 text-gray-500 hover:text-red-500 z-50"><X size={20}/></button>
        <CreateToolbar 
            editor={editor} 
            onSave={handleSave} 
            isSaving={saveStatus === 'saving'} 
            onExport={() => window.print()} 
            pageSettings={pageSettings} 
            setPageSettings={setPageSettings} 
        />
      </aside>

      <main className="flex-1 flex flex-col h-full relative w-full">
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-4 shrink-0 z-40 no-print">
          <div className="flex items-center gap-4 w-full">
            <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-2 hover:bg-gray-100 rounded text-gray-600"><Menu size={20} /></button>
            <Link href="/dashboard/applications/create" className="p-2 hover:bg-gray-100 rounded text-gray-500"><ArrowLeft size={20} /></Link>
            <div className="flex-1 max-w-2xl">
               <input 
                  value={title} 
                  onChange={(e) => { setTitle(e.target.value); setSaveStatus('unsaved'); }} 
                  className="text-lg font-bold w-full border-none focus:ring-0 p-0 text-gray-800 placeholder-gray-300 bg-transparent" 
                  placeholder="Título do Projeto" 
               />
               <span className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">{saveStatus === 'saved' ? 'Salvo' : 'Salvando...'}</span>
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto bg-[#f3f4f6] p-8 flex justify-center cursor-text print:bg-white print:p-0 print:overflow-visible" onClick={() => editor?.commands.focus()}>
           <div 
              className="bg-white shadow-lg transition-all duration-300 relative editor-print-container flex flex-col" 
              style={{ width: pageStyle.width, minHeight: pageStyle.minHeight }}
           >
              <div className="w-full h-6 border-b border-gray-100 no-print relative bg-white z-10">
                  <Ruler width={pageStyle.width} />
              </div>
              
              <div style={{ padding: pageStyle.padding, flex: 1 }}>
                <EditorBubbleMenu editor={editor} />
                <EditorContent editor={editor} className="outline-none h-full" />
              </div>
           </div>
        </div>
      </main>
      
      {isSidebarOpen && <div className="fixed inset-0 bg-black/20 z-40 md:hidden" onClick={() => setIsSidebarOpen(false)}></div>}
    </div>
  );
}