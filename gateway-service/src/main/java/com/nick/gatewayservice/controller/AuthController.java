package com.nick.gatewayservice.controller;

import com.nick.gatewayservice.config.DemoUserProperties;
import com.nick.gatewayservice.dto.LoginRequest;
import com.nick.gatewayservice.dto.LoginResponse;
import com.nick.gatewayservice.security.JwtUtil;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final JwtUtil jwtUtil;
    private final DemoUserProperties demoUser;

    public AuthController(JwtUtil jwtUtil, DemoUserProperties demoUser) {
        this.jwtUtil = jwtUtil;
        this.demoUser = demoUser;
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest request) {
        boolean valid = demoUser.username().equals(request.username())
                && demoUser.password().equals(request.password());

        if (!valid) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Invalid username or password");
        }

        String token = jwtUtil.generateToken(request.username());
        return ResponseEntity.ok(new LoginResponse(token, request.username()));
    }
}
