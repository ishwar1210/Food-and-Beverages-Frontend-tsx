import axios from "axios";
import type { AxiosRequestConfig, AxiosError } from "axios";

const API_BASE = ""; // Use relative URLs with Vite proxy

export interface TenantInfo {
  alias: string;
  client_username: string;
  client_id: number;
  user_id: number;
  username: string;
}

export interface AuthState {
  token_type: string;
  access_token: string;
  refresh_token?: string | null;
  permissions: Record<string, any>;
  tenant: TenantInfo;
}

export interface LoginResponse {
  token_type: string;
  access_token: string;
  refresh_token?: string;
  permissions: Record<string, any>;
  tenant: TenantInfo;
}

export interface RefreshResponse {
  access_token: string;
  permissions?: Record<string, any>;
  tenant?: TenantInfo;
}

let authState: AuthState | null = null;

// Initialize auth state from localStorage on app start
function initializeAuth(): void {
  try {
    const storedAuth = localStorage.getItem("authState");
    if (storedAuth) {
      authState = JSON.parse(storedAuth);
      console.log("✅ Auth state loaded from localStorage");
    }
  } catch (error) {
    console.warn("Failed to load auth from localStorage:", error);
    localStorage.removeItem("authState");
  }
}

// Save auth state to localStorage
function saveAuthState(auth: AuthState | null): void {
  if (auth) {
    localStorage.setItem("authState", JSON.stringify(auth));
    console.log("💾 Auth state saved to localStorage");
  } else {
    localStorage.removeItem("authState");
    console.log("🗑️ Auth state removed from localStorage");
  }
}

// Initialize on module load
initializeAuth();

export const api = axios.create({
  baseURL: API_BASE,
  withCredentials: true, // send/receive httpOnly refresh cookie
});

// ---------------- Helpers ----------------
function parseError(err: any): string {
  return (
    err?.response?.data?.detail ||
    err?.response?.data?.message ||
    err?.message ||
    "Request failed"
  );
}

export function getAuthState(): AuthState | null {
  return authState;
}

// Check if user is logged in
export function isLoggedIn(): boolean {
  return !!(authState && authState.access_token);
}

// Get current access token
export function getAccessToken(): string | null {
  return authState?.access_token || null;
}

// Get current user info
export function getCurrentUser(): TenantInfo | null {
  return authState?.tenant || null;
}

function setAuthFromRefresh(data: RefreshResponse) {
  // require access_token; if missing, treat as failure
  if (!data || !data.access_token) return false;

  if (!authState) {
    // If no existing auth state, we need tenant info
    if (!data.tenant) {
      console.warn("Refresh response missing tenant info");
      return false;
    }
    authState = {
      token_type: "Bearer",
      access_token: data.access_token,
      refresh_token: null,
      permissions:
        data.permissions ||
        JSON.parse(localStorage.getItem("permissions") || "{}"),
      tenant: data.tenant,
    };
  } else {
    authState.access_token = data.access_token;
    if (data.permissions) authState.permissions = data.permissions;
    if (data.tenant) authState.tenant = data.tenant;
  }

  // Save updated auth state to localStorage
  saveAuthState(authState);
  return true;
}

// ---------------- Interceptors ----------------
api.interceptors.request.use((config) => {
  const token = authState?.access_token;
  console.log(`🌐 API Call: ${config.method?.toUpperCase()} ${config.url}`);

  if (token) {
    config.headers = config.headers ?? {};
    (config.headers as any).Authorization = `Bearer ${token}`;
    console.log("🔑 Token added to request");
  } else {
    console.log("⚠️ No token available for request");
  }
  return config;
});

// concurrency guards for refresh + interactive login
let refreshInFlight: Promise<string | null> | null = null;
let interactiveLoginInFlight: Promise<boolean> | null = null;

api.interceptors.response.use(
  (res) => res,
  async (error: AxiosError) => {
    const original = error.config as
      | (AxiosRequestConfig & { _retry?: boolean })
      | undefined;
    const isRefreshCall = original?.url?.includes("/api/refresh/");

    // Only handle 401 once per request and never for the refresh call itself
    if (
      error.response?.status === 401 &&
      original &&
      !original._retry &&
      !isRefreshCall
    ) {
      original._retry = true;

      // 1) Try to refresh
      const newToken = await refreshAccessToken();
      if (newToken) {
        original.headers = original.headers ?? {};
        (original.headers as any).Authorization = `Bearer ${newToken}`;
        return api(original);
      }

      // 2) Refresh failed (no/expired cookie). Prompt user once.
      const ok = await interactiveLogin();
      if (ok && authState?.access_token) {
        original.headers = original.headers ?? {};
        (
          original.headers as any
        ).Authorization = `Bearer ${authState.access_token}`;
        return api(original);
      }
    }

    return Promise.reject(error);
  }
);

