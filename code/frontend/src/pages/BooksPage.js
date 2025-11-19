import { BookCard } from '../components/BookCard.js';
import { apiService } from '../services/api.js';

export class BooksPage {
    constructor() {
        this.currentPage = 0;
        this.pageSize = 12;
        this.books = [];
        this.totalPages = 0;
    }

    async render() {
        await this.loadBooks();

        return `
            <div class="container">
                <h1>All Books</h1>
                
                <div class="search-container">
                    <input type="text" id="searchInput" class="search-input" placeholder="Search books by title...">
                    <button class="btn btn-primary" onclick="app.searchBooks()">Search</button>
                </div>

                <div class="books-grid" id="booksGrid">
                    ${this.books.map(book => new BookCard(book).render()).join('')}
                </div>

                ${this.totalPages > 1 ? `
                    <div style="display: flex; justify-content: center; gap: 1rem; margin-top: 2rem;">
                        <button class="btn btn-outline" ${this.currentPage === 0 ? 'disabled' : ''} 
                                onclick="app.changePage(${this.currentPage - 1})">Previous</button>
                        <span>Page ${this.currentPage + 1} of ${this.totalPages}</span>
                        <button class="btn btn-outline" ${this.currentPage === this.totalPages - 1 ? 'disabled' : ''} 
                                onclick="app.changePage(${this.currentPage + 1})">Next</button>
                    </div>
                ` : ''}
            </div>
        `;
    }

    async loadBooks(page = 0) {
        try {
            const booksData = await apiService.getBooks(page, this.pageSize);
            this.books = booksData.content || [];
            this.totalPages = booksData.totalPages || 1;
            this.currentPage = page;
        } catch (error) {
            console.error('Error loading books:', error);
            this.books = [];
        }
    }
}