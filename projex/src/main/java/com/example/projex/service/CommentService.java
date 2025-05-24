package com.example.projex.service;

import com.example.projex.model.Comment;
import com.example.projex.model.Task;
import com.example.projex.model.User;
import com.example.projex.repository.CommentRepository;
import com.example.projex.repository.TaskRepository;
import com.example.projex.repository.UserRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class CommentService {
    private final CommentRepository commentRepository;
    private final TaskRepository taskRepository;
    private final UserRepository userRepository;

    @Transactional
    public Comment createComment(Comment comment, Long taskId, Long authorId) {
        Task task = taskRepository.findById(taskId)
                .orElseThrow(() -> new EntityNotFoundException("Task not found"));
        User author = userRepository.findById(authorId)
                .orElseThrow(() -> new EntityNotFoundException("Author not found"));

        // Check if the author is either the project manager or a participant
        if (!task.getProject().getManager().equals(author) && 
            !task.getProject().getParticipants().contains(author)) {
            throw new IllegalArgumentException("Only project participants can comment on tasks");
        }

        comment.setTask(task);
        comment.setAuthor(author);
        return commentRepository.save(comment);
    }

    @Transactional(readOnly = true)
    public List<Comment> getTaskComments(Long taskId) {
        Task task = taskRepository.findById(taskId)
                .orElseThrow(() -> new EntityNotFoundException("Task not found"));
        return commentRepository.findByTask(task);
    }
} 