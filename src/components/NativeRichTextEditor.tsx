"use client";

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import CharacterCount from '@tiptap/extension-character-count';
import { useEffect } from 'react';
import { cn } from '@/utils/utils';

// Barra de ferramentas simples e flutuante ou fixa
const MenuBar = ({ editor }: { editor: any }) => {
  if (!editor) return null;

  const buttons = [
    { label: 'B', action: () => editor.chain().focus().toggleBold().run(), isActive: editor.isActive('bold'), title: 'Negrito' },
    { label: 'I', action: () => editor.chain().focus().toggleItalic().run(), isActive: editor.isActive('italic'), title: 'Itálico' },
    { label: 'H1', action: () => editor.chain().focus().toggleHeading({ level: 1 }).run(), isActive: editor.isActive('heading', { level: 1 }), title: 'Título 1' },
    { label: 'H2', action: () => editor.chain().focus().toggleHeading({ level: 2 }).run(), isActive: editor.isActive('heading', { level: 2 }), title: 'Título 2' },
    { label: 'Lista', action: () => editor.chain().focus().toggleBulletList().run(), isActive: editor.isActive('bulletList'), title: 'Lista' },
  ];

  return (
    <div className="flex items-center gap-2 p-2 mb-2 border-b border-gray-200 dark:border-gray-700 sticky top-0 bg-white dark:bg-gray-800 z-10">
      {buttons.map((btn, idx) => (
        <button
          key={idx}
          onClick={btn.action}
          title={btn.title}
          className={cn(
            "px-3 py-1.5 rounded-md text-sm font-bold transition-colors",
            btn.isActive 
              ? "bg-gradient-to-r from-[#42047e] to-[#07f49e] text-white shadow-sm" 
              : "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
          )}
        >
          {btn.label}
        </button>
      ))}
    </div>
  );
};

interface NativeEditorProps {
  value: string;
  onChange: (content: string) => void;
  placeholder?: string;
  editable?: boolean;
}

export default function NativeRichTextEditor({ value, onChange, placeholder = "Começa a escrever...", editable = true }: NativeEditorProps) {
  const editor = useEditor({
    immediatelyRender: false, // CORREÇÃO: Previne erro de hidratação no Next.js
    extensions: [
      StarterKit,
      Placeholder.configure({ placeholder }),
      CharacterCount,
    ],
    content: value,
    editable: editable,
    editorProps: {
      attributes: {
        class: 'prose dark:prose-invert max-w-none focus:outline-none min-h-[300px] p-4 text-gray-800 dark:text-gray-200 leading-relaxed',
      },
    },
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
  });

  // Atualiza o conteúdo se o valor externo mudar (ex: restaurar histórico)
  useEffect(() => {
    if (editor && value !== editor.getHTML()) {
      editor.commands.setContent(value);
    }
  }, [value, editor]);

  return (
    <div className="border border-gray-300 dark:border-gray-700 rounded-xl overflow-hidden bg-white dark:bg-gray-900 shadow-sm focus-within:ring-2 focus-within:ring-[#07f49e] transition-all">
      {editable && <MenuBar editor={editor} />}
      <EditorContent editor={editor} />
      <div className="px-4 py-2 text-xs text-right text-gray-400 border-t dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50">
        {editor?.storage.characterCount.characters()} caracteres
      </div>
    </div>
  );
}