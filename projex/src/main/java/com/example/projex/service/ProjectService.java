package com.example.projex.service;

import com.example.projex.model.Project;
import com.example.projex.model.User;
import com.example.projex.repository.ProjectRepository;
import com.example.projex.repository.UserRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ProjectService {
    private final ProjectRepository projectRepository;
    private final UserRepository userRepository;

    @Transactional
    public Project createProject(Project project, Long managerId) {
        User manager = userRepository.findById(managerId)
                .orElseThrow(() -> new EntityNotFoundException("Manager not found"));
        
        if (manager.getRole() != User.UserRole.PROJECT_MANAGER) {
            throw new IllegalArgumentException("Only project managers can create projects");
        }

        project.setManager(manager);
        return projectRepository.save(project);
    }

    @Transactional
    public Project addParticipant(Long projectId, Long userId) {
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new EntityNotFoundException("Project not found"));
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new EntityNotFoundException("User not found"));

        project.getParticipants().add(user);
        return projectRepository.save(project);
    }

    @Transactional(readOnly = true)
    public List<Project> getProjectsByManager(Long managerId) {
        User manager = userRepository.findById(managerId)
                .orElseThrow(() -> new EntityNotFoundException("Manager not found"));
        return projectRepository.findByManager(manager);
    }

    @Transactional(readOnly = true)
    public List<Project> getProjectsByParticipant(Long participantId) {
        User participant = userRepository.findById(participantId)
                .orElseThrow(() -> new EntityNotFoundException("User not found"));
        return projectRepository.findByParticipantsContaining(participant);
    }

    @Transactional(readOnly = true)
    public Project getProject(Long projectId) {
        return projectRepository.findById(projectId)
                .orElseThrow(() -> new EntityNotFoundException("Project not found"));
    }
} 