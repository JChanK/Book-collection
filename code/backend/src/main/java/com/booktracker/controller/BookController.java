package com.booktracker.controller;

import com.booktracker.dto.BookDTO;
import com.booktracker.entity.Book;
import com.booktracker.service.BookService;
import com.booktracker.repository.BookRepository;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.antlr.v4.runtime.tree.pattern.ParseTreePattern;
import org.springframework.data.domain.*;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/books")
@RequiredArgsConstructor
@Tag(name = "Books", description = "API для управления книгами")
public class BookController {

    private final BookService bookService;
    private final BookRepository bookRepository;

    @Operation(summary = "Получить все книги", description = "Возвращает список книг с пагинацией")
    @GetMapping
    public ResponseEntity<Page<BookDTO>> getAllBooks(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(defaultValue = "title") String sort) {

        Pageable pageable = PageRequest.of(page, size, Sort.by(sort));
        Page<BookDTO> books = bookService.getAllBooks(pageable);
        return ResponseEntity.ok(books);
    }

    @Operation(summary = "Получить книгу по ID", description = "Возвращает детальную информацию о книге")
    @GetMapping("/{id}")
    public ResponseEntity<BookDTO> getBookById(@PathVariable Long id) {
        BookDTO book = bookService.getBookById(id);
        return ResponseEntity.ok(book);
    }

    @Operation(summary = "Поиск книг", description = "Поиск книг по названию")
    @GetMapping("/search")
    public ResponseEntity<Page<BookDTO>> searchBooks(
            @RequestParam String query,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {

        Pageable pageable = PageRequest.of(page, size);
        Page<BookDTO> books = bookService.searchBooks(query, pageable);
        return ResponseEntity.ok(books);
    }

    @GetMapping("/filter")
    public ResponseEntity<Page<Book>> getFilteredBooks(
            @RequestParam(required = false) List<String> genres,
            @RequestParam(required = false) String chapters,
            @RequestParam(defaultValue = "title") String sort,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {

        // Получаем все книги
        List<Book> allBooks = bookRepository.findAll();

        // Фильтрация по жанрам
        if (genres != null && !genres.isEmpty()) {
            allBooks = allBooks.stream()
                    .filter(book -> book.getGenres() != null &&
                            book.getGenres().stream()
                                    .anyMatch(genres::contains))
                    .collect(Collectors.toList());
        }


        // Упрощенная сортировка - ИСПРАВЛЕННАЯ ВЕРСИЯ
        allBooks.sort((b1, b2) -> {
            switch (sort) {
                case "title_desc":
                    return b2.getTitle().compareToIgnoreCase(b1.getTitle());
                case "year_asc":
                    // Для примитивного int просто сравниваем значения
                    return Integer.compare(b1.getYear(), b2.getYear());
                case "year_desc":
                    // Для примитивного int просто сравниваем значения в обратном порядке
                    return Integer.compare(b2.getYear(), b1.getYear());
                case "rating_desc":
                    // Для averageRating (если это Double)
                    if (b1.getAverageRating() == null && b2.getAverageRating() == null) return 0;
                    if (b1.getAverageRating() == null) return 1;
                    if (b2.getAverageRating() == null) return -1;
                    return Double.compare(b2.getAverageRating(), b1.getAverageRating());
                default: // title_asc
                    return b1.getTitle().compareToIgnoreCase(b2.getTitle());
            }
        });

        // Пагинация
        int start = page * size;
        int end = Math.min(start + size, allBooks.size());

        if (start >= allBooks.size()) {
            return ResponseEntity.ok(Page.empty());
        }

        List<Book> pageContent = allBooks.subList(start, end);
        Page<Book> resultPage = new PageImpl<>(
                pageContent,
                PageRequest.of(page, size),
                allBooks.size()
        );

        return ResponseEntity.ok(resultPage);
    }
}