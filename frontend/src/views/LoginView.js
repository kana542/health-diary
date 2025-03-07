import auth from '../core/Auth.js';
import { eventBus } from '../core/EventBus.js';

export default class LoginView {
    static render() {
        // Tarkistetaan, onko session storagessa virheilmoitus
        const errorMsg = sessionStorage.getItem('loginError') || '';
        const showError = errorMsg ? 'block' : 'none';
        const successMsg = sessionStorage.getItem('registrationSuccess') || '';
        const showSuccess = successMsg ? 'block' : 'none';

        return `
            <div class="wrapper">
                <form id="login-form">
                    <h1>Kirjaudu sisään</h1>

                    ${successMsg ? `<div class="success-message" style="display: ${showSuccess};">${successMsg}</div>` : ''}
                    ${errorMsg ? `<div class="error-message" style="display: ${showError};">${errorMsg}</div>` : ''}

                    <div class="input-box">
                        <input type="text" id="username" placeholder="Käyttäjätunnus" required>
                        <box-icon type='solid' name='user' color='white'></box-icon>
                    </div>

                    <div class="input-box">
                        <input type="password" id="password" placeholder="Salasana" required>
                        <box-icon name='lock-alt' type='solid' color='white'></box-icon>
                    </div>

                    <div class="remember-forgot">
                        <label><input type="checkbox" id="remember"> Muista minut</label>
                        <a href="#">Unohditko salasanan?</a>
                    </div>

                    <button type="submit" class="btn">Kirjaudu</button>

                    <div class="register-link">
                        <p>Etkö ole vielä rekisteröitynyt? <a href="/register">Rekisteröidy</a></p>
                    </div>
                </form>
            </div>
        `;
    }

    static async initialize() {
        // Tarkistetaan URL-parametrit
        const urlParams = new URLSearchParams(window.location.search);
        if (urlParams.get('registered') === 'true') {
            sessionStorage.setItem('registrationSuccess', 'Rekisteröinti onnistui! Voit nyt kirjautua sisään.');
            // Poistetaan parametri URL:sta
            window.history.replaceState({}, document.title, '/login');
            // Ladataan sivu uudelleen, että viesti näkyy
            window.location.reload();
            return;
        }

        const form = document.getElementById('login-form');

        // Poista vanhat tapahtumankäsittelijät
        if (form.hasSubmitListener) {
            form.removeEventListener('submit', form.submitHandler);
        }

        // Määritellään form submit handler
        form.submitHandler = async (e) => {
            e.preventDefault();
            e.stopPropagation();

            const username = document.getElementById('username').value;
            const password = document.getElementById('password').value;

            // Tarkistetaan ettei kentät ole tyhjiä
            if (!username || !password) {
                sessionStorage.setItem('loginError', 'Täytä kaikki kentät');
                window.location.reload();
                return false;
            }

            try {
                const result = await auth.login(username, password);

                if (result.success) {
                    // Tyhjennä virheet ennen siirtymistä
                    sessionStorage.removeItem('loginError');
                    window.location.href = '/dashboard';
                } else {
                    sessionStorage.setItem('loginError', result.error || 'Kirjautuminen epäonnistui');
                    window.location.reload();
                }
            } catch (error) {
                sessionStorage.setItem('loginError', error.message || 'Verkkovirhe');
                window.location.reload();
            }

            return false;
        };

        form.addEventListener('submit', form.submitHandler);
        form.hasSubmitListener = true;

        // Kun käyttäjä alkaa kirjoittaa, tyhjennä virheilmoitukset - ei silti poista näkyvistä heti
        document.querySelectorAll('input').forEach(input => {
            input.addEventListener('input', () => {
                sessionStorage.removeItem('loginError');
            });
        });

        // Tyhjennä onnistumisviesti kun sivu on ladattu
        setTimeout(() => {
            sessionStorage.removeItem('registrationSuccess');
        }, 2000);
    }

    static cleanup() {
        const form = document.getElementById('login-form');

        if (form && form.hasSubmitListener) {
            form.removeEventListener('submit', form.submitHandler);
            form.hasSubmitListener = false;
        }
    }
}
