'use client';

import { BubbleMenu, Editor } from '@tiptap/react';
import { 
  PaintBucket, Square, Trash2, 
  AlignLeft, AlignCenter, AlignRight, 
  Maximize2, Columns
} from 'lucide-react';

interface Props {
  editor: Editor | null;
}

export default function EditorBubbleMenu({ editor }: Props) {
  if (!editor) return null;

  const isShape = editor.isActive('shape');
  const isImage = editor.isActive('image');
  const isTable = editor.isActive('table');

  if (!isShape && !isImage && !isTable) return null;

  return (
    <BubbleMenu 
      editor={editor} 
      tippyOptions={{ duration: 100, maxWidth: 600, zIndex: 99 }}
      className="bg-white border border-gray-200 shadow-xl rounded-lg flex items-center gap-1 p-1 overflow-hidden"
    >
      {/* --- MENU PARA FORMAS (SHAPES) --- */}
      {isShape && (
        <div className="flex items-center gap-1 p-1">
           <div className="flex items-center gap-1 p-1 border-r border-gray-200">
              <label className="cursor-pointer hover:bg-gray-100 p-1.5 rounded flex flex-col items-center" title="Cor de Fundo">
                 <PaintBucket size={16} className="text-gray-600"/>
                 <input 
                    type="color" 
                    className="w-0 h-0 opacity-0 absolute"
                    onChange={(e) => editor.chain().focus().updateAttributes('shape', { color: e.target.value }).run()}
                 />
                 <div className="w-4 h-1 mt-0.5 rounded-full" style={{ background: editor.getAttributes('shape').color }}></div>
              </label>

              <label className="cursor-pointer hover:bg-gray-100 p-1.5 rounded flex flex-col items-center" title="Cor da Borda">
                 <Square size={16} className="text-gray-600"/>
                 <input 
                    type="color" 
                    className="w-0 h-0 opacity-0 absolute"
                    onChange={(e) => editor.chain().focus().updateAttributes('shape', { borderColor: e.target.value }).run()}
                 />
                 <div className="w-4 h-1 mt-0.5 rounded-full border border-gray-300" style={{ background: editor.getAttributes('shape').borderColor }}></div>
              </label>

              <select 
                 className="text-xs border rounded p-1 ml-1"
                 onChange={(e) => editor.chain().focus().updateAttributes('shape', { strokeWidth: parseInt(e.target.value) }).run()}
                 defaultValue={editor.getAttributes('shape').strokeWidth || 0}
              >
                 <option value="0">Sem Borda</option>
                 <option value="2">2px</option>
                 <option value="4">4px</option>
                 <option value="8">8px</option>
              </select>
           </div>
        </div>
      )}

      {/* --- MENU PARA IMAGENS --- */}
      {isImage && (
         <div className="flex items-center gap-1 p-1 border-r border-gray-200">
            <button onClick={() => editor.chain().focus().setTextAlign('left').run()} className="p-1.5 hover:bg-gray-100 rounded"><AlignLeft size={16}/></button>
            <button onClick={() => editor.chain().focus().setTextAlign('center').run()} className="p-1.5 hover:bg-gray-100 rounded"><AlignCenter size={16}/></button>
            <button onClick={() => editor.chain().focus().setTextAlign('right').run()} className="p-1.5 hover:bg-gray-100 rounded"><AlignRight size={16}/></button>
            
            <div className="w-px h-6 bg-gray-200 mx-1"></div>
            
            <button 
                onClick={() => {
                    const width = prompt('Largura da imagem (ex: 300px ou 100%):', '100%');
                    if(width) editor.chain().focus().updateAttributes('image', { width }).run();
                }} 
                className="p-1.5 hover:bg-gray-100 rounded flex items-center gap-1 text-xs font-bold"
            >
                <Maximize2 size={16}/> Tam.
            </button>
         </div>
      )}

      {/* --- MENU PARA TABELAS (COLUNAS) --- */}
      {isTable && (
         <div className="flex items-center gap-1 p-1 border-r border-gray-200">
             <button onClick={() => editor.chain().focus().addColumnBefore().run()} className="p-1.5 hover:bg-gray-100 rounded text-xs whitespace-nowrap">+ Coluna</button>
             <button onClick={() => editor.chain().focus().deleteColumn().run()} className="p-1.5 hover:bg-gray-100 rounded text-red-500 text-xs whitespace-nowrap">- Coluna</button>
             <div className="w-px h-6 bg-gray-200 mx-1"></div>
             <button onClick={() => editor.chain().focus().deleteTable().run()} className="p-1.5 hover:bg-red-50 text-red-600 rounded" title="Remover Grid"><Trash2 size={16}/></button>
         </div>
      )}

      {/* Botão Comum de Excluir */}
      {!isTable && (
          <button 
            onClick={() => editor.chain().focus().deleteSelection().run()} 
            className="p-1.5 hover:bg-red-50 text-red-600 rounded ml-1" 
            title="Excluir Seleção"
          >
            <Trash2 size={16} />
          </button>
      )}
    </BubbleMenu>
  );
}