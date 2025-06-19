
import { Playground } from "@/types/playground";

export const playgroundData: Playground[] = [
  {
    id: "gm",
    name: "Giardini Margherita",
    address: "Via Castiglione, 40136 Bologna BO",
    openHours: "06:00 - 23:00",
    hasShade: true,
    hasFountain: false,
    hasAmenities: true, // Bar, chioschi e servizi igienici
    hasLighting: true,
    currentPlayers: 0,
    totalCheckins: 0,
    basketCount: 4,
    rating: 4.7,
    ratingCount: 42,
    comments: []
  },
  {
    id: "pm",
    name: "Parco della Montagnola",
    address: "Via Irnerio, 8, 40126 Bologna BO",
    openHours: "08:00 - 22:00",
    hasShade: true, // Circondato da alberi che offrono buona ombra naturale
    hasFountain: false,
    hasAmenities: false, // No bar diretti, ma nelle vicinanze
    hasLighting: true,
    currentPlayers: 0,
    totalCheckins: 0,
    basketCount: 2,
    rating: 3.8,
    ratingCount: 24,
    comments: []
  },
  {
    id: "gn",
    name: "Giardini Nanetti (PalaDozza)",
    address: "Via dello Sport, 40127 Bologna BO",
    openHours: "07:00 - 21:00",
    hasShade: false, // Parzialmente, vicino ad alberi e strutture
    hasFountain: false,
    hasAmenities: false, // No ristori diretti, ma bar nelle vicinanze del PalaDozza
    hasLighting: true,
    currentPlayers: 0,
    totalCheckins: 0,
    basketCount: 2,
    rating: 4.2,
    ratingCount: 18,
    comments: []
  },
  {
    id: "pdp",
    name: "Parco Davide Penazzi",
    address: "Via Libia, 40137 Bologna BO",
    openHours: "08:00 - 20:00",
    hasShade: true, // Inserito in un'area verde con alberi che offrono ombra
    hasFountain: false,
    hasAmenities: false, // No ristori diretti, ma panchine e aree di sosta
    hasLighting: false,
    currentPlayers: 0,
    totalCheckins: 0,
    basketCount: 1,
    rating: 3.5,
    ratingCount: 11,
    comments: []
  },
  {
    id: "fava",
    name: "Giardini Graziella Fava",
    address: "Via della Beverara, 40131 Bologna BO",
    openHours: "07:00 - 22:00",
    hasShade: true, // Circondato da alberi e verde pubblico
    hasFountain: false,
    hasAmenities: false, // No bar diretti, ma parco attrezzato con panchine
    hasLighting: false,
    currentPlayers: 0,
    totalCheckins: 0,
    basketCount: 2,
    rating: 4.2,
    ratingCount: 6,
    comments: []
  },
  {
    id: "talon",
    name: "Parco Talon",
    address: "Via Talon, 40133 Bologna BO",
    openHours: "08:00 - 20:00",
    hasShade: false, // Parzialmente, alcune zone con alberi ma abbastanza esposto
    hasFountain: false,
    hasAmenities: false, // No ristori diretti, area verde con panchine
    hasLighting: false,
    currentPlayers: 0,
    totalCheckins: 0,
    basketCount: 1,
    rating: 3.2,
    ratingCount: 5,
    comments: []
  },
  {
    id: "set11",
    name: "Parco 11 Settembre",
    address: "Via Emilia Levante, 40131 Bologna BO",
    openHours: "08:00 - 21:00",
    hasShade: false, // Parzialmente, alcune zone con alberi ma campo abbastanza esposto
    hasFountain: false,
    hasAmenities: false, // No ristori diretti, ma parco attrezzato
    hasLighting: true,
    currentPlayers: 0,
    totalCheckins: 0,
    basketCount: 2,
    rating: 3.6,
    ratingCount: 8,
    comments: []
  },
  {
    id: "pnord",
    name: "Parco Nord (Corticella)",
    address: "Via Marco Emilio Lepido, 40132 Bologna BO",
    openHours: "08:00 - 22:00",
    hasShade: true, // Campo inserito in area verde con alberi
    hasFountain: false,
    hasAmenities: false, // No ristori diretti, ma area verde con panchine
    hasLighting: true,
    currentPlayers: 0,
    totalCheckins: 0,
    basketCount: 2,
    rating: 3.8,
    ratingCount: 4,
    comments: []
  },
  {
    id: "ago2",
    name: "Parco 2 Agosto",
    address: "Via 2 Agosto 1980, 40127 Bologna BO",
    openHours: "08:30 - 21:00",
    hasShade: false, // Parzialmente, alcune zone con alberi
    hasFountain: false,
    hasAmenities: false, // No ristori diretti
    hasLighting: true,
    currentPlayers: 0,
    totalCheckins: 0,
    basketCount: 2,
    rating: 4.0,
    ratingCount: 7,
    comments: []
  },
  {
    id: "vber",
    name: "Parco Villa Bernaroli",
    address: "Via della Beverara, 40131 Bologna BO",
    openHours: "07:30 - 21:30",
    hasShade: true, // Circondato da verde e alberi
    hasFountain: false,
    hasAmenities: false, // No ristori diretti, ma area verde attrezzata
    hasLighting: false,
    currentPlayers: 0,
    totalCheckins: 0,
    basketCount: 1,
    rating: 3.9,
    ratingCount: 3,
    comments: []
  }
];
