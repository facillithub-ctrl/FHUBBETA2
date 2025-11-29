'use client';

import { BubbleMenu, Editor } from '@tiptap/react';
import { 
  Bold, Italic, Underline, Link as LinkIcon, 
  Highlighter, Trash2
} from 'lucide-react';
import { useState } from 'react';

export default function EditorBubbleMenu({ editor }: { editor: Editor }) {
  const [isLinkOpen, setIsLinkOpen] = useState(false);
  const [linkUrl, setLinkUrl] = useState('');

  const setLink = () => {
    if (linkUrl) {
      editor.chain().focus().extendMarkRange('link').setLink({ href: linkUrl }).run();
      setIsLinkOpen(false);
      setLinkUrl('');
    }
  };

  return (
    <BubbleMenu editor={editor} tippyOptions={{ duration: 100 }} className="bg-gray-900 text-white rounded-lg shadow-xl flex p-1 gap-1">
      {!isLinkOpen ? (
        <>
          <button onClick={() => editor.chain().focus().toggleBold().run()} className={`p-2 hover:bg-gray-700 rounded ${editor.isActive('bold') ? 'text-brand-green' : ''}`}><Bold size={14}/></button>
          <button onClick={() => editor.chain().focus().toggleItalic().run()} className={`p-2 hover:bg-gray-700 rounded ${editor.isActive('italic') ? 'text-brand-green' : ''}`}><Italic size={14}/></button>
          <button onClick={() => editor.chain().focus().toggleUnderline().run()} className={`p-2 hover:bg-gray-700 rounded ${editor.isActive('underline') ? 'text-brand-green' : ''}`}><Underline size={14}/></button>
          <button onClick={() => editor.chain().focus().toggleHighlight().run()} className={`p-2 hover:bg-gray-700 rounded ${editor.isActive('highlight') ? 'text-yellow-400' : ''}`}><Highlighter size={14}/></button>
          <div className="w-px bg-gray-700 mx-1"></div>
          <button onClick={() => setIsLinkOpen(true)} className={`p-2 hover:bg-gray-700 rounded ${editor.isActive('link') ? 'text-brand-green' : ''}`}><LinkIcon size={14}/></button>
        </>
      ) : (
        <div className="flex items-center gap-2 p-1">
          <input 
            className="bg-transparent border-b border-gray-500 focus:border-brand-green text-xs text-white outline-none w-32"
            placeholder="URL..." 
            value={linkUrl} 
            onChange={(e) => setLinkUrl(e.target.value)}
            autoFocus
          />
          <button onClick={setLink} className="text-xs font-bold text-brand-green">OK</button>
          <button onClick={() => setIsLinkOpen(false)} className="text-xs text-gray-400">X</button>
        </div>
      )}
    </BubbleMenu>
  );
}