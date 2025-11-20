import { apiService } from '../services/api.js';

export class ProfilePage {
    constructor() {
        this.user = null;
        this.userLists = [
            { id: 'all', name: 'All Books', type: 'system' },
            { id: 'favorites', name: 'Favorites', type: 'system' },
            { id: 'reading', name: 'Reading List', type: 'system' }
        ];
        this.customLists = [];
        this.currentList = 'all';
        this.currentView = 'books'; // 'books' or 'authors'
        this.items = []; // books or authors based on currentView
        this.isLoading = true;
        this.isEditingName = false;
        this.isEditingLists = false;
        this.newListName = '';
        this.allBooks = []; // Кэш всех книг
        this.allAuthors = []; // Кэш всех авторов
    }

    async render() {
        await this.loadUserData();

        if (this.isLoading) {
            return this.renderLoading();
        }

        return `
            <div class="profile-container">
                ${this.renderProfileHeader()}
                <div class="profile-content">
                    <div class="profile-sidebar">
                        ${this.renderUserLists()}
                    </div>
                    <div class="profile-main">
                        ${this.renderViewTabs()}
                        ${await this.renderItemsList()}
                    </div>
                </div>
            </div>
        `;
    }

    renderProfileHeader() {
        const currentUser = JSON.parse(localStorage.getItem('user') || '{}');

        return `
            <div class="profile-info">
                <div class="profile-avatar">
                    <img src="${currentUser.avatarUrl || this.getDefaultAvatar()}" 
                         alt="${currentUser.displayName || 'User'}"
                         onerror="this.src='${this.getDefaultAvatar()}'">
                </div>
                <div class="profile-details">
                    ${this.isEditingName ? this.renderNameEditor() : `
                        <h1 class="profile-name">${currentUser.displayName || currentUser.username || 'User'}</h1>
                        <p class="profile-email">${currentUser.email || ''}</p>
                    `}
                </div>
                <div class="profile-actions">
                    <button class="btn btn-outline" onclick="window.profilePage.toggleNameEdit()">
                        ${this.isEditingName ? 'Cancel' : 'Edit Profile'}
                    </button>
                </div>
            </div>
        `;
    }

    renderNameEditor() {
        const currentUser = JSON.parse(localStorage.getItem('user') || '{}');

        return `
            <div class="name-editor">
                <input type="text" 
                       class="name-input" 
                       value="${currentUser.displayName || currentUser.username || ''}" 
                       placeholder="Enter your display name"
                       id="nameInput">
                <button class="btn btn-primary" onclick="window.profilePage.saveUserName()">Save</button>
            </div>
        `;
    }

    renderUserLists() {
        const allLists = [...this.userLists, ...this.customLists];

        return `
            <div class="user-lists-section">
                <div class="section-header">
                    <h3>My Collections</h3>
                    <button class="btn-icon" onclick="window.profilePage.toggleListEdit()">
                        ${this.isEditingLists ? '✓' : '+'}
                    </button>
                </div>
                
                ${this.isEditingLists ? this.renderListEditor() : ''}
                
                <div class="lists-menu">
                    ${allLists.map(list => `
                        <div class="list-item ${this.currentList === list.id ? 'active' : ''}" 
                             onclick="window.profilePage.selectList('${list.id}')">
                            <span class="list-name">${list.name}</span>
                            ${list.type === 'custom' ? `
                                <button class="btn-icon small" 
                                        onclick="event.stopPropagation(); window.profilePage.deleteList('${list.id}')">
                                    ×
                                </button>
                            ` : ''}
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    }

    renderListEditor() {
        return `
            <div class="list-editor">
                <input type="text" 
                       class="list-input" 
                       placeholder="New collection name"
                       id="listInput"
                       value="${this.newListName}">
                <button class="btn btn-primary" onclick="window.profilePage.createNewList()">Add</button>
            </div>
        `;
    }

