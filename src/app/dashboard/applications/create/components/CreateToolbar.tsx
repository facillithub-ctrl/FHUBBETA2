'use client';

import { Editor } from '@tiptap/react';
import { 
  Type, Palette, Layout, Image as ImageIcon, 
  Bold, Italic, Underline, Strikethrough, AlignLeft, AlignCenter, AlignRight, AlignJustify,
  List, ListOrdered, CheckSquare, Quote, Link as LinkIcon, 
  Undo, Redo, Download, Printer, Layers, FilePlus, 
  Subscript, Superscript, ChevronDown, ChevronRight, Square, Circle, Minus,
  Save, Columns, MoreHorizontal
} from 'lucide-react';
import { useState, useRef, useEffect } from 'react';

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

  const [activeGroup, setActiveGroup] = useState<string | null>('texto');
  const [showColorPicker, setShowColorPicker] = useState<'text' | 'highlight' | null>(null);

  const toggleGroup = (group: string) => {
    setActiveGroup(activeGroup === group ? null : group);
  };

  // --- AÇÕES ---
  const applyPreset = (type: 'title' | 'subtitle' | 'body') => {
    if (type === 'title') {
      editor.chain().focus().toggleHeading({ level: 1 }).setFontFamily('Multiara').setFontSize('36px').run();
    } else if (type === 'subtitle') {
      editor.chain().focus().toggleHeading({ level: 2 }).setFontFamily('Dk Lemons').setFontSize('24px').run();
    } else {
      editor.chain().focus().setParagraph().setFontFamily('Letters For Learners').setFontSize('16px').run();
    }
  };

  const insertShape = (type: 'rectangle' | 'circle') => {
    editor.chain().focus().insertContent({
      type: 'shape',
      attrs: { type, width: '100px', height: '100px', color: '#e5e7eb' }
    }).run();
  };

  const addPageBreak = () => {
    editor.chain().focus().insertContent('<div class="page-break"></div>').run();
  };

  const insertColumns = (cols: number) => {
    editor.chain().focus().insertTable({ rows: 1, cols: cols, withHeaderRow: false }).run();
  };

  const updateShapeColor = (color: string) => {
    if (editor.isActive('shape')) {
      editor.chain().focus().updateAttributes('shape', { color }).run();
    }
  };

  // Componente de Grupo Accordion
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

  // Botão de Ferramenta
  const ToolBtn = ({ onClick, isActive, icon: Icon, title, className = '', label }: any) => (
    <button
      onClick={onClick}
      title={title}
      className={`
        flex flex-col items-center justify-center p-2 rounded-lg transition-all
        ${isActive ? 'bg-purple-100 text-brand-purple shadow-sm' : 'text-gray-500 hover:bg-white hover:shadow-sm'}
        ${className}
      `}
    >
      <Icon size={18} strokeWidth={isActive ? 2.5 : 2} />
      {label && <span className="text-[9px] mt-1 font-medium">{label}</span>}
    </button>
  );

  return (
    <div className="w-full h-full bg-white border-r border-gray-200 flex flex-col shadow-xl z-50 overflow-y-auto no-print">
      
      {/* Header da Toolbar */}
      <div className="p-4 border-b border-gray-200 bg-gray-50">
        <h2 className="font-dk-lemons text-lg text-gray-800">Ferramentas</h2>
        <div className="flex gap-2 mt-2">
           <button onClick={() => editor.chain().focus().undo().run()} className="p-1.5 bg-white border rounded hover:bg-gray-100 text-gray-600"><Undo size={14}/></button>
           <button onClick={() => editor.chain().focus().redo().run()} className="p-1.5 bg-white border rounded hover:bg-gray-100 text-gray-600"><Redo size={14}/></button>
           <button onClick={onSave} disabled={isSaving} className="flex-1 bg-brand-purple text-white text-xs font-bold rounded flex items-center justify-center gap-1 hover:bg-purple-800 transition-colors">
              {isSaving ? '...' : 'Salvar'}
           </button>
        </div>
      </div>

      {/* --- GRUPO 1: TEXTO E FONTES --- */}
      <ToolGroup id="texto" label="Texto & Tipografia" icon={Type}>
         {/* Presets */}
         <div className="col-span-4 flex gap-1 mb-2 overflow-x-auto pb-1">
            <button onClick={() => applyPreset('title')} className="px-2 py-1 bg-white border rounded text-xs font-multiara hover:border-brand-purple">Título</button>
            <button onClick={() => applyPreset('subtitle')} className="px-2 py-1 bg-white border rounded text-xs font-dk-lemons hover:border-brand-purple">Sub</button>
            <button onClick={() => applyPreset('body')} className="px-2 py-1 bg-white border rounded text-xs font-letters font-bold hover:border-brand-purple">Corpo</button>
         </div>

         {/* Tamanho Fonte */}
         <div className="col-span-4 mb-2">
            <label className="text-[10px] text-gray-400 uppercase font-bold">Tamanho</label>
            <select 
              onChange={(e) => editor.chain().focus().setFontSize(e.target.value).run()}
              className="w-full text-xs border rounded p-1 mt-1"
              // @ts-ignore
              value={editor.getAttributes('textStyle').fontSize || '16px'}
            >
               {Array.from({length: 40}, (_, i) => i * 2 + 8).map(size => (
                 <option key={size} value={`${size}px`}>{size}px</option>
               ))}
               <option value="180px">180px</option>
            </select>
         </div>

         <ToolBtn onClick={() => editor.chain().focus().toggleBold().run()} isActive={editor.isActive('bold')} icon={Bold} />
         <ToolBtn onClick={() => editor.chain().focus().toggleItalic().run()} isActive={editor.isActive('italic')} icon={Italic} />
         <ToolBtn onClick={() => editor.chain().focus().toggleUnderline().run()} isActive={editor.isActive('underline')} icon={Underline} />
         <ToolBtn onClick={() => editor.chain().focus().toggleStrike().run()} isActive={editor.isActive('strike')} icon={Strikethrough} />
         <ToolBtn onClick={() => editor.chain().focus().toggleSubscript().run()} isActive={editor.isActive('subscript')} icon={Subscript} />
         <ToolBtn onClick={() => editor.chain().focus().toggleSuperscript().run()} isActive={editor.isActive('superscript')} icon={Superscript} />
         
         {/* Cores */}
         <div className="col-span-2 relative">
            <button onClick={() => setShowColorPicker(showColorPicker === 'text' ? null : 'text')} className="w-full flex items-center justify-center gap-1 p-1 bg-white border rounded text-xs h-8">
               <Palette size={12}/> Texto
            </button>
            {showColorPicker === 'text' && (
               <div className="absolute top-full left-0 z-50 bg-white border shadow-lg p-2 grid grid-cols-5 gap-1 w-40 rounded-lg">
                  {['#000', '#42047e', '#ef4444', '#f59e0b', '#10b981', '#3b82f6', '#6366f1', '#ec4899', '#8b5cf6', '#6b7280'].map(c => (
                     <button key={c} onClick={() => {editor.chain().focus().setColor(c).run(); setShowColorPicker(null)}} className="w-5 h-5 rounded-full border" style={{background: c}}/>
                  ))}
                  <button onClick={() => editor.chain().focus().unsetColor().run()} className="col-span-5 text-[10px] text-red-500 mt-1">Remover</button>
               </div>
            )}
         </div>
         <div className="col-span-2 relative">
            <button onClick={() => setShowColorPicker(showColorPicker === 'highlight' ? null : 'highlight')} className="w-full flex items-center justify-center gap-1 p-1 bg-white border rounded text-xs h-8">
               <div className="w-3 h-3 bg-yellow-200 rounded-sm"></div> Realce
            </button>
            {showColorPicker === 'highlight' && (
               <div className="absolute top-full left-0 z-50 bg-white border shadow-lg p-2 grid grid-cols-5 gap-1 w-40 rounded-lg">
                  {['#fef3c7', '#dcfce7', '#dbeafe', '#f3e8ff', '#fce7f3', '#ffedd5'].map(c => (
                     <button key={c} onClick={() => {editor.chain().focus().toggleHighlight({color: c}).run(); setShowColorPicker(null)}} className="w-5 h-5 rounded border" style={{background: c}}/>
                  ))}
                  <button onClick={() => editor.chain().focus().unsetHighlight().run()} className="col-span-5 text-[10px] text-red-500 mt-1">Remover</button>
               </div>
            )}
         </div>
      </ToolGroup>

      {/* --- GRUPO 2: PARÁGRAFO --- */}
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

      {/* --- GRUPO 3: INSERIR --- */}
      <ToolGroup id="inserir" label="Inserir Objetos" icon={FilePlus}>
         <ToolBtn onClick={() => {
            const url = window.prompt('URL da Imagem:');
            if(url) editor.chain().focus().setImage({ src: url }).run();
         }} icon={ImageIcon} label="Imagem" />
         
         <ToolBtn onClick={() => editor.chain().focus().setLink({ href: prompt('Link:') || '' }).run()} isActive={editor.isActive('link')} icon={LinkIcon} label="Link" />
         
         <ToolBtn onClick={() => editor.chain().focus().setHorizontalRule().run()} icon={Minus} label="Linha" />
         <ToolBtn onClick={() => insertShape('rectangle')} icon={Square} label="Retâng." />
         <ToolBtn onClick={() => insertShape('circle')} icon={Circle} label="Círculo" />
      </ToolGroup>

      {/* --- GRUPO 4: LAYOUT & PÁGINA --- */}
      <ToolGroup id="layout" label="Layout da Página" icon={Layout}>
         <div className="col-span-4 space-y-2">
            <div>
               <label className="text-[10px] uppercase font-bold text-gray-400">Tamanho</label>
               <select 
                  className="w-full text-xs p-1 border rounded mt-1"
                  value={pageSettings.size}
                  onChange={(e) => setPageSettings({...pageSettings, size: e.target.value})}
               >
                  <option value="a4">A4 (210mm)</option>
                  <option value="letter">Carta</option>
                  <option value="legal">Ofício</option>
               </select>
            </div>
            <div>
               <label className="text-[10px] uppercase font-bold text-gray-400">Margens</label>
               <select 
                  className="w-full text-xs p-1 border rounded mt-1"
                  value={pageSettings.margin}
                  onChange={(e) => setPageSettings({...pageSettings, margin: e.target.value})}
               >
                  <option value="normal">Normal</option>
                  <option value="narrow">Estreita</option>
                  <option value="wide">Larga</option>
               </select>
            </div>
            
            <label className="text-[10px] font-bold text-gray-400 mt-2 block">COLUNAS</label>
            <div className="flex gap-1">
               <button onClick={() => insertColumns(1)} className="flex-1 p-1 border rounded hover:bg-gray-50 text-xs">1 Col</button>
               <button onClick={() => insertColumns(2)} className="flex-1 p-1 border rounded hover:bg-gray-50 text-xs">2 Cols</button>
               <button onClick={() => insertColumns(3)} className="flex-1 p-1 border rounded hover:bg-gray-50 text-xs">3 Cols</button>
            </div>

            <button 
               onClick={addPageBreak}
               className="w-full py-2 bg-gray-100 hover:bg-gray-200 rounded text-xs font-bold text-gray-700 flex items-center justify-center gap-2 mt-2"
            >
               <Layers size={14}/> Nova Página
            </button>
         </div>

         {/* Editor de Cor da Forma */}
         {editor.isActive('shape') && (
           <div className="col-span-4 bg-purple-50 p-2 rounded border border-purple-100 mt-2">
              <label className="text-[9px] font-bold text-brand-purple uppercase block mb-1">Cor da Forma</label>
              <div className="flex gap-1 flex-wrap">
                 {['#ef4444', '#f59e0b', '#10b981', '#3b82f6', '#8b5cf6', '#e5e7eb', '#000'].map(c => (
                    <button key={c} onClick={() => updateShapeColor(c)} className="w-5 h-5 rounded-full border border-gray-300" style={{background: c}} />
                 ))}
                 <input type="color" onChange={(e) => updateShapeColor(e.target.value)} className="w-5 h-5 p-0 border-0 rounded-full overflow-hidden" />
              </div>
           </div>
         )}
      </ToolGroup>

      {/* --- GRUPO 5: EXPORTAR --- */}
      <ToolGroup id="exportar" label="Exportar" icon={Download}>
         <button onClick={() => onExport('pdf')} className="col-span-4 flex items-center gap-2 p-2 hover:bg-gray-50 text-sm text-left">
            <Printer size={16} /> Imprimir / PDF
         </button>
         <button onClick={() => alert('Em breve')} className="col-span-4 flex items-center gap-2 p-2 hover:bg-gray-50 text-sm text-left opacity-50">
            <ImageIcon size={16} /> Como Imagem
         </button>
      </ToolGroup>

    </div>
  );
}