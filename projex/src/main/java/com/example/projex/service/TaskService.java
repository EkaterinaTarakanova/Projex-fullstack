package com.example.projex.service;

import com.example.projex.model.Project;
import com.example.projex.model.Task;
import com.example.projex.model.User;
import com.example.projex.repository.ProjectRepository;
import com.example.projex.repository.TaskRepository;
import com.example.projex.repository.UserRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class TaskService {
    private final TaskRepository taskRepository;
    private final ProjectRepository projectRepository;
    private final UserRepository userRepository;

    @Transactional
    public Task createTask(Task task, Long projectId, Long assigneeId, Long creatorId) {
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new EntityNotFoundException("Project not found"));
        User assignee = userRepository.findById(assigneeId)
                .orElseThrow(() -> new EntityNotFoundException("Assignee not found"));
        User creator = userRepository.findById(creatorId)
                .orElseThrow(() -> new EntityNotFoundException("Creator not found"));

        if (creator.getRole() != User.UserRole.PROJECT_MANAGER || !project.getManager().equals(creator)) {
            throw new IllegalArgumentException("Only the project manager can create tasks");
        }

        if (!project.getParticipants().contains(assignee)) {
            throw new IllegalArgumentException("Assignee must be a project participant");
        }

        task.setProject(project);
        task.setAssignee(assignee);
        return taskRepository.save(task);
    }

    @Transactional
    public Task markTaskAsCompleted(Long taskId, Long userId) {
        Task task = taskRepository.findById(taskId)
                .orElseThrow(() -> new EntityNotFoundException("Task not found"));
        
        if (!task.getAssignee().getId().equals(userId)) {
            throw new IllegalArgumentException("Only the assignee can mark the task as completed");
        }

        task.setCompleted(true);
        return taskRepository.save(task);
    }

    @Transactional(readOnly = true)
    public List<Task> getProjectTasks(Long projectId) {
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new EntityNotFoundException("Project not found"));
        return taskRepository.findByProject(project);
    }

    @Transactional(readOnly = true)
    public List<Task> getUserTasks(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new EntityNotFoundException("User not found"));
        return taskRepository.findByAssignee(user);
    }

    @Transactional(readOnly = true)
    public List<Task> getUserProjectTasks(Long projectId, Long userId) {
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new EntityNotFoundException("Project not found"));
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new EntityNotFoundException("User not found"));
        return taskRepository.findByProjectAndAssignee(project, user);
    }
} 