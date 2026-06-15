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
} from "@/types/models";
import { API_BASE_URL, BASE_URL } from "@/config/env";

export { API_BASE_URL, BASE_URL, resolveAssetUrl } from "@/config/env";

const getHeaders = (isJson: boolean = true) => ({
  ...(isJson ? { "Content-Type": "application/json" } : {}),
  Authorization: `Bearer ${localStorage.getItem("token") || ""}`,
});

// ==================== RESPONSE HANDLER ====================
const handleResponse = async <T>(response: Response): Promise<T> => {
  const text = await response.text();
  let data: any = {};

  try {
    data = text ? JSON.parse(text) : {};
  } catch {
    data = { message: text || "Erreur serveur" };
  }

  if (!response.ok) {
    console.error("API ERROR:", response.status, data);
    throw new Error(data.message || "Une erreur est survenue");
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
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify(payload),
    });

    const result = await handleResponse<{ success: boolean; data: any }>(res);
    return { success: result.success ?? true, data: result.data };
  },

  login: async (
    email: string,
    password: string,
  ): Promise<ApiResponse<{ token: string; user: User }>> => {
    const res = await fetch(`${API_BASE_URL}/auth/login`, {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify({ email: email.trim().toLowerCase(), password }),
    });

    const result = await handleResponse<{ success: boolean; data: any }>(res);
    return { success: result.success ?? true, data: result.data };
  },

  me: async (): Promise<ApiResponse<User>> => {
    const res = await fetch(`${API_BASE_URL}/auth/me`, {
      headers: getHeaders(),
    });
    const result = await handleResponse<{ success: boolean; data: any }>(res);
    return { success: result.success ?? true, data: result.data };
  },
};

// ==================== ÉVÉNEMENTS ====================
export const eventsApi = {
  getAll: async (): Promise<ApiResponse<Event[]>> => {
    const res = await fetch(`${API_BASE_URL}/events`, {
      headers: getHeaders(),
    });
    const result = await handleResponse<{ success: boolean; data: any[] }>(res);

    // On garde l'id tel qu'il est dans la DB (pas besoin de le renommer)
    const events: Event[] = result.data || [];
    return { success: result.success ?? true, data: events };
  },

  getById: async (id: string): Promise<ApiResponse<Event>> => {
    const res = await fetch(`${API_BASE_URL}/events/${id}`, {
      headers: getHeaders(),
    });
    const result = await handleResponse<{ success: boolean; data: any }>(res);
    return { success: result.success ?? true, data: result.data };
  },

  create: async (data: FormData): Promise<ApiResponse<Event>> => {
    const res = await fetch(`${API_BASE_URL}/events`, {
      method: "POST",
      headers: getHeaders(false),
      body: data,
    });
    const result = await handleResponse<{ success: boolean; data: any }>(res);
    return { success: result.success ?? true, data: result.data };
  },

  update: async (id: string, data: FormData): Promise<ApiResponse<Event>> => {
    const res = await fetch(`${API_BASE_URL}/events/${id}`, {
      method: "PUT",
      headers: getHeaders(false),
      body: data,
    });
    const result = await handleResponse<{ success: boolean; data: any }>(res);
    return { success: result.success ?? true, data: result.data };
  },

  delete: async (id: string): Promise<ApiResponse<void>> => {
    const res = await fetch(`${API_BASE_URL}/events/${id}`, {
      method: "DELETE",
      headers: getHeaders(),
    });
    const result = await handleResponse<{ success: boolean; data?: any }>(res);
    return { success: result.success ?? true, data: undefined };
  },

  // ✨ SUPERADMIN ONLY: Get all events from all admins
  getAllFromAllAdmins: async (): Promise<ApiResponse<Event[]>> => {
    const res = await fetch(`${API_BASE_URL}/events/all`, {
      headers: getHeaders(),
    });
    const result = await handleResponse<{ success: boolean; data: any[] }>(res);
    const events: Event[] = result.data || [];
    return { success: result.success ?? true, data: events };
  },

  // 🌍 PUBLIC: Get event by ID (no auth)
  getByIdPublic: async (id: string): Promise<ApiResponse<Event>> => {
    const res = await fetch(`${API_BASE_URL}/public/events/${id}`, {
      headers: {
        "Content-Type": "application/json",
      },
    });
    const result = await handleResponse<{ success: boolean; data: any }>(res);
    return { success: result.success ?? true, data: result.data };
  },

  // 🌍 PUBLIC: Get event by slug (no auth)
  getBySlugPublic: async (slug: string): Promise<ApiResponse<Event>> => {
    const res = await fetch(`${API_BASE_URL}/events/public/${slug}`, {
      headers: {
        "Content-Type": "application/json",
      },
    });
    const result = await handleResponse<{ success: boolean; data: any }>(res);
    return { success: result.success ?? true, data: result.data };
  },
};

