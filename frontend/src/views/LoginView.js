import auth from "../core/Auth.js";
import { eventBus } from "../core/EventBus.js";

/**
 * Login view component
 * Handles user authentication UI and form submission
 */
export default class LoginView {
   /**
    * Renders the login form with error/success messages
    * @returns {string} HTML markup for the login view
    */
   static render() {
      // Check if there's an error message in session storage
      const errorMsg = sessionStorage.getItem("loginError") || "";
      const showError = errorMsg ? "block" : "none";
      const successMsg = sessionStorage.getItem("registrationSuccess") || "";
      const showSuccess = successMsg ? "block" : "none";

      return `
            <div class="wrapper">
                <form id="login-form">
                    <h1>Log in</h1>

                    ${
                       successMsg
                          ? `<div class="success-message" style="display: ${showSuccess};">${successMsg}</div>`
                          : ""
                    }
                    ${
                       errorMsg
                          ? `<div class="error-message" style="display: ${showError};">${errorMsg}</div>`
                          : ""
                    }

                    <div class="input-box">
                        <input type="text" id="username" placeholder="Username" required>
                        <box-icon type='solid' name='user' color='white'></box-icon>
                    </div>

                    <div class="input-box">
                        <input type="password" id="password" placeholder="Password" required>
                        <box-icon name='lock-alt' type='solid' color='white'></box-icon>
                    </div>

                    <div class="remember-forgot">
                        <label><input type="checkbox" id="remember"> Remember me</label>
                        <a href="#">Forgot password?</a>
                    </div>

                    <button type="submit" class="btn">Log in</button>

                    <div class="register-link">
                        <p>Not registered yet? <a href="/register">Register</a></p>
                    </div>
                </form>
            </div>
        `;
   }

   /**
    * Initializes the login view functionality
    * Sets up form submission and input handlers
    * @returns {Promise<void>}
    */
   static async initialize() {
      // Check URL parameters
      const urlParams = new URLSearchParams(window.location.search);
      if (urlParams.get("registered") === "true") {
         sessionStorage.setItem(
            "registrationSuccess",
            "Registration successful! You can now log in."
         );
         // Remove parameter from URL
         window.history.replaceState({}, document.title, "/login");
         // Reload the page to show the message
         window.location.reload();
         return;
      }

      const form = document.getElementById("login-form");

      // Remove old event handlers
      if (form.hasSubmitListener) {
         form.removeEventListener("submit", form.submitHandler);
      }

      // Define form submit handler
      form.submitHandler = async (e) => {
         e.preventDefault();
         e.stopPropagation();

         const username = document.getElementById("username").value;
         const password = document.getElementById("password").value;

         // Check that fields are not empty
         if (!username || !password) {
            sessionStorage.setItem("loginError", "Please fill in all fields");
            window.location.reload();
            return false;
         }

         try {
            const result = await auth.login(username, password);

            if (result.success) {
               // Clear errors before navigating
               sessionStorage.removeItem("loginError");
               window.location.href = "/dashboard";
            } else {
               sessionStorage.setItem(
                  "loginError",
                  result.error || "Login failed"
               );
               window.location.reload();
            }
         } catch (error) {
            sessionStorage.setItem(
               "loginError",
               error.message || "Network error"
            );
            window.location.reload();
         }

         return false;
      };

      form.addEventListener("submit", form.submitHandler);
      form.hasSubmitListener = true;

      // When user starts typing, clear error messages - but don't remove from display immediately
      document.querySelectorAll("input").forEach((input) => {
         input.addEventListener("input", () => {
            sessionStorage.removeItem("loginError");
         });
      });

      // Clear success message when page has loaded
      setTimeout(() => {
         sessionStorage.removeItem("registrationSuccess");
      }, 2000);
   }

   /**
    * Cleans up event listeners when component is unmounted
    */
   static cleanup() {
      const form = document.getElementById("login-form");

      if (form && form.hasSubmitListener) {
         form.removeEventListener("submit", form.submitHandler);
         form.hasSubmitListener = false;
      }
   }
}
