'use client';

import React from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import TaskList from '@tiptap/extension-task-list';
import TaskItem from '@tiptap/extension-task-item';
import Underline from '@tiptap/extension-underline';
import Link from '@tiptap/extension-link';
import Image from '@tiptap/extension-image';
import Typography from '@tiptap/extension-typography';
import CharacterCount from '@tiptap/extension-character-count';
import TextAlign from '@tiptap/extension-text-align';
import Highlight from '@tiptap/extension-highlight';
import Subscript from '@tiptap/extension-subscript';
import Superscript from '@tiptap/extension-superscript';
import Table from '@tiptap/extension-table';
import TableRow from '@tiptap/extension-table-row';
import TableCell from '@tiptap/extension-table-cell';
import TableHeader from '@tiptap/extension-table-header';

import { EditorToolbar } from './EditorToolbar';
import { EditorBubbleMenu } from './EditorBubbleMenu';
import { EditorFloatingMenu } from './EditorFloatingMenu';
import { StatsWidget } from './StatsWidget';

interface Props {
  initialContent?: any;
}

export const EditorCanvas = ({ initialContent }: Props) => {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3, 4, 5, 6] },
        dropcursor: { color: '#3b82f6', width: 2 },
      }),
      Placeholder.configure({
        placeholder: 'Comece a escrever sua obra-prima...',
        emptyEditorClass: 'is-editor-empty cursor-text before:content-[attr(data-placeholder)] before:text-zinc-400 before:float-left before:pointer-events-none h-full',
      }),
      TaskList,
      TaskItem.configure({ nested: true }),
      Underline,
      Link.configure({ openOnClick: false, autolink: true }),
      Image,
      Typography,
      CharacterCount,
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
      Highlight,
      Subscript,
      Superscript,
      Table.configure({ resizable: true }),
      TableRow,
      TableHeader,
      TableCell,
    ],
    content: initialContent || '',
    editorProps: {
      attributes: {
        class: 'prose prose-zinc prose-lg dark:prose-invert max-w-none focus:outline-none min-h-[800px]',
      },
    },
  });

  if (!editor) return null;

  return (
    <div className="flex flex-col h-full">
      {/* Barra Fixa no Topo (Premium Requirement) */}
      <EditorToolbar editor={editor} />

      <div className="flex-1 overflow-y-auto bg-zinc-100/50 dark:bg-zinc-950 p-8 flex justify-center scrollbar-thin scrollbar-thumb-zinc-300 dark:scrollbar-thumb-zinc-800">
        
        {/* Menus Contextuais (Aparecem quando necessário) */}
        <EditorBubbleMenu editor={editor} />
        <EditorFloatingMenu editor={editor} />

        {/* A "Folha de Papel" */}
        <div className="w-full max-w-[850px] bg-white dark:bg-zinc-900 shadow-sm border border-zinc-200/60 dark:border-zinc-800 min-h-[1100px] px-12 py-16 rounded-sm transition-all hover:shadow-md">
          <EditorContent editor={editor} />
        </div>
      </div>

      {/* Rodapé de Estatísticas */}
      <div className="bg-white dark:bg-zinc-950 border-t border-zinc-200 dark:border-zinc-800 px-6 py-2">
        <StatsWidget editor={editor} />
      </div>
    </div>
  );
};