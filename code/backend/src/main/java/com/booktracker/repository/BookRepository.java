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

    // Поиск по году публикации (обновите с year на publicationYear)
    Page<Book> findByPublicationYear(Integer publicationYear, Pageable pageable);

    // Поиск по жанру
    @Query("SELECT b FROM Book b JOIN b.genres g WHERE g.name = :genre")
    Page<Book> findByGenre(String genre, Pageable pageable);

    // Получение последних книг
    @Query("SELECT b FROM Book b ORDER BY b.publicationYear DESC")
    Page<Book> findLatestBooks(Pageable pageable);

    // Поиск по ISBN
    List<Book> findByIsbn(String isbn);
}