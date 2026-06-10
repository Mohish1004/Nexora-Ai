package com.nexora.ai.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.nexora.ai.dto.LoginRequest;
import com.nexora.ai.dto.RegisterRequest;
import com.nexora.ai.entity.User;
import com.nexora.ai.repository.UserRepository;
import com.nexora.ai.repository.WorkspaceRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

import static org.hamcrest.Matchers.is;
import static org.hamcrest.Matchers.notNullValue;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("local")
@Transactional
public class AuthControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private WorkspaceRepository workspaceRepository;

    @Autowired
    private ObjectMapper objectMapper;

    @BeforeEach
    void setUp() {
        userRepository.deleteAll();
        workspaceRepository.deleteAll();
    }

    @Test
    void testRegisterUserAndAutoCreateWorkspaces() throws Exception {
        RegisterRequest request = new RegisterRequest();
        request.setEmail("user@example.com");
        request.setPassword("securePassword");
        request.setFullName("John Doe");
        request.setWorkspaceType("BOTH");

        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success", is(true)))
                .andExpect(jsonPath("$.data.accessToken", notNullValue()))
                .andExpect(jsonPath("$.data.email", is("user@example.com")))
                .andExpect(jsonPath("$.data.fullName", is("John Doe")));

        // Verify user in db
        User user = userRepository.findByEmail("user@example.com").orElseThrow();
        assertEquals("John Doe", user.getFullName());

        // Verify workspaces created
        long workspaceCount = workspaceRepository.findByOwnerId(user.getId()).size();
        assertEquals(2, workspaceCount); // One Business, One Personal
    }

    @Test
    void testLoginUserSuccess() throws Exception {
        // Register first
        RegisterRequest register = new RegisterRequest();
        register.setEmail("login@example.com");
        register.setPassword("password123");
        register.setFullName("Bob Smith");
        register.setWorkspaceType("BUSINESS");
        
        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(register)))
                .andExpect(status().isOk());

        // Attempt login
        LoginRequest login = new LoginRequest();
        login.setEmail("login@example.com");
        login.setPassword("password123");

        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(login)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success", is(true)))
                .andExpect(jsonPath("$.data.accessToken", notNullValue()));
    }

    @Test
    void testLoginBadCredentials() throws Exception {
        LoginRequest login = new LoginRequest();
        login.setEmail("nonexistent@example.com");
        login.setPassword("wrong");

        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(login)))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.success", is(false)));
    }
}
