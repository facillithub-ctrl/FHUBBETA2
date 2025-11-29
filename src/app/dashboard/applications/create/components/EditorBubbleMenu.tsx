'use client';

import { BubbleMenu, Editor } from '@tiptap/react';
import { 
  Bold, Italic, Underline, Link as LinkIcon, 
  Highlighter, Sparkles, PaintBucket, Trash2, X, Check
} from 'lucide-react';
import { useState } from 'react';

interface Props {
  editor: Editor;
}

export default function EditorBubbleMenu({ editor }: Props) {
  const [isLinkOpen, setIsLinkOpen] = useState(false);
  const [linkUrl, setLinkUrl] = useState('');

  const setLink = () => {
    if (linkUrl) {
      editor.chain().focus().extendMarkRange('link').setLink({ href: linkUrl }).run();
      setIsLinkOpen(false);
      setLinkUrl('');
    } else {
      editor.chain().focus().unsetLink().run();
      setIsLinkOpen(false);
    }
  };

  const openLink = () => {
    const previousUrl = editor.getAttributes('link').href;
    setLinkUrl(previousUrl || '');
    setIsLinkOpen(true);
  };

  // Botão Auxiliar
  const BubbleBtn = ({ onClick, isActive, icon: Icon, className = '' }: any) => (
    <button
      onClick={onClick}
      className={`p-1.5 rounded-md hover:bg-gray-100 transition-colors ${
        isActive ? 'text-brand-purple bg-purple-50' : 'text-gray-600'
      } ${className}`}
    >
      <Icon size={16} strokeWidth={2.5} />
    </button>
  );

  return (
    <BubbleMenu 
      editor={editor} 
      tippyOptions={{ duration: 200, maxWidth: 400 }} 
      className="bg-white rounded-xl shadow-xl border border-gray-200/80 flex p-1.5 gap-1 items-center animate-in fade-in zoom-in-95"
    >
      {!isLinkOpen ? (
        <>
          <BubbleBtn onClick={() => editor.chain().focus().toggleBold().run()} isActive={editor.isActive('bold')} icon={Bold} />
          <BubbleBtn onClick={() => editor.chain().focus().toggleItalic().run()} isActive={editor.isActive('italic')} icon={Italic} />
          <BubbleBtn onClick={() => editor.chain().focus().toggleUnderline().run()} isActive={editor.isActive('underline')} icon={Underline} />
          <BubbleBtn onClick={() => editor.chain().focus().toggleHighlight().run()} isActive={editor.isActive('highlight')} icon={Highlighter} />
          
          <div className="w-px h-4 bg-gray-200 mx-1"></div>
          
          <BubbleBtn onClick={openLink} isActive={editor.isActive('link')} icon={LinkIcon} />
          
          <div className="w-px h-4 bg-gray-200 mx-1"></div>

          {/* Botão Mágico IA (Placeholder para futuro) */}
          <button className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-gradient-to-r from-purple-100 to-blue-50 hover:from-purple-200 hover:to-blue-100 text-brand-purple text-xs font-bold transition-all">
             <Sparkles size={14} />
             <span>Melhorar</span>
          </button>
        </>
      ) : (
        <div className="flex items-center gap-1 p-0.5">
          <LinkIcon size={14} className="text-gray-400 ml-1" />
          <input 
            className="bg-transparent border-none outline-none text-sm text-gray-700 w-48 placeholder-gray-400 focus:ring-0"
            placeholder="Cole o link aqui..." 
            value={linkUrl} 
            onChange={(e) => setLinkUrl(e.target.value)}
            autoFocus
            onKeyDown={(e) => e.key === 'Enter' && setLink()}
          />
          <button onClick={setLink} className="p-1 hover:bg-green-100 text-green-600 rounded"><Check size={14}/></button>
          <button onClick={() => setIsLinkOpen(false)} className="p-1 hover:bg-red-100 text-red-500 rounded"><X size={14}/></button>
        </div>
      )}
    </BubbleMenu>
  );
}