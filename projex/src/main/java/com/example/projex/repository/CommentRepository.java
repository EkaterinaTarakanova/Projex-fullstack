package com.example.projex.repository;

import com.example.projex.model.Comment;
import com.example.projex.model.Task;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface CommentRepository extends JpaRepository<Comment, Long> {
    List<Comment> findByTask(Task task);
} 