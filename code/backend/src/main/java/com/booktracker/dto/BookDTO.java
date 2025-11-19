package com.booktracker.dto;

import lombok.Data;
import java.util.HashSet;
import java.util.Set;

@Data
public class BookDTO {
    private Long id;
    private String title;
    private String isbn;
    private Integer publicationYear; // Обновите здесь тоже
    private String description;
    private String coverUrl;
    private Double averageRating;
    private Set<AuthorDTO> authors = new HashSet<>();
}