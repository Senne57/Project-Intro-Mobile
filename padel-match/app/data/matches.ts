export interface Location {
  id: string;
  name: string;
  city: string;
  address: string;
}

export const locations: Location[] = [
  // Antwerpen
  { id: "ant-1", name: "Padel Pro Antwerpen", city: "Antwerpen", address: "Antwerpse Baan 45" },
  { id: "ant-2", name: "Tennis Padel Club", city: "Antwerpen", address: "Sportstraat 12" },
  { id: "ant-3", name: "Antwerpen Sports Center", city: "Antwerpen", address: "Evenementenplein 5" },
  
  // Brussel
  { id: "bru-1", name: "Brussel Padel Club", city: "Brussel", address: "Chaussée de Bruxelles 78" },
  { id: "bru-2", name: "Padel House Brussels", city: "Brussel", address: "Rue de la Paix 23" },
  { id: "bru-3", name: "Brussels Tennis Padel", city: "Brussel", address: "Avenue Louise 156" },
  
  // Gent
  { id: "gent-1", name: "Gent Padel Center", city: "Gent", address: "Krijgslaan 281" },
  { id: "gent-2", name: "Padel Club Gent", city: "Gent", address: "Sint-Jacobs 42" },
  { id: "gent-3", name: "Gentse Sporthal Padel", city: "Gent", address: "Universiteitstraat 8" },
];

export const timeSlots = [
  { start: "09:00", end: "11:00", label: "09u - 11u" },
  { start: "10:00", end: "12:00", label: "10u - 12u" },
  { start: "12:00", end: "14:00", label: "12u - 14u" },
  { start: "14:00", end: "16:00", label: "14u - 16u" },
  { start: "16:00", end: "18:00", label: "16u - 18u" },
  { start: "18:00", end: "20:00", label: "18u - 20u" },
  { start: "19:00", end: "21:00", label: "19u - 21u" },
  { start: "20:00", end: "22:00", label: "20u - 22u" },
];

export const generateRandomPrice = (): number => {
  // Random prijs tussen 5.00 en 10.00 euro met 0.50 stappen
  // [10, 10.50, 11, 11.50, ... 19.50, 20] -> [5, 5.50, 6, 6.50, ... 9.50, 10]
  const options = [5.0, 5.5, 6.0, 6.5, 7.0, 7.5, 8.0, 8.5, 9.0, 9.5, 10.0];
  return options[Math.floor(Math.random() * options.length)];
};

export interface Match {
  id: string;
  club: string;
  clubName: string;
  time: string;
  startTime: string;
  endTime: string;
  level: number;
  players: number;
  createdByMe: boolean;
  date: Date;
  image: any;
  price: number;
  locationId?: string;
}

const today = new Date();

export const availableMatches: Match[] = [
  {
    id: "1",
    club: "Padel Pro Antwerpen",
    clubName: "antwerpen",
    time: "19:00",
    startTime: "19:00",
    endTime: "21:00",
    level: 2,
    players: 1,
    createdByMe: false,
    date: new Date(today.getTime() + 1000 * 60 * 60 * 24),
    image: require("../../assets/images/antwerpen.jpg"),
    price: generateRandomPrice(),
    locationId: "ant-1",
  },
  {
    id: "2",
    club: "Brussel Padel Club",
    clubName: "brussel",
    time: "18:00",
    startTime: "18:00",
    endTime: "20:00",
    level: 3,
    players: 2,
    createdByMe: false,
    date: new Date(today.getTime() + 1000 * 60 * 60 * 24 * 2),
    image: require("../../assets/images/brussel.jpg"),
    price: generateRandomPrice(),
    locationId: "bru-1",
  },
  {
    id: "3",
    club: "Gent Padel Center",
    clubName: "gent",
    time: "20:00",
    startTime: "20:00",
    endTime: "22:00",
    level: 2.5,
    players: 2,
    createdByMe: false,
    date: new Date(today.getTime() + 1000 * 60 * 60 * 24 * 3),
    image: require("../../assets/images/Gent.png"),
    price: generateRandomPrice(),
    locationId: "gent-1",
  },
];