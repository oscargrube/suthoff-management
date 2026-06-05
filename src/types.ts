/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

// User and Employee Roles
export enum UserRolle {
  ADMIN = "ADMIN",
  VORARBEITER_BAU = "VORARBEITER_BAU",
  VORARBEITER_PFLEGE = "VORARBEITER_PFLEGE",
  MITARBEITER = "MITARBEITER",
  AZUBI = "AZUBI",
  PRAKTIKANT = "PRAKTIKANT"
}

export interface Datei {
  id: string;
  name: string;
  dateityp: string;
  dateigroeße: number; // in KB
  uploadDatum: string;
  url: string;
  hochgeladenVon: string; // User-ID
}

export interface HistoryItem {
  id: string;
  datum: string;
  baustelleName: string;
  rolle: string;
  stunden: number;
}

export interface User {
  id: string;
  personalnummer: string;
  vorname: string;
  nachname: string;
  email: string;
  telefon: string;
  rolle: UserRolle;
  eintrittsdatum: string;
  sollstundenMonat: number;
  iststundenMonat: number;
  stundenlohnBrutto: number;
  urlaubstageGesamt: number;
  urlaubstageVerbraucht: number;
  aktiv: boolean;
  profilbild: string;
  dateien: Datei[];
  baustellenHistorie: HistoryItem[];
  createdAt: string;
  updatedAt: string;
}

// Baustellen types
export enum BaustellenTyp {
  BAU = "BAU",
  PFLEGE = "PFLEGE"
}

export enum BaustellenStatus {
  GEPLANT = "GEPLANT",
  AKTIV = "AKTIV",
  PAUSIERT = "PAUSIERT",
  ABGESCHLOSSEN = "ABGESCHLOSSEN"
}

export interface MaterialBestand {
  materialId: string;
  name: string;
  menge: number;
  einheit: string;
}

export interface Baustelle {
  id: string;
  baustellennummer: string;
  typ: BaustellenTyp;
  name: string;
  kundenname: string;
  kundenadresse: string;
  beschreibung: string;
  startdatum: string;
  enddatum: string;
  status: BaustellenStatus;
  endpreis: number;
  kalkulierteMaterialkosten: number;
  kalkulierteLohnkosten: number;
  tatsaechlicheMaterialkosten: number;
  tatsaechlicheLohnkosten: number;
  materialVorOrt: MaterialBestand[];
  maschinenVorOrt: string[]; // Maschinen IDs
  dateien: Datei[];
  createdAt: string;
}

// Bautag and Zeiterfassung
export enum BautagStatus {
  GEPLANT = "GEPLANT",
  LAUFEND = "LAUFEND",
  ABGESCHLOSSEN = "ABGESCHLOSSEN"
}

export interface MaterialPosition {
  materialId: string;
  menge: number;
}

export interface Bautag {
  id: string;
  baustelleId: string;
  datum: string;
  typ: BaustellenTyp;
  status: BautagStatus;
  ankunftszeit?: string;
  abfahrtszeit?: string;
  pausenzeitMinuten: number;
  fahrzeitHinMinuten: number;
  fahrzeitZurueckMinuten: number;
  wetter?: string;
  bemerkungen?: string;
  mitarbeiterIds: string[]; // User IDs
  verwendeteMaschinenIds: string[]; // Maschine IDs
  kalkuliertesMaterial: MaterialPosition[];
  verbrauchtesMaterial: MaterialPosition[];
  fotosVorher: Datei[];
  fotosNachher: Datei[];
  tagesbericht?: string;
}

export interface Zeiterfassung {
  id: string;
  userId: string;
  datum: string;
  checkIn?: string;
  checkOut?: string;
  pauseMinuten: number;
  fahrzeitHin: number; // in Min
  fahrzeitZurueck: number; // in Min
  arbeitszeitNetto: number; // in Std
  bautagId?: string;
  freigegeben: boolean;
}

// Material and Inventory
export enum MaterialEinheit {
  STK = "STK",
  KG = "KG",
  T = "T",
  M = "M",
  M2 = "M²",
  M3 = "M³",
  L = "L"
}

export interface Material {
  id: string;
  name: string;
  artikelnummer: string;
  einheit: MaterialEinheit;
  aktuellerBestand: number;
  mindestbestand: number;
  lagerort: string;
  einkaufspreis: number;
  aktiv: boolean;
}

// Maschinen configurations
export enum MaschinenStatus {
  SEHR_GUT = "SEHR_GUT",
  GUT = "GUT",
  MITTEL = "MITTEL",
  SCHLECHT = "SCHLECHT",
  DEFEKT = "DEFEKT"
}

export interface Maschine {
  id: string;
  name: string;
  typ: string;
  inventarnummer: string;
  status: MaschinenStatus;
  aktuellerStandort: string;
  letzteWartung: string;
  naechsteWartung: string;
  betriebsstunden: number;
}

// Fahrzeug details
export enum FahrzeugStatus {
  EINSATZBEREIT = "EINSATZBEREIT",
  WARTUNG = "WARTUNG",
  DEFEKT = "DEFEKT"
}

export interface Fahrzeug {
  id: string;
  kennzeichen: string;
  bezeichnung: string;
  typ: string;
  status: FahrzeugStatus;
  kilometerstand: number;
  naechsteInspektion: string;
  zugewieseneMitarbeiterIds: string[]; // User IDs
}
