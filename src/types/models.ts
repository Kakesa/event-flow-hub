// ===================== ENUMS =====================
export type GuestStatus = "invited" | "confirmed" | "declined" | "pending";
export type DistributionMethod = "whatsapp" | "sms" | "email";
export type SubscriptionType = "free" | "basic" | "premium" | "enterprise";
export type UserRole = "user" | "admin" | "organizer" | "superadmin";
export type PermissionAction = "create" | "read" | "update" | "delete";

// ===================== PERMISSIONS =====================
export type ModuleName =
  | "events"
  | "guests"
  | "invitations"
  | "guestbook"
  | "analytics"
  | "users"
  | "settings";

export interface ModulePermission {
  module: ModuleName;
  create: boolean;
  read: boolean;
  update: boolean;
  delete: boolean;
}

// ===================== USER =====================
export interface User {
  _id: string;
  id?: string; // alias pour compatibilité frontend
  name: string;
  email: string;
  phone?: string;
  avatarUrl?: string;
  role?: UserRole;
  isActive?: boolean;

  subscriptionType?: SubscriptionType;
  planLimitsBypass?: boolean;
  guestPriceFc?: number | null;
  /** Quota total d'invités (tous événements), défini par le super admin */
  maxGuests?: number | null;
  permissions?: ModulePermission[];
  createdAt?: string;
  updatedAt?: string;
}

export interface SubscriptionLimitsStatus {
  plan: SubscriptionType;
  planLimitsBypass: boolean;
  hasPremiumAdminAccess?: boolean;
  maxEvents: number | null;
  maxGuests: number | null;
  /** Quota total personnalisé par le super admin (tous événements confondus) */
  maxGuestsQuota?: number | null;
  totalGuestCount?: number;
  eventCount: number;
  canCreateEvent: boolean;
  customizableTemplates: boolean;
  advancedAnalytics: boolean;
  guestCount?: number;
  canAddGuest?: boolean;
  pricePerGuestFc?: number;
  defaultGuestPriceFc?: number;
  negotiatedPricesFc?: number[];
  billing?: GuestBillingStatus;
  eventBilling?: GuestBillingStatus;
}

export interface GuestBillingStatus {
  guestCount: number;
  pricePerGuestFc: number;
  totalFc: number;
  billingBlockSize: number;
  completedBlocks: number;
  blockTotalFc: number;
  guestsInCurrentBlock: number;
  nextBlockAt: number;
  displayLabel: string;
  blockProgressLabel: string;
}

export interface PlatformPricingSettings {
  defaultGuestPriceFc: number;
  negotiatedPricesFc: number[];
}

// ===================== EVENT =====================
export interface Organizer {
  name: string;
  email?: string;
  phone?: string;
}

export interface Event {
  id: string;
  _id?: string;
  userId: string | User;

  title: string;
  slug: string;

  type: string;
  description?: string;

  date: string;
  startTime?: string;
  endTime?: string;

  location: string;

  coverImage?: string;
  theme?: string;
  primaryColor?: string;
  accentColor?: string;

  dressCode?: string;
  dressCodeNotes?: string;

  seating?: SeatingConfig;

  organizer?: Organizer;

  createdAt?: string;
  updatedAt?: string;
}

// ===================== GUEST =====================
export interface Guest {
  id: string;
  eventId: string;

  name: string;
  phone?: string;
  email?: string;

  status: GuestStatus;

  drinkPreference?: string;
  dietaryRestrictions?: string;
  message?: string;
  qrCode?: string;
  table?: string;
  tableId?: string | SeatingTable | null;
  groupId?: string | GuestGroup | null;
  respondedAt?: string;

  createdAt?: string;
  updatedAt?: string;
}

// ===================== SEATING =====================
export type SeatingSetupMethod = "by_table_count" | "by_capacity" | "manual" | "";

export interface SeatingConfig {
  configured?: boolean;
  expectedGuestCount?: number;
  setupMethod?: SeatingSetupMethod;
  skippedAt?: string;
}

export type TableStatus = "available" | "almost_full" | "full";

export interface SeatingTable {
  id: string;
  eventId: string;
  name: string;
  number: number;
  capacity: number;
  color?: string;
  description?: string;
  position?: { x: number; y: number };
  guestCount?: number;
  remainingSeats?: number;
  isFull?: boolean;
  fillRate?: number;
  status?: TableStatus;
}

