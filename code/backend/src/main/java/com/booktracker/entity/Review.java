package com.booktracker.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.time.LocalDateTime;

@Entity
@Table(name = "reviews", indexes = {
        @Index(name = "idx_review_book", columnList = "book_id"),
        @Index(name = "idx_review_user", columnList = "user_id"),
        @Index(name = "idx_review_status", columnList = "status"),
        @Index(name = "idx_review_created", columnList = "created_at")
})
@Data
@EqualsAndHashCode(onlyExplicitlyIncluded = true)
public class Review {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @EqualsAndHashCode.Include
    private Long id;

    @NotBlank
    @Size(max = 2000)
    @Column(name = "text", nullable = false, columnDefinition = "TEXT")
    private String text;

    @Min(1)
    @Max(5)
    @Column(name = "rating", nullable = false)
    private Integer rating;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 20)
    private ReviewStatus status = ReviewStatus.PENDING;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "book_id", nullable = false)
    private Book book;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }

    public void approve() {
        this.status = ReviewStatus.APPROVED;
    }

    public void reject() {
        this.status = ReviewStatus.REJECTED;
    }

    public boolean validate() {
        return text != null && !text.trim().isEmpty() &&
                rating >= 1 && rating <= 5;
    }
}

enum ReviewStatus {
    PENDING, APPROVED, REJECTED
}