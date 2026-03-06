import * as SecureStore from "expo-secure-store";

const API_BASE = "http://192.168.3.18:3000/api/v1";


export async function getAccessToken(): Promise<string | null> {
  return SecureStore.getItemAsync("access_token");
}

export async function getRefreshToken(): Promise<string | null> {
  return SecureStore.getItemAsync("refresh_token");
}

export async function storeTokens(accessToken: string, refreshToken: string): Promise<void> {
  await SecureStore.setItemAsync("access_token", accessToken);
  await SecureStore.setItemAsync("refresh_token", refreshToken);
}

export async function clearTokens(): Promise<void> {
  await SecureStore.deleteItemAsync("access_token");
  await SecureStore.deleteItemAsync("refresh_token");
}

type FetchOptions = RequestInit & { skipAuth?: boolean };

const buildUrl = (path: string) => {
  if (path.startsWith("/")) return `${API_BASE}${path}`;
  return `${API_BASE}/${path}`;
};

let refreshInFlight: Promise<boolean> | null = null;

const parseErrorMessage = async (res: Response, fallback: string): Promise<string> => {
  try {
    const data = await res.json();
    if (typeof data?.error === "string") return data.error;
    if (typeof data?.message === "string") return data.message;
    return fallback;
  } catch {
    return fallback;
  }
};

async function tryRefresh(): Promise<boolean> {
  const refreshToken = await getRefreshToken();
  if (!refreshToken) return false;

  try {
    const res = await fetch(buildUrl("/auth/refresh"), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refreshToken }),
    });

    if (!res.ok) {
      await clearTokens();
      return false;
    }

    const data = await res.json();
    if (!data?.accessToken || !data?.refreshToken) {
      await clearTokens();
      return false;
    }

    await storeTokens(data.accessToken, data.refreshToken);
    return true;
  } catch {
    return false;
  }
}

async function refreshOnce(): Promise<boolean> {
  if (!refreshInFlight) {
    refreshInFlight = tryRefresh().finally(() => {
      refreshInFlight = null;
    });
  }
  return refreshInFlight;
}

// Core fetch wrapper
export async function apiFetch(path: string, options: FetchOptions = {}): Promise<Response> {
  const { skipAuth = false, headers: customHeaders, ...rest } = options;
  const headers = new Headers(customHeaders);

  if (!headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  if (!skipAuth) {
    const token = await getAccessToken();
    if (token) headers.set("Authorization", `Bearer ${token}`);
  }

  let response = await fetch(buildUrl(path), { ...rest, headers });

  // If 401, try refresh once and retry original request once.
  if (response.status === 401 && !skipAuth) {
    const refreshed = await refreshOnce();
    if (refreshed) {
      const newToken = await getAccessToken();
      if (newToken) headers.set("Authorization", `Bearer ${newToken}`);
      response = await fetch(buildUrl(path), { ...rest, headers });
    }
  }

  return response;
}

// Auth API calls
export async function loginAPI(email: string, password: string) {
  const res = await apiFetch("/auth/login", {
    method: "POST",
    skipAuth: true,
    body: JSON.stringify({ email, password }),
  });

  if (!res.ok) {
    const message = await parseErrorMessage(res, "Login failed");
    throw new Error(message);
  }

  const data = await res.json();
  await storeTokens(data.accessToken, data.refreshToken);
  return data.user;
}

export async function registerAPI(full_name: string, email: string, password: string) {
  const res = await apiFetch("/auth/register", {
    method: "POST",
    skipAuth: true,
    body: JSON.stringify({ full_name, email, password }),
  });

  if (!res.ok) {
    const message = await parseErrorMessage(res, "Registration failed");
    throw new Error(message);
  }

  return res.json();
}