export type GuestGroupType =
  | "family"
  | "vip"
  | "sponsors"
  | "partners"
  | "press"
  | "organizers"
  | "friends"
  | "colleagues"
  | "honorees"
  | "custom";

export interface GuestGroup {
  id: string;
  eventId: string;
  name: string;
  type: GuestGroupType;
  color?: string;
}

export interface SeatingStats {
  totalGuests: number;
  assignedGuests: number;
  unassignedGuests: number;
  tableCount: number;
  totalCapacity: number;
  totalOccupied: number;
  totalRemainingSeats: number;
  fullTables: number;
  incompleteTables: number;
  emptyTables: number;
  globalFillRate: number;
}

export interface SeatingOverview {
  event: {
    id: string;
    title: string;
    coverImage?: string;
    seating: SeatingConfig;
  };
  tables: SeatingTable[];
  groups: GuestGroup[];
  guests: Guest[];
  stats: SeatingStats;
}

// ===================== INVITATION =====================
export interface Invitation {
  id: string;
  eventId: string;
  guestId: string;
  guest?: Pick<Guest, "id" | "name" | "email" | "phone">;

  distributionMethod: DistributionMethod;

  templateUrl?: string;
  themeColor?: string;

  status?: "pending" | "sent" | "failed";
  sentAt?: string;
  createdAt?: string;
}

// ===================== GUESTBOOK =====================
export interface GuestbookMessage {
  id: string;
  eventId: string;

  guestId?: string;
  name?: string; // ✅ aligné avec le backend

  message: string;
  reply?: string;
  repliedAt?: string;
  createdAt: string;
}

type RSVPFormData = {
  status: "confirmed" | "declined" | "pending";
  drinkPreference: string;
  message: string;
  dietaryRestrictions: string;
  plusOne: boolean;
  plusOneName: string;
};

// ===================== QR CODE =====================
export interface QRCode {
  id: string;
  guestId: string;

  code: string;
  isValid: boolean;

  expiresAt?: string;
  scannedAt?: string;
}

// ===================== ANALYTICS =====================
export interface DrinkCategoryStats {
  alcoholic: number;
  soft: number;
  other: number;
  totalChoices: number;
  guestsWithDrinks: number;
}

export interface Analytics {
  id: string;
  eventId: string;

  totalInvitationsSent: number;
  totalConfirmed: number;
  totalDeclined: number;
  totalPending: number;

  preferredDrinksStats: Record<string, number>;
  alcoholicDrinksStats?: Record<string, number>;
  softDrinksStats?: Record<string, number>;
  drinkCategoryStats?: DrinkCategoryStats;
  lastUpdated?: string;
}

// ===================== API RESPONSES =====================
export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// ===================== MODULES =====================
export const MODULES: { name: ModuleName; label: string }[] = [
  { name: "events", label: "Événements" },
  { name: "guests", label: "Invités" },
  { name: "invitations", label: "Invitations" },
  { name: "guestbook", label: "Livre d'or" },
  { name: "analytics", label: "Analytics" },
  { name: "users", label: "Utilisateurs" },
  { name: "settings", label: "Paramètres" },
];

// ===================== DEFAULT PERMISSIONS =====================
export const DEFAULT_USER_PERMISSIONS: ModulePermission[] = MODULES.map(
  (m) => ({
    module: m.name,
    create: false,
    read: true,
    update: false,
    delete: false,
  }),
);

// ===================== ADMIN PERMISSIONS =====================
export const ADMIN_PERMISSIONS: ModulePermission[] = MODULES.map((m) => ({
  module: m.name,
  create: true,
  read: true,
  update: true,
  delete: true,
}));

// ===================== ORGANIZER PERMISSIONS =====================
export const ORGANIZER_PERMISSIONS: ModulePermission[] = MODULES.map((m) => {
  if (
    ["events", "guests", "invitations", "guestbook", "analytics"].includes(
      m.name,
    )
  ) {
    return {
      module: m.name,
      create: true,
      read: true,
      update: true,
      delete: true,
    };
  }
  // Pas d'accès aux utilisateurs ou paramètres
  return {
    module: m.name,
    create: false,
    read: false,
    update: false,
    delete: false,
  };
});

// ===================== SUPERADMIN PERMISSIONS =====================
export const SUPERADMIN_PERMISSIONS: ModulePermission[] = MODULES.map((m) => ({
  module: m.name,
  create: true,
  read: true,
  update: true,
  delete: true,
}));
