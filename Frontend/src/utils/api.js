export const getApiBaseUrl = () => {
    if (typeof window !== 'undefined') {
        const host = window.location.hostname;
        if (host === 'localhost' || host === '127.0.0.1') {
            return 'http://localhost:5000';
        }
        return 'https://idocs-bakcend.onrender.com';
    }
    return '';
};