    renderViewTabs() {
        return `
            <div class="view-tabs">
                <button class="view-tab ${this.currentView === 'books' ? 'active' : ''}" 
                        onclick="window.profilePage.switchView('books')">
                    📚 Books
                </button>
                <button class="view-tab ${this.currentView === 'authors' ? 'active' : ''}" 
                        onclick="window.profilePage.switchView('authors')">
                    👤 Authors
                </button>
            </div>
        `;
    }

    async renderItemsList() {
        if (this.items.length === 0) {
            return this.renderEmptyState();
        }

        if (this.currentView === 'books') {
            return this.renderBooksList();
        } else {
            return this.renderAuthorsList();
        }
    }

    renderBooksList() {
        return `
            <div class="items-list">
                ${this.items.map(book => `
                    <div class="item-card" onclick="window.profilePage.navigateToBook(${book.id})">
                        <div class="item-content">
                            <img src="${book.coverUrl || this.getDefaultBookCover()}" 
                                 alt="${book.title}"
                                 class="item-cover"
                                 onerror="this.src='${this.getDefaultBookCover()}'">
                            <div class="item-details">
                                <h3 class="item-title">${book.title}</h3>
                                <div class="item-meta">
                                    ${book.authors && book.authors.length > 0 ? `
                                        <span class="item-authors">${book.authors.map(a => a.name).join(', ')}</span>
                                    ` : ''}
                                    ${book.year ? `<span class="item-year">• ${book.year}</span>` : ''}
                                    ${book.averageRating ? `<span class="item-rating">• ⭐ ${book.averageRating.toFixed(1)}</span>` : ''}
                                </div>
                                ${book.description ? `
                                    <p class="item-description">${this.truncateText(book.description, 100)}</p>
                                ` : ''}
                            </div>
                        </div>
                        <div class="item-actions">
                            <button class="btn-icon" onclick="event.stopPropagation(); window.profilePage.showBookActions(${book.id})">
                                ⋮
                            </button>
                        </div>
                    </div>
                `).join('')}
            </div>
        `;
    }

    renderAuthorsList() {
        return `
            <div class="items-list">
                ${this.items.map(author => `
                    <div class="item-card" onclick="window.profilePage.navigateToAuthor(${author.id})">
                        <div class="item-content">
                            <div class="author-avatar large">
                                ${author.name ? author.name.charAt(0).toUpperCase() : 'A'}
                            </div>
                            <div class="item-details">
                                <h3 class="item-title">${author.name}</h3>
                                <div class="item-meta">
                                    ${author.booksCount ? `<span class="item-books">${author.booksCount} books</span>` : ''}
                                </div>
                                ${author.biography ? `
                                    <p class="item-description">${this.truncateText(author.biography, 100)}</p>
                                ` : ''}
                            </div>
                        </div>
                        <div class="item-actions">
                            <button class="btn-icon" onclick="event.stopPropagation(); window.profilePage.showAuthorActions(${author.id})">
                                ⋮
                            </button>
                        </div>
                    </div>
                `).join('')}
            </div>
        `;
    }

    renderEmptyState() {
        const message = this.currentList === 'all'
            ? `No ${this.currentView} in your collection yet`
            : `No ${this.currentView} in "${this.getCurrentListName()}" collection`;

        return `
            <div class="empty-state">
                <h3>Empty Collection</h3>
                <p>${message}</p>
                <a href="#/search" class="btn btn-primary">Discover ${this.currentView}</a>
            </div>
        `;
    }

    renderLoading() {
        return `
            <div class="loading">
                <div class="loading-spinner"></div>
                <p>Loading your profile...</p>
            </div>
        `;
    }

    async loadUserData() {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                this.isLoading = false;
                window.location.hash = '#/auth';
                return;
            }

            // Load user data from localStorage
            this.user = JSON.parse(localStorage.getItem('user') || '{}');
            console.log('User data:', this.user);

            // Load all books and authors for filtering
            await this.loadAllData();

