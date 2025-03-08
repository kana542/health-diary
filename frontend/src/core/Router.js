/**
 * Client-side router for single-page applications
 * Handles navigation between views without page reloads
 */
export default class Router {
    /**
     * Creates a new Router instance
     * @param {Array} routes - Initial routes configuration array
     * @param {string} rootElement - ID of the DOM element where views will be rendered
     */
    constructor(routes = [], rootElement = 'app') {
        this.routes = routes;
        this.rootElement = document.getElementById(rootElement);
        this.currentView = null;

        // Listen for browser history navigation (back/forward buttons)
        window.addEventListener('popstate', () => this.navigate(window.location.pathname));

        // Intercept clicks on anchor tags to use client-side navigation
        document.addEventListener('click', (e) => {
            const { target } = e;
            // Only handle internal links (same origin)
            if (target.tagName === 'A' && target.href.includes(window.location.origin)) {
                e.preventDefault();
                this.navigate(target.getAttribute('href'));
            }
        });
    }

    /**
     * Adds a new route to the router
     * @param {string} path - URL path for the route (e.g., '/home')
     * @param {Object} view - View object with render and optionally initialize methods
     * @param {boolean} requiresAuth - Whether this route requires authentication
     * @returns {Router} Router instance for method chaining
     */
    addRoute(path, view, requiresAuth = false) {
        this.routes.push({ path, view, requiresAuth });
        return this;
    }

    /**
     * Navigates to the specified path
     * Handles route matching, authentication, view cleanup and initialization
     * @param {string} path - The path to navigate to
     * @returns {Promise<void>}
     */
    async navigate(path) {
        // Handle full URLs by extracting just the path component
        if (path.includes('://')) {
            const url = new URL(path);
            path = url.pathname;
        }

        // Find matching route or fallback to wildcard route
        const route = this.routes.find(route => route.path === path) ||
                     this.routes.find(route => route.path === '*');

        // Redirect to login if route requires authentication and user is not authenticated
        if (route.requiresAuth && !localStorage.getItem('token')) {
            this.navigate('/login');
            return;
        }

        // Update browser history
        window.history.pushState({}, '', path);

        // Clean up current view if it has a cleanup method
        if (this.currentView && this.currentView.cleanup) {
            this.currentView.cleanup();
        }

        // Render the new view
        this.rootElement.innerHTML = route.view.render();

        // Initialize the new view if it has an initialize method
        if (route.view.initialize) {
            this.currentView = route.view;
            await route.view.initialize();
        }
    }

    /**
     * Starts the router
     * Navigates to the current URL path
     */
    start() {
        this.navigate(window.location.pathname);
    }
}
