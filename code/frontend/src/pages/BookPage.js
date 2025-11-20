import { apiService } from '../services/api.js';

export class BookPage {
    constructor() {
        this.bookId = null;
        this.book = null;
        this.reviews = [];
        this.isLoading = true;
        this.isLoggedIn = !!localStorage.getItem('token');
    }

    async render() {
        const hash = window.location.hash;
        const match = hash.match(/\/book\/(\d+)/);
        this.bookId = match ? parseInt(match[1]) : null;

        if (!this.bookId) {
            return this.renderError('Book ID not specified');
        }

        await this.loadBookData();

        if (this.isLoading) {
            return this.renderLoading();
        }

        if (!this.book) {
            return this.renderError('Book not found');
        }

        return `
            <div class="book-container">
                ${this.isLoggedIn ? `
                    <div class="book-actions-header">
                        <button class="btn-icon" onclick="window.bookPage.showBookActions()">
                            ⋮
                        </button>
                    </div>
                ` : ''}

                <div class="book-header">
                    <div class="book-image">
                        <img src="${this.book.coverUrl || this.getDefaultBookCover()}" 
                             alt="${this.book.title}"
                             onerror="this.src='${this.getDefaultBookCover()}'">
                    </div>
                    <div class="book-info">
                        <h1 class="book-title">${this.book.title}</h1>
                        ${this.book.authors && this.book.authors.length > 0 ? `
                            <div class="book-authors">
                                by ${this.book.authors.map(author => `
                                    <a href="#/author/${author.id}" class="author-link">${author.name}</a>
                                `).join(', ')}
                            </div>
                        ` : ''}
                        <div class="book-meta">
                            ${this.book.year ? `<div class="book-year">Published: ${this.book.year}</div>` : ''}
                            ${this.book.pages ? `<div class="book-pages">Pages: ${this.book.pages}</div>` : ''}
                            ${this.book.averageRating ? `
                                <div class="book-rating">
                                    ⭐ ${this.book.averageRating.toFixed(1)}/5
                                    ${this.book.ratingsCount ? `(${this.book.ratingsCount} ratings)` : ''}
                                </div>
                            ` : ''}
                        </div>
                    </div>
                </div>

                <div class="book-content">
                    ${this.book.description ? `
                        <div class="book-description-section">
                            <h2>Description</h2>
                            <div class="book-description">
                                ${this.book.description}
                            </div>
                        </div>
                    ` : ''}

                    <div class="book-reviews-section">
                        <h2>Reviews</h2>
                        ${this.reviews.length > 0 ? this.renderReviews() : this.renderNoReviews()}
                    </div>
                </div>
            </div>
        `;
    }

    async loadBookData() {
        try {
            console.log('Loading book data for ID:', this.bookId);

            // Загружаем данные книги
            this.book = await apiService.getBookById(this.bookId);
            console.log('Book data loaded:', this.book);

            // Загружаем отзывы
            try {
                const reviewsResult = await apiService.getBookReviews(this.bookId, 0, 20);
                this.reviews = reviewsResult.content || [];
                console.log('Book reviews loaded:', this.reviews.length);
            } catch (reviewError) {
                console.log('No reviews found or reviews endpoint not available:', reviewError);
                this.reviews = [];
            }

        } catch (error) {
            console.error('Error loading book data:', error);
            if (error.response?.status === 404) {
                this.book = null;
            } else {
                console.log('Falling back to mock data');
                this.loadMockData();
            }
        } finally {
            this.isLoading = false;
        }
    }

