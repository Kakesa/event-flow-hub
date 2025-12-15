/* eslint-disable @typescript-eslint/no-explicit-any */
// src/api/api.ts
import type {
  Event,
  Guest,
  Invitation,
  GuestbookMessage,
  Analytics,
  User,
  ApiResponse,
  ModulePermission,
} from '@/types/models';

// URL de base du backend
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Headers par défaut
const getHeaders = () => ({
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${localStorage.getItem('token') || ''}`,
});

// Gestionnaire de réponse amélioré
const handleResponse = async <T>(response: Response): Promise<T> => {
  const text = await response.text();
  let data;
  try {
    data = JSON.parse(text);
  } catch {
    data = { message: text || 'Erreur serveur' };
  }

  if (!response.ok) {
    console.error('API ERROR:', response.status, data);
    throw new Error(data.message || 'Une erreur est survenue');
  }

  return data;
};

// ==================== AUTHENTIFICATION ====================
export const authApi = {
  register: async (data: { name: string; email: string; phone?: string; password: string }): Promise<ApiResponse<{ token: string; user: User }>> => {
    const payload: any = {
      name: data.name.trim(),
      email: data.email.trim().toLowerCase(),
      password: data.password,
    };
    if (data.phone?.trim()) {
      payload.phone = data.phone.trim();
    }

    const response = await fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    return handleResponse(response);
  },

  login: async (email: string, password: string): Promise<ApiResponse<{ token: string; user: User }>> => {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: email.trim().toLowerCase(), password }),
    });

    return handleResponse(response);
  },

  me: async (): Promise<ApiResponse<User>> => {
    const response = await fetch(`${API_BASE_URL}/auth/me`, {
      headers: getHeaders(),
    });

    return handleResponse(response);
  },
};

// ==================== ÉVÉNEMENTS ====================
export const eventsApi = {
  getAll: async (): Promise<ApiResponse<Event[]>> => {
    const response = await fetch(`${API_BASE_URL}/events`, { headers: getHeaders() });
    return handleResponse(response);
  },

  getById: async (id: string): Promise<ApiResponse<Event>> => {
    const response = await fetch(`${API_BASE_URL}/events/${id}`, { headers: getHeaders() });
    return handleResponse(response);
  },

  create: async (data: Partial<Event>): Promise<ApiResponse<Event>> => {
    const response = await fetch(`${API_BASE_URL}/events`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    return handleResponse(response);
  },

  update: async (id: string, data: Partial<Event>): Promise<ApiResponse<Event>> => {
    const response = await fetch(`${API_BASE_URL}/events/${id}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    return handleResponse(response);
  },

  delete: async (id: string): Promise<ApiResponse<void>> => {
    const response = await fetch(`${API_BASE_URL}/events/${id}`, {
      method: 'DELETE',
      headers: getHeaders(),
    });
    return handleResponse(response);
  },
};

