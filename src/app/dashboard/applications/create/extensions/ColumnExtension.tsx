'use client';

import { Node, mergeAttributes } from '@tiptap/core';

export const Column = Node.create({
  name: 'column',
  content: 'block+',
  isolating: true,
  addAttributes() {
    return {
      width: {
        default: '50%',
        renderHTML: attributes => ({
          style: `flex: 1; min-width: 0; padding: 8px; border: 1px dashed transparent;`,
        }),
      },
    };
  },
  renderHTML({ HTMLAttributes }) {
    return ['div', mergeAttributes(HTMLAttributes, { 'data-type': 'column' }), 0];
  },
  parseHTML() {
    return [{ tag: 'div[data-type="column"]' }];
  },
});

export const Columns = Node.create({
  name: 'columns',
  content: 'column+',
  group: 'block',
  defining: true,
  isolating: true,
  addAttributes() {
    return {
      cols: { default: 2 },
    };
  },
  renderHTML({ HTMLAttributes }) {
    return ['div', mergeAttributes(HTMLAttributes, { 'data-type': 'columns', class: 'flex gap-4 w-full my-4' }), 0];
  },
  parseHTML() {
    return [{ tag: 'div[data-type="columns"]' }];
  },
  addCommands() {
    return {
      setColumns: (cols: number) => ({ commands }) => {
        const columns = Array.from({ length: cols }).map(() => ({
          type: 'column',
          content: [{ type: 'paragraph' }]
        }));
        return commands.insertContent({
          type: 'columns',
          attrs: { cols },
          content: columns
        });
      },
    };
  },
});