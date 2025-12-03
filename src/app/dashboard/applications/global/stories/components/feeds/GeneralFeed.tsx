"use client";
import BaseFeed from './BaseFeed';

export default function GeneralFeed({ userId }: { userId?: string }) {
  return (
    <BaseFeed 
      category="all" 
      currentUserId={userId}
      emptyMessage="O que está acontecendo no campus? Compartilhe algo!" 
    />
  );
}
