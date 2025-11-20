import { Header } from './components/Header.js';
import { MainPage } from './pages/MainPage.js';
import { CatalogPage } from './pages/CatalogPage.js';
import { AuthPage } from './pages/AuthPage.js';
import { SearchPage } from './pages/SearchPage.js';
import { AuthorPage } from './pages/AuthorPage.js';
import { BookPage } from './pages/BookPage.js';
import { ProfilePage } from './pages/ProfilePage.js';

class App {
    constructor() {
        this.currentPage = null;
        this.authPage = null;
        this.catalogPage = null;
        this.searchPage = null;
        this.profilePage = null;

        // Базовые маршруты без параметров
        this.routes = {
            '/': MainPage,
            '/catalog': CatalogPage,
            '/auth': AuthPage,
            '/search': SearchPage,
            '/profile': ProfilePage,
            '/books': CatalogPage,
            '/login': AuthPage,
            '/register': AuthPage,
        };

        this.init();
    }

    init() {
        this.setupRouting();
        this.render();
    }

    setupRouting() {
        window.addEventListener('hashchange', () => this.render());
        window.addEventListener('load', () => this.render());
    }

    async render() {
        const hash = window.location.hash.slice(1) || '/';

        // Определяем какой PageClass использовать на основе хеша
        const PageClass = this.getPageClassForHash(hash);

        console.log('Current hash:', hash, 'PageClass:', PageClass);

        if (!PageClass) {
            this.render404();
            return;
        }

        try {
            const header = new Header();
            const pageContent = await this.renderPageContent(PageClass, hash);

            document.getElementById('app').innerHTML = `
                ${header.render()}
                <main class="main">
                    ${pageContent}
                </main>
                ${this.renderFooter()}
            `;

            this.initUserMenu();

        } catch (error) {
            console.error('Render error:', error);
            this.renderError(error);
        }
    }

    // Новый метод для определения класса страницы на основе хеша
    getPageClassForHash(hash) {
        // Проверяем статические маршруты
        if (this.routes[hash]) {
            return this.routes[hash];
        }

        // Проверяем динамические маршруты
        if (hash.startsWith('/author/')) {
            return AuthorPage;
        }

        if (hash.startsWith('/book/')) {
            return BookPage;
        }

        // В метод getPageClassForHash добавить:
        if (hash === '#/profile' || hash.startsWith('#/profile')) {
            return ProfilePage;
        }

        return null;
    }

    async renderPageContent(PageClass, hash) {
        try {
            // Для AuthPage используем синглтон
            if (PageClass === AuthPage) {
                if (!this.authPage) {
                    this.authPage = new AuthPage();
                }
                this.currentPage = this.authPage;
                return await this.authPage.render();
            }

            // Для CatalogPage используем синглтон
            if (PageClass === CatalogPage) {
                if (!this.catalogPage) {
                    this.catalogPage = new CatalogPage();
                }
                this.currentPage = this.catalogPage;
                return await this.catalogPage.render();
            }

            // Для SearchPage используем синглтон
            if (PageClass === SearchPage) {
                if (!this.searchPage) {
                    this.searchPage = new SearchPage();
                }
                this.currentPage = this.searchPage;
                return await this.searchPage.render();
            }

            // Для ProfilePage используем синглтон
            if (PageClass === ProfilePage) {
                if (!this.profilePage) {
                    this.profilePage = new ProfilePage();
                }
                this.currentPage = this.profilePage;
                return await this.profilePage.render();
            }

            // Для AuthorPage и BookPage создаем новые экземпляры
            if (PageClass === AuthorPage || PageClass === BookPage) {
                this.currentPage = new PageClass();
                return await this.currentPage.render();
            }

            // Для других страниц создаем новый экземпляр
            this.currentPage = new PageClass();
            return await this.currentPage.render();

        } catch (error) {
            console.error('Page render error:', error);
            throw error;
        }
    }

    // Navigation methods
    navigateToProfile() {
        window.location.hash = '#/profile';
    }

    navigateToSearch() {
        window.location.hash = '#/search';
    }

    renderError(error) {
        document.getElementById('app').innerHTML = `
            <div class="container">
                <div class="error">
                    <h2>Application Error</h2>
                    <p>${error.message}</p>
                    <button onclick="location.reload()" class="btn btn-primary">Reload Page</button>
                </div>
            </div>
        `;
    }

    render404() {
        document.getElementById('app').innerHTML = `
            <div class="container">
                <div style="text-align: center; padding: 4rem;">
                    <h1>404 - Page Not Found</h1>
                    <p>The page you're looking for doesn't exist.</p>
                    <a href="#/" class="btn btn-primary">Go Home</a>
                </div>
            </div>
        `;
    }

    renderFooter() {
        return `
            <footer class="footer">
                <div class="container">
                    <p>&copy; 2024 BookTracker. All rights reserved.</p>
                </div>
            </footer>
        `;
    }

    // Navigation methods
    navigateToCatalog() {
        window.location.hash = '#/catalog';
    }

    navigateToAuth(mode = 'signin') {
        if (this.authPage) {
            this.authPage.mode = mode;
        }
        window.location.hash = '#/auth';
    }

    switchAuthMode(mode) {
        if (this.authPage) {
            this.authPage.mode = mode;
            this.render();
        }
    }

    async handleAuth(event) {
        event.preventDefault();
        const formData = new FormData(event.target);

        if (this.authPage.mode === 'signin') {
            await this.handleSignIn(formData);
        } else {
            await this.handleSignUp(formData);
        }
    }

    async handleSignIn(formData) {
        const login = formData.get('login');
        const password = formData.get('password');

        try {
            console.log('Sign in attempt:', { login, password });

            // Mock authentication
            if (login && password) {
                this.handleAuthSuccess({
                    token: 'mock-token',
                    id: 1,
                    email: login.includes('@') ? login : 'user@example.com',
                    displayName: 'Test User'
                });
            } else {
                alert('Please fill all fields');
            }
        } catch (error) {
            alert('Sign in failed: ' + error.message);
        }
    }

    async handleSignUp(formData) {
        const email = formData.get('email');
        const displayName = formData.get('displayName');
        const password = formData.get('password');
        const confirmPassword = formData.get('confirmPassword');

        if (password !== confirmPassword) {
            alert('Passwords do not match!');
            return;
        }

        try {
            console.log('Sign up attempt:', { email, displayName, password });

            if (email && displayName && password) {
                this.handleAuthSuccess({
                    token: 'mock-token',
                    id: 1,
                    email: email,
                    displayName: displayName
                });
            } else {
                alert('Please fill all fields');
            }
        } catch (error) {
            alert('Registration failed: ' + error.message);
        }
    }

    handleAuthSuccess(response) {
        localStorage.setItem('token', response.token);
        localStorage.setItem('user', JSON.stringify({
            id: response.id,
            email: response.email,
            displayName: response.displayName
        }));

        window.location.hash = '#/';
        this.render();
    }

    initUserMenu() {
        const avatar = document.querySelector('.user-avatar');
        const menu = document.getElementById('userMenu');

        if (avatar && menu) {
            avatar.addEventListener('click', (e) => {
                e.stopPropagation();
                menu.style.display = menu.style.display === 'block' ? 'none' : 'block';
            });

            document.addEventListener('click', () => {
                menu.style.display = 'none';
            });
        }
    }

    logout() {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.hash = '#/';
        this.render();
    }

    navigateToHome() {
        window.location.hash = '#/';
    }
}

// Initialize app
const app = new App();
window.app = app;