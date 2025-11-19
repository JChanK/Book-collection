package com.booktracker.service;

import com.booktracker.dto.BookDTO;
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
        return bookRepository.findAll(pageable)
                .map(this::convertToDTO);
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

    public Page<BookDTO> getBooksByYear(Integer year, Pageable pageable) {
        return bookRepository.findByPublicationYear(year, pageable)
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
        dto.setPublicationYear(book.getPublicationYear());
        dto.setDescription(book.getDescription());
        dto.setCoverUrl(book.getCoverUrl());
        dto.setAverageRating(book.getAverageRating());

        // Простая конвертация авторов
        if (book.getAuthors() != null) {
            dto.setAuthors(book.getAuthors().stream()
                    .map(author -> {
                        var authorDTO = new com.booktracker.dto.AuthorDTO();
                        authorDTO.setId(author.getId());
                        authorDTO.setName(author.getName());
                        authorDTO.setBio(author.getBio());
                        authorDTO.setPhotoUrl(author.getPhotoUrl());
                        return authorDTO;
                    })
                    .collect(Collectors.toSet()));
        }

        return dto;
    }
}