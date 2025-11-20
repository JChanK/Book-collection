package com.booktracker.dto;

import lombok.Data;
import java.util.HashSet;
import java.util.Set;

@Data
public class BookDTO {
    private Long id;
    private String title;
    private String isbn;
    private Integer year; // Используем только year
    private String description;
    private String coverUrl;
    private Integer pages;
    private Integer chapters;
    private Double averageRating;
    private Integer ratingsCount;
    private Set<AuthorDTO> authors = new HashSet<>();
    private Set<GenreDTO> genres = new HashSet<>();

    // Для обратной совместимости
    public Integer getPublicationYear() {
        return year;
    }

    public void setPublicationYear(Integer publicationYear) {
        this.year = publicationYear;
    }
}