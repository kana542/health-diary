export default class Router {
   constructor(routes = [], rootElement = 'app') {
       this.routes = routes;
       this.rootElement = document.getElementById(rootElement);
       this.currentView = null;

       window.addEventListener('popstate', () => this.navigate(window.location.pathname));

       document.addEventListener('click', (e) => {
           const { target } = e;
           if (target.tagName === 'A' && target.href.includes(window.location.origin)) {
               e.preventDefault();
               this.navigate(target.getAttribute('href'));
           }
       });
   }

   addRoute(path, view, requiresAuth = false) {
       this.routes.push({ path, view, requiresAuth });
       return this;
   }

   async navigate(path) {
       if (path.includes('://')) {
           const url = new URL(path);
           path = url.pathname;
       }

       const route = this.routes.find(route => route.path === path) ||
                     this.routes.find(route => route.path === '*');

       if (route.requiresAuth && !localStorage.getItem('token')) {
           this.navigate('/login');
           return;
       }

       window.history.pushState({}, '', path);

       if (this.currentView && this.currentView.cleanup) {
           this.currentView.cleanup();
       }

       this.rootElement.innerHTML = route.view.render();

       if (route.view.initialize) {
           this.currentView = route.view;
           await route.view.initialize();
       }
   }

   start() {
       this.navigate(window.location.pathname);
   }
}
