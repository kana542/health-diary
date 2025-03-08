import auth from "../core/Auth.js";

/**
 * Register view component
 * Handles user registration UI, form submission and validation
 */
export default class RegisterView {
   /**
    * Renders the registration form with error messages if present
    * @returns {string} HTML markup for the registration view
    */
   static render() {
      // Check if there's an error message in session storage
      const errorMsg = sessionStorage.getItem("registerError") || "";
      const showError = errorMsg ? "block" : "none";

      return `
            <div class="wrapper">
                <form id="register-form">
                    <h1>Register</h1>

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
                        <input type="email" id="email" placeholder="Email" required>
                        <box-icon name='envelope' color='white'></box-icon>
                    </div>

                    <div class="input-box">
                        <input type="password" id="password" placeholder="Password" required>
                        <box-icon name='lock-alt' type='solid' color='white'></box-icon>
                    </div>

                    <button type="submit" class="btn">Register</button>

                    <div class="register-link">
                        <p>Already have an account? <a href="/login">Log in</a></p>
                    </div>
                </form>
            </div>
        `;
   }

   /**
    * Initializes the registration form functionality
    * Sets up form submission, validation, and input handlers
    * @returns {Promise<void>}
    */
   static async initialize() {
      const form = document.getElementById("register-form");

      // Remove old event handlers
      if (form.hasSubmitListener) {
         form.removeEventListener("submit", form.submitHandler);
      }

      // Define form submit handler
      form.submitHandler = async (e) => {
         e.preventDefault();
         e.stopPropagation();

         const username = document.getElementById("username").value;
         const email = document.getElementById("email").value;
         const password = document.getElementById("password").value;

         // Client-side validation
         if (!username || !email || !password) {
            sessionStorage.setItem(
               "registerError",
               "Please fill in all fields"
            );
            window.location.reload();
            return false;
         }

         if (username.length < 3 || username.length > 20) {
            sessionStorage.setItem(
               "registerError",
               "Username must be 3-20 characters long"
            );
            window.location.reload();
            return false;
         }

         if (!/^[a-zA-Z0-9]+$/.test(username)) {
            sessionStorage.setItem(
               "registerError",
               "Username can only contain letters and numbers"
            );
            window.location.reload();
            return false;
         }

         if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            sessionStorage.setItem(
               "registerError",
               "Please enter a valid email address"
            );
            window.location.reload();
            return false;
         }

         if (password.length < 8) {
            sessionStorage.setItem(
               "registerError",
               "Password must be at least 8 characters long"
            );
            window.location.reload();
            return false;
         }

         try {
            const result = await auth.register(username, email, password);

            if (result.success) {
               // Clear registration errors
               sessionStorage.removeItem("registerError");
               window.location.href = "/login?registered=true";
            } else {
               sessionStorage.setItem(
                  "registerError",
                  result.error || "Registration failed"
               );
               window.location.reload();
            }
         } catch (error) {
            sessionStorage.setItem(
               "registerError",
               error.message || "Network error"
            );
            window.location.reload();
         }

         return false;
      };

      form.addEventListener("submit", form.submitHandler);
      form.hasSubmitListener = true;

      // When user starts typing, clear error messages
      document.querySelectorAll("input").forEach((input) => {
         input.addEventListener("input", () => {
            sessionStorage.removeItem("registerError");
         });
      });
   }

   /**
    * Cleans up event listeners when component is unmounted
    */
   static cleanup() {
      const form = document.getElementById("register-form");

      if (form && form.hasSubmitListener) {
         form.removeEventListener("submit", form.submitHandler);
         form.hasSubmitListener = false;
      }
   }
}
