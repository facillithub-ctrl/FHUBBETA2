"use client";
import BaseFeed from './BaseFeed';

export default function MovieFeed({ userId }: { userId?: string }) {
  return (
    <BaseFeed 
      category="movies" 
      currentUserId={userId}
      emptyMessage="Nenhum filme ou série comentado. Assistiu algo bom?" 
    />
  );
}