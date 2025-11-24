import React, { useState, useMemo, useEffect } from "react";
import { usePage, router, Head } from "@inertiajs/react";
import type { PageProps as InertiaPageProps } from "@inertiajs/core";
import { route } from "ziggy-js";
import AppLayout from "@/layouts/app-layout";
import { type BreadcrumbItem } from "@/types";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent } from "@/components/ui/card";
import PermissionGate from "@/components/PermissionGate";
import DisplayBalance from '@/components/balance-display';
import { TableRowSkeleton } from "@/components/ui/skeletons";
import { MessageSquare, Search, Mail, Clock, Loader2 } from "lucide-react";



const breadcrumbs: BreadcrumbItem[] = [
  { title: "Dashboard", href: "/dashboard" },
  { title: "Your Chats", href: "/view-chats" },
];

interface ChatPreview {
  userId: number;
  email: string;
  lastMessage: string;
  lastMessageAt: string;
}

interface CustomProps {
  chats: ChatPreview[];
}

type PageProps = InertiaPageProps & CustomProps;

export default function ChatList() {
  const { props } = usePage<PageProps>();
  const { chats } = props;
  const { auth } = usePage().props as any;
    const role = auth?.user.role;

  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);

  // Filter chats based on search
  const filteredChats = useMemo(() => {
    return chats.filter((chat) =>
      chat.email.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [chats, searchTerm]);

  useEffect(() => {
    if (chats) {
      const timer = setTimeout(() => {
        setLoading(false);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [chats]);

  const totalChats = chats.length;
  const filteredCount = filteredChats.length;
  
  // Format date helper
  const formatMessageTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined,
    });
  };

  return (
    <PermissionGate permission="view_chats" roles={[role]}>
      <AppLayout breadcrumbs={breadcrumbs}>
        <Head title={'Your Chats'} />
        
        <div className="space-y-6">
          {/* Gradient Header */}
          <div className="bg-gradient-to-r from-cyan-600 to-blue-600 rounded-2xl p-8 text-white shadow-lg">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-4xl font-bold flex items-center gap-3">
                  <MessageSquare size={40} />
                  Your Chats
                </h1>
                <p className="mt-2 text-cyan-100">Manage and view all your conversations</p>
              </div>
              <div className="text-right">
                <p className="text-cyan-100 text-sm font-medium">Total Chats</p>
                <p className="text-5xl font-bold">{totalChats}</p>
              </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
              <div className="bg-white/20 backdrop-blur rounded-lg p-4">
                <p className="text-cyan-100 text-sm font-medium">Active Conversations</p>
                <p className="text-3xl font-bold mt-1">{totalChats}</p>
              </div>
              <div className="bg-white/20 backdrop-blur rounded-lg p-4">
                <p className="text-cyan-100 text-sm font-medium">Filtered Results</p>
                <p className="text-3xl font-bold mt-1">{filteredCount}</p>
              </div>
            </div>

            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-cyan-200" size={20} />
              <Input
                type="text"
                placeholder="Search by email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-white/10 border-white/20 text-white placeholder:text-cyan-200 focus:bg-white/20"
              />
            </div>
          </div>

          {/* Table Card */}
          <Card className="shadow-lg">
            <CardContent className="p-0">
              {loading ? (
                <div className="flex items-center justify-center py-16">
                  <Loader2 className="h-8 w-8 animate-spin text-cyan-600" />
                  <span className="ml-3 text-gray-600">Loading chats...</span>
                </div>
              ) : filteredChats.length === 0 ? (
                <div className="text-center py-16 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                  <MessageSquare size={56} className="mx-auto text-gray-300 mb-4" />
                  <p className="text-gray-500 font-bold text-lg">
                    {chats.length === 0 ? "No chats yet" : "No chats match your search"}
                  </p>
                  <p className="text-sm text-gray-400 mt-2">
                    {chats.length === 0 
                      ? "Start a conversation to see your chats here" 
                      : "Try adjusting your search criteria"}
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader className="bg-gray-50">
                      <TableRow>
                        <TableHead className="font-semibold">Contact</TableHead>
                        <TableHead className="font-semibold">Last Message</TableHead>
                        <TableHead className="font-semibold">Time</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredChats
                        .sort((a, b) => 
                          new Date(b.lastMessageAt).getTime() - new Date(a.lastMessageAt).getTime()
                        )
                        .map((chat) => (
                          <TableRow
                            key={chat.userId}
                            className="hover:bg-gray-50 cursor-pointer transition-colors"
                            onClick={() => router.get(`/chat/${chat.userId}`)}
                          >
                            <TableCell>
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center text-white font-semibold">
                                  {chat.email.charAt(0).toUpperCase()}
                                </div>
                                <div className="flex items-center gap-2">
                                  <Mail size={16} className="text-cyan-600" />
                                  <span className="font-medium">{chat.email}</span>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <MessageSquare size={16} className="text-gray-400" />
                                <span className="text-gray-700 truncate max-w-md">
                                  {chat.lastMessage || "No messages yet"}
                                </span>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2 text-gray-600">
                                <Clock size={14} />
                                <span className="text-sm">{formatMessageTime(chat.lastMessageAt)}</span>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </AppLayout>
    </PermissionGate>
  );
}
