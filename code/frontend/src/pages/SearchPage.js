import { apiService } from '../services/api.js';

export class SearchPage {
    constructor() {
        this.searchType = 'books';
        this.searchQuery = '';
        this.books = [];
        this.authors = [];
        this.isLoading = false;
        this.currentPage = 0;
        this.pageSize = 20;
        this.totalPages = 0;
        this.totalElements = 0;
        this.hasSearched = false;
    }

    async render() {
        if (this.searchType === 'books' && this.books.length === 0 && !this.searchQuery && !this.hasSearched) {
            await this.loadAllBooks();
        }

        return `
            <div class="search-container">
                <div class="search-header">
                    <h1>Search</h1>
                    
                    <div class="search-controls">
                        <div class="search-input-with-tabs">
                            <div class="search-input-group">
                                <input type="text" 
                                       id="searchInput" 
                                       class="search-input" 
                                       placeholder="${this.searchType === 'books' ? 'Search books by title...' : 'Search authors by name...'}" 
                                       value="${this.searchQuery}"
                                       onkeypress="if(event.key === 'Enter') window.searchPage.performSearch()">
                                <button class="btn btn-primary" onclick="window.searchPage.performSearch()">
                                    Search
                                </button>
                                ${this.searchQuery || this.hasSearched ? `
                                    <button class="btn btn-outline" onclick="window.searchPage.clearSearch()" style="margin-left: 10px;">
                                        Clear
                                    </button>
                                ` : ''}
                            </div>
                            
                            <div class="search-type-tabs">
                                <button class="search-type-tab ${this.searchType === 'books' ? 'active' : ''}" 
                                        onclick="window.searchPage.setSearchType('books')">
                                    Books
                                </button>
                                <button class="search-type-tab ${this.searchType === 'authors' ? 'active' : ''}" 
                                        onclick="window.searchPage.setSearchType('authors')">
                                    Authors
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="search-results">
                    ${await this.renderResults()}
                </div>

                ${this.renderPagination()}
            </div>
        `;
    }

    async renderResults() {
        if (this.isLoading) {
            return this.renderLoading();
        }

        if (this.searchQuery || this.hasSearched) {
            const resultsCount = this.searchType === 'books' ? this.books.length : this.authors.length;

            if (resultsCount === 0) {
                return `
                    <div class="empty-state">
                        <h3>No ${this.searchType} found ${this.searchQuery ? `for "${this.searchQuery}"` : ''}</h3>
                        <p>Try different search terms or check the spelling</p>
                    </div>
                `;
            }

            return `
                <div class="results-info">
                    <p class="results-count">
                        ${this.searchQuery ?
                `Found ${this.totalElements} ${this.searchType} for "${this.searchQuery}"` :
                `Showing ${this.totalElements} ${this.searchType}`
            }
                    </p>
                </div>
                ${this.searchType === 'books' ? this.renderBooksResults() : this.renderAuthorsResults()}
            `;
        }

        if (this.searchType === 'books') {
            return this.renderAllBooks();
        } else {
            return `
                <div class="empty-state">
                    <h3>Enter author name to search</h3>
                    <p>Search authors by their name</p>
                </div>
            `;
        }
    }

    renderAllBooks() {
        if (this.books.length === 0) {
            return `
                <div class="empty-state">
                    <h3>No books available</h3>
                    <p>There are no books in the catalog yet</p>
                </div>
            `;
        }

        return `
            <div class="results-info">
                <p class="results-count">Showing all ${this.books.length} books</p>
            </div>
            <div class="results-list books-results">
                ${this.books.map(book => this.renderBookItem(book)).join('')}
            </div>
        `;
    }

    renderBooksResults() {
        return `
            <div class="results-list books-results">
                ${this.books.map(book => this.renderBookItem(book)).join('')}
            </div>
        `;
    }

    renderAuthorsResults() {
        return `
            <div class="results-list authors-results">
                ${this.authors.map(author => `
                    <div class="result-item author-item" onclick="window.searchPage.navigateToAuthor(${author.id})">
                        <div class="item-content">
                            <div class="author-avatar">
                                ${author.name ? author.name.charAt(0).toUpperCase() : 'A'}
                            </div>
                            <div class="item-details">
                                <h3 class="item-title">${author.name}</h3>
                                <div class="item-meta">
                                    ${author.booksCount ? `<span class="books-count">${author.booksCount} books</span>` : ''}
                                    ${author.birthYear ? `<span class="author-years">• ${author.birthYear}${author.deathYear ? ` - ${author.deathYear}` : ''}</span>` : ''}
                                </div>
                                ${author.biography ? `<p class="item-description">${this.truncateText(author.biography, 120)}</p>` : ''}
                            </div>
                        </div>
                        <div class="item-actions">
                            <button class="btn-icon" onclick="event.stopPropagation(); window.searchPage.showAuthorActions(${author.id})">
                                ⋮
                            </button>
                        </div>
                    </div>
                `).join('')}
            </div>
        `;
    }

