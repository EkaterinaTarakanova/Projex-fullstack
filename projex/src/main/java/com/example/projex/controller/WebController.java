package com.example.projex.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
public class WebController {
    
    @GetMapping("/")
    public String index() {
        return "redirect:/html/auth-page.html";
    }

    @GetMapping("/login")
    public String login() {
        return "redirect:/html/auth-page.html";
    }

    @GetMapping("/profile")
    public String profile() {
        return "redirect:/html/profile.html";
    }

    @GetMapping("/project")
    public String project() {
        return "redirect:/html/project-page.html";
    }

    @GetMapping("/tasks")
    public String tasks() {
        return "redirect:/html/project-tasks.html";
    }
} 