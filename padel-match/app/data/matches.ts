export type Match = {
  id: string;
  club: string;
  time: string;
  level: number; // 0.5 t/m 7
  players: number; // aantal spelers momenteel ingeschreven
};

export const availableMatches: Match[] = [
  { id: "1", club: "Padel Antwerp", time: "19:00", level: 4, players: 2 },
  { id: "2", club: "Padel Brussels", time: "20:00", level: 3.5, players: 1 },
  { id: "3", club: "Padel Ghent", time: "18:30", level: 5, players: 3 },
];
