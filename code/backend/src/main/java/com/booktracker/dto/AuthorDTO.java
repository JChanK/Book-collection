package com.booktracker.dto;

import lombok.Data;

@Data
public class AuthorDTO {
    private Long id;
    private String name;
    private String biography; // Используем biography вместо bio
    private String photoUrl;
    private Integer birthYear;
    private Integer deathYear;
    private String nationality;

    // Для обратной совместимости
    public String getBio() {
        return biography;
    }

    public void setBio(String bio) {
        this.biography = bio;
    }
}