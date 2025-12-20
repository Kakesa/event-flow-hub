/* eslint-disable @typescript-eslint/no-explicit-any */
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

// ==================== CONFIG ====================
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const getHeaders = (isJson: boolean = true) => ({
  ...(isJson ? { 'Content-Type': 'application/json' } : {}),
  Authorization: `Bearer ${localStorage.getItem('token') || ''}`,
});

// ==================== RESPONSE HANDLER ====================
const handleResponse = async <T>(response: Response): Promise<T> => {
  const text = await response.text();
  let data: any = {};

  try {
    data = text ? JSON.parse(text) : {};
  } catch {
    data = { message: text || 'Erreur serveur' };
  }

  if (!response.ok) {
    console.error('API ERROR:', response.status, data);
    throw new Error(data.message || 'Une erreur est survenue');
  }

  return data;
};

// ==================== AUTH ====================
export const authApi = {
  register: async (data: {
    name: string;
    email: string;
    phone?: string;
    password: string;
  }): Promise<ApiResponse<{ token: string; user: User }>> => {
    const payload: any = {
      name: data.name.trim(),
      email: data.email.trim().toLowerCase(),
      password: data.password,
    };
    if (data.phone?.trim()) payload.phone = data.phone.trim();

    const res = await fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(payload),
    });

    const result = await handleResponse<{ success: boolean; data: any }>(res);
    return { success: result.success ?? true, data: result.data };
  },

  login: async (email: string, password: string): Promise<ApiResponse<{ token: string; user: User }>> => {
    const res = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ email: email.trim().toLowerCase(), password }),
    });

    const result = await handleResponse<{ success: boolean; data: any }>(res);
    return { success: result.success ?? true, data: result.data };
  },

  me: async (): Promise<ApiResponse<User>> => {
    const res = await fetch(`${API_BASE_URL}/auth/me`, { headers: getHeaders() });
    const result = await handleResponse<{ success: boolean; data: any }>(res);
    return { success: result.success ?? true, data: result.data };
  },
};

// ==================== ÉVÉNEMENTS ====================
export const eventsApi = {
  getAll: async (): Promise<ApiResponse<Event[]>> => {
    const res = await fetch(`${API_BASE_URL}/events`, { headers: getHeaders() });
    const result = await handleResponse<{ success: boolean; data: any[] }>(res);

    // On garde l'id tel qu'il est dans la DB (pas besoin de le renommer)
    const events: Event[] = result.data || [];
    return { success: result.success ?? true, data: events };
  },

  getById: async (id: string): Promise<ApiResponse<Event>> => {
    const res = await fetch(`${API_BASE_URL}/events/${id}`, { headers: getHeaders() });
    const result = await handleResponse<{ success: boolean; data: any }>(res);
    return { success: result.success ?? true, data: result.data };
  },

  create: async (data: FormData): Promise<ApiResponse<Event>> => {
    const res = await fetch(`${API_BASE_URL}/events`, {
      method: 'POST',
      headers: getHeaders(false),
      body: data,
    });
    const result = await handleResponse<{ success: boolean; data: any }>(res);
    return { success: result.success ?? true, data: result.data };
  },

  update: async (id: string, data: FormData): Promise<ApiResponse<Event>> => {
    const res = await fetch(`${API_BASE_URL}/events/${id}`, {
      method: 'PUT',
      headers: getHeaders(false),
      body: data,
    });
    const result = await handleResponse<{ success: boolean; data: any }>(res);
    return { success: result.success ?? true, data: result.data };
  },

  delete: async (id: string): Promise<ApiResponse<void>> => {
    const res = await fetch(`${API_BASE_URL}/events/${id}`, {
      method: 'DELETE',
      headers: getHeaders(),
    });
    const result = await handleResponse<{ success: boolean; data?: any }>(res);
    return { success: result.success ?? true, data: undefined };
  },
};


