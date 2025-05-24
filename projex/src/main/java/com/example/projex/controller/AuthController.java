package com.example.projex.controller;

import com.example.projex.model.User;
import com.example.projex.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final UserService userService;

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody User user) {
        return ResponseEntity.ok(userService.registerUser(user));
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Map<String, String> credentials) {
        String username = credentials.get("username");
        String password = credentials.get("password");
        return ResponseEntity.ok(userService.loginUser(username, password));
    }

    @GetMapping("/user")
    public ResponseEntity<?> getCurrentUser() {
        return ResponseEntity.ok(userService.getCurrentUser());
    }
} 