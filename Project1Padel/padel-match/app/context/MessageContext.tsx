import React, { createContext, useContext, useState, useEffect, useRef, ReactNode } from "react";
import { db } from "../lib/firebase";
import {
  collection,
  addDoc,
  query,
  where,
  onSnapshot,
  orderBy,
  doc,
  updateDoc,
  arrayRemove,
} from "firebase/firestore";
import { useProfile } from "./ProfileContext";

export type Message = {
  id: string;
  senderId: string;
  senderName: string;
  content: string;
  timestamp: Date;
  isOwn: boolean;
  isSystem?: boolean;
};

export type GroupConversation = {
  id: string;
  groupName: string;
  matchId: string;
  participants: string[];
  participantNames: { [key: string]: string };
  lastMessage: string;
  lastMessageTime: Date;
  unreadCount: number;
  messages: Message[];
};

type MessageContextType = {
  conversations: GroupConversation[];
  currentConversation: GroupConversation | null;
  setCurrentConversation: (conv: GroupConversation | null) => void;
  sendMessage: (conversationId: string, content: string) => Promise<void>;
  markAsRead: (conversationId: string) => void;
  leaveGroupChat: (conversationId: string) => Promise<void>;
  totalUnread: number;
};

const MessageContext = createContext<MessageContextType | undefined>(undefined);

