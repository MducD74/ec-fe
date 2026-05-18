import axios, { AxiosHeaders, type InternalAxiosRequestConfig } from "axios";

const API_BASE_URL = "http://localhost:3000/api/v1";
const ACCESS_TOKEN_KEY = "access_token";
const GUEST_SESSION_ID_KEY = "guest_session_id";

function getBrowserStorage() {
  if (typeof window === "undefined") {
    return undefined;
  }

  return window.localStorage;
}

function createGuestSessionId() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }

  return `guest-${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

function getOrCreateGuestSessionId() {
  const storage = getBrowserStorage();

  if (!storage) {
    return undefined;
  }

  const existingSessionId = storage.getItem(GUEST_SESSION_ID_KEY);
  if (existingSessionId) {
    return existingSessionId;
  }

  const guestSessionId = createGuestSessionId();
  storage.setItem(GUEST_SESSION_ID_KEY, guestSessionId);

  return guestSessionId;
}

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

apiClient.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const storage = getBrowserStorage();
  const accessToken = storage?.getItem(ACCESS_TOKEN_KEY);
  const guestSessionId = getOrCreateGuestSessionId();
  const headers = AxiosHeaders.from(config.headers);

  if (accessToken) {
    headers.set("Authorization", `Bearer ${accessToken}`);
    headers.set("access_token", accessToken);
  }

  if (guestSessionId) {
    headers.set("x-session-id", guestSessionId);
    headers.set("guest_session_id", guestSessionId);
  }

  config.headers = headers;

  return config;
});

export default apiClient;
