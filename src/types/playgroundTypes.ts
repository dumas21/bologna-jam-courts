
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
  basketCount?: number; // Number of basketball hoops
  rating?: number; // Average rating 0-5
  ratingCount?: number; // Number of ratings
  comments?: string[]; // User comments
}
