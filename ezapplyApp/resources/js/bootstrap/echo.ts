import { initializeFirebase, getFirebaseDatabase } from '@/lib/firebase';
import Echo from 'laravel-echo';
import Pusher from 'pusher-js';

declare global {
    interface Window {
        Firebase: any;
        Pusher: any;
        Echo: any;
    }
}

// Initialize Pusher for Laravel Echo (used for notifications)
window.Pusher = Pusher as any;

// Initialize Laravel Echo for notifications (if Pusher credentials are available)
const pusherKey = import.meta.env.VITE_PUSHER_APP_KEY;

if (pusherKey) {
    try {
        window.Echo = new Echo({
            broadcaster: 'pusher',
            key: pusherKey,
            cluster: import.meta.env.VITE_PUSHER_APP_CLUSTER ?? 'mt1',
            forceTLS: true,
            authEndpoint: '/broadcasting/auth',
            auth: {
                headers: {
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                },
            },
        });
        console.log('Laravel Echo initialized for notifications');
    } catch (error) {
        console.warn('Failed to initialize Laravel Echo:', error);
        window.Echo = null;
    }
} else {
    console.warn('Pusher app key not found. Notifications will use polling.');
    window.Echo = null;
}

// Initialize Firebase for chat messages
const firebaseDb = initializeFirebase();

if (firebaseDb) {
    window.Firebase = {
        database: firebaseDb,
        initialized: true,
    };
    console.log('Firebase initialized for real-time chat');
} else {
    console.warn('Firebase initialization failed. Chat will use polling.');
    window.Firebase = {
        database: null,
        initialized: false,
    };
}

export default { Echo: window.Echo, Firebase: window.Firebase };

