import auth from '../core/Auth.js';

export default class RegisterView {
    static render() {
        // Tarkistetaan, onko session storagessa virheilmoitus
        const errorMsg = sessionStorage.getItem('registerError') || '';
        const showError = errorMsg ? 'block' : 'none';

        return `
            <div class="wrapper">
                <form id="register-form">
                    <h1>Rekisteröidy</h1>

                    ${errorMsg ? `<div class="error-message" style="display: ${showError};">${errorMsg}</div>` : ''}

                    <div class="input-box">
                        <input type="text" id="username" placeholder="Käyttäjätunnus" required>
                        <box-icon type='solid' name='user' color='white'></box-icon>
                    </div>

                    <div class="input-box">
                        <input type="email" id="email" placeholder="Sähköposti" required>
                        <box-icon name='envelope' color='white'></box-icon>
                    </div>

                    <div class="input-box">
                        <input type="password" id="password" placeholder="Salasana" required>
                        <box-icon name='lock-alt' type='solid' color='white'></box-icon>
                    </div>

                    <button type="submit" class="btn">Rekisteröidy</button>

                    <div class="register-link">
                        <p>Onko sinulla jo tili? <a href="/login">Kirjaudu sisään</a></p>
                    </div>
                </form>
            </div>
        `;
    }

    static async initialize() {
        const form = document.getElementById('register-form');

        // Poista vanhat tapahtumankäsittelijät
        if (form.hasSubmitListener) {
            form.removeEventListener('submit', form.submitHandler);
        }

        // Määritellään form submit handler
        form.submitHandler = async (e) => {
            e.preventDefault();
            e.stopPropagation();

            const username = document.getElementById('username').value;
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;

            // Client-puolen validointi
            if (!username || !email || !password) {
                sessionStorage.setItem('registerError', 'Täytä kaikki kentät');
                window.location.reload();
                return false;
            }

            if (username.length < 3 || username.length > 20) {
                sessionStorage.setItem('registerError', 'Käyttäjätunnuksen pituuden tulee olla 3-20 merkkiä');
                window.location.reload();
                return false;
            }

            if (!/^[a-zA-Z0-9]+$/.test(username)) {
                sessionStorage.setItem('registerError', 'Käyttäjätunnus saa sisältää vain kirjaimia ja numeroita');
                window.location.reload();
                return false;
            }

            if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
                sessionStorage.setItem('registerError', 'Anna kelvollinen sähköpostiosoite');
                window.location.reload();
                return false;
            }

            if (password.length < 8) {
                sessionStorage.setItem('registerError', 'Salasanan tulee olla vähintään 8 merkkiä pitkä');
                window.location.reload();
                return false;
            }

            try {
                const result = await auth.register(username, email, password);

                if (result.success) {
                    // Tyhjennä rekisteröintivirheet
                    sessionStorage.removeItem('registerError');
                    window.location.href = '/login?registered=true';
                } else {
                    sessionStorage.setItem('registerError', result.error || 'Rekisteröinti epäonnistui');
                    window.location.reload();
                }
            } catch (error) {
                sessionStorage.setItem('registerError', error.message || 'Verkkovirhe');
                window.location.reload();
            }

            return false;
        };

        form.addEventListener('submit', form.submitHandler);
        form.hasSubmitListener = true;

        // Kun käyttäjä alkaa kirjoittaa, tyhjennä virheilmoitukset
        document.querySelectorAll('input').forEach(input => {
            input.addEventListener('input', () => {
                sessionStorage.removeItem('registerError');
            });
        });
    }

    static cleanup() {
        const form = document.getElementById('register-form');

        if (form && form.hasSubmitListener) {
            form.removeEventListener('submit', form.submitHandler);
            form.hasSubmitListener = false;
        }
    }
}
