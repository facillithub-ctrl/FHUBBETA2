"use client";
import BaseFeed from './BaseFeed';
import { StoryPost } from '../../types';

interface BookFeedProps {
  userId?: string;
  onPostClick?: (post: StoryPost) => void;
}

export default function BookFeed({ userId, onPostClick }: BookFeedProps) {
  return (
    <BaseFeed 
      category="books" 
      currentUserId={userId}
      onPostClick={onPostClick}
      emptyMessage="Nenhuma leitura compartilhada recentemente. Seja o primeiro!" 
    />
  );
}