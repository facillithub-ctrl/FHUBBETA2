"use client";
import BaseFeed from './BaseFeed';

export default function MovieFeed({ userId }: { userId?: string }) {
  return (
    <BaseFeed 
      category="movies" 
      currentUserId={userId}
      emptyMessage="Nenhuma maratona registrada recentemente." 
    />
  );
}