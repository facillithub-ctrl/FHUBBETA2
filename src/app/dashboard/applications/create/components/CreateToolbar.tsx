'use client';

import { Editor } from '@tiptap/react';
import { 
  Type, Palette, Layout, FilePlus, Image as ImageIcon, 
  Bold, Italic, Underline, Strikethrough, AlignLeft, AlignCenter, AlignRight, AlignJustify,
  List, ListOrdered, CheckSquare, Quote, Link as LinkIcon, 
  Undo, Redo, Download, Printer, Layers, 
  Subscript, Superscript, ChevronDown, ChevronRight, Square, Circle, Minus,
  Save, Columns, MousePointer2
} from 'lucide-react';
import { useState, useRef } from 'react';
import createClient from '@/utils/supabase/client';

interface ToolbarProps {
  editor: Editor | null;
  onSave: () => void;
  isSaving: boolean;
  onExport: (type: 'pdf' | 'html') => void;
  pageSettings: any;
  setPageSettings: (settings: any) => void;
}

export default function CreateToolbar({ editor, onSave, isSaving, onExport, pageSettings, setPageSettings }: ToolbarProps) {
  if (!editor) return null;

  // Estados locais para controle de menus
  const [activeGroup, setActiveGroup] = useState<string | null>('texto'); // 'texto' aberto por padrão
  const [showColorPicker, setShowColorPicker] = useState<'text' | 'highlight' | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const supabase = createClient();

  // Alternar grupos do menu (Accordion)
  const toggleGroup = (group: string) => {
    setActiveGroup(activeGroup === group ? null : group);
  };

  // --- FUNÇÃO 1: UPLOAD DE IMAGEM ---
  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
        alert('A imagem deve ter no máximo 5MB.');
        return;
    }

    setIsUploading(true);
    try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error("Usuário não autenticado");

        // Nome único para evitar conflito
        const fileName = `${Date.now()}_${file.name.replace(/[^a-zA-Z0-9.]/g, '')}`;
        const filePath = `create-assets/${user.id}/${fileName}`;
        
        // Tenta bucket privado 'create-assets', fallback para 'public'
        let { error: uploadError } = await supabase.storage.from('create-assets').upload(filePath, file);
        let publicUrl = '';

        if (uploadError) {
             const fallbackPath = `public/${user.id}/${fileName}`;
             await supabase.storage.from('public').upload(fallbackPath, file);
             publicUrl = supabase.storage.from('public').getPublicUrl(fallbackPath).data.publicUrl;
        } else {
             publicUrl = supabase.storage.from('create-assets').getPublicUrl(filePath).data.publicUrl;
        }
        
        if (publicUrl) {
            editor.chain().focus().setImage({ src: publicUrl }).run();
        }
    } catch (error) {
        console.error('Erro no upload:', error);
        alert('Erro ao enviar imagem. Verifique sua conexão.');
    } finally {
        setIsUploading(false);
        if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  // --- FUNÇÃO 2: INSERIR FORMAS ---
  const insertShape = (shape: 'rectangle' | 'circle' | 'line') => {
    if (shape === 'line') {
      editor.chain().focus().setHorizontalRule().run();
    } else {
      editor.chain().focus().insertContent({
        type: 'shape',
        attrs: { type: shape, width: '100px', height: '100px', color: '#e5e7eb' }
      }).run();
    }
  };

  // --- FUNÇÃO 3: INSERIR COLUNAS (GRID) ---
  const insertColumns = (cols: number) => {
    // @ts-ignore - Comando customizado da extensão ColumnExtension
    if (editor.can().setColumns(cols)) {
        // @ts-ignore
        editor.chain().focus().setColumns(cols).run();
    } else {
        alert("Não é possível inserir colunas aqui (tente em uma nova linha).");
    }
  };

  // --- FUNÇÃO 4: PRESETS DE FONTE ---
  const applyPreset = (type: 'title' | 'subtitle' | 'body') => {
    if (type === 'title') {
      editor.chain().focus().toggleHeading({ level: 1 }).setFontFamily('Multiara').run();
    } else if (type === 'subtitle') {
      editor.chain().focus().toggleHeading({ level: 2 }).setFontFamily('Dk Lemons').run();
    } else {
      editor.chain().focus().setParagraph().setFontFamily('Letters For Learners').run();
    }
  };

  // Componente de Botão Reutilizável
  const ToolBtn = ({ onClick, isActive, icon: Icon, title, label, disabled, className = '' }: any) => (
    <button
      onClick={onClick}
      title={title}
      disabled={disabled}
      className={`
        flex flex-col items-center justify-center p-2 rounded-lg transition-all
        ${isActive ? 'bg-purple-100 text-brand-purple shadow-sm' : 'text-gray-500 hover:bg-white hover:shadow-sm'}
        ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
        ${className}
      `}
    >
      <Icon size={18} strokeWidth={isActive ? 2.5 : 2} />
      {label && <span className="text-[9px] mt-1 font-medium">{label}</span>}
    </button>
  );

  // Componente Grupo Accordion
  const ToolGroup = ({ id, label, icon: Icon, children }: any) => (
    <div className="border-b border-gray-200 last:border-0">
      <button 
        onClick={() => toggleGroup(id)}
        className={`w-full flex items-center justify-between p-3 text-sm font-medium transition-colors ${activeGroup === id ? 'text-brand-purple bg-purple-50' : 'text-gray-700 hover:bg-gray-50'}`}
      >
        <div className="flex items-center gap-2">
          <Icon size={16} />
          <span>{label}</span>
        </div>
        {activeGroup === id ? <ChevronDown size={14}/> : <ChevronRight size={14}/>}
      </button>
      
      {activeGroup === id && (
        <div className="p-2 bg-gray-50/50 grid grid-cols-4 gap-1 animate-in slide-in-from-top-2 duration-200">
          {children}
        </div>
      )}
    </div>
  );

  return (
    <div className="w-full h-full bg-white border-r border-gray-200 flex flex-col shadow-xl z-50 overflow-y-auto no-print custom-scrollbar">
      <input type="file" ref={fileInputRef} onChange={handleImageUpload} className="hidden" accept="image/*" />

      {/* --- CABEÇALHO FIXO --- */}
      <div className="p-4 border-b border-gray-200 bg-gray-50 sticky top-0 z-10">
        <h2 className="font-dk-lemons text-lg text-gray-800">Ferramentas</h2>
        <div className="flex gap-2 mt-2">
           <button onClick={() => editor.chain().focus().undo().run()} className="p-1.5 bg-white border rounded hover:bg-gray-100 text-gray-600" title="Desfazer"><Undo size={14}/></button>
           <button onClick={() => editor.chain().focus().redo().run()} className="p-1.5 bg-white border rounded hover:bg-gray-100 text-gray-600" title="Refazer"><Redo size={14}/></button>
           <button onClick={onSave} disabled={isSaving} className="flex-1 bg-brand-purple text-white text-xs font-bold rounded flex items-center justify-center gap-1 hover:bg-purple-800 transition-colors shadow-sm">
              {isSaving ? '...' : <><Save size={12} /> Salvar</>}
           </button>
        </div>
      </div>

      {/* --- GRUPO 1: TEXTO (FONTES, TAMANHO, ESTILO) --- */}
      <ToolGroup id="texto" label="Texto" icon={Type}>
         {/* Presets de Fonte */}
         <div className="col-span-4 flex gap-1 mb-2 overflow-x-auto pb-1 scrollbar-hide">
            <button onClick={() => applyPreset('title')} className="px-2 py-1 bg-white border rounded text-xs font-multiara hover:border-brand-purple whitespace-nowrap">Título</button>
            <button onClick={() => applyPreset('subtitle')} className="px-2 py-1 bg-white border rounded text-xs font-dk-lemons hover:border-brand-purple whitespace-nowrap">Subtítulo</button>
            <button onClick={() => applyPreset('body')} className="px-2 py-1 bg-white border rounded text-xs font-letters font-bold hover:border-brand-purple whitespace-nowrap">Corpo</button>
         </div>

         {/* Tamanho da Fonte */}
         <div className="col-span-4 mb-2 px-1">
            <label className="text-[10px] text-gray-400 uppercase font-bold">Tamanho</label>
            <select 
              onChange={(e) => editor.chain().focus().setFontSize(e.target.value).run()}
              className="w-full text-xs border rounded p-1.5 mt-1 bg-white cursor-pointer"
              // @ts-ignore
              value={editor.getAttributes('textStyle').fontSize || '16px'}
            >
               {Array.from({length: 20}, (_, i) => i * 2 + 10).map(size => (
                 <option key={size} value={`${size}px`}>{size}px</option>
               ))}
               <option value="48px">48px</option>
               <option value="72px">72px</option>
            </select>
         </div>

         <ToolBtn onClick={() => editor.chain().focus().toggleBold().run()} isActive={editor.isActive('bold')} icon={Bold} />
         <ToolBtn onClick={() => editor.chain().focus().toggleItalic().run()} isActive={editor.isActive('italic')} icon={Italic} />
         <ToolBtn onClick={() => editor.chain().focus().toggleUnderline().run()} isActive={editor.isActive('underline')} icon={Underline} />
         <ToolBtn onClick={() => editor.chain().focus().toggleStrike().run()} isActive={editor.isActive('strike')} icon={Strikethrough} />
         
         {/* Seletor de Cores */}
         <div className="col-span-2 relative mt-2 group">
            <button onClick={() => setShowColorPicker(showColorPicker === 'text' ? null : 'text')} className="w-full p-1.5 bg-white border rounded text-xs flex items-center justify-center gap-1 hover:bg-gray-50">
               <Palette size={12}/> Cor Texto
            </button>
            {showColorPicker === 'text' && (
               <div className="absolute top-full left-0 z-50 bg-white border shadow-lg p-2 grid grid-cols-5 gap-1 w-48 rounded animate-in fade-in zoom-in-95">
                  {['#000', '#42047e', '#ef4444', '#f59e0b', '#10b981', '#3b82f6'].map(c => (
                     <button key={c} onClick={() => {editor.chain().focus().setColor(c).run(); setShowColorPicker(null)}} className="w-6 h-6 rounded-full border shadow-sm hover:scale-110" style={{background: c}}/>
                  ))}
                  <button onClick={() => editor.chain().focus().unsetColor().run()} className="col-span-5 text-[10px] text-red-500 mt-1 hover:underline">Remover Cor</button>
               </div>
            )}
         </div>
      </ToolGroup>

      {/* --- GRUPO 2: INSERIR (OBJETOS, IMAGENS) --- */}
      <ToolGroup id="inserir" label="Inserir Objetos" icon={FilePlus}>
         <ToolBtn 
            onClick={() => fileInputRef.current?.click()} 
            disabled={isUploading}
            icon={isUploading ? Layers : ImageIcon} 
            label={isUploading ? "..." : "Imagem"} 
            className={isUploading ? "animate-pulse" : ""}
         />
         
         <ToolBtn onClick={() => editor.chain().focus().setLink({ href: prompt('Link:') || '' }).run()} isActive={editor.isActive('link')} icon={LinkIcon} label="Link" />
         
         <ToolBtn onClick={() => insertShape('line')} icon={Minus} label="Linha" />
         <ToolBtn onClick={() => insertShape('rectangle')} icon={Square} label="Retâng." />
         <ToolBtn onClick={() => insertShape('circle')} icon={Circle} label="Círculo" />
      </ToolGroup>

      {/* --- GRUPO 3: PARÁGRAFO & LISTAS --- */}
      <ToolGroup id="paragrafo" label="Parágrafo" icon={AlignLeft}>
         <ToolBtn onClick={() => editor.chain().focus().setTextAlign('left').run()} isActive={editor.isActive({ textAlign: 'left' })} icon={AlignLeft} />
         <ToolBtn onClick={() => editor.chain().focus().setTextAlign('center').run()} isActive={editor.isActive({ textAlign: 'center' })} icon={AlignCenter} />
         <ToolBtn onClick={() => editor.chain().focus().setTextAlign('right').run()} isActive={editor.isActive({ textAlign: 'right' })} icon={AlignRight} />
         <ToolBtn onClick={() => editor.chain().focus().setTextAlign('justify').run()} isActive={editor.isActive({ textAlign: 'justify' })} icon={AlignJustify} />
         
         <div className="col-span-4 h-px bg-gray-200 my-1"></div>
         
         <ToolBtn onClick={() => editor.chain().focus().toggleBulletList().run()} isActive={editor.isActive('bulletList')} icon={List} />
         <ToolBtn onClick={() => editor.chain().focus().toggleOrderedList().run()} isActive={editor.isActive('orderedList')} icon={ListOrdered} />
         <ToolBtn onClick={() => editor.chain().focus().toggleTaskList().run()} isActive={editor.isActive('taskList')} icon={CheckSquare} />
         <ToolBtn onClick={() => editor.chain().focus().toggleBlockquote().run()} isActive={editor.isActive('blockquote')} icon={Quote} />
      </ToolGroup>

      {/* --- GRUPO 4: LAYOUT & COLUNAS --- */}
      <ToolGroup id="layout" label="Layout" icon={Layout}>
         <div className="col-span-4 grid grid-cols-2 gap-2 mb-3">
             <button 
                onClick={() => insertColumns(2)}
                className="flex items-center justify-center gap-2 p-2 bg-white border hover:border-brand-purple rounded text-xs font-bold transition-all text-gray-600"
             >
                <Columns size={14} /> 2 Col.
             </button>
             <button 
                onClick={() => insertColumns(3)}
                className="flex items-center justify-center gap-2 p-2 bg-white border hover:border-brand-purple rounded text-xs font-bold transition-all text-gray-600"
             >
                <Columns size={14} /> 3 Col.
             </button>
         </div>

         {/* Tamanho da Página */}
         <div className="col-span-4 mb-2 px-1">
            <label className="text-[10px] text-gray-400 uppercase font-bold">Página</label>
            <select 
               className="w-full text-xs p-1.5 border rounded mt-1 bg-white"
               value={pageSettings.size}
               onChange={(e) => setPageSettings({...pageSettings, size: e.target.value})}
            >
               <option value="a4">A4 (Padrão)</option>
               <option value="letter">Carta</option>
               <option value="legal">Ofício</option>
            </select>
         </div>

         <button 
            onClick={() => editor.chain().focus().insertContent('<div class="page-break"></div>').run()}
            className="col-span-4 w-full py-2 bg-gray-100 hover:bg-gray-200 rounded text-xs font-bold text-gray-700 flex items-center justify-center gap-2"
         >
            <Layers size={14}/> Quebra de Página
         </button>
      </ToolGroup>

      {/* --- GRUPO 5: EXPORTAR --- */}
      <ToolGroup id="exportar" label="Exportar" icon={Download}>
         <button 
            onClick={() => onExport('pdf')} 
            className="col-span-4 flex items-center gap-2 p-2.5 hover:bg-gray-50 text-sm font-bold text-gray-700 rounded transition-colors"
         >
            <Printer size={16} /> Salvar como PDF
         </button>
      </ToolGroup>
    </div>
  );
}