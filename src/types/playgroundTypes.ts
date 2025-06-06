
// Tipo utente registrato (visibile solo nel pannello admin)
export interface RegisteredUser {
  id: string;
  nickname: string;     // visibile pubblicamente
  email: string;        // visibile solo lato admin
  createdAt: string;    // formato ISO
  password: string;     // password utente
  isAdmin: boolean;     // flag per indicare se l'utente è admin
  registrationDate: number; // data di registrazione come timestamp
  checkedIn: boolean;   // flag per indicare se l'utente ha fatto check-in
}

// Tipo commento visibile nella piattaforma
export interface Comment {
  id: string;
  text: string;        // contenuto del commento (rinominato per compatibilità)
  user: string;        // nickname dell'autore
  timestamp: number;   // timestamp del commento
  playgroundId: string; // ID del playground a cui appartiene il commento
}

// Record di check-in per un utente
export interface CheckInRecord {
  playgroundId: string;
  email: string;
  nickname: string;
  timestamp: number;
}

// Dati meteo
export interface WeatherData {
  condition: string;
  temperature: number;
  humidity: number;
  icon: string;
}

// Tipo playground aggiornato con tutte le proprietà necessarie
export interface Playground {
  id: string;
  name: string;
  address: string;
  type?: string;
  opening_hours?: string;
  openHours: string;
  latitude?: number;
  longitude?: number;
  hasShade: boolean;
  hasFountain: boolean;
  hasAmenities: boolean;
  hasLighting: boolean;
  currentPlayers: number;
  totalCheckins: number;
  basketCount?: number;
  rating?: number;
  ratingCount?: number;
  comments: Comment[];
  features?: {
    water: boolean;
    shade: boolean;
    lighting: boolean;
  };
}

// Tipo pubblico per mostrare solo nickname/id (senza email)
export type PublicUser = Pick<RegisteredUser, 'id' | 'nickname'>;
