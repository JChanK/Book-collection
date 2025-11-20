// AuthService.java
package com.booktracker.service;

import com.booktracker.dto.AuthRequest;
import com.booktracker.dto.AuthResponse;
import com.booktracker.entity.User;
import com.booktracker.security.JwtTokenProvider;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final AuthenticationManager authenticationManager;
    private final JwtTokenProvider tokenProvider;
    private final UserService userService;

    public AuthResponse authenticateUser(AuthRequest authRequest) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        authRequest.getEmail(),
                        authRequest.getPassword()
                )
        );

        SecurityContextHolder.getContext().setAuthentication(authentication);
        String jwt = tokenProvider.generateToken(authentication);

        User user = userService.findByEmail(authRequest.getEmail());

        return new AuthResponse(jwt, "Bearer", user.getId(), user.getEmail(), user.getUsername());
    }

    public AuthResponse registerUser(User user) {
        User registeredUser = userService.registerUser(user);

        // Auto-login after registration
        AuthRequest authRequest = new AuthRequest();
        authRequest.setEmail(user.getEmail());
        authRequest.setPassword(user.getPassword());

        return authenticateUser(authRequest);
    }
}