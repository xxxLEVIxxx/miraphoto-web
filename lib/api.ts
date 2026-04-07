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
};

export async function loginPhotographer(
  email: string,
  password: string,
): Promise<string> {
  const base = getApiBaseUrl();
  const res = await fetch(`${base}/api/auth/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({ email, password }),
  });
  const data = (await res.json()) as {
    message?: string;
    accessToken?: string;
  };
  if (!res.ok) {
    throw new Error(data.message ?? "Login failed");
  }
  if (!data.accessToken) {
    throw new Error("No access token in response");
  }
  return data.accessToken;
}

export async function createEvent(
  accessToken: string,
  body: CreateEventPayload,
): Promise<unknown> {
  const base = getApiBaseUrl();
  const res = await fetch(`${base}/api/events`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify(body),
  });
  const data = (await res.json()) as { message?: string };
  if (!res.ok) {
    throw new Error(data.message ?? `Request failed (${res.status})`);
  }
  return data;
}
