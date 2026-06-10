package com.nexora.ai.controller;

import com.nexora.ai.dto.ApiResponse;
import com.nexora.ai.dto.ProfileRequest;
import com.nexora.ai.dto.ProfileResponse;
import com.nexora.ai.service.ProfileService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;

@RestController
@RequestMapping("/api/profile")
public class ProfileController {

    private final ProfileService profileService;

    public ProfileController(ProfileService profileService) {
        this.profileService = profileService;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<ProfileResponse>> getProfile(Principal principal) {
        ProfileResponse response = profileService.getProfile(principal.getName());
        return ResponseEntity.ok(ApiResponse.success("Profile retrieved successfully", response));
    }

    @PutMapping
    public ResponseEntity<ApiResponse<ProfileResponse>> updateProfile(
            Principal principal,
            @RequestBody ProfileRequest request) {
        ProfileResponse response = profileService.updateProfile(principal.getName(), request);
        return ResponseEntity.ok(ApiResponse.success("Profile updated successfully", response));
    }

    @PutMapping("/subscription")
    public ResponseEntity<ApiResponse<ProfileResponse>> updateSubscription(
            Principal principal,
            @RequestParam String planType) {
        ProfileResponse response = profileService.updateSubscription(principal.getName(), planType);
        return ResponseEntity.ok(ApiResponse.success("Subscription updated successfully", response));
    }
}
