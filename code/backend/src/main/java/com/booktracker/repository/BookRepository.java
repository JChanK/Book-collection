package com.booktracker.repository;

import com.booktracker.entity.Book;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface BookRepository extends JpaRepository<Book, Long> {

    // Поиск по названию
    Page<Book> findByTitleContainingIgnoreCase(String title, Pageable pageable);

    // ИСПРАВЛЕНО: используем правильное имя поля "year"
    Page<Book> findByYear(Integer year, Pageable pageable);

    // Поиск по жанру
    @Query("SELECT b FROM Book b JOIN b.genres g WHERE g.name = :genre")
    Page<Book> findByGenre(String genre, Pageable pageable);

    // Получение последних книг
    @Query("SELECT b FROM Book b ORDER BY b.year DESC")
    Page<Book> findLatestBooks(Pageable pageable);

    // Поиск по ISBN
    List<Book> findByIsbn(String isbn);

    // Получение всех книг с пагинацией (для тестирования)
    @Query("SELECT b FROM Book b")
    Page<Book> findAllBooks(Pageable pageable);

}