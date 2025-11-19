// CollectionEntryDTO.java
package com.booktracker.dto;

import lombok.Data;

@Data
public class CollectionEntryDTO {
    private Long id;
    private Long bookId;
    private String bookTitle;
    private String status;
    private String notes;
    private Integer rating;
}