// Service API pour communiquer avec le backend Node.js/Laravel
// Ce fichier contient les routes API et des données mock pour le développement

import type {
  Event,
  Guest,
  Invitation,
  GuestbookMessage,
  Analytics,
  Organizer,
  ApiResponse,
  PaginatedResponse,
} from '@/types/models';

// Configuration de l'API
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

// Headers par défaut
const getHeaders = () => ({
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${localStorage.getItem('token') || ''}`,
});

// Gestionnaire d'erreurs
const handleResponse = async <T>(response: Response): Promise<T> => {
  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Erreur serveur' }));
    throw new Error(error.message || 'Une erreur est survenue');
  }
  return response.json();
};

// ==================== MOCK DATA ====================

const mockOrganizer: Organizer = {
  id: '1',
  fullName: 'Marie Dupont',
  email: 'marie@example.com',
  phone: '+33 6 12 34 56 78',
  subscriptionType: 'premium',
  createdAt: '2024-01-15T10:00:00Z',
};

const mockEvents: Event[] = [
  {
    id: '1',
    organizerId: '1',
    title: 'Mariage de Sophie & Pierre',
    description: 'Célébration de notre union dans un cadre champêtre',
    location: 'Château de Versailles, France',
    date: '2024-06-15',
    startTime: '14:00',
    endTime: '23:00',
    coverImage: 'https://images.unsplash.com/photo-1519741497674-611481863552?w=800',
    theme: 'romantic',
    createdAt: '2024-01-10T10:00:00Z',
    updatedAt: '2024-01-10T10:00:00Z',
  },
  {
    id: '2',
    organizerId: '1',
    title: 'Anniversaire 30 ans - Lucas',
    description: 'Grande fête pour mes 30 ans avec tous mes amis',
    location: 'Rooftop Le Perchoir, Paris',
    date: '2024-07-22',
    startTime: '19:00',
    endTime: '02:00',
    coverImage: 'https://images.unsplash.com/photo-1530103862676-de8c9debad1d?w=800',
    theme: 'festive',
    createdAt: '2024-02-05T14:30:00Z',
    updatedAt: '2024-02-05T14:30:00Z',
  },
  {
    id: '3',
    organizerId: '1',
    title: 'Baptême de Léa',
    description: 'Cérémonie de baptême suivie d\'un déjeuner familial',
    location: 'Église Saint-Sulpice, Paris',
    date: '2024-05-10',
    startTime: '11:00',
    endTime: '17:00',
    coverImage: 'https://images.unsplash.com/photo-1469371670807-013ccf25f16a?w=800',
    theme: 'elegant',
    createdAt: '2024-03-01T09:00:00Z',
    updatedAt: '2024-03-01T09:00:00Z',
  },
];

const mockGuests: Guest[] = [
  { id: '1', eventId: '1', fullName: 'Jean Martin', phone: '+33 6 11 22 33 44', email: 'jean@email.com', status: 'confirmed', drinkPreference: 'Champagne', createdAt: '2024-01-11T10:00:00Z', updatedAt: '2024-01-11T10:00:00Z' },
  { id: '2', eventId: '1', fullName: 'Claire Dubois', phone: '+33 6 22 33 44 55', email: 'claire@email.com', status: 'confirmed', drinkPreference: 'Vin rouge', createdAt: '2024-01-11T10:00:00Z', updatedAt: '2024-01-11T10:00:00Z' },
  { id: '3', eventId: '1', fullName: 'Paul Bernard', phone: '+33 6 33 44 55 66', email: 'paul@email.com', status: 'pending', createdAt: '2024-01-11T10:00:00Z', updatedAt: '2024-01-11T10:00:00Z' },
  { id: '4', eventId: '1', fullName: 'Sophie Leroy', phone: '+33 6 44 55 66 77', email: 'sophie@email.com', status: 'declined', createdAt: '2024-01-11T10:00:00Z', updatedAt: '2024-01-11T10:00:00Z' },
  { id: '5', eventId: '1', fullName: 'Antoine Moreau', phone: '+33 6 55 66 77 88', email: 'antoine@email.com', status: 'confirmed', drinkPreference: 'Cocktail', createdAt: '2024-01-11T10:00:00Z', updatedAt: '2024-01-11T10:00:00Z' },
  { id: '6', eventId: '2', fullName: 'Emma Richard', phone: '+33 6 66 77 88 99', email: 'emma@email.com', status: 'confirmed', drinkPreference: 'Mojito', createdAt: '2024-02-06T10:00:00Z', updatedAt: '2024-02-06T10:00:00Z' },
  { id: '7', eventId: '2', fullName: 'Thomas Petit', phone: '+33 6 77 88 99 00', email: 'thomas@email.com', status: 'invited', createdAt: '2024-02-06T10:00:00Z', updatedAt: '2024-02-06T10:00:00Z' },
  { id: '8', eventId: '3', fullName: 'Julie Simon', phone: '+33 6 88 99 00 11', email: 'julie@email.com', status: 'confirmed', drinkPreference: 'Jus de fruits', createdAt: '2024-03-02T10:00:00Z', updatedAt: '2024-03-02T10:00:00Z' },
];

const mockGuestbookMessages: GuestbookMessage[] = [
  { id: '1', eventId: '1', guestId: '1', guestName: 'Jean Martin', message: 'Félicitations aux mariés ! Une journée magique que nous n\'oublierons jamais.', createdAt: '2024-06-15T20:00:00Z' },
  { id: '2', eventId: '1', guestId: '2', guestName: 'Claire Dubois', message: 'Tous mes vœux de bonheur ! La cérémonie était magnifique.', createdAt: '2024-06-15T20:30:00Z' },
  { id: '3', eventId: '1', guestId: '5', guestName: 'Antoine Moreau', message: 'Quelle belle fête ! Longue vie aux mariés ❤️', createdAt: '2024-06-15T21:00:00Z' },
  { id: '4', eventId: '2', guestId: '6', guestName: 'Emma Richard', message: 'Joyeux anniversaire Lucas ! 30 ans, c\'est le début d\'une nouvelle aventure !', createdAt: '2024-07-22T22:00:00Z' },
];

const mockAnalytics: Record<string, Analytics> = {
  '1': {
    id: 'a1',
    eventId: '1',
    totalInvitationsSent: 120,
    totalConfirmed: 85,
    totalDeclined: 15,
    totalPending: 20,
    preferredDrinksStats: { 'Champagne': 45, 'Vin rouge': 25, 'Vin blanc': 15, 'Cocktail': 10, 'Sans alcool': 5 },
    lastUpdated: '2024-06-14T18:00:00Z',
  },
  '2': {
    id: 'a2',
    eventId: '2',
    totalInvitationsSent: 50,
    totalConfirmed: 35,
    totalDeclined: 5,
    totalPending: 10,
    preferredDrinksStats: { 'Mojito': 15, 'Bière': 10, 'Whisky': 5, 'Cocktail': 5 },
    lastUpdated: '2024-07-20T18:00:00Z',
  },
  '3': {
    id: 'a3',
    eventId: '3',
    totalInvitationsSent: 30,
    totalConfirmed: 28,
    totalDeclined: 1,
    totalPending: 1,
    preferredDrinksStats: { 'Jus de fruits': 15, 'Eau': 8, 'Champagne': 5 },
    lastUpdated: '2024-05-08T18:00:00Z',
  },
};

// ==================== API ROUTES ====================

// Mode mock (désactiver pour utiliser le vrai backend)
const USE_MOCK = true;

// --- Authentification ---
export const authApi = {
  login: async (email: string, password: string): Promise<ApiResponse<{ token: string; organizer: Organizer }>> => {
    if (USE_MOCK) {
      await new Promise(resolve => setTimeout(resolve, 500));
      return { success: true, data: { token: 'mock-jwt-token', organizer: mockOrganizer } };
    }
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    return handleResponse(response);
  },

  register: async (data: Partial<Organizer> & { password: string }): Promise<ApiResponse<Organizer>> => {
    if (USE_MOCK) {
      await new Promise(resolve => setTimeout(resolve, 500));
      return { success: true, data: mockOrganizer };
    }
    const response = await fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return handleResponse(response);
  },

  me: async (): Promise<ApiResponse<Organizer>> => {
    if (USE_MOCK) {
      await new Promise(resolve => setTimeout(resolve, 300));
      return { success: true, data: mockOrganizer };
    }
    const response = await fetch(`${API_BASE_URL}/auth/me`, {
      headers: getHeaders(),
    });
    return handleResponse(response);
  },
};

// --- Événements ---
export const eventsApi = {
  getAll: async (): Promise<ApiResponse<Event[]>> => {
    if (USE_MOCK) {
      await new Promise(resolve => setTimeout(resolve, 400));
      return { success: true, data: mockEvents };
    }
    const response = await fetch(`${API_BASE_URL}/events`, {
      headers: getHeaders(),
    });
    return handleResponse(response);
  },

  getById: async (id: string): Promise<ApiResponse<Event>> => {
    if (USE_MOCK) {
      await new Promise(resolve => setTimeout(resolve, 300));
      const event = mockEvents.find(e => e.id === id);
      if (!event) throw new Error('Événement non trouvé');
      return { success: true, data: event };
    }
    const response = await fetch(`${API_BASE_URL}/events/${id}`, {
      headers: getHeaders(),
    });
    return handleResponse(response);
  },

  create: async (data: Partial<Event>): Promise<ApiResponse<Event>> => {
    if (USE_MOCK) {
      await new Promise(resolve => setTimeout(resolve, 500));
      const newEvent: Event = {
        id: String(mockEvents.length + 1),
        organizerId: '1',
        title: data.title || '',
        description: data.description || '',
        location: data.location || '',
        date: data.date || '',
        startTime: data.startTime || '',
        endTime: data.endTime || '',
        theme: data.theme || 'elegant',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      mockEvents.push(newEvent);
      return { success: true, data: newEvent };
    }
    const response = await fetch(`${API_BASE_URL}/events`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    return handleResponse(response);
  },

  update: async (id: string, data: Partial<Event>): Promise<ApiResponse<Event>> => {
    if (USE_MOCK) {
      await new Promise(resolve => setTimeout(resolve, 400));
      const index = mockEvents.findIndex(e => e.id === id);
      if (index === -1) throw new Error('Événement non trouvé');
      mockEvents[index] = { ...mockEvents[index], ...data, updatedAt: new Date().toISOString() };
      return { success: true, data: mockEvents[index] };
    }
    const response = await fetch(`${API_BASE_URL}/events/${id}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    return handleResponse(response);
  },

  delete: async (id: string): Promise<ApiResponse<void>> => {
    if (USE_MOCK) {
      await new Promise(resolve => setTimeout(resolve, 300));
      const index = mockEvents.findIndex(e => e.id === id);
      if (index !== -1) mockEvents.splice(index, 1);
      return { success: true, data: undefined };
    }
    const response = await fetch(`${API_BASE_URL}/events/${id}`, {
      method: 'DELETE',
      headers: getHeaders(),
    });
    return handleResponse(response);
  },
};

