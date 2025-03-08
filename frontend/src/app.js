import "./style.css";
import Router from "./core/Router.js";
import auth from "./core/Auth.js";

// Views
import LoginView from "./views/LoginView.js";
import RegisterView from "./views/RegisterView.js";
import DashboardView from "./views/DashboardView.js";

// Create router
const router = new Router();

// Define routes
router
   .addRoute("/login", LoginView)
   .addRoute("/register", RegisterView)
   .addRoute("/dashboard", DashboardView, true)
   .addRoute("/", {
      render: () =>
         '<div class="welcome-screen">Welcome to the Health Diary application! <a href="/login">Log in</a></div>',
   })
   .addRoute("*", {
      render: () =>
         '<div class="not-found">404 - Page not found <a href="/">Return to home page</a></div>',
   });

// Check authentication and redirect if necessary
if (auth.isAuthenticated()) {
   // If user is logged in, allow dashboard access
   router.navigate("/dashboard");
} else {
   // Check current location
   const currentPath = window.location.pathname;
   // Allow staying on registration page and home page without login
   if (currentPath === "/register" || currentPath === "/") {
      router.navigate(currentPath);
   } else {
      // Otherwise redirect to login page
      router.navigate("/login");
   }
}

// Start the router
router.start();
