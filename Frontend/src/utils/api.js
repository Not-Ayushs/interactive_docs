/**
 * Returns the API base URL based on runtime environment detection.
 * - On localhost: uses local Express backend at port 5000
 * - On production (Vercel): uses relative path "" so /api/documents 
 *   hits the Vercel serverless function in /api/index.js
 * 
 * This bypasses VITE_API_URL build-time env vars which may be stale.
 */
export const getApiBaseUrl = () => {
    if (typeof window !== 'undefined') {
        const host = window.location.hostname;
        if (host === 'localhost' || host === '127.0.0.1') {
            return 'http://localhost:5000';
        }
        // Production (Vercel, any deployed domain) — use relative path
        return '';
    }
    // SSR fallback
    return '';
};
