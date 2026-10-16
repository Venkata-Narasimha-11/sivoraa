/**
 * Unified API & WebSocket Endpoint Configuration for Production & Development.
 * Dynamically resolves URLs from environment variables (Vite or CRA) with sensible local fallbacks.
 */

// Safely obtain environment variables across Vite and CRA environments
const getEnvVar = (key: string): string => {
  if (typeof import.meta !== 'undefined' && import.meta.env) {
    if (import.meta.env[key]) return String(import.meta.env[key]);
  }
  return '';
};

// Base raw URL passed via VITE_API_URL or REACT_APP_API_URL
const rawApiUrl = (
  getEnvVar('VITE_API_URL') ||
  getEnvVar('VITE_API_BASE_URL') ||
  getEnvVar('REACT_APP_API_URL') ||
  ''
).trim().replace(/\/$/, '');

// Production HTTPS backend root or empty for same-origin dev proxy
export const BACKEND_URL = rawApiUrl;

// REST API Base URL (ending in /api/v1)
export const API_BASE_URL = BACKEND_URL
  ? `${BACKEND_URL}/api/v1`
  : '/api/v1';

// Real-Time WebSocket Base URL (wss:// for HTTPS backend, ws:// for localhost)
export const WS_BASE_URL = (() => {
  const explicitWs = getEnvVar('VITE_WS_URL');
  if (explicitWs) {
    return explicitWs.replace(/\/$/, '');
  }
  if (BACKEND_URL) {
    const isSecure = BACKEND_URL.startsWith('https://');
    const wsProtocol = isSecure ? 'wss://' : 'ws://';
    return `${BACKEND_URL.replace(/^https?:\/\//, wsProtocol)}/ws`;
  }
  return 'ws://127.0.0.1:8000/ws';
})();

export default {
  BACKEND_URL,
  API_BASE_URL,
  WS_BASE_URL,
};
