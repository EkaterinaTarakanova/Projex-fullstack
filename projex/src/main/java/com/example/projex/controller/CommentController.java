package com.example.projex.controller;

import com.example.projex.model.Comment;
import com.example.projex.service.CommentService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/comments")
@RequiredArgsConstructor
public class CommentController {
    private final CommentService commentService;

    @PostMapping
    public ResponseEntity<Comment> createComment(
            @RequestBody Comment comment,
            @RequestParam Long taskId,
            @RequestParam Long authorId) {
        return ResponseEntity.ok(commentService.createComment(comment, taskId, authorId));
    }

    @GetMapping("/task/{taskId}")
    public ResponseEntity<List<Comment>> getTaskComments(@PathVariable Long taskId) {
        return ResponseEntity.ok(commentService.getTaskComments(taskId));
    }
} 