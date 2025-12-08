import { Node, mergeAttributes } from '@tiptap/core';

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    columns: {
      setColumns: (cols: 1 | 2 | 3) => ReturnType;
    };
  }
}

export const ColumnExtension = Node.create({
  name: 'columnBlock',
  group: 'block',
  content: 'paragraph+', // Aceita parágrafos dentro

  addAttributes() {
    return {
      cols: { default: 1 },
    };
  },

  parseHTML() {
    return [{ tag: 'div[data-type="columns"]' }];
  },

  renderHTML({ HTMLAttributes }) {
    const cols = HTMLAttributes.cols || 1;
    const style = `display: grid; grid-template-columns: repeat(${cols}, 1fr); gap: 1rem;`;
    return ['div', mergeAttributes(HTMLAttributes, { 'data-type': 'columns', style }), 0];
  },

  addCommands() {
    return {
      setColumns: (cols) => ({ commands }) => {
        return commands.updateAttributes('columnBlock', { cols });
      },
    };
  },
});