import axios, { AxiosHeaders, type InternalAxiosRequestConfig } from "axios";
import type { PaginatedResponse, PaginationMeta, Product } from "../components/ProductCard";

const API_BASE_URL = "http://localhost:3000/api/v1";
const ACCESS_TOKEN_KEY = "access_token";
const GUEST_SESSION_ID_KEY = "guest_session_id";

interface LegacyProductsResponse {
  success?: boolean;
  data?: Product[];
  products?: Product[];
  meta?: PaginationMeta;
  pagination?: {
    total?: number;
    totalPages?: number;
    page?: number;
    limit?: number;
  };
}

export interface FetchProductsParams {
  page?: number;
  limit?: number;
  categoryId?: number | null;
  brandId?: number | null;
  search?: string;
}

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

export async function fetchProducts({
  page = 1,
  limit = 10,
  categoryId,
  brandId,
  search,
}: FetchProductsParams = {}): Promise<PaginatedResponse<Product>> {
  const response = await apiClient.get<LegacyProductsResponse>("/products", {
    params: {
      page,
      limit,
      ...(categoryId ? { categoryId } : {}),
      ...(brandId ? { brandId } : {}),
      ...(search ? { search } : {}),
    },
  });
  const responseBody = response.data;
  const data = responseBody.data ?? responseBody.products ?? [];
  const meta =
    responseBody.meta ??
    ({
      totalItems: responseBody.pagination?.total ?? data.length,
      totalPages: responseBody.pagination?.totalPages ?? 1,
      currentPage: responseBody.pagination?.page ?? page,
      limit: responseBody.pagination?.limit ?? limit,
    } satisfies PaginationMeta);

  return {
    success: responseBody.success ?? true,
    data,
    meta,
  };
}

export default apiClient;



