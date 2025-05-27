package com.example.projex.controller;

import org.springframework.web.bind.annotation.*;
import java.io.*;
import java.nio.file.*;
import java.nio.charset.StandardCharsets;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

@RestController
@RequestMapping("/api/logs")
public class LogController {
    private static final DateTimeFormatter formatter = DateTimeFormatter.ofPattern("dd.MM.yyyy HH:mm:ss");
    private final Path logDirectory;
    private final Path logFile;

    public LogController() {
        // Получаем текущую директорию приложения
        String userDir = System.getProperty("user.dir");
        this.logDirectory = Paths.get(userDir, "logs");
        this.logFile = this.logDirectory.resolve("user_actions.log");
        
        // Создаем директорию при инициализации
        try {
            Files.createDirectories(this.logDirectory);
            System.out.println("Директория для логов создана: " + this.logDirectory.toAbsolutePath());
        } catch (IOException e) {
            System.err.println("Ошибка при создании директории для логов: " + e.getMessage());
            e.printStackTrace();
        }
    }

    @PostMapping
    public void logAction(@RequestBody LogRequest request) {
        try {
            String logEntry = String.format("[%s] Пользователь: %s, Действие: %s, Подробности: %s%n",
                LocalDateTime.now().format(formatter),
                request.getUsername(),
                request.getAction(),
                request.getDetails()
            );

            Files.write(this.logFile, 
                logEntry.getBytes(StandardCharsets.UTF_8), 
                StandardOpenOption.CREATE, 
                StandardOpenOption.APPEND
            );
            
            System.out.println("Лог успешно записан в файл: " + this.logFile.toAbsolutePath());
        } catch (IOException e) {
            System.err.println("Ошибка при записи лога: " + e.getMessage());
            e.printStackTrace();
        }
    }
}

class LogRequest {
    private String username;
    private String action;
    private String details;

    // Getters and Setters
    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }
    public String getAction() { return action; }
    public void setAction(String action) { this.action = action; }
    public String getDetails() { return details; }
    public void setDetails(String details) { this.details = details; }
} 