    // ДОБАВЛЯЕМ ОТСУТСТВУЮЩИЙ МЕТОД
    renderBookItem(book) {
        return `
        <div class="result-item book-item" onclick="window.searchPage.navigateToBook(${book.id})">
            <div class="item-content">
                <img src="${book.coverUrl || this.getDefaultBookCover()}" 
                     alt="${book.title}" 
                     class="item-image"
                     onerror="this.src='${this.getDefaultBookCover()}'">
                <div class="item-details">
                    <h3 class="item-title">${book.title}</h3>
                    <div class="item-meta">
                        ${book.authors && book.authors.length > 0 ?
            this.renderAuthorLinks(book.authors) :
            ''
        }
                        ${book.year ? `<span class="book-year">• ${book.year}</span>` : ''}
                        ${book.chapters ? `<span class="book-chapters">• ${book.chapters} chapters</span>` : ''}
                        ${book.averageRating ? `<span class="book-rating">• ⭐ ${book.averageRating.toFixed(1)}</span>` : ''}
                    </div>
                    ${book.description ? `<p class="item-description">${this.truncateText(book.description, 150)}</p>` : ''}
                </div>
            </div>
            <div class="item-actions">
                <button class="btn-icon" onclick="event.stopPropagation(); window.searchPage.showBookActions(${book.id})">
                    ⋮
                </button>
            </div>
        </div>
    `;
    }

    // ДОБАВЛЯЕМ ОТСУТСТВУЮЩИЙ МЕТОД
    renderAuthorLinks(authors) {
        return authors.map(author => `
            <a href="#/author/${author.id}" class="author-link" onclick="event.stopPropagation()">${author.name}</a>
        `).join(', ');
    }

    renderLoading() {
        return `
            <div class="loading">
                <div class="loading-spinner"></div>
                <p>Searching ${this.searchType}...</p>
            </div>
        `;
    }

    renderPagination() {
        if (this.totalPages <= 1 || this.isLoading) return '';

        return `
            <div class="pagination">
                <button class="btn btn-outline" ${this.currentPage === 0 ? 'disabled' : ''} 
                        onclick="window.searchPage.changePage(${this.currentPage - 1})">
                    Previous
                </button>
                
                <div class="page-numbers">
                    ${this.renderPageNumbers()}
                </div>
                
                <button class="btn btn-outline" ${this.currentPage === this.totalPages - 1 ? 'disabled' : ''} 
                        onclick="window.searchPage.changePage(${this.currentPage + 1})">
                    Next
                </button>
            </div>
        `;
    }

    renderPageNumbers() {
        const pages = [];
        const totalPages = this.totalPages;
        const currentPage = this.currentPage;

        pages.push(this.renderPageNumber(0));

        const startPage = Math.max(1, currentPage - 1);
        const endPage = Math.min(totalPages - 2, currentPage + 1);

        if (startPage > 1) {
            pages.push('<span class="page-dots">...</span>');
        }

        for (let i = startPage; i <= endPage; i++) {
            pages.push(this.renderPageNumber(i));
        }

        if (endPage < totalPages - 2) {
            pages.push('<span class="page-dots">...</span>');
        }

        if (totalPages > 1) {
            pages.push(this.renderPageNumber(totalPages - 1));
        }

        return pages.join('');
    }

    renderPageNumber(page) {
        return `
            <button class="page-number ${page === this.currentPage ? 'active' : ''}" 
                    onclick="window.searchPage.changePage(${page})">
                ${page + 1}
            </button>
        `;
    }

    // ДОБАВЛЯЕМ ОТСУТСТВУЮЩИЙ МЕТОД
    getDefaultBookCover() {
        return 'https://images.pexels.com/photos/1926988/pexels-photo-1926988.jpeg';
    }

    // ДОБАВЛЯЕМ ОТСУТСТВУЮЩИЙ МЕТОД
    truncateText(text, maxLength) {
        if (!text || text.length <= maxLength) return text;
        return text.substring(0, maxLength) + '...';
    }

    async loadAllBooks() {
        this.isLoading = true;
        this.updateUI();

        try {
            const result = await apiService.getBooks(0, 200);
            this.books = result.content || [];
            this.totalElements = this.books.length;
            console.log('Loaded all books:', this.books.length);
        } catch (error) {
            console.error('Error loading all books:', error);
            this.books = this.getMockBooks();
            this.totalElements = this.books.length;
        } finally {
            this.isLoading = false;
            this.updateUI();
        }
    }

    async performSearch() {
        const searchInput = document.getElementById('searchInput');
        const newSearchQuery = searchInput ? searchInput.value.trim() : '';

        if (newSearchQuery !== this.searchQuery) {
            this.currentPage = 0;
        }

        this.searchQuery = newSearchQuery;
        this.hasSearched = true;

        if (!this.searchQuery) {
            await this.loadAllBooks();
            return;
        }

        this.isLoading = true;
        this.updateUI();

        try {
            console.log(`Searching ${this.searchType} for: "${this.searchQuery}", page: ${this.currentPage}`);

            if (this.searchType === 'books') {
                const result = await apiService.searchBooks(this.searchQuery, this.currentPage, this.pageSize);
                this.books = result.content || [];
                this.totalPages = result.totalPages || 1;
                this.totalElements = result.totalElements || 0;
                console.log('Search results:', this.books.length, 'Total:', this.totalElements);
            } else {
                const result = await apiService.searchAuthors(this.searchQuery, this.currentPage, this.pageSize);
                this.authors = result.content || [];
                this.totalPages = result.totalPages || 1;
                this.totalElements = result.totalElements || 0;
            }

        } catch (error) {
            console.error('Search API error:', error);
            await this.loadMockResults();
        } finally {
            this.isLoading = false;
            this.updateUI();
        }
    }

