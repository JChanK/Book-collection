import { BookCard } from '../components/BookCard.js';
import { apiService } from '../services/api.js';

export class CatalogPage {
    constructor() {
        this.currentPage = 0;
        this.pageSize = 20;
        this.books = [];
        this.totalPages = 0;
        this.isLoading = false;

        // Временные фильтры (применяются только после нажатия Apply)
        this.tempFilters = {
            genres: [],
            chapters: [],
            sort: 'title_asc'
        };

        // Активные фильтры (примененные)
        this.activeFilters = {
            genres: [],
            chapters: [],
            sort: 'title_asc'
        };

        this.genres = ['Fiction', 'Non-Fiction', 'Science Fiction', 'Fantasy', 'Mystery', 'Romance', 'Thriller', 'Biography', 'History', 'Science'];
        this.chapterRanges = [
            { value: '0-10', label: 'Up to 10 chapters' },
            { value: '10-50', label: '10 to 50 chapters' },
            { value: '50-100', label: '50 to 100 chapters' },
            { value: '100+', label: 'More than 100 chapters' }
        ];
        this.sortOptions = [
            { value: 'title_asc', label: 'Title A-Z' },
            { value: 'title_desc', label: 'Title Z-A' },
            { value: 'year_asc', label: 'Year Oldest' },
            { value: 'year_desc', label: 'Year Newest' },
            { value: 'rating_desc', label: 'Highest Rating' }
        ];

        // Состояние раскрытия фильтров
        this.filterStates = {
            genre: false,
            chapters: false,
            sort: false
        };

        // Синхронизируем временные фильтры с активными
        this.resetTempFilters();

        // Сохраняем ссылку на себя в глобальной области
        window.catalogPage = this;
    }

    async render() {
        await this.loadBooks();

        return `
            <div class="catalog-container">
                <div class="catalog-content">
                    <div class="books-section">
                        <div class="books-header">
                            <h1>Book Catalog</h1>
                            <div class="books-count">
                                ${this.isLoading ? 'Loading...' : `${this.books.length} books found`}
                            </div>
                        </div>
                        
                        ${this.isLoading ? this.renderLoading() : this.renderBooksGrid()}

                        ${this.renderPagination()}
                    </div>

                    <div class="filters-section">
                        ${this.renderFilters()}
                    </div>
                </div>
            </div>
        `;
    }

    renderLoading() {
        return `
            <div class="loading">
                <div class="loading-spinner"></div>
                <p>Loading books...</p>
            </div>
        `;
    }

    renderBooksGrid() {
        if (this.books.length === 0) {
            return `
                <div class="empty-state">
                    <h3>No books found</h3>
                    <p>Try adjusting your filters or search criteria</p>
                </div>
            `;
        }

        return `
            <div class="books-grid" id="booksGrid">
                ${this.books.map(book => new BookCard(book).render()).join('')}
            </div>
        `;
    }

    renderFilters() {
        return `
            <div class="filters-panel">
                <h3>Filters</h3>
                
                <!-- Genre Filter -->
                <div class="filter-group ${this.filterStates.genre ? 'open' : ''}">
                    <div class="filter-header" onclick="catalogPage.toggleFilterState('genre')">
                        <span>Genre</span>
                        <span class="filter-arrow">${this.filterStates.genre ? '▼' : '▶'}</span>
                    </div>
                    <div class="filter-content">
                        ${this.genres.map(genre => `
                            <label class="filter-checkbox">
                                <input type="checkbox" value="${genre}" 
                                       ${this.tempFilters.genres.includes(genre) ? 'checked' : ''}
                                       onchange="catalogPage.toggleTempGenre('${genre}')">
                                <span>${genre}</span>
                            </label>
                        `).join('')}
                    </div>
                </div>

                <!-- Chapters Filter -->
                <div class="filter-group ${this.filterStates.chapters ? 'open' : ''}">
                    <div class="filter-header" onclick="catalogPage.toggleFilterState('chapters')">
                        <span>Chapters</span>
                        <span class="filter-arrow">${this.filterStates.chapters ? '▼' : '▶'}</span>
                    </div>
                    <div class="filter-content">
                        ${this.chapterRanges.map(range => `
                            <label class="filter-checkbox">
                                <input type="checkbox" value="${range.value}" 
                                       ${this.tempFilters.chapters.includes(range.value) ? 'checked' : ''}
                                       onchange="catalogPage.toggleTempChapterRange('${range.value}')">
                                <span>${range.label}</span>
                            </label>
                        `).join('')}
                    </div>
                </div>

                <!-- Sort Options -->
                <div class="filter-group ${this.filterStates.sort ? 'open' : ''}">
                    <div class="filter-header" onclick="catalogPage.toggleFilterState('sort')">
                        <span>Sort By</span>
                        <span class="filter-arrow">${this.filterStates.sort ? '▼' : '▶'}</span>
                    </div>
                    <div class="filter-content">
                        ${this.sortOptions.map(option => `
                            <label class="filter-radio">
                                <input type="radio" name="sort" value="${option.value}" 
                                       ${this.tempFilters.sort === option.value ? 'checked' : ''}
                                       onchange="catalogPage.setTempSort('${option.value}')">
                                <span>${option.label}</span>
                            </label>
                        `).join('')}
                    </div>
                </div>

                <!-- Filter Actions -->
                <div class="filter-actions">
                    <button class="btn btn-primary apply-filters" onclick="catalogPage.applyFilters()">
                        Apply Filters
                    </button>
                    <button class="btn btn-outline clear-filters" onclick="catalogPage.clearFilters()">
                        Clear Filters
                    </button>
                </div>

                <!-- Active Filters Info -->
                ${this.hasActiveFilters() ? `
                    <div class="active-filters">
                        <strong>Active Filters:</strong>
                        ${this.renderActiveFiltersInfo()}
                    </div>
                ` : ''}
            </div>
        `;
    }

