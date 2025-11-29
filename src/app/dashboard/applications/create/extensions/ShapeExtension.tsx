'use client';

import { Node, mergeAttributes } from '@tiptap/core';
import { ReactNodeViewRenderer, NodeViewWrapper } from '@tiptap/react';
import React from 'react';

const ShapeComponent = ({ node, updateAttributes, selected }: any) => {
  const { width, height, color, type, strokeWidth, borderColor } = node.attrs;

  const handleResize = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    const startX = e.clientX;
    const startY = e.clientY;
    const startWidth = parseInt(width);
    const startHeight = parseInt(height);

    const doDrag = (dragEvent: MouseEvent) => {
      const newWidth = startWidth + (dragEvent.clientX - startX);
      const newHeight = startHeight + (dragEvent.clientY - startY);
      
      updateAttributes({ 
        width: `${Math.max(20, newWidth)}px`,
        height: `${Math.max(20, newHeight)}px`
      });
    };

    const stopDrag = () => {
      window.removeEventListener('mousemove', doDrag);
      window.removeEventListener('mouseup', stopDrag);
    };

    window.addEventListener('mousemove', doDrag);
    window.addEventListener('mouseup', stopDrag);
  };

  return (
    <NodeViewWrapper className={`node-shape inline-block align-middle mx-2 relative group ${selected ? 'ProseMirror-selectednode' : ''}`}>
      <div
        style={{
          width,
          height,
          backgroundColor: color,
          border: `${strokeWidth}px solid ${borderColor}`,
          borderRadius: type === 'circle' ? '50%' : '0px',
          transition: 'all 0.1s ease',
          position: 'relative'
        }}
      >
        {/* Alça de redimensionamento */}
        <div 
          className="resize-handle br" 
          onMouseDown={handleResize}
          style={{
            position: 'absolute',
            bottom: '-6px',
            right: '-6px',
            width: '12px',
            height: '12px',
            backgroundColor: '#8B5CF6',
            border: '2px solid white',
            borderRadius: '50%',
            cursor: 'nwse-resize',
            zIndex: 50,
            display: selected ? 'block' : 'none'
          }}
        />
      </div>
    </NodeViewWrapper>
  );
};

export const ShapeExtension = Node.create({
  name: 'shape',
  group: 'inline',
  inline: true,
  draggable: true,
  selectable: true,
  atom: true,

  addAttributes() {
    return {
      type: { default: 'rectangle' },
      width: { default: '100px' },
      height: { default: '100px' },
      color: { default: '#e5e7eb' },
      borderColor: { default: '#000000' },
      strokeWidth: { default: 0 },
    };
  },

  parseHTML() {
    return [
      {
        tag: 'div[data-type="shape"]',
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return ['div', mergeAttributes(HTMLAttributes, { 'data-type': 'shape' })];
  },

  addNodeView() {
    return ReactNodeViewRenderer(ShapeComponent);
  },
}); 