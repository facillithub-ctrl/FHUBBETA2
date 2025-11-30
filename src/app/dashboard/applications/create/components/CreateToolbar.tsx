'use client';

import React, { useState } from 'react';
import { Editor } from '@tiptap/react';
import { 
  Bold, Italic, Underline, AlignLeft, AlignCenter, AlignRight, AlignJustify,
  Undo, Redo, List, ListOrdered, Box, Circle, Minus, 
  Image as ImageIcon, File, Layout as LayoutIcon, ChevronDown,
  Highlighter, Type, Printer, Plus
} from 'lucide-react';
import { PageSettings } from '../types';

interface Props {
  editor: Editor | null;
  pageSettings: PageSettings;
  setPageSettings: (s: PageSettings) => void;
  onAddPage: () => void;
  onPrint: () => void;
}

export const Toolbar = ({ editor, pageSettings, setPageSettings, onAddPage, onPrint }: Props) => {
  const [activeTab, setActiveTab] = useState<'home' | 'insert' | 'layout'>('home');

  if (!editor) return null;

  return (
    <div className="sticky top-0 z-40 w-full bg-white dark:bg-[#1a1b1e] border-b border-gray-200 dark:border-white/10 shadow-sm flex flex-col">
      
      {/* Abas */}
      <div className="flex px-2 bg-gray-50 dark:bg-[#121212] border-b border-gray-200 dark:border-white/5">
        <TabButton label="Página Inicial" active={activeTab === 'home'} onClick={() => setActiveTab('home')} />
        <TabButton label="Inserir" active={activeTab === 'insert'} onClick={() => setActiveTab('insert')} />
        <TabButton label="Layout" active={activeTab === 'layout'} onClick={() => setActiveTab('layout')} />
      </div>

      {/* Ferramentas */}
      <div className="h-14 px-4 flex items-center gap-4 overflow-x-auto bg-white dark:bg-[#1a1b1e] scrollbar-thin scrollbar-thumb-gray-200">
        
        {/* --- INÍCIO --- */}
        {activeTab === 'home' && (
          <>
            <div className="flex gap-1 pr-3 border-r border-gray-200">
              <ToolBtn icon={Undo} onClick={() => editor.chain().focus().undo().run()} disabled={!editor.can().undo()} />
              <ToolBtn icon={Redo} onClick={() => editor.chain().focus().redo().run()} disabled={!editor.can().redo()} />
            </div>
            
            <div className="flex items-center gap-2 pr-3 border-r border-gray-200">
              {/* Fonte */}
              <select className="h-8 text-xs bg-transparent border border-gray-200 rounded px-2 w-28 focus:ring-1 focus:ring-blue-500"
                 onChange={(e) => editor.chain().focus().setFontFamily(e.target.value).run()}>
                <option value="Inter">Inter</option>
                <option value="Arial">Arial</option>
                <option value="Times New Roman">Times New Roman</option>
                <option value="Courier New">Courier</option>
              </select>

              {/* Tamanho (Requer TextStyle configurado) */}
              <select className="h-8 text-xs bg-transparent border border-gray-200 rounded px-1 w-14 focus:ring-1 focus:ring-blue-500"
                 onChange={(e) => editor.chain().focus().setMark('textStyle', { fontSize: e.target.value }).run()}>
                <option value="12px">12</option>
                <option value="14px">14</option>
                <option value="16px">16</option>
                <option value="18px">18</option>
                <option value="24px">24</option>
                <option value="32px">32</option>
              </select>
            </div>

            <div className="flex gap-1 pr-3 border-r border-gray-200">
                <ToolBtn icon={Bold} onClick={() => editor.chain().focus().toggleBold().run()} active={editor.isActive('bold')} />
                <ToolBtn icon={Italic} onClick={() => editor.chain().focus().toggleItalic().run()} active={editor.isActive('italic')} />
                <ToolBtn icon={Underline} onClick={() => editor.chain().focus().toggleUnderline().run()} active={editor.isActive('underline')} />
            </div>

            <div className="flex gap-2 pr-3 border-r border-gray-200 items-center">
                {/* Cor da Fonte */}
                <div className="relative group flex flex-col items-center">
                   <label className="cursor-pointer flex flex-col items-center justify-center p-1 hover:bg-gray-100 rounded">
                      <span className="font-bold text-sm leading-none">A</span>
                      <div className="w-4 h-1 bg-red-500 rounded-full" style={{ backgroundColor: editor.getAttributes('textStyle').color || '#000' }} />
                      <input type="color" className="absolute opacity-0 w-full h-full cursor-pointer" 
                        onInput={(e: any) => editor.chain().focus().setColor(e.target.value).run()} 
                      />
                   </label>
                </div>

                {/* Realce (Highlight) */}
                <div className="relative group flex flex-col items-center">
                   <label className="cursor-pointer flex flex-col items-center justify-center p-1 hover:bg-gray-100 rounded">
                      <Highlighter size={14} />
                      <div className="w-4 h-1 bg-yellow-400 rounded-full mt-0.5" />
                      <input type="color" className="absolute opacity-0 w-full h-full cursor-pointer" 
                        onInput={(e: any) => editor.chain().focus().toggleHighlight({ color: e.target.value }).run()} 
                      />
                   </label>
                </div>
            </div>

            <div className="flex gap-0.5">
               <ToolBtn icon={AlignLeft} onClick={() => editor.chain().focus().setTextAlign('left').run()} active={editor.isActive({ textAlign: 'left' })} />
               <ToolBtn icon={AlignCenter} onClick={() => editor.chain().focus().setTextAlign('center').run()} active={editor.isActive({ textAlign: 'center' })} />
               <ToolBtn icon={AlignRight} onClick={() => editor.chain().focus().setTextAlign('right').run()} active={editor.isActive({ textAlign: 'right' })} />
               <ToolBtn icon={AlignJustify} onClick={() => editor.chain().focus().setTextAlign('justify').run()} active={editor.isActive({ textAlign: 'justify' })} />
            </div>
          </>
        )}

        {/* --- INSERIR --- */}
        {activeTab === 'insert' && (
          <div className="flex gap-4">
            <InsertBtn icon={Box} label="Quadrado" onClick={() => editor.commands.insertResizableShape({ type: 'rectangle', color: '#3b82f6', width: '100px', height: '100px' })} />
            <InsertBtn icon={Circle} label="Círculo" onClick={() => editor.commands.insertResizableShape({ type: 'circle', color: '#ef4444', width: '100px', height: '100px' })} />
            <InsertBtn icon={ImageIcon} label="Imagem" onClick={() => {
                const url = window.prompt('URL da Imagem:');
                if (url) editor.chain().focus().setImage({ src: url }).run();
            }} />
            <InsertBtn icon={Minus} label="Linha" onClick={() => editor.chain().focus().setHorizontalRule().run()} />
            
            <div className="w-px h-8 bg-gray-200 mx-2" />
            
            <InsertBtn icon={Plus} label="Nova Página" onClick={onAddPage} />
          </div>
        )}

        {/* --- LAYOUT --- */}
        {activeTab === 'layout' && (
          <div className="flex gap-6 items-center">
            <div className="flex flex-col gap-1">
              <span className="text-[10px] text-gray-400 font-bold uppercase">Margens</span>
              <div className="flex rounded-md bg-gray-100 p-0.5">
                 <button onClick={() => setPageSettings({...pageSettings, margin: 'narrow'})} className={`px-2 py-1 text-xs rounded ${pageSettings.margin === 'narrow' ? 'bg-white shadow' : ''}`}>Estreita</button>
                 <button onClick={() => setPageSettings({...pageSettings, margin: 'normal'})} className={`px-2 py-1 text-xs rounded ${pageSettings.margin === 'normal' ? 'bg-white shadow' : ''}`}>Normal</button>
                 <button onClick={() => setPageSettings({...pageSettings, margin: 'wide'})} className={`px-2 py-1 text-xs rounded ${pageSettings.margin === 'wide' ? 'bg-white shadow' : ''}`}>Larga</button>
              </div>
            </div>

            <div className="flex flex-col gap-1">
              <span className="text-[10px] text-gray-400 font-bold uppercase">Ações</span>
              <button onClick={onPrint} className="flex items-center gap-1 text-xs px-3 py-1.5 bg-gray-100 hover:bg-gray-200 rounded transition">
                <Printer size={14} /> Imprimir
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

// Subcomponentes
const TabButton = ({ label, active, onClick }: any) => (
  <button onClick={onClick} className={`px-4 py-2 text-xs font-medium border-b-2 transition-colors ${active ? 'border-blue-600 text-blue-600 bg-white' : 'border-transparent text-gray-600 hover:bg-gray-100'}`}>
    {label}
  </button>
);

const ToolBtn = ({ icon: Icon, onClick, active, disabled }: any) => (
  <button onClick={onClick} disabled={disabled} className={`p-1.5 rounded transition-all ${active ? 'bg-blue-100 text-blue-600' : 'text-gray-600 hover:bg-gray-100'} ${disabled ? 'opacity-30' : ''}`}>
    <Icon size={18} strokeWidth={2} />
  </button>
);

const InsertBtn = ({ icon: Icon, label, onClick }: any) => (
  <button onClick={onClick} className="flex flex-col items-center gap-1 px-3 py-1 rounded hover:bg-gray-100 transition-colors group min-w-[60px]">
    <div className="p-1.5 bg-gray-50 rounded-md group-hover:bg-white shadow-sm border border-gray-200">
      <Icon size={20} className="text-gray-600" />
    </div>
    <span className="text-[10px] font-medium text-gray-500">{label}</span>
  </button>
);