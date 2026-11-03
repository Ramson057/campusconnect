/**
 * Centralized environment and API mode configuration.
 * Toggle USE_MOCK_API to false to switch all services from mock Promises to live HTTP requests.
 */

const getEnvVar = (key: string, fallback: string): string => {
  try {
    const metaEnv = (import.meta as unknown as { env?: Record<string, string> }).env;
    if (metaEnv && typeof metaEnv[key] === 'string' && metaEnv[key].length > 0) {
      return metaEnv[key];
    }
  } catch {
    // Fallback for Node test runner environment
  }
  return fallback;
};

export const USE_MOCK_API: boolean = getEnvVar('VITE_USE_MOCK_API', 'false') === 'true';

export const API_BASE_URL: string = getEnvVar('VITE_API_BASE_URL', '/api/v1');

export const MOCK_API_DELAY_MS = 180;
