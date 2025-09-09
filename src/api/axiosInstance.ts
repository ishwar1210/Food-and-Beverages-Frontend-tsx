import axios, { AxiosError } from "axios";
import type { AxiosInstance, InternalAxiosRequestConfig } from "axios";
import { getAuthState, refreshAccessToken } from "../services/Login";

// --- Base URLs (override via .env) ---
const ACCOUNT_URL = "http://127.0.0.1:8000";

const FNB_URL = "http://127.0.0.1:8001"; // Food & Beverages service

// You can override token prefix (e.g., "Bearer" or "Token") via VITE_AUTH_TOKEN_PREFIX
const TOKEN_PREFIX = (
  import.meta.env.VITE_AUTH_TOKEN_PREFIX || "Bearer"
).trim();

// Helper to build an axios instance
function buildInstance(baseURL: string): AxiosInstance {
  return axios.create({
    baseURL: baseURL.replace(/\/$/, "") + "/api", // ensure single /api suffix
    withCredentials: true,
    headers: { "Content-Type": "application/json" },
  });
}

export const AccountInstance = buildInstance(ACCOUNT_URL);
export const FandBInstance = buildInstance(FNB_URL);

// ---- Refresh de‑dupe queue (avoid many parallel refresh calls) ----
let isRefreshing = false;
let refreshWaiters: Array<(token: string | null) => void> = [];

function enqueue(cb: (t: string | null) => void) {
  refreshWaiters.push(cb);
}
function releaseAll(token: string | null) {
  refreshWaiters.forEach((cb) => cb(token));
  refreshWaiters = [];
}

// ---- Attach interceptors (request + response) ----
function attachAuthInterceptors(instance: AxiosInstance) {
  // Request: add bearer token if present
  instance.interceptors.request.use((config: InternalAxiosRequestConfig) => {
    const token = getAuthState()?.access_token;
    if (token) {
      config.headers = config.headers || {};
      (config.headers as any).Authorization = `${TOKEN_PREFIX} ${token}`;
    }
    // Lightweight debug (can be toggled via env)
    if (import.meta.env.VITE_API_DEBUG === "1") {
      // Avoid logging sensitive full token
      const short = token ? token.substring(0, 12) + "…" : "none";
      // eslint-disable-next-line no-console
      console.log(
        `➡️ [REQ] ${config.method?.toUpperCase()} ${config.baseURL}${
          config.url
        } (auth: ${short})`
      );
    }
    return config;
  });

  // Response: handle 401/expired
  instance.interceptors.response.use(
    (r) => {
      if (import.meta.env.VITE_API_DEBUG === "1") {
        // eslint-disable-next-line no-console
        console.log(
          `✅ [RES] ${r.config.method?.toUpperCase()} ${r.config.url} -> ${
            r.status
          }`
        );
      }
      return r;
    },
    async (error: AxiosError) => {
      if (import.meta.env.VITE_API_DEBUG === "1") {
        // eslint-disable-next-line no-console
        console.warn(
          `❌ [ERR] ${error.config?.method?.toUpperCase()} ${
            error.config?.url
          } -> ${error.response?.status}`,
          error.response?.data
        );
      }
      const status = error.response?.status;
      const detail: any = (error.response?.data as any)?.detail;
      const original: any = error.config;

      // Token expiration pattern (adjust detail match as per backend)
      const needsRefresh =
        (status === 401 || status === 403) &&
        !original?._retry &&
        (detail === "Token expired." ||
          detail === "Invalid or expired token" ||
          detail === "Authentication credentials were not provided.");

      if (!needsRefresh) return Promise.reject(error);

      original._retry = true;

      if (!isRefreshing) {
        isRefreshing = true;
        try {
          const newToken = await refreshAccessToken();
          releaseAll(newToken || null);
        } catch (e) {
          releaseAll(null);
        } finally {
          isRefreshing = false;
        }
      }

      return new Promise((resolve, reject) => {
        enqueue((newToken) => {
          if (newToken) {
            original.headers = original.headers || {};
            (
              original.headers as any
            ).Authorization = `${TOKEN_PREFIX} ${newToken}`;
            resolve(instance(original));
          } else {
            reject(error);
          }
        });
      });
    }
  );
}

[AccountInstance, FandBInstance].forEach((inst) =>
  attachAuthInterceptors(inst)
);

// ---- Generic helpers ----
export interface PaginatedResult<T> {
  count?: number;
  next?: string | null;
  previous?: string | null;
  results: T[];
  // allow any extra keys
  [k: string]: any;
}

export function unwrapList<T = any>(data: any): T[] {
  if (Array.isArray(data)) return data as T[];
  if (data?.results && Array.isArray(data.results)) return data.results as T[];
  return [];
}

export function unwrapFirst<T = any>(data: any): T | null {
  const list = unwrapList<T>(data);
  return list.length ? list[0] : null;
}

export default {
  AccountInstance,
  FandBInstance,
};