// ==================== INVITÉS ====================
export const guestsApi = {
  getAll: async (): Promise<ApiResponse<Guest[]>> => {
    const res = await fetch(`${API_BASE_URL}/guests`, { headers: getHeaders() });
    const result = await handleResponse<{ success: boolean; data: any[] }>(res);
    const guests: Guest[] = result.data?.map(g => ({ ...g, id: g._id })) || [];
    return { success: result.success ?? true, data: guests };
  },

  getByEvent: async (eventId: string): Promise<ApiResponse<Guest[]>> => {
    const res = await fetch(`${API_BASE_URL}/events/${eventId}/guests`, { headers: getHeaders() });
    const result = await handleResponse<{ success: boolean; data: any[] }>(res);
    const guests: Guest[] = result.data?.map(g => ({ ...g, id: g._id })) || [];
    return { success: result.success ?? true, data: guests };
  },

  create: async (eventId: string, data: Partial<Guest>): Promise<ApiResponse<Guest>> => {
    const res = await fetch(`${API_BASE_URL}/events/${eventId}/guests`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    const result = await handleResponse<{ success: boolean; data: any }>(res);
    const guest: Guest = { ...result.data, id: result.data._id };
    return { success: result.success ?? true, data: guest };
  },

  update: async (id: string, data: Partial<Guest>): Promise<ApiResponse<Guest>> => {
    const res = await fetch(`${API_BASE_URL}/guests/${id}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    const result = await handleResponse<{ success: boolean; data: any }>(res);
    const guest: Guest = { ...result.data, id: result.data._id };
    return { success: result.success ?? true, data: guest };
  },

  delete: async (id: string): Promise<ApiResponse<void>> => {
    const res = await fetch(`${API_BASE_URL}/guests/${id}`, {
      method: 'DELETE',
      headers: getHeaders(),
    });
    const result = await handleResponse<{ success: boolean; data?: any }>(res);
    return { success: result.success ?? true, data: undefined };
  },

  updateStatus: async (id: string, status: Guest['status']): Promise<ApiResponse<Guest>> =>
    guestsApi.update(id, { status }),
};

// ==================== INVITATIONS ====================
export const invitationsApi = {
  send: async (guestId: string, method: Invitation['distributionMethod']): Promise<ApiResponse<Invitation>> => {
    const res = await fetch(`${API_BASE_URL}/invitations/send`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ guestId, method }),
    });
    const result = await handleResponse<{ success: boolean; data: any }>(res);
    return { success: result.success ?? true, data: result.data };
  },

  sendBulk: async (guestIds: string[], method: Invitation['distributionMethod']): Promise<ApiResponse<Invitation[]>> => {
    const res = await fetch(`${API_BASE_URL}/invitations/send-bulk`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ guestIds, method }),
    });
    const result = await handleResponse<{ success: boolean; data: any[] }>(res);
    return { success: result.success ?? true, data: result.data };
  },
};

// ==================== LIVRE D'OR ====================
export const guestbookApi = {
  getByEvent: async (eventId: string): Promise<ApiResponse<GuestbookMessage[]>> => {
    const res = await fetch(`${API_BASE_URL}/events/${eventId}/guestbook`, { headers: getHeaders() });
    const result = await handleResponse<{ success: boolean; data: any[] }>(res);
    return { success: result.success ?? true, data: result.data };
  },

  addMessage: async (eventId: string, guestId: string, message: string): Promise<ApiResponse<GuestbookMessage>> => {
    const res = await fetch(`${API_BASE_URL}/events/${eventId}/guestbook`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ guestId, message }),
    });
    const result = await handleResponse<{ success: boolean; data: any }>(res);
    return { success: result.success ?? true, data: result.data };
  },

  download: async (eventId: string): Promise<Blob> =>
    fetch(`${API_BASE_URL}/events/${eventId}/guestbook/download`, { headers: getHeaders() }).then(r => r.blob()),
};

// ==================== ANALYTICS ====================
export const analyticsApi = {
  getByEvent: async (eventId: string): Promise<ApiResponse<Analytics>> => {
    const res = await fetch(`${API_BASE_URL}/events/${eventId}/analytics`, { headers: getHeaders() });
    const result = await handleResponse<{ success: boolean; data: any }>(res);
    return { success: result.success ?? true, data: result.data };
  },

  getOverview: async (): Promise<ApiResponse<{ totalEvents: number; totalGuests: number; totalConfirmed: number; upcomingEvents: number }>> => {
    const res = await fetch(`${API_BASE_URL}/analytics/overview`, { headers: getHeaders() });
    const result = await handleResponse<{ success: boolean; data: any }>(res);
    return { success: result.success ?? true, data: result.data };
  },
};

// ==================== QR CODES ====================
export const qrCodeApi = {
  generate: async (guestId: string): Promise<ApiResponse<{ qrCode: string; code: string }>> => {
    const res = await fetch(`${API_BASE_URL}/qrcodes/generate`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ guestId }),
    });
    const result = await handleResponse<{ success: boolean; data: any }>(res);
    return { success: result.success ?? true, data: result.data };
  },

  scan: async (code: string): Promise<ApiResponse<{ guest: Guest; isValid: boolean }>> => {
    const res = await fetch(`${API_BASE_URL}/qrcodes/scan`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ code }),
    });
    const result = await handleResponse<{ success: boolean; data: any }>(res);
    return { success: result.success ?? true, data: result.data };
  },
};

// ==================== UTILISATEURS (ROLES & PERMISSIONS) ====================
export const usersApi = {
  getAll: async (): Promise<ApiResponse<User[]>> => {
    const res = await fetch(`${API_BASE_URL}/auth/users`, { headers: getHeaders() });
    const result = await handleResponse<{ success: boolean; data: any[] }>(res);
    return { success: result.success ?? true, data: result.data };
  },

  getById: async (id: string): Promise<ApiResponse<User>> => {
    const res = await fetch(`${API_BASE_URL}/auth/users/${id}`, { headers: getHeaders() });
    const result = await handleResponse<{ success: boolean; data: any }>(res);
    return { success: result.success ?? true, data: result.data };
  },

  create: async (data: Partial<User> & { password: string }): Promise<ApiResponse<User>> => {
    const res = await fetch(`${API_BASE_URL}/auth/users`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    const result = await handleResponse<{ success: boolean; data: any }>(res);
    return { success: result.success ?? true, data: result.data };
  },

  update: async (id: string, data: Partial<User>): Promise<ApiResponse<User>> => {
    const res = await fetch(`${API_BASE_URL}/auth/users/${id}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    const result = await handleResponse<{ success: boolean; data: any }>(res);
    return { success: result.success ?? true, data: result.data };
  },

  updatePermissions: async (id: string, permissions: ModulePermission[]): Promise<ApiResponse<User>> => {
    const res = await fetch(`${API_BASE_URL}/auth/users/${id}/permissions`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify({ permissions }),
    });
    const result = await handleResponse<{ success: boolean; data: any }>(res);
    return { success: result.success ?? true, data: result.data };
  },

  delete: async (id: string): Promise<ApiResponse<void>> => {
    const res = await fetch(`${API_BASE_URL}/auth/users/${id}`, {
      method: 'DELETE',
      headers: getHeaders(),
    });
    const result = await handleResponse<{ success: boolean; data?: any }>(res);
    return { success: result.success ?? true, data: undefined };
  },
};
