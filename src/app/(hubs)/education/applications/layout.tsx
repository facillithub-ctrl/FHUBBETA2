import React from 'react';

export default function ApplicationsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Este layout envolve todas as páginas de módulos dentro de /applications
  return (
    <div>
      {children}
    </div>
  );
}