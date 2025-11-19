// AuthorDTO.java
package com.booktracker.dto;

import lombok.Data;

@Data
public class AuthorDTO {
    private Long id;
    private String name;
    private String bio;
    private String photoUrl;
}