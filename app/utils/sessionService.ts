
export interface UserSession {
    userName: string;
    uuid?: string;
    shortCode?: string;
    earliestLogin: string | null;
    latestLogout: string | null;
}

export const sessionService = {
    // Registra un login a través de la API (Code puede ser UUID o ShortCode)
    registerLogin: async (code: string): Promise<UserSession | null> => {
        try {
            console.log('Sending login to API:', code);

            const localDate = new Date().toLocaleDateString('en-CA');
            const now = new Date();
            const localTimestamp = new Date(now.getTime() - (now.getTimezoneOffset() * 60000)).toISOString();

            // Enviamos el código en el campo 'uuid' por compatibilidad con la API
            const response = await fetch('/api/attendance', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ uuid: code, type: 'login', date: localDate, timestamp: localTimestamp })
            });
            console.log('API Login Response Status:', response.status);
            if (response.ok) {
                const data = await response.json();
                return data.userSession;
            } else {
                console.error('API Error:', await response.text());
                return null;
            }
        } catch (error) {
            console.error('CLIENT ERROR registering login:', error);
        }
        return null;
    },

    // Registra un logout a través de la API
    registerLogout: async (code: string) => {
        try {
            console.log('Sending logout to API:', code);
            const localDate = new Date().toLocaleDateString('en-CA');
            const now = new Date();
            const localTimestamp = new Date(now.getTime() - (now.getTimezoneOffset() * 60000)).toISOString();

            const response = await fetch('/api/attendance', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ uuid: code, type: 'logout', date: localDate, timestamp: localTimestamp })
            });
            console.log('API Logout Response Status:', response.status);
            if (!response.ok) {
                console.error('API Error:', await response.text());
            }
        } catch (error) {
            console.error('CLIENT ERROR registering logout:', error);
        }
    }
};