    clearSearch() {
        this.searchQuery = '';
        this.hasSearched = false;
        this.currentPage = 0;
        this.books = [];
        this.authors = [];

        const searchInput = document.getElementById('searchInput');
        if (searchInput) {
            searchInput.value = '';
        }

        if (this.searchType === 'books') {
            this.loadAllBooks();
        } else {
            this.updateUI();
        }
    }

    setSearchType(type) {
        if (this.searchType === type) return;

        this.searchType = type;
        this.currentPage = 0;
        this.searchQuery = '';
        this.hasSearched = false;
        this.books = [];
        this.authors = [];
        this.totalElements = 0;

        const searchInput = document.getElementById('searchInput');
        if (searchInput) {
            searchInput.value = '';
            searchInput.placeholder = type === 'books' ? 'Search books by title...' : 'Search authors by name...';
        }

        if (type === 'books') {
            this.loadAllBooks();
        } else {
            this.updateUI();
        }
    }

    async changePage(page) {
        this.currentPage = page;
        await this.performSearch();
    }

    // Navigation methods
    navigateToBook(bookId) {
        window.location.hash = `#/book/${bookId}`;
    }

    navigateToAuthor(authorId) {
        window.location.hash = `#/author/${authorId}`;
    }

    showBookActions(bookId) {
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
            console.log(`User selected: ${selectedAction} for book ${bookId}`);
            this.handleBookAction(selectedAction, bookId);
        }
    }

    showAuthorActions(authorId) {
        const isLoggedIn = !!localStorage.getItem('token');
        const actions = [];

        if (isLoggedIn) {
            actions.push('Add to favorite authors');
            actions.push('Follow author');
        }

        actions.push('View author details');

        const actionText = actions.join('\n');
        const selectedAction = prompt(`Choose action for author:\n\n${actionText}`);

        if (selectedAction) {
            console.log(`User selected: ${selectedAction} for author ${authorId}`);
            this.handleAuthorAction(selectedAction, authorId);
        }
    }

    handleBookAction(action, bookId) {
        switch (action) {
            case 'Add to favorites':
                this.addToFavorites(bookId);
                break;
            case 'Add to reading list':
                this.addToReadingList(bookId);
                break;
            case 'Rate book':
                this.rateBook(bookId);
                break;
            case 'View book details':
                this.navigateToBook(bookId);
                break;
        }
    }

    handleAuthorAction(action, authorId) {
        switch (action) {
            case 'Add to favorite authors':
                this.addToFavoriteAuthors(authorId);
                break;
            case 'Follow author':
                this.followAuthor(authorId);
                break;
            case 'View author details':
                this.navigateToAuthor(authorId);
                break;
        }
    }

    addToFavorites(bookId) {
        console.log('Adding book to favorites:', bookId);
        alert('Added to favorites!');
    }

    addToReadingList(bookId) {
        console.log('Adding book to reading list:', bookId);
        alert('Added to reading list!');
    }

    rateBook(bookId) {
        const rating = prompt('Rate this book (1-5):');
        if (rating && rating >= 1 && rating <= 5) {
            console.log(`Rating book ${bookId}: ${rating} stars`);
            alert(`Rated ${rating} stars!`);
        }
    }

    addToFavoriteAuthors(authorId) {
        console.log('Adding author to favorites:', authorId);
        alert('Author added to favorites!');
    }

    followAuthor(authorId) {
        console.log('Following author:', authorId);
        alert('Now following author!');
    }

    async updateUI() {
        window.searchPage = this;

        const searchResults = document.querySelector('.search-results');
        const pagination = document.querySelector('.pagination');

        if (searchResults) {
            searchResults.innerHTML = await this.renderResults();
        }

        if (pagination) {
            const newPagination = this.renderPagination();
            if (newPagination) {
                pagination.outerHTML = newPagination;
            } else {
                pagination.remove();
            }
        }
    }

    async loadMockResults() {
        if (this.searchType === 'books') {
            this.books = this.getMockBooks().filter(book =>
                book.title.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
                (book.authors && book.authors.some(author =>
                    author.name.toLowerCase().includes(this.searchQuery.toLowerCase())
                ))
            );
        } else {
            this.authors = this.getMockAuthors().filter(author =>
                author.name.toLowerCase().includes(this.searchQuery.toLowerCase())
            );
        }
        this.totalPages = 1;
        this.totalElements = this.searchType === 'books' ? this.books.length : this.authors.length;
    }

    getMockBooks() {
        return [

        ];
    }

    getMockAuthors() {
        return [

        ];
    }
}