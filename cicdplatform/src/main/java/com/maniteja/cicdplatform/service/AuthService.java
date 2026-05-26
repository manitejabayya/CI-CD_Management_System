package com.maniteja.cicdplatform.service;

import com.maniteja.cicdplatform.dto.AuthResponse;
import com.maniteja.cicdplatform.dto.LoginRequest;
import com.maniteja.cicdplatform.dto.RegisterRequest;
import com.maniteja.cicdplatform.entity.User;
import com.maniteja.cicdplatform.repository.UserRepository;
import com.maniteja.cicdplatform.security.JwtService;

import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    public AuthResponse register(RegisterRequest request) {

    User user = User.builder()
            .username(request.getUsername())
            .email(request.getEmail())
            .password(passwordEncoder.encode(request.getPassword()))
            .role("USER")
            .build();

    userRepository.save(user);

    String token = jwtService.generateToken(user.getEmail());

    return new AuthResponse(token);
}

public AuthResponse login(LoginRequest request) {

    User user = userRepository.findByEmail(request.getEmail())
            .orElseThrow(() -> new RuntimeException("User not found"));

    boolean isPasswordCorrect = passwordEncoder.matches(
            request.getPassword(),
            user.getPassword()
    );

    if (!isPasswordCorrect) {
        throw new RuntimeException("Invalid Password");
    }

    String token = jwtService.generateToken(user.getEmail());

    return new AuthResponse(token);
}
}