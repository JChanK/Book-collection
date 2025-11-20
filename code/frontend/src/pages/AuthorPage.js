import { apiService } from '../services/api.js';

export class AuthorPage {
    constructor() {
        this.authorId = null;
        this.author = null;
        this.books = [];
        this.allBooks = []; // Все книги для фильтрации
        this.isLoading = true;
    }

    async render() {
        const hash = window.location.hash;
        const match = hash.match(/\/author\/(\d+)/);
        this.authorId = match ? parseInt(match[1]) : null;

        if (!this.authorId) {
            return this.renderError('Author ID not specified');
        }

        await this.loadAuthorData();

        if (this.isLoading) {
            return this.renderLoading();
        }

        if (!this.author) {
            return this.renderError('Author not found');
        }

        return `
            <div class="author-container">
                <div class="author-header">
                    <div class="author-image">
                        <img src="${this.author.photoUrl || this.getDefaultAuthorImage()}" 
                             alt="${this.author.name}"
                             onerror="this.src='${this.getDefaultAuthorImage()}'">
                    </div>
                    <div class="author-info">
                        <h1 class="author-name">${this.author.name}</h1>
                        ${this.author.birthYear ? `
                            <div class="author-years">
                                ${this.author.birthYear}${this.author.deathYear ? ` - ${this.author.deathYear}` : ''}
                            </div>
                        ` : ''}
                        ${this.author.nationality ? `
                            <div class="author-nationality">${this.author.nationality}</div>
                        ` : ''}
                        ${this.books.length > 0 ? `
                            <div class="author-books-count">${this.books.length} books</div>
                        ` : ''}
                    </div>
                </div>

                ${this.author.biography ? `
                    <div class="author-biography">
                        <h2>Biography</h2>
                        <p>${this.author.biography}</p>
                    </div>
                ` : ''}

                <div class="author-books">
                    <h2>Books by ${this.author.name}</h2>
                    ${this.books.length > 0 ? this.renderBooksList() : this.renderNoBooks()}
                </div>
            </div>
        `;
    }

    async loadAuthorData() {
        try {
            console.log('Loading author data for ID:', this.authorId);

            // Загружаем данные автора
            this.author = await apiService.getAuthorById(this.authorId);
            console.log('Author data loaded:', this.author);

            // Загружаем ВСЕ книги
            const allBooksResult = await apiService.getBooks(0, 200);
            this.allBooks = allBooksResult.content || [];
            console.log('All books loaded:', this.allBooks.length);

            // Фильтруем книги по автору на фронтенде
            this.books = this.filterBooksByAuthor(this.allBooks, this.authorId);
            console.log('Filtered books for author:', this.books.length);

        } catch (error) {
            console.error('Error loading author data:', error);
            if (error.response?.status === 404) {
                this.author = null;
            } else {
                console.log('Falling back to mock data');
                this.loadMockData();
            }
        } finally {
            this.isLoading = false;
        }
    }

    // ФИЛЬТРАЦИЯ КНИГ ПО АВТОРУ НА ФРОНТЕНДЕ
    filterBooksByAuthor(books, authorId) {
        return books.filter(book => {
            // Проверяем есть ли у книги авторы и содержит ли она нужного автора
            return book.authors && book.authors.some(author => author.id === authorId);
        });
    }

    renderBooksList() {
        return `
            <div class="books-list">
                ${this.books.map(book => `
                    <div class="book-item" onclick="window.authorPage.navigateToBook(${book.id})">
                        <div class="book-content">
                            <img src="${book.coverUrl || this.getDefaultBookCover()}" 
                                 alt="${book.title}"
                                 class="book-cover"
                                 onerror="this.src='${this.getDefaultBookCover()}'">
                            <div class="book-details">
                                <h3 class="book-title">${book.title}</h3>
                                <div class="book-meta">
                                    ${book.year ? `<span class="book-year">${book.year}</span>` : ''}
                                    ${book.averageRating ? `<span class="book-rating">• ⭐ ${book.averageRating.toFixed(1)}</span>` : ''}
                                </div>
                                ${book.description ? `<p class="book-description">${this.truncateText(book.description, 100)}</p>` : ''}
                            </div>
                        </div>
                        <div class="book-actions">
                            <button class="btn-icon" onclick="event.stopPropagation(); window.authorPage.showBookActions(${book.id})">
                                ⋮
                            </button>
                        </div>
                    </div>
                `).join('')}
            </div>
        `;
    }

    renderNoBooks() {
        return `
            <div class="empty-state">
                <p>No books found for this author</p>
                ${this.allBooks.length > 0 ? `
                    <p class="debug-info">Debug: Loaded ${this.allBooks.length} total books, but none match author ID ${this.authorId}</p>
                ` : ''}
            </div>
        `;
    }

    renderLoading() {
        return `
            <div class="loading">
                <div class="loading-spinner"></div>
                <p>Loading author information...</p>
            </div>
        `;
    }

    renderError(message) {
        return `
            <div class="error-state">
                <h2>Error</h2>
                <p>${message}</p>
                <a href="#/search" class="btn btn-primary">Back to Search</a>
            </div>
        `;
    }

    // Navigation methods
    navigateToBook(bookId) {
        window.location.hash = `#/book/${bookId}`;
    }

    async showBookActions(bookId) {
        const isLoggedIn = !!localStorage.getItem('token');
        const actions = [];

        if (isLoggedIn) {
            actions.push('Add to favorites');
            actions.push('Add to reading list');
            actions.push('Rate book');
        }

        actions.push('View book details');

        const actionText = actions.join('\n');
        const selectedAction = prompt(`Choose action for book:\n\n${actionText}`);

        if (selectedAction) {
            await this.handleBookAction(selectedAction, bookId);
        }
    }

    async handleBookAction(action, bookId) {
        try {
            switch (action) {
                case 'Add to favorites':
                    alert('Added to favorites!');
                    break;
                case 'Add to reading list':
                    alert('Added to reading list!');
                    break;
                case 'Rate book':
                    const rating = prompt('Rate this book (1-5):');
                    if (rating && rating >= 1 && rating <= 5) {
                        alert(`Rated ${rating} stars!`);
                    }
                    break;
                case 'View book details':
                    this.navigateToBook(bookId);
                    break;
            }
        } catch (error) {
            console.error('Error handling book action:', error);
            alert('Failed to perform action');
        }
    }

    loadMockData() {
        // Временные данные для отладки
        this.author = {
            id: this.authorId,
            name: "Sample Author",
            biography: "This is a sample author biography.",
            birthYear: 1950,
            nationality: "American",
            photoUrl: this.getDefaultAuthorImage()
        };
        this.books = [];
    }

    getDefaultAuthorImage() {
        return 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg';
    }

    getDefaultBookCover() {
        return 'https://images.pexels.com/photos/1926988/pexels-photo-1926988.jpeg';
    }

    truncateText(text, maxLength) {
        if (!text || text.length <= maxLength) return text;
        return text.substring(0, maxLength) + '...';
    }
}

// Убедитесь что глобальная переменная установлена
window.authorPage = new AuthorPage();