import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
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
};

const MessageContext = createContext<MessageContextType | undefined>(undefined);

export const MessageProvider = ({ children }: { children: ReactNode }) => {
  const [conversations, setConversations] = useState<GroupConversation[]>([]);
  const [currentConversation, setCurrentConversation] = useState<GroupConversation | null>(null);
  const { profile } = useProfile();

  // Laad groepsgesprekken waar jij in zit
  useEffect(() => {
    if (!profile) return;

    let isMounted = true; // ✅ fix

    const q = query(
      collection(db, "groupConversations"),
      where("participants", "array-contains", profile.id)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      if (!isMounted) return; // ✅ fix

      const convs: GroupConversation[] = snapshot.docs.map((convDoc) => {
        const data = convDoc.data();
        return {
          id: convDoc.id,
          groupName: data.groupName || "Groepsgesprek",
          matchId: data.matchId || "",
          participants: data.participants || [],
          participantNames: data.participantNames || {},
          lastMessage: data.lastMessage || "",
          lastMessageTime: data.lastMessageTime?.toDate() || new Date(),
          unreadCount: 0,
          messages: [],
        };
      });

      setConversations(convs);
    });

    return () => {
      isMounted = false; // ✅ fix
      unsubscribe();
    };
  }, [profile]);

  // Realtime berichten voor huidig gesprek
  useEffect(() => {
    if (!currentConversation || !profile) return;

    let isMounted = true; // ✅ fix

    const messagesQ = query(
      collection(db, "groupConversations", currentConversation.id, "messages"),
      orderBy("createdAt", "asc")
    );

    const unsubscribe = onSnapshot(messagesQ, (snapshot) => {
      if (!isMounted) return; // ✅ fix

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

      setCurrentConversation((prev) =>
        prev ? { ...prev, messages } : null
      );

      setConversations((prev) =>
        prev.map((c) =>
          c.id === currentConversation.id ? { ...c, messages } : c
        )
      );
    });

    return () => {
      isMounted = false; // ✅ fix
      unsubscribe();
    };
  }, [currentConversation?.id, profile]); // ✅ profile toegevoegd

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
    setConversations((prev) =>
      prev.map((c) =>
        c.id === conversationId ? { ...c, unreadCount: 0 } : c
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