export const MessageProvider = ({ children }: { children: ReactNode }) => {
  const [conversations, setConversations] = useState<GroupConversation[]>([]);
  const [currentConversation, setCurrentConversationState] = useState<GroupConversation | null>(null);
  const [readTimestamps, setReadTimestamps] = useState<{ [convId: string]: Date }>({});
  const { profile } = useProfile();

  // Load group conversations the user is part of
  useEffect(() => {
    if (!profile) return;
    let isMounted = true;

    const q = query(
      collection(db, "groupConversations"),
      where("participants", "array-contains", profile.id)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      if (!isMounted) return;

      setConversations((prev) => {
        const updated: GroupConversation[] = snapshot.docs.map((convDoc) => {
          const data = convDoc.data();
          const existing = prev.find((c) => c.id === convDoc.id);
          const lastMsgTime: Date = data.lastMessageTime?.toDate() || new Date();
          const lastRead = readTimestamps[convDoc.id];

          // Count as unread if last message is newer than last read time
          const unreadCount =
            existing?.unreadCount !== undefined && lastRead
              ? lastMsgTime > lastRead
                ? (existing.unreadCount || 0) + 0 // keep existing until recalculated
                : existing.unreadCount
              : existing?.unreadCount || 0;

          return {
            id: convDoc.id,
            groupName: data.groupName || "Groepsgesprek",
            matchId: data.matchId || "",
            participants: data.participants || [],
            participantNames: data.participantNames || {},
            lastMessage: data.lastMessage || "",
            lastMessageTime: lastMsgTime,
            unreadCount: existing ? unreadCount : 0,
            messages: existing?.messages || [],
          };
        });
        return updated;
      });
    });

    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, [profile]);

  // Realtime messages for current conversation
  useEffect(() => {
    if (!currentConversation || !profile) return;
    let isMounted = true;

    const messagesQ = query(
      collection(db, "groupConversations", currentConversation.id, "messages"),
      orderBy("createdAt", "asc")
    );

    const unsubscribe = onSnapshot(messagesQ, (snapshot) => {
      if (!isMounted) return;

      const messages: Message[] = snapshot.docs.map((msgDoc) => {
        const msgData = msgDoc.data();
        const isSystem = msgData.senderId === "system";
        const isOwn = msgData.senderId === profile.id;
        const senderName = isSystem
          ? "Systeem"
          : isOwn
          ? "Jij"
          : currentConversation.participantNames[msgData.senderId] || "Onbekend";

        return {
          id: msgDoc.id,
          senderId: msgData.senderId,
          senderName,
          content: msgData.content,
          timestamp: msgData.createdAt?.toDate() || new Date(),
          isOwn,
          isSystem,
        };
      });

      setCurrentConversationState((prev) =>
        prev ? { ...prev, messages } : null
      );

      setConversations((prev) =>
        prev.map((c) =>
          c.id === currentConversation.id ? { ...c, messages, unreadCount: 0 } : c
        )
      );
    });

    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, [currentConversation?.id, profile]);

  // Track unread: when a new message arrives in a non-active conversation
  useEffect(() => {
    if (!profile) return;

    const unsubscribers: (() => void)[] = [];

    conversations.forEach((conv) => {
      if (currentConversation?.id === conv.id) return; // already watching

      const messagesQ = query(
        collection(db, "groupConversations", conv.id, "messages"),
        orderBy("createdAt", "asc")
      );

      const unsub = onSnapshot(messagesQ, (snapshot) => {
        const lastRead = readTimestamps[conv.id];
        let newUnread = 0;

        snapshot.docs.forEach((d) => {
          const msgData = d.data();
          if (msgData.senderId === profile.id || msgData.senderId === "system") return;
          const createdAt: Date = msgData.createdAt?.toDate() || new Date();
          if (!lastRead || createdAt > lastRead) newUnread++;
        });

        setConversations((prev) =>
          prev.map((c) => (c.id === conv.id ? { ...c, unreadCount: newUnread } : c))
        );
      });

      unsubscribers.push(unsub);
    });

    return () => unsubscribers.forEach((u) => u());
  }, [conversations.map((c) => c.id).join(","), currentConversation?.id, profile]);

  const setCurrentConversation = (conv: GroupConversation | null) => {
    setCurrentConversationState(conv);
    if (conv) {
      setReadTimestamps((prev) => ({ ...prev, [conv.id]: new Date() }));
      setConversations((prev) =>
        prev.map((c) => (c.id === conv.id ? { ...c, unreadCount: 0 } : c))
      );
    }
  };

  const sendMessage = async (conversationId: string, content: string) => {
    if (!profile) return;
    try {
      await addDoc(
        collection(db, "groupConversations", conversationId, "messages"),
        {
          senderId: profile.id,
          senderName: `${profile.firstName} ${profile.lastName}`,
          content,
          createdAt: new Date(),
        }
      );
      await updateDoc(doc(db, "groupConversations", conversationId), {
        lastMessage: content,
        lastMessageTime: new Date(),
      });
    } catch (error) {
      console.error("Fout bij versturen bericht:", error);
    }
  };

  const markAsRead = (conversationId: string) => {
    setReadTimestamps((prev) => ({ ...prev, [conversationId]: new Date() }));
    setConversations((prev) =>
      prev.map((c) => (c.id === conversationId ? { ...c, unreadCount: 0 } : c))
    );
  };

  // Remove user from a group chat (on match cancellation)
  const leaveGroupChat = async (conversationId: string) => {
    if (!profile) return;
    try {
      await updateDoc(doc(db, "groupConversations", conversationId), {
        participants: arrayRemove(profile.id),
        lastMessage: `${profile.firstName} heeft de groep verlaten`,
        lastMessageTime: new Date(),
      });
      await addDoc(collection(db, "groupConversations", conversationId, "messages"), {
        senderId: "system",
        senderName: "Systeem",
        content: `${profile.firstName} ${profile.lastName} heeft de groep verlaten`,
        createdAt: new Date(),
      });
    } catch (error) {
      console.error("Fout bij verlaten groep:", error);
    }
  };

  const totalUnread = conversations.reduce((sum, c) => sum + (c.unreadCount || 0), 0);

  return (
    <MessageContext.Provider
      value={{
        conversations,
        currentConversation,
        setCurrentConversation,
        sendMessage,
        markAsRead,
        leaveGroupChat,
        totalUnread,
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
