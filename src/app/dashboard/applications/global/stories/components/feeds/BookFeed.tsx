"use client";
import BaseFeed from './BaseFeed';

export default function BookFeed({ userId }: { userId?: string }) {
  return (
    <BaseFeed 
      category="books" 
      currentUserId={userId}
      emptyMessage="Nenhuma leitura compartilhada recentemente. Seja o primeiro!" 
    />
  );
}