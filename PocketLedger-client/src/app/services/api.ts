import * as SecureStore from "expo-secure-store";
import * as Linking from "expo-linking";
import * as WebBrowser from "expo-web-browser";

const API_BASE = "http://localhost:3000/api/v1";

WebBrowser.maybeCompleteAuthSession();

export type CurrentUser = {
  id: string;
  full_name: string | null;
  email: string;
  role: string;
  profile_image: string | null;
  email_verified?: boolean;
};

type FetchOptions = RequestInit & { skipAuth?: boolean };

type ProfileUpdatePayload = {
  full_name?: string | null;
  email?: string;
  password?: string;
};

type UploadPhotoPayload = {
  uri: string;
  fileName?: string | null;
  mimeType?: string | null;
};

const buildUrl = (path: string) => {
  if (path.startsWith("/")) return `${API_BASE}${path}`;
  return `${API_BASE}/${path}`;
};

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

export const getUserInitials = (user: Pick<CurrentUser, "full_name" | "email">) => {
  const base = user.full_name?.trim() || user.email.trim();
  const parts = base.split(/\s+/).filter(Boolean);

  if (parts.length >= 2) {
    return `${parts[0][0] ?? ""}${parts[1][0] ?? ""}`.toUpperCase();
  }

  return base.slice(0, 2).toUpperCase();
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

export async function apiFetch(path: string, options: FetchOptions = {}): Promise<Response> {
  const { skipAuth = false, headers: customHeaders, ...rest } = options;
  const headers = new Headers(customHeaders);
  const isFormDataBody = typeof FormData !== "undefined" && rest.body instanceof FormData;

  if (!isFormDataBody && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  if (!skipAuth) {
    const token = await getAccessToken();
    if (token) headers.set("Authorization", `Bearer ${token}`);
  }

  let response = await fetch(buildUrl(path), { ...rest, headers });

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

export async function googleOAuthAPI() {
  const returnUrl = Linking.createURL("oauth/callback");
  const authUrl = buildUrl("auth/google");

  const result = await WebBrowser.openAuthSessionAsync(authUrl, returnUrl);

  if (result.type !== "success" || !result.url) {
    throw new Error("Google login was cancelled");
  }

  const parsedUrl = Linking.parse(result.url);
  const code = parsedUrl.queryParams?.code;

  if (typeof code !== "string") {
    throw new Error("Google login did not return a code.");
  }

  const res = await apiFetch("/auth/google/exchange", {
    method: "POST",
    skipAuth: true,
    body: JSON.stringify({ code }),
  });

  if (!res.ok) {
    const message = await parseErrorMessage(res, "Google login failed");
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

export async function sendVerificationAPI(): Promise<void> {
  const res = await apiFetch("/auth/send-verification", {
    method: "POST",
  });

  if (!res.ok) {
    const message = await parseErrorMessage(res, "Failed to send verification code");
    throw new Error(message);
  }
}

export async function verifyEmailAPI(code: string): Promise<void>{
  const res = await apiFetch ("/auth/verify-email", {
    method: "POST",
    body: JSON.stringify({ code }),
  });

  if(!res.ok) {
    const message = await parseErrorMessage(res, "Failed to verify email");
    throw new Error(message);
  }
}


export async function getCurrentUserAPI(): Promise<CurrentUser> {
  const res = await apiFetch("/me");

  if (!res.ok) {
    const message = await parseErrorMessage(res, "Failed to fetch user");
    throw new Error(message);
  }

  return res.json();
}

export async function updateCurrentUserAPI(payload: ProfileUpdatePayload): Promise<CurrentUser> {
  const res = await apiFetch("/me", {
    method: "PATCH",
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const message = await parseErrorMessage(res, "Failed to update profile");
    throw new Error(message);
  }

  return res.json();
}

export async function uploadProfilePhotoAPI(payload: UploadPhotoPayload): Promise<CurrentUser> {
  const formData = new FormData();
  formData.append(
    "photo",
    {
      uri: payload.uri,
      name: payload.fileName ?? `profile-${Date.now()}.jpg`,
      type: payload.mimeType ?? "image/jpeg",
    } as any
  );

  const res = await apiFetch("/me/profile", {
    method: "PATCH",
    body: formData,
  });

  if (!res.ok) {
    const message = await parseErrorMessage(res, "Failed to upload profile photo");
    throw new Error(message);
  }

  const data = await res.json();
  return data.user;
}

export async function logoutAPI(): Promise<void> {
  const refreshToken = await getRefreshToken();

  try {
    if (refreshToken) {
      await apiFetch("/auth/logout", {
        method: "POST",
        skipAuth: true,
        body: JSON.stringify({ refreshToken }),
      });
    }
  } finally {
    await clearTokens();
  }
}

export async function startSession(): Promise<boolean> {
  const accessToken = await getAccessToken();
  if (accessToken) return true;

  const refreshToken = await getRefreshToken();
  if (!refreshToken) return false;

  const res = await apiFetch("/auth/refresh", {
    method: "POST",
    skipAuth: true,
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
}
