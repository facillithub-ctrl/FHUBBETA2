import { Node, mergeAttributes } from '@tiptap/core';

export const ColumnContainer = Node.create({
  name: 'columnContainer',
  group: 'block',
  content: 'paragraph+', 
  
  renderHTML({ HTMLAttributes }) {
    return ['div', mergeAttributes(HTMLAttributes, { class: 'grid grid-cols-2 gap-4 my-4' }), 0];
  },
  
  parseHTML() {
    return [{ tag: 'div.grid' }];
  },
});