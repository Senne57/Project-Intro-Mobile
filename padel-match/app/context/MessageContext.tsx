import React, { createContext, useContext, useState, ReactNode } from "react";

export type Message = {
  id: string;
  senderId: string;
  senderName: string;
  senderAvatar: string;
  content: string;
  timestamp: Date;
  isOwn: boolean;
};

export type Conversation = {
  id: string;
  userId: string;
  userName: string;
  userAvatar: string;
  lastMessage: string;
  lastMessageTime: Date;
  unreadCount: number;
  messages: Message[];
};

type MessageContextType = {
  conversations: Conversation[];
  currentConversation: Conversation | null;
  setCurrentConversation: (conv: Conversation) => void;
  sendMessage: (conversationId: string, content: string) => void;
  markAsRead: (conversationId: string) => void;
};

const MessageContext = createContext<MessageContextType | undefined>(undefined);

// Mock data
const mockConversations: Conversation[] = [
  {
    id: "1",
    userId: "u1",
    userName: "Lucas K.",
    userAvatar: "👤",
    lastMessage: "Graag! Tot morgen!",
    lastMessageTime: new Date(Date.now() - 5 * 60000),
    unreadCount: 0,
    messages: [
      {
        id: "m1",
        senderId: "u1",
        senderName: "Lucas K.",
        senderAvatar: "👤",
        content: "Hé! Wil je volgende week met mij padel spelen?",
        timestamp: new Date(Date.now() - 3600000),
        isOwn: false,
      },
      {
        id: "m2",
        senderId: "me",
        senderName: "Jij",
        senderAvatar: "😊",
        content: "Ja, dat klinkt leuk! Welke dag?",
        timestamp: new Date(Date.now() - 1800000),
        isOwn: true,
      },
      {
        id: "m3",
        senderId: "u1",
        senderName: "Lucas K.",
        senderAvatar: "👤",
        content: "Dinsdag rond 19:00 in Antwerpen?",
        timestamp: new Date(Date.now() - 600000),
        isOwn: false,
      },
      {
        id: "m4",
        senderId: "me",
        senderName: "Jij",
        senderAvatar: "😊",
        content: "Graag! Tot morgen!",
        timestamp: new Date(Date.now() - 5 * 60000),
        isOwn: true,
      },
    ],
  },
  {
    id: "2",
    userId: "u2",
    userName: "Sarah M.",
    userAvatar: "👩",
    lastMessage: "Bedankt! 🎾",
    lastMessageTime: new Date(Date.now() - 2 * 3600000),
    unreadCount: 1,
    messages: [
      {
        id: "m5",
        senderId: "u2",
        senderName: "Sarah M.",
        senderAvatar: "👩",
        content: "Hoe ging je wedstrijd?",
        timestamp: new Date(Date.now() - 2 * 3600000),
        isOwn: false,
      },
      {
        id: "m6",
        senderId: "me",
        senderName: "Jij",
        senderAvatar: "😊",
        content: "Super goed! We hebben gewonnen 6-4 🙌",
        timestamp: new Date(Date.now() - 1 * 3600000),
        isOwn: true,
      },
      {
        id: "m7",
        senderId: "u2",
        senderName: "Sarah M.",
        senderAvatar: "👩",
        content: "Bedankt! 🎾",
        timestamp: new Date(Date.now() - 2 * 3600000),
        isOwn: false,
      },
    ],
  },
  {
    id: "3",
    userId: "u3",
    userName: "Jan B.",
    userAvatar: "👨",
    lastMessage: "Wat is je niveau?",
    lastMessageTime: new Date(Date.now() - 24 * 3600000),
    unreadCount: 0,
    messages: [
      {
        id: "m8",
        senderId: "u3",
        senderName: "Jan B.",
        senderAvatar: "👨",
        content: "Wat is je niveau?",
        timestamp: new Date(Date.now() - 24 * 3600000),
        isOwn: false,
      },
    ],
  },
];

export const MessageProvider = ({ children }: { children: ReactNode }) => {
  const [conversations, setConversations] = useState<Conversation[]>(mockConversations);
  const [currentConversation, setCurrentConversation] = useState<Conversation | null>(null);

  const sendMessage = (conversationId: string, content: string) => {
    setConversations((prevConvs) =>
      prevConvs.map((conv) => {
        if (conv.id === conversationId) {
          const newMessage: Message = {
            id: `m${Date.now()}`,
            senderId: "me",
            senderName: "Jij",
            senderAvatar: "😊",
            content,
            timestamp: new Date(),
            isOwn: true,
          };

          return {
            ...conv,
            messages: [...conv.messages, newMessage],
            lastMessage: content,
            lastMessageTime: new Date(),
          };
        }
        return conv;
      })
    );

    // Update current conversation
    if (currentConversation?.id === conversationId) {
      const updatedConv = conversations.find((c) => c.id === conversationId);
      if (updatedConv) {
        setCurrentConversation(updatedConv);
      }
    }
  };

  const markAsRead = (conversationId: string) => {
    setConversations((prevConvs) =>
      prevConvs.map((conv) =>
        conv.id === conversationId ? { ...conv, unreadCount: 0 } : conv
      )
    );
  };

  return (
    <MessageContext.Provider
      value={{
        conversations,
        currentConversation,
        setCurrentConversation,
        sendMessage,
        markAsRead,
      }}
    >
      {children}
    </MessageContext.Provider>
  );
};

export const useMessage = () => {
  const context = useContext(MessageContext);
  if (!context) throw new Error("useMessage must be used within MessageProvider");
  return context;
};