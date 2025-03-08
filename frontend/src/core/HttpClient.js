import auth from "./Auth.js";

/**
 * HTTP client for making API requests
 * Handles authentication, error handling, and common request methods
 */
export default class HttpClient {
   /**
    * Creates a new HttpClient instance
    * @param {string} baseUrl - Optional base URL override (defaults to environment variable or localhost)
    */
   constructor(baseUrl = "") {
      this.baseUrl =
         import.meta.env.VITE_API_URL || "http://localhost:3000/api";

      if (baseUrl) {
         this.baseUrl = baseUrl;
      }
   }

   /**
    * Makes an HTTP request to the specified endpoint
    * @param {string} endpoint - API endpoint to call
    * @param {Object} options - Request options (method, headers, body, etc.)
    * @returns {Promise<Object|null>} Response data or null for 204 responses
    * @throws {Error} Enhanced error with status and validation details
    */
   async request(endpoint, options = {}) {
      const url = this.baseUrl + endpoint;

      // Set default headers for all requests
      const defaultOptions = {
         headers: {
            "Content-Type": "application/json",
         },
      };

      // Merge default options with provided options
      const requestOptions = { ...defaultOptions, ...options };

      // Add authentication token if available
      if (auth.getToken()) {
         requestOptions.headers.Authorization = `Bearer ${auth.getToken()}`;
      }

      try {
         const response = await fetch(url, requestOptions);

         if (!response.ok) {
            // Handle authentication failures by logging out
            if (response.status === 401) {
               auth.logout();
               window.location.href = "/login";
            }

            const errorData = await response.json();

            // Create error object with both message and possible validation errors
            const error = new Error(errorData.message || "Network error");

            // Add HTTP status code to the error
            error.status = response.status;

            // Add validation errors to the error object if they exist
            if (errorData.errors) {
               error.errors = errorData.errors;
            }

            throw error;
         }

         // Return null for No Content responses
         if (response.status === 204) {
            return null;
         }

         return await response.json();
      } catch (error) {
         console.error("HttpClient error:", error);
         throw error;
      }
   }

   /**
    * Performs a GET request
    * @param {string} endpoint - API endpoint to call
    * @returns {Promise<Object|null>} Response data
    */
   async get(endpoint) {
      return this.request(endpoint, { method: "GET" });
   }

   /**
    * Performs a POST request with JSON data
    * @param {string} endpoint - API endpoint to call
    * @param {Object} data - Data to send in request body
    * @returns {Promise<Object|null>} Response data
    */
   async post(endpoint, data) {
      return this.request(endpoint, {
         method: "POST",
         body: JSON.stringify(data),
      });
   }

   /**
    * Performs a PUT request with JSON data
    * @param {string} endpoint - API endpoint to call
    * @param {Object} data - Data to send in request body
    * @returns {Promise<Object|null>} Response data
    */
   async put(endpoint, data) {
      return this.request(endpoint, {
         method: "PUT",
         body: JSON.stringify(data),
      });
   }

   /**
    * Performs a DELETE request
    * @param {string} endpoint - API endpoint to call
    * @returns {Promise<Object|null>} Response data
    */
   async delete(endpoint) {
      return this.request(endpoint, { method: "DELETE" });
   }
}
