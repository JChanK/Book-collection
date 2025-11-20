import axios from 'axios';

const API_BASE_URL = 'http://localhost:8080/api';

class ApiService {
    constructor() {
        this.client = axios.create({
            baseURL: API_BASE_URL,
            headers: {
                'Content-Type': 'application/json',
            },
        });

        // Добавляем интерцептор для JWT токена
        this.client.interceptors.request.use(
            (config) => {
                const token = localStorage.getItem('token');
                if (token) {
                    config.headers.Authorization = `Bearer ${token}`;
                }
                return config;
            },
            (error) => {
                return Promise.reject(error);
            }
        );

        // Добавляем интерцептор для обработки ошибок
        this.client.interceptors.response.use(
            (response) => response,
            (error) => {
                if (error.response?.status === 401) {
                    localStorage.removeItem('token');
                    localStorage.removeItem('user');
                    window.location.hash = '#/auth';
                }
                return Promise.reject(error);
            }
        );
    }

    // Auth endpoints
    async login(login, password) {
        const response = await this.client.post('/auth/login', { login, password });
        return response.data;
    }

    async register(userData) {
        const response = await this.client.post('/auth/register', {
            username: userData.username,
            email: userData.email,
            password: userData.password,
            confirmPassword: userData.confirmPassword
            // displayName удален
        });
        return response.data;
    }

    // Book endpoints
    async getBooks(page = 0, size = 20, sort = 'title') {
        const response = await this.client.get('/books', {
            params: { page, size, sort }
        });
        return response.data;
    }

    async getBookById(id) {
        const response = await this.client.get(`/books/${id}`);
        return response.data;
    }

    async getFilteredBooks(genres, chapters, sort = 'title', page = 0, size = 20) {
        const params = { page, size, sort };
        if (genres && genres.length > 0) params.genres = genres;
        if (chapters) params.chapters = chapters;

        const response = await this.client.get('/books/filter', { params });
        return response.data;
    }

    async searchBooks(query, page = 0, size = 20) {
        const response = await this.client.get('/books/search', {
            params: { query, page, size }
        });
        return response.data;
    }

    // Author endpoints
    async getAuthors(page = 0, size = 20) {
        const response = await this.client.get('/authors', {
            params: { page, size }
        });
        return response.data;
    }

    async getAuthorById(id) {
        const response = await this.client.get(`/authors/${id}`);
        return response.data;
    }

    async getBooksByAuthor(authorId, page = 0, size = 50) {
        const response = await this.client.get(`/authors/${authorId}/books`, {
            params: { page, size }
        });
        return response.data;
    }

    async searchAuthors(query, page = 0, size = 20) {
        const response = await this.client.get('/authors/search', {
            params: { query, page, size }
        });
        return response.data;
    }

    // Review endpoints
    async getBookReviews(bookId, page = 0, size = 20) {
        const response = await this.client.get(`/books/${bookId}/reviews`, {
            params: { page, size }
        });
        return response.data;
    }

    async addReview(bookId, reviewData) {
        const response = await this.client.post(`/books/${bookId}/reviews`, reviewData);
        return response.data;
    }

    // User endpoints
    async getUserProfile() {
        const response = await this.client.get('/user/profile');
        return response.data;
    }

    async updateUserProfile(userData) {
        const response = await this.client.put('/user/profile', userData);
        return response.data;
    }

    // User Lists endpoints
    async getUserLists() {
        const response = await this.client.get('/user/lists');
        return response.data;
    }

    async createUserList(listData) {
        const response = await this.client.post('/user/lists', listData);
        return response.data;
    }

    async deleteUserList(listId) {
        const response = await this.client.delete(`/user/lists/${listId}`);
        return response.data;
    }

    async getListItems(listId, type = 'books') {
        const response = await this.client.get(`/user/lists/${listId}/items`, {
            params: { type }
        });
        return response.data;
    }

    async addBookToList(listId, bookId) {
        const response = await this.client.post(`/user/lists/${listId}/books/${bookId}`);
        return response.data;
    }

    async removeBookFromList(listId, bookId) {
        const response = await this.client.delete(`/user/lists/${listId}/books/${bookId}`);
        return response.data;
    }

    async addAuthorToList(listId, authorId) {
        const response = await this.client.post(`/user/lists/${listId}/authors/${authorId}`);
        return response.data;
    }

    async removeAuthorFromList(listId, authorId) {
        const response = await this.client.delete(`/user/lists/${listId}/authors/${authorId}`);
        return response.data;
    }

    // Collection endpoints
    async getUserCollection(page = 0, size = 20) {
        const response = await this.client.get('/collections', {
            params: { page, size }
        });
        return response.data;
    }

    async addToCollection(bookId, status, notes = '', rating = null) {
        const response = await this.client.post('/collections', {
            bookId,
            status,
            notes,
            rating
        });
        return response.data;
    }

    async updateCollectionEntry(entryId, updates) {
        const response = await this.client.put(`/collections/${entryId}`, updates);
        return response.data;
    }

    async removeFromCollection(entryId) {
        const response = await this.client.delete(`/collections/${entryId}`);
        return response.data;
    }
}

export const apiService = new ApiService();