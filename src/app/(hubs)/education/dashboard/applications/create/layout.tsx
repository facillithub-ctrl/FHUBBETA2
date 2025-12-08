import React from 'react';

export default function CreateLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    // Usa h-full para respeitar o layout pai do dashboard, em vez de forçar 100vh
    <div className="flex flex-col h-full w-full bg-[#F8F9FA] dark:bg-zinc-950 overflow-hidden">
      <main className="flex-1 flex flex-col relative min-w-0 h-full overflow-hidden">
        {children}
      </main>
    </div>
  );
}