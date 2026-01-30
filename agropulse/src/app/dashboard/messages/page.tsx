"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { api } from "~/trpc/react";
import {
  MessageSquare,
  Send,
  Clock,
  Search,
  Plus,
  ArrowLeft,
  Users,
} from "lucide-react";
import { cn } from "~/lib/utils";

export default function MessagesPage() {
  const searchParams = useSearchParams();
  const userIdFromUrl = searchParams.get("user");

  const [selectedUser, setSelectedUser] = useState<string | null>(
    userIdFromUrl
  );
  const [message, setMessage] = useState("");
  const [newChatOpen, setNewChatOpen] = useState(false);
  const [userSearch, setUserSearch] = useState("");

  // Get inbox - combines sent and received messages
  const { data: inbox, refetch: refetchInbox } = api.message.getInbox.useQuery(
    undefined,
    {
      refetchInterval: 10000, // Poll every 10 seconds
    }
  );

  // Get unread count
  const { data: unreadCount } = api.message.getUnreadCount.useQuery(undefined, {
    refetchInterval: 10000,
  });

  // Search users for new chat
  const { data: searchResults } = api.message.searchUsers.useQuery(
    { query: userSearch },
    {
      enabled: userSearch.length >= 2,
    }
  );

  // Get recent contacts based on bid interactions
  const { data: recentContacts } = api.message.getRecentContacts.useQuery();

  // Get conversation with selected user
  const { data: conversationData, refetch: refetchConversation } =
    api.message.getConversation.useQuery(
      { userId: selectedUser! },
      {
        enabled: !!selectedUser,
        refetchInterval: 3000, // Poll every 3 seconds when in conversation
      }
    );

  // Get the selected user's info from inbox or recentContacts
  const inboxUser = inbox?.find((c) => c.user.id === selectedUser)?.user;
  const recentUser = recentContacts?.find((c) => c.id === selectedUser);
  
  // Helper to get user display info
  const getSelectedUserName = () => inboxUser?.name ?? recentUser?.name ?? "Unknown User";
  const getSelectedUserRole = () => inboxUser?.role ?? recentUser?.role ?? "USER";
  const getSelectedUserLocation = () => {
    if (recentUser?.city && recentUser?.state) {
      return `${recentUser.city}, ${recentUser.state}`;
    }
    return null;
  };
  const hasSelectedUser = Boolean(selectedUser && (inboxUser || recentUser));

  // Send message mutation
  const sendMessage = api.message.send.useMutation({
    onSuccess: () => {
      setMessage("");
      void refetchConversation();
      void refetchInbox();
    },
  });

  // Update selected user from URL
  useEffect(() => {
    if (userIdFromUrl) {
      setSelectedUser(userIdFromUrl);
    }
  }, [userIdFromUrl]);

  const handleSendMessage = () => {
    if (!message.trim() || !selectedUser) return;
    sendMessage.mutate({
      receiverId: selectedUser,
      content: message.trim(),
    });
  };

  const handleStartNewChat = (userId: string) => {
    setSelectedUser(userId);
    setNewChatOpen(false);
    setUserSearch("");
  };

  const formatTime = (date: Date) => {
    const now = new Date();
    const messageDate = new Date(date);
    const diffDays = Math.floor(
      (now.getTime() - messageDate.getTime()) / (1000 * 60 * 60 * 24)
    );

    if (diffDays === 0) {
      return messageDate.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });
    } else if (diffDays === 1) {
      return "Yesterday";
    } else if (diffDays < 7) {
      return messageDate.toLocaleDateString([], { weekday: "short" });
    } else {
      return messageDate.toLocaleDateString([], {
        month: "short",
        day: "numeric",
      });
    }
  };

  const conversation = conversationData?.messages ?? [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Messages</h1>
          <p className="text-muted-foreground">
            Chat with farmers and buyers
            {unreadCount ? (
              <span className="ml-2 inline-flex items-center rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-medium text-red-800">
                {unreadCount} unread
              </span>
            ) : null}
          </p>
        </div>

        {/* New Chat Button */}
        <button
          onClick={() => setNewChatOpen(true)}
          className="inline-flex items-center justify-center rounded-md bg-gradient-to-r from-green-600 to-emerald-600 px-4 py-2 text-sm font-medium text-white shadow hover:from-green-700 hover:to-emerald-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-500"
        >
          <Plus className="mr-2 h-4 w-4" />
          New Chat
        </button>
      </div>

      {/* New Chat Dialog */}
      {newChatOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl dark:bg-gray-800">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold">Start New Conversation</h2>
              <button
                onClick={() => {
                  setNewChatOpen(false);
                  setUserSearch("");
                }}
                className="rounded-full p-1 hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <p className="mb-4 text-sm text-gray-500">
              Search for a user or select from your recent contacts
            </p>
            
            {/* Search Input */}
            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search by name or email..."
                value={userSearch}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setUserSearch(e.target.value)}
                className="w-full rounded-md border border-gray-300 py-2 pl-10 pr-4 text-sm focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500 dark:border-gray-600 dark:bg-gray-700"
              />
            </div>

            {/* Search Results */}
            {userSearch.length >= 2 && searchResults && (
              <div className="space-y-2">
                <p className="text-sm font-medium text-gray-500">Search Results</p>
                {searchResults.length === 0 ? (
                  <p className="py-4 text-center text-sm text-gray-500">No users found</p>
                ) : (
                  <div className="max-h-48 space-y-1 overflow-y-auto">
                    {searchResults.map((user) => (
                      <button
                        key={user.id}
                        onClick={() => handleStartNewChat(user.id)}
                        className="flex w-full items-center gap-3 rounded-lg p-3 text-left transition-colors hover:bg-gray-100 dark:hover:bg-gray-700"
                      >
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-green-500 to-emerald-600 font-medium text-white">
                          {user.name?.[0]?.toUpperCase() ?? "U"}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="truncate font-medium">{user.name ?? "Unknown User"}</p>
                          <p className="truncate text-sm text-gray-500">
                            {user.city && user.state ? `${user.city}, ${user.state}` : "Location not set"}
                          </p>
                        </div>
                        <span className="rounded border px-2 py-0.5 text-xs">{user.role}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Recent Contacts */}
            {userSearch.length < 2 && recentContacts && recentContacts.length > 0 && (
              <div className="space-y-2">
                <p className="flex items-center gap-2 text-sm font-medium text-gray-500">
                  <Users className="h-4 w-4" />
                  Recent Contacts
                </p>
                <div className="max-h-48 space-y-1 overflow-y-auto">
                  {recentContacts.map((user) => (
                    <button
                      key={user.id}
                      onClick={() => handleStartNewChat(user.id)}
                      className="flex w-full items-center gap-3 rounded-lg p-3 text-left transition-colors hover:bg-gray-100 dark:hover:bg-gray-700"
                    >
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-amber-500 to-orange-600 font-medium text-white">
                        {user.name?.[0]?.toUpperCase() ?? "U"}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate font-medium">{user.name ?? "Unknown User"}</p>
                        <p className="truncate text-sm text-gray-500">
                          {user.city && user.state ? `${user.city}, ${user.state}` : "Location not set"}
                        </p>
                      </div>
                      <span className="rounded bg-gray-100 px-2 py-0.5 text-xs dark:bg-gray-600">{user.role}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {userSearch.length < 2 && (!recentContacts || recentContacts.length === 0) && (
              <div className="py-8 text-center text-gray-500">
                <Users className="mx-auto mb-3 h-12 w-12 opacity-50" />
                <p className="text-sm">No recent contacts</p>
                <p className="mt-1 text-xs">Place bids or receive bids to connect with others</p>
              </div>
            )}
          </div>
        </div>
      )}

      <div className="grid h-[calc(100vh-220px)] grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Inbox List */}
        <div className="flex flex-col overflow-hidden rounded-lg border bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800 lg:col-span-1">
          <div className="shrink-0 border-b p-4 dark:border-gray-700">
            <h2 className="text-lg font-semibold">Inbox</h2>
            <p className="text-sm text-gray-500">Your conversations</p>
          </div>
          <div className="flex-1 overflow-y-auto p-3">
            {!inbox || inbox.length === 0 ? (
              <div className="flex h-full flex-col items-center justify-center p-4 text-center text-gray-500">
                <MessageSquare className="mb-4 h-12 w-12 opacity-50" />
                <p className="font-medium">No messages yet</p>
                <p className="mt-1 text-sm">Start a conversation using the New Chat button</p>
              </div>
            ) : (
              <div className="space-y-2">
                {inbox.map((contact) => (
                  <button
                    key={contact.user.id}
                    onClick={() => setSelectedUser(contact.user.id)}
                    className={cn(
                      "flex w-full items-center gap-3 rounded-lg p-3 text-left transition-all",
                      selectedUser === contact.user.id
                        ? "border border-green-500/30 bg-gradient-to-r from-green-500/20 to-emerald-500/20"
                        : "hover:bg-gray-100 dark:hover:bg-gray-700"
                    )}
                  >
                    <div className="relative">
                      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-green-500 to-emerald-600 text-lg font-medium text-white">
                        {contact.user.name?.[0]?.toUpperCase() ?? "U"}
                      </div>
                      {contact.unread && (
                        <span className="absolute -right-1 -top-1 flex h-3 w-3 items-center justify-center rounded-full bg-red-500" />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between">
                        <p className="truncate font-medium">{contact.user.name ?? "Unknown User"}</p>
                        <span className="text-xs text-gray-500">{formatTime(contact.lastMessageAt)}</span>
                      </div>
                      <p className="truncate text-sm text-gray-500">{contact.lastMessage}</p>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Conversation View */}
        <div className="flex flex-col overflow-hidden rounded-lg border bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800 lg:col-span-2">
          {hasSelectedUser ? (
            <>
              {/* Chat Header */}
              <div className="shrink-0 border-b p-4 dark:border-gray-700">
                <div className="flex items-center gap-3">
                  <button
                    className="rounded-full p-1 hover:bg-gray-100 dark:hover:bg-gray-700 lg:hidden"
                    onClick={() => setSelectedUser(null)}
                  >
                    <ArrowLeft className="h-4 w-4" />
                  </button>
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-green-500 to-emerald-600 font-medium text-white">
                    {getSelectedUserName()[0]?.toUpperCase() ?? "U"}
                  </div>
                  <div>
                    <h3 className="font-semibold">{getSelectedUserName()}</h3>
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <span className="rounded border px-1.5 py-0.5 text-xs">{getSelectedUserRole()}</span>
                      {getSelectedUserLocation() && (
                        <span className="text-xs">{getSelectedUserLocation()}</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 space-y-4 overflow-y-auto p-4">
                {conversation.length === 0 ? (
                  <div className="flex h-full flex-col items-center justify-center text-center text-gray-500">
                    <MessageSquare className="mb-4 h-12 w-12 opacity-50" />
                    <p className="font-medium">No messages yet</p>
                    <p className="mt-1 text-sm">Send a message to start the conversation</p>
                  </div>
                ) : (
                  conversation.map((msg) => (
                    <div
                      key={msg.id}
                      className={cn(
                        "flex",
                        msg.senderId === selectedUser ? "justify-start" : "justify-end"
                      )}
                    >
                      <div
                        className={cn(
                          "max-w-[75%] rounded-2xl px-4 py-2.5 shadow-sm",
                          msg.senderId === selectedUser
                            ? "rounded-bl-md bg-gray-100 dark:bg-gray-700"
                            : "rounded-br-md bg-gradient-to-r from-green-600 to-emerald-600 text-white"
                        )}
                      >
                        <p className="whitespace-pre-wrap break-words text-sm">{msg.content}</p>
                        <div
                          className={cn(
                            "mt-1 flex items-center gap-1",
                            msg.senderId === selectedUser ? "text-gray-400" : "text-white/70"
                          )}
                        >
                          <Clock className="h-3 w-3" />
                          <span className="text-xs">{formatTime(msg.createdAt)}</span>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Message Input */}
              <div className="shrink-0 border-t p-4 dark:border-gray-700">
                <div className="flex gap-2">
                  <textarea
                    placeholder="Type your message..."
                    value={message}
                    onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setMessage(e.target.value)}
                    onKeyDown={(e: React.KeyboardEvent<HTMLTextAreaElement>) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        handleSendMessage();
                      }
                    }}
                    className="min-h-[60px] max-h-[120px] flex-1 resize-none rounded-md border border-gray-300 p-2 text-sm focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500 dark:border-gray-600 dark:bg-gray-700"
                  />
                  <button
                    onClick={handleSendMessage}
                    disabled={!message.trim() || sendMessage.isPending}
                    className="self-end rounded-md bg-gradient-to-r from-green-600 to-emerald-600 p-2.5 text-white shadow hover:from-green-700 hover:to-emerald-700 disabled:opacity-50"
                  >
                    <Send className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex flex-1 flex-col items-center justify-center p-8 text-center text-gray-500">
              <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-green-500/20 to-emerald-500/20">
                <MessageSquare className="h-10 w-10 text-green-600" />
              </div>
              <h3 className="mb-2 text-xl font-semibold text-gray-800 dark:text-gray-200">Welcome to Messages</h3>
              <p className="max-w-md">
                Select a conversation from your inbox or start a new chat to connect with farmers and buyers.
              </p>
              <button
                className="mt-6 inline-flex items-center justify-center rounded-md bg-gradient-to-r from-green-600 to-emerald-600 px-4 py-2 text-sm font-medium text-white shadow hover:from-green-700 hover:to-emerald-700"
                onClick={() => setNewChatOpen(true)}
              >
                <Plus className="mr-2 h-4 w-4" />
                Start New Chat
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
