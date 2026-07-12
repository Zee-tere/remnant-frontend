export function getApiUrl() {
  if (process.env.NEXT_PUBLIC_API_URL) return process.env.NEXT_PUBLIC_API_URL;

  if (process.env.NODE_ENV === 'production') {
    throw new Error('Missing NEXT_PUBLIC_API_URL for production frontend build.');
  }

  if (typeof window !== 'undefined') {
    const { hostname } = window.location;
    const isLocalhost = hostname === 'localhost' || hostname === '127.0.0.1';
    if (!isLocalhost && hostname) return `http://${hostname}:3001`;
  }

  return 'http://localhost:3001';
}