    renderActiveFiltersInfo() {
        const activeFilters = [];

        if (this.activeFilters.genres.length > 0) {
            activeFilters.push(`Genres: ${this.activeFilters.genres.join(', ')}`);
        }

        if (this.activeFilters.chapters.length > 0) {
            const chapterLabels = this.activeFilters.chapters.map(range =>
                this.chapterRanges.find(r => r.value === range)?.label || range
            );
            activeFilters.push(`Chapters: ${chapterLabels.join(', ')}`);
        }

        if (this.activeFilters.sort !== 'title_asc') {
            const sortLabel = this.sortOptions.find(opt => opt.value === this.activeFilters.sort)?.label || this.activeFilters.sort;
            activeFilters.push(`Sort: ${sortLabel}`);
        }

        return activeFilters.map(filter => `<div class="active-filter-item">${filter}</div>`).join('');
    }

    renderPagination() {
        if (this.totalPages <= 1 || this.isLoading) return '';

        return `
            <div class="pagination">
                <button class="btn btn-outline" ${this.currentPage === 0 ? 'disabled' : ''} 
                        onclick="catalogPage.changePage(${this.currentPage - 1})">
                    Previous
                </button>
                
                <div class="page-numbers">
                    ${this.renderPageNumbers()}
                </div>
                
                <button class="btn btn-outline" ${this.currentPage === this.totalPages - 1 ? 'disabled' : ''} 
                        onclick="catalogPage.changePage(${this.currentPage + 1})">
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
                    onclick="catalogPage.changePage(${page})">
                ${page + 1}
            </button>
        `;
    }

    // Методы для временных фильтров
    toggleTempGenre(genre) {
        console.log('Toggling temp genre:', genre);
        const index = this.tempFilters.genres.indexOf(genre);
        if (index > -1) {
            this.tempFilters.genres.splice(index, 1);
        } else {
            this.tempFilters.genres.push(genre);
        }
        // НЕ обновляем UI - только меняем состояние
    }

    toggleTempChapterRange(range) {
        console.log('Toggling temp chapter range:', range);
        const index = this.tempFilters.chapters.indexOf(range);
        if (index > -1) {
            this.tempFilters.chapters.splice(index, 1);
        } else {
            this.tempFilters.chapters.push(range);
        }
        // НЕ обновляем UI - только меняем состояние
    }

    setTempSort(sortValue) {
        console.log('Setting temp sort:', sortValue);
        this.tempFilters.sort = sortValue;
        // НЕ обновляем UI - только меняем состояние
    }

    toggleFilterState(filterType) {
        console.log('Toggling filter state:', filterType);
        this.filterStates[filterType] = !this.filterStates[filterType];
        this.updateUI(); // Только для открытия/закрытия фильтров
    }

    // Основные методы фильтров
    async applyFilters() {
        console.log('Applying filters:', this.tempFilters);

        // Копируем временные фильтры в активные
        this.activeFilters = {
            genres: [...this.tempFilters.genres],
            chapters: [...this.tempFilters.chapters],
            sort: this.tempFilters.sort
        };

        this.currentPage = 0; // Сбрасываем на первую страницу
        await this.loadBooks();
        this.updateUI();
    }

    async clearFilters() {
        console.log('Clearing all filters');

        // Сбрасываем оба набора фильтров
        this.resetTempFilters();
        this.activeFilters = {
            genres: [],
            chapters: [],
            sort: 'title_asc'
        };

        this.currentPage = 0;
        await this.loadBooks();
        this.updateUI();
    }

    resetTempFilters() {
        // Синхронизируем временные фильтры с активными
        this.tempFilters = {
            genres: [...this.activeFilters.genres],
            chapters: [...this.activeFilters.chapters],
            sort: this.activeFilters.sort
        };
    }

    async changePage(page) {
        console.log('Changing to page:', page);
        this.currentPage = page;
        await this.loadBooks();
        this.updateUI();
    }

