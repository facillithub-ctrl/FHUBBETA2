"use client";

import BaseFeed from '../BaseFeed';

export default function BookFeed({ userId }: { userId?: string }) {
  return (
    <BaseFeed 
      category="books" 
      currentUserId={userId}
      emptyMessage="Sua estante virtual está vazia. Que tal compartilhar sua leitura atual?" 
    />
  );
}