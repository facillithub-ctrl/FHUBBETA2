'use client';

import { FloatingMenu, Editor } from '@tiptap/react';
import { 
  Heading1, Heading2, List, CheckSquare, Image as ImageIcon, 
  Quote, Table as TableIcon, Minus 
} from 'lucide-react';

interface Props {
  editor: Editor;
}

export default function EditorFloatingMenu({ editor }: Props) {
  // Lista de ações rápidas
  const items = [
    { 
      icon: Heading1, 
      label: 'Título 1', 
      action: () => editor.chain().focus().toggleHeading({ level: 1 }).run() 
    },
    { 
      icon: Heading2, 
      label: 'Título 2', 
      action: () => editor.chain().focus().toggleHeading({ level: 2 }).run() 
    },
    { 
      icon: List, 
      label: 'Lista', 
      action: () => editor.chain().focus().toggleBulletList().run() 
    },
    { 
      icon: CheckSquare, 
      label: 'Tarefa', 
      action: () => editor.chain().focus().toggleTaskList().run() 
    },
    { 
      icon: Quote, 
      label: 'Citação', 
      action: () => editor.chain().focus().toggleBlockquote().run() 
    },
    {
      icon: ImageIcon,
      label: 'Imagem',
      action: () => {
          const url = window.prompt('URL da Imagem:');
          if (url) editor.chain().focus().setImage({ src: url }).run();
      }
    }
  ];

  return (
    <FloatingMenu 
        editor={editor} 
        tippyOptions={{ duration: 100 }} 
        className="flex items-center gap-1 bg-white border border-gray-200 shadow-lg rounded-lg p-1.5 animate-in fade-in slide-in-from-left-2"
    >
      {items.map((item, index) => (
        <button
          key={index}
          onClick={item.action}
          className="p-2 hover:bg-gray-100 rounded-md text-gray-500 hover:text-brand-purple transition-colors relative group"
        >
          <item.icon size={18} strokeWidth={2} />
          {/* Tooltip simples */}
          <span className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 px-2 py-1 bg-gray-800 text-white text-[10px] rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
            {item.label}
          </span>
        </button>
      ))}
    </FloatingMenu>
  );
}