package com.example.projex.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = "users")
@Data
@NoArgsConstructor
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String username;

    @Column(nullable = false)
    private String password;

    @Column(nullable = false)
    private String email;

    @Enumerated(EnumType.STRING)
    private UserRole role;

    @ManyToMany(mappedBy = "participants")
    private Set<Project> participatingProjects = new HashSet<>();

    @OneToMany(mappedBy = "manager")
    private Set<Project> managedProjects = new HashSet<>();

    @OneToMany(mappedBy = "assignee")
    private Set<Task> tasks = new HashSet<>();

    public enum UserRole {
        PROJECT_MANAGER,
        PROJECT_MEMBER
    }
} 