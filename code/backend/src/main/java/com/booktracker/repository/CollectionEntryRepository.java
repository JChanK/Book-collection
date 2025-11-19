// CollectionEntryRepository.java
package com.booktracker.repository;

import com.booktracker.entity.CollectionEntry;
import com.booktracker.entity.CollectionStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CollectionEntryRepository extends JpaRepository<CollectionEntry, Long> {
    Page<CollectionEntry> findByUserId(Long userId, Pageable pageable);
    Page<CollectionEntry> findByUserIdAndStatus(Long userId, CollectionStatus status, Pageable pageable);

    @Query("SELECT ce FROM CollectionEntry ce WHERE ce.user.id = :userId AND ce.book.id = :bookId")
    Optional<CollectionEntry> findByUserIdAndBookId(@Param("userId") Long userId, @Param("bookId") Long bookId);

    boolean existsByUserIdAndBookId(Long userId, Long bookId);
}