package com.booktracker.service;

import com.booktracker.entity.Author;
import com.booktracker.entity.Book;
import com.booktracker.entity.Genre;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.HashSet;
import java.util.Set;

@Service
@Slf4j
public class ExternalBookService {

    public Book fetchBookByIsbn(String isbn) {
        log.info("Fetching book by ISBN: {}", isbn);

        // Заглушка для демонстрации
        Book book = new Book();
        book.setTitle("Sample Book Title");
        book.setIsbn(isbn);
        book.setPublicationYear(2023);
        book.setDescription("This is a sample book description from external API");
        book.setCoverUrl("https://via.placeholder.com/150");

        // Добавляем автора
        Author author = new Author();
        author.setName("Sample Author");
        author.setBio("Author biography");

        Set<Author> authors = new HashSet<>();
        authors.add(author);
        book.setAuthors(authors);

        return book;
    }
}