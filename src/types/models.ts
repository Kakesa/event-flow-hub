// ===================== ENUMS =====================
export type GuestStatus = 'invited' | 'confirmed' | 'declined' | 'pending';
export type DistributionMethod = 'whatsapp' | 'sms' | 'email';
export type SubscriptionType = 'free' | 'premium' | 'enterprise';

// ===================== ORGANIZER =====================
export interface Organizer {
  id: string;
  name: string;                // ⚠️ cohérent avec ton backend
  email: string;
  phone?: string;
  role?: 'organizer' | 'admin';

  subscriptionType?: SubscriptionType;

  createdAt?: string;
  updatedAt?: string;
}

// ===================== EVENT =====================
export interface Event {
  id: string;
  organizerId: string;

  title: string;
  type: string;               // wedding, birthday, corporate...
  description?: string;

  date: string;
  startTime?: string;
  endTime?: string;

  location: string;

  coverImage?: string;
  theme?: string;

  createdAt?: string;
  updatedAt?: string;
}

// ===================== GUEST =====================
export interface Guest {
  id: string;
  eventId: string;

  fullName: string;
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
  guestName?: string;

  message: string;
  createdAt: string;
}

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

// Modules disponibles avec labels
export const MODULES: { name: ModuleName; label: string }[] = [
  { name: 'events', label: 'Événements' },
  { name: 'guests', label: 'Invités' },
  { name: 'invitations', label: 'Invitations' },
  { name: 'guestbook', label: "Livre d'or" },
  { name: 'analytics', label: 'Analytics' },
  { name: 'users', label: 'Utilisateurs' },
  { name: 'settings', label: 'Paramètres' },
];

// Permissions par défaut pour un nouvel utilisateur
export const DEFAULT_USER_PERMISSIONS: ModulePermission[] = MODULES.map(m => ({
  module: m.name,
  create: false,
  read: true,
  update: false,
  delete: false,
}));

// Permissions admin (tout autorisé)
export const ADMIN_PERMISSIONS: ModulePermission[] = MODULES.map(m => ({
  module: m.name,
  create: true,
  read: true,
  update: true,
  delete: true,
}));
