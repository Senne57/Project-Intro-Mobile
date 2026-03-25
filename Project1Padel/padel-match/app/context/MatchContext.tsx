import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { db } from "../lib/firebase";
import {
  collection,
  addDoc,
  getDocs,
  query,
  orderBy,
  doc,
  updateDoc,
  arrayUnion,
  getDoc,
  setDoc,
} from "firebase/firestore";
import { availableMatches, generateRandomPrice, Match } from "../data/matches";

export type Player = {
  id?: string;
  firstName: string;
  lastName: string;
};

export type MatchWithPlayers = Match & {
  playersList?: Player[];
};

type MatchContextType = {
  matches: MatchWithPlayers[];
  myReservations: MatchWithPlayers[];
  setMyReservations: (match: MatchWithPlayers) => void;
  cancelReservation: (matchId: string) => Promise<void>;
  createMatch: (
    club: string,
    level: number,
    date: Date,
    startTime: string,
    endTime: string,
    creatorName?: { firstName: string; lastName: string },
    creatorId?: string
  ) => Promise<boolean>;
  reserveMatch: (id: string) => MatchWithPlayers | null;
};

const MatchContext = createContext<MatchContextType | undefined>(undefined);

const mockPlayerNames = [
  { firstName: "Jan", lastName: "De Clercq" },
  { firstName: "Marie", lastName: "Dubois" },
  { firstName: "Lucas", lastName: "Kirkeeng" },
  { firstName: "Sophie", lastName: "Martin" },
  { firstName: "Thomas", lastName: "Bernard" },
  { firstName: "Anna", lastName: "Garcia" },
  { firstName: "Michel", lastName: "Dupont" },
  { firstName: "Emma", lastName: "Lefevre" },
  { firstName: "Pierre", lastName: "Moreau" },
  { firstName: "Claire", lastName: "Richard" },
];

const generateRandomPlayers = (): Player[] => {
  const randomCount = Math.floor(Math.random() * 3) + 1;
  const players: Player[] = [];
  const usedIndices = new Set<number>();
  for (let i = 0; i < randomCount; i++) {
    let randomIndex;
    do {
      randomIndex = Math.floor(Math.random() * mockPlayerNames.length);
    } while (usedIndices.has(randomIndex));
    usedIndices.add(randomIndex);
    players.push(mockPlayerNames[randomIndex]);
  }
  return players;
};

const getImage = (clubName: string) => {
  switch (clubName.toLowerCase()) {
    case "antwerpen":
      return require("../../assets/images/antwerpen.jpg");
    case "brussel":
      return require("../../assets/images/brussel.jpg");
    case "gent":
      return require("../../assets/images/Gent.png");
    default:
      return require("../../assets/images/default.png");
  }
};

export const joinMatchGroupChat = async (
  matchId: string,
  clubName: string,
  matchDate: Date,
  userId: string,
  userName: string
) => {
  try {
    const groupId = `match_${matchId}`;
    const groupRef = doc(db, "groupConversations", groupId);
    const groupSnap = await getDoc(groupRef);

    const dateStr = matchDate.toLocaleDateString("nl-NL", {
      day: "numeric",
      month: "short",
    });
    const groupName = `${clubName} — ${dateStr}`;

    if (!groupSnap.exists()) {
      await setDoc(groupRef, {
        matchId,
        groupName,
        participants: [userId],
        participantNames: { [userId]: userName },
        lastMessage: `Groepsgesprek aangemaakt`,
        lastMessageTime: new Date(),
        createdAt: new Date(),
      });

      await addDoc(collection(db, "groupConversations", groupId, "messages"), {
        senderId: "system",
        senderName: "Systeem",
        content: `Groepsgesprek aangemaakt voor ${groupName}`,
        createdAt: new Date(),
      });
    } else {
      await updateDoc(groupRef, {
        participants: arrayUnion(userId),
        [`participantNames.${userId}`]: userName,
        lastMessage: `${userName} heeft zich ingeschreven`,
        lastMessageTime: new Date(),
      });

      await addDoc(collection(db, "groupConversations", groupId, "messages"), {
        senderId: "system",
        senderName: "Systeem",
        content: `${userName} heeft zich ingeschreven`,
        createdAt: new Date(),
      });
    }

    return groupId;
  } catch (error) {
    console.error("Fout bij groepsgesprek:", error);
    return null;
  }
};

