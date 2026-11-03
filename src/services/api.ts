/**
 * Base API Client for CampusConnect.
 * Configures BASE_URL, Authorization Bearer token headers, and standardized error handling.
 */

import { API_BASE_URL, MOCK_API_DELAY_MS } from '../config/env';

export const AUTH_TOKEN_KEY = 'cc_usc_jwt_token';

export class ApiError extends Error {
  status: number;
  constructor(message: string, status = 400) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

export function simulateNetworkDelay<T>(result: T, delayMs = MOCK_API_DELAY_MS): Promise<T> {
  return new Promise((resolve) => {
    setTimeout(() => resolve(result), delayMs);
  });
}

export async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = localStorage.getItem(AUTH_TOKEN_KEY);

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    let errorMessage = `HTTP Error ${response.status}`;
    try {
      const errBody = await response.json();
      if (errBody && errBody.message) {
        errorMessage = errBody.message;
      }
    } catch {
      // Fallback to status text
    }
    throw new ApiError(errorMessage, response.status);
  }

  if (response.status === 204) {
    return undefined as unknown as T;
  }

  return (await response.json()) as T;
}
