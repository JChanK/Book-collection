export class Header {
    constructor() {
        this.isLoggedIn = !!localStorage.getItem('token');
        this.user = JSON.parse(localStorage.getItem('user') || '{}');
    }

    render() {
        return `
            <header class="header">
                <div class="container">
                    <nav class="nav">
                        <div class="logo">BookTracker</div>
                        <ul class="nav-links">
                            <li><a href="#/" class="nav-link ${location.hash === '#/' ? 'active' : ''}">Home</a></li>
                            <li><a href="#/books" class="nav-link ${location.hash === '#/books' ? 'active' : ''}">Books</a></li>
                            <li><a href="#/authors" class="nav-link ${location.hash === '#/authors' ? 'active' : ''}">Authors</a></li>
                            ${this.isLoggedIn ? `
                                <li><a href="#/collection" class="nav-link ${location.hash === '#/collection' ? 'active' : ''}">My Collection</a></li>
                                <li><a href="#/profile" class="nav-link ${location.hash === '#/profile' ? 'active' : ''}">Profile</a></li>
                            ` : ''}
                        </ul>
                        <div class="auth-buttons">
                            ${this.isLoggedIn ? `
                                <span>Welcome, ${this.user.displayName}</span>
                                <button class="btn btn-secondary" onclick="app.logout()">Logout</button>
                            ` : `
                                <a href="#/login" class="btn btn-secondary">Login</a>
                                <a href="#/register" class="btn btn-primary">Register</a>
                            `}
                        </div>
                    </nav>
                </div>
            </header>
        `;
    }
}