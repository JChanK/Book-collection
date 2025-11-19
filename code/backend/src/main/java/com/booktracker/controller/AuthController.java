package com.booktracker.controller;

import com.booktracker.dto.AuthRequest;
import com.booktracker.dto.AuthResponse;
import com.booktracker.entity.User;
import com.booktracker.service.AuthService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
@Tag(name = "Authentication", description = "API для аутентификации и регистрации")
public class AuthController {

    private final AuthService authService;

    @Operation(summary = "Вход в систему", description = "Аутентификация пользователя и получение JWT токена")
    @PostMapping("/login")
    public ResponseEntity<AuthResponse> authenticateUser(@Valid @RequestBody AuthRequest authRequest) {
        AuthResponse response = authService.authenticateUser(authRequest);
        return ResponseEntity.ok(response);
    }

    @Operation(summary = "Регистрация", description = "Создание нового пользователя")
    @PostMapping("/register")
    public ResponseEntity<AuthResponse> registerUser(@Valid @RequestBody User user) {
        AuthResponse response = authService.registerUser(user);
        return ResponseEntity.ok(response);
    }
}