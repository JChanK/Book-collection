export class BookCard {
    constructor(book) {
        this.book = book;
    }

    render() {
        const coverUrl = this.book.coverUrl || 'https://images.pexels.com/photos/1926988/pexels-photo-1926988.jpeg';
        const authors = this.book.authors ? this.book.authors.map(a => a.name).join(', ') : 'Unknown Author';

        return `
            <div class="book-card" onclick="app.showBookDetail(${this.book.id})">
                <img src="${coverUrl}" alt="${this.book.title}" class="book-cover" 
                     onerror="this.src='https://images.pexels.com/photos/1926988/pexels-photo-1926988.jpeg'">
                <h3 class="book-title">${this.book.title}</h3>
                <p class="book-author">by ${authors}</p>
                ${this.book.year ? `<p class="book-year">${this.book.year}</p>` : ''}
                ${this.book.averageRating ? `
                    <div class="rating">
                        ${'★'.repeat(Math.round(this.book.averageRating))}${'☆'.repeat(5 - Math.round(this.book.averageRating))}
                        (${this.book.averageRating.toFixed(1)})
                    </div>
                ` : ''}
            </div>
        `;
    }
}