// --- Invités ---
export const guestsApi = {
  getByEvent: async (eventId: string): Promise<ApiResponse<Guest[]>> => {
    if (USE_MOCK) {
      await new Promise(resolve => setTimeout(resolve, 400));
      return { success: true, data: mockGuests.filter(g => g.eventId === eventId) };
    }
    const response = await fetch(`${API_BASE_URL}/events/${eventId}/guests`, {
      headers: getHeaders(),
    });
    return handleResponse(response);
  },

  getAll: async (): Promise<ApiResponse<Guest[]>> => {
    if (USE_MOCK) {
      await new Promise(resolve => setTimeout(resolve, 400));
      return { success: true, data: mockGuests };
    }
    const response = await fetch(`${API_BASE_URL}/guests`, {
      headers: getHeaders(),
    });
    return handleResponse(response);
  },

  create: async (eventId: string, data: Partial<Guest>): Promise<ApiResponse<Guest>> => {
    if (USE_MOCK) {
      await new Promise(resolve => setTimeout(resolve, 500));
      const newGuest: Guest = {
        id: String(mockGuests.length + 1),
        eventId,
        fullName: data.fullName || '',
        phone: data.phone || '',
        email: data.email || '',
        status: 'invited',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      mockGuests.push(newGuest);
      return { success: true, data: newGuest };
    }
    const response = await fetch(`${API_BASE_URL}/events/${eventId}/guests`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    return handleResponse(response);
  },

  update: async (id: string, data: Partial<Guest>): Promise<ApiResponse<Guest>> => {
    if (USE_MOCK) {
      await new Promise(resolve => setTimeout(resolve, 400));
      const index = mockGuests.findIndex(g => g.id === id);
      if (index === -1) throw new Error('Invité non trouvé');
      mockGuests[index] = { ...mockGuests[index], ...data, updatedAt: new Date().toISOString() };
      return { success: true, data: mockGuests[index] };
    }
    const response = await fetch(`${API_BASE_URL}/guests/${id}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    return handleResponse(response);
  },

  delete: async (id: string): Promise<ApiResponse<void>> => {
    if (USE_MOCK) {
      await new Promise(resolve => setTimeout(resolve, 300));
      const index = mockGuests.findIndex(g => g.id === id);
      if (index !== -1) mockGuests.splice(index, 1);
      return { success: true, data: undefined };
    }
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

// --- Invitations ---
export const invitationsApi = {
  send: async (guestId: string, method: Invitation['distributionMethod']): Promise<ApiResponse<Invitation>> => {
    if (USE_MOCK) {
      await new Promise(resolve => setTimeout(resolve, 600));
      const guest = mockGuests.find(g => g.id === guestId);
      return {
        success: true,
        data: {
          id: `inv-${guestId}`,
          eventId: guest?.eventId || '1',
          guestId,
          themeColor: '#D4AF37',
          sentAt: new Date().toISOString(),
          distributionMethod: method,
        },
      };
    }
    const response = await fetch(`${API_BASE_URL}/invitations/send`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ guestId, method }),
    });
    return handleResponse(response);
  },

  sendBulk: async (guestIds: string[], method: Invitation['distributionMethod']): Promise<ApiResponse<Invitation[]>> => {
    if (USE_MOCK) {
      await new Promise(resolve => setTimeout(resolve, 1000));
      const invitations = guestIds.map(guestId => {
        const guest = mockGuests.find(g => g.id === guestId);
        return {
          id: `inv-${guestId}`,
          eventId: guest?.eventId || '1',
          guestId,
          themeColor: '#D4AF37',
          sentAt: new Date().toISOString(),
          distributionMethod: method,
        };
      });
      return { success: true, data: invitations };
    }
    const response = await fetch(`${API_BASE_URL}/invitations/send-bulk`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ guestIds, method }),
    });
    return handleResponse(response);
  },
};

// --- Livre d'or ---
export const guestbookApi = {
  getByEvent: async (eventId: string): Promise<ApiResponse<GuestbookMessage[]>> => {
    if (USE_MOCK) {
      await new Promise(resolve => setTimeout(resolve, 400));
      return { success: true, data: mockGuestbookMessages.filter(m => m.eventId === eventId) };
    }
    const response = await fetch(`${API_BASE_URL}/events/${eventId}/guestbook`, {
      headers: getHeaders(),
    });
    return handleResponse(response);
  },

  addMessage: async (eventId: string, guestId: string, message: string): Promise<ApiResponse<GuestbookMessage>> => {
    if (USE_MOCK) {
      await new Promise(resolve => setTimeout(resolve, 500));
      const guest = mockGuests.find(g => g.id === guestId);
      const newMessage: GuestbookMessage = {
        id: String(mockGuestbookMessages.length + 1),
        eventId,
        guestId,
        guestName: guest?.fullName,
        message,
        createdAt: new Date().toISOString(),
      };
      mockGuestbookMessages.push(newMessage);
      return { success: true, data: newMessage };
    }
    const response = await fetch(`${API_BASE_URL}/events/${eventId}/guestbook`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ guestId, message }),
    });
    return handleResponse(response);
  },

  download: async (eventId: string): Promise<Blob> => {
    if (USE_MOCK) {
      await new Promise(resolve => setTimeout(resolve, 800));
      const messages = mockGuestbookMessages.filter(m => m.eventId === eventId);
      const content = messages.map(m => `${m.guestName}: ${m.message}`).join('\n\n');
      return new Blob([content], { type: 'text/plain' });
    }
    const response = await fetch(`${API_BASE_URL}/events/${eventId}/guestbook/download`, {
      headers: getHeaders(),
    });
    return response.blob();
  },
};

// --- Analytics ---
export const analyticsApi = {
  getByEvent: async (eventId: string): Promise<ApiResponse<Analytics>> => {
    if (USE_MOCK) {
      await new Promise(resolve => setTimeout(resolve, 400));
      const analytics = mockAnalytics[eventId];
      if (!analytics) {
        return {
          success: true,
          data: {
            id: `a-${eventId}`,
            eventId,
            totalInvitationsSent: 0,
            totalConfirmed: 0,
            totalDeclined: 0,
            totalPending: 0,
            preferredDrinksStats: {},
            lastUpdated: new Date().toISOString(),
          },
        };
      }
      return { success: true, data: analytics };
    }
    const response = await fetch(`${API_BASE_URL}/events/${eventId}/analytics`, {
      headers: getHeaders(),
    });
    return handleResponse(response);
  },

  getOverview: async (): Promise<ApiResponse<{ totalEvents: number; totalGuests: number; totalConfirmed: number; upcomingEvents: number }>> => {
    if (USE_MOCK) {
      await new Promise(resolve => setTimeout(resolve, 400));
      return {
        success: true,
        data: {
          totalEvents: mockEvents.length,
          totalGuests: mockGuests.length,
          totalConfirmed: mockGuests.filter(g => g.status === 'confirmed').length,
          upcomingEvents: mockEvents.filter(e => new Date(e.date) > new Date()).length,
        },
      };
    }
    const response = await fetch(`${API_BASE_URL}/analytics/overview`, {
      headers: getHeaders(),
    });
    return handleResponse(response);
  },
};

// --- QR Codes ---
export const qrCodeApi = {
  generate: async (guestId: string): Promise<ApiResponse<{ qrCode: string; code: string }>> => {
    if (USE_MOCK) {
      await new Promise(resolve => setTimeout(resolve, 500));
      const code = `QR-${guestId}-${Date.now()}`;
      return {
        success: true,
        data: {
          qrCode: `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${code}`,
          code,
        },
      };
    }
    const response = await fetch(`${API_BASE_URL}/qrcodes/generate`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ guestId }),
    });
    return handleResponse(response);
  },

  scan: async (code: string): Promise<ApiResponse<{ guest: Guest; isValid: boolean }>> => {
    if (USE_MOCK) {
      await new Promise(resolve => setTimeout(resolve, 400));
      const guestId = code.split('-')[1];
      const guest = mockGuests.find(g => g.id === guestId);
      return {
        success: true,
        data: {
          guest: guest || mockGuests[0],
          isValid: !!guest,
        },
      };
    }
    const response = await fetch(`${API_BASE_URL}/qrcodes/scan`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ code }),
    });
    return handleResponse(response);
  },
};
