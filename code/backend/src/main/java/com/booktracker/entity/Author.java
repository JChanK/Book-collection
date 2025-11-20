package com.booktracker.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = "authors")
@Data
@EqualsAndHashCode(onlyExplicitlyIncluded = true)
public class Author {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @EqualsAndHashCode.Include
    private Long id;

    @Column(name = "name", nullable = false)
    private String name;

    @Column(name = "biography", columnDefinition = "TEXT") // Исправлено с bio на biography
    private String biography;

    @Column(name = "birth_year")
    private Integer birthYear;

    @Column(name = "death_year")
    private Integer deathYear;

    @Column(name = "nationality")
    private String nationality;

    @Column(name = "photo_url")
    private String photoUrl;

    @ManyToMany(mappedBy = "authors")
    private Set<Book> books = new HashSet<>();

    // Геттер для обратной совместимости
    public String getBio() {
        return biography;
    }

    // Сеттер для обратной совместимости
    public void setBio(String bio) {
        this.biography = bio;
    }
}