// src/app/dashboard/applications/library/types.ts
export type ItemType = 'folder' | 'pdf' | 'doc' | 'image' | 'video' | 'note' | 'link';

export interface LibraryItem {
  id: string;
  title: string;
  type: ItemType;
  size?: string; // Ex: '2.5 MB'
  updatedAt: string;
  isFavorite?: boolean;
  tags?: string[];
  author?: string; // Para livros oficiais
}

export interface BreadcrumbItem {
  id: string | null;
  name: string;
}