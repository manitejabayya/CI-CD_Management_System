package com.maniteja.cicdplatform.controller;

import com.maniteja.cicdplatform.dto.LoginRequest;
import com.maniteja.cicdplatform.dto.RegisterRequest;
import com.maniteja.cicdplatform.service.AuthService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import com.maniteja.cicdplatform.dto.AuthResponse;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

   @PostMapping("/register")
public AuthResponse register(@RequestBody RegisterRequest request) {
    return authService.register(request);
}

@PostMapping("/login")
public AuthResponse login(@RequestBody LoginRequest request) {
    return authService.login(request);
}
}