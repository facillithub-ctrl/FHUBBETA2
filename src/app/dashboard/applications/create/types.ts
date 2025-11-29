export interface DocumentStats {
  words: number;
  characters: number;
  readTimeMinutes: number;
}

export interface EditorState {
  content: any; // JSON do Tiptap
  title: string;
  lastSaved: Date | null;
  isSaving: boolean;
}

export type EditorMode = 'focus' | 'full' | 'standard';