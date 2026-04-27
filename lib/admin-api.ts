// ── Fetch wrapper — same-origin proxy uses httpOnly omniweb_token server-side ─

async function apiFetch<T = any>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };

  const res = await fetch(`/api/engine${path}`, {
    ...options,
    headers,
    credentials: "include",
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    const message = body.detail || `API error ${res.status}`;

    if (res.status === 401 && !path.startsWith("/auth/")) {
      if (typeof window !== "undefined") window.location.href = "/admin";
    }

    throw new Error(message);
  }

  return res.json();
}

// ── Utility helpers ──────────────────────────────────────────────────────────

export function formatDuration(seconds: number | null | undefined): string {
  if (!seconds || seconds <= 0) return "—";
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return m > 0 ? `${m}m ${s}s` : `${s}s`;
}

export function formatPhone(phone: string | null | undefined): string {
  if (!phone) return "—";
  const digits = phone.replace(/\D/g, "");
  if (digits.length === 11 && digits.startsWith("1")) {
    return `+1 (${digits.slice(1, 4)}) ${digits.slice(4, 7)}-${digits.slice(7)}`;
  }
  if (digits.length === 10) {
    return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
  }
  return phone;
}

export function timeAgo(dateStr: string | null | undefined): string {
  if (!dateStr) return "—";
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(dateStr).toLocaleDateString();
}

// ── Profile / Auth ───────────────────────────────────────────────────────────

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: string;
  is_active: boolean;
  created_at: string | null;
  invited_at: string | null;
  invite_accepted_at: string | null;
}

export async function getAdminUsers(): Promise<AdminUser[]> {
  return apiFetch<AdminUser[]>("/auth/admin/users");
}

export async function createAdminUser(body: {
  name: string;
  email: string;
  password: string;
}): Promise<AdminUser> {
  return apiFetch<AdminUser>("/auth/admin/users", {
    method: "POST",
    body: JSON.stringify(body),
  });
}

export async function inviteAdminUser(body: {
  name: string;
  email: string;
}): Promise<AdminUser> {
  return apiFetch<AdminUser>("/auth/admin/users/invite", {
    method: "POST",
    body: JSON.stringify(body),
  });
}

export async function setAdminUserStatus(
  userId: string,
  isActive: boolean
): Promise<AdminUser> {
  return apiFetch<AdminUser>(`/auth/admin/users/${userId}/status`, {
    method: "POST",
    body: JSON.stringify({ is_active: isActive }),
  });
}

export async function sendAdminUserReset(userId: string): Promise<AdminUser> {
  return apiFetch<AdminUser>(`/auth/admin/users/${userId}/send-reset`, {
    method: "POST",
  });
}

// ── Admin endpoints ──────────────────────────────────────────────────────────

export async function adminGetStats() {
  return apiFetch("/admin/stats");
}

export async function adminGetClients(params?: {
  search?: string;
  plan?: string;
  limit?: number;
  offset?: number;
}) {
  const q = new URLSearchParams();
  if (params?.search) q.set("search", params.search);
  if (params?.plan) q.set("plan", params.plan);
  if (params?.limit) q.set("limit", String(params.limit));
  if (params?.offset) q.set("offset", String(params.offset));
  return apiFetch(`/admin/clients?${q}`);
}

export async function adminGetClient(clientId: string) {
  return apiFetch(`/admin/clients/${clientId}`);
}

export async function adminPatchClient(
  clientId: string,
  body: Record<string, unknown>
) {
  return apiFetch(`/admin/clients/${clientId}`, {
    method: "PATCH",
    body: JSON.stringify(body),
  });
}

export async function adminGetAgents() {
  return apiFetch("/admin/agents");
}

export async function adminGetConversations(params?: {
  channel?: string;
  status?: string;
  limit?: number;
  offset?: number;
}) {
  const q = new URLSearchParams();
  if (params?.channel) q.set("channel", params.channel);
  if (params?.status) q.set("status", params.status);
  if (params?.limit) q.set("limit", String(params.limit));
  if (params?.offset) q.set("offset", String(params.offset));
  return apiFetch(`/admin/conversations?${q}`);
}

export async function adminGetTemplates() {
  return apiFetch("/admin/templates");
}

export async function adminCreateTemplate(body: Record<string, unknown>) {
  return apiFetch("/admin/templates", {
    method: "POST",
    body: JSON.stringify(body),
  });
}

export async function adminUpdateTemplate(
  id: string,
  body: Record<string, unknown>
) {
  return apiFetch(`/admin/templates/${id}`, {
    method: "PUT",
    body: JSON.stringify(body),
  });
}

export async function adminDeleteTemplate(id: string) {
  return apiFetch(`/admin/templates/${id}`, { method: "DELETE" });
}

export async function adminImpersonate(clientId: string) {
  return apiFetch(`/admin/impersonate/${clientId}`, { method: "POST" });
}
