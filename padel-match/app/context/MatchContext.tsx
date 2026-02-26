import React, { createContext, useContext, useState, ReactNode } from "react";
import { availableMatches as initialMatches, Match, generateRandomPrice } from "../data/matches";

export type Player = {
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
  createMatch: (club: string, level: number, date: Date, startTime: string, endTime: string, creatorName?: { firstName: string; lastName: string }) => boolean;
  reserveMatch: (id: string) => MatchWithPlayers | null;
};

const MatchContext = createContext<MatchContextType | undefined>(undefined);

// Mock players voor demo
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

// Function om random spelers te genereren
const generateRandomPlayers = (): Player[] => {
  const randomCount = Math.floor(Math.random() * 3) + 1; // 1-3 spelers
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

export const MatchProvider = ({ children }: { children: ReactNode }) => {
  const [matches, setMatches] = useState<MatchWithPlayers[]>(
    initialMatches.map((m) => ({
      ...m,
      playersList: generateRandomPlayers(),
    }))
  );
  const [myReservations, setMyReservationsState] = useState<MatchWithPlayers[]>([]);

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

  const createMatch = (
    club: string,
    level: number,
    date: Date,
    startTime: string,
    endTime: string,
    creatorName?: { firstName: string; lastName: string }
  ): boolean => {
    const existingMatch = matches.find(
      (m) => m.club.toLowerCase() === club.toLowerCase() && 
              m.date.toDateString() === date.toDateString() &&
              m.startTime === startTime
    );

    if (existingMatch) {
      return false;
    }

    // Maak spelers lijst met creator
    const playersList: Player[] = [];
    
    if (creatorName) {
      // Als creator een profiel heeft, voeg hem toe met zijn echte naam
      playersList.push({
        firstName: creatorName.firstName,
        lastName: creatorName.lastName,
      });
    } else {
      // Anders voeg "?" toe
      playersList.push({
        firstName: "?",
        lastName: "",
      });
    }

    const newMatch: MatchWithPlayers = {
      id: (Math.random() * 100000).toFixed(0),
      club: club,
      clubName: club.toLowerCase(),
      time: startTime,
      startTime,
      endTime,
      level,
      players: 1, // Creator telt als 1 speler
      createdByMe: true,
      date,
      image: getImage(club),
      price: generateRandomPrice(),
      playersList: playersList,
      locationId: "",
    };

    setMatches([...matches, newMatch]);
    setMyReservationsState([...myReservations, newMatch]);
    return true;
  };

  const reserveMatch = (id: string): MatchWithPlayers | null => {
    const match = matches.find((m) => m.id === id);
    if (!match) return null;

    if (match.players >= 4) return null;

    return match;
  };

  const setMyReservations = (match: MatchWithPlayers) => {
    setMyReservationsState((prev) => [...prev, match]);
  };

  return (
    <MatchContext.Provider
      value={{ 
        matches, 
        myReservations,
        setMyReservations,
        createMatch, 
        reserveMatch 
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