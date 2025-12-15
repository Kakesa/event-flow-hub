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
const API_BASE_URL =
  import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const getHeaders = () => ({
  'Content-Type': 'application/json',
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

    const response = await fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    return handleResponse(response);
  },

  login: async (
    email: string,
    password: string
  ): Promise<ApiResponse<{ token: string; user: User }>> => {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: email.trim().toLowerCase(),
        password,
      }),
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
  getAll: async (): Promise<ApiResponse<Event[]>> =>
    handleResponse(
      await fetch(`${API_BASE_URL}/events`, { headers: getHeaders() })
    ),

  getById: async (id: string): Promise<ApiResponse<Event>> =>
    handleResponse(
      await fetch(`${API_BASE_URL}/events/${id}`, { headers: getHeaders() })
    ),

  create: async (data: Partial<Event>): Promise<ApiResponse<Event>> =>
    handleResponse(
      await fetch(`${API_BASE_URL}/events`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(data),
      })
    ),

  update: async (id: string, data: Partial<Event>): Promise<ApiResponse<Event>> =>
    handleResponse(
      await fetch(`${API_BASE_URL}/events/${id}`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify(data),
      })
    ),

  delete: async (id: string): Promise<ApiResponse<void>> =>
    handleResponse(
      await fetch(`${API_BASE_URL}/events/${id}`, {
        method: 'DELETE',
        headers: getHeaders(),
      })
    ),
};

// ==================== INVITÉS ====================
export const guestsApi = {
  getAll: async (): Promise<ApiResponse<Guest[]>> =>
    handleResponse(
      await fetch(`${API_BASE_URL}/guests`, { headers: getHeaders() })
    ),

  getByEvent: async (eventId: string): Promise<ApiResponse<Guest[]>> =>
    handleResponse(
      await fetch(`${API_BASE_URL}/events/${eventId}/guests`, {
        headers: getHeaders(),
      })
    ),

  create: async (
    eventId: string,
    data: Partial<Guest>
  ): Promise<ApiResponse<Guest>> =>
    handleResponse(
      await fetch(`${API_BASE_URL}/events/${eventId}/guests`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(data),
      })
    ),

  update: async (
    id: string,
    data: Partial<Guest>
  ): Promise<ApiResponse<Guest>> =>
    handleResponse(
      await fetch(`${API_BASE_URL}/guests/${id}`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify(data),
      })
    ),

  delete: async (id: string): Promise<ApiResponse<void>> =>
    handleResponse(
      await fetch(`${API_BASE_URL}/guests/${id}`, {
        method: 'DELETE',
        headers: getHeaders(),
      })
    ),

  updateStatus: async (
    id: string,
    status: Guest['status']
  ): Promise<ApiResponse<Guest>> => guestsApi.update(id, { status }),
};

// ==================== INVITATIONS ====================
export const invitationsApi = {
  send: async (
    guestId: string,
    method: Invitation['distributionMethod']
  ): Promise<ApiResponse<Invitation>> =>
    handleResponse(
      await fetch(`${API_BASE_URL}/invitations/send`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ guestId, method }),
      })
    ),

  sendBulk: async (
    guestIds: string[],
    method: Invitation['distributionMethod']
  ): Promise<ApiResponse<Invitation[]>> =>
    handleResponse(
      await fetch(`${API_BASE_URL}/invitations/send-bulk`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ guestIds, method }),
      })
    ),
};

// ==================== LIVRE D'OR ====================
export const guestbookApi = {
  getByEvent: async (
    eventId: string
  ): Promise<ApiResponse<GuestbookMessage[]>> =>
    handleResponse(
      await fetch(`${API_BASE_URL}/events/${eventId}/guestbook`, {
        headers: getHeaders(),
      })
    ),

  addMessage: async (
    eventId: string,
    guestId: string,
    message: string
  ): Promise<ApiResponse<GuestbookMessage>> =>
    handleResponse(
      await fetch(`${API_BASE_URL}/events/${eventId}/guestbook`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ guestId, message }),
      })
    ),

  download: async (eventId: string): Promise<Blob> =>
    fetch(`${API_BASE_URL}/events/${eventId}/guestbook/download`, {
      headers: getHeaders(),
    }).then((r) => r.blob()),
};

// ==================== ANALYTICS ====================
export const analyticsApi = {
  getByEvent: async (
    eventId: string
  ): Promise<ApiResponse<Analytics>> =>
    handleResponse(
      await fetch(`${API_BASE_URL}/events/${eventId}/analytics`, {
        headers: getHeaders(),
      })
    ),

  getOverview: async (): Promise<
    ApiResponse<{
      totalEvents: number;
      totalGuests: number;
      totalConfirmed: number;
      upcomingEvents: number;
    }>
  > =>
    handleResponse(
      await fetch(`${API_BASE_URL}/analytics/overview`, {
        headers: getHeaders(),
      })
    ),
};

// ==================== QR CODES ====================
export const qrCodeApi = {
  generate: async (
    guestId: string
  ): Promise<ApiResponse<{ qrCode: string; code: string }>> =>
    handleResponse(
      await fetch(`${API_BASE_URL}/qrcodes/generate`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ guestId }),
      })
    ),

  scan: async (
    code: string
  ): Promise<ApiResponse<{ guest: Guest; isValid: boolean }>> =>
    handleResponse(
      await fetch(`${API_BASE_URL}/qrcodes/scan`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ code }),
      })
    ),
};

// ==================== UTILISATEURS (ROLES & PERMISSIONS) ====================
export const usersApi = {
  // ✅ PAGINATION READY
 getAll: async (): Promise<ApiResponse<User[]>> => {
    const response = await fetch(
      `${API_BASE_URL}/auth/users`,
      {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token') || ''}`,
        },
      }
    );

    return handleResponse(response);
  },

  getById: async (id: string): Promise<ApiResponse<User>> =>
    handleResponse(
      await fetch(`${API_BASE_URL}/auth/users/${id}`, {
        headers: getHeaders(),
      })
    ),

  create: async (
    data: Partial<User> & { password: string }
  ): Promise<ApiResponse<User>> =>
    handleResponse(
      await fetch(`${API_BASE_URL}/auth/users`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(data),
      })
    ),

  update: async (
    id: string,
    data: Partial<User>
  ): Promise<ApiResponse<User>> =>
    handleResponse(
      await fetch(`${API_BASE_URL}/auth/users/${id}`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify(data),
      })
    ),

  updatePermissions: async (
    id: string,
    permissions: ModulePermission[]
  ): Promise<ApiResponse<User>> =>
    handleResponse(
      await fetch(`${API_BASE_URL}/auth/users/${id}/permissions`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify({ permissions }),
      })
    ),

  delete: async (id: string): Promise<ApiResponse<void>> =>
    handleResponse(
      await fetch(`${API_BASE_URL}/auth/users/${id}`, {
        method: 'DELETE',
        headers: getHeaders(),
      })
    ),
};
