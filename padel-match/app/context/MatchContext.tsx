import React, { createContext, useState, useContext, ReactNode } from "react";
import { Match, availableMatches } from "../data/matches";

type MatchContextType = {
  matches: Match[];
  reservedMatches: Match[];
  reserveMatch: (id: string) => void;
};

const MatchContext = createContext<MatchContextType | undefined>(undefined);

export const MatchProvider = ({ children }: { children: ReactNode }) => {
  const [matches, setMatches] = useState<Match[]>(availableMatches);
  const [reservedMatches, setReservedMatches] = useState<Match[]>([]);

  const reserveMatch = (id: string) => {
    const match = matches.find((m) => m.id === id);
    if (!match) return;

    // Voeg toe aan reserved
    setReservedMatches([...reservedMatches, match]);

    // Verwijder uit beschikbare matches
    setMatches(matches.filter((m) => m.id !== id));
  };

  return (
    <MatchContext.Provider value={{ matches, reservedMatches, reserveMatch }}>
      {children}
    </MatchContext.Provider>
  );
};

export const useMatch = () => {
  const context = useContext(MatchContext);
  if (!context) throw new Error("useMatch must be used within MatchProvider");
  return context;
};


