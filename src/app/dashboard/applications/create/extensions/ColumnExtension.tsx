import { Node, mergeAttributes } from '@tiptap/core';

export const ColumnExtension = Node.create({
  name: 'columns',
  group: 'block',
  content: 'column+', // Aceita apenas colunas dentro
  
  addAttributes() {
    return {
      cols: { default: 2 },
    };
  },

  parseHTML() {
    return [{ tag: 'div[data-type="columns"]' }];
  },

  renderHTML({ HTMLAttributes }) {
    return ['div', mergeAttributes(HTMLAttributes, { 'data-type': 'columns', class: `grid gap-4 grid-cols-${HTMLAttributes.cols}` }), 0];
  },
});

export const ColumnChild = Node.create({
  name: 'column',
  content: 'block+', // Aceita blocos (texto, imagem, etc)
  group: 'block',
  
  parseHTML() {
    return [{ tag: 'div[data-type="column"]' }];
  },

  renderHTML({ HTMLAttributes }) {
    return ['div', mergeAttributes(HTMLAttributes, { 'data-type': 'column', class: 'border border-dashed border-gray-200 p-2 min-h-[50px]' }), 0];
  },
});