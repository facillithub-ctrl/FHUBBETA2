'use client';

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { TextStyle } from '@tiptap/extension-text-style';
import { FontFamily } from '@tiptap/extension-font-family';
import { TextAlign } from '@tiptap/extension-text-align';
import { Underline } from '@tiptap/extension-underline';
import { useState } from 'react';
import CreateToolbar from './CreateToolbar';
import { saveDocument, generateAISummary } from '../actions';

const CustomExtensions = [
  StarterKit.configure({
    heading: { levels: [1, 2, 3] },
    dropcursor: { color: '#8B5CF6' }
  }),
  TextStyle,
  FontFamily,
  Underline,
  TextAlign.configure({ types: ['heading', 'paragraph'] }),
];

interface PageCanvasProps {
  initialContent: any;
  documentId: string;
  initialTitle: string;
}

export default function PageCanvas({ initialContent, documentId, initialTitle }: PageCanvasProps) {
  const [isSaving, setIsSaving] = useState(false);
  const [title, setTitle] = useState(initialTitle);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);

  const editor = useEditor({
    extensions: CustomExtensions,
    immediatelyRender: false, // Necessário para Next.js 15
    content: initialContent || {
        type: 'doc',
        content: [
            { type: 'heading', attrs: { level: 1 }, content: [{ type: 'text', text: 'Título do Resumo' }] },
            { type: 'paragraph', content: [{ type: 'text', text: 'Comece a escrever seu resumo aqui...' }] }
        ]
    },
    editorProps: {
      attributes: {
        // CORREÇÃO: Todas as classes em uma única linha, sem quebras
        class: 'prose prose-lg max-w-none focus:outline-none min-h-[1000px] w-[210mm] mx-auto bg-[#fdfbf7] shadow-2xl my-8 p-[20mm] font-letters text-gray-800',
        style: 'font-family: "Letters For Learners", sans-serif;',
      },
    },
    onUpdate: ({ editor }) => {
       // Lógica de update
    }
  });

  const handleSave = async () => {
    if (!editor) return;
    setIsSaving(true);
    try {
      const json = editor.getJSON();
      const text = editor.getText();
      await saveDocument(documentId, json, title, text);
      setLastSaved(new Date());
    } catch (err) {
      console.error("Erro ao salvar", err);
      alert("Erro ao salvar documento.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleSummary = async () => {
    if (!editor) return;
    const text = editor.getText();
    const summary = await generateAISummary(text);
    
    editor.chain().focus().insertContent(`
      <br>
      <h2 style="font-family: 'Dk Lemons'">Resumo Inteligente</h2>
      <p style="font-family: 'Letters For Learners'">${summary}</p>
    `).run();
  };

  return (
    <div className="flex flex-col h-screen bg-gray-100 overflow-hidden">
      {/* Input do Título */}
      <div className="bg-white px-6 py-2 border-b flex items-center justify-between z-20">
         <input 
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="text-lg font-semibold bg-transparent border-none focus:ring-0 text-gray-700 w-full"
            placeholder="Nome do Arquivo..."
         />
         <span className="text-xs text-gray-400 whitespace-nowrap">
            {lastSaved ? `Salvo às ${lastSaved.toLocaleTimeString()}` : 'Não salvo'}
         </span>
      </div>

      <CreateToolbar 
        editor={editor} 
        onSave={handleSave} 
        isSaving={isSaving}
        onGenerateSummary={handleSummary}
      />
      
      {/* Área de Scroll */}
      <div className="flex-1 overflow-y-auto bg-gray-200 cursor-text scroll-smooth" onClick={() => editor?.commands.focus()}>
        <div className="py-8 flex justify-center min-h-full">
            <EditorContent editor={editor} />
        </div>
      </div>
    </div>
  );
}