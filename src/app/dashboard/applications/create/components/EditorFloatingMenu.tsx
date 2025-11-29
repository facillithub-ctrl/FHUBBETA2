'use client';

import { FloatingMenu, Editor } from '@tiptap/react';
import { Heading1, Heading2, List, CheckSquare, Image as ImageIcon } from 'lucide-react';

export default function EditorFloatingMenu({ editor }: { editor: Editor }) {
  const items = [
    { icon: Heading1, label: 'H1', action: () => editor.chain().focus().toggleHeading({ level: 1 }).run() },
    { icon: Heading2, label: 'H2', action: () => editor.chain().focus().toggleHeading({ level: 2 }).run() },
    { icon: List, label: 'Lista', action: () => editor.chain().focus().toggleBulletList().run() },
    { icon: CheckSquare, label: 'Task', action: () => editor.chain().focus().toggleTaskList().run() },
    { icon: ImageIcon, label: 'Img', action: () => {
        const url = window.prompt('URL da Imagem:');
        if (url) editor.chain().focus().setImage({ src: url }).run();
    }},
  ];

  return (
    <FloatingMenu editor={editor} tippyOptions={{ duration: 100 }} className="flex gap-2 bg-white border border-gray-200 shadow-lg rounded-lg p-1">
      {items.map((item, idx) => (
        <button 
          key={idx} 
          onClick={item.action} 
          className="p-2 hover:bg-gray-100 rounded text-gray-500 hover:text-brand-purple transition-colors flex items-center gap-2"
          title={item.label}
        >
          <item.icon size={16} />
        </button>
      ))}
    </FloatingMenu>
  );
}