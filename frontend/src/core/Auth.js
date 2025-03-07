import { eventBus } from './EventBus.js';
import HttpClient from './HttpClient.js';

class Auth {
    constructor() {
        this.token = localStorage.getItem('token');
        this.user = JSON.parse(localStorage.getItem('user') || 'null');
        this.httpClient = new HttpClient();
    }

    isAuthenticated() {
        return !!this.token;
    }

    async login(username, password) {
        try {
            const response = await this.httpClient.post('/auth/login', { username, password });

            if (response.token) {
                this.token = response.token;
                this.user = response.user;

                localStorage.setItem('token', this.token);
                localStorage.setItem('user', JSON.stringify(this.user));

                eventBus.publish('auth:login', { user: this.user });
                return { success: true };
            } else {
                return { success: false, error: response.message || 'Kirjautuminen epäonnistui' };
            }
        } catch (error) {
            console.error('Login error:', error);

            // Tarkista onko vastaus JSON-muotoinen ja sisältääkö se kenttäkohtaisia virheitä
            if (error.errors) {
                return {
                    success: false,
                    error: error.message || 'Kirjautuminen epäonnistui',
                    errors: error.errors
                };
            }

            return { success: false, error: error.message || 'Verkkovirhe' };
        }
    }

    async register(username, email, password) {
        try {
            const response = await this.httpClient.post('/users', {
                username,
                email,
                password
            });

            if (response.user_id) {
                return { success: true };
            } else {
                return { success: false, error: response.message || 'Rekisteröinti epäonnistui' };
            }
        } catch (error) {
            console.error('Register error:', error);

            // Tarkistetaan onko virhe liittyvä duplikaattiin tai muuhun tunnistettuun virheeseen
            if (error.message) {
                // Jos viesti tulee suoraan backendiltä, näytetään se sellaisenaan
                if (error.message.includes('Sähköpostiosoite on jo käytössä') ||
                    error.message.includes('Käyttäjätunnus on jo käytössä') ||
                    error.message.includes('Tili näillä tiedoilla on jo olemassa')) {
                    return {
                        success: false,
                        error: error.message
                    };
                }

                // Tarkistetaan virheviesti yleisesti
                if (error.message.includes('Database error')) {
                    const errorString = error.toString().toLowerCase();

                    if (errorString.includes('duplicate') && errorString.includes('email')) {
                        return {
                            success: false,
                            error: 'Sähköpostiosoite on jo käytössä'
                        };
                    } else if (errorString.includes('duplicate') && errorString.includes('username')) {
                        return {
                            success: false,
                            error: 'Käyttäjätunnus on jo käytössä'
                        };
                    }
                }
            }

            // Tarkista onko vastaus JSON-muotoinen ja sisältääkö se kenttäkohtaisia virheitä
            if (error.errors) {
                return {
                    success: false,
                    error: error.message || 'Rekisteröinti epäonnistui',
                    errors: error.errors
                };
            }

            return { success: false, error: error.message || 'Rekisteröinti epäonnistui. Tarkista tiedot ja yritä uudelleen.' };
        }
    }

    logout() {
        this.token = null;
        this.user = null;
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        eventBus.publish('auth:logout');
    }

    getUser() {
        return this.user;
    }

    getToken() {
        return this.token;
    }
}

export default new Auth();
