declare module 'laravel-echo' {
    interface EchoConfig {
        broadcaster: string;
        key: string;
        cluster?: string;
        forceTLS?: boolean;
        encrypted?: boolean;
        authEndpoint: string;
        auth?: {
            headers: {
                [key: string]: string;
            };
        };
    }

    interface Channel {
        listen(event: string, callback: (data: any) => void): Channel;
        stopListening(event?: string): Channel;
        subscribed(callback: () => void): Channel;
        error(callback: (error: any) => void): Channel;
    }

    interface PrivateChannel extends Channel {
        whisper(event: string, data: any): PrivateChannel;
    }

    class Echo {
        constructor(config: EchoConfig);
        channel(channel: string): Channel;
        private(channel: string): PrivateChannel;
        leave(channel: string): void;
        disconnect(): void;
    }

    export default Echo;
}