// ---------------- Login ----------------
export async function getToken(
  username: string,
  password: string,
  clientUsername?: string
): Promise<AuthState | null> {
  try {
    console.log("🔐 Starting login process...");
    const payload: Record<string, any> = { username, password };
    if (clientUsername?.trim()) {
      payload.client_username = clientUsername.trim();
      sessionStorage.setItem("client_username", clientUsername.trim());
    }

    const { data } = await api.post<LoginResponse>("/api/login/", payload, {
      withCredentials: true,
    });

    console.log("✅ Login successful!");
    localStorage.setItem("permissions", JSON.stringify(data.permissions || {}));

    authState = {
      token_type: data.token_type,
      access_token: data.access_token,
      refresh_token: data.refresh_token ?? null,
      permissions: data.permissions || {},
      tenant: data.tenant,
    };

    // Save to localStorage
    saveAuthState(authState);
    console.log("🎉 User logged in and token saved!");

    return authState;
  } catch (err: any) {
    console.error("Login failed:", err?.response?.data || err);
    alert(`❌ Login failed: ${parseError(err)}`);
    return null;
  }
}

// ---------------- Refresh (cookie) ----------------
export async function refreshAccessToken(): Promise<string | null> {
  try {
    // de-duplicate concurrent refreshes
    if (!refreshInFlight) {
      refreshInFlight = (async () => {
        const { data } = await api.post<RefreshResponse>(
          "/api/refresh/",
          {},
          { withCredentials: true }
        );
        const ok = setAuthFromRefresh(data);
        return ok ? authState!.access_token : null;
      })().finally(() => {
        refreshInFlight = null;
      });
    }
    return await refreshInFlight;
  } catch (err: any) {
    // No/expired cookie or server rejected → treat as hard failure
    console.warn("❌ Refresh failed:", err?.response?.data || err);
    return null;
  }
}

// ---------------- Interactive prompt (dev/demo) ----------------
export async function interactiveLogin(): Promise<boolean> {
  if (!interactiveLoginInFlight) {
    interactiveLoginInFlight = (async () => {
      const username = prompt("Enter username:");
      const password = prompt("Enter password:");
      const clientUsername =
        prompt('Enter client_username (optional, e.g. "NEWHOUSE"):') || "";

      if (username && password) {
        const st = await getToken(
          username,
          password,
          clientUsername.trim() || undefined
        );
        return !!st;
      }
      return false;
    })().finally(() => {
      interactiveLoginInFlight = null;
    });
  }
  return await interactiveLoginInFlight;
}

// ---------------- Bootstrap (first load) ----------------
export async function bootstrapAuth(): Promise<boolean> {
  // Try refresh via cookie; DO NOT prompt here. The caller decides if/when to prompt.
  const token = await refreshAccessToken();
  return !!(token && getAuthState());
}

// ---------------- Logout ----------------
export function logoutLocal() {
  console.log("🚪 Logging out locally...");
  authState = null;
  localStorage.removeItem("permissions");
  localStorage.removeItem("authState");
  sessionStorage.removeItem("client_username");
  console.log("✅ Local data cleared");
}

export async function logout(): Promise<void> {
  try {
    console.log("🚪 Logging out from server...");
    await api.post("/api/logout/", {}, { withCredentials: true });
    console.log("✅ Server logout successful");
  } catch (err) {
    console.warn("⚠️ Backend logout failed, clearing local anyway:", err);
  }

  logoutLocal();
  document.cookie =
    "refresh_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
  console.log("🎉 Logout complete!");
}

// Test function to verify authentication is working
export async function testAuthenticatedCall(): Promise<any> {
  try {
    console.log("🧪 Testing authenticated API call...");
    console.log("Current auth state:", {
      isLoggedIn: isLoggedIn(),
      hasToken: !!getAccessToken(),
      user: getCurrentUser()?.username,
    });

    // Try calling a protected endpoint (replace with your actual endpoint)
    const response = await api.get("/api/restaurants/"); // Example endpoint
    console.log("✅ Authenticated API call successful!");
    return response.data;
  } catch (error) {
    console.error("❌ Authenticated API call failed:", error);
    throw error;
  }
}

// Example of using the generic response type
// const response = await api.get<YourExpectedResponseType>('/some-endpoint');
