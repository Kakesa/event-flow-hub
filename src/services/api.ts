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
  SeatingOverview,
  SeatingTable,
  GuestGroup,
  SeatingStats,
} from "@/types/models";
import { API_BASE_URL, BASE_URL } from "@/config/env";
import { parseScanToken } from "@/utils/qrCode";

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
    phone: string;
    password: string;
  }): Promise<ApiResponse<{ token: string; user: User }>> => {
    const payload = {
      name: data.name.trim(),
      email: data.email.trim().toLowerCase(),
      phone: data.phone.trim(),
      password: data.password,
    };

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

  forgotPassword: async (email: string): Promise<ApiResponse<{ message?: string }>> => {
    const res = await fetch(`${API_BASE_URL}/auth/forgot-password`, {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify({ email: email.trim().toLowerCase() }),
    });
    const result = await handleResponse<{ success: boolean; message?: string }>(res);
    return { success: result.success ?? true, data: { message: result.message } };
  },

  resetPassword: async (
    token: string,
    password: string,
  ): Promise<ApiResponse<{ token: string; user: User }>> => {
    const res = await fetch(`${API_BASE_URL}/auth/reset-password`, {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify({ token, password }),
    });
    const result = await handleResponse<{ success: boolean; data: any }>(res);
    return { success: result.success ?? true, data: result.data };
  },

  googleLogin: async (
    credential: string,
  ): Promise<ApiResponse<{ token: string; user: User }>> => {
    const res = await fetch(`${API_BASE_URL}/auth/google`, {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify({ credential }),
    });
    const result = await handleResponse<{ success: boolean; data: any }>(res);
    return { success: result.success ?? true, data: result.data };
  },

  updateProfile: async (data: {
    name: string;
    email: string;
    phone?: string;
    avatar?: File;
  }): Promise<ApiResponse<User>> => {
    const formData = new FormData();
    formData.append("name", data.name.trim());
    formData.append("email", data.email.trim().toLowerCase());
    if (data.phone !== undefined) formData.append("phone", data.phone);
    if (data.avatar) formData.append("avatar", data.avatar);

    const res = await fetch(`${API_BASE_URL}/auth/profile`, {
      method: "PATCH",
      headers: getHeaders(false),
      body: formData,
    });
    const result = await handleResponse<{ success: boolean; data: any }>(res);
    return { success: result.success ?? true, data: result.data };
  },

  getSubscriptionLimits: async (
    eventId?: string,
  ): Promise<ApiResponse<import("@/types/models").SubscriptionLimitsStatus>> => {
    const query = eventId ? `?eventId=${encodeURIComponent(eventId)}` : "";
    const res = await fetch(`${API_BASE_URL}/auth/subscription-limits${query}`, {
      headers: getHeaders(),
    });
    const result = await handleResponse<{ success: boolean; data: any }>(res);
    return { success: result.success ?? true, data: result.data };
  },
};

// ==================== CONTACT / DEMO (PUBLIC) ====================
export const contactApi = {
  send: async (data: {
    name: string;
    email: string;
    subject?: string;
    message: string;
  }): Promise<ApiResponse<{ message?: string }>> => {
    const res = await fetch(`${API_BASE_URL}/contact`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        type: "contact",
        name: data.name.trim(),
        email: data.email.trim().toLowerCase(),
        subject: data.subject?.trim() || undefined,
        message: data.message.trim(),
      }),
    });

    const text = await res.text();
    let parsed: { success?: boolean; message?: string; errors?: { msg: string }[] } = {};
    try {
      parsed = text ? JSON.parse(text) : {};
    } catch {
      parsed = { message: text || "Erreur serveur" };
    }

    if (!res.ok) {
      const validationMsg = parsed.errors?.[0]?.msg;
      throw new Error(validationMsg || parsed.message || "Impossible d'envoyer le message");
    }

    return { success: parsed.success ?? true, data: { message: parsed.message } };
  },

  requestDemo: async (data: {
    name: string;
    email: string;
    phone?: string;
    eventType?: string;
    message?: string;
  }): Promise<ApiResponse<{ message?: string }>> => {
    const res = await fetch(`${API_BASE_URL}/contact`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        type: "demo",
        name: data.name.trim(),
        email: data.email.trim().toLowerCase(),
        phone: data.phone?.trim() || undefined,
        eventType: data.eventType || undefined,
        message: data.message?.trim() || undefined,
      }),
    });

    const text = await res.text();
    let parsed: { success?: boolean; message?: string; errors?: { msg: string }[] } = {};
    try {
      parsed = text ? JSON.parse(text) : {};
    } catch {
      parsed = { message: text || "Erreur serveur" };
    }

    if (!res.ok) {
      const validationMsg = parsed.errors?.[0]?.msg;
      throw new Error(validationMsg || parsed.message || "Impossible d'envoyer la demande");
    }

    return { success: parsed.success ?? true, data: { message: parsed.message } };
  },
};