export const MatchProvider = ({ children }: { children: ReactNode }) => {
  const [matches, setMatches] = useState<MatchWithPlayers[]>(
    availableMatches.map((m) => ({
      ...m,
      playersList: generateRandomPlayers(),
    }))
  );
  const [myReservations, setMyReservationsState] = useState<MatchWithPlayers[]>([]);

  useEffect(() => {
    let isMounted = true; // ✅ fix

    const loadMatchesFromFirebase = async () => {
      try {
        const q = query(collection(db, "matches"), orderBy("date", "asc"));
        const snapshot = await getDocs(q);
        if (!isMounted) return; // ✅ check na async call
        if (snapshot.empty) return;

        const firebaseMatches: MatchWithPlayers[] = snapshot.docs.map((d) => {
          const data = d.data();
          return {
            id: d.id,
            club: data.club,
            clubName: data.clubName,
            time: data.startTime,
            startTime: data.startTime,
            endTime: data.endTime,
            level: data.level,
            players: data.players,
            createdByMe: false,
            date: data.date.toDate(),
            image: getImage(data.clubName),
            price: data.price,
            locationId: data.locationId || "",
            playersList: data.playersList || [],
          };
        });

        if (!isMounted) return; // ✅ check voor setMatches

        setMatches((prev) => {
          const ids = new Set(firebaseMatches.map((m) => m.id));
          const local = prev.filter((m) => !ids.has(m.id));
          return [...local, ...firebaseMatches];
        });
      } catch (error) {
        console.error("Fout bij laden wedstrijden:", error);
      }
    };

    loadMatchesFromFirebase();

    return () => {
      isMounted = false; // ✅ cleanup
    };
  }, []);

  const createMatch = async (
    club: string,
    level: number,
    date: Date,
    startTime: string,
    endTime: string,
    creatorName?: { firstName: string; lastName: string },
    creatorId?: string
  ): Promise<boolean> => {
    const existingMatch = matches.find(
      (m) =>
        m.club.toLowerCase() === club.toLowerCase() &&
        m.date.toDateString() === date.toDateString() &&
        m.startTime === startTime
    );
    if (existingMatch) return false;

    const playersList: Player[] = [];
    if (creatorName) {
      playersList.push({
        id: creatorId || "unknown",
        firstName: creatorName.firstName,
        lastName: creatorName.lastName,
      });
    } else {
      playersList.push({ firstName: "?", lastName: "" });
    }

    try {
      const price = generateRandomPrice();
      const docRef = await addDoc(collection(db, "matches"), {
        club,
        clubName: club.toLowerCase(),
        startTime,
        endTime,
        level,
        players: 1,
        date,
        price,
        locationId: "",
        playersList,
        createdAt: new Date(),
      });

      const newMatch: MatchWithPlayers = {
        id: docRef.id,
        club,
        clubName: club.toLowerCase(),
        time: startTime,
        startTime,
        endTime,
        level,
        players: 1,
        createdByMe: true,
        date,
        image: getImage(club),
        price,
        locationId: "",
        playersList,
      };

      setMatches((prev) => [...prev, newMatch]);
      setMyReservationsState((prev) => [...prev, newMatch]);

      if (creatorId && creatorName) {
        await joinMatchGroupChat(
          docRef.id,
          club,
          date,
          creatorId,
          `${creatorName.firstName} ${creatorName.lastName}`
        );
      }

      return true;
    } catch (error) {
      console.error("Fout bij aanmaken wedstrijd:", error);
      return false;
    }
  };

  const reserveMatch = (id: string): MatchWithPlayers | null => {
    const match = matches.find((m) => m.id === id);
    if (!match || match.players >= 4) return null;
    return match;
  };

  const setMyReservations = (match: MatchWithPlayers) => {
    setMyReservationsState((prev) => [...prev, match]);
  };

  const cancelReservation = async (matchId: string) => {
    try {
      setMyReservationsState((prev) => prev.filter((m) => m.id !== matchId));

      const matchRef = doc(db, "matches", matchId);
      const matchSnap = await getDoc(matchRef);
      if (matchSnap.exists()) {
        const currentPlayers = matchSnap.data().players || 1;
        await updateDoc(matchRef, {
          players: Math.max(0, currentPlayers - 1),
        });
      }

      // ✅ Leave the group chat when cancelling a reservation
      // We import arrayRemove here to remove the user from the group chat participants.
      // The leaveGroupChat function in MessageContext handles this, but we do a lightweight
      // version here to avoid circular context dependencies.
      const { arrayRemove: ar } = await import("firebase/firestore");
      const groupRef = doc(db, "groupConversations", `match_${matchId}`);
      // Note: auth.currentUser is used here so we don't need profile context
      const { auth } = await import("../lib/firebase");
      const currentUser = auth.currentUser;
      if (currentUser) {
        await updateDoc(groupRef, {
          participants: ar(currentUser.uid),
          lastMessage: "Een speler heeft zich afgemeld",
          lastMessageTime: new Date(),
        }).catch(() => {}); // silently ignore if group doesn't exist
        await addDoc(collection(db, "groupConversations", `match_${matchId}`, "messages"), {
          senderId: "system",
          senderName: "Systeem",
          content: `Een speler heeft zich afgemeld`,
          createdAt: new Date(),
        }).catch(() => {});
      }

      console.log("Reservatie geannuleerd:", matchId);
    } catch (error) {
      console.error("Fout bij annuleren:", error);
    }
  };

  return (
    <MatchContext.Provider
      value={{
        matches,
        myReservations,
        setMyReservations,
        cancelReservation,
        createMatch,
        reserveMatch,
      }}
    >
      {children}
    </MatchContext.Provider>
  );
};

export const useMatch = () => {
  const context = useContext(MatchContext);
  if (!context) throw new Error("useMatch must be used within MatchProvider");
  return context;
};