// ==================== INVITÉS ====================
export const guestsApi = {
  getAll: async (): Promise<ApiResponse<Guest[]>> => {
    const response = await fetch(`${API_BASE_URL}/guests`, { headers: getHeaders() });
    return handleResponse(response);
  },

  getByEvent: async (eventId: string): Promise<ApiResponse<Guest[]>> => {
    const response = await fetch(`${API_BASE_URL}/events/${eventId}/guests`, { headers: getHeaders() });
    return handleResponse(response);
  },

  create: async (eventId: string, data: Partial<Guest>): Promise<ApiResponse<Guest>> => {
    const response = await fetch(`${API_BASE_URL}/events/${eventId}/guests`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    return handleResponse(response);
  },

  update: async (id: string, data: Partial<Guest>): Promise<ApiResponse<Guest>> => {
    const response = await fetch(`${API_BASE_URL}/guests/${id}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    return handleResponse(response);
  },

  delete: async (id: string): Promise<ApiResponse<void>> => {
    const response = await fetch(`${API_BASE_URL}/guests/${id}`, {
      method: 'DELETE',
      headers: getHeaders(),
    });
    return handleResponse(response);
  },

  updateStatus: async (id: string, status: Guest['status']): Promise<ApiResponse<Guest>> => {
    return guestsApi.update(id, { status });
  },
};

// ==================== INVITATIONS ====================
export const invitationsApi = {
  send: async (guestId: string, method: Invitation['distributionMethod']): Promise<ApiResponse<Invitation>> => {
    const response = await fetch(`${API_BASE_URL}/invitations/send`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ guestId, method }),
    });
    return handleResponse(response);
  },

  sendBulk: async (guestIds: string[], method: Invitation['distributionMethod']): Promise<ApiResponse<Invitation[]>> => {
    const response = await fetch(`${API_BASE_URL}/invitations/send-bulk`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ guestIds, method }),
    });
    return handleResponse(response);
  },
};

// ==================== LIVRE D'OR ====================
export const guestbookApi = {
  getByEvent: async (eventId: string): Promise<ApiResponse<GuestbookMessage[]>> => {
    const response = await fetch(`${API_BASE_URL}/events/${eventId}/guestbook`, { headers: getHeaders() });
    return handleResponse(response);
  },

  addMessage: async (eventId: string, guestId: string, message: string): Promise<ApiResponse<GuestbookMessage>> => {
    const response = await fetch(`${API_BASE_URL}/events/${eventId}/guestbook`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ guestId, message }),
    });
    return handleResponse(response);
  },

  download: async (eventId: string): Promise<Blob> => {
    const response = await fetch(`${API_BASE_URL}/events/${eventId}/guestbook/download`, { headers: getHeaders() });
    return response.blob();
  },
};

// ==================== ANALYTICS ====================
export const analyticsApi = {
  getByEvent: async (eventId: string): Promise<ApiResponse<Analytics>> => {
    const response = await fetch(`${API_BASE_URL}/events/${eventId}/analytics`, { headers: getHeaders() });
    return handleResponse(response);
  },

  getOverview: async (): Promise<ApiResponse<{ totalEvents: number; totalGuests: number; totalConfirmed: number; upcomingEvents: number }>> => {
    const response = await fetch(`${API_BASE_URL}/analytics/overview`, { headers: getHeaders() });
    return handleResponse(response);
  },
};

// ==================== QR CODES ====================
export const qrCodeApi = {
  generate: async (guestId: string): Promise<ApiResponse<{ qrCode: string; code: string }>> => {
    const response = await fetch(`${API_BASE_URL}/qrcodes/generate`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ guestId }),
    });
    return handleResponse(response);
  },

  scan: async (code: string): Promise<ApiResponse<{ guest: Guest; isValid: boolean }>> => {
    const response = await fetch(`${API_BASE_URL}/qrcodes/scan`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ code }),
    });
    return handleResponse(response);
  },
};

// ==================== UTILISATEURS (Gestion des rôles) ====================
export const usersApi = {
  getAll: async (): Promise<ApiResponse<User[]>> => {
    const response = await fetch(`${API_BASE_URL}/users`, { headers: getHeaders() });
    return handleResponse(response);
  },

  getById: async (id: string): Promise<ApiResponse<User>> => {
    const response = await fetch(`${API_BASE_URL}/users/${id}`, { headers: getHeaders() });
    return handleResponse(response);
  },

  create: async (data: Partial<User> & { password: string }): Promise<ApiResponse<User>> => {
    const response = await fetch(`${API_BASE_URL}/users`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    return handleResponse(response);
  },

  update: async (id: string, data: Partial<User>): Promise<ApiResponse<User>> => {
    const response = await fetch(`${API_BASE_URL}/users/${id}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    return handleResponse(response);
  },

  updatePermissions: async (id: string, permissions: ModulePermission[]): Promise<ApiResponse<User>> => {
    const response = await fetch(`${API_BASE_URL}/users/${id}/permissions`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify({ permissions }),
    });
    return handleResponse(response);
  },

  delete: async (id: string): Promise<ApiResponse<void>> => {
    const response = await fetch(`${API_BASE_URL}/users/${id}`, {
      method: 'DELETE',
      headers: getHeaders(),
    });
    return handleResponse(response);
  },
};