-- schema.sql
DROP TABLE IF EXISTS reviews;
DROP TABLE IF EXISTS collection_entries;
DROP TABLE IF EXISTS book_genres;
DROP TABLE IF EXISTS book_authors;
DROP TABLE IF EXISTS books;
DROP TABLE IF EXISTS authors;
DROP TABLE IF EXISTS genres;
DROP TABLE IF EXISTS users;

CREATE TABLE books (
                       id BIGINT AUTO_INCREMENT PRIMARY KEY,
                       title VARCHAR(255) NOT NULL,
                       isbn VARCHAR(20),
                       publication_year INTEGER, -- Измените здесь
                       description TEXT,
                       cover_url VARCHAR(500)
);

CREATE TABLE authors (
                         id BIGINT AUTO_INCREMENT PRIMARY KEY,
                         name VARCHAR(255) NOT NULL,
                         bio TEXT,
                         photo_url VARCHAR(500)
);

CREATE TABLE genres (
                        id BIGINT AUTO_INCREMENT PRIMARY KEY,
                        name VARCHAR(100) NOT NULL UNIQUE
);

CREATE TABLE book_authors (
                              book_id BIGINT NOT NULL,
                              author_id BIGINT NOT NULL,
                              PRIMARY KEY (book_id, author_id),
                              FOREIGN KEY (book_id) REFERENCES books(id) ON DELETE CASCADE,
                              FOREIGN KEY (author_id) REFERENCES authors(id) ON DELETE CASCADE
);

CREATE TABLE book_genres (
                             book_id BIGINT NOT NULL,
                             genre_id BIGINT NOT NULL,
                             PRIMARY KEY (book_id, genre_id),
                             FOREIGN KEY (book_id) REFERENCES books(id) ON DELETE CASCADE,
                             FOREIGN KEY (genre_id) REFERENCES genres(id) ON DELETE CASCADE
);

CREATE TABLE users (
                       id BIGINT AUTO_INCREMENT PRIMARY KEY,
                       email VARCHAR(50) UNIQUE NOT NULL,
                       password VARCHAR(120) NOT NULL,
                       display_name VARCHAR(50) NOT NULL,
                       register_date TIMESTAMP
);

CREATE TABLE collection_entries (
                                    id BIGINT AUTO_INCREMENT PRIMARY KEY,
                                    user_id BIGINT NOT NULL,
                                    book_id BIGINT NOT NULL,
                                    status VARCHAR(20) NOT NULL,
                                    notes TEXT,
                                    rating INTEGER,
                                    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
                                    FOREIGN KEY (book_id) REFERENCES books(id) ON DELETE CASCADE
);

CREATE TABLE reviews (
                         id BIGINT AUTO_INCREMENT PRIMARY KEY,
                         text TEXT NOT NULL,
                         rating INTEGER NOT NULL,
                         created_at TIMESTAMP NOT NULL,
                         status VARCHAR(20) NOT NULL DEFAULT 'PENDING',
                         user_id BIGINT NOT NULL,
                         book_id BIGINT NOT NULL,
                         FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
                         FOREIGN KEY (book_id) REFERENCES books(id) ON DELETE CASCADE
);