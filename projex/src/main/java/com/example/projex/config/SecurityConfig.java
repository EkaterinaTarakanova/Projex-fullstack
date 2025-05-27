package com.example.projex.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpStatus;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.HttpStatusEntryPoint;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            .csrf(csrf -> csrf.disable())  // Отключаем CSRF для простоты
            .authorizeHttpRequests(auth -> auth
                .requestMatchers("/").permitAll()  // Разрешаем доступ к корневому пути
                .requestMatchers("/api/logs").permitAll()  // Разрешаем доступ к логам
                .requestMatchers("/api/auth/**").permitAll()  // Разрешаем доступ к авторизации
                .requestMatchers("/css/**", "/js/**", "/html/**", "/images/**", "/*.html", "/*.js", "/*.css").permitAll()  // Разрешаем доступ к статическим ресурсам
                .requestMatchers("/static/**").permitAll()  // Разрешаем доступ к статическим ресурсам
                .anyRequest().permitAll()  // Временно разрешаем все запросы
            )
            .headers(headers -> headers
                .frameOptions(frameOptions -> frameOptions.disable())  // Отключаем X-Frame-Options
            );
        
        return http.build();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration config) throws Exception {
        return config.getAuthenticationManager();
    }
}