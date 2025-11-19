package com.booktracker.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = "authors", indexes = {
        @Index(name = "idx_author_name", columnList = "name")
})
@Data
@EqualsAndHashCode(onlyExplicitlyIncluded = true)
public class Author {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @EqualsAndHashCode.Include
    private Long id;

    @NotBlank
    @Size(max = 255)
    @Column(name = "name", nullable = false, length = 255)
    private String name;

    @Column(name = "bio", columnDefinition = "TEXT")
    private String bio;

    @Column(name = "photo_url", length = 500)
    private String photoUrl;

    @ManyToMany(mappedBy = "authors", fetch = FetchType.LAZY)
    private Set<Book> books = new HashSet<>();
}