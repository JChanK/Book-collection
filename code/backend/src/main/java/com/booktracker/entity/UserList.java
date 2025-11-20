package com.booktracker.entity;

import jakarta.persistence.*;
import org.springframework.data.annotation.Id;
import lombok.RequiredArgsConstructor;
import lombok.Setter;
import lombok.Getter;
import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = "user_lists")
public class UserList {
    @Getter
    @Setter
    @jakarta.persistence.Id
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Setter
    @Getter
    private String name;
    @Setter
    @Getter
    private String type; // 'system' or 'custom'

    @Getter
    @Setter
    @ManyToOne
    @JoinColumn(name = "user_id")
    private User user;

    @Setter
    @Getter
    @ManyToMany
    @JoinTable(
            name = "list_books",
            joinColumns = @JoinColumn(name = "list_id"),
            inverseJoinColumns = @JoinColumn(name = "book_id")
    )
    private Set<Book> books = new HashSet<>();

    @Setter
    @Getter
    @ManyToMany
    @JoinTable(
            name = "list_authors",
            joinColumns = @JoinColumn(name = "list_id"),
            inverseJoinColumns = @JoinColumn(name = "author_id")
    )
    private Set<Author> authors = new HashSet<>();

    // constructors, getters, setters
}