// ==================== PLATFORM / TARIFICATION ====================
export const platformApi = {
  getSettings: async (): Promise<ApiResponse<import('@/types/models').PlatformPricingSettings>> => {
    const res = await fetch(`${API_BASE_URL}/platform/settings`, {
      headers: getHeaders(),
    });
    const result = await handleResponse<{ success: boolean; data: any }>(res);
    return { success: result.success ?? true, data: result.data };
  },

  updateSettings: async (
    data: { defaultGuestPriceFc: number },
  ): Promise<ApiResponse<import('@/types/models').PlatformPricingSettings>> => {
    const res = await fetch(`${API_BASE_URL}/platform/settings`, {
      method: 'PATCH',
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    const result = await handleResponse<{ success: boolean; data: any }>(res);
    return { success: result.success ?? true, data: result.data };
  },

  getPurgePreview: async (): Promise<ApiResponse<{
    events: number;
    guests: number;
    invitations: number;
    analytics: number;
    emails: number;
    whatsappLogs: number;
    guestbookMessages: number;
    eventPhotos: number;
    users: number;
    userAvatars: number;
    payments: number;
    tables: number;
    guestGroups: number;
    checkInLogs: number;
    totalMessages: number;
  }>> => {
    const res = await fetch(`${API_BASE_URL}/platform/purge-preview`, {
      headers: getHeaders(),
    });
    const result = await handleResponse<{ success: boolean; data: any }>(res);
    return { success: result.success ?? true, data: result.data };
  },

  purgeTestData: async (confirmPhrase: string): Promise<ApiResponse<{
    message?: string;
    deleted?: Record<string, number>;
  }>> => {
    const res = await fetch(`${API_BASE_URL}/platform/purge-test-data`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ confirmPhrase }),
    });
    const result = await handleResponse<{ success: boolean; message?: string; data?: any }>(res);
    return {
      success: result.success ?? true,
      data: { message: result.message, deleted: result.data?.deleted },
    };
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
      result.data?.map((g) => ({ ...g, id: g._id || g.id })) || [];

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

// ==================== PLAN DE SALLE ====================
const mapSeatingId = <T extends { _id?: string; id?: string }>(item: T): T & { id: string } => ({
  ...item,
  id: item.id || item._id || "",
});

export const seatingApi = {
  getOverview: async (eventId: string): Promise<ApiResponse<SeatingOverview>> => {
    const res = await fetch(`${API_BASE_URL}/seating/event/${eventId}`, {
      headers: getHeaders(),
    });
    const result = await handleResponse<{ success: boolean; data: SeatingOverview }>(res);
    return { success: result.success ?? true, data: result.data };
  },

  generateTables: async (
    eventId: string,
    payload: {
      expectedGuestCount: number;
      method: "by_table_count" | "by_capacity";
      tableCount?: number;
      capacityPerTable?: number;
    },
  ): Promise<ApiResponse<SeatingTable[]>> => {
    const res = await fetch(`${API_BASE_URL}/seating/event/${eventId}/generate`, {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify(payload),
    });
    const result = await handleResponse<{ success: boolean; data: SeatingTable[] }>(res);
    return { success: result.success ?? true, data: result.data };
  },

  skipSetup: async (eventId: string): Promise<ApiResponse<unknown>> => {
    const res = await fetch(`${API_BASE_URL}/seating/event/${eventId}/skip-setup`, {
      method: "POST",
      headers: getHeaders(),
    });
    return handleResponse(res);
  },

  createTable: async (
    eventId: string,
    data: Partial<SeatingTable>,
  ): Promise<ApiResponse<SeatingTable>> => {
    const res = await fetch(`${API_BASE_URL}/seating/event/${eventId}/tables`, {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    const result = await handleResponse<{ success: boolean; data: SeatingTable }>(res);
    return { success: result.success ?? true, data: mapSeatingId(result.data) };
  },

  updateTable: async (
    tableId: string,
    data: Partial<SeatingTable>,
  ): Promise<ApiResponse<SeatingTable>> => {
    const res = await fetch(`${API_BASE_URL}/seating/tables/${tableId}`, {
      method: "PATCH",
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    const result = await handleResponse<{ success: boolean; data: SeatingTable }>(res);
    return { success: result.success ?? true, data: mapSeatingId(result.data) };
  },

  deleteTable: async (tableId: string): Promise<ApiResponse<void>> => {
    const res = await fetch(`${API_BASE_URL}/seating/tables/${tableId}`, {
      method: "DELETE",
      headers: getHeaders(),
    });
    await handleResponse(res);
    return { success: true, data: undefined };
  },

  assignGuest: async (
    guestId: string,
    tableId: string | null,
  ): Promise<ApiResponse<Guest>> => {
    const res = await fetch(`${API_BASE_URL}/seating/guests/${guestId}/assign`, {
      method: "PATCH",
      headers: getHeaders(),
      body: JSON.stringify({ tableId }),
    });
    const result = await handleResponse<{ success: boolean; data: Guest }>(res);
    return { success: result.success ?? true, data: mapSeatingId(result.data) };
  },

  autoDistribute: async (
    eventId: string,
    options?: { respectGroups?: boolean; onlyUnassigned?: boolean },
  ): Promise<ApiResponse<{ assigned: number; unassigned: number; message?: string }>> => {
    const res = await fetch(`${API_BASE_URL}/seating/event/${eventId}/auto-distribute`, {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify(options || {}),
    });
    const result = await handleResponse<{ success: boolean; data: { assigned: number; unassigned: number; message?: string } }>(res);
    return { success: result.success ?? true, data: result.data };
  },

  createGroup: async (
    eventId: string,
    data: { name: string; type?: GuestGroup["type"]; color?: string },
  ): Promise<ApiResponse<GuestGroup>> => {
    const res = await fetch(`${API_BASE_URL}/seating/event/${eventId}/groups`, {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    const result = await handleResponse<{ success: boolean; data: GuestGroup }>(res);
    return { success: result.success ?? true, data: mapSeatingId(result.data) };
  },

  createPresetGroups: async (eventId: string): Promise<ApiResponse<GuestGroup[]>> => {
    const res = await fetch(`${API_BASE_URL}/seating/event/${eventId}/groups/presets`, {
      method: "POST",
      headers: getHeaders(),
    });
    const result = await handleResponse<{ success: boolean; data: GuestGroup[] }>(res);
    return { success: result.success ?? true, data: result.data.map(mapSeatingId) };
  },

  assignGuestToGroup: async (
    guestId: string,
    groupId: string | null,
  ): Promise<ApiResponse<Guest>> => {
    const res = await fetch(`${API_BASE_URL}/seating/guests/${guestId}/group`, {
      method: "PATCH",
      headers: getHeaders(),
      body: JSON.stringify({ groupId }),
    });
    const result = await handleResponse<{ success: boolean; data: Guest }>(res);
    return { success: result.success ?? true, data: mapSeatingId(result.data) };
  },

  updateGroup: async (
    groupId: string,
    data: { name?: string; type?: GuestGroup["type"]; color?: string },
  ): Promise<ApiResponse<GuestGroup>> => {
    const res = await fetch(`${API_BASE_URL}/seating/groups/${groupId}`, {
      method: "PATCH",
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    const result = await handleResponse<{ success: boolean; data: GuestGroup }>(res);
    return { success: result.success ?? true, data: mapSeatingId(result.data) };
  },

  deleteGroup: async (groupId: string): Promise<ApiResponse<void>> => {
    const res = await fetch(`${API_BASE_URL}/seating/groups/${groupId}`, {
      method: "DELETE",
      headers: getHeaders(),
    });
    await handleResponse(res);
    return { success: true, data: undefined };
  },

  search: async (
    eventId: string,
    q: string,
  ): Promise<ApiResponse<{ guests: Guest[]; tables: SeatingTable[] }>> => {
    const res = await fetch(
      `${API_BASE_URL}/seating/event/${eventId}/search?q=${encodeURIComponent(q)}`,
      { headers: getHeaders() },
    );
    const result = await handleResponse<{ success: boolean; data: { guests: Guest[]; tables: SeatingTable[] } }>(res);
    return { success: result.success ?? true, data: result.data };
  },

  updatePositions: async (
    eventId: string,
    positions: { id: string; x: number; y: number }[],
  ): Promise<ApiResponse<SeatingTable[]>> => {
    const res = await fetch(`${API_BASE_URL}/seating/event/${eventId}/positions`, {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify({ positions }),
    });
    const result = await handleResponse<{ success: boolean; data: SeatingTable[] }>(res);
    return { success: result.success ?? true, data: result.data };
  },

  getPrintData: async (
    eventId: string,
    tableId?: string,
  ): Promise<ApiResponse<unknown>> => {
    const query = tableId ? `?tableId=${tableId}` : "";
    const res = await fetch(`${API_BASE_URL}/seating/event/${eventId}/print${query}`, {
      headers: getHeaders(),
    });
    return handleResponse(res);
  },
};

// ==================== RSVP PUBLIC ====================

type RSVPStatus = "confirmed" | "declined";

export const rsvpApi = {
  // GET /api/public/rsvp/:eventId/:guestId
  getStatus: async (
    eventId: string,
    guestId: string,
  ): Promise<ApiResponse<Guest & { eventMeta?: Partial<Event> }>> => {
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
        event: Partial<Event> & { id?: string; _id?: string };
        guest: Guest & { _id?: string };
      };
    }>(res);

    const guestData = result.data.guest;
    const eventMeta = result.data.event;

    return {
      success: result.success ?? true,
      data: {
        ...guestData,
        id: guestData.id || guestData._id || "",
        eventMeta,
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
    const invitations: Invitation[] =
      result.data?.map((inv) => {
        const guestRef = inv.guestId;
        const guestId =
          typeof guestRef === "object" && guestRef !== null
            ? guestRef._id || guestRef.id
            : inv.guestId;
        return {
          ...inv,
          id: inv._id || inv.id,
          guestId: String(guestId),
          guest:
            typeof guestRef === "object" && guestRef !== null
              ? {
                  id: guestRef._id || guestRef.id,
                  name: guestRef.name,
                  email: guestRef.email,
                  phone: guestRef.phone,
                }
              : undefined,
        };
      }) || [];
    return { success: result.success ?? true, data: invitations };
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
const normalizeGuestbookEntry = (
  eventId: string,
  raw: Record<string, unknown>,
): GuestbookMessage => ({
  id: String(raw._id || raw.id || ""),
  eventId,
  guestId: raw.guestId ? String(raw.guestId) : undefined,
  name: String(raw.guestName || raw.name || "Anonyme"),
  message: String(raw.message || ""),
  reply: raw.reply ? String(raw.reply) : undefined,
  repliedAt: raw.repliedAt ? String(raw.repliedAt) : undefined,
  createdAt: String(raw.createdAt || raw.respondedAt || new Date().toISOString()),
});

const mergeGuestbookSources = (
  eventId: string,
  guestbookEntries: Record<string, unknown>[],
  guests: Record<string, unknown>[],
): GuestbookMessage[] => {
  const fromGuestbook = guestbookEntries.map((m) =>
    normalizeGuestbookEntry(eventId, m),
  );

  const fromGuests = guests
    .filter((g) => String(g.message || "").trim())
    .map((g) =>
      normalizeGuestbookEntry(eventId, {
        _id: g._id || g.id,
        guestId: g._id || g.id,
        guestName: g.name,
        message: g.message,
        createdAt: g.respondedAt || g.updatedAt || g.createdAt,
      }),
    );

  const merged = [...fromGuestbook];
  for (const guestMsg of fromGuests) {
    const duplicate = merged.some(
      (m) =>
        (guestMsg.guestId && m.guestId === guestMsg.guestId) ||
        (m.message === guestMsg.message && m.name === guestMsg.name),
    );
    if (!duplicate) merged.push(guestMsg);
  }

  return merged.sort(
    (a, b) =>
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );
};

export const guestbookApi = {
  getByEvent: async (
    eventId: string,
  ): Promise<ApiResponse<GuestbookMessage[]>> => {
    const [gbRes, guestsRes] = await Promise.all([
      fetch(`${API_BASE_URL}/events/${eventId}/guestbook`, {
        headers: getHeaders(),
      }),
      fetch(`${API_BASE_URL}/guests/event/${eventId}`, {
        headers: getHeaders(),
      }),
    ]);

    const gbResult = await handleResponse<{ success: boolean; data: any[] }>(
      gbRes,
    );
    let guests: Record<string, unknown>[] = [];
    try {
      const guestsResult = await handleResponse<{
        success: boolean;
        data: any[];
      }>(guestsRes);
      guests = guestsResult.data || [];
    } catch {
      // Livre d'or seul si accès invités refusé
    }

    const data = mergeGuestbookSources(
      eventId,
      gbResult.data || [],
      guests,
    );

    return { success: gbResult.success ?? true, data };
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
      [x: string]: number;
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
  ): Promise<ApiResponse<{ qrCode: string; code: string; invitationCode?: string }>> => {
    const res = await fetch(
      `${API_BASE_URL}/public/rsvp/${guestId}/generate-qr`,
      {
        method: "POST",
        headers: getHeaders(),
      },
    );

    const result = await handleResponse<{
      success: boolean;
      data: { qrCode: string; code?: string; invitationCode?: string };
    }>(res);

    const qrCode = result.data?.qrCode || "";
    const invitationCode = result.data?.invitationCode || result.data?.code || "";

    return {
      success: result.success ?? true,
      data: { qrCode, code: invitationCode, invitationCode },
    };
  },

  /**
   * Scanner / valider un QR code
   */
  scan: async (
    code: string,
  ): Promise<ApiResponse<{ guest: Guest; isValid: boolean; message?: string; alreadyCheckedIn?: boolean }>> => {
    const token = encodeURIComponent(parseScanToken(code));
    const res = await fetch(`${API_BASE_URL}/public/checkin/${token}`, {
      method: "GET",
      headers: getHeaders(),
    });

    const text = await res.text();
    let result: { success?: boolean; message?: string; data?: any } = {};
    try {
      result = text ? JSON.parse(text) : {};
    } catch {
      result = { message: text || "Erreur serveur" };
    }

    if (!res.ok) {
      if (result.data?.alreadyCheckedIn && result.data?.guest) {
        return {
          success: false,
          data: {
            guest: result.data.guest,
            isValid: false,
            message: result.message,
            alreadyCheckedIn: true,
          },
        };
      }
      throw new Error(result.message || "Une erreur est survenue");
    }

    const isValid = result.success === true;

    return {
      success: result.success ?? true,
      data: {
        guest: result.data?.guest,
        isValid,
        message: result.message,
      },
    };
  },
};

// ==================== CHECK-IN (CONTRÔLE ENTRÉE) ====================
export const checkInApi = {
  search: async (
    eventId: string,
    query: string,
  ): Promise<
    ApiResponse<{
      searchType: string;
      method: import('@/types/models').CheckInMethod;
      results: import('@/types/models').GuestCheckInCard[];
    }>
  > => {
    const params = new URLSearchParams({ q: query.trim() });
    const res = await fetch(
      `${API_BASE_URL}/events/${eventId}/invitations/search?${params}`,
      { headers: getHeaders() },
    );
    const result = await handleResponse<{ success: boolean; data: any }>(res);
    return { success: result.success ?? true, data: result.data };
  },

  checkInGuest: async (
    eventId: string,
    guestId: string,
    method: import('@/types/models').CheckInMethod,
  ): Promise<
    ApiResponse<{ guest: import('@/types/models').GuestCheckInCard; message?: string }>
  > => {
    const res = await fetch(
      `${API_BASE_URL}/events/${eventId}/invitations/${guestId}/check-in`,
      {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ method }),
      },
    );

    const text = await res.text();
    let result: { success?: boolean; data?: any; message?: string } = {};
    try {
      result = text ? JSON.parse(text) : {};
    } catch {
      result = { message: text || 'Erreur serveur' };
    }

    if (!res.ok) {
      if (result.data?.alreadyCheckedIn && result.data?.guest) {
        const err = new Error(
          result.message || 'Cette invitation a déjà été utilisée.',
        ) as Error & { data?: typeof result.data };
        err.data = result.data;
        throw err;
      }
      throw new Error(result.message || 'Une erreur est survenue');
    }

    return {
      success: result.success ?? true,
      message: result.message,
      data: result.data,
    };
  },

  checkInByQr: async (
    eventId: string,
    code: string,
  ): Promise<
    ApiResponse<{ guest: import('@/types/models').GuestCheckInCard; message?: string }>
  > => {
    const res = await fetch(
      `${API_BASE_URL}/events/${eventId}/invitations/check-in/qr`,
      {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ token: code }),
      },
    );

    const text = await res.text();
    let result: { success?: boolean; message?: string; data?: any } = {};
    try {
      result = text ? JSON.parse(text) : {};
    } catch {
      result = { message: text || 'Erreur serveur' };
    }

    if (!res.ok) {
      if (result.data?.alreadyCheckedIn && result.data?.guest) {
        const err = new Error(
          result.message || 'Cette invitation a déjà été utilisée.',
        ) as Error & { data?: typeof result.data };
        err.data = result.data;
        throw err;
      }
      throw new Error(result.message || 'Une erreur est survenue');
    }

    return {
      success: result.success ?? true,
      message: result.message,
      data: result.data,
    };
  },
};

// ==================== UTILISATEURS (ROLES & PERMISSIONS) ====================
export const usersApi = {
  getAll: async (options?: {
    page?: number;
    limit?: number;
  }): Promise<ApiResponse<User[]>> => {
    const params = new URLSearchParams();
    params.set("page", String(options?.page ?? 1));
    params.set("limit", String(options?.limit ?? 500));

    const res = await fetch(`${API_BASE_URL}/auth/users?${params.toString()}`, {
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
