import { eventBus } from './EventBus.js';
import HttpClient from './HttpClient.js';

/**
 * Authentication service handling user login, registration and session management
 * Manages auth tokens, user data persistence, and communicates authentication state changes
 */
class Auth {
    /**
     * Creates an instance of the Auth service
     * Initializes with stored credentials from localStorage if available
     */
    constructor() {
        // Retrieve existing authentication data from local storage
        this.token = localStorage.getItem('token');
        this.user = JSON.parse(localStorage.getItem('user') || 'null');
        this.httpClient = new HttpClient();
    }

    /**
     * Checks if the user is currently authenticated
     * @returns {boolean} True if user has a valid token, false otherwise
     */
    isAuthenticated() {
        return !!this.token;
    }

    /**
     * Attempts to authenticate a user with provided credentials
     * @param {string} username - User's username
     * @param {string} password - User's password
     * @returns {Promise<Object>} Result object with success status and error messages if applicable
     */
    async login(username, password) {
        try {
            // Send login request to the server
            const response = await this.httpClient.post('/auth/login', { username, password });

            if (response.token) {
                // Store authentication data if login successful
                this.token = response.token;
                this.user = response.user;

                // Persist authentication data to localStorage
                localStorage.setItem('token', this.token);
                localStorage.setItem('user', JSON.stringify(this.user));

                // Notify the application of successful login
                eventBus.publish('auth:login', { user: this.user });
                return { success: true };
            } else {
                return { success: false, error: response.message || 'Login failed' };
            }
        } catch (error) {
            console.error('Login error:', error);

            // Check if response is JSON-formatted and contains field-specific errors
            if (error.errors) {
                return {
                    success: false,
                    error: error.message || 'Login failed',
                    errors: error.errors
                };
            }

            return { success: false, error: error.message || 'Network error' };
        }
    }

    /**
     * Registers a new user with the provided information
     * @param {string} username - Desired username
     * @param {string} email - User's email address
     * @param {string} password - User's password
     * @returns {Promise<Object>} Result object with success status and error messages if applicable
     */
    async register(username, email, password) {
        try {
            // Send registration request to the server
            const response = await this.httpClient.post('/users', {
                username,
                email,
                password
            });

            if (response.user_id) {
                return { success: true };
            } else {
                return { success: false, error: response.message || 'Registration failed' };
            }
        } catch (error) {
            console.error('Register error:', error);

            // Check if the error is related to a duplicate or other identified error
            if (error.message) {
                // If the message comes directly from the backend, display it as is
                if (error.message.includes('Email address is already in use') ||
                    error.message.includes('Username is already in use') ||
                    error.message.includes('An account with this information already exists')) {
                    return {
                        success: false,
                        error: error.message
                    };
                }

                // Check error message generally
                if (error.message.includes('Database error')) {
                    const errorString = error.toString().toLowerCase();

                    if (errorString.includes('duplicate') && errorString.includes('email')) {
                        return {
                            success: false,
                            error: 'Email address is already in use'
                        };
                    } else if (errorString.includes('duplicate') && errorString.includes('username')) {
                        return {
                            success: false,
                            error: 'Username is already in use'
                        };
                    }
                }
            }

            // Check if response is JSON-formatted and contains field-specific errors
            if (error.errors) {
                return {
                    success: false,
                    error: error.message || 'Registration failed',
                    errors: error.errors
                };
            }

            return { success: false, error: error.message || 'Registration failed. Please check your information and try again.' };
        }
    }

    /**
     * Logs out the current user and clears all authentication data
     * Removes stored credentials and notifies the application
     */
    logout() {
        this.token = null;
        this.user = null;
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        eventBus.publish('auth:logout');
    }

    /**
     * Gets the current user's information
     * @returns {Object|null} User object if authenticated, null otherwise
     */
    getUser() {
        return this.user;
    }

    /**
     * Gets the current authentication token
     * @returns {string|null} JWT token if authenticated, null otherwise
     */
    getToken() {
        return this.token;
    }
}

export default new Auth();
