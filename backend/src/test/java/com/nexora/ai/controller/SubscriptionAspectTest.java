package com.nexora.ai.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.nexora.ai.dto.RegisterRequest;
import com.nexora.ai.entity.User;
import com.nexora.ai.entity.Workspace;
import com.nexora.ai.repository.UserRepository;
import com.nexora.ai.repository.WorkspaceRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

import static org.hamcrest.Matchers.is;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("local")
@Transactional
public class SubscriptionAspectTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private WorkspaceRepository workspaceRepository;

    @Autowired
    private ObjectMapper objectMapper;

    private Long workspaceId;

    @BeforeEach
    void setUp() throws Exception {
        userRepository.deleteAll();
        workspaceRepository.deleteAll();

        // Register a user
        RegisterRequest register = new RegisterRequest();
        register.setEmail("premium@example.com");
        register.setPassword("pass123");
        register.setFullName("Premium Owner");
        register.setWorkspaceType("BUSINESS");

        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(register)))
                .andExpect(status().isOk());

        User user = userRepository.findByEmail("premium@example.com").orElseThrow();
        List<Workspace> workspaces = workspaceRepository.findByOwnerId(user.getId());
        workspaceId = workspaces.get(0).getId();
    }

    private static org.springframework.test.web.servlet.request.MockHttpServletRequestBuilder post(String url) {
        return org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post(url);
    }

    @Test
    @WithMockUser(username = "premium@example.com", roles = "USER")
    void testFreeUserBlockedAndBusinessUserAllowed() throws Exception {
        // 1. Initial plan is FREE. Accessing /valuation should be BLOCKED (403)
        mockMvc.perform(get("/api/workspaces/" + workspaceId + "/products/valuation"))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.success", is(false)))
                .andExpect(jsonPath("$.message", is("This feature requires a BUSINESS subscription plan.")));

        // 2. Upgrade user plan to BUSINESS via profile update endpoint
        mockMvc.perform(put("/api/profile/subscription")
                        .param("planType", "BUSINESS"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success", is(true)))
                .andExpect(jsonPath("$.data.planType", is("BUSINESS")));

        // Verify user plan in db
        User user = userRepository.findByEmail("premium@example.com").orElseThrow();
        assertEquals("BUSINESS", user.getPlanType());

        // 3. Now plan is BUSINESS. Accessing /valuation should be ALLOWED (200)
        mockMvc.perform(get("/api/workspaces/" + workspaceId + "/products/valuation"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success", is(true)))
                .andExpect(jsonPath("$.data", is(0))); // Empty inventory valuation is 0
    }
}
