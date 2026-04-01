import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { db, auth } from "../lib/firebase";
import {
  collection,
  addDoc,
  getDocs,
  query,
  orderBy,
  doc,
  updateDoc,
  arrayUnion,
  arrayRemove,
  getDoc,
  setDoc,
  Timestamp,
} from "firebase/firestore";
import { generateRandomPrice, Match } from "../data/matches";

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
  setMyReservations: (match: MatchWithPlayers) => Promise<void>;
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
  // ✅ No more local hardcoded matches: Firestore is source of truth
  const [matches, setMatches] = useState<MatchWithPlayers[]>([]);
  const [myReservations, setMyReservationsState] = useState<MatchWithPlayers[]>([]);

  useEffect(() => {
    let isMounted = true;

    const loadMatchesFromFirebase = async () => {
      try {
        const q = query(collection(db, "matches"), orderBy("date", "asc"));
        const snapshot = await getDocs(q);
        if (!isMounted) return;

        if (snapshot.empty) {
          setMatches([]);
          return;
        }

        const firebaseMatches: MatchWithPlayers[] = snapshot.docs.map((d) => {
          const data: any = d.data();
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
            date: data.date?.toDate ? data.date.toDate() : new Date(),
            image: getImage(data.clubName),
            price: data.price,
            locationId: data.locationId || "",
            playersList: data.playersList || [],
          };
        });

        if (!isMounted) return;
        setMatches(firebaseMatches);
      } catch (error) {
        console.error("Fout bij laden wedstrijden:", error);
      }
    };

    const loadMyReservations = async (userId: string) => {
      try {
        const userRef = doc(db, "users", userId);
        const userSnap = await getDoc(userRef);
        if (!isMounted) return;

        if (userSnap.exists()) {
          const data: any = userSnap.data();
          const reservedIds: string[] = data.reservations || [];
          if (reservedIds.length === 0) {
            setMyReservationsState([]);
            return;
          }

          const reserved: MatchWithPlayers[] = [];
          for (const matchId of reservedIds) {
            const matchRef = doc(db, "matches", matchId);
            const matchSnap = await getDoc(matchRef);
            if (matchSnap.exists()) {
              const d: any = matchSnap.data();
              reserved.push({
                id: matchSnap.id,
                club: d.club,
                clubName: d.clubName,
                time: d.startTime,
                startTime: d.startTime,
                endTime: d.endTime,
                level: d.level,
                players: d.players,
                createdByMe: d.createdBy === userId,
                date: d.date?.toDate ? d.date.toDate() : new Date(),
                image: getImage(d.clubName),
                price: d.price,
                locationId: d.locationId || "",
                playersList: d.playersList || [],
              });
            }
          }

          if (!isMounted) return;
          setMyReservationsState(reserved);
        } else {
          setMyReservationsState([]);
        }
      } catch (error) {
        console.error("Fout bij laden reservaties:", error);
      }
    };

    loadMatchesFromFirebase();

    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user && isMounted) {
        loadMyReservations(user.uid);
      } else if (isMounted) {
        setMyReservationsState([]);
      }
    });

    return () => {
      isMounted = false;
      unsubscribe();
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
    const playersList: Player[] = [];

    if (creatorName) {
      playersList.push({
        id: creatorId || auth.currentUser?.uid || "unknown",
        firstName: creatorName.firstName,
        lastName: creatorName.lastName,
      });
    } else {
      playersList.push({ firstName: "?", lastName: "" });
    }

    try {
      console.log("createMatch called with:", { club, level, date, startTime, endTime });
      console.log("Current user uid:", auth.currentUser?.uid);

      const price = generateRandomPrice();

      // ✅ Write to Firestore
      const docRef = await addDoc(collection(db, "matches"), {
        club,
        clubName: club.toLowerCase(),
        startTime,
        endTime,
        level,
        players: 1,
        date: Timestamp.fromDate(date),
        price,
        locationId: "",
        playersList,
        createdBy: creatorId || auth.currentUser?.uid || "unknown",
        createdAt: Timestamp.now(),
      });

      console.log("✅ Firestore match created with id:", docRef.id);

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

      // ✅ Save reservation under user doc (creates doc if missing)
      const currentUser = auth.currentUser;
      if (currentUser) {
        const userRef = doc(db, "users", currentUser.uid);
        await setDoc(userRef, { reservations: arrayUnion(docRef.id) }, { merge: true });
        console.log("✅ Reservation stored in users/" + currentUser.uid);
      } else {
        console.log("⚠️ No authenticated user, skipping user reservation write");
      }

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
    } catch (error: any) {
      console.error("❌ Create match failed:", error);
      console.error("Error code:", error?.code);
      console.error("Error message:", error?.message);
      return false;
    }
  };

  const reserveMatch = (id: string): MatchWithPlayers | null => {
    const match = matches.find((m) => m.id === id);
    if (!match || match.players >= 4) return null;
    return match;
  };

  const setMyReservations = async (match: MatchWithPlayers): Promise<void> => {
    setMyReservationsState((prev) => [...prev, match]);

    const currentUser = auth.currentUser;
    if (!currentUser) return;

    try {
      // ✅ Create user doc if missing + add reservation id
      const userRef = doc(db, "users", currentUser.uid);
      await setDoc(userRef, { reservations: arrayUnion(match.id) }, { merge: true });
      console.log("✅ Reservation added to users/" + currentUser.uid);
    } catch (error) {
      console.error("Fout bij opslaan reservatie in Firebase:", error);
    }
  };

  const cancelReservation = async (matchId: string) => {
    try {
      setMyReservationsState((prev) => prev.filter((m) => m.id !== matchId));

      const matchRef = doc(db, "matches", matchId);
      const matchSnap = await getDoc(matchRef);

      if (matchSnap.exists()) {
        const currentPlayers = (matchSnap.data() as any).players || 1;
        await updateDoc(matchRef, {
          players: Math.max(0, currentPlayers - 1),
        });
      }

      const currentUser = auth.currentUser;
      if (currentUser) {
        const userRef = doc(db, "users", currentUser.uid);

        // NOTE: updateDoc will FAIL if the user doc doesn't exist.
        // If that's a problem, replace updateDoc with setDoc(..., {merge:true})
        await updateDoc(userRef, {
          reservations: arrayRemove(matchId),
        });

        const groupRef = doc(db, "groupConversations", `match_${matchId}`);
        await updateDoc(groupRef, {
          participants: arrayRemove(currentUser.uid),
          lastMessage: "Een speler heeft zich afgemeld",
          lastMessageTime: new Date(),
        }).catch(() => {});

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