package com.booktracker.controller;

import com.booktracker.entity.User;
import com.booktracker.repository.UserRepository;
import lombok.Data;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;


import java.util.Optional;

@RestController
@RequestMapping("/api/user")
public class UserController {

    private final UserRepository userRepository;

    public UserController(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @PutMapping("/profile")
    public ResponseEntity<User> updateProfile(@RequestBody UserProfileUpdate request,
                                              Authentication authentication) {
        String username = authentication.getName();
        Optional<Object> userOpt = userRepository.findByUsername(username);

        if (userOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        User user = (User) userOpt.get();

        // Обновляем только разрешенные поля
        if (request.getDisplayName() != null && !request.getDisplayName().trim().isEmpty()) {
            user.setUsername(request.getDisplayName().trim());
        }

        if (request.getAvatarUrl() != null) {
            user.setAvatarUrl(request.getAvatarUrl());
        }

        // Проверяем, не занято ли новое имя пользователя (если меняется)
        if (request.getUsername() != null &&
                !request.getUsername().equals(user.getUsername()) &&
                !request.getUsername().trim().isEmpty()) {

            String newUsername = request.getUsername().trim();
            if (userRepository.existsByUsername(newUsername)) {
                return ResponseEntity.badRequest().build(); // Username уже занят
            }
            user.setUsername(newUsername);
        }

        User updatedUser = userRepository.save(user);

        // Возвращаем пользователя без пароля
        updatedUser.setPassword(null);

        return ResponseEntity.ok(updatedUser);
    }

    // Получить профиль текущего пользователя
    @GetMapping("/profile")
    public ResponseEntity<User> getProfile(Authentication authentication) {
        String username = authentication.getName();
        Optional<Object> userOpt = userRepository.findByUsername(username);

        if (userOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        User user = (User) userOpt.get();
        user.setPassword(null); // Не возвращаем пароль

        return ResponseEntity.ok(user);
    }

    @Data
    public static class UserProfileUpdate {
        private String username;
        private String displayName;
        private String avatarUrl;
    }
}