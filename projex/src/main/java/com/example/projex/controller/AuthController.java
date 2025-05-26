package com.example.projex.controller;

import com.example.projex.model.User;
import com.example.projex.service.UserService;
import jakarta.persistence.EntityNotFoundException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpSession;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final UserService userService;

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody User user) {
        if (userService.userExists(user.getEmail())) {
            return ResponseEntity.badRequest().body("Пользователь с таким email уже существует");
        }
        return ResponseEntity.ok(userService.registerUser (user));
    }


    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Map<String, String> credentials, HttpServletRequest request) {
        System.out.println("Login attempt. Email: " + credentials.get("email") + " Password: " + credentials.get("password"));
        try {
            User user = userService.authenticate(
                    credentials.get("email"),
                    credentials.get("password")
            );

            // Создаем сессию
            HttpSession session = request.getSession();
            session.setAttribute("user", user);

            return ResponseEntity.ok(user);

        } catch (Exception e) {
            return ResponseEntity.status(401).body(
                    Map.of("error", "Неверный email или пароль")
            );
        }
    }


    @GetMapping("/user")
    public ResponseEntity<?> getCurrentUser() {
        return ResponseEntity.ok(userService.getCurrentUser());
    }

    @GetMapping("/users")
    public ResponseEntity<List<User>> getAllUsers() {
        List<User> users = userService.getAllUsers();
        return ResponseEntity.ok(users);
    }
} 