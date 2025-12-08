import React from 'react';
import { Editor } from '@tiptap/react';
import { Clock, Type, FileText } from 'lucide-react';

interface Props {
  editor: Editor | null;
}

export const StatsWidget = ({ editor }: Props) => {
  if (!editor) return null;

  const wordCount = editor.storage.characterCount.words();
  const charCount = editor.storage.characterCount.characters();
  
  // Média de leitura: 200 palavras por minuto
  const readTime = Math.ceil(wordCount / 200);

  return (
    <div className="flex items-center gap-4 text-xs text-zinc-500 dark:text-zinc-400 border-t border-zinc-200 dark:border-zinc-800 pt-4 mt-4">
      <div className="flex items-center gap-1.5" title="Palavras">
        <FileText size={14} />
        <span>{wordCount} palavras</span>
      </div>
      <div className="flex items-center gap-1.5" title="Caracteres">
        <Type size={14} />
        <span>{charCount} caracteres</span>
      </div>
      <div className="flex items-center gap-1.5" title="Tempo de leitura estimado">
        <Clock size={14} />
        <span>~{readTime} min</span>
      </div>
    </div>
  );
};