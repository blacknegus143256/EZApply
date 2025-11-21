import Echo from 'laravel-echo';
import Pusher from 'pusher-js';

declare global {
    interface Window {
        Pusher: any;
        Echo: any;
    }
}

// Initialize Pusher
window.Pusher = Pusher as any;

// Initialize Laravel Echo only if Pusher credentials are available
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
    } catch (error) {
        console.warn('Failed to initialize Laravel Echo:', error);
        window.Echo = null;
    }
} else {
    console.warn('Pusher app key not found. Real-time features will be disabled. Add VITE_PUSHER_APP_KEY to your .env file.');
    window.Echo = null;
}

export default window.Echo;

