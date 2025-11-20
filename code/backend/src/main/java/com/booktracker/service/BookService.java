package com.booktracker.service;

import com.booktracker.dto.AuthorDTO;
import com.booktracker.dto.BookDTO;
import com.booktracker.dto.GenreDTO;
import com.booktracker.entity.Book;
import com.booktracker.repository.BookRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class BookService {

    private final BookRepository bookRepository;

    public Page<BookDTO> getAllBooks(Pageable pageable) {
        Page<Book> booksPage = bookRepository.findAll(pageable);
        System.out.println("Total books in DB: " + booksPage.getTotalElements());
        System.out.println("Books on current page: " + booksPage.getContent().size());

        return booksPage.map(this::convertToDTO);
    }

    public BookDTO getBookById(Long id) {
        Book book = bookRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Book not found with id: " + id));
        return convertToDTO(book);
    }

    public Page<BookDTO> searchBooks(String query, Pageable pageable) {
        return bookRepository.findByTitleContainingIgnoreCase(query, pageable)
                .map(this::convertToDTO);
    }

    public Page<BookDTO> getBooksByGenre(String genre, Pageable pageable) {
        return bookRepository.findByGenre(genre, pageable)
                .map(this::convertToDTO);
    }

    public Page<BookDTO> getLatestBooks(Pageable pageable) {
        return bookRepository.findLatestBooks(pageable)
                .map(this::convertToDTO);
    }

    // ИСПРАВЛЕНО: используем правильный метод репозитория
    public Page<BookDTO> getBooksByYear(Integer year, Pageable pageable) {
        return bookRepository.findByYear(year, pageable)
                .map(this::convertToDTO);
    }

    public BookDTO createBook(Book book) {
        Book savedBook = bookRepository.save(book);
        return convertToDTO(savedBook);
    }

    private BookDTO convertToDTO(Book book) {
        BookDTO dto = new BookDTO();
        dto.setId(book.getId());
        dto.setTitle(book.getTitle());
        dto.setIsbn(book.getIsbn());
        dto.setYear(book.getYear());
        dto.setDescription(book.getDescription());
        dto.setCoverUrl(book.getCoverUrl());
        dto.setPages(book.getPages());
        dto.setChapters(book.getChapters());
        dto.setAverageRating(book.getAverageRating());
        dto.setRatingsCount(book.getRatingsCount());

        // Конвертация авторов - используем biography вместо bio
        if (book.getAuthors() != null) {
            dto.setAuthors(book.getAuthors().stream()
                    .map(author -> {
                        var authorDTO = new AuthorDTO();
                        authorDTO.setId(author.getId());
                        authorDTO.setName(author.getName());
                        authorDTO.setBiography(author.getBiography()); // Используем getBiography()
                        authorDTO.setPhotoUrl(author.getPhotoUrl());
                        return authorDTO;
                    })
                    .collect(Collectors.toSet()));
        }

        // Конвертация жанров
        if (book.getGenres() != null) {
            dto.setGenres(book.getGenres().stream()
                    .map(genre -> {
                        var genreDTO = new GenreDTO();
                        genreDTO.setId(genre.getId());
                        genreDTO.setName(genre.getName());
                        return genreDTO;
                    })
                    .collect(Collectors.toSet()));
        }

        return dto;
    }

    // Добавим метод для отладки
    public long getTotalBooksCount() {
        return bookRepository.count();
    }
}