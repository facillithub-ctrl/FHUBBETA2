'use client';

import { BubbleMenu, Editor, isNodeSelection } from '@tiptap/react';
import { 
  PaintBucket, Square, Trash2, 
  AlignLeft, AlignCenter, AlignRight, 
  Maximize2, Columns, Layout
} from 'lucide-react';
import { useCallback } from 'react';

interface Props {
  editor: Editor | null;
}

export default function EditorBubbleMenu({ editor }: Props) {
  if (!editor) return null;

  // Função inteligente para decidir QUANDO mostrar o menu
  const shouldShow = useCallback(({ editor, state }: any) => {
    const { selection } = state;
    const isImage = editor.isActive('image');
    const isShape = editor.isActive('shape');
    const isTable = editor.isActive('table'); // Para colunas
    
    // Mostra se for imagem, forma, tabela ou se houver uma seleção de nó específica
    return isImage || isShape || isTable || isNodeSelection(selection);
  }, []);

  return (
    <BubbleMenu 
      editor={editor} 
      tippyOptions={{ 
        duration: 100, 
        maxWidth: 600, 
        zIndex: 99, 
        placement: 'top',
        // Importante: garante que o tooltip siga o elemento corretamente
        appendTo: 'parent' 
      }}
      shouldShow={shouldShow}
      className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-xl rounded-lg flex items-center gap-1 p-2 overflow-hidden animate-in fade-in zoom-in-95 duration-150"
    >
      {/* --- MENU DE FORMAS (SHAPES) --- */}
      {editor.isActive('shape') && (
        <div className="flex items-center gap-2">
           <div className="flex items-center gap-1 border-r border-gray-200 pr-2">
              <label className="cursor-pointer hover:bg-gray-100 p-1.5 rounded flex items-center justify-center relative group" title="Cor de Fundo">
                 <PaintBucket size={16} className="text-gray-600"/>
                 <input 
                    type="color" 
                    className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                    onChange={(e) => editor.chain().focus().updateAttributes('shape', { color: e.target.value }).run()}
                    value={editor.getAttributes('shape').color || '#e5e7eb'}
                 />
                 <div className="absolute bottom-0 right-0 w-2 h-2 rounded-full border border-white" style={{ background: editor.getAttributes('shape').color }}></div>
              </label>

              <label className="cursor-pointer hover:bg-gray-100 p-1.5 rounded flex items-center justify-center relative group" title="Cor da Borda">
                 <Square size={16} className="text-gray-600"/>
                 <input 
                    type="color" 
                    className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                    onChange={(e) => editor.chain().focus().updateAttributes('shape', { borderColor: e.target.value }).run()}
                    value={editor.getAttributes('shape').borderColor || '#000000'}
                 />
                 <div className="absolute bottom-0 right-0 w-2 h-2 rounded-full border border-white" style={{ background: editor.getAttributes('shape').borderColor }}></div>
              </label>
           </div>

           <select 
              className="text-xs border border-gray-200 rounded p-1 bg-transparent focus:ring-2 focus:ring-purple-500 outline-none cursor-pointer"
              onChange={(e) => editor.chain().focus().updateAttributes('shape', { strokeWidth: parseInt(e.target.value) }).run()}
              defaultValue={editor.getAttributes('shape').strokeWidth || 0}
           >
              <option value="0">Sem Borda</option>
              <option value="2">Fina</option>
              <option value="4">Média</option>
              <option value="8">Grossa</option>
           </select>
        </div>
      )}

      {/* --- MENU DE IMAGENS --- */}
      {editor.isActive('image') && (
         <div className="flex items-center gap-1 border-r border-gray-200 pr-2 mr-2">
            <button onClick={() => editor.chain().focus().setTextAlign('left').run()} className="p-1.5 hover:bg-gray-100 rounded"><AlignLeft size={16}/></button>
            <button onClick={() => editor.chain().focus().setTextAlign('center').run()} className="p-1.5 hover:bg-gray-100 rounded"><AlignCenter size={16}/></button>
            <button onClick={() => editor.chain().focus().setTextAlign('right').run()} className="p-1.5 hover:bg-gray-100 rounded"><AlignRight size={16}/></button>
            
            <div className="w-px h-4 bg-gray-200 mx-1"></div>
            
            <button 
                onClick={() => {
                    const width = prompt('Largura (ex: 50%, 300px):', '100%');
                    if(width) editor.chain().focus().updateAttributes('image', { width }).run();
                }} 
                className="p-1.5 hover:bg-gray-100 rounded flex items-center gap-1 text-xs font-bold"
                title="Tamanho"
            >
                <Maximize2 size={16}/> 
            </button>
         </div>
      )}

      {/* --- MENU DE COLUNAS/TABELA --- */}
      {editor.isActive('table') && (
         <div className="flex items-center gap-1 border-r border-gray-200 pr-2 mr-2">
             <button onClick={() => editor.chain().focus().addColumnBefore().run()} className="p-1.5 hover:bg-gray-100 rounded text-xs" title="Adicionar Coluna">+ Col</button>
             <button onClick={() => editor.chain().focus().deleteColumn().run()} className="p-1.5 hover:bg-red-50 text-red-500 rounded text-xs" title="Remover Coluna">- Col</button>
             <button onClick={() => editor.chain().focus().deleteTable().run()} className="p-1.5 hover:bg-red-50 text-red-600 rounded ml-2" title="Remover Layout"><Layout size={16}/></button>
         </div>
      )}

      {/* Botão de Excluir Geral (sempre visível se algo estiver selecionado) */}
      <button 
        onClick={() => editor.chain().focus().deleteSelection().run()} 
        className="p-1.5 hover:bg-red-50 text-red-500 hover:text-red-700 rounded transition-colors ml-auto" 
        title="Excluir"
      >
        <Trash2 size={16} />
      </button>
    </BubbleMenu>
  );
}