import React from 'react';
import { BubbleMenu, Editor } from '@tiptap/react';
import { 
  Bold, Italic, Strikethrough, Underline as UnderlineIcon, 
  AlignLeft, AlignCenter, AlignRight, Link as LinkIcon 
} from 'lucide-react';

interface Props {
  editor: Editor;
}

export const EditorBubbleMenu = ({ editor }: Props) => {
  if (!editor) return null;

  const setLink = () => {
    const previousUrl = editor.getAttributes('link').href;
    const url = window.prompt('URL', previousUrl);
    
    if (url === null) return;
    if (url === '') {
      editor.chain().focus().extendMarkRange('link').unsetLink().run();
      return;
    }
    editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
  };

  return (
    <BubbleMenu 
      editor={editor} 
      tippyOptions={{ duration: 100 }}
      className="flex items-center gap-1 bg-zinc-900 text-white rounded-lg shadow-xl px-2 py-1"
    >
      <button
        onClick={() => editor.chain().focus().toggleBold().run()}
        className={`p-1.5 rounded hover:bg-zinc-700 transition ${editor.isActive('bold') ? 'text-blue-400' : ''}`}
      >
        <Bold size={16} />
      </button>
      <button
        onClick={() => editor.chain().focus().toggleItalic().run()}
        className={`p-1.5 rounded hover:bg-zinc-700 transition ${editor.isActive('italic') ? 'text-blue-400' : ''}`}
      >
        <Italic size={16} />
      </button>
      <button
        onClick={() => editor.chain().focus().toggleStrike().run()}
        className={`p-1.5 rounded hover:bg-zinc-700 transition ${editor.isActive('strike') ? 'text-blue-400' : ''}`}
      >
        <Strikethrough size={16} />
      </button>
      <button
        onClick={() => editor.chain().focus().toggleUnderline().run()}
        className={`p-1.5 rounded hover:bg-zinc-700 transition ${editor.isActive('underline') ? 'text-blue-400' : ''}`}
      >
        <UnderlineIcon size={16} />
      </button>
      
      <div className="w-[1px] h-4 bg-zinc-700 mx-1" />

      <button onClick={setLink} className={`p-1.5 rounded hover:bg-zinc-700 transition ${editor.isActive('link') ? 'text-blue-400' : ''}`}>
        <LinkIcon size={16} />
      </button>

      <div className="w-[1px] h-4 bg-zinc-700 mx-1" />

      <button onClick={() => editor.chain().focus().setTextAlign('left').run()} className={`p-1.5 rounded hover:bg-zinc-700 transition`}>
        <AlignLeft size={16} />
      </button>
      <button onClick={() => editor.chain().focus().setTextAlign('center').run()} className={`p-1.5 rounded hover:bg-zinc-700 transition`}>
        <AlignCenter size={16} />
      </button>
      <button onClick={() => editor.chain().focus().setTextAlign('right').run()} className={`p-1.5 rounded hover:bg-zinc-700 transition`}>
        <AlignRight size={16} />
      </button>
    </BubbleMenu>
  );
};