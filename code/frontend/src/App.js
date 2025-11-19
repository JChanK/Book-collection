import { Header } from './components/Header.js';
import { HomePage } from './pages/HomePage.js';
import { BooksPage } from './pages/BooksPage.js';
import { LoginPage } from './pages/LoginPage.js';
import { apiService } from './services/api.js';

class App {
    constructor() {
        this.currentPage = null;
        this.routes = {
            '/': HomePage,
            '/books': BooksPage,
            '/login': LoginPage,
            '/register': () => this.renderRegisterPage(),
            '/authors': () => this.renderAuthorsPage(),
            '/collection': () => this.renderCollectionPage(),
            '/profile': () => this.renderProfilePage(),
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
        const PageComponent = this.routes[hash];

        if (!PageComponent) {
            this.render404();
            return;
        }

        const header = new Header();
        document.getElementById('app').innerHTML = `
            ${header.render()}
            <main class="main">
                ${await this.renderPage(PageComponent)}
            </main>
            ${this.renderFooter()}
        `;
    }

    async renderPage(PageComponent) {
        try {
            if (typeof PageComponent === 'function') {
                this.currentPage = new PageComponent();
            } else {
                this.currentPage = new PageComponent();
            }
            return await this.currentPage.render();
        } catch (error) {
            return `
                <div class="container">
                    <div class="error">
                        Error loading page: ${error.message}
                    </div>
                </div>
            `;
        }
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

    // Navigation methods
    async showBookDetail(bookId) {
        try {
            const book = await apiService.getBookById(bookId);
            // Implement book detail modal or page
            alert(`Book: ${book.title}\nAuthor: ${book.authors?.[0]?.name}\nYear: ${book.year}`);
        } catch (error) {
            alert('Error loading book details');
        }
    }

    async searchBooks() {
        const searchInput = document.getElementById('searchInput');
        const query = searchInput.value.trim();

        if (query) {
            window.location.hash = `#/books?search=${encodeURIComponent(query)}`;
        }
    }

    async handleLogin(event) {
        event.preventDefault();
        const formData = new FormData(event.target);
        const email = formData.get('email');
        const password = formData.get('password');

        try {
            const response = await apiService.login(email, password);
            localStorage.setItem('token', response.token);
            localStorage.setItem('user', JSON.stringify({
                id: response.id,
                email: response.email,
                displayName: response.displayName
            }));

            window.location.hash = '#/';
            this.render();
        } catch (error) {
            alert('Login failed: ' + (error.response?.data?.message || error.message));
        }
    }

    logout() {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.hash = '#/';
        this.render();
    }

    // Placeholder methods for other pages
    renderRegisterPage() {
        return `
            <div class="container">
                <div class="form-container">
                    <h2>Register for BookTracker</h2>
                    <form onsubmit="event.preventDefault(); alert('Registration will be implemented soon!')">
                        <div class="form-group">
                            <label for="regEmail">Email:</label>
                            <input type="email" id="regEmail" required>
                        </div>
                        <div class="form-group">
                            <label for="regDisplayName">Display Name:</label>
                            <input type="text" id="regDisplayName" required>
                        </div>
                        <div class="form-group">
                            <label for="regPassword">Password:</label>
                            <input type="password" id="regPassword" required>
                        </div>
                        <button type="submit" class="btn btn-primary" style="width: 100%;">Register</button>
                    </form>
                </div>
            </div>
        `;
    }

    renderAuthorsPage() {
        return `<div class="container"><h1>Authors Page - Coming Soon</h1></div>`;
    }

    renderCollectionPage() {
        return `<div class="container"><h1>My Collection - Coming Soon</h1></div>`;
    }

    renderProfilePage() {
        return `<div class="container"><h1>Profile Page - Coming Soon</h1></div>`;
    }
}

// Initialize app
const app = new App();
window.app = app;