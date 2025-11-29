'use client';

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { TextStyle } from '@tiptap/extension-text-style';
import { FontFamily } from '@tiptap/extension-font-family';
import { TextAlign } from '@tiptap/extension-text-align';
import { Underline } from '@tiptap/extension-underline';
import { useState, useEffect } from 'react';
import CreateToolbar from './CreateToolbar';
import { saveDocument, generateAISummary } from '../actions';

// Configuração das extensões do Tiptap
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

interface EditorCanvasProps {
  initialContent: any;
  documentId: string;
  initialTitle: string;
}

export default function EditorCanvas({ initialContent, documentId, initialTitle }: EditorCanvasProps) {
  const [isSaving, setIsSaving] = useState(false);
  const [title, setTitle] = useState(initialTitle);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);

  const editor = useEditor({
    extensions: CustomExtensions,
    immediatelyRender: false, // CRÍTICO: Evita erro de hidratação no Next.js 15
    content: initialContent || {
        type: 'doc',
        content: [
            { type: 'heading', attrs: { level: 1 }, content: [{ type: 'text', text: 'Título do Resumo' }] },
            { type: 'paragraph', content: [{ type: 'text', text: 'Comece a escrever seu resumo aqui...' }] }
        ]
    },
    editorProps: {
      attributes: {
        // Classes Tailwind em UMA ÚNICA LINHA para evitar o erro "InvalidCharacterError"
        class: 'prose prose-lg max-w-none focus:outline-none min-h-[1000px] w-[210mm] mx-auto bg-[#fdfbf7] shadow-2xl my-8 p-[20mm] font-letters text-gray-800 selection:bg-purple-200',
        style: 'font-family: "Letters For Learners", sans-serif;',
      },
    },
    onUpdate: () => {
       // Você pode adicionar um debounce para auto-save aqui se desejar
    }
  });

  // Função para salvar no banco de dados
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
      // Feedback visual de erro pode ser adicionado aqui (Toast)
    } finally {
      setIsSaving(false);
    }
  };

  // Função para gerar resumo com IA
  const handleSummary = async () => {
    if (!editor) return;
    const text = editor.getText();
    const summary = await generateAISummary(text);
    
    // Insere o resumo formatado no final do documento
    editor.chain().focus().insertContent(`
      <br>
      <h2 style="font-family: 'Dk Lemons'; color: #6b21a8;">Resumo Inteligente</h2>
      <p style="font-family: 'Letters For Learners';">${summary}</p>
    `).run();
  };

  return (
    <div className="flex flex-col h-screen bg-gray-100 overflow-hidden relative">
      {/* Barra Superior com Título e Status */}
      <div className="bg-white px-6 py-3 border-b border-gray-200 flex items-center justify-between shrink-0 z-20">
         <input 
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="text-xl font-bold font-dk-lemons bg-transparent border-none focus:ring-0 text-gray-800 w-full placeholder-gray-400"
            placeholder="Nome do Arquivo..."
         />
         <span className="text-xs font-medium text-gray-400 whitespace-nowrap bg-gray-50 px-3 py-1 rounded-full border border-gray-100">
            {lastSaved ? `Salvo às ${lastSaved.toLocaleTimeString()}` : 'Alterações não salvas'}
         </span>
      </div>

      {/* Toolbar de Ferramentas */}
      <div className="shrink-0 z-10">
        <CreateToolbar 
            editor={editor} 
            onSave={handleSave} 
            isSaving={isSaving}
            onGenerateSummary={handleSummary}
        />
      </div>
      
      {/* Área do "Papel" (Scrollável) */}
      <div 
        className="flex-1 overflow-y-auto bg-gray-200 cursor-text scroll-smooth p-8" 
        onClick={() => editor?.commands.focus()}
      >
        <div className="flex justify-center min-h-full pb-32">
            <EditorContent editor={editor} />
        </div>
      </div>
    </div>
  );
}