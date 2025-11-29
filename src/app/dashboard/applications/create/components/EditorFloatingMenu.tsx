import React from 'react';
import { FloatingMenu, Editor } from '@tiptap/react';
import { 
  Heading1, Heading2, List, ListOrdered, 
  CheckSquare, Quote, Image as ImageIcon, Minus 
} from 'lucide-react';

interface Props {
  editor: Editor;
}

export const EditorFloatingMenu = ({ editor }: Props) => {
  if (!editor) return null;

  const items = [
    {
      icon: Heading1,
      label: 'Título 1',
      action: () => editor.chain().focus().toggleHeading({ level: 1 }).run(),
      isActive: editor.isActive('heading', { level: 1 }),
    },
    {
      icon: Heading2,
      label: 'Título 2',
      action: () => editor.chain().focus().toggleHeading({ level: 2 }).run(),
      isActive: editor.isActive('heading', { level: 2 }),
    },
    {
      icon: List,
      label: 'Lista',
      action: () => editor.chain().focus().toggleBulletList().run(),
      isActive: editor.isActive('bulletList'),
    },
    {
      icon: ListOrdered,
      label: 'Numerada',
      action: () => editor.chain().focus().toggleOrderedList().run(),
      isActive: editor.isActive('orderedList'),
    },
    {
      icon: CheckSquare,
      label: 'Tarefa',
      action: () => editor.chain().focus().toggleTaskList().run(),
      isActive: editor.isActive('taskList'),
    },
    {
      icon: Quote,
      label: 'Citação',
      action: () => editor.chain().focus().toggleBlockquote().run(),
      isActive: editor.isActive('blockquote'),
    },
     {
      icon: Minus,
      label: 'Divisor',
      action: () => editor.chain().focus().setHorizontalRule().run(),
      isActive: false,
    },
  ];

  return (
    <FloatingMenu 
      editor={editor} 
      tippyOptions={{ duration: 100 }}
      className="flex flex-col bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg shadow-xl overflow-hidden py-1 min-w-[180px]"
    >
      <div className="px-3 py-2 text-xs font-semibold text-zinc-500 uppercase tracking-wider">
        Blocos Básicos
      </div>
      {items.map((item, index) => (
        <button
          key={index}
          onClick={item.action}
          className={`flex items-center gap-3 px-3 py-2 text-sm w-full hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors text-left
            ${item.isActive ? 'text-blue-600 bg-blue-50 dark:bg-blue-900/20' : 'text-zinc-700 dark:text-zinc-300'}
          `}
        >
          <item.icon size={16} />
          {item.label}
        </button>
      ))}
    </FloatingMenu>
  );
};