import { Node, mergeAttributes } from '@tiptap/core';

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    shape: {
      insertShape: (options: { type: 'circle' | 'square' | 'rectangle', color?: string }) => ReturnType;
    };
  }
}

export const ShapeExtension = Node.create({
  name: 'shape',
  group: 'block',
  atom: true,

  addAttributes() {
    return {
      type: { default: 'rectangle' },
      color: { default: '#3b82f6' },
      width: { default: '100px' },
      height: { default: '100px' },
    };
  },

  parseHTML() {
    return [{ tag: 'div[data-type="shape"]' }];
  },

  renderHTML({ HTMLAttributes }) {
    const style = `
      width: ${HTMLAttributes.width};
      height: ${HTMLAttributes.height};
      background-color: ${HTMLAttributes.color};
      border-radius: ${HTMLAttributes.type === 'circle' ? '50%' : '4px'};
      display: inline-block;
      margin: 1rem;
      cursor: pointer;
    `;
    return ['div', mergeAttributes(HTMLAttributes, { 'data-type': 'shape', style }), ''];
  },

  addCommands() {
    return {
      insertShape: (options) => ({ commands }) => {
        return commands.insertContent({
          type: this.name,
          attrs: options,
        });
      },
    };
  },
});