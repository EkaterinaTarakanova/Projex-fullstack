package com.example.projex.service;

import com.example.projex.model.User;
import com.example.projex.repository.UserRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class UserService {
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Transactional
    public Map<String, Object> registerUser(User user) {
        if (userRepository.existsByUsername(user.getUsername())) {
            throw new IllegalArgumentException("Username already exists");
        }
        if (userRepository.existsByEmail(user.getEmail())) {
            throw new IllegalArgumentException("Email already exists");
        }

        user.setPassword(passwordEncoder.encode(user.getPassword()));
        User savedUser = userRepository.save(user);

        Map<String, Object> response = new HashMap<>();
        response.put("id", savedUser.getId());
        response.put("username", savedUser.getUsername());
        response.put("email", savedUser.getEmail());
        response.put("role", savedUser.getRole());
        return response;
    }

    @Transactional(readOnly = true)
    public User authenticate(String email, String password) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new EntityNotFoundException("User not found"));

        if (!passwordEncoder.matches(password, user.getPassword())) {
            throw new IllegalArgumentException("Invalid password");
        }

        return user;
    }

    @Transactional(readOnly = true)
    public Map<String, Object> getCurrentUser() {
        // В реальном приложении здесь должна быть логика получения текущего пользователя
        // из SecurityContext. Для демонстрации возвращаем заглушку
        Map<String, Object> response = new HashMap<>();
        response.put("message", "Current user endpoint");
        return response;
    }

    public boolean userExists(String email) {
        return userRepository.findByEmail(email).isPresent(); // Проверяем, существует ли пользователь
    }

    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

} 