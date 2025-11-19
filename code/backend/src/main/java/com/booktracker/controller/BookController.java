package com.booktracker.controller;

import com.booktracker.dto.BookDTO;
import com.booktracker.service.BookService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/books")
@RequiredArgsConstructor
@Tag(name = "Books", description = "API для управления книгами")
public class BookController {

    private final BookService bookService;

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
}