    renderReviews() {
        return `
            <div class="reviews-list">
                ${this.reviews.map(review => `
                    <div class="review-item">
                        <div class="review-header">
                            <div class="reviewer-info">
                                <div class="reviewer-avatar">
                                    ${review.userName ? review.userName.charAt(0).toUpperCase() : 'U'}
                                </div>
                                <div class="reviewer-details">
                                    <div class="reviewer-name">${review.userName || 'Anonymous'}</div>
                                    <div class="review-date">${review.createdAt ? new Date(review.createdAt).toLocaleDateString() : ''}</div>
                                </div>
                            </div>
                            ${review.rating ? `
                                <div class="review-rating">⭐ ${review.rating}/5</div>
                            ` : ''}
                        </div>
                        <div class="review-content">
                            ${review.comment || 'No comment provided.'}
                        </div>
                    </div>
                `).join('')}
            </div>
        `;
    }

    renderNoReviews() {
        return `
            <div class="empty-reviews">
                <p>No reviews yet. Be the first to review this book!</p>
                ${this.isLoggedIn ? `
                    <button class="btn btn-primary" onclick="window.bookPage.addReview()">
                        Add Review
                    </button>
                ` : `
                    <p><a href="#/auth" class="auth-link">Sign in</a> to add a review</p>
                `}
            </div>
        `;
    }

    renderLoading() {
        return `
            <div class="loading">
                <div class="loading-spinner"></div>
                <p>Loading book information...</p>
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

    // Action methods
    async showBookActions() {
        const actions = [
            'Add to favorites',
            'Add to reading list',
            'Rate book',
            'Add review',
            'Share book'
        ];

        const actionText = actions.join('\n');
        const selectedAction = prompt(`Choose action for book:\n\n${actionText}`);

        if (selectedAction) {
            await this.handleBookAction(selectedAction);
        }
    }

    async handleBookAction(action) {
        try {
            switch (action) {
                case 'Add to favorites':
                    await this.addToFavorites();
                    break;
                case 'Add to reading list':
                    await this.addToReadingList();
                    break;
                case 'Rate book':
                    await this.rateBook();
                    break;
                case 'Add review':
                    await this.addReview();
                    break;
                case 'Share book':
                    this.shareBook();
                    break;
            }
        } catch (error) {
            console.error('Error handling book action:', error);
            alert('Failed to perform action');
        }
    }

    async addToFavorites() {
        try {
            // Временно используем alert, пока не настроим коллекции
            alert('Added to favorites!');
        } catch (error) {
            console.error('Error adding to favorites:', error);
            alert('Failed to add to favorites');
        }
    }

    async addToReadingList() {
        try {
            alert('Added to reading list!');
        } catch (error) {
            console.error('Error adding to reading list:', error);
            alert('Failed to add to reading list');
        }
    }

    async rateBook() {
        const rating = prompt('Rate this book (1-5):');
        if (rating && rating >= 1 && rating <= 5) {
            alert(`Rated ${rating} stars!`);
        }
    }

    async addReview() {
        const comment = prompt('Write your review:');
        if (comment) {
            const rating = prompt('Rate this book (1-5):');
            if (rating && rating >= 1 && rating <= 5) {
                try {
                    alert('Review submitted! (Feature in development)');
                } catch (error) {
                    console.error('Error adding review:', error);
                    alert('Failed to submit review');
                }
            }
        }
    }

    shareBook() {
        const url = window.location.href;
        navigator.clipboard.writeText(url).then(() => {
            alert('Book link copied to clipboard!');
        });
    }

    loadMockData() {
        this.book = {
            id: this.bookId,
            title: "Sample Book",
            authors: [{ id: 1, name: "Sample Author" }],
            description: "This is a sample book description.",
            year: 2023,
            pages: 300,
            averageRating: 4.0,
            ratingsCount: 10,
            coverUrl: this.getDefaultBookCover()
        };
        this.reviews = [];
    }

    getDefaultBookCover() {
        return 'https://images.pexels.com/photos/1926988/pexels-photo-1926988.jpeg';
    }

    rerender() {
        const app = document.getElementById('app');
        if (app) {
            this.render().then(html => {
                const main = app.querySelector('.main');
                if (main) {
                    main.innerHTML = html;
                }
            });
        }
    }
}

// Убедитесь что глобальная переменная установлена
window.bookPage = new BookPage();