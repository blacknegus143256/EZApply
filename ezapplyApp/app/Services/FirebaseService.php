<?php

namespace App\Services;

use Kreait\Firebase\Factory;
use Kreait\Firebase\Database;
use Kreait\Firebase\Exception\FirebaseException;
use Illuminate\Support\Facades\Log;

class FirebaseService
{
    protected $database;
    protected $factory;

    public function __construct()
    {
        try {
            $this->factory = (new Factory)
                ->withServiceAccount([
                    'type' => 'service_account',
                    'project_id' => config('services.firebase.project_id'),
                    'private_key_id' => config('services.firebase.private_key_id'),
                    'private_key' => str_replace('\\n', "\n", config('services.firebase.private_key')),
                    'client_email' => config('services.firebase.client_email'),
                    'client_id' => config('services.firebase.client_id'),
                    'auth_uri' => 'https://accounts.google.com/o/oauth2/auth',
                    'token_uri' => 'https://oauth2.googleapis.com/token',
                    'auth_provider_x509_cert_url' => 'https://www.googleapis.com/oauth2/v1/certs',
                    'client_x509_cert_url' => config('services.firebase.client_x509_cert_url'),
                ])
                ->withDatabaseUri(config('services.firebase.database_url'));

            $this->database = $this->factory->createDatabase();
        } catch (\Exception $e) {
            Log::error('Firebase initialization failed: ' . $e->getMessage());
            throw $e;
        }
    }

    /**
     * Send a message to Firebase Realtime Database
     *
     * @param array $messageData
     * @param int $senderId
     * @param int $receiverId
     * @return void
     */
    public function sendMessage(array $messageData, int $senderId, int $receiverId): void
    {
        try {
            // Create channel name (same format as before for consistency)
            $channelName = $this->getChannelName($senderId, $receiverId);
            
            // Use push() to generate a unique key for each message
            // This ensures onChildAdded will always trigger for new messages
            $messagesRef = $this->database->getReference("chats/{$channelName}/messages");
            $newMessageRef = $messagesRef->push();
            
            $path = $newMessageRef->getKey();
            
            Log::info("Sending message to Firebase", [
                'path' => "chats/{$channelName}/messages/{$path}",
                'channel' => $channelName,
                'message_id' => $messageData['id'],
                'firebase_key' => $path,
            ]);
            
            // Store message in Firebase with the auto-generated key
            $newMessageRef->set([
                'id' => $messageData['id'],
                'sender_id' => $messageData['sender_id'],
                'receiver_id' => $messageData['receiver_id'],
                'message' => $messageData['message'],
                'created_at' => $messageData['created_at'],
                'timestamp' => time() * 1000, // Firebase timestamp in milliseconds
            ]);

            // Verify it was written
            $written = $newMessageRef->getValue();
            if ($written) {
                Log::info("Message successfully written to Firebase: chats/{$channelName}/messages/{$path}");
            } else {
                Log::warning("Message write to Firebase may have failed: chats/{$channelName}/messages/{$path}");
            }

            // Also update the conversation metadata
            $conversationPath = "chats/{$channelName}";
            $this->database->getReference("{$conversationPath}/last_message")->set([
                'id' => $messageData['id'],
                'message' => $messageData['message'],
                'sender_id' => $messageData['sender_id'],
                'created_at' => $messageData['created_at'],
                'timestamp' => time() * 1000,
            ]);

        } catch (\Exception $e) {
            Log::error('Firebase send message failed', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);
            throw $e;
        }
    }

    /**
     * Get channel name for a conversation
     * Firebase paths cannot contain dots, so we use underscores instead
     *
     * @param int $userId1
     * @param int $userId2
     * @return string
     */
    public function getChannelName(int $userId1, int $userId2): string
    {
        return 'chat_' . min($userId1, $userId2) . '_' . max($userId1, $userId2);
    }

    /**
     * Mark message as read
     *
     * @param int $messageId
     * @param int $userId
     * @param int $senderId
     * @param int $receiverId
     * @return void
     */
    public function markMessageAsRead(int $messageId, int $userId, int $senderId, int $receiverId): void
    {
        try {
            $channelName = $this->getChannelName($senderId, $receiverId);
            $path = "chats/{$channelName}/messages/{$messageId}/read_by/{$userId}";
            $this->database->getReference($path)->set([
                'read_at' => now()->toISOString(),
                'timestamp' => time() * 1000,
            ]);
        } catch (FirebaseException $e) {
            Log::error('Firebase mark as read failed: ' . $e->getMessage());
        }
    }

    /**
     * Get Firebase database instance
     *
     * @return Database
     */
    public function getDatabase(): Database
    {
        return $this->database;
    }
}

