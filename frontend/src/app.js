import './style.css';
import Router from './core/Router.js';
import auth from './core/Auth.js';

// Näkymät
import LoginView from './views/LoginView.js';
import RegisterView from './views/RegisterView.js';
import DashboardView from './views/DashboardView.js';

// Luo reititin
const router = new Router();

// Määrittele reitit
router.addRoute('/login', LoginView)
      .addRoute('/register', RegisterView)
      .addRoute('/dashboard', DashboardView, true)
      .addRoute('/', {
        render: () => '<div class="welcome-screen">Tervetuloa Health Diary -sovellukseen! <a href="/login">Kirjaudu sisään</a></div>'
      })
      .addRoute('*', {
        render: () => '<div class="not-found">404 - Sivua ei löydy <a href="/">Palaa etusivulle</a></div>'
      });

// Tarkista autentikointi ja ohjaa tarvittaessa
if (auth.isAuthenticated()) {
    // Jos käyttäjä on kirjautunut sisään, salli dashboard
    router.navigate('/dashboard');
} else {
    // Tarkista nykyinen sijainti
    const currentPath = window.location.pathname;
    // Salli pysyminen rekisteröintisivulla ja etusivulla kirjautumattomana
    if (currentPath === '/register' || currentPath === '/') {
        router.navigate(currentPath);
    } else {
        // Muuten ohjaa kirjautumissivulle
        router.navigate('/login');
    }
}

// Käynnistä reititin
router.start();
