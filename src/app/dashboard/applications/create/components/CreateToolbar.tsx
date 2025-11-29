'use client';

import { Editor } from '@tiptap/react';
import { 
  Bold, Italic, Underline, Strikethrough,
  AlignLeft, AlignCenter, AlignRight, AlignJustify,
  List, ListOrdered, CheckSquare, Quote,
  Image as ImageIcon, Youtube, Link as LinkIcon, Table as TableIcon,
  Undo, Redo, Save, Highlighter, Palette, 
  Link2Off, Subscript, Superscript, Upload, ChevronDown, Check, X
} from 'lucide-react';
import { useState, useRef } from 'react';

interface ToolbarProps {
  editor: Editor | null;
  onSave: () => void;
  isSaving: boolean;
}

export default function CreateToolbar({ editor, onSave, isSaving }: ToolbarProps) {
  if (!editor) return null;

  const [linkUrl, setLinkUrl] = useState('');
  const [showLinkInput, setShowLinkInput] = useState(false);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // --- FUNÇÕES DE AÇÃO ---

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
    // Reseta o input
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const setLink = () => {
    if (linkUrl) {
      editor.chain().focus().extendMarkRange('link').setLink({ href: linkUrl }).run();
      setShowLinkInput(false);
      setLinkUrl('');
    } else {
      editor.chain().focus().unsetLink().run();
      setShowLinkInput(false);
    }
  };

  const openLinkMenu = () => {
    const previousUrl = editor.getAttributes('link').href;
    setLinkUrl(previousUrl || '');
    setShowLinkInput(!showLinkInput);
  };

  const addYoutube = () => {
    const url = window.prompt('URL do Vídeo (YouTube):');
    if (url) editor.chain().focus().setYoutubeVideo({ src: url }).run();
  };

  const addTable = () => {
    editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run();
  };

  // Botão Genérico
  const ToolBtn = ({ onClick, isActive, icon: Icon, title, className = '' }: any) => (
    <button
      onClick={onClick}
      title={title}
      className={`p-1.5 rounded-md transition-all duration-200 flex-shrink-0 ${
        isActive 
          ? 'bg-purple-100 text-brand-purple shadow-sm ring-1 ring-purple-200' 
          : 'text-gray-500 hover:bg-gray-100 hover:text-gray-900'
      } ${className}`}
    >
      <Icon size={18} strokeWidth={isActive ? 2.5 : 2} />
    </button>
  );

  return (
    <div className="w-full max-w-[210mm] mx-auto bg-white/95 backdrop-blur-md border border-gray-200/60 rounded-xl shadow-lg shadow-gray-200/50 p-2 flex flex-col gap-2 transition-all relative">
      
      {/* Input Oculto para Upload */}
      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={handleImageUpload} 
        accept="image/*" 
        className="hidden" 
      />

      {/* --- POPOVER DE LINK --- */}
      {showLinkInput && (
        <div className="absolute top-12 left-1/2 -translate-x-1/2 z-50 bg-white border border-gray-200 shadow-xl rounded-lg p-2 flex gap-2 items-center w-72 animate-in fade-in slide-in-from-top-2">
          <LinkIcon size={16} className="text-gray-400" />
          <input
            value={linkUrl}
            onChange={(e) => setLinkUrl(e.target.value)}
            placeholder="Cole o link aqui..."
            className="flex-1 text-sm border-none focus:ring-0 outline-none placeholder-gray-400"
            autoFocus
            onKeyDown={(e) => e.key === 'Enter' && setLink()}
          />
          <button onClick={setLink} className="p-1 hover:bg-green-50 text-green-600 rounded"><Check size={14}/></button>
          <button onClick={() => setShowLinkInput(false)} className="p-1 hover:bg-red-50 text-red-500 rounded"><X size={14}/></button>
        </div>
      )}

      {/* LINHA 1: Fontes, Tamanho e Formatação Básica */}
      <div className="flex items-center justify-between gap-2 overflow-x-auto scrollbar-hide pb-1">
        
        {/* Undo/Redo */}
        <div className="flex gap-0.5 border-r border-gray-200 pr-1 mr-1">
          <ToolBtn onClick={() => editor.chain().focus().undo().run()} icon={Undo} title="Desfazer" />
          <ToolBtn onClick={() => editor.chain().focus().redo().run()} icon={Redo} title="Refazer" />
        </div>

        {/* CONTROLES DE FONTE */}
        <div className="flex gap-2 items-center border-r border-gray-200 pr-2 mr-1">
           {/* Família */}
           <select 
             onChange={(e) => {
                const font = e.target.value;
                if (font === 'Inter') editor.chain().focus().unsetFontFamily().run();
                else editor.chain().focus().setFontFamily(font).run();
             }}
             className="text-xs font-medium border border-gray-200 rounded px-2 py-1 bg-gray-50 hover:bg-gray-100 focus:outline-none cursor-pointer w-28 truncate"
             value={editor.getAttributes('textStyle').fontFamily || 'Inter'}
           >
              <option value="Inter">Padrão</option>
              <option value="Letters For Learners">Manuscrito</option>
              <option value="Multiara">Multiara (Título)</option>
              <option value="Dk Lemons">Dk Lemons (Sub)</option>
           </select>

           {/* Tamanho */}
           <select 
              onChange={(e) => {
                 // @ts-ignore
                 editor.chain().focus().setFontSize(e.target.value).run();
              }}
              className="text-xs font-medium border border-gray-200 rounded px-2 py-1 bg-gray-50 hover:bg-gray-100 focus:outline-none cursor-pointer w-16 text-center"
              value={editor.getAttributes('textStyle').fontSize || ''}
           >
              <option value="">Tam</option>
              {['12px', '14px', '16px', '18px', '20px', '24px', '30px', '36px', '48px'].map(size => (
                 <option key={size} value={size}>{size.replace('px', '')}</option>
              ))}
           </select>
        </div>

        {/* Formatação Rica */}
        <div className="flex gap-0.5 border-r border-gray-200 pr-1 mr-1">
          <ToolBtn onClick={() => editor.chain().focus().toggleBold().run()} isActive={editor.isActive('bold')} icon={Bold} />
          <ToolBtn onClick={() => editor.chain().focus().toggleItalic().run()} isActive={editor.isActive('italic')} icon={Italic} />
          <ToolBtn onClick={() => editor.chain().focus().toggleUnderline().run()} isActive={editor.isActive('underline')} icon={Underline} />
          
          {/* MENU DE CORES (Popover) */}
          <div className="relative ml-1">
             <button 
               onClick={() => setShowColorPicker(!showColorPicker)}
               className="flex items-center gap-1 p-1.5 rounded hover:bg-gray-100 group"
               title="Cores de Texto e Realce"
             >
                <div className="w-4 h-4 rounded-full border border-gray-300 shadow-sm" style={{ backgroundColor: editor.getAttributes('textStyle').color || '#000' }}></div>
                <ChevronDown size={10} className="text-gray-400 group-hover:text-gray-600" />
             </button>

             {showColorPicker && (
               <>
                 {/* Overlay para fechar ao clicar fora */}
                 <div className="fixed inset-0 z-40" onClick={() => setShowColorPicker(false)}></div>
                 <div className="absolute top-full left-0 mt-2 bg-white border border-gray-200 shadow-2xl rounded-xl p-3 z-50 w-56 grid grid-cols-5 gap-2 animate-in fade-in zoom-in-95">
                    <span className="col-span-5 text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-1">Texto</span>
                    {['#000000', '#42047e', '#07f49e', '#EF4444', '#F59E0B', '#10B981', '#3B82F6', '#8B5CF6', '#EC4899', '#6B7280'].map(color => (
                       <button 
                         key={color}
                         onClick={() => { editor.chain().focus().setColor(color).run(); setShowColorPicker(false); }}
                         className="w-6 h-6 rounded-full border border-gray-100 hover:scale-110 transition-transform shadow-sm"
                         style={{ backgroundColor: color }}
                         title={color}
                       />
                    ))}
                    
                    <div className="col-span-5 h-px bg-gray-100 my-1"></div>
                    
                    <span className="col-span-5 text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-1">Realce</span>
                    {['#FEF3C7', '#DCFCE7', '#DBEAFE', '#F3E8FF', '#FCE7F3', '#FFEDD5', '#E0E7FF', '#FFE4E6', '#FEF9C3', '#ECFCCB'].map(color => (
                       <button 
                         key={color}
                         onClick={() => { editor.chain().focus().toggleHighlight({ color }).run(); setShowColorPicker(false); }}
                         className="w-6 h-6 rounded border border-gray-200 hover:scale-110 transition-transform"
                         style={{ backgroundColor: color }}
                       />
                    ))}
                    
                    <button 
                      onClick={() => { editor.chain().focus().unsetColor().unsetHighlight().run(); setShowColorPicker(false); }}
                      className="col-span-5 text-xs text-red-500 hover:bg-red-50 p-2 rounded mt-2 text-center border border-red-100 font-medium transition-colors"
                    >
                      Remover Cores
                    </button>
                 </div>
               </>
             )}
          </div>
        </div>

        {/* Botão Salvar */}
        <div className="ml-auto pl-2 border-l border-gray-200">
            <button 
            onClick={onSave} 
            disabled={isSaving}
            className={`
                flex items-center gap-2 px-3 py-1.5 rounded-lg font-bold text-xs transition-all shadow-sm
                ${isSaving 
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                : 'bg-brand-purple hover:bg-purple-800 text-white hover:shadow-md'}
            `}
            >
            <Save size={16} className={isSaving ? "animate-spin" : ""} />
            <span className="hidden sm:inline">{isSaving ? 'Salvando...' : 'Salvar'}</span>
            </button>
        </div>
      </div>

      {/* LINHA 2: Estrutura, Listas e Mídia */}
      <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide border-t border-gray-100 pt-1">
         
         {/* Alinhamento */}
         <div className="flex gap-0.5 border-r border-gray-200 pr-1 mr-1">
            <ToolBtn onClick={() => editor.chain().focus().setTextAlign('left').run()} isActive={editor.isActive({ textAlign: 'left' })} icon={AlignLeft} />
            <ToolBtn onClick={() => editor.chain().focus().setTextAlign('center').run()} isActive={editor.isActive({ textAlign: 'center' })} icon={AlignCenter} />
            <ToolBtn onClick={() => editor.chain().focus().setTextAlign('justify').run()} isActive={editor.isActive({ textAlign: 'justify' })} icon={AlignJustify} />
         </div>

         {/* Listas e Tarefas */}
         <div className="flex gap-0.5 border-r border-gray-200 pr-1 mr-1">
            <ToolBtn onClick={() => editor.chain().focus().toggleBulletList().run()} isActive={editor.isActive('bulletList')} icon={List} />
            <ToolBtn onClick={() => editor.chain().focus().toggleOrderedList().run()} isActive={editor.isActive('orderedList')} icon={ListOrdered} />
            <ToolBtn onClick={() => editor.chain().focus().toggleTaskList().run()} isActive={editor.isActive('taskList')} icon={CheckSquare} />
            <ToolBtn onClick={() => editor.chain().focus().toggleBlockquote().run()} isActive={editor.isActive('blockquote')} icon={Quote} />
         </div>

         {/* Sub/Sobrescrito */}
         <div className="flex gap-0.5 border-r border-gray-200 pr-1 mr-1">
             <ToolBtn onClick={() => editor.chain().focus().toggleSubscript().run()} isActive={editor.isActive('subscript')} icon={Subscript} />
             <ToolBtn onClick={() => editor.chain().focus().toggleSuperscript().run()} isActive={editor.isActive('superscript')} icon={Superscript} />
         </div>

         {/* Inserção de Objetos */}
         <div className="flex gap-0.5">
            <ToolBtn onClick={openLinkMenu} isActive={editor.isActive('link')} icon={LinkIcon} title="Link" />
            <ToolBtn onClick={() => fileInputRef.current?.click()} icon={Upload} title="Upload Imagem (Dispositivo)" />
            <ToolBtn onClick={() => {
                const url = window.prompt('URL da Imagem:');
                if(url) editor.chain().focus().setImage({ src: url }).run();
            }} icon={ImageIcon} title="Imagem (Web)" />
            <ToolBtn onClick={addYoutube} icon={Youtube} title="Vídeo" />
            <ToolBtn onClick={addTable} icon={TableIcon} title="Tabela" />
         </div>
      </div>
    </div>
  );
}