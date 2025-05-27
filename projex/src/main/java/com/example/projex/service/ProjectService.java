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

    @Transactional(readOnly = true)
    public List<Project> getAllProjects() {
        return projectRepository.findAll();
    }

    @Transactional
    public Project createProject(Project project) {
        if (project.getManager() == null) {
            throw new IllegalArgumentException("Project must have a manager");
        }
        
        User manager = userRepository.findById(project.getManager().getId())
                .orElseThrow(() -> new EntityNotFoundException("Manager not found"));
        
        if (manager.getRole() != User.UserRole.PROJECT_MANAGER) {
            throw new IllegalArgumentException("Only project managers can create projects");
        }

        if (project.getStartDate() == null || project.getEndDate() == null) {
            throw new IllegalArgumentException("Project must have start and end dates");
        }

        if (project.getEndDate().isBefore(project.getStartDate())) {
            throw new IllegalArgumentException("End date cannot be before start date");
        }

        project.setManager(manager);
        if (project.getStatus() == null) {
            project.setStatus(Project.ProjectStatus.PLANNING);
        }
        
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

    @Transactional
    public Project updateProject(Long projectId, Project updatedProject) {
        Project existingProject = projectRepository.findById(projectId)
                .orElseThrow(() -> new EntityNotFoundException("Project not found"));

        if (updatedProject.getName() != null) {
            existingProject.setName(updatedProject.getName());
        }
        
        if (updatedProject.getStatus() != null) {
            existingProject.setStatus(updatedProject.getStatus());
        }
        
        if (updatedProject.getStartDate() != null) {
            existingProject.setStartDate(updatedProject.getStartDate());
        }
        
        if (updatedProject.getEndDate() != null) {
            if (updatedProject.getStartDate() != null && 
                updatedProject.getEndDate().isBefore(updatedProject.getStartDate())) {
                throw new IllegalArgumentException("End date cannot be before start date");
            }
            existingProject.setEndDate(updatedProject.getEndDate());
        }
        
        return projectRepository.save(existingProject);
    }

    @Transactional
    public void deleteProject(Long projectId) {
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new EntityNotFoundException("Project not found"));
        projectRepository.delete(project);
    }
}