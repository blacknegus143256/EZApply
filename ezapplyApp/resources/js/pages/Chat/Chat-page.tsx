import React, { useState, useEffect, useRef } from "react";
import { useForm, usePage, router, Head } from "@inertiajs/react";
import type { PageProps as InertiaPageProps } from "@inertiajs/core";
import { route } from "ziggy-js";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ArrowLeft, User, Send, Paperclip, Smile } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ChatMessageSkeleton } from "@/components/ui/skeletons";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { listenToMessages, getChannelName } from "@/lib/firebase";

interface Message {
  id: number;
  sender_id: number;
  receiver_id: number;
  message: string;
  created_at: string;
}

interface CustomProps {
  messages: Message[];
  auth: {
    user: {
      id: number;
      first_name: string;
      last_name: string;
      email: string;
    } | null;
  };
  otherUser: {
    id: number;
    first_name: string;
    last_name: string;
    email: string;
  };
}

type PageProps = InertiaPageProps & CustomProps;

export default function ChatPage() {
  const { props } = usePage<PageProps>();
  const { ziggy } = props as any;
  const { messages, auth, otherUser } = props;

  const authUserId = auth.user?.id;
  const [messageList, setMessageList] = useState<Message[]>(messages);
  const [profileDialogOpen, setProfileDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const { data, setData, post, reset } = useForm({
    message: "",
  });

  const sendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!data.message.trim()) return;

    post(route("messages.store", otherUser.id, false, ziggy), {
      onSuccess: () => {
        reset("message");
      },
    });
  };

  
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messageList]);

  useEffect(() => {
    setMessageList(messages);
    if (messages) {
      const timer = setTimeout(() => {
        setIsLoading(false);
      }, 200);
      return () => clearTimeout(timer);
    }
  }, [messages]);
  
  useEffect(() => {
    if (!authUserId || !otherUser?.id) return;

    const channelName = getChannelName(authUserId, otherUser.id);
    
    const unsubscribe = listenToMessages(channelName, (data: any) => {
      const newMessage: Message = {
        id: data.id,
        sender_id: data.sender_id,
        receiver_id: data.receiver_id,
        message: data.message,
        created_at: data.created_at,
      };
      
      setMessageList((prev) => {
        if (prev.some((msg) => msg.id === newMessage.id)) {
          return prev;
        }
        return [...prev, newMessage];
      });
    });

    // Fallback to polling if Firebase is not available
    if (!unsubscribe || typeof unsubscribe !== 'function') {
      console.warn('Firebase is not available. Falling back to polling.');
      const interval = setInterval(() => {
        router.reload({ only: ["messages"] });
      }, 5000);
      return () => clearInterval(interval);
    }

    // Cleanup
    return () => {
      if (unsubscribe && typeof unsubscribe === 'function') {
        unsubscribe();
      }
    };
  }, [authUserId, otherUser?.id]);

  // Get user initials for avatar
  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName?.[0] || ''}${lastName?.[0] || ''}`.toUpperCase();
  };

  // Format message time
  const formatMessageTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);
    
    if (diffInHours < 24) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else {
      return date.toLocaleDateString([], { month: 'short', day: 'numeric' }) + ' ' + 
             date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
  };

  return (
    <>
      <Head title={`Chat with ${otherUser.first_name} ${otherUser.last_name}`} />
      <div className="flex flex-col h-screen w-full bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
        {/* Chat Header */}
        <div className="px-4 py-3 border-b flex items-center justify-between bg-white dark:bg-gray-800 shadow-md sticky top-0 z-10">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => router.get("/view-chats")}
              className="hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <Avatar className="h-10 w-10">
              <AvatarFallback className="bg-blue-500 text-white font-semibold">
                {getInitials(otherUser.first_name, otherUser.last_name)}
              </AvatarFallback>
            </Avatar>
            <div>
              <div className="font-semibold text-gray-900 dark:text-gray-100">
                {otherUser.first_name} {otherUser.last_name}
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400">
                {otherUser.email}
              </div>
            </div>
          </div>
          <Dialog open={profileDialogOpen} onOpenChange={setProfileDialogOpen}>
            <DialogTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                <User className="h-5 w-5" />
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>User Profile</DialogTitle>
                <DialogDescription>
                  Basic information about {otherUser.first_name} {otherUser.last_name}
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-3 mt-4">
                <div className="flex justify-between items-center py-2 border-b gap-4">
                  <span className="font-medium text-gray-600 flex-shrink-0">Name:</span>
                  <span className="text-gray-900 text-right">
                    {[otherUser.first_name?.trim(), otherUser.last_name?.trim()].filter(Boolean).join(' ') || 'N/A'}
                  </span>
                </div>
                <div className="flex justify-between items-center py-2 border-b gap-4">
                  <span className="font-medium text-gray-600 flex-shrink-0">Email:</span>
                  <span className="text-gray-900 text-right break-all">{otherUser.email || 'N/A'}</span>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gradient-to-b from-gray-50/50 to-transparent">
        {isLoading ? (
          <div className="space-y-4">
            <ChatMessageSkeleton isOwn={false} />
            <ChatMessageSkeleton isOwn={true} />
            <ChatMessageSkeleton isOwn={false} />
            <ChatMessageSkeleton isOwn={true} />
            <ChatMessageSkeleton isOwn={false} />
          </div>
        ) : messageList.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <div className="bg-white dark:bg-gray-800 rounded-full p-4 mb-4 shadow-lg">
              <User className="h-12 w-12 text-gray-400" />
            </div>
            <p className="text-gray-500 dark:text-gray-400 text-lg font-medium">
              No messages yet
            </p>
            <p className="text-gray-400 dark:text-gray-500 text-sm mt-1">
              Start the conversation with {otherUser.first_name}
            </p>
          </div>
        ) : (
          messageList.map((msg, index) => {
            const isOwnMessage = msg.sender_id === authUserId;
            const prevMessage = index > 0 ? messageList[index - 1] : null;
            const showAvatar = !prevMessage || prevMessage.sender_id !== msg.sender_id;
            const timeDiff = prevMessage 
              ? (new Date(msg.created_at).getTime() - new Date(prevMessage.created_at).getTime()) / 1000 / 60
              : 999;
            const showTimeSeparator = !prevMessage || timeDiff > 5;

            return (
              <div key={msg.id}>
                {showTimeSeparator && (
                  <div className="flex justify-center my-4">
                    <span className="text-xs text-gray-400 dark:text-gray-500 bg-white dark:bg-gray-800 px-3 py-1 rounded-full">
                      {formatMessageTime(msg.created_at)}
                    </span>
                  </div>
                )}
                <div
                  className={`flex items-end gap-2 ${
                    isOwnMessage ? "justify-end" : "justify-start"
                  }`}
                >
                  {!isOwnMessage && (
                    <Avatar className={`h-8 w-8 ${showAvatar ? 'opacity-100' : 'opacity-0'}`}>
                      <AvatarFallback className="bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-200 text-xs font-semibold">
                        {getInitials(otherUser.first_name, otherUser.last_name)}
                      </AvatarFallback>
                    </Avatar>
                  )}
                  <div
                    className={`flex flex-col max-w-[70%] ${
                      isOwnMessage ? "items-end" : "items-start"
                    }`}
                  >
                    <div
                      className={`px-4 py-2.5 rounded-2xl shadow-sm ${
                        isOwnMessage
                          ? "bg-blue-500 text-white rounded-br-md"
                          : "bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-bl-md border border-gray-200 dark:border-gray-700"
                      }`}
                    >
                      <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">
                        {msg.message}
                      </p>
                    </div>
                    <span
                      className={`text-xs mt-1 px-2 ${
                        isOwnMessage
                          ? "text-gray-500 dark:text-gray-400"
                          : "text-gray-400 dark:text-gray-500"
                      }`}
                    >
                      {new Date(msg.created_at).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>
                  {isOwnMessage && (
                    <Avatar className={`h-8 w-8 ${showAvatar ? 'opacity-100' : 'opacity-0'}`}>
                      <AvatarFallback className="bg-blue-500 text-white text-xs font-semibold">
                        {auth.user ? getInitials(auth.user.first_name || '', auth.user.last_name || '') : 'U'}
                      </AvatarFallback>
                    </Avatar>
                  )}
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <div className="p-4 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 sticky bottom-0 shadow-lg">
        <form onSubmit={sendMessage} className="flex items-end gap-2">
          <div className="flex-1 relative">
            <Input
              type="text"
              placeholder="Type a message..."
              value={data.message}
              onChange={(e) => setData("message", e.target.value)}
              className="pr-10 py-3 rounded-full border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  const form = e.currentTarget.closest('form');
                  if (form) {
                    form.requestSubmit();
                  }
                }
              }}
            />
            <button
              type="button"
              className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 hover:bg-gray-100 dark:hover:bg-gray-600 rounded-full transition-colors"
            >
              <Smile className="h-5 w-5 text-gray-400" />
            </button>
          </div>
          <Button
            type="submit"
            size="icon"
            className="h-11 w-11 rounded-full bg-blue-500 hover:bg-blue-600 text-white shadow-md hover:shadow-lg transition-all"
            disabled={!data.message.trim()}
          >
            <Send className="h-5 w-5" />
          </Button>
        </form>
      </div>
    </div>
    </>
  );
}
