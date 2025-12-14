// Types pour l'application de gestion d'événements

export type GuestStatus = 'invited' | 'confirmed' | 'declined' | 'pending';
export type DistributionMethod = 'whatsapp' | 'sms' | 'email';
export type SubscriptionType = 'free' | 'premium' | 'enterprise';
export type UserRole = 'admin' | 'user';

// Définition des modules avec leurs permissions CRUD
export type ModuleName = 'events' | 'guests' | 'invitations' | 'guestbook' | 'analytics' | 'users' | 'settings';
export type PermissionAction = 'create' | 'read' | 'update' | 'delete';

export interface ModulePermission {
  module: ModuleName;
  create: boolean;
  read: boolean;
  update: boolean;
  delete: boolean;
}

export interface User {
  id: string;
  fullName: string;
  email: string;
  phone?: string;
  role: UserRole;
  permissions: ModulePermission[];
  createdAt: string;
  updatedAt?: string;
}

export interface Organizer {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  subscriptionType: SubscriptionType;
  role?: UserRole;
  permissions?: ModulePermission[];
  createdAt: string;
}

export interface Event {
  id: string;
  organizerId: string;
  title: string;
  description: string;
  location: string;
  date: string;
  startTime: string;
  endTime: string;
  coverImage?: string;
  theme: string;
  createdAt: string;
  updatedAt: string;
}

export interface Guest {
  id: string;
  eventId: string;
  fullName: string;
  phone: string;
  email: string;
  status: GuestStatus;
  drinkPreference?: string;
  qrCode?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Invitation {
  id: string;
  eventId: string;
  guestId: string;
  templateUrl?: string;
  themeColor: string;
  sentAt?: string;
  distributionMethod: DistributionMethod;
}

export interface GuestbookMessage {
  id: string;
  eventId: string;
  guestId: string;
  guestName?: string;
  message: string;
  createdAt: string;
}

export interface QRCode {
  id: string;
  guestId: string;
  code: string;
  expiresAt: string;
  scannedAt?: string;
  isValid: boolean;
}

export interface Analytics {
  id: string;
  eventId: string;
  totalInvitationsSent: number;
  totalConfirmed: number;
  totalDeclined: number;
  totalPending: number;
  preferredDrinksStats: Record<string, number>;
  lastUpdated: string;
}

// API Response types
export interface ApiResponse<T> {
  data: T;
  success: boolean;
  message?: string;
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
