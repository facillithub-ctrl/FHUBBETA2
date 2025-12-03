import { useEffect, useState } from 'react';
import { db } from '@/lib/firebase';
import { doc, onSnapshot, setDoc, deleteDoc, collection, addDoc, query, orderBy, serverTimestamp } from 'firebase/firestore';

// --- HOOK DE LIKES ---
export function useRealtimeLikes(postId: string, userId?: string) {
  const [likesCount, setLikesCount] = useState(0);
  const [isLiked, setIsLiked] = useState(false);

  useEffect(() => {
    if (!postId) return;
    const likesRef = collection(db, 'posts', postId, 'likes');
    
    // Escuta contagem e estado em tempo real
    const unsubscribe = onSnapshot(likesRef, (snapshot) => {
      setLikesCount(snapshot.size);
      if (userId) {
        setIsLiked(snapshot.docs.some(doc => doc.id === userId));
      }
    });

    return () => unsubscribe();
  }, [postId, userId]);

  const toggleLike = async () => {
    if (!userId) return;
    const likeDocRef = doc(db, 'posts', postId, 'likes', userId);
    
    if (isLiked) {
      await deleteDoc(likeDocRef); // Remove like
    } else {
      await setDoc(likeDocRef, { likedAt: serverTimestamp() }); // Adiciona like
    }
  };

  return { likesCount, isLiked, toggleLike };
}

// --- HOOK DE COMENTÁRIOS ---
export function useRealtimeComments(postId: string) {
  const [comments, setComments] = useState<any[]>([]);

  useEffect(() => {
    if (!postId) return;
    const q = query(collection(db, 'posts', postId, 'comments'), orderBy('createdAt', 'desc'));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setComments(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });

    return () => unsubscribe();
  }, [postId]);

  const addComment = async (text: string, user: any) => {
    await addDoc(collection(db, 'posts', postId, 'comments'), {
      text,
      userId: user.id,
      userName: user.name,
      userAvatar: user.avatar_url,
      createdAt: serverTimestamp()
    });
  };

  return { comments, addComment };
}