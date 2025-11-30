import { Node, mergeAttributes } from '@tiptap/core';
import { ReactNodeViewRenderer, NodeViewWrapper } from '@tiptap/react';
import React, { useState } from 'react';
import { Move } from 'lucide-react';

// --- CORREÇÃO DO ERRO DE BUILD ---
declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    resizableShape: {
      insertResizableShape: (options: { type: 'rectangle' | 'circle', color: string, width: string, height: string, align?: string }) => ReturnType;
    }
  }
}

const ResizableShapeComponent = ({ node, updateAttributes, selected }: any) => {
  const { width, height, color, type, align } = node.attrs;
  const [isResizing, setIsResizing] = useState(false);
  
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

      if (direction.includes('e')) newWidth = startWidth + deltaX;
      if (direction.includes('w')) newWidth = startWidth - deltaX;
      if (direction.includes('s')) newHeight = startHeight + deltaY;
      if (direction.includes('n')) newHeight = startHeight - deltaY;

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
      className="react-component-with-content group my-4 relative" 
      style={{ display: 'flex', justifyContent: align || 'center' }}
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
        {/* Drag Handle - Para mover o objeto */}
        <div 
          className="absolute -top-8 left-1/2 -translate-x-1/2 p-1.5 bg-white shadow-md rounded-full border border-gray-200 cursor-grab active:cursor-grabbing opacity-0 group-hover:opacity-100 transition-opacity z-50 flex items-center justify-center"
          data-drag-handle
          title="Segure para arrastar"
        >
          <Move size={14} className="text-gray-600" />
        </div>

        {/* Resize Handles (4 Cantos) */}
        {(selected || isResizing) && (
          <>
            <div onMouseDown={(e) => handleMouseDown(e, 'nw')} className="resize-handle -top-1.5 -left-1.5 cursor-nw-resize" />
            <div onMouseDown={(e) => handleMouseDown(e, 'ne')} className="resize-handle -top-1.5 -right-1.5 cursor-ne-resize" />
            <div onMouseDown={(e) => handleMouseDown(e, 'sw')} className="resize-handle -bottom-1.5 -left-1.5 cursor-sw-resize" />
            <div onMouseDown={(e) => handleMouseDown(e, 'se')} className="resize-handle -bottom-1.5 -right-1.5 cursor-se-resize" />
          </>
        )}
      </div>
      
      <style jsx global>{`
        .resize-handle {
          position: absolute;
          width: 12px;
          height: 12px;
          background-color: white;
          border: 2px solid #3b82f6;
          border-radius: 50%;
          z-index: 40;
          box-shadow: 0 1px 2px rgba(0,0,0,0.1);
        }
      `}</style>
    </NodeViewWrapper>
  );
};

export const ResizableShapeExtension = Node.create({
  name: 'resizableShape',
  group: 'block',
  atom: true,
  draggable: true,

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