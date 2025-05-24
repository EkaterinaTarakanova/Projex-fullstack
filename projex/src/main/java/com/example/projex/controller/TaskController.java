package com.example.projex.controller;

import com.example.projex.model.Task;
import com.example.projex.service.TaskService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/tasks")
@RequiredArgsConstructor
public class TaskController {
    private final TaskService taskService;

    @PostMapping
    public ResponseEntity<Task> createTask(
            @RequestBody Task task,
            @RequestParam Long projectId,
            @RequestParam Long assigneeId,
            @RequestParam Long creatorId) {
        return ResponseEntity.ok(taskService.createTask(task, projectId, assigneeId, creatorId));
    }

    @PutMapping("/{taskId}/complete")
    public ResponseEntity<Task> markTaskAsCompleted(
            @PathVariable Long taskId,
            @RequestParam Long userId) {
        return ResponseEntity.ok(taskService.markTaskAsCompleted(taskId, userId));
    }

    @GetMapping("/project/{projectId}")
    public ResponseEntity<List<Task>> getProjectTasks(@PathVariable Long projectId) {
        return ResponseEntity.ok(taskService.getProjectTasks(projectId));
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<Task>> getUserTasks(@PathVariable Long userId) {
        return ResponseEntity.ok(taskService.getUserTasks(userId));
    }

    @GetMapping("/project/{projectId}/user/{userId}")
    public ResponseEntity<List<Task>> getUserProjectTasks(
            @PathVariable Long projectId,
            @PathVariable Long userId) {
        return ResponseEntity.ok(taskService.getUserProjectTasks(projectId, userId));
    }
} 