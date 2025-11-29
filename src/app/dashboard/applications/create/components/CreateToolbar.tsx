'use client';

import { Editor } from '@tiptap/react';
import { 
  Bold, Italic, Underline, Strikethrough,
  AlignLeft, AlignCenter, AlignRight, AlignJustify,
  List, ListOrdered, CheckSquare, Quote,
  Image as ImageIcon, Youtube, Link as LinkIcon, Table as TableIcon,
  Undo, Redo, Save, Highlighter, Palette, 
  Subscript, Superscript, Upload, 
  ChevronDown, X, Check
} from 'lucide-react';
import { useState, useRef, useEffect } from 'react';

interface ToolbarProps {
  editor: Editor | null;
  onSave: () => void;
  isSaving: boolean;
}

export default function CreateToolbar({ editor, onSave, isSaving }: ToolbarProps) {
  if (!editor) return null;

  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [linkUrl, setLinkUrl] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const toolbarRef = useRef<HTMLDivElement>(null);

  // Fecha dropdowns ao clicar fora
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (toolbarRef.current && !toolbarRef.current.contains(event.target as Node)) {
        setActiveDropdown(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const toggleDropdown = (name: string) => {
    setActiveDropdown(activeDropdown === name ? null : name);
  };

  // --- AÇÕES ---
  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        if (typeof e.target?.result === 'string') {
          editor.chain().focus().setImage({ src: e.target.result }).run();
        }
      };
      reader.readAsDataURL(file);
    }
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const setLink = () => {
    if (linkUrl) {
      editor.chain().focus().extendMarkRange('link').setLink({ href: linkUrl }).run();
      setActiveDropdown(null);
      setLinkUrl('');
    }
  };

  // --- COMPONENTES VISUAIS ---
  const Separator = () => <div className="w-px h-6 bg-gray-200 mx-1 self-center" />;

  const IconButton = ({ onClick, isActive, icon: Icon, title, className = '' }: any) => (
    <button
      onClick={onClick}
      title={title}
      className={`p-1.5 rounded-lg transition-all flex items-center justify-center ${
        isActive 
          ? 'bg-purple-100 text-brand-purple' 
          : 'text-gray-500 hover:bg-gray-100 hover:text-gray-900'
      } ${className}`}
    >
      <Icon size={18} strokeWidth={2} />
    </button>
  );

  return (
    <div ref={toolbarRef} className="w-full bg-white rounded-xl shadow-lg border border-gray-200/80 p-1.5 flex flex-wrap gap-1 items-center relative z-50 animate-in fade-in slide-in-from-top-2">
      
      <input type="file" ref={fileInputRef} onChange={handleImageUpload} accept="image/*" className="hidden" />

      {/* HISTÓRICO */}
      <div className="flex gap-0.5">
        <IconButton onClick={() => editor.chain().focus().undo().run()} icon={Undo} title="Desfazer" />
        <IconButton onClick={() => editor.chain().focus().redo().run()} icon={Redo} title="Refazer" />
      </div>
      
      <Separator />

      {/* FONTES (DROPDOWN) */}
      <div className="relative">
        <button 
          onClick={() => toggleDropdown('fontFamily')}
          className="flex items-center gap-1 px-2 py-1.5 rounded-lg hover:bg-gray-100 text-sm font-medium text-gray-700 w-32 justify-between"
        >
          <span className="truncate">
            {editor.isActive('textStyle', { fontFamily: 'Multiara' }) ? 'Multiara' : 
             editor.isActive('textStyle', { fontFamily: 'Dk Lemons' }) ? 'Dk Lemons' : 
             editor.isActive('textStyle', { fontFamily: 'Letters For Learners' }) ? 'Manuscrito' : 'Padrão'}
          </span>
          <ChevronDown size={14} className="opacity-50" />
        </button>
        
        {activeDropdown === 'fontFamily' && (
          <div className="absolute top-full left-0 mt-1 w-48 bg-white border border-gray-200 rounded-lg shadow-xl py-1 flex flex-col gap-0.5 z-50">
             <button onClick={() => { editor.chain().focus().unsetFontFamily().run(); toggleDropdown('fontFamily'); }} className="px-3 py-2 text-left hover:bg-gray-50 text-sm font-inter">Padrão (Inter)</button>
             <button onClick={() => { editor.chain().focus().setFontFamily('Letters For Learners').run(); toggleDropdown('fontFamily'); }} className="px-3 py-2 text-left hover:bg-gray-50 text-sm font-letters font-bold">Manuscrito</button>
             <button onClick={() => { editor.chain().focus().setFontFamily('Multiara').run(); toggleDropdown('fontFamily'); }} className="px-3 py-2 text-left hover:bg-gray-50 text-sm font-multiara text-brand-purple">Multiara</button>
             <button onClick={() => { editor.chain().focus().setFontFamily('Dk Lemons').run(); toggleDropdown('fontFamily'); }} className="px-3 py-2 text-left hover:bg-gray-50 text-sm font-dk-lemons text-brand-purple">Dk Lemons</button>
          </div>
        )}
      </div>

      {/* TAMANHO (DROPDOWN) */}
      <div className="relative">
        <button onClick={() => toggleDropdown('fontSize')} className="flex items-center gap-1 px-2 py-1.5 rounded-lg hover:bg-gray-100 text-sm font-medium text-gray-700">
           <span>{editor.getAttributes('textStyle').fontSize?.replace('px','') || '16'}</span>
           <ChevronDown size={14} className="opacity-50" />
        </button>
        
        {activeDropdown === 'fontSize' && (
          <div className="absolute top-full left-0 mt-1 w-16 bg-white border border-gray-200 rounded-lg shadow-xl py-1 flex flex-col z-50 max-h-60 overflow-y-auto">
             {['12px','14px','16px','18px','20px','24px','30px','36px','48px'].map(size => (
               <button 
                 key={size}
                 // @ts-ignore
                 onClick={() => { editor.chain().focus().setFontSize(size).run(); toggleDropdown('fontSize'); }}
                 className="px-2 py-1.5 text-center hover:bg-gray-50 text-sm"
               >
                 {size.replace('px','')}
               </button>
             ))}
          </div>
        )}
      </div>

      <Separator />

      {/* ESTILOS BÁSICOS */}
      <div className="flex gap-0.5">
        <IconButton onClick={() => editor.chain().focus().toggleBold().run()} isActive={editor.isActive('bold')} icon={Bold} />
        <IconButton onClick={() => editor.chain().focus().toggleItalic().run()} isActive={editor.isActive('italic')} icon={Italic} />
        <IconButton onClick={() => editor.chain().focus().toggleUnderline().run()} isActive={editor.isActive('underline')} icon={Underline} />
        
        {/* CORES (DROPDOWN) */}
        <div className="relative">
           <button onClick={() => toggleDropdown('colors')} className="p-1.5 rounded-lg hover:bg-gray-100 flex items-center justify-center relative">
              <Palette size={18} className={editor.getAttributes('textStyle').color ? 'text-brand-purple' : 'text-gray-500'} />
              <div className="absolute bottom-1 right-1 w-1.5 h-1.5 rounded-full" style={{ backgroundColor: editor.getAttributes('textStyle').color || 'transparent' }}></div>
           </button>
           
           {activeDropdown === 'colors' && (
             <div className="absolute top-full left-0 mt-2 bg-white border border-gray-200 shadow-xl rounded-xl p-3 z-50 w-56 grid grid-cols-5 gap-2">
                <span className="col-span-5 text-[10px] text-gray-400 font-bold uppercase tracking-wider">Texto</span>
                {['#000000', '#42047e', '#EF4444', '#F59E0B', '#10B981', '#3B82F6'].map(color => (
                   <button key={color} onClick={() => editor.chain().focus().setColor(color).run()} className="w-6 h-6 rounded-full border border-gray-200 hover:scale-110 transition-transform" style={{ backgroundColor: color }} />
                ))}
                
                <div className="col-span-5 h-px bg-gray-100 my-1"></div>
                
                <span className="col-span-5 text-[10px] text-gray-400 font-bold uppercase tracking-wider">Realce</span>
                {['#FEF3C7', '#DCFCE7', '#DBEAFE', '#F3E8FF', '#FCE7F3'].map(color => (
                   <button key={color} onClick={() => editor.chain().focus().toggleHighlight({ color }).run()} className="w-6 h-6 rounded border border-gray-200 hover:scale-110 transition-transform" style={{ backgroundColor: color }} />
                ))}
                
                <button onClick={() => editor.chain().focus().unsetColor().unsetHighlight().run()} className="col-span-5 text-xs text-red-500 hover:bg-red-50 p-2 rounded mt-1 border border-red-100">
                  Limpar Cores
                </button>
             </div>
           )}
        </div>
      </div>

      <Separator />

      {/* ALINHAMENTO E LISTAS */}
      <div className="flex gap-0.5">
         <IconButton onClick={() => editor.chain().focus().setTextAlign('left').run()} isActive={editor.isActive({ textAlign: 'left' })} icon={AlignLeft} />
         <IconButton onClick={() => editor.chain().focus().setTextAlign('center').run()} isActive={editor.isActive({ textAlign: 'center' })} icon={AlignCenter} />
         
         <div className="hidden sm:flex gap-0.5 ml-1">
            <IconButton onClick={() => editor.chain().focus().toggleBulletList().run()} isActive={editor.isActive('bulletList')} icon={List} />
            <IconButton onClick={() => editor.chain().focus().toggleOrderedList().run()} isActive={editor.isActive('orderedList')} icon={ListOrdered} />
            <IconButton onClick={() => editor.chain().focus().toggleTaskList().run()} isActive={editor.isActive('taskList')} icon={CheckSquare} />
         </div>
      </div>

      <Separator />

      {/* MÍDIA E INSERÇÃO */}
      <div className="flex gap-0.5">
         <div className="relative">
            <IconButton onClick={() => toggleDropdown('link')} isActive={editor.isActive('link')} icon={LinkIcon} />
            {activeDropdown === 'link' && (
               <div className="absolute top-full left-0 mt-2 bg-white border border-gray-200 shadow-xl rounded-lg p-2 flex gap-2 w-64 z-50">
                  <input 
                    value={linkUrl} 
                    onChange={(e) => setLinkUrl(e.target.value)} 
                    placeholder="Cole o link..." 
                    className="flex-1 text-sm border-none bg-gray-50 rounded px-2 focus:ring-1 focus:ring-brand-purple outline-none"
                    autoFocus
                  />
                  <button onClick={setLink} className="bg-brand-purple text-white p-1 rounded hover:bg-purple-700">OK</button>
               </div>
            )}
         </div>
         
         <IconButton onClick={() => fileInputRef.current?.click()} icon={Upload} title="Upload Imagem" />
         
         <div className="relative">
            <IconButton onClick={() => toggleDropdown('media')} icon={ImageIcon} />
            {activeDropdown === 'media' && (
               <div className="absolute top-full left-0 mt-2 bg-white border border-gray-200 shadow-xl rounded-lg p-1 flex flex-col gap-1 w-40 z-50">
                  <button onClick={() => { const url = window.prompt('URL da Imagem:'); if(url) editor.chain().focus().setImage({ src: url }).run(); toggleDropdown('media'); }} className="text-left px-3 py-2 text-sm hover:bg-gray-50 flex items-center gap-2"><ImageIcon size={14}/> Imagem Web</button>
                  <button onClick={() => { const url = window.prompt('URL do YouTube:'); if(url) editor.chain().focus().setYoutubeVideo({ src: url }).run(); toggleDropdown('media'); }} className="text-left px-3 py-2 text-sm hover:bg-gray-50 flex items-center gap-2"><Youtube size={14}/> YouTube</button>
                  <button onClick={() => { editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run(); toggleDropdown('media'); }} className="text-left px-3 py-2 text-sm hover:bg-gray-50 flex items-center gap-2"><TableIcon size={14}/> Tabela</button>
                  <button onClick={() => { editor.chain().focus().toggleBlockquote().run(); toggleDropdown('media'); }} className="text-left px-3 py-2 text-sm hover:bg-gray-50 flex items-center gap-2"><Quote size={14}/> Citação</button>
               </div>
            )}
         </div>
      </div>

      {/* SALVAR (DIREITA) */}
      <div className="ml-auto pl-2 border-l border-gray-200">
         <button 
           onClick={onSave} 
           disabled={isSaving}
           className="flex items-center gap-2 bg-brand-purple text-white px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-purple-800 disabled:opacity-50 transition-all shadow-md hover:shadow-lg"
         >
           <Save size={14} className={isSaving ? "animate-spin" : ""} />
           <span className="hidden sm:inline">{isSaving ? '...' : 'Salvar'}</span>
         </button>
      </div>
    </div>
  );
}