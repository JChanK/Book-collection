package com.booktracker.service;

import com.booktracker.dto.ReviewDTO;
import com.booktracker.entity.Review;
import com.booktracker.entity.User;
import com.booktracker.repository.BookRepository;
import com.booktracker.repository.ReviewRepository;
import lombok.RequiredArgsConstructor;
import org.modelmapper.ModelMapper;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class ReviewService {

    private final ReviewRepository reviewRepository;
    private final BookRepository bookRepository;
    private final UserService userService;
    private final ModelMapper modelMapper;

    public Page<ReviewDTO> getBookReviews(Long bookId, Pageable pageable) {
        return reviewRepository.findByBookId(bookId, pageable)
                .map(this::convertToDTO);
    }

    public Page<ReviewDTO> getUserReviews(Long userId, Pageable pageable) {
        return reviewRepository.findByUserId(userId, pageable)
                .map(this::convertToDTO);
    }

    public Page<ReviewDTO> getLatestReviews(Pageable pageable) {
        return reviewRepository.findLatestApprovedReviews(pageable)
                .map(this::convertToDTO);
    }

    public ReviewDTO addReview(ReviewDTO reviewDTO, Long bookId) {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userService.findByEmail(email);

        Review review = modelMapper.map(reviewDTO, Review.class);
        review.setUser(user);
        review.setBook(bookRepository.findById(bookId)
                .orElseThrow(() -> new RuntimeException("Book not found")));

        if (!review.validate()) {
            throw new RuntimeException("Invalid review data");
        }

        Review savedReview = reviewRepository.save(review);
        return convertToDTO(savedReview);
    }

    public void approveReview(Long reviewId) {
        Review review = reviewRepository.findById(reviewId)
                .orElseThrow(() -> new RuntimeException("Review not found"));
        review.approve();
        reviewRepository.save(review);
    }

    private ReviewDTO convertToDTO(Review review) {
        ReviewDTO dto = modelMapper.map(review, ReviewDTO.class);
        dto.setUserName(review.getUser().getUsername());
        dto.setBookId(review.getBook().getId());
        return dto;
    }
}