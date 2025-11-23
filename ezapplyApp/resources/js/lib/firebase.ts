import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import { getDatabase, Database, ref, onChildAdded, off, set, serverTimestamp } from 'firebase/database';

interface FirebaseConfig {
  apiKey: string;
  authDomain: string;
  databaseURL: string;
  projectId: string;
  storageBucket?: string;
  messagingSenderId?: string;
  appId?: string;
}

let app: FirebaseApp | null = null;
let database: Database | null = null;

/**
 * Initialize Firebase
 */
export function initializeFirebase(): Database | null {
  if (database) {
    return database;
  }

  const config: FirebaseConfig = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL,
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: import.meta.env.VITE_FIREBASE_APP_ID,
  };

  // Check if Firebase is already initialized
  if (getApps().length === 0) {
    if (!config.apiKey || !config.databaseURL) {
      console.warn('Firebase configuration is missing. Real-time features will be disabled.');
      return null;
    }

    try {
      app = initializeApp(config);
      database = getDatabase(app);
      console.log('Firebase initialized successfully');
    } catch (error) {
      console.error('Failed to initialize Firebase:', error);
      return null;
    }
  } else {
    app = getApps()[0];
    database = getDatabase(app);
  }

  return database;
}

/**
 * Get Firebase database instance
 */
export function getFirebaseDatabase(): Database | null {
  if (!database) {
    return initializeFirebase();
  }
  return database;
}

/**
 * Listen for new messages in a chat channel
 * Uses onChildAdded which only triggers for NEW children added after listener is attached
 */
export function listenToMessages(
  channelName: string,
  callback: (message: any) => void
): () => void {
  const db = getFirebaseDatabase();
  if (!db) {
    console.warn('Firebase database not available. Cannot listen to messages.');
    return () => {};
  }

  const messagesRef = ref(db, `chats/${channelName}/messages`);
  
  console.log(`[Firebase] Listening to channel: chats/${channelName}/messages`);
  
  // Track which message IDs we've already seen to avoid duplicates
  const seenMessageIds = new Set<number>();
  
  // Use onChildAdded - this will trigger for each existing child first, then for new ones
  const unsubscribe = onChildAdded(messagesRef, (snapshot) => {
    if (snapshot.exists()) {
      const messageData = snapshot.val();
      const messageId = messageData.id;
      
      // Skip if we've already processed this message
      if (seenMessageIds.has(messageId)) {
        console.log(`[Firebase] Skipping duplicate message ID: ${messageId}`);
        return;
      }
      
      seenMessageIds.add(messageId);
      console.log('[Firebase] New message received:', messageData);
      
      callback({
        id: messageData.id,
        sender_id: messageData.sender_id,
        receiver_id: messageData.receiver_id,
        message: messageData.message,
        created_at: messageData.created_at,
      });
    }
  });

  return () => {
    console.log(`[Firebase] Unsubscribing from channel: chats/${channelName}/messages`);
    off(messagesRef);
    unsubscribe();
    seenMessageIds.clear();
  };
}

/**
 * Get channel name for a conversation
 * Firebase paths cannot contain dots (.), so we use underscores instead
 * Format: chat_2_3 (instead of chat.2.3)
 */
export function getChannelName(userId1: number, userId2: number): string {
  const minId = Math.min(userId1, userId2);
  const maxId = Math.max(userId1, userId2);
  return `chat_${minId}_${maxId}`;
}

/**
 * Mark message as read
 */
export function markMessageAsRead(
  channelName: string,
  messageId: number,
  userId: number
): void {
  const db = getFirebaseDatabase();
  if (!db) {
    return;
  }

  const readRef = ref(db, `chats/${channelName}/messages/${messageId}/read_by/${userId}`);
  set(readRef, {
    read_at: new Date().toISOString(),
    timestamp: serverTimestamp(),
  });
}

export default {
  initializeFirebase,
  getFirebaseDatabase,
  listenToMessages,
  getChannelName,
  markMessageAsRead,
};

