// ReviewRepository.java
package com.booktracker.repository;

import com.booktracker.entity.Review;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ReviewRepository extends JpaRepository<Review, Long> {
    Page<Review> findByBookId(Long bookId, Pageable pageable);
    Page<Review> findByUserId(Long userId, Pageable pageable);

    @Query("SELECT r FROM Review r WHERE r.status = 'APPROVED' ORDER BY r.createdAt DESC")
    Page<Review> findLatestApprovedReviews(Pageable pageable);

    @Query("SELECT AVG(r.rating) FROM Review r WHERE r.book.id = :bookId AND r.status = 'APPROVED'")
    Double findAverageRatingByBookId(@Param("bookId") Long bookId);
}