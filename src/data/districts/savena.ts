
import { Playground } from "@/types/playground";

export const savenaPlaygrounds: Playground[] = [
  {
    id: "6",
    name: "Parco dei Cedri",
    address: "Via dei Cedri, 40132 Bologna BO",
    latitude: 44.4978,
    longitude: 11.2845,
    currentPlayers: 4,
    totalCheckins: 34,
    rating: 3.5,
    ratingCount: 12,
    openHours: "07:00 - 21:00",
    basketCount: 2,
    hasShade: false,
    hasAmenities: false,
    hasLighting: false,
    hasFountain: false,
    type: "Outdoor",
    district: "savena",
    refreshmentType: "no",
    comments: []
  },
  {
    id: "9",
    name: "Centro Sportivo Pilastro",
    address: "Via Pier Paolo Pasolini, 40132 Bologna BO",
    latitude: 44.5456,
    longitude: 11.4123,
    currentPlayers: 9,
    totalCheckins: 156,
    rating: 4.6,
    ratingCount: 45,
    openHours: "08:00 - 23:00",
    basketCount: 10,
    hasShade: true,
    hasAmenities: true,
    hasLighting: true,
    hasFountain: true,
    type: "Indoor",
    district: "savena",
    refreshmentType: "interno",
    comments: []
  }
];