// ==================== INVITÉS ====================
export const guestsApi = {
  // ❌ supprimé : getAll (route inexistante)

  // ✅ GET /guests/event/:eventId
  getByEvent: async (eventId: string): Promise<ApiResponse<Guest[]>> => {
    const res = await fetch(`${API_BASE_URL}/guests/event/${eventId}`, {
      headers: getHeaders(),
    });

    const result = await handleResponse<{ success: boolean; data: any[] }>(res);
    const guests: Guest[] =
      result.data?.map((g) => ({ ...g, id: g._id })) || [];

    return { success: result.success ?? true, data: guests };
  },

  // ✅ POST /guests
  create: async (
    _eventId: string,
    data: Partial<Guest>,
  ): Promise<ApiResponse<Guest>> => {
    const res = await fetch(`${API_BASE_URL}/guests`, {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify(data),
    });

    const result = await handleResponse<{ success: boolean; data: any }>(res);
    const guest: Guest = { ...result.data, id: result.data._id };

    return { success: result.success ?? true, data: guest };
  },

  // ✅ PATCH /guests/:id
  update: async (
    id: string,
    data: Partial<Guest>,
  ): Promise<ApiResponse<Guest>> => {
    const res = await fetch(`${API_BASE_URL}/guests/${id}`, {
      method: "PATCH",
      headers: getHeaders(),
      body: JSON.stringify(data),
    });

    const result = await handleResponse<{ success: boolean; data: any }>(res);
    const guest: Guest = { ...result.data, id: result.data._id };

    return { success: result.success ?? true, data: guest };
  },

  // ✅ DELETE /guests/:id
  delete: async (id: string): Promise<ApiResponse<void>> => {
    const res = await fetch(`${API_BASE_URL}/guests/${id}`, {
      method: "DELETE",
      headers: getHeaders(),
    });

    const result = await handleResponse<{ success: boolean }>(res);
    return { success: result.success ?? true, data: undefined };
  },

  // ✅ helper
  updateStatus: async (id: string, status: Guest["status"]) =>
    guestsApi.update(id, { status }),

  // 🌍 RSVP PUBLIC
  updatePublic: async (
    id: string,
    data: Partial<Guest>,
  ): Promise<ApiResponse<Guest>> => {
    const res = await fetch(`${API_BASE_URL}/guests/public/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    const result = await handleResponse<{ success: boolean; data: any }>(res);
    const guest: Guest = { ...result.data, id: result.data._id };

    return { success: result.success ?? true, data: guest };
  },
};

// ==================== RSVP PUBLIC ====================

type RSVPStatus = "confirmed" | "declined";

export const rsvpApi = {
  // GET /api/public/rsvp/:eventId/:guestId
  getStatus: async (
    eventId: string,
    guestId: string,
  ): Promise<ApiResponse<Guest>> => {
    const res = await fetch(
      `${API_BASE_URL}/public/rsvp/${eventId}/${guestId}`,
      {
        headers: {
          "Content-Type": "application/json",
        },
      },
    );

    const result = await handleResponse<{
      success: boolean;
      data: {
        event: any;
        guest: Guest & { _id?: string };
      };
    }>(res);

    // The backend matches the format: data: { event: {...}, guest: { id: ..., name: ... } }
    // We already have 'id' in result.data.guest, but we ensure it's prioritized.
    const guestData = result.data.guest;

    return {
      success: result.success ?? true,
      data: {
        ...guestData,
        id: guestData.id || guestData._id || "",
      },
    };
  },

  // POST /api/public/rsvp/:guestId
  submit: async (
    guestId: string,
    data: {
      eventId: string;
      status: RSVPStatus;
      drinkPreference?: string;
      dietaryRestrictions?: string;
      message?: string;
    },
  ): Promise<ApiResponse<Guest>> => {
    const res = await fetch(`${API_BASE_URL}/public/rsvp/${guestId}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    const result = await handleResponse<{
      success: boolean;
      data: Guest & { _id: string };
    }>(res);

    return {
      success: result.success ?? true,
      data: {
        ...result.data,
        id: result.data._id,
      },
    };
  },

  // POST /api/public/register/:eventId
  registerPublic: async (
    eventId: string,
    data: {
      name: string;
      email: string;
      status: RSVPStatus;
      drinkPreference?: string;
      dietaryRestrictions?: string;
      message?: string;
      plusOne?: boolean;
      plusOneName?: string;
    },
  ): Promise<ApiResponse<Guest>> => {
    const res = await fetch(`${API_BASE_URL}/public/register/${eventId}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    const result = await handleResponse<{
      success: boolean;
      data: Guest & { _id: string };
    }>(res);

    return {
      success: result.success ?? true,
      data: {
        ...result.data,
        id: result.data._id,
      },
    };
  },
};

// ==================== INVITATIONS ====================
export const invitationsApi = {
  // 🔹 Envoyer à un invité
  send: async (
    guestId: string,
    eventId: string,
    method: Invitation["distributionMethod"],
  ): Promise<ApiResponse<Invitation>> => {
    const res = await fetch(`${API_BASE_URL}/invitations/send`, {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify({ guestId, eventId, method }),
    });
    const result = await handleResponse<{ success: boolean; data: any }>(res);
    return { success: result.success ?? true, data: result.data };
  },

  // 🔹 Envoi bulk
  sendBulk: async (
    guestIds: string[],
    eventId: string,
    method: Invitation["distributionMethod"],
  ): Promise<ApiResponse<Invitation[]>> => {
    const res = await fetch(`${API_BASE_URL}/invitations/send-bulk`, {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify({ guestIds, eventId, method }),
    });
    const result = await handleResponse<{ success: boolean; data: any[] }>(res);
    return { success: result.success ?? true, data: result.data };
  },

  // 🔹 Créer une invitation
  create: async (
    data: Partial<Invitation>,
  ): Promise<ApiResponse<Invitation>> => {
    const res = await fetch(`${API_BASE_URL}/invitations`, {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    const result = await handleResponse<{ success: boolean; data: any }>(res);
    return { success: result.success ?? true, data: result.data };
  },

  // 🔹 Récupérer toutes les invitations d’un événement
  getByEvent: async (eventId: string): Promise<ApiResponse<Invitation[]>> => {
    const res = await fetch(`${API_BASE_URL}/invitations/event/${eventId}`, {
      method: "GET",
      headers: getHeaders(),
    });
    const result = await handleResponse<{ success: boolean; data: any[] }>(res);
    return { success: result.success ?? true, data: result.data };
  },

  // 🔹 Marquer comme envoyée
  markSent: async (invitationId: string): Promise<ApiResponse<Invitation>> => {
    const res = await fetch(
      `${API_BASE_URL}/invitations/${invitationId}/sent`,
      {
        method: "PATCH",
        headers: getHeaders(),
      },
    );
    const result = await handleResponse<{ success: boolean; data: any }>(res);
    return { success: result.success ?? true, data: result.data };
  },

  // 🔹 Supprimer une invitation
  delete: async (
    invitationId: string,
  ): Promise<ApiResponse<{ message: string }>> => {
    const res = await fetch(`${API_BASE_URL}/invitations/${invitationId}`, {
      method: "DELETE",
      headers: getHeaders(),
    });
    const result = await handleResponse<{ success: boolean; data: any }>(res);
    return { success: result.success ?? true, data: result.data };
  },
};

// ==================== WHATSAPP LOG ====================
export interface WhatsAppLogEntryDTO {
  guestId: string;
  guestName: string;
  eventId: string;
  copiedAt?: string;
  sentAt?: string;
  copyCount: number;
  sendCount: number;
}

export const whatsappLogApi = {
  list: async (eventId?: string): Promise<ApiResponse<WhatsAppLogEntryDTO[]>> => {
    const url = eventId
      ? `${API_BASE_URL}/whatsapp-log?eventId=${encodeURIComponent(eventId)}`
      : `${API_BASE_URL}/whatsapp-log`;
    const res = await fetch(url, { method: "GET", headers: getHeaders() });
    const result = await handleResponse<{ success: boolean; data: any[] }>(res);
    return { success: result.success ?? true, data: result.data || [] };
  },

  log: async (payload: {
    eventId: string;
    guestId: string;
    guestName: string;
    action: "copied" | "sent";
    idempotencyKey?: string;
  }): Promise<ApiResponse<WhatsAppLogEntryDTO>> => {
    const { idempotencyKey, ...body } = payload;
    const res = await fetch(`${API_BASE_URL}/whatsapp-log`, {
      method: "POST",
      headers: {
        ...getHeaders(),
        ...(idempotencyKey ? { "Idempotency-Key": idempotencyKey } : {}),
      },
      body: JSON.stringify(body),
    });
    const result = await handleResponse<{ success: boolean; data: any }>(res);
    return { success: result.success ?? true, data: result.data };
  },

  clear: async (eventId?: string): Promise<ApiResponse<{ message: string }>> => {
    const url = eventId
      ? `${API_BASE_URL}/whatsapp-log?eventId=${encodeURIComponent(eventId)}`
      : `${API_BASE_URL}/whatsapp-log`;
    const res = await fetch(url, { method: "DELETE", headers: getHeaders() });
    const result = await handleResponse<{ success: boolean; data: any }>(res);
    return { success: result.success ?? true, data: result.data };
  },
};

// ==================== EMAILS ====================
export interface EmailTemplate {
  subject: string;
  body: string;
  templateId?: string;
}

export interface EmailRequest {
  to: string | string[];
  subject: string;
  body: string;
  html?: string;
  templateId?: string;
  templateData?: Record<string, any>;
}

export interface EmailResult {
  success: boolean;
  messageId?: string;
  error?: string;
}

export interface EmailLog {
  id: string;
  eventId?: string;
  guestId?: string;
  recipientEmail: string;
  recipientName?: string;
  subject: string;
  status:
    | "pending"
    | "sent"
    | "delivered"
    | "opened"
    | "clicked"
    | "bounced"
    | "failed";
  sentAt?: string;
  deliveredAt?: string;
  openedAt?: string;
  clickedAt?: string;
  clickCount?: number;
  errorMessage?: string;
  metadata?: Record<string, any>;
}

export interface EmailAnalytics {
  totalSent: number;
  totalDelivered: number;
  totalOpened: number;
  totalClicked: number;
  totalBounced: number;
  totalFailed: number;
  deliveryRate: number;
  openRate: number;
  clickRate: number;
  bounceRate: number;
  lastUpdated: string;
}

export const emailsApi = {
  // Envoyer un email simple
  send: async (data: EmailRequest): Promise<ApiResponse<EmailResult>> => {
    const res = await fetch(`${API_BASE_URL}/emails/send`, {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    const result = await handleResponse<{
      success: boolean;
      data: EmailResult;
    }>(res);
    return { success: result.success ?? true, data: result.data };
  },

  // Envoyer une invitation par email
  sendInvitation: async (
    guestId: string,
    eventId: string,
    customMessage?: string,
  ): Promise<ApiResponse<EmailResult>> => {
    const res = await fetch(`${API_BASE_URL}/emails/invitation`, {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify({ guestId, eventId, customMessage }),
    });
    const result = await handleResponse<{
      success: boolean;
      data: EmailResult;
    }>(res);
    return { success: result.success ?? true, data: result.data };
  },

  // Envoyer des invitations en masse
  sendBulkInvitations: async (
    guestIds: string[],
    eventId: string,
    customMessage?: string,
    subject?: string,
    htmlContent?: string,
  ): Promise<
    ApiResponse<{ sent: number; failed: number; results: EmailResult[] }>
  > => {
    const res = await fetch(`${API_BASE_URL}/emails/invitation/bulk`, {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify({
        guestIds,
        eventId,
        method: 'email',
        customMessage,
        subject,
        htmlContent,
      }),
    });
    const result = await handleResponse<{ success: boolean; data: any }>(res);
    return { success: result.success ?? true, data: result.data };
  },

  // Envoyer une confirmation de RSVP
  sendConfirmation: async (
    guestId: string,
    eventId: string,
  ): Promise<ApiResponse<EmailResult>> => {
    const res = await fetch(`${API_BASE_URL}/emails/confirmation`, {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify({ guestId, eventId }),
    });
    const result = await handleResponse<{
      success: boolean;
      data: EmailResult;
    }>(res);
    return { success: result.success ?? true, data: result.data };
  },

  // Notifier l'organisateur d'une réponse RSVP
  notifyOrganizer: async (
    guestId: string,
    eventId: string,
    status: "confirmed" | "declined",
  ): Promise<ApiResponse<EmailResult>> => {
    const res = await fetch(`${API_BASE_URL}/emails/notify-organizer`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ guestId, eventId, status }),
    });
    const result = await handleResponse<{
      success: boolean;
      data: EmailResult;
    }>(res);
    return { success: result.success ?? true, data: result.data };
  },

  // Envoyer un rappel
  sendReminder: async (
    guestIds: string[],
    eventId: string,
  ): Promise<ApiResponse<{ sent: number; failed: number }>> => {
    const res = await fetch(`${API_BASE_URL}/emails/reminder`, {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify({ guestIds, eventId }),
    });
    const result = await handleResponse<{ success: boolean; data: any }>(res);
    return { success: result.success ?? true, data: result.data };
  },

  // Récupérer les templates d'emails
  getTemplates: async (): Promise<ApiResponse<EmailTemplate[]>> => {
    const res = await fetch(`${API_BASE_URL}/emails/templates`, {
      headers: getHeaders(),
    });
    const result = await handleResponse<{
      success: boolean;
      data: EmailTemplate[];
    }>(res);
    return { success: result.success ?? true, data: result.data };
  },

  // Tester l'envoi d'email
  testConnection: async (): Promise<
    ApiResponse<{ connected: boolean; provider: string }>
  > => {
    const res = await fetch(`${API_BASE_URL}/emails/test`, {
      headers: getHeaders(),
    });
    const result = await handleResponse<{ success: boolean; data: any }>(res);
    return { success: result.success ?? true, data: result.data };
  },
};

// ==================== EMAIL HISTORY ====================
export const emailHistoryApi = {
  // Récupérer l'historique des emails
  getLogs: async (eventId?: string): Promise<ApiResponse<EmailLog[]>> => {
    const url = eventId
      ? `${API_BASE_URL}/emails/history?eventId=${eventId}`
      : `${API_BASE_URL}/emails/history`;
    const res = await fetch(url, { headers: getHeaders() });
    const result = await handleResponse<{ success: boolean; data: EmailLog[] }>(
      res,
    );
    return { success: result.success ?? true, data: result.data };
  },

  // Récupérer les analytics des emails
  getAnalytics: async (
    eventId?: string,
  ): Promise<ApiResponse<EmailAnalytics>> => {
    const url = eventId
      ? `${API_BASE_URL}/emails/analytics?eventId=${eventId}`
      : `${API_BASE_URL}/emails/analytics`;
    const res = await fetch(url, { headers: getHeaders() });
    const result = await handleResponse<{
      success: boolean;
      data: EmailAnalytics;
    }>(res);
    return { success: result.success ?? true, data: result.data };
  },

  // Récupérer le détail d'un email
  getById: async (id: string): Promise<ApiResponse<EmailLog>> => {
    const res = await fetch(`${API_BASE_URL}/emails/history/${id}`, {
      headers: getHeaders(),
    });
    const result = await handleResponse<{ success: boolean; data: EmailLog }>(
      res,
    );
    return { success: result.success ?? true, data: result.data };
  },

  // Renvoyer un email
  resend: async (id: string): Promise<ApiResponse<EmailResult>> => {
    const res = await fetch(`${API_BASE_URL}/emails/history/${id}/resend`, {
      method: "POST",
      headers: getHeaders(),
    });
    const result = await handleResponse<{
      success: boolean;
      data: EmailResult;
    }>(res);
    return { success: result.success ?? true, data: result.data };
  },
};

// ==================== LIVRE D'OR ====================
export const guestbookApi = {
  getByEvent: async (
    eventId: string,
  ): Promise<ApiResponse<GuestbookMessage[]>> => {
    const res = await fetch(`${API_BASE_URL}/events/${eventId}/guestbook`, {
      headers: getHeaders(),
    });
    const result = await handleResponse<{ success: boolean; data: any[] }>(res);
    return { success: result.success ?? true, data: result.data };
  },

  addMessage: async (
    eventId: string,
    guestId: string,
    message: string,
  ): Promise<ApiResponse<GuestbookMessage>> => {
    const res = await fetch(`${API_BASE_URL}/events/${eventId}/guestbook`, {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify({ guestId, message }),
    });
    const result = await handleResponse<{ success: boolean; data: any }>(res);
    return { success: result.success ?? true, data: result.data };
  },

  reply: async (
    eventId: string,
    messageId: string,
    reply: string,
  ): Promise<ApiResponse<GuestbookMessage>> => {
    const res = await fetch(`${API_BASE_URL}/events/${eventId}/guestbook/${messageId}/reply`, {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify({ reply }),
    });
    const result = await handleResponse<{ success: boolean; data: any }>(res);
    return { success: result.success ?? true, data: result.data };
  },

  download: async (eventId: string): Promise<Blob> =>
    fetch(`${API_BASE_URL}/events/${eventId}/guestbook/download`, {
      headers: getHeaders(),
    }).then((r) => r.blob()),
};

// ==================== ANALYTICS ====================
export const analyticsApi = {
  getByEvent: async (eventId: string): Promise<ApiResponse<Analytics>> => {
    const res = await fetch(`${API_BASE_URL}/events/${eventId}/analytics`, {
      headers: getHeaders(),
    });
    const result = await handleResponse<{ success: boolean; data: any }>(res);
    return { success: result.success ?? true, data: result.data };
  },

  getOverview: async (): Promise<
    ApiResponse<{
      totalUsers: number;
      totalEvents: number;
      totalGuests: number;
      totalConfirmed: number;
      upcomingEvents: number;
    }>
  > => {
    const res = await fetch(`${API_BASE_URL}/analytics/overview`, {
      headers: getHeaders(),
    });
    const result = await handleResponse<{ success: boolean; data: any }>(res);
    return { success: result.success ?? true, data: result.data };
  },

  trackVisit: async (payload: {
    visitorId: string;
    path?: string;
    referrer?: string;
  }): Promise<ApiResponse<void>> => {
    const res = await fetch(`${API_BASE_URL}/analytics/visit`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const result = await handleResponse<{ success: boolean }>(res);
    return { success: result.success ?? true, data: undefined };
  },

  getVisitorStats: async (
    period: "day" | "week" | "month" | "year" = "week",
  ): Promise<
    ApiResponse<{
      period: string;
      totalVisits: number;
      uniqueVisitors: number;
      chartData: { label: string; visits: number; uniqueVisitors: number }[];
      topPages: { path: string; visits: number }[];
      startDate: string;
      endDate: string;
    }>
  > => {
    const res = await fetch(`${API_BASE_URL}/analytics/visitors?period=${period}`, {
      headers: getHeaders(),
    });
    const result = await handleResponse<{ success: boolean; data: any }>(res);
    return { success: result.success ?? true, data: result.data };
  },
};

// ==================== ACTIVITÉS RÉCENTES ====================
export interface Activity {
  id: string;
  type: "confirmed" | "declined" | "pending" | "invited" | "message";
  guestName: string;
  guestId?: string;
  eventId?: string;
  eventTitle: string;
  time: string;
  createdAt?: string;
}

export const activitiesApi = {
  // Récupérer les activités récentes de l'utilisateur courant
  // ⚠️ Le backend DOIT filtrer par userId pour éviter les fuites de données
  getRecent: async (limit: number = 10): Promise<ApiResponse<Activity[]>> => {
    const res = await fetch(
      `${API_BASE_URL}/activities/recent?limit=${limit}`,
      {
        headers: getHeaders(),
      },
    );
    const result = await handleResponse<{ success: boolean; data: Activity[] }>(
      res,
    );
    return { success: result.success ?? true, data: result.data || [] };
  },

  // Récupérer les activités par événement
  // ⚠️ Le backend DOIT vérifier que l'utilisateur a accès à cet événement
  getByEvent: async (eventId: string): Promise<ApiResponse<Activity[]>> => {
    const res = await fetch(`${API_BASE_URL}/activities/event/${eventId}`, {
      headers: getHeaders(),
    });
    const result = await handleResponse<{ success: boolean; data: Activity[] }>(
      res,
    );
    return { success: result.success ?? true, data: result.data || [] };
  },
};

// ==================== QR CODES ====================
export const qrCodeApi = {
  /**
   * Générer un QR code pour un invité
   */
  generate: async (
    guestId: string,
  ): Promise<ApiResponse<{ qrCode: string; code: string }>> => {
    const res = await fetch(
      `${API_BASE_URL}/public/rsvp/${guestId}/generate-qr`,
      {
        method: "POST",
        headers: getHeaders(),
      },
    );

    const result = await handleResponse<{
      success: boolean;
      data: { qrCode: string; code?: string };
    }>(res);

    // Générer un code aléatoire si non fourni par le backend
    const code = result.data?.code || `INV-${guestId.slice(-8).toUpperCase()}`;

    return {
      success: result.success ?? true,
      data: { qrCode: result.data?.qrCode || "", code },
    };
  },

  /**
   * Scanner / valider un QR code
   */
  scan: async (
    code: string,
  ): Promise<ApiResponse<{ guest: Guest; isValid: boolean }>> => {
    const res = await fetch(`${API_BASE_URL}/public/checkin/${code}`, {
      method: "GET",
      headers: getHeaders(),
    });

    const result = await handleResponse<{ success: boolean; data: any }>(res);

    // isValid = true si succès et que le check-in a été effectué
    const isValid = result.success === true;

    return {
      success: result.success ?? true,
      data: {
        guest: result.data?.guest,
        isValid,
      },
    };
  },
};

// ==================== UTILISATEURS (ROLES & PERMISSIONS) ====================
export const usersApi = {
  getAll: async (): Promise<ApiResponse<User[]>> => {
    const res = await fetch(`${API_BASE_URL}/auth/users`, {
      headers: getHeaders(),
    });
    const result = await handleResponse<{ success: boolean; data: any }>(res);
    // Le backend peut renvoyer { data: [...] } ou { data: { data: [], pagination: {} } }
    let userData: User[] = [];
    if (Array.isArray(result.data)) {
      userData = result.data;
    } else if (Array.isArray(result.data?.data)) {
      userData = result.data.data;
    }
    console.log("[usersApi.getAll] Raw result:", result);
    console.log("[usersApi.getAll] Parsed users:", userData);
    return { success: result.success ?? true, data: userData };
  },

  getById: async (id: string): Promise<ApiResponse<User>> => {
    const res = await fetch(`${API_BASE_URL}/auth/users/${id}`, {
      headers: getHeaders(),
    });
    const result = await handleResponse<{ success: boolean; data: any }>(res);
    return { success: result.success ?? true, data: result.data };
  },

  create: async (
    data: Partial<User> & { password: string },
  ): Promise<ApiResponse<User>> => {
    const res = await fetch(`${API_BASE_URL}/auth/users`, {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    const result = await handleResponse<{ success: boolean; data: any }>(res);
    return { success: result.success ?? true, data: result.data };
  },

  update: async (
    id: string,
    data: Partial<User>,
  ): Promise<ApiResponse<User>> => {
    const res = await fetch(`${API_BASE_URL}/auth/users/${id}`, {
      method: "PATCH",
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    const result = await handleResponse<{ success: boolean; data: any }>(res);
    return { success: result.success ?? true, data: result.data };
  },

  impersonate: async (
    userId: string,
    reason: string,
  ): Promise<ApiResponse<{ token: string; user: User }>> => {
    const res = await fetch(
      `${API_BASE_URL}/auth/users/impersonate/${userId}`,
      {
        method: "POST",
        headers: getHeaders(),
        body: JSON.stringify({ reason }),
      },
    );
    const result = await handleResponse<{ success: boolean; data: any }>(res);
    return { success: result.success ?? true, data: result.data };
  },

  updatePermissions: async (
    id: string,
    permissions: ModulePermission[],
  ): Promise<ApiResponse<User>> => {
    const res = await fetch(`${API_BASE_URL}/auth/users/${id}/permissions`, {
      method: "PUT",
      headers: getHeaders(),
      body: JSON.stringify({ permissions }),
    });
    const result = await handleResponse<{ success: boolean; data: any }>(res);
    return { success: result.success ?? true, data: result.data };
  },

  delete: async (id: string): Promise<ApiResponse<void>> => {
    const res = await fetch(`${API_BASE_URL}/auth/users/${id}`, {
      method: "DELETE",
      headers: getHeaders(),
    });
    const result = await handleResponse<{ success: boolean; data?: any }>(res);
    return { success: result.success ?? true, data: undefined };
  },

  // ✨ SUPERADMIN ONLY: Get all admin users
  getAdmins: async (): Promise<ApiResponse<User[]>> => {
    const res = await fetch(`${API_BASE_URL}/auth/users/admins`, {
      headers: getHeaders(),
    });
    const result = await handleResponse<{ success: boolean; data: any }>(res);

    // Le backend peut renvoyer { data: [...] } ou { data: { data: [], pagination: {} } }
    let adminData: User[] = [];
    if (Array.isArray(result.data)) {
      adminData = result.data;
    } else if (Array.isArray(result.data?.data)) {
      adminData = result.data.data;
    }

    console.log("[usersApi.getAdmins] Raw result:", result);
    console.log("[usersApi.getAdmins] Parsed admins:", adminData);

    return { success: result.success ?? true, data: adminData };
  },
};

export const auditApi = {
  getLogs: async (params?: {
    page?: number;
    limit?: number;
    action?: string;
    userId?: string;
  }): Promise<ApiResponse<any[]>> => {
    const query = new URLSearchParams(params as any).toString();
    const res = await fetch(`${API_BASE_URL}/audit?${query}`, {
      headers: getHeaders(),
    });
    const result = await handleResponse<{ success: boolean; data: any[] }>(res);

    const mappedLogs = (result.data || []).map((log: any) => ({
      ...log,
      id: log._id || log.id,
      timestamp: log.timestamp || log.createdAt,
      userName:
        log.userName || log.actor?.id?.name || log.actor?.name || "Système",
      userEmail:
        log.userEmail || log.actor?.id?.email || log.actor?.email || "-",
      action: log.action || "activity",
    }));

    return { success: result.success ?? true, data: mappedLogs };
  },

  createLog: async (data: {
    action: string;
    category: string;
    resourceType: string;
    resourceId?: string;
    resourceName?: string;
    details?: Record<string, unknown>;
    previousValue?: unknown;
    newValue?: unknown;
    severity?: string;
  }): Promise<ApiResponse<any>> => {
    const res = await fetch(`${API_BASE_URL}/audit`, {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    const result = await handleResponse<{ success: boolean; data: any }>(res);
    return { success: result.success ?? true, data: result.data };
  },
};

export const paymentsApi = {
  initiate: async (data: {
    amount: number;
    plan: string;
    currency?: string;
  }): Promise<ApiResponse<{ paymentId: string; paymentUrl: string }>> => {
    const res = await fetch(`${API_BASE_URL}/payments/initiate`, {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    return handleResponse(res);
  },

  verify: async (id: string): Promise<ApiResponse<any>> => {
    const res = await fetch(`${API_BASE_URL}/payments/verify/${id}`, {
      headers: getHeaders(),
    });
    return handleResponse(res);
  },

  getAll: async (): Promise<ApiResponse<any[]>> => {
    const res = await fetch(`${API_BASE_URL}/payments/all`, {
      headers: getHeaders(),
    });
    return handleResponse(res);
  },

  simulateSuccess: async (id: string): Promise<ApiResponse<any>> => {
    const res = await fetch(`${API_BASE_URL}/payments/simulate-success/${id}`, {
      method: "POST",
      headers: getHeaders(),
    });
    return handleResponse(res);
  },
};
