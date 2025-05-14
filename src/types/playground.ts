

export interface Playground {
  id: string;
  name: string;
  address: string;
  lat: number;
  lng: number;
  openHours: string;
  hasShade: boolean;
  hasFountain: boolean;
  hasAmenities: boolean;
  hasLighting: boolean; // Nuova proprietà per l'illuminazione
  currentPlayers: number;
}

export const playgroundData: Playground[] = [
  {
    id: "gm",
    name: "Giardini Margherita",
    address: "Viale Giovanni Gozzadini, 40136 Bologna",
    lat: 44.4808,
    lng: 11.3576,
    openHours: "06:00 - 23:00",
    hasShade: true,
    hasFountain: true,
    hasAmenities: true,
    hasLighting: true, // Aggiunto illuminazione
    currentPlayers: 8,
  },
  {
    id: "pm",
    name: "Parco della Montagnola",
    address: "Via Irnerio, 40126 Bologna",
    lat: 44.5055,
    lng: 11.3465,
    openHours: "08:00 - 22:00",
    hasShade: false,
    hasFountain: true,
    hasAmenities: false,
    hasLighting: true, // Aggiunto illuminazione
    currentPlayers: 4,
  },
  {
    id: "mp",
    name: "Meloncello Playground",
    address: "Via Saragozza, 40135 Bologna",
    lat: 44.4913,
    lng: 11.3024,
    openHours: "07:00 - 21:00",
    hasShade: true,
    hasFountain: false,
    hasAmenities: true,
    hasLighting: false, // Aggiunto illuminazione
    currentPlayers: 2,
  },
  {
    id: "vdb",
    name: "Viale Dei Bambini",
    address: "Viale dei Bambini, 40127 Bologna",
    lat: 44.4975,
    lng: 11.3391,
    openHours: "08:00 - 20:00",
    hasShade: false,
    hasFountain: true,
    hasAmenities: false,
    hasLighting: false, // Aggiunto illuminazione
    currentPlayers: 0,
  },
  {
    id: "aas",
    name: "Armandi Avogli School",
    address: "Via Armandi Avogli, 40137 Bologna",
    lat: 44.4909,
    lng: 11.3681,
    openHours: "15:00 - 22:00",
    hasShade: true,
    hasFountain: true,
    hasAmenities: true,
    hasLighting: true, // Aggiunto illuminazione
    currentPlayers: 10,
  },
];

