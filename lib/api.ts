/** Base URL for miraphoto-backend (no trailing slash). */
export function getApiBaseUrl(): string {
  const raw =
    process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "") ??
    "https://miraphoto-backend.fly.dev";
  return raw;
}

export type CreateEventPayload = {
  title: string;
  date: string;
  startTime: string;
  endTime: string;
  location: { city: string; state: string };
  emailAddress: string;
  phoneNumber: string;
  isTicketed: boolean;
  ticketPrice?: number;
  description: string;
  /** Optional bound photographer (from public search) */
  photographerId?: string;
};

/** Public search result — `GET /api/photographers/public/search?q=` */
export type PublicPhotographerSearchHit = {
  photographerId: string;
  firstName: string;
  lastName: string;
  displayedName: string;
  profileImageUrl: string | null;
  bio: string | null;
};

export async function searchPhotographersPublic(
  q: string,
): Promise<PublicPhotographerSearchHit[]> {
  const base = getApiBaseUrl();
  const trimmed = q.trim();
  if (!trimmed) return [];
  const params = new URLSearchParams({ q: trimmed });
  const res = await fetch(
    `${base}/api/photographers/public/search?${params.toString()}`,
    { method: "GET", headers: { Accept: "application/json" } },
  );
  const data = (await res.json()) as
    | PublicPhotographerSearchHit[]
    | { message?: string };
  if (!res.ok) {
    const msg =
      data && typeof data === "object" && "message" in data
        ? (data as { message?: string }).message
        : undefined;
    throw new Error(msg ?? `Search failed (${res.status})`);
  }
  return Array.isArray(data) ? data : [];
}

export type CreateEventFiles = {
  cover?: File | null;
  gallery?: File[];
};

/**
 * Public multipart create — no auth required. Optional Clerk token links the event to a user.
 */
export async function createEvent(
  body: CreateEventPayload,
  files: CreateEventFiles = {},
  accessToken?: string | null,
): Promise<unknown> {
  const base = getApiBaseUrl();
  const fd = new FormData();

  fd.append("title", body.title);
  fd.append("date", body.date);
  fd.append("startTime", body.startTime);
  fd.append("endTime", body.endTime);
  fd.append("city", body.location.city);
  fd.append("state", body.location.state);
  fd.append("emailAddress", body.emailAddress);
  fd.append("phoneNumber", body.phoneNumber);
  fd.append("isTicketed", body.isTicketed ? "true" : "false");
  if (body.isTicketed && body.ticketPrice != null) {
    fd.append("ticketPrice", String(body.ticketPrice));
  }
  fd.append("description", body.description);
  if (body.photographerId?.trim()) {
    fd.append("photographerId", body.photographerId.trim());
  }

  if (files.cover) {
    fd.append("cover", files.cover);
  }
  for (const file of files.gallery ?? []) {
    fd.append("gallery", file);
  }

  const headers: HeadersInit = {
    Accept: "application/json",
  };
  if (accessToken) {
    headers.Authorization = `Bearer ${accessToken}`;
  }

  const res = await fetch(`${base}/api/events`, {
    method: "POST",
    headers,
    body: fd,
  });

  const data = (await res.json()) as { message?: string };
  if (!res.ok) {
    throw new Error(data.message ?? `Request failed (${res.status})`);
  }
  return data;
}
