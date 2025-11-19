package com.booktracker.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import lombok.Data;
import lombok.EqualsAndHashCode;

@Entity
@Table(name = "collection_entries", indexes = {
        @Index(name = "idx_collection_user", columnList = "user_id"),
        @Index(name = "idx_collection_book", columnList = "book_id"),
        @Index(name = "idx_collection_status", columnList = "status")
})
@Data
@EqualsAndHashCode(onlyExplicitlyIncluded = true)
public class CollectionEntry {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @EqualsAndHashCode.Include
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "book_id", nullable = false)
    private Book book;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 20)
    private CollectionStatus status;

    @Column(name = "notes", columnDefinition = "TEXT")
    private String notes;

    @Min(1)
    @Max(5)
    @Column(name = "rating")
    private Integer rating;

    public void updateStatus(CollectionStatus newStatus) {
        this.status = newStatus;
    }
}