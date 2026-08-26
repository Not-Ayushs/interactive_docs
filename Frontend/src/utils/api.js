export const getApiBaseUrl = () => {
    if (import.meta.env.VITE_API_URL) {
        return import.meta.env.VITE_API_URL.replace(/\/$/, "");
    }
    return import.meta.env.DEV ? "http://localhost:5000" : "";
};