            // Load user's collections
            await this.loadUserCollections();

        } catch (error) {
            console.error('Error loading user data:', error);
            // Fallback to mock data
            this.loadMockData();
        } finally {
            this.isLoading = false;
        }
    }

    async loadAllData() {
        try {
            // Load all books
            const booksResult = await apiService.getBooks(0, 200);
            this.allBooks = booksResult.content || [];
            console.log('Loaded books:', this.allBooks.length);

            // Load all authors
            const authorsResult = await apiService.getAuthors(0, 100);
            this.allAuthors = authorsResult.content || [];
            console.log('Loaded authors:', this.allAuthors.length);

        } catch (error) {
            console.error('Error loading all data:', error);
            this.allBooks = this.getMockBooks();
            this.allAuthors = this.getMockAuthors();
        }
    }

    async loadUserCollections() {
        try {
            console.log('Loading collection for list:', this.currentList, 'view:', this.currentView);

            // Временно используем простую логику фильтрации
            // В реальном приложении здесь будут API вызовы к коллекциям пользователя

            if (this.currentView === 'books') {
                // Для демонстрации показываем все книги
                this.items = this.allBooks.slice(0, 20); // Ограничиваем для демо
            } else {
                // Для авторов показываем всех авторов
                this.items = this.allAuthors.slice(0, 20); // Ограничиваем для демо
            }

            console.log('Loaded items:', this.items.length);

        } catch (error) {
            console.error('Error loading collections:', error);

            // Fallback to mock data
            if (this.currentView === 'books') {
                this.items = this.getMockBooks();
            } else {
                this.items = this.getMockAuthors();
            }
        }
    }

    // Action methods
    toggleNameEdit() {
        this.isEditingName = !this.isEditingName;
        this.rerender();

        if (this.isEditingName) {
            setTimeout(() => {
                const input = document.getElementById('nameInput');
                if (input) input.focus();
            }, 100);
        }
    }

    async saveUserName() {
        const input = document.getElementById('nameInput');
        const newName = input?.value.trim();

        if (newName) {
            try {
                // Обновляем в localStorage (в реальном приложении - API call)
                const user = JSON.parse(localStorage.getItem('user') || '{}');
                user.displayName = newName;
                localStorage.setItem('user', JSON.stringify(user));

                this.user = user;
                this.isEditingName = false;
                this.rerender();

                alert('Display name updated successfully!');
            } catch (error) {
                console.error('Error updating user name:', error);
                alert('Failed to update name');
            }
        } else {
            alert('Please enter a name');
        }
    }

    toggleListEdit() {
        this.isEditingLists = !this.isEditingLists;
        this.newListName = '';
        this.rerender();

        if (this.isEditingLists) {
            setTimeout(() => {
                const input = document.getElementById('listInput');
                if (input) input.focus();
            }, 100);
        }
    }

    async createNewList() {
        const input = document.getElementById('listInput');
        const listName = input?.value.trim();

        if (listName) {
            try {
                // Временно сохраняем только в памяти
                const newList = {
                    id: 'custom_' + Date.now(),
                    name: listName,
                    type: 'custom'
                };

                this.customLists.push(newList);
                this.newListName = '';
                this.isEditingLists = false;
                this.rerender();

                alert('Collection created successfully!');
            } catch (error) {
                console.error('Error creating list:', error);
                alert('Failed to create collection');
            }
        } else {
            alert('Please enter a collection name');
        }
    }

    async deleteList(listId) {
        if (confirm('Are you sure you want to delete this collection?')) {
            try {
                this.customLists = this.customLists.filter(list => list.id !== listId);

                if (this.currentList === listId) {
                    this.currentList = 'all';
                    await this.loadUserCollections();
                }
                this.rerender();

                alert('Collection deleted successfully!');
            } catch (error) {
                console.error('Error deleting list:', error);
                alert('Failed to delete collection');
            }
        }
    }

    async selectList(listId) {
        this.currentList = listId;
        this.isLoading = true;
        this.rerender();

        await this.loadUserCollections();
        this.isLoading = false;
        this.rerender();
    }

    async switchView(view) {
        this.currentView = view;
        this.isLoading = true;
        this.rerender();

        await this.loadUserCollections();
        this.isLoading = false;
        this.rerender();
    }

    navigateToBook(bookId) {
        window.location.hash = `#/book/${bookId}`;
    }

    navigateToAuthor(authorId) {
        window.location.hash = `#/author/${authorId}`;
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

    async showAuthorActions(authorId) {
        const actions = [
            'View author details'
        ];

        const actionText = actions.join('\n');
        const selectedAction = prompt(`Choose action for author:\n\n${actionText}`);

        if (selectedAction) {
            await this.handleAuthorAction(selectedAction, authorId);
        }
    }

    async handleBookAction(action, bookId) {
        try {
            switch (action) {
                case 'Add to favorites':
                    alert('Added to favorites! (Feature in development)');
                    break;
                case 'Add to reading list':
                    alert('Added to reading list! (Feature in development)');
                    break;
                case 'Rate book':
                    const rating = prompt('Rate this book (1-5):');
                    if (rating && rating >= 1 && rating <= 5) {
                        alert(`Rated ${rating} stars! (Feature in development)`);
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

    async handleAuthorAction(action, authorId) {
        try {
            switch (action) {
                case 'View author details':
                    this.navigateToAuthor(authorId);
                    break;
            }
        } catch (error) {
            console.error('Error handling author action:', error);
            alert('Failed to perform action');
        }
    }

    getCurrentListName() {
        const allLists = [...this.userLists, ...this.customLists];
        const list = allLists.find(l => l.id === this.currentList);
        return list ? list.name : 'Unknown';
    }

    getDefaultAvatar() {
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        if (user.avatarUrl) return user.avatarUrl;
        return `https://ui-avatars.com/api/?name=${encodeURIComponent(user.displayName || user.username || 'User')}&background=random&size=128`;
    }

    getDefaultBookCover() {
        return 'https://images.pexels.com/photos/1926988/pexels-photo-1926988.jpeg';
    }

    truncateText(text, maxLength) {
        if (!text || text.length <= maxLength) return text;
        return text.substring(0, maxLength) + '...';
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

    loadMockData() {
        console.log('Loading mock data for profile');
        this.allBooks = this.getMockBooks();
        this.allAuthors = this.getMockAuthors();
        this.items = this.currentView === 'books' ? this.allBooks : this.allAuthors;
    }

    // Mock data for fallback
    getMockBooks() {
        return [
            {
                id: 1,
                title: "The Great Gatsby",
                authors: [{ id: 1, name: "F. Scott Fitzgerald" }],
                year: 1925,
                averageRating: 4.5,
                description: "A classic novel of the Jazz Age, exploring themes of idealism, resistance to change, social upheaval, and excess.",
                coverUrl: this.getDefaultBookCover()
            },
            {
                id: 2,
                title: "To Kill a Mockingbird",
                authors: [{ id: 2, name: "Harper Lee" }],
                year: 1960,
                averageRating: 4.8,
                description: "A gripping, heart-wrenching tale of racial injustice and childhood innocence in the American South.",
                coverUrl: this.getDefaultBookCover()
            },
            {
                id: 3,
                title: "1984",
                authors: [{ id: 3, name: "George Orwell" }],
                year: 1949,
                averageRating: 4.7,
                description: "A dystopian social science fiction novel that examines totalitarianism, mass surveillance, and repressive regimentation.",
                coverUrl: this.getDefaultBookCover()
            }
        ];
    }

    getMockAuthors() {
        return [
            {
                id: 1,
                name: "F. Scott Fitzgerald",
                booksCount: 5,
                biography: "American novelist and short story writer, famous for his depictions of the Jazz Age.",
                photoUrl: null
            },
            {
                id: 2,
                name: "Harper Lee",
                booksCount: 2,
                biography: "American novelist best known for her 1960 novel To Kill a Mockingbird.",
                photoUrl: null
            },
            {
                id: 3,
                name: "George Orwell",
                booksCount: 8,
                biography: "English novelist, essayist, journalist and critic. His work is characterised by lucid prose, social criticism, and opposition to totalitarianism.",
                photoUrl: null
            }
        ];
    }
}

// Убедитесь что глобальная переменная установлена
window.profilePage = new ProfilePage();