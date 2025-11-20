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
                        <div class="logo" onclick="app.navigateToHome()" style="cursor: pointer;">
                            BookTracker
                        </div>
                        <div class="nav-center">
                            <button class="nav-btn" onclick="app.navigateToCatalog()">Catalog</button>
                            <button class="nav-btn" onclick="app.navigateToSearch()">Search</button>
                        </div>
                        <div class="nav-right">
                            ${this.isLoggedIn ? `
                                <div class="user-avatar" onclick="app.toggleUserMenu()">
                                    <img src="https://ui-avatars.com/api/?name=${encodeURIComponent(this.user.displayName || 'User')}&background=random" 
                                         alt="${this.user.displayName}" class="avatar-img">
                                    <div class="user-menu" id="userMenu">
                                        <a href="#/profile">Profile</a>
                                        <a href="#/collection">My Collection</a>
                                        <button onclick="app.logout()">Logout</button>
                                    </div>
                                </div>
                            ` : `
                                <button class="nav-btn" onclick="app.navigateToAuth('signin')">Sign In</button>
                                <button class="nav-btn primary" onclick="app.navigateToAuth('signup')">Log In</button>
                            `}
                        </div>
                    </nav>
                </div>
            </header>
        `;
    }
}