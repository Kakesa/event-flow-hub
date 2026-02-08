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
  role?: UserRole;
  isActive?: boolean;

  subscriptionType?: SubscriptionType;
  permissions?: ModulePermission[];
  createdAt?: string;
  updatedAt?: string;
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
  qrCode?: string;

  createdAt?: string;
  updatedAt?: string;
}

// ===================== INVITATION =====================
export interface Invitation {
  id: string;
  eventId: string;
  guestId: string;

  distributionMethod: DistributionMethod;

  templateUrl?: string;
  themeColor?: string;

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
export interface Analytics {
  id: string;
  eventId: string;

  totalInvitationsSent: number;
  totalConfirmed: number;
  totalDeclined: number;
  totalPending: number;

  preferredDrinksStats: Record<string, number>;
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