    // Загрузка книг из API
    async loadBooks() {
        this.isLoading = true;

        // Только обновляем контент книг, не весь UI
        await this.updateBooksContent();

        try {
            // Пытаемся загрузить из API
            const booksData = await apiService.getBooks(this.currentPage, this.pageSize);

            // Применяем фильтры на клиенте
            let filteredBooks = booksData.content || [];
            filteredBooks = this.applyClientSideFilters(filteredBooks);

            this.books = filteredBooks;
            this.totalPages = booksData.totalPages || 1;

        } catch (error) {
            console.error('Error loading books from API:', error);
            // Fallback на мок данные если API не доступно
            await this.loadMockBooks();
        } finally {
            this.isLoading = false;
            await this.updateBooksContent();
        }
    }

    async loadMockBooks() {
        const mockBooks = this.getMockBooks();
        let filteredBooks = this.applyClientSideFilters(mockBooks);

        const startIndex = this.currentPage * this.pageSize;
        this.books = filteredBooks.slice(startIndex, startIndex + this.pageSize);
        this.totalPages = Math.ceil(filteredBooks.length / this.pageSize);
    }

    applyClientSideFilters(books) {
        let filteredBooks = [...books];

        // Фильтр по жанрам
        if (this.activeFilters.genres.length > 0) {
            filteredBooks = filteredBooks.filter(book =>
                book.genres && this.activeFilters.genres.some(genre => book.genres.includes(genre))
            );
        }

        // Фильтр по главам
        if (this.activeFilters.chapters.length > 0) {
            filteredBooks = filteredBooks.filter(book => {
                if (book.chapters === undefined) return true;

                return this.activeFilters.chapters.some(range => {
                    switch (range) {
                        case '0-10': return book.chapters <= 10;
                        case '10-50': return book.chapters > 10 && book.chapters <= 50;
                        case '50-100': return book.chapters > 50 && book.chapters <= 100;
                        case '100+': return book.chapters > 100;
                        default: return true;
                    }
                });
            });
        }

        // Сортировка
        filteredBooks.sort((a, b) => {
            switch (this.activeFilters.sort) {
                case 'title_asc':
                    return a.title.localeCompare(b.title);
                case 'title_desc':
                    return b.title.localeCompare(a.title);
                case 'year_asc':
                    return (a.year || 0) - (b.year || 0);
                case 'year_desc':
                    return (b.year || 0) - (a.year || 0);
                case 'rating_desc':
                    return (b.averageRating || 0) - (a.averageRating || 0);
                default:
                    return a.title.localeCompare(b.title);
            }
        });

        return filteredBooks;
    }

    // Обновление только контента книг (без пересоздания всей страницы)
    async updateBooksContent() {
        const booksGrid = document.getElementById('booksGrid');
        const booksCount = document.querySelector('.books-count');
        const pagination = document.querySelector('.pagination');

        if (booksGrid) {
            booksGrid.innerHTML = this.isLoading ? '' : this.books.map(book => new BookCard(book).render()).join('');
        }

        if (booksCount) {
            booksCount.textContent = this.isLoading ? 'Loading...' : `${this.books.length} books found`;
        }

        if (pagination && document.querySelector('.books-section')) {
            const newPagination = this.renderPagination();
            pagination.outerHTML = newPagination;
        }
    }

    // Обновление интерфейса (только когда действительно нужно)
    async updateUI() {
        // Обновляем только фильтры и информацию о активных фильтрах
        const filtersPanel = document.querySelector('.filters-panel');
        if (filtersPanel) {
            filtersPanel.outerHTML = this.renderFilters();
        }

        // Обновляем книги
        await this.updateBooksContent();
    }



    hasActiveFilters() {
        return this.activeFilters.genres.length > 0 ||
            this.activeFilters.chapters.length > 0 ||
            this.activeFilters.sort !== 'title_asc';
    }

    getMockBooks() {
        return [
            {
                id: 1,
                title: "The Great Gatsby",
                authors: [{ name: "F. Scott Fitzgerald" }],
                coverUrl: "https://images.pexels.com/photos/1926988/pexels-photo-1926988.jpeg",
                year: 1925,
                averageRating: 4.5,
                genres: ['Fiction', 'Classic'],
                chapters: 9
            },
            {
                id: 2,
                title: "To Kill a Mockingbird",
                authors: [{ name: "Harper Lee" }],
                coverUrl: "https://images.pexels.com/photos/1926988/pexels-photo-1926988.jpeg",
                year: 1960,
                averageRating: 4.8,
                genres: ['Fiction', 'Classic'],
                chapters: 31
            },
            {
                id: 3,
                title: "1984",
                authors: [{ name: "George Orwell" }],
                coverUrl: "https://images.pexels.com/photos/1926988/pexels-photo-1926988.jpeg",
                year: 1949,
                averageRating: 4.7,
                genres: ['Science Fiction', 'Dystopian'],
                chapters: 23
            }
        ];
    }
}