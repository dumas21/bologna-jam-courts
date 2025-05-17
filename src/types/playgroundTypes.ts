
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
  basketCount: number;
  rating: number;
  ratingCount: number;
  comments: Comment[];
}

export interface Comment {
  id: string;
  text: string;
  user: string;
  timestamp: number;
}
