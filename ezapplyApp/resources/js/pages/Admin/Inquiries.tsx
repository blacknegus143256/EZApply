import { useMemo, useState, useEffect } from 'react';
import { Link, usePage, router, Head } from '@inertiajs/react';
import { Mail, MessageSquare, Clock, Check, Trash2, Eye, EyeOff, Search } from 'lucide-react';
import AppLayout from '@/layouts/app-layout';
import { Can } from '@/components/PermissionGate';
import '../../../css/admin-inquiries.css';

interface Inquiry {
    id: number;
    email: string;
    first_name: string;
    last_name: string;
    message: string;
    status: 'unread' | 'read';
    created_at: string;
}

interface Props {
    inquiries: Inquiry[];
}

export default function Inquiries({ inquiries }: Props) {
    const { props } = usePage();
    const user = (props as any)?.auth?.user;

    // Check if user has admin or super_admin role
    useEffect(() => {
        if (!user || !user.roles?.some((role: any) => role.name === 'admin' || role.name === 'super_admin')) {
            router.visit('/');
        }
    }, [user]);
    const [expandedId, setExpandedId] = useState<number | null>(null);
    const [filter, setFilter] = useState<'all' | 'unread' | 'read'>('all');
    const [searchTerm, setSearchTerm] = useState('');
    const csrfToken = (props as any)?.csrf_token || '';

    const filteredInquiries = useMemo(() => {
        return inquiries.filter(inquiry => {
            const matchesFilter = filter === 'all' || inquiry.status === filter;
            const matchesSearch = 
                inquiry.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                inquiry.last_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                inquiry.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                inquiry.message.toLowerCase().includes(searchTerm.toLowerCase());
            return matchesFilter && matchesSearch;
        });
    }, [inquiries, filter, searchTerm]);

    const unreadCount = inquiries.filter(i => i.status === 'unread').length;
    const totalCount = inquiries.length;

    const handleMarkAsRead = (id: number) => {
        fetch(`/admin/inquiries/${id}`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRF-Token': csrfToken,
            },
            body: JSON.stringify({ status: 'read' }),
        }).then(() => {
            window.location.reload();
        });
    };

    const formatDate = (date: string) => {
        const now = new Date();
        const inquiryDate = new Date(date);
        const diffMs = now.getTime() - inquiryDate.getTime();
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);

        if (diffMins < 60) return `${diffMins}m ago`;
        if (diffHours < 24) return `${diffHours}h ago`;
        if (diffDays < 7) return `${diffDays}d ago`;

        return inquiryDate.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: inquiryDate.getFullYear() !== now.getFullYear() ? 'numeric' : undefined,
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    return (
        <AppLayout breadcrumbs={[]}>
            <Head title="Inquiries" />
            
            <Can permission="view_inquiries" fallback={<div className="p-4">You don't have permission to view users.</div>}>
            
            <div className="space-y-6">
                {/* Header Section */}
                <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-8 text-white shadow-lg">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h1 className="text-4xl font-bold">Contact Inquiries</h1>
                            <p className="mt-2 text-blue-100">Manage and respond to inquiries from potential users</p>
                        </div>
                        <div className="text-right">
                            <p className="text-blue-100 text-sm font-medium">Total Inquiries</p>
                            <p className="text-5xl font-bold">{totalCount}</p>
                        </div>
                    </div>

                    {/* Stats Cards */}
                    <div className="grid grid-cols-3 gap-4">
                        <div className="bg-white/20 backdrop-blur rounded-lg p-4">
                            <p className="text-blue-100 text-sm font-medium">Unread</p>
                            <p className="text-3xl font-bold mt-1">{unreadCount}</p>
                        </div>
                        <div className="bg-white/20 backdrop-blur rounded-lg p-4">
                            <p className="text-blue-100 text-sm font-medium">Read</p>
                            <p className="text-3xl font-bold mt-1">{totalCount - unreadCount}</p>
                        </div>
                        <div className="bg-white/20 backdrop-blur rounded-lg p-4">
                            <p className="text-blue-100 text-sm font-medium">Response Rate</p>
                            <p className="text-3xl font-bold mt-1">{totalCount > 0 ? Math.round(((totalCount - unreadCount) / totalCount) * 100) : 0}%</p>
                        </div>
                    </div>
                </div>

                {/* Search and Filter Section */}
                <div className="space-y-4">
                    {/* Search Bar */}
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                        <input
                            type="text"
                            placeholder="Search by name, email, or message..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                        />
                    </div>

                    {/* Filter Tabs */}
                    <div className="flex gap-2 border-b border-gray-200">
                        {(['all', 'unread', 'read'] as const).map(f => {
                            const count = f === 'all' ? totalCount : f === 'unread' ? unreadCount : totalCount - unreadCount;
                            return (
                                <button
                                    key={f}
                                    onClick={() => setFilter(f)}
                                    className={`px-4 py-3 font-medium text-sm capitalize transition-all duration-200 flex items-center gap-2 ${
                                        filter === f
                                            ? 'border-b-2 border-blue-600 text-blue-600'
                                            : 'text-gray-600 hover:text-gray-900'
                                    }`}
                                >
                                    {f === 'unread' && <Clock size={16} />}
                                    {f === 'read' && <Check size={16} />}
                                    {f}
                                    <span className="text-xs font-semibold bg-gray-100 px-2 py-1 rounded-full">
                                        {count}
                                    </span>
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Inquiries List */}
                <div className="space-y-3">
                    {filteredInquiries.length > 0 ? (
                        filteredInquiries.map((inquiry, index) => (
                            <div
                                key={inquiry.id}
                                className={`border rounded-xl p-5 cursor-pointer transition-all duration-200 transform hover:shadow-lg inquiry-card ${
                                    inquiry.status === 'unread'
                                        ? 'bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200 hover:border-blue-400 hover:scale-[1.01]'
                                        : 'bg-white border-gray-200 hover:border-gray-400 hover:shadow-md'
                                }`}
                                onClick={() => setExpandedId(expandedId === inquiry.id ? null : inquiry.id)}
                            >
                                {/* Inquiry Header */}
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-4 flex-1">
                                        {inquiry.status === 'unread' && (
                                            <div className="flex items-center gap-2">
                                                <div className="w-3 h-3 rounded-full bg-blue-600 animate-pulse" />
                                                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-blue-600 text-white shadow-md">
                                                    <Clock size={12} />
                                                    New
                                                </span>
                                            </div>
                                        )}
                                        <div className="flex-1">
                                            <div className="flex items-center gap-3 mb-1">
                                                <h3 className="font-bold text-gray-900 text-lg">
                                                    {inquiry.first_name} {inquiry.last_name}
                                                </h3>
                                            </div>
                                            <div className="flex items-center gap-2 text-gray-600 mb-2">
                                                <Mail size={14} className="text-blue-500" />
                                                <span className="text-sm">{inquiry.email}</span>
                                            </div>
                                            <p className="text-xs text-gray-500 font-medium">
                                                📅 {formatDate(inquiry.created_at)}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        {expandedId === inquiry.id ? (
                                            <EyeOff size={24} className="text-blue-600" />
                                        ) : (
                                            <Eye size={24} className="text-gray-400" />
                                        )}
                                    </div>
                                </div>

                                {/* Message Preview */}
                                <p className="mt-4 text-sm text-gray-700 line-clamp-2 leading-relaxed border-l-4 border-gray-300 pl-4 italic">
                                    "{inquiry.message}"
                                </p>

                                {/* Expanded View */}
                                {expandedId === inquiry.id && (
                                    <div
                                        className="mt-6 pt-6 border-t-2 border-gray-200 space-y-4 animate-in fade-in slide-in-from-top-2 duration-200"
                                        onClick={e => e.stopPropagation()}
                                    >
                                        <div className="bg-gray-50 rounded-lg p-5 border border-gray-200">
                                            <h4 className="font-bold text-gray-900 mb-3 text-sm uppercase tracking-wide">Full Message</h4>
                                            <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed font-medium">
                                                {inquiry.message}
                                            </p>
                                        </div>

                                        <div className="flex items-center gap-3 pt-2">
                                            {inquiry.status === 'unread' && (
                                                <button
                                                    onClick={e => {
                                                        e.stopPropagation();
                                                        handleMarkAsRead(inquiry.id);
                                                    }}
                                                    className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-sm font-bold rounded-lg hover:shadow-lg transform hover:scale-105 transition-all duration-200 focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                                                >
                                                    <Check size={18} />
                                                    Mark as Read
                                                </button>
                                            )}
                                            {inquiry.status === 'read' && (
                                                <span className="inline-flex items-center gap-2 px-4 py-2 bg-green-100 text-green-700 text-sm font-bold rounded-lg">
                                                    <Check size={18} />
                                                    Read
                                                </span>
                                            )}
                                            <button
                                                onClick={e => {
                                                    e.stopPropagation();
                                                    if (confirm('Are you sure you want to delete this inquiry?')) {
                                                        // Delete functionality can be added later
                                                    }
                                                }}
                                                className="inline-flex items-center gap-2 px-4 py-2 bg-red-50 text-red-600 text-sm font-bold rounded-lg hover:bg-red-100 transition-all duration-200"
                                            >
                                                <Trash2 size={18} />
                                                Delete
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))
                    ) : (
                        <div className="text-center py-16 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-300">
                            <MessageSquare size={56} className="mx-auto text-gray-300 mb-4" />
                            <p className="text-gray-500 font-bold text-lg">No inquiries found</p>
                            <p className="text-sm text-gray-400 mt-2">
                                {searchTerm ? `No results for "${searchTerm}"` : filter !== 'all' ? `No ${filter} inquiries yet` : 'All inquiries have been reviewed'}
                            </p>
                        </div>
                    )}
                </div>
            </div>
            </Can>

        </AppLayout>
    );
}
