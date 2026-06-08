package com.finance.expenseanalyzer.controller;

import com.finance.expenseanalyzer.dto.*;
import com.finance.expenseanalyzer.model.RefreshToken;
import com.finance.expenseanalyzer.model.User;
import com.finance.expenseanalyzer.repository.UserRepository;
import com.finance.expenseanalyzer.security.JwtTokenProvider;
import com.finance.expenseanalyzer.security.UserDetailsImpl;
import com.finance.expenseanalyzer.service.RefreshTokenService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestTemplate;

import java.util.*;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthenticationManager authenticationManager;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider jwtTokenProvider;
    private final RefreshTokenService refreshTokenService;
    private final UserDetailsService userDetailsService;

    @Value("${app.oauth.github.clientId:}")
    private String githubClientId;

    @Value("${app.oauth.github.clientSecret:}")
    private String githubClientSecret;

    @PostMapping("/login")
    public ResponseEntity<?> authenticateUser(@Valid @RequestBody LoginRequest loginRequest) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(loginRequest.getEmail(), loginRequest.getPassword()));

        SecurityContextHolder.getContext().setAuthentication(authentication);
        String jwt = jwtTokenProvider.generateJwtToken(authentication);

        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
        RefreshToken refreshToken = refreshTokenService.createRefreshToken(userDetails.getId());

        return ResponseEntity.ok(JwtResponse.builder()
                .token(jwt)
                .refreshToken(refreshToken.getToken())
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
                .provider("local")
                .build();

        userRepository.save(Objects.requireNonNull(user));
        return ResponseEntity.ok(new MessageResponse("User registered successfully!"));
    }

    @SuppressWarnings("unchecked")
    @PostMapping("/google")
    public ResponseEntity<?> googleLogin(@Valid @RequestBody OAuthGoogleRequest googleReq) {
        try {
            // Verify token with Google public tokeninfo endpoint
            String googleUrl = "https://oauth2.googleapis.com/tokeninfo?id_token=" + googleReq.getIdToken();
            RestTemplate restTemplate = new RestTemplate();
            ResponseEntity<Map> response = restTemplate.getForEntity(googleUrl, Map.class);
            
            if (!response.getStatusCode().is2xxSuccessful() || response.getBody() == null) {
                return ResponseEntity.badRequest().body(new MessageResponse("Error: Invalid Google token"));
            }

            Map<String, Object> body = response.getBody();
            String email = (String) body.get("email");
            String name = (String) body.get("name");
            String googleId = (String) body.get("sub");

            if (email == null) {
                return ResponseEntity.badRequest().body(new MessageResponse("Error: Google token email claim not found"));
            }

            Optional<User> userOpt = userRepository.findByEmail(email);
            User user;
            if (userOpt.isPresent()) {
                user = userOpt.get();
                // Link account if needed
                if (user.getGoogleId() == null) {
                    user.setGoogleId(googleId);
                }
                if (user.getProvider() == null) {
                    user.setProvider("google");
                }
                userRepository.save(user);
            } else {
                user = User.builder()
                        .email(email)
                        .name(name != null ? name : email.split("@")[0])
                        .googleId(googleId)
                        .provider("google")
                        .build();
                userRepository.save(user);
            }

            UserDetails userDetails = userDetailsService.loadUserByUsername(email);
            Authentication authentication = new UsernamePasswordAuthenticationToken(
                    userDetails, null, userDetails.getAuthorities());
            SecurityContextHolder.getContext().setAuthentication(authentication);

            String jwt = jwtTokenProvider.generateJwtToken(authentication);
            RefreshToken refreshToken = refreshTokenService.createRefreshToken(user.getId());

            return ResponseEntity.ok(JwtResponse.builder()
                    .token(jwt)
                    .refreshToken(refreshToken.getToken())
                    .id(user.getId())
                    .name(user.getName())
                    .email(user.getEmail())
                    .type("Bearer")
                    .build());

        } catch (Exception ex) {
            return ResponseEntity.status(500).body(new MessageResponse("Google auth failure: " + ex.getMessage()));
        }
    }

    @SuppressWarnings("unchecked")
    @PostMapping("/github")
    public ResponseEntity<?> githubLogin(@Valid @RequestBody OAuthGithubRequest githubReq) {
        try {
            RestTemplate restTemplate = new RestTemplate();
            
            // Exchange code for access token
            String tokenUrl = "https://github.com/login/oauth/access_token";
            Map<String, String> tokenPayload = new HashMap<>();
            tokenPayload.put("client_id", githubClientId);
            tokenPayload.put("client_secret", githubClientSecret);
            tokenPayload.put("code", githubReq.getCode());

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.setAccept(Collections.singletonList(MediaType.APPLICATION_JSON));
            HttpEntity<Map<String, String>> tokenRequest = new HttpEntity<>(tokenPayload, headers);

            ResponseEntity<Map> tokenResponse = restTemplate.postForEntity(tokenUrl, tokenRequest, Map.class);
            if (!tokenResponse.getStatusCode().is2xxSuccessful() || tokenResponse.getBody() == null) {
                return ResponseEntity.badRequest().body(new MessageResponse("Error: GitHub token exchange failed"));
            }
            
            String accessToken = (String) tokenResponse.getBody().get("access_token");
            if (accessToken == null) {
                return ResponseEntity.badRequest().body(new MessageResponse("Error: No access token returned from GitHub"));
            }

            // Fetch GitHub profile
            HttpHeaders userHeaders = new HttpHeaders();
            userHeaders.setBearerAuth(accessToken);
            HttpEntity<Void> userRequest = new HttpEntity<>(userHeaders);
            ResponseEntity<Map> userResponse = restTemplate.exchange("https://api.github.com/user", HttpMethod.GET, userRequest, Map.class);

            if (!userResponse.getStatusCode().is2xxSuccessful() || userResponse.getBody() == null) {
                return ResponseEntity.badRequest().body(new MessageResponse("Error: GitHub profile fetch failed"));
            }

            Map<String, Object> userBody = userResponse.getBody();
            String githubId = String.valueOf(userBody.get("id"));
            String username = (String) userBody.get("login");
            String name = (String) userBody.get("name");
            if (name == null) name = username;
            
            String email = (String) userBody.get("email");
            if (email == null) {
                email = username + "@github.com"; // fallback email structure
            }

            Optional<User> userOpt = userRepository.findByEmail(email);
            User user;
            if (userOpt.isPresent()) {
                user = userOpt.get();
                if (user.getGithubId() == null) {
                    user.setGithubId(githubId);
                }
                if (user.getProvider() == null) {
                    user.setProvider("github");
                }
                userRepository.save(user);
            } else {
                user = User.builder()
                        .email(email)
                        .name(name)
                        .githubId(githubId)
                        .provider("github")
                        .build();
                userRepository.save(user);
            }

            UserDetails userDetails = userDetailsService.loadUserByUsername(email);
            Authentication authentication = new UsernamePasswordAuthenticationToken(
                    userDetails, null, userDetails.getAuthorities());
            SecurityContextHolder.getContext().setAuthentication(authentication);

            String jwt = jwtTokenProvider.generateJwtToken(authentication);
            RefreshToken refreshToken = refreshTokenService.createRefreshToken(user.getId());

            return ResponseEntity.ok(JwtResponse.builder()
                    .token(jwt)
                    .refreshToken(refreshToken.getToken())
                    .id(user.getId())
                    .name(user.getName())
                    .email(user.getEmail())
                    .type("Bearer")
                    .build());

        } catch (Exception ex) {
            return ResponseEntity.status(500).body(new MessageResponse("GitHub auth failure: " + ex.getMessage()));
        }
    }

    @PostMapping("/refreshtoken")
    public ResponseEntity<?> refreshToken(@Valid @RequestBody TokenRefreshRequest request) {
        String requestRefreshToken = request.getRefreshToken();

        return refreshTokenService.findByToken(requestRefreshToken)
                .map(refreshTokenService::verifyExpiration)
                .map(refToken -> {
                    User user = refToken.getUser();
                    UserDetails userDetails = userDetailsService.loadUserByUsername(user.getEmail());
                    Authentication authentication = new UsernamePasswordAuthenticationToken(
                            userDetails, null, userDetails.getAuthorities());
                    SecurityContextHolder.getContext().setAuthentication(authentication);
                    
                    String token = jwtTokenProvider.generateJwtToken(authentication);
                    return ResponseEntity.ok(TokenRefreshResponse.builder()
                            .accessToken(token)
                            .refreshToken(refToken.getToken())
                            .build());
                })
                .orElseThrow(() -> new RuntimeException("Refresh token is not in database!"));
    }

    @PostMapping("/logout")
    public ResponseEntity<?> logoutUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication != null && authentication.isAuthenticated() && !"anonymousUser".equals(authentication.getPrincipal())) {
            UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
            refreshTokenService.deleteByUserId(userDetails.getId());
        }
        SecurityContextHolder.clearContext();
        return ResponseEntity.ok(new MessageResponse("Log out successful!"));
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
