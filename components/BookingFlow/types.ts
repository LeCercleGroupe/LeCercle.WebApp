export const SERVICE_IDS = {
  lebureau: "aaaaaaaa-0001-0001-0001-aaaaaaaaaaaa",
  maisondufeu: "aaaaaaaa-0002-0002-0002-aaaaaaaaaaaa",
  // lafonte: "aaaaaaaa-0003-0003-0003-aaaaaaaaaaaa",
  laperle: "aaaaaaaa-0004-0004-0004-aaaaaaaaaaaa",
} as const;

export type ServiceId = (typeof SERVICE_IDS)[keyof typeof SERVICE_IDS];
export type VenueKey = ServiceId;

export interface SelectedPackage {
  id: string;
  name: string;
  basePrice: number;
  tier: string;
  selectedOptionIds: string[];
  additionalCost: number;
}

export type ContactType = "person" | "company";
export type PaymentOption = "now" | "later";

export interface BookingState {
  date: Date | null;
  guests: number;
  selectedServices: ServiceId[];
  selectedPackages: Partial<Record<ServiceId, SelectedPackage>>;
  guestsPerService: Partial<Record<ServiceId, number>>;
  city: string;
  address: string;
  postalCode: string;
  venueName: string;
  latitude: number | null;
  longitude: number | null;
  distanceKm: number | null;
  startTime: string;
  notes: string;
  contactType: ContactType;
  companyName: string;
  idno: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  paymentOption: PaymentOption;
  smsSent: boolean;
  smsVerified: boolean;
  emailVerified: boolean;
  userAccessToken: string;
  userRefreshToken: string;
  userId: string;
  customerId: string;
  bookingRef: string;
  reservationToken: string;
}

export const VENUE_INFO: Record<ServiceId, { name: string; description: string; logo: string }> = {
  [SERVICE_IDS.lebureau]: {
    name: "Le Bureau",
    description: "Cigar lounge cu aer retro și clasic",
    logo: "/logos/LeBureau.svg",
  },
  [SERVICE_IDS.maisondufeu]: {
    name: "Maison du Feu",
    description: "Desert franțuzesc servit ca moment live",
    logo: "/logos/MaisonDuFeu.svg",
  },
  // [SERVICE_IDS.lafonte]: {
  //   name: "La Fonte",
  //   description: "Chocolate fondue în stil elvețian",
  //   logo: "/logos/LaFonte.svg",
  // },
  [SERVICE_IDS.laperle]: {
    name: "La Perle",
    description: "Tuktuk cu gelato italian pentru evenimente",
    logo: "/logos/LaPerle.svg",
  },
};

export const ALL_VENUES: ServiceId[] = [
  SERVICE_IDS.lebureau,
  SERVICE_IDS.maisondufeu,
  // SERVICE_IDS.lafonte,
  SERVICE_IDS.laperle,
];
