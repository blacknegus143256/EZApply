import React, { useState, useMemo, useEffect } from "react";
import { usePage, router, Head } from "@inertiajs/react";
import type { PageProps as InertiaPageProps } from "@inertiajs/core";
import { route } from "ziggy-js";
import AppLayout from "@/layouts/app-layout";
import { type BreadcrumbItem } from "@/types";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import PermissionGate from "@/components/PermissionGate";
import DisplayBalance from '@/components/balance-display';
import { TableRowSkeleton } from "@/components/ui/skeletons";



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

  return (
    <PermissionGate permission="view_chats" roles={[role]}>
    <AppLayout breadcrumbs={breadcrumbs} >
          <Head title={'Your Chats'} />

      <div className="absolute top-3 right-4">

  </div>
      <div className="w-full p-6">
        <h1 className="text-2xl font-bold mb-4">Your Chats</h1>

        <div className="mb-4">
            <Input
            type="text"
            placeholder="Search by email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full max-w-md"
            />
        </div>

        <div className="overflow-x-auto border rounded">
            <Table className="w-full">
            <TableHeader>
                <TableRow>
                <TableHead className="w-1/3">Email</TableHead>
                <TableHead className="w-1/2">Last Message</TableHead>
                <TableHead className="w-1/6">Time</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {loading ? (
                    <>
                        {Array.from({ length: 5 }).map((_, i) => (
                            <TableRowSkeleton key={i} columns={3} />
                        ))}
                    </>
                ) : filteredChats.length === 0 ? (
                    <TableRow>
                        <TableCell colSpan={3} className="text-center text-gray-500 py-8">
                            {chats.length === 0 ? "No chats yet. Start a conversation!" : "No chats match your search."}
                        </TableCell>
                    </TableRow>
                ) : (
                    filteredChats.map((chat) => (
                        <TableRow
                            key={chat.userId}
                            className="hover:bg-gray-50 cursor-pointer"
                            onClick={() => router.get(`/chat/${chat.userId}`)}
                        >
                            <TableCell className="truncate">{chat.email}</TableCell>
                            <TableCell className="truncate">{chat.lastMessage}</TableCell>
                            <TableCell>{new Date(chat.lastMessageAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</TableCell>
                        </TableRow>
                    ))
                )}
            </TableBody>
            </Table>
        </div>
    </div>


    </AppLayout>
    </PermissionGate>
  );
}
