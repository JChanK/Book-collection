import { apiService } from '../services/api.js';

export class AuthPage {
    constructor() {
        this.mode = 'signin'; // 'signin' или 'signup'
    }

    render() {
        return `
            <div class="container">
                <div class="auth-container">
                    <div class="auth-tabs">
                        <button class="auth-tab ${this.mode === 'signin' ? 'active' : ''}" 
                                onclick="app.authPage.switchMode('signin')">
                            Sign In
                        </button>
                        <button class="auth-tab ${this.mode === 'signup' ? 'active' : ''}" 
                                onclick="app.authPage.switchMode('signup')">
                            Sign Up
                        </button>
                    </div>

                    <form id="authForm" onsubmit="app.authPage.handleAuth(event)" class="auth-form">
                        ${this.mode === 'signin' ? this.renderSignInForm() : this.renderSignUpForm()}
                        
                        <button type="submit" class="btn btn-primary auth-submit">
                            ${this.mode === 'signin' ? 'Sign In' : 'Sign Up'}
                        </button>
                    </form>
                </div>
            </div>
        `;
    }

    renderSignInForm() {
        return `
            <div class="form-group">
                <label for="login">Email or Username:</label>
                <input type="text" id="login" name="login" required>
            </div>
            <div class="form-group">
                <label for="password">Password:</label>
                <input type="password" id="password" name="password" required>
            </div>
        `;
    }

    renderSignUpForm() {
        return `
            <div class="form-group">
                <label for="username">Username:</label>
                <input type="text" id="username" name="username" required>
            </div>
            <div class="form-group">
                <label for="email">Email:</label>
                <input type="email" id="email" name="email" required>
            </div>
            <div class="form-group">
                <label for="password">Password:</label>
                <input type="password" id="password" name="password" required>
            </div>
            <div class="form-group">
                <label for="confirmPassword">Confirm Password:</label>
                <input type="password" id="confirmPassword" name="confirmPassword" required>
            </div>
        `;
    }

    switchMode(mode) {
        this.mode = mode;
        app.render();
    }

    async handleAuth(event) {
        event.preventDefault();
        const formData = new FormData(event.target);

        try {
            if (this.mode === 'signin') {
                const login = formData.get('login');
                const password = formData.get('password');
                await this.handleLogin(login, password);
            } else {
                const userData = {
                    username: formData.get('username'),
                    email: formData.get('email'),
                    password: formData.get('password'),
                    confirmPassword: formData.get('confirmPassword')
                };
                await this.handleRegister(userData);
            }
        } catch (error) {
            console.error('Auth error:', error);
            alert(error.response?.data || 'Authentication failed');
        }
    }

    async handleLogin(login, password) {
        const response = await apiService.login(login, password);

        localStorage.setItem('token', response.token);
        localStorage.setItem('user', JSON.stringify({
            id: response.userId,
            username: response.username,
            displayName: response.username, // Используем username как displayName
            avatarUrl: response.avatarUrl
        }));

        alert('Login successful!');
        window.location.hash = '#/';
        app.render();
    }

    async handleRegister(userData) {
        if (userData.password !== userData.confirmPassword) {
            throw new Error('Passwords do not match');
        }

        const response = await apiService.register(userData);

        localStorage.setItem('token', response.token);
        localStorage.setItem('user', JSON.stringify({
            id: response.userId,
            username: response.username,
            displayName: response.username, // Используем username как displayName
            avatarUrl: response.avatarUrl
        }));

        alert('Registration successful!');
        window.location.hash = '#/';
        app.render();
    }
}