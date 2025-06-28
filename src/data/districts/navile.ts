
import { Playground } from "@/types/playground";

export const navilePlaygrounds: Playground[] = [
  {
    id: "3",
    name: "Parco Nicholas Green",
    address: "Via Sacco, 40131 Bologna BO",
    latitude: 44.5154,
    longitude: 11.3569,
    currentPlayers: 8,
    totalCheckins: 120,
    rating: 4.5,
    ratingCount: 32,
    openHours: "06:30 - 22:30",
    basketCount: 6,
    hasShade: true,
    hasAmenities: true,
    hasLighting: true,
    hasFountain: true,
    type: "Outdoor",
    district: "navile",
    refreshmentType: "interno",
    comments: []
  },
  {
    id: "5",
    name: "Centro Sportivo Barca",
    address: "Via Barca, 40133 Bologna BO",
    latitude: 44.5234,
    longitude: 11.3892,
    currentPlayers: 12,
    totalCheckins: 89,
    rating: 4.3,
    ratingCount: 28,
    openHours: "08:00 - 22:00",
    basketCount: 8,
    hasShade: true,
    hasAmenities: true,
    hasLighting: true,
    hasFountain: true,
    type: "Indoor",
    district: "navile",
    refreshmentType: "interno",
    comments: []
  }
];
