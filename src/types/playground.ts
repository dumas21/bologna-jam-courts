
// Define and export the Playground interface 
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
  hasLighting: boolean;
  currentPlayers: number;
  totalCheckins: number;
  basketCount?: number;
  rating?: number;
  ratingCount?: number;
  comments: Comment[];
}

// Re-export the types from playgroundTypes.ts to fix import errors
export type { Comment, CheckInRecord, RegisteredUser, WeatherData } from '@/types/playgroundTypes';
