// ARQUIVO: src/lib/firebase.ts
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { getMessaging, getToken, isSupported } from 'firebase/messaging';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: "facillit-hub.firebaseapp.com",
  projectId: "facillit-hub",
  storageBucket: "facillit-hub.appspot.com",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID
};

// Singleton: Evita inicializar múltiplas vezes no Next.js (Hot Reload)
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

// Inicializa os serviços necessários para o Stories
const db = getFirestore(app);
const storage = getStorage(app);

// Exporta as instâncias para uso no resto do app
export { app, db, storage };

// Função de notificações (Mantida do seu código original)
export const requestNotificationPermission = async () => {
  try {
    const supported = await isSupported();
    if (!supported) return null;

    const messaging = getMessaging(app);
    const permission = await Notification.requestPermission();
    
    if (permission === 'granted') {
      const token = await getToken(messaging, {
        vapidKey: process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY
      });
      return token;
    }
  } catch (error) {
    console.error('Erro ao pedir permissão de notificação:', error);
  }
  return null;
};