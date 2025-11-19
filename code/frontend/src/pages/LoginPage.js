export class LoginPage {
    render() {
        return `
            <div class="container">
                <div class="form-container">
                    <h2>Login to BookTracker</h2>
                    <form id="loginForm" onsubmit="app.handleLogin(event)">
                        <div class="form-group">
                            <label for="email">Email:</label>
                            <input type="email" id="email" name="email" required>
                        </div>
                        <div class="form-group">
                            <label for="password">Password:</label>
                            <input type="password" id="password" name="password" required>
                        </div>
                        <button type="submit" class="btn btn-primary" style="width: 100%;">Login</button>
                    </form>
                    <p style="text-align: center; margin-top: 1rem;">
                        Don't have an account? <a href="#/register">Register here</a>
                    </p>
                </div>
            </div>
        `;
    }
}