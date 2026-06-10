package com.nexora.ai.service;

import com.nexora.ai.dto.*;
import com.nexora.ai.entity.User;
import com.nexora.ai.entity.Workspace;
import com.nexora.ai.repository.UserRepository;
import com.nexora.ai.repository.WorkspaceRepository;
import com.nexora.ai.security.JwtTokenProvider;
import org.springframework.lang.NonNull;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final WorkspaceRepository workspaceRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider tokenProvider;

    public AuthService(
            UserRepository userRepository,
            WorkspaceRepository workspaceRepository,
            PasswordEncoder passwordEncoder,
            JwtTokenProvider tokenProvider) {
        this.userRepository = userRepository;
        this.workspaceRepository = workspaceRepository;
        this.passwordEncoder = passwordEncoder;
        this.tokenProvider = tokenProvider;
    }

    @Transactional
    public AuthResponse register(RegisterRequest request) {
        if (userRepository.findByEmail(request.getEmail()).isPresent()) {
            throw new IllegalArgumentException("Email already in use");
        }

        // Create User
        User user = User.builder()
                .email(request.getEmail())
                .passwordHash(passwordEncoder.encode(request.getPassword()))
                .fullName(request.getFullName())
                .role("USER")
                .planType("FREE")
                .build();

        User savedUser = userRepository.save(user);

        // Auto-create workspaces
        String wType = request.getWorkspaceType().toUpperCase();
        if ("BUSINESS".equals(wType) || "BOTH".equals(wType)) {
            Workspace businessWorkspace = Workspace.builder()
                    .name(request.getFullName() + "'s Business")
                    .type("BUSINESS")
                    .owner(savedUser)
                    .build();
            workspaceRepository.save(businessWorkspace);
        }
        if ("PERSONAL".equals(wType) || "BOTH".equals(wType)) {
            Workspace personalWorkspace = Workspace.builder()
                    .name(request.getFullName() + "'s Personal")
                    .type("PERSONAL")
                    .owner(savedUser)
                    .build();
            workspaceRepository.save(personalWorkspace);
        }

        String accessToken = tokenProvider.generateAccessToken(savedUser.getEmail());
        String refreshToken = tokenProvider.generateRefreshToken(savedUser.getEmail());

        return AuthResponse.builder()
                .accessToken(accessToken)
                .refreshToken(refreshToken)
                .email(savedUser.getEmail())
                .fullName(savedUser.getFullName())
                .role(savedUser.getRole())
                .planType(savedUser.getPlanType())
                .build();
    }

    public AuthResponse login(LoginRequest request) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new BadCredentialsException("Invalid email or password"));

        if (!passwordEncoder.matches(request.getPassword(), user.getPasswordHash())) {
            throw new BadCredentialsException("Invalid email or password");
        }

        String accessToken = tokenProvider.generateAccessToken(user.getEmail());
        String refreshToken = tokenProvider.generateRefreshToken(user.getEmail());

        return AuthResponse.builder()
                .accessToken(accessToken)
                .refreshToken(refreshToken)
                .email(user.getEmail())
                .fullName(user.getFullName())
                .role(user.getRole())
                .planType(user.getPlanType())
                .build();
    }

    public AuthResponse refresh(TokenRefreshRequest request) {
        String email = tokenProvider.getEmailFromToken(request.getRefreshToken());
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("User not found"));

        String newAccessToken = tokenProvider.generateAccessToken(user.getEmail());
        
        return AuthResponse.builder()
                .accessToken(newAccessToken)
                .refreshToken(request.getRefreshToken())
                .email(user.getEmail())
                .fullName(user.getFullName())
                .role(user.getRole())
                .planType(user.getPlanType())
                .build();
    }
}
