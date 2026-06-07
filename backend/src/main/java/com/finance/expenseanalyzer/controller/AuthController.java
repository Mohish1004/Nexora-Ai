package com.finance.expenseanalyzer.controller;

import com.finance.expenseanalyzer.dto.JwtResponse;
import com.finance.expenseanalyzer.dto.LoginRequest;
import com.finance.expenseanalyzer.dto.MessageResponse;
import com.finance.expenseanalyzer.dto.RegisterRequest;
import com.finance.expenseanalyzer.model.User;
import com.finance.expenseanalyzer.repository.UserRepository;
import com.finance.expenseanalyzer.security.JwtTokenProvider;
import com.finance.expenseanalyzer.security.UserDetailsImpl;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;
import java.util.Objects;


import com.finance.expenseanalyzer.dto.UpdateProfileRequest;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthenticationManager authenticationManager;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider jwtTokenProvider;

    @PostMapping("/login")
    public ResponseEntity<?> authenticateUser(@Valid @RequestBody LoginRequest loginRequest) {

        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(loginRequest.getEmail(), loginRequest.getPassword()));

        SecurityContextHolder.getContext().setAuthentication(authentication);
        String jwt = jwtTokenProvider.generateJwtToken(authentication);

        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();

        return ResponseEntity.ok(JwtResponse.builder()
                .token(jwt)
                .id(userDetails.getId())
                .name(userDetails.getName())
                .email(userDetails.getEmail())
                .type("Bearer")
                .build());
    }

    @PostMapping("/register")
    public ResponseEntity<?> registerUser(@Valid @RequestBody RegisterRequest registerRequest) {
        if (userRepository.existsByEmail(registerRequest.getEmail())) {
            return ResponseEntity
                    .badRequest()
                    .body(new MessageResponse("Error: Email is already in use!"));
        }

        User user = User.builder()
                .name(registerRequest.getName())
                .email(registerRequest.getEmail())
                .password(passwordEncoder.encode(registerRequest.getPassword()))
                .build();

        userRepository.save(Objects.requireNonNull(user));

        return ResponseEntity.ok(new MessageResponse("User registered successfully!"));
    }

    @PutMapping("/profile")
    public ResponseEntity<?> updateProfile(@Valid @RequestBody UpdateProfileRequest updateProfileRequest) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated() || "anonymousUser".equals(authentication.getPrincipal())) {
            return ResponseEntity.status(401).body(new MessageResponse("Error: Unauthorized"));
        }

        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
        User user = userRepository.findById(userDetails.getId())
                .orElseThrow(() -> new RuntimeException("Error: User not found."));

        if (updateProfileRequest.getName() != null && !updateProfileRequest.getName().isBlank()) {
            user.setName(updateProfileRequest.getName());
        }

        if (updateProfileRequest.getPassword() != null && !updateProfileRequest.getPassword().isBlank()) {
            user.setPassword(passwordEncoder.encode(updateProfileRequest.getPassword()));
        }

        userRepository.save(user);

        return ResponseEntity.ok(new MessageResponse("Profile updated successfully!"));
    }
}
