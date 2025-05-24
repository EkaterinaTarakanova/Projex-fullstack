package com.example.projex.controller;

import com.example.projex.model.Project;
import com.example.projex.service.ProjectService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/projects")
@RequiredArgsConstructor
public class ProjectController {
    private final ProjectService projectService;

    @PostMapping
    public ResponseEntity<Project> createProject(@RequestBody Project project, @RequestParam Long managerId) {
        return ResponseEntity.ok(projectService.createProject(project, managerId));
    }

    @PostMapping("/{projectId}/participants/{userId}")
    public ResponseEntity<Project> addParticipant(@PathVariable Long projectId, @PathVariable Long userId) {
        return ResponseEntity.ok(projectService.addParticipant(projectId, userId));
    }

    @GetMapping("/manager/{managerId}")
    public ResponseEntity<List<Project>> getProjectsByManager(@PathVariable Long managerId) {
        return ResponseEntity.ok(projectService.getProjectsByManager(managerId));
    }

    @GetMapping("/participant/{participantId}")
    public ResponseEntity<List<Project>> getProjectsByParticipant(@PathVariable Long participantId) {
        return ResponseEntity.ok(projectService.getProjectsByParticipant(participantId));
    }

    @GetMapping("/{projectId}")
    public ResponseEntity<Project> getProject(@PathVariable Long projectId) {
        return ResponseEntity.ok(projectService.getProject(projectId));
    }
} 