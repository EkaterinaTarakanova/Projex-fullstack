package com.example.projex.repository;

import com.example.projex.model.Project;
import com.example.projex.model.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ProjectRepository extends JpaRepository<Project, Long> {
    List<Project> findByManager(User manager);
    List<Project> findByParticipantsContaining(User participant);
} 