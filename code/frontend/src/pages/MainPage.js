import { BookCard } from '../components/BookCard.js';
import { apiService } from '../services/api.js';

export class MainPage {
    constructor() {
        this.latestBooks = [];
        this.latestReviews = [];
        this.upcomingBooks = [];
        this.isLoading = true;
    }

    async render() {
        await this.loadData();

        if (this.isLoading) {
            return this.renderLoading();
        }

        return `
            <div class="container">
                <!-- Latest Updates Section -->
                <section class="section">
                    <h2 class="section-title">Latest Updates</h2>
                    <div class="books-grid horizontal">
                        ${this.latestBooks.slice(0, 5).map(book => new BookCard(book).render()).join('')}
                    </div>
                </section>

                <!-- Two Column Layout -->
                <div class="two-column-layout">
                    <!-- Left Column - Latest Reviews -->
                    <div class="column">
                        <section class="section">
                            <h2 class="section-title">Latest Reviews</h2>
                            <div class="reviews-list">
                                ${this.renderReviews()}
                            </div>
                        </section>
                    </div>

                    <!-- Right Column - Soon -->
                    <div class="column">
                        <section class="section">
                            <h2 class="section-title">New Releases</h2>
                            <div class="books-grid vertical">
                                ${this.upcomingBooks.slice(0, 3).map(book => new BookCard(book).render()).join('')}
                            </div>
                        </section>
                    </div>
                </div>
            </div>
        `;
    }

    async loadData() {
        try {
            // Загружаем последние книги
            const booksResponse = await apiService.getBooks(0, 10);
            this.latestBooks = booksResponse.content || [];

            // Загружаем отзывы
            await this.loadReviews();

            // Для "новых релизов" берем книги последних лет
            this.upcomingBooks = this.filterRecentBooks(this.latestBooks);

        } catch (error) {
            console.error('Error loading main page data:', error);
            // Fallback на мок данные если API не доступно
            this.loadMockData();
        } finally {
            this.isLoading = false;
        }
    }

    async loadReviews() {
        try {
            // Получаем отзывы из последних книг
            const reviewPromises = this.latestBooks.slice(0, 3).map(async (book) => {
                try {
                    const reviews = await apiService.getBookReviews(book.id, 0, 1);
                    if (reviews.content && reviews.content.length > 0) {
                        return {
                            ...reviews.content[0],
                            bookTitle: book.title,
                            bookId: book.id
                        };
                    }
                } catch (error) {
                    console.error(`Error loading reviews for book ${book.id}:`, error);
                }
                return null;
            });

            const reviews = await Promise.all(reviewPromises);
            this.latestReviews = reviews.filter(review => review !== null);

        } catch (error) {
            console.error('Error loading reviews:', error);
            this.latestReviews = this.getMockReviews();
        }
    }

    filterRecentBooks(books) {
        const currentYear = new Date().getFullYear();
        return books
            .filter(book => book.year && book.year >= currentYear - 2)
            .sort((a, b) => (b.year || 0) - (a.year || 0));
    }

    renderReviews() {
        if (this.latestReviews.length === 0) {
            return `
                <div class="empty-reviews">
                    <p>No reviews yet. Be the first to review a book!</p>
                </div>
            `;
        }

        return this.latestReviews.map(review => `
            <div class="review-item" onclick="window.mainPage.navigateToBook(${review.bookId})">
                <div class="review-header">
                    <strong>${review.bookTitle}</strong>
                    <span class="rating">${'★'.repeat(review.rating)}${'☆'.repeat(5 - review.rating)}</span>
                </div>
                <p class="review-comment">"${review.comment || 'No comment provided'}"</p>
                <div class="review-author">
                    - ${review.userName || 'Anonymous'}
                    ${review.createdAt ? `<span class="review-date">(${new Date(review.createdAt).toLocaleDateString()})</span>` : ''}
                </div>
            </div>
        `).join('');
    }

    renderLoading() {
        return `
            <div class="loading">
                <div class="loading-spinner"></div>
                <p>Loading latest books and reviews...</p>
            </div>
        `;
    }

    // Navigation
    navigateToBook(bookId) {
        window.location.hash = `#/book/${bookId}`;
    }

    // Mock data fallback
    loadMockData() {
        this.latestBooks = this.getMockBooks();
        this.latestReviews = this.getMockReviews();
        this.upcomingBooks = this.latestBooks.slice(0, 3);
    }

    getMockBooks() {
        return [
            {
                id: 1,
                title: "The Great Gatsby",
                authors: [{ id: 1, name: "F. Scott Fitzgerald" }],
                year: 1925,
                averageRating: 4.5,
                description: "A classic novel of the Jazz Age",
                coverUrl: "https://images.pexels.com/photos/1926988/pexels-photo-1926988.jpeg"
            },
            {
                id: 2,
                title: "To Kill a Mockingbird",
                authors: [{ id: 2, name: "Harper Lee" }],
                year: 1960,
                averageRating: 4.8,
                description: "A gripping tale of racial injustice",
                coverUrl: "https://images.pexels.com/photos/1926988/pexels-photo-1926988.jpeg"
            },
            {
                id: 3,
                title: "1984",
                authors: [{ id: 3, name: "George Orwell" }],
                year: 1949,
                averageRating: 4.7,
                description: "Dystopian social science fiction novel",
                coverUrl: "https://images.pexels.com/photos/1926988/pexels-photo-1926988.jpeg"
            }
        ];
    }

    getMockReviews() {
        return [
            {
                id: 1,
                bookTitle: "The Great Gatsby",
                bookId: 1,
                rating: 5,
                comment: "Amazing classic! The portrayal of the Jazz Age is incredible.",
                userName: "John Doe",
                createdAt: new Date().toISOString()
            },
            {
                id: 2,
                bookTitle: "1984",
                bookId: 3,
                rating: 4,
                comment: "Thought-provoking dystopia that remains relevant today.",
                userName: "Jane Smith",
                createdAt: new Date().toISOString()
            }
        ];
    }
}

// Attach to window for event handlers
window.mainPage = new MainPage();