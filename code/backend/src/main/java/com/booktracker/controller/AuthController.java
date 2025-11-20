package com.booktracker.controller;

import com.booktracker.entity.User;
import com.booktracker.repository.UserRepository;
import com.booktracker.service.JwtService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.Optional;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
@Slf4j // ДОБАВЬТЕ ЭТУ АННОТАЦИЮ
@Tag(name = "Authentication", description = "API для аутентификации и регистрации")
public class AuthController {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    @Operation(summary = "Вход в систему", description = "Аутентификация пользователя и получение JWT токена")
    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody @Valid LoginRequest request) {
        log.info("Login attempt for: {}", request.getLogin()); // ЛОГИРОВАНИЕ

        // Поиск по email или username
        Optional<User> userOpt = userRepository.findByUsernameOrEmail(request.getLogin(), request.getLogin());

        log.info("User found: {}", userOpt.isPresent()); // ЛОГИРОВАНИЕ

        if (userOpt.isEmpty()) {
            log.warn("User not found: {}", request.getLogin());
            return ResponseEntity.badRequest().body("User not found");
        }

        User user = userOpt.get();
        log.info("User password matches: {}", passwordEncoder.matches(request.getPassword(), user.getPassword())); // ЛОГИРОВАНИЕ

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            log.warn("Invalid password for user: {}", request.getLogin());
            return ResponseEntity.badRequest().body("Invalid password");
        }

        String token = jwtService.generateToken(user.getUsername());
        log.info("Login successful for user: {}", user.getUsername());

        return ResponseEntity.ok(new AuthResponse(
                token,
                user.getId(),
                user.getUsername(),
                user.getUsername(),
                user.getAvatarUrl()
        ));
    }

    @Operation(summary = "Регистрация", description = "Создание нового пользователя")
    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody @Valid RegisterRequest request) {
        log.info("Registration attempt for username: {}, email: {}", request.getUsername(), request.getEmail()); // ЛОГИРОВАНИЕ

        // Проверяем существование username
        if (userRepository.existsByUsername(request.getUsername())) {
            log.warn("Username already exists: {}", request.getUsername());
            return ResponseEntity.badRequest().body("Username already exists");
        }

        // Проверяем существование email
        if (userRepository.existsByEmail(request.getEmail())) {
            log.warn("Email already exists: {}", request.getEmail());
            return ResponseEntity.badRequest().body("Email already exists");
        }

        // Проверяем совпадение паролей
        if (!request.getPassword().equals(request.getConfirmPassword())) {
            log.warn("Passwords do not match for user: {}", request.getUsername());
            return ResponseEntity.badRequest().body("Passwords do not match");
        }

        // Создаем нового пользователя
        User user = new User();
        user.setUsername(request.getUsername());
        user.setEmail(request.getEmail());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        // avatarUrl можно установить позже

        try {
            User savedUser = userRepository.save(user);
            log.info("User registered successfully: {}", savedUser.getUsername());

            // Генерируем токен
            String token = jwtService.generateToken(savedUser.getUsername());

            return ResponseEntity.ok(new AuthResponse(
                    token,
                    savedUser.getId(),
                    savedUser.getUsername(),
                    savedUser.getUsername(),
                    savedUser.getAvatarUrl()
            ));
        } catch (Exception e) {
            log.error("Error saving user: {}", e.getMessage());
            return ResponseEntity.badRequest().body("Registration failed: " + e.getMessage());
        }
    }

    // DTO классы
    @Data
    public static class LoginRequest {
        private String login; // Может быть email или username
        private String password;
    }

    @Data
    public static class RegisterRequest {
        private String username;
        private String email;
        private String password;
        private String confirmPassword;
    }

    @Data
    public static class AuthResponse {
        private String token;
        private Long userId;
        private String username;
        private String displayName;
        private String avatarUrl;

        public AuthResponse(String token, Long userId, String username, String displayName, String avatarUrl) {
            this.token = token;
            this.userId = userId;
            this.username = username;
            this.displayName = displayName;
            this.avatarUrl = avatarUrl;
        }
    }
}