"use client";
import BaseFeed from './BaseFeed';

export default function GeneralFeed({ userId }: { userId?: string }) {
  return (
    <BaseFeed 
      category="all" 
      currentUserId={userId}
      emptyMessage="Seu feed está silencioso. Siga mais pessoas ou poste algo!" 
    />
  );
}