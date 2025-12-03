"use client";
import BaseFeed from './BaseFeed';

export default function GamesFeed({ userId }: { userId?: string }) {
  return (
    <BaseFeed 
      category="games" 
      currentUserId={userId}
      emptyMessage="Nenhum gameplay ou conquista registrada." 
    />
  );
}