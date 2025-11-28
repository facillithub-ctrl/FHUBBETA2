// src/app/dashboard/applications/library/layout.tsx
import React from 'react';
import LibrarySidebar from './components/LibrarySidebar';

export default function LibraryLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-[calc(100vh-64px)] bg-[#F8F9FA]"> {/* Altura ajustada para header global */}
      <LibrarySidebar />
      <main className="flex-1 overflow-y-auto p-6 relative">
        {children}
      </main>
    </div>
  );
}