import { Editor } from '@tiptap/react';

export default function StatsWidget({ editor }: { editor: Editor | null }) {
  if (!editor) return null;

  const words = editor.storage.characterCount.words();
  const chars = editor.storage.characterCount.characters();
  // Estima tempo de leitura (média 200 palavras/min)
  const readTime = Math.ceil(words / 200);

  return (
    <div className="flex items-center gap-4 text-xs text-gray-400 font-mono">
      <span>{words} palavras</span>
      <span>{chars} caracteres</span>
      <span>~{readTime} min de leitura</span>
    </div>
  );
}