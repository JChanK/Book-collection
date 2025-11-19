// ReviewDTO.java
package com.booktracker.dto;

import lombok.Data;

import java.time.LocalDateTime;

@Data
public class ReviewDTO {
    private Long id;
    private String text;
    private Integer rating;
    private LocalDateTime createdAt;
    private String userName;
    private Long bookId;
}