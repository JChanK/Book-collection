import { BookCard } from '../components/BookCard.js';
import { apiService } from '../services/api.js';

export class HomePage {
    async render() {
        try {
            const booksData = await apiService.getBooks(0, 8);
            const books = booksData.content || [];

            return `
                <div class="container">
                    <div class="hero">
                        <h1>Welcome to BookTracker</h1>
                        <p>Your personal library management system</p>
                        <div class="search-container">
                            <input type="text" id="searchInput" class="search-input" placeholder="Search books...">
                            <button class="btn btn-primary" onclick="app.searchBooks()">Search</button>
                        </div>
                    </div>

                    <section class="featured-books">
                        <h2>Featured Books</h2>
                        <div class="books-grid">
                            ${books.map(book => new BookCard(book).render()).join('')}
                        </div>
                    </section>

                    <section class="stats">
                        <div style="display: flex; gap: 2rem; justify-content: center; margin-top: 3rem;">
                            <div style="text-align: center;">
                                <h3>${booksData.totalElements || 0}</h3>
                                <p>Books Available</p>
                            </div>
                            <div style="text-align: center;">
                                <h3>${new Set(books.flatMap(b => b.authors || [])).size}</h3>
                                <p>Authors</p>
                            </div>
                            <div style="text-align: center;">
                                <h3>5</h3>
                                <p>Genres</p>
                            </div>
                        </div>
                    </section>
                </div>
            `;
        } catch (error) {
            return `
                <div class="container">
                    <div class="error">
                        Error loading books: ${error.message}
                    </div>
                </div>
            `;
        }
    }
}