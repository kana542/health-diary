import auth from './Auth.js';

export default class HttpClient {
    constructor(baseUrl = '') {
        this.baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

        if (baseUrl) {
            this.baseUrl = baseUrl;
        }
    }

    async request(endpoint, options = {}) {
        const url = this.baseUrl + endpoint;

        const defaultOptions = {
            headers: {
                'Content-Type': 'application/json'
            }
        };

        const requestOptions = { ...defaultOptions, ...options };

        if (auth.getToken()) {
            requestOptions.headers.Authorization = `Bearer ${auth.getToken()}`;
        }

        try {
            const response = await fetch(url, requestOptions);

            if (!response.ok) {
                if (response.status === 401) {
                    auth.logout();
                    window.location.href = '/login';
                }

                const errorData = await response.json();

                // Luo virheobjekti, jossa on sekä viesti että mahdolliset validointivirheet
                const error = new Error(errorData.message || 'Verkkovirhe');

                // Lisää virheeseen HTTP-statuskoodi
                error.status = response.status;

                // Lisää virheeseen validointivirheet, jos niitä on
                if (errorData.errors) {
                    error.errors = errorData.errors;
                }

                throw error;
            }

            if (response.status === 204) {
                return null;
            }

            return await response.json();
        } catch (error) {
            console.error('HttpClient virhe:', error);
            throw error;
        }
    }

    async get(endpoint) {
        return this.request(endpoint, { method: 'GET' });
    }

    async post(endpoint, data) {
        return this.request(endpoint, {
            method: 'POST',
            body: JSON.stringify(data)
        });
    }

    async put(endpoint, data) {
        return this.request(endpoint, {
            method: 'PUT',
            body: JSON.stringify(data)
        });
    }

    async delete(endpoint) {
        return this.request(endpoint, { method: 'DELETE' });
    }
}
