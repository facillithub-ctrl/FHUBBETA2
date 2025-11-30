"use client";

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import { useEffect } from 'react';

// Exportando a interface para ser usada em outros lugares se necessário
export interface NativeEditorProps {
  value: string;
  onChange: (content: string) => void;
  placeholder?: string;
  editable?: boolean;
  height?: number; // Propriedade adicionada para corrigir o erro de build
}

const MenuBar = ({ editor }: { editor: any }) => {
  if (!editor) return null;

  return (
    <div className="flex gap-1 mb-2 pb-2 border-b border-gray-100 dark:border-gray-800 overflow-x-auto">
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleBold().run()}
        disabled={!editor.can().chain().focus().toggleBold().run()}
        className={`px-2 py-1 rounded text-sm font-medium transition-colors ${
          editor.isActive('bold') 
            ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400' 
            : 'text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800'
        }`}
      >
        B
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleItalic().run()}
        disabled={!editor.can().chain().focus().toggleItalic().run()}
        className={`px-2 py-1 rounded text-sm font-medium transition-colors ${
          editor.isActive('italic') 
            ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400' 
            : 'text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800'
        }`}
      >
        I
      </button>
      <div className="w-px h-4 bg-gray-200 dark:bg-gray-700 mx-1 self-center" />
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        className={`px-2 py-1 rounded text-sm font-medium transition-colors ${
          editor.isActive('bulletList') 
            ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400' 
            : 'text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800'
        }`}
      >
        Lista
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
        className={`px-2 py-1 rounded text-sm font-medium transition-colors ${
          editor.isActive('orderedList') 
            ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400' 
            : 'text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800'
        }`}
      >
        1.2.3
      </button>
    </div>
  );
};

export default function NativeRichTextEditor({ 
  value, 
  onChange, 
  placeholder = "Começa a escrever...", 
  editable = true, 
  height 
}: NativeEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Placeholder.configure({ placeholder }),
    ],
    content: value,
    editable: editable,
    editorProps: {
      attributes: {
        class: 'prose prose-sm dark:prose-invert max-w-none focus:outline-none text-gray-800 dark:text-gray-200 leading-relaxed',
        // Aplica a altura mínima se a prop height for passada, senão usa 120px
        style: `min-height: ${height ? `${height}px` : '120px'}`
      },
    },
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
  });

  useEffect(() => {
    if (editor && value !== editor.getHTML()) {
      editor.commands.setContent(value);
    }
  }, [value, editor]);

  useEffect(() => {
    if (editor) {
      editor.setEditable(editable);
    }
  }, [editable, editor]);

  return (
    <div className={`
      flex flex-col border rounded-xl transition-all duration-200
      ${editable 
        ? 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 focus-within:ring-2 focus-within:ring-blue-500/20 focus-within:border-blue-500' 
        : 'border-transparent bg-transparent p-0'
      }
    `}>
      {editable && (
        <div className="px-3 pt-2">
          <MenuBar editor={editor} />
        </div>
      )}
      <div className={editable ? "px-4 pb-4 pt-1" : ""}>
        <EditorContent editor={editor} />
      </div>
    </div>
  );
}