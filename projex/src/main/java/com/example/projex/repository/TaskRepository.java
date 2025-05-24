package com.example.projex.repository;

import com.example.projex.model.Project;
import com.example.projex.model.Task;
import com.example.projex.model.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface TaskRepository extends JpaRepository<Task, Long> {
    List<Task> findByProject(Project project);
    List<Task> findByProjectAndAssignee(Project project, User assignee);
    List<Task> findByAssignee(User assignee);
} 