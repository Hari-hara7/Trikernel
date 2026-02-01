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
  MoreVertical,
  Phone,
  Video,
  Info,
  Paperclip,
  Smile,
  Star,
  Trash2,
  Archive,
  Pin,
  Check,
  CheckCheck,
  Loader2,
} from "lucide-react";
import { cn } from "~/lib/utils";

export default function MessagesPage() {
  const searchParams = useSearchParams();
  const userIdFromUrl = searchParams?.get("user") || null;

  const [selectedUser, setSelectedUser] = useState<string | null>(
    userIdFromUrl
  );
  const [message, setMessage] = useState("");
  const [newChatOpen, setNewChatOpen] = useState(false);
  const [userSearch, setUserSearch] = useState("");
  const [showChatInfo, setShowChatInfo] = useState(false);
  const [pinnedMessages, setPinnedMessages] = useState<Set<string>>(new Set());
  const [favoriteContacts, setFavoriteContacts] = useState<Set<string>>(new Set());
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [hoveredMessageId, setHoveredMessageId] = useState<string | null>(null);

 
  const { data: inbox, refetch: refetchInbox } = api.message.getInbox.useQuery(
    undefined,
    {
      refetchInterval: 10000, // Poll every 10 seconds
    }
  );

  const { data: unreadCount } = api.message.getUnreadCount.useQuery(undefined, {
    refetchInterval: 10000,
  });

  
  const { data: searchResults } = api.message.searchUsers.useQuery(
    { query: userSearch },
    {
      enabled: userSearch.length >= 2,
    }
  );

  
  const { data: recentContacts } = api.message.getRecentContacts.useQuery();

  
  const { data: conversationData, refetch: refetchConversation } =
    api.message.getConversation.useQuery(
      { userId: selectedUser! },
      {
        enabled: !!selectedUser,
        refetchInterval: 3000, 
      }
    );

 
  const inboxUser = inbox?.find((c) => c.user.id === selectedUser)?.user;
  const recentUser = recentContacts?.find((c) => c.id === selectedUser);
  const searchUser = searchResults?.find((u) => u.id === selectedUser);
  
 
  const getSelectedUserName = () => inboxUser?.name ?? recentUser?.name ?? searchUser?.name ?? "Unknown User";
  const getSelectedUserRole = () => inboxUser?.role ?? recentUser?.role ?? searchUser?.role ?? "USER";
  const getSelectedUserLocation = () => {
    if (recentUser?.city && recentUser?.state) {
      return `${recentUser.city}, ${recentUser.state}`;
    }
    if (searchUser?.city && searchUser?.state) {
      return `${searchUser.city}, ${searchUser.state}`;
    }
    return null;
  };
  const hasSelectedUser = Boolean(selectedUser);

  // Send message mutation
  const sendMessage = api.message.send.useMutation({
    onSuccess: () => {
      setMessage("");
      void refetchConversation();
      void refetchInbox();
    },
    onError: (error) => {
      console.error("Failed to send message:", error.message);
      alert(`Failed to send message: ${error.message}`);
    },
  });

  
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
    <div className="flex h-[calc(100vh-100px)] flex-col gap-4 bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="px-4 pt-4">
        <div className="flex items-center justify-between rounded-lg bg-white p-4 shadow-sm dark:bg-gray-800">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Messages</h1>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Chat with farmers and buyers
              {unreadCount ? (
                <span className="ml-2 inline-flex items-center rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-medium text-red-800 dark:bg-red-900 dark:text-red-200">
                  {unreadCount} unread
                </span>
              ) : null}
            </p>
          </div>

          
          <button
            onClick={() => setNewChatOpen(true)}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-green-600 to-emerald-600 px-4 py-2 text-sm font-medium text-white shadow-md transition-all hover:shadow-lg hover:from-green-700 hover:to-emerald-700"
          >
            <Plus className="h-4 w-4" />
            New Chat
          </button>
        </div>
      </div>

  
      <div className="flex flex-1 gap-4 overflow-hidden px-4 pb-4">
      
        <div className="hidden w-80 flex-col overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800 lg:flex">
        
          <div className="shrink-0 border-b border-gray-200 p-4 dark:border-gray-700">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white">Conversations</h2>
            
            
            <div className="relative mt-4">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search conversations..."
                value={userSearch}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setUserSearch(e.target.value)}
                className="w-full rounded-lg border border-gray-300 bg-gray-50 py-2 pl-10 pr-4 text-sm transition-colors placeholder-gray-500 focus:border-green-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-green-500/20 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              />
            </div>
          </div>

         
          <div className="flex-1 overflow-y-auto">
            {!inbox || inbox.length === 0 ? (
              <div className="flex h-full flex-col items-center justify-center p-6 text-center">
                <div className="mb-3 rounded-full bg-gray-100 p-3 dark:bg-gray-700">
                  <MessageSquare className="h-6 w-6 text-gray-400" />
                </div>
                <p className="font-medium text-gray-700 dark:text-gray-300">No messages yet</p>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Start a new conversation</p>
              </div>
            ) : (
              <div className="space-y-1 p-3">
                {inbox
                  .filter(
                    (contact) =>
                      !userSearch ||
                      contact.user.name?.toLowerCase().includes(userSearch.toLowerCase())
                  )
                  .map((contact) => (
                    <button
                      key={contact.user.id}
                      onClick={() => setSelectedUser(contact.user.id)}
                      className={cn(
                        "group relative flex w-full items-center gap-3 rounded-lg p-3 text-left transition-all duration-200",
                        selectedUser === contact.user.id
                          ? "bg-gradient-to-r from-green-50 to-emerald-50 shadow-sm dark:from-green-900/30 dark:to-emerald-900/30"
                          : "hover:bg-gray-100 dark:hover:bg-gray-700"
                      )}
                    >
                      {/* Avatar */}
                      <div className="relative flex-shrink-0">
                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-green-500 to-emerald-600 text-sm font-bold text-white">
                          {contact.user.name?.[0]?.toUpperCase() ?? "U"}
                        </div>
                        {contact.unread && (
                          <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-xs font-bold text-white shadow-md" />
                        )}
                      </div>

                      {/* Message Info */}
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-2">
                          <p className={cn("truncate font-medium", contact.unread ? "font-bold text-gray-900 dark:text-white" : "text-gray-700 dark:text-gray-300")}>
                            {contact.user.name ?? "Unknown User"}
                          </p>
                          <span className="flex-shrink-0 text-xs text-gray-500 dark:text-gray-400">
                            {formatTime(contact.lastMessageAt)}
                          </span>
                        </div>
                        <p className={cn("truncate text-sm", contact.unread ? "font-medium text-gray-700 dark:text-gray-300" : "text-gray-500 dark:text-gray-400")}>
                          {contact.lastMessage}
                        </p>
                      </div>

                      {/* Star Button */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setFavoriteContacts(
                            new Set(
                              favoriteContacts.has(contact.user.id)
                                ? Array.from(favoriteContacts).filter((id) => id !== contact.user.id)
                                : [...favoriteContacts, contact.user.id]
                            )
                          );
                        }}
                        className="rounded-full p-1 text-gray-400 hover:bg-white hover:text-yellow-500 dark:hover:bg-gray-600"
                      >
                        <Star className={cn("h-4 w-4", favoriteContacts.has(contact.user.id) && "fill-yellow-500 text-yellow-500")} />
                      </button>
                    </button>
                  ))}
              </div>
            )}
          </div>
        </div>

      
        <div className="flex flex-1 flex-col overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800">
          {hasSelectedUser ? (
            <>
             
              <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4 dark:border-gray-700">
                <div className="flex items-center gap-4">
                  <button
                    className="rounded-full p-2 hover:bg-gray-100 dark:hover:bg-gray-700 lg:hidden"
                    onClick={() => setSelectedUser(null)}
                  >
                    <ArrowLeft className="h-5 w-5" />
                  </button>

                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-green-500 to-emerald-600 font-bold text-white">
                      {getSelectedUserName()[0]?.toUpperCase() ?? "U"}
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-white">{getSelectedUserName()}</h3>
                      <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                        <span className="rounded bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700 dark:bg-green-900/30 dark:text-green-300">
                          {getSelectedUserRole()}
                        </span>
                        {getSelectedUserLocation() && (
                          <span className="text-xs">{getSelectedUserLocation()}</span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                
                <div className="flex items-center gap-2">
                  <button className="rounded-full p-2 text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700 transition-colors">
                    <Phone className="h-5 w-5" />
                  </button>
                  <button className="rounded-full p-2 text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700 transition-colors">
                    <Video className="h-5 w-5" />
                  </button>
                  <button
                    onClick={() => setShowChatInfo(!showChatInfo)}
                    className="rounded-full p-2 text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700 transition-colors"
                  >
                    <Info className="h-5 w-5" />
                  </button>
                  <button className="rounded-full p-2 text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700 transition-colors">
                    <MoreVertical className="h-5 w-5" />
                  </button>
                </div>
              </div>

              
              <div className="flex-1 space-y-4 overflow-y-auto p-6">
               
                {sendMessage.isError && (
                  <div className="mx-auto max-w-md rounded-lg border border-red-300 bg-red-50 p-3 text-center dark:bg-red-900/20 dark:border-red-700">
                    <p className="text-sm text-red-700 dark:text-red-200">
                      ⚠️ {sendMessage.error.message}
                    </p>
                  </div>
                )}

               
                {!conversationData && (
                  <div className="flex h-full flex-col items-center justify-center">
                    <Loader2 className="h-8 w-8 animate-spin text-green-600 dark:text-green-400" />
                    <p className="mt-3 text-sm text-gray-600 dark:text-gray-400">Loading messages...</p>
                  </div>
                )}

                {conversationData && conversation.length === 0 ? (
                  <div className="flex h-full flex-col items-center justify-center text-center">
                    <div className="mb-4 rounded-full bg-gradient-to-br from-green-100 to-emerald-100 p-4 dark:from-green-900/30 dark:to-emerald-900/30">
                      <MessageSquare className="h-8 w-8 text-green-600 dark:text-green-400" />
                    </div>
                    <p className="mb-2 font-semibold text-gray-800 dark:text-gray-200">Start your conversation</p>
                    <p className="max-w-sm text-sm text-gray-600 dark:text-gray-400">
                      This is the beginning of your conversation with {getSelectedUserName()}. Send a message to get started!
                    </p>
                  </div>
                ) : (
                  conversation.map((msg) => (
                    <div
                      key={msg.id}
                      className={cn("flex gap-3", msg.senderId === selectedUser ? "justify-start" : "justify-end")}
                      onMouseEnter={() => setHoveredMessageId(msg.id)}
                      onMouseLeave={() => setHoveredMessageId(null)}
                    >
                      {msg.senderId === selectedUser && (
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-green-500 to-emerald-600 text-xs font-bold text-white flex-shrink-0">
                          {getSelectedUserName()[0]?.toUpperCase() ?? "U"}
                        </div>
                      )}

                      <div className={cn("group flex max-w-xl flex-col", msg.senderId === selectedUser ? "" : "items-end")}>
                        <div
                          className={cn(
                            "rounded-2xl px-4 py-3 shadow-sm transition-all",
                            msg.senderId === selectedUser
                              ? "rounded-bl-none bg-gray-100 text-gray-900 dark:bg-gray-700 dark:text-white"
                              : "rounded-br-none bg-gradient-to-r from-green-600 to-emerald-600 text-white"
                          )}
                        >
                          <p className="whitespace-pre-wrap break-words text-sm leading-relaxed">{msg.content}</p>
                        </div>
                        <div className={cn("mt-1 flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400", hoveredMessageId === msg.id ? "opacity-100" : "opacity-0 transition-opacity")}>
                          <span>{formatTime(msg.createdAt)}</span>
                          {msg.senderId !== selectedUser && (
                            <CheckCheck className="h-3 w-3 text-green-600" />
                          )}
                        </div>

                        {/* Message Actions */}
                        {hoveredMessageId === msg.id && (
                          <div className="mt-2 flex gap-1 rounded-lg bg-white p-1 shadow-md dark:bg-gray-700">
                            <button
                              onClick={() => setPinnedMessages(new Set(pinnedMessages.has(msg.id) ? Array.from(pinnedMessages).filter((id) => id !== msg.id) : [...pinnedMessages, msg.id]))}
                              className="rounded p-1.5 text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-600"
                              title="Pin message"
                            >
                              <Pin className={cn("h-4 w-4", pinnedMessages.has(msg.id) && "text-green-600")} />
                            </button>
                            <button className="rounded p-1.5 text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-600" title="React with emoji">
                              <Smile className="h-4 w-4" />
                            </button>
                            <button className="rounded p-1.5 text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-600" title="Delete message">
                              <Trash2 className="h-4 w-4 text-red-500" />
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>

              
              <div className="border-t border-gray-200 p-4 dark:border-gray-700">
                <div className="flex items-end gap-2">
                  <button 
                    className="rounded-lg p-2 text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={sendMessage.isPending}
                    title="Attach file"
                  >
                    <Paperclip className="h-5 w-5" />
                  </button>

                  <div className="flex-1">
                    <textarea
                      placeholder="Type a message..."
                      value={message}
                      onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setMessage(e.target.value)}
                      onKeyDown={(e: React.KeyboardEvent<HTMLTextAreaElement>) => {
                        if (e.key === "Enter" && !e.shiftKey && !sendMessage.isPending) {
                          e.preventDefault();
                          handleSendMessage();
                        }
                      }}
                      disabled={sendMessage.isPending}
                      className="w-full rounded-lg border border-gray-300 bg-white p-3 text-sm transition-colors placeholder-gray-500 focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500/20 dark:border-gray-600 dark:bg-gray-700 dark:text-white resize-none max-h-24 disabled:opacity-50 disabled:cursor-not-allowed"
                      rows={1}
                    />
                  </div>

                  <button
                    onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                    className="rounded-lg p-2 text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={sendMessage.isPending}
                    title="Add emoji"
                  >
                    <Smile className="h-5 w-5" />
                  </button>

                  <button
                    onClick={handleSendMessage}
                    disabled={!message.trim() || sendMessage.isPending}
                    className="flex items-center justify-center rounded-lg bg-gradient-to-r from-green-600 to-emerald-600 p-3 text-white shadow-md transition-all hover:shadow-lg hover:from-green-700 hover:to-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    title={sendMessage.isPending ? "Sending message..." : "Send message"}
                  >
                    {sendMessage.isPending ? (
                      <svg className="h-5 w-5 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" fill="none" opacity="0.3" />
                        <path fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                    ) : (
                      <Send className="h-5 w-5" />
                    )}
                  </button>
                </div>
                <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                  Press <kbd className="rounded bg-gray-100 px-1.5 py-0.5 font-mono text-xs dark:bg-gray-700">Enter</kbd> to send or <kbd className="rounded bg-gray-100 px-1.5 py-0.5 font-mono text-xs dark:bg-gray-700">Shift + Enter</kbd> for new line
                </p>
              </div>
            </>
          ) : (
            <div className="flex flex-1 flex-col items-center justify-center p-8 text-center">
              <div className="mb-4 flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-green-100 to-emerald-100 dark:from-green-900/30 dark:to-emerald-900/30">
                <MessageSquare className="h-12 w-12 text-green-600 dark:text-green-400" />
              </div>
              <h3 className="mb-2 text-2xl font-bold text-gray-800 dark:text-gray-200">Select a Conversation</h3>
              <p className="mb-6 max-w-md text-gray-600 dark:text-gray-400">
                Choose a conversation from the sidebar or start a new chat with a farmer or buyer
              </p>
              <button
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-green-600 to-emerald-600 px-6 py-3 text-sm font-medium text-white shadow-md transition-all hover:shadow-lg hover:from-green-700 hover:to-emerald-700"
                onClick={() => setNewChatOpen(true)}
              >
                <Plus className="h-4 w-4" />
                Start New Chat
              </button>
            </div>
          )}
        </div>
      </div>

     
      {newChatOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-xl bg-white shadow-xl dark:bg-gray-800">
            <div className="flex items-center justify-between border-b border-gray-200 p-6 dark:border-gray-700">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">Start New Conversation</h2>
              <button
                onClick={() => {
                  setNewChatOpen(false);
                  setUserSearch("");
                }}
                className="rounded-full p-1 text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700"
              >
                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="p-6">
              <p className="mb-4 text-sm text-gray-600 dark:text-gray-400">
                Search for a user or select from your recent contacts
              </p>

              
              <div className="relative mb-4">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by name or email..."
                  value={userSearch}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setUserSearch(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 bg-gray-50 py-2.5 pl-10 pr-4 text-sm focus:border-green-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-green-500/20 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                />
              </div>

            
              {userSearch.length >= 2 && searchResults && (
                <div className="space-y-2">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Search Results</p>
                  {searchResults.length === 0 ? (
                    <p className="py-4 text-center text-sm text-gray-500 dark:text-gray-400">No users found</p>
                  ) : (
                    <div className="max-h-64 space-y-2 overflow-y-auto">
                      {searchResults.map((user) => (
                        <button
                          key={user.id}
                          onClick={() => handleStartNewChat(user.id)}
                          className="w-full rounded-lg border border-gray-200 p-3 text-left transition-all hover:border-green-500 hover:bg-green-50 dark:border-gray-700 dark:hover:bg-green-900/20"
                        >
                          <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-green-500 to-emerald-600 font-semibold text-white">
                              {user.name?.[0]?.toUpperCase() ?? "U"}
                            </div>
                            <div className="flex-1">
                              <p className="font-medium text-gray-900 dark:text-white">{user.name ?? "Unknown User"}</p>
                              <p className="text-sm text-gray-500 dark:text-gray-400">
                                {user.city && user.state ? `${user.city}, ${user.state}` : "Location not set"}
                              </p>
                            </div>
                            <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-700 dark:bg-green-900/30 dark:text-green-300">
                              {user.role}
                            </span>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}

              
              {userSearch.length < 2 && recentContacts && recentContacts.length > 0 && (
                <div className="space-y-2">
                  <p className="flex items-center gap-2 text-sm font-medium text-gray-600 dark:text-gray-400">
                    <Users className="h-4 w-4" />
                    Recent Contacts
                  </p>
                  <div className="max-h-64 space-y-2 overflow-y-auto">
                    {recentContacts.map((user) => (
                      <button
                        key={user.id}
                        onClick={() => handleStartNewChat(user.id)}
                        className="w-full rounded-lg border border-gray-200 p-3 text-left transition-all hover:border-green-500 hover:bg-green-50 dark:border-gray-700 dark:hover:bg-green-900/20"
                      >
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-amber-500 to-orange-600 font-semibold text-white">
                            {user.name?.[0]?.toUpperCase() ?? "U"}
                          </div>
                          <div className="flex-1">
                            <p className="font-medium text-gray-900 dark:text-white">{user.name ?? "Unknown User"}</p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                              {user.city && user.state ? `${user.city}, ${user.state}` : "Location not set"}
                            </p>
                          </div>
                          <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-medium text-amber-700 dark:bg-amber-900/30 dark:text-amber-300">
                            {user.role}
                          </span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {userSearch.length < 2 && (!recentContacts || recentContacts.length === 0) && (
                <div className="py-8 text-center">
                  <Users className="mx-auto mb-3 h-12 w-12 text-gray-300 dark:text-gray-600" />
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300">No recent contacts</p>
                  <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">Place bids or receive bids to connect with others</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
