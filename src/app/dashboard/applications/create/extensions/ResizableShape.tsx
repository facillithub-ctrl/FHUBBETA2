import { Node, mergeAttributes } from '@tiptap/core';
import { ReactNodeViewRenderer, NodeViewWrapper } from '@tiptap/react';
import React, { useState, useRef, useEffect } from 'react';
import { Move } from 'lucide-react';

const ResizableShapeComponent = ({ node, updateAttributes, selected }: any) => {
  const { width, height, color, type, align } = node.attrs;
  const [isResizing, setIsResizing] = useState(false);
  
  // Handles de redimensionamento
  const handleMouseDown = (e: React.MouseEvent, direction: string) => {
    e.preventDefault();
    e.stopPropagation();
    setIsResizing(true);

    const startX = e.clientX;
    const startY = e.clientY;
    const startWidth = parseInt(width);
    const startHeight = parseInt(height);

    const onMouseMove = (moveEvent: MouseEvent) => {
      let newWidth = startWidth;
      let newHeight = startHeight;

      const deltaX = moveEvent.clientX - startX;
      const deltaY = moveEvent.clientY - startY;

      // Lógica para cada canto
      if (direction.includes('e')) newWidth = startWidth + deltaX; // East (Direita)
      if (direction.includes('w')) newWidth = startWidth - deltaX; // West (Esquerda)
      if (direction.includes('s')) newHeight = startHeight + deltaY; // South (Baixo)
      if (direction.includes('n')) newHeight = startHeight - deltaY; // North (Cima)

      // Limites mínimos
      newWidth = Math.max(20, newWidth);
      newHeight = Math.max(20, newHeight);

      updateAttributes({ 
        width: `${newWidth}px`, 
        height: `${newHeight}px` 
      });
    };

    const onMouseUp = () => {
      setIsResizing(false);
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
    };

    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
  };

  return (
    <NodeViewWrapper 
      className="react-component-with-content group" 
      style={{ 
        display: 'flex', 
        justifyContent: align || 'center', 
        margin: '1rem 0',
        position: 'relative'
      }}
    >
      <div
        className={`relative transition-all duration-75 ${selected || isResizing ? 'ring-2 ring-blue-500 ring-offset-4' : 'hover:ring-1 hover:ring-gray-300'}`}
        style={{
          width: width,
          height: height,
          backgroundColor: color,
          borderRadius: type === 'circle' ? '50%' : '4px',
          position: 'relative'
        }}
      >
        {/* Drag Handle (Aparece no Hover/Select) - Permite arrastar o bloco */}
        <div 
          className="absolute -top-8 left-1/2 -translate-x-1/2 p-1 bg-white shadow-md rounded border border-gray-200 cursor-move opacity-0 group-hover:opacity-100 transition-opacity z-50 flex items-center justify-center"
          data-drag-handle
          title="Arrastar objeto"
        >
          <Move size={14} className="text-gray-500" />
        </div>

        {/* Handles de Redimensionamento (4 Cantos) */}
        {(selected || isResizing) && (
          <>
            {/* Top-Left */}
            <div onMouseDown={(e) => handleMouseDown(e, 'nw')} className="resize-handle cursor-nw-resize -top-1.5 -left-1.5" />
            {/* Top-Right */}
            <div onMouseDown={(e) => handleMouseDown(e, 'ne')} className="resize-handle cursor-ne-resize -top-1.5 -right-1.5" />
            {/* Bottom-Left */}
            <div onMouseDown={(e) => handleMouseDown(e, 'sw')} className="resize-handle cursor-sw-resize -bottom-1.5 -left-1.5" />
            {/* Bottom-Right */}
            <div onMouseDown={(e) => handleMouseDown(e, 'se')} className="resize-handle cursor-se-resize -bottom-1.5 -right-1.5" />
          </>
        )}
      </div>
      
      {/* Estilo local para os handles */}
      <style jsx global>{`
        .resize-handle {
          position: absolute;
          width: 10px;
          height: 10px;
          background-color: white;
          border: 2px solid #3b82f6;
          border-radius: 50%;
          z-index: 40;
        }
      `}</style>
    </NodeViewWrapper>
  );
};

export const ResizableShapeExtension = Node.create({
  name: 'resizableShape',
  group: 'block',
  atom: true,
  draggable: true, // Habilita o drag-and-drop nativo do Tiptap

  addAttributes() {
    return {
      type: { default: 'rectangle' },
      color: { default: '#3b82f6' },
      width: { default: '100px' },
      height: { default: '100px' },
      align: { default: 'center' },
    };
  },

  parseHTML() {
    return [{ tag: 'div[data-type="resizable-shape"]' }];
  },

  renderHTML({ HTMLAttributes }) {
    return ['div', mergeAttributes(HTMLAttributes, { 'data-type': 'resizable-shape' })];
  },

  addNodeView() {
    return ReactNodeViewRenderer(ResizableShapeComponent);
  },

  addCommands() {
    return {
      insertResizableShape: (options) => ({ commands }) => {
        return commands.insertContent({
          type: this.name,
          attrs: options,
        });
      },
    };
  },
});