// src/app/dashboard/applications/library/components/FileList.tsx
'use client'

import React from 'react';
import { LibraryItem } from '../types';
import FileCard from './FileCard';

interface FileListProps {
  initialItems: LibraryItem[];
  folderId: string | null;
}

export default function FileList({ initialItems }: FileListProps) {
  // Num cenário real, aqui teríamos lógica de drag-and-drop e updates via client
  const folders = initialItems.filter(i => i.type === 'folder');
  const files = initialItems.filter(i => i.type !== 'folder');

  if (initialItems.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-gray-400">
        <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
          <i className="fas fa-folder-open text-2xl"></i>
        </div>
        <p>Esta pasta está vazia</p>
        <button className="mt-4 text-sm text-royal-blue hover:underline">Fazer upload de arquivos</button>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Seção de Pastas */}
      {folders.length > 0 && (
        <div className="mb-8">
          <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4">Pastas</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {folders.map(item => (
              <FileCard key={item.id} item={item} />
            ))}
          </div>
        </div>
      )}

      {/* Seção de Arquivos */}
      {files.length > 0 && (
        <div>
          <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4">Arquivos</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {files.map(item => (
              <FileCard key={item.id} item={item} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}