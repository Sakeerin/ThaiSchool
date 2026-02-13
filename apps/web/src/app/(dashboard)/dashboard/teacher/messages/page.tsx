'use client';

import { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import {
    MessageCircle,
    Send,
    Search,
    User,
    Plus,
    ArrowLeft,
    Check,
    CheckCheck,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { Textarea } from '@/components/ui/textarea';
import {
    useConversations,
    useMessages,
    useSendMessage,
    useSearchMessageUsers,
} from '@/hooks/use-messages';
import { Conversation, MessageUser } from '@/lib/api/messages';
import { cn } from '@/lib/utils';
import { formatDistanceToNow, format, isToday, isYesterday } from 'date-fns';
import { th } from 'date-fns/locale';

export default function TeacherMessagesPage() {
    const searchParams = useSearchParams();
    const initialUserId = searchParams.get('user');

    const [selectedUserId, setSelectedUserId] = useState<string | null>(initialUserId);
    const [searchQuery, setSearchQuery] = useState('');
    const [newMessage, setNewMessage] = useState('');
    const [isNewConversationOpen, setIsNewConversationOpen] = useState(false);
    const [userSearchQuery, setUserSearchQuery] = useState('');
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const { data: conversations, isLoading: conversationsLoading } = useConversations();
    const { data: messagesData, isLoading: messagesLoading } = useMessages(selectedUserId || '');
    const sendMessage = useSendMessage();
    const { data: searchUsers } = useSearchMessageUsers(userSearchQuery);

    const messages = messagesData?.items ?? [];

    // Auto-scroll to bottom when new messages arrive
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    // Update selected user when URL changes
    useEffect(() => {
        if (initialUserId) {
            setSelectedUserId(initialUserId);
        }
    }, [initialUserId]);

    const handleSendMessage = async () => {
        if (!selectedUserId || !newMessage.trim()) return;

        await sendMessage.mutateAsync({
            receiverId: selectedUserId,
            content: newMessage.trim(),
        });

        setNewMessage('');
    };

    const handleSelectUser = (user: MessageUser) => {
        setSelectedUserId(user.id);
        setIsNewConversationOpen(false);
        setUserSearchQuery('');
    };

    const formatMessageTime = (dateStr: string) => {
        const date = new Date(dateStr);
        if (isToday(date)) {
            return format(date, 'HH:mm', { locale: th });
        }
        if (isYesterday(date)) {
            return `เมื่อวาน ${format(date, 'HH:mm', { locale: th })}`;
        }
        return format(date, 'd MMM HH:mm', { locale: th });
    };

    const selectedConversation = conversations?.find((c) => c.user.id === selectedUserId);

    const filteredConversations = conversations?.filter(
        (c) =>
            c.user.displayName.toLowerCase().includes(searchQuery.toLowerCase()) ||
            c.user.email.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const roleLabels: Record<string, string> = {
        PARENT: 'ผู้ปกครอง',
        STUDENT: 'นักเรียน',
        TEACHER: 'ครู',
        ADMIN: 'ผู้ดูแลระบบ',
    };

    return (
        <div className="h-[calc(100vh-120px)] flex">
            {/* Conversations Sidebar */}
            <div className="w-80 border-r flex flex-col bg-background">
                <div className="p-4 border-b space-y-3">
                    <div className="flex items-center justify-between">
                        <h2 className="font-semibold flex items-center gap-2">
                            <MessageCircle className="h-5 w-5" />
                            ข้อความ
                        </h2>
                        <Dialog open={isNewConversationOpen} onOpenChange={setIsNewConversationOpen}>
                            <DialogTrigger asChild>
                                <Button size="icon" variant="ghost">
                                    <Plus className="h-5 w-5" />
                                </Button>
                            </DialogTrigger>
                            <DialogContent>
                                <DialogHeader>
                                    <DialogTitle>เริ่มการสนทนาใหม่</DialogTitle>
                                </DialogHeader>
                                <div className="space-y-4">
                                    <div className="relative">
                                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                        <Input
                                            placeholder="ค้นหาผู้ใช้..."
                                            value={userSearchQuery}
                                            onChange={(e) => setUserSearchQuery(e.target.value)}
                                            className="pl-10"
                                        />
                                    </div>
                                    <div className="max-h-60 overflow-y-auto space-y-2">
                                        {searchUsers?.map((user) => (
                                            <button
                                                key={user.id}
                                                onClick={() => handleSelectUser(user)}
                                                className="w-full p-3 rounded-lg border hover:bg-muted transition-colors text-left flex items-center gap-3"
                                            >
                                                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                                                    <User className="h-5 w-5 text-primary" />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="font-medium truncate">{user.displayName}</p>
                                                    <p className="text-xs text-muted-foreground">
                                                        {roleLabels[user.role] || user.role}
                                                    </p>
                                                </div>
                                            </button>
                                        ))}
                                        {userSearchQuery.length >= 2 && searchUsers?.length === 0 && (
                                            <p className="text-center text-muted-foreground py-4">
                                                ไม่พบผู้ใช้
                                            </p>
                                        )}
                                        {userSearchQuery.length < 2 && (
                                            <p className="text-center text-muted-foreground py-4">
                                                พิมพ์อย่างน้อย 2 ตัวอักษรเพื่อค้นหา
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </DialogContent>
                        </Dialog>
                    </div>
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="ค้นหาการสนทนา..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-10"
                        />
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto">
                    {conversationsLoading ? (
                        <div className="p-4 space-y-3">
                            {Array.from({ length: 5 }).map((_, i) => (
                                <div key={i} className="flex items-center gap-3">
                                    <Skeleton className="h-10 w-10 rounded-full" />
                                    <div className="flex-1 space-y-2">
                                        <Skeleton className="h-4 w-3/4" />
                                        <Skeleton className="h-3 w-1/2" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : filteredConversations?.length === 0 ? (
                        <div className="p-8 text-center text-muted-foreground">
                            <MessageCircle className="h-8 w-8 mx-auto mb-2 opacity-50" />
                            <p>ไม่มีการสนทนา</p>
                        </div>
                    ) : (
                        <div className="divide-y">
                            {filteredConversations?.map((conversation) => (
                                <ConversationItem
                                    key={conversation.user.id}
                                    conversation={conversation}
                                    isSelected={selectedUserId === conversation.user.id}
                                    onClick={() => setSelectedUserId(conversation.user.id)}
                                    roleLabels={roleLabels}
                                />
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Chat Area */}
            <div className="flex-1 flex flex-col">
                {selectedUserId ? (
                    <>
                        {/* Chat Header */}
                        <div className="p-4 border-b flex items-center gap-3">
                            <Button
                                variant="ghost"
                                size="icon"
                                className="md:hidden"
                                onClick={() => setSelectedUserId(null)}
                            >
                                <ArrowLeft className="h-5 w-5" />
                            </Button>
                            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                                <User className="h-5 w-5 text-primary" />
                            </div>
                            <div>
                                <p className="font-medium">
                                    {selectedConversation?.user.displayName || 'ผู้ใช้'}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                    {selectedConversation?.user.role
                                        ? roleLabels[selectedConversation.user.role]
                                        : ''}
                                </p>
                            </div>
                        </div>

                        {/* Messages */}
                        <div className="flex-1 overflow-y-auto p-4 space-y-4">
                            {messagesLoading ? (
                                <div className="space-y-4">
                                    {Array.from({ length: 5 }).map((_, i) => (
                                        <div
                                            key={i}
                                            className={cn('flex', i % 2 === 0 ? 'justify-end' : 'justify-start')}
                                        >
                                            <Skeleton className="h-12 w-48 rounded-lg" />
                                        </div>
                                    ))}
                                </div>
                            ) : messages.length === 0 ? (
                                <div className="flex items-center justify-center h-full">
                                    <div className="text-center text-muted-foreground">
                                        <MessageCircle className="h-12 w-12 mx-auto mb-2 opacity-50" />
                                        <p>เริ่มการสนทนากับ {selectedConversation?.user.displayName}</p>
                                    </div>
                                </div>
                            ) : (
                                messages.map((message) => {
                                    const isSentByMe = message.sender?.id !== selectedUserId;
                                    return (
                                        <div
                                            key={message.id}
                                            className={cn('flex', isSentByMe ? 'justify-end' : 'justify-start')}
                                        >
                                            <div
                                                className={cn(
                                                    'max-w-[70%] rounded-lg px-4 py-2',
                                                    isSentByMe
                                                        ? 'bg-primary text-primary-foreground'
                                                        : 'bg-muted'
                                                )}
                                            >
                                                <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                                                <div
                                                    className={cn(
                                                        'flex items-center gap-1 mt-1',
                                                        isSentByMe ? 'justify-end' : 'justify-start'
                                                    )}
                                                >
                                                    <span className="text-[10px] opacity-70">
                                                        {formatMessageTime(message.createdAt)}
                                                    </span>
                                                    {isSentByMe && (
                                                        <span className="opacity-70">
                                                            {message.isRead ? (
                                                                <CheckCheck className="h-3 w-3" />
                                                            ) : (
                                                                <Check className="h-3 w-3" />
                                                            )}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })
                            )}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* Message Input */}
                        <div className="p-4 border-t">
                            <div className="flex gap-2">
                                <Textarea
                                    placeholder="พิมพ์ข้อความ..."
                                    value={newMessage}
                                    onChange={(e) => setNewMessage(e.target.value)}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter' && !e.shiftKey) {
                                            e.preventDefault();
                                            handleSendMessage();
                                        }
                                    }}
                                    className="min-h-[44px] max-h-32 resize-none"
                                    rows={1}
                                />
                                <Button
                                    onClick={handleSendMessage}
                                    disabled={!newMessage.trim() || sendMessage.isPending}
                                >
                                    <Send className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                    </>
                ) : (
                    <div className="flex-1 flex items-center justify-center text-center text-muted-foreground">
                        <div>
                            <MessageCircle className="h-16 w-16 mx-auto mb-4 opacity-50" />
                            <h3 className="text-lg font-medium mb-2">เลือกการสนทนา</h3>
                            <p>เลือกการสนทนาจากรายการด้านซ้าย หรือเริ่มการสนทนาใหม่</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

interface ConversationItemProps {
    conversation: Conversation;
    isSelected: boolean;
    onClick: () => void;
    roleLabels: Record<string, string>;
}

function ConversationItem({ conversation, isSelected, onClick, roleLabels }: ConversationItemProps) {
    const formatTime = (dateStr: string) => {
        try {
            return formatDistanceToNow(new Date(dateStr), { addSuffix: true, locale: th });
        } catch {
            return '';
        }
    };

    return (
        <button
            onClick={onClick}
            className={cn(
                'w-full p-3 text-left transition-colors hover:bg-muted/50 flex items-center gap-3',
                isSelected && 'bg-muted'
            )}
        >
            <div className="relative">
                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <User className="h-5 w-5 text-primary" />
                </div>
                {conversation.unreadCount > 0 && (
                    <Badge
                        variant="destructive"
                        className="absolute -right-1 -top-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
                    >
                        {conversation.unreadCount > 9 ? '9+' : conversation.unreadCount}
                    </Badge>
                )}
            </div>
            <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                    <p className="font-medium truncate">{conversation.user.displayName}</p>
                    {conversation.lastMessage && (
                        <span className="text-[10px] text-muted-foreground">
                            {formatTime(conversation.lastMessage.createdAt)}
                        </span>
                    )}
                </div>
                <div className="flex items-center gap-1">
                    <Badge variant="outline" className="text-[10px] px-1 py-0">
                        {roleLabels[conversation.user.role] || conversation.user.role}
                    </Badge>
                    {conversation.lastMessage && (
                        <p
                            className={cn(
                                'text-xs truncate flex-1',
                                conversation.unreadCount > 0 ? 'text-foreground font-medium' : 'text-muted-foreground'
                            )}
                        >
                            {conversation.lastMessage.isSentByMe && 'คุณ: '}
                            {conversation.lastMessage.content}
                        </p>
                    )}
                </div>
            </div>
        </button>
    );
}
