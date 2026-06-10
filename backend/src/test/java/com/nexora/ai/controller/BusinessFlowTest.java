package com.nexora.ai.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.nexora.ai.dto.*;
import com.nexora.ai.entity.Workspace;
import com.nexora.ai.repository.*;
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

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

import static org.hamcrest.Matchers.hasSize;
import static org.hamcrest.Matchers.is;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("local")
@Transactional
public class BusinessFlowTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private WorkspaceRepository workspaceRepository;

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private ReceivablesPayablesRepository receivablesPayablesRepository;

    @Autowired
    private TransactionRepository transactionRepository;

    @Autowired
    private ObjectMapper objectMapper;

    @BeforeEach
    void setUp() {
        productRepository.deleteAll();
        receivablesPayablesRepository.deleteAll();
        transactionRepository.deleteAll();
        workspaceRepository.deleteAll();
        userRepository.deleteAll();
    }

    @Test
    @WithMockUser(username = "biz@example.com", roles = "USER")
    void testEndToEndBusinessWorkspaceFlow() throws Exception {
        // 1. Manually setup user and workspace since we are using MockUser
        RegisterRequest register = new RegisterRequest();
        register.setEmail("biz@example.com");
        register.setPassword("pass123");
        register.setFullName("Nexora Founder");
        register.setWorkspaceType("BUSINESS");

        // Register to trigger automatic workspace setup
        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(register)))
                .andExpect(status().isOk());

        // Get created workspace
        List<Workspace> workspaces = workspaceRepository.findByOwnerId(
                userRepository.findByEmail("biz@example.com").orElseThrow().getId()
        );
        assertEquals(1, workspaces.size());
        Workspace workspace = workspaces.get(0);
        Long workspaceId = workspace.getId();

        // 2. Add product to inventory
        ProductRequest productReq = new ProductRequest();
        productReq.setName("Enterprise AI Chip");
        productReq.setSku("NEX-AI-900");
        productReq.setCategory("Hardware");
        productReq.setQuantity(50);
        productReq.setThreshold(10);
        productReq.setPurchasePrice(new BigDecimal("15000.00"));
        productReq.setSellingPrice(new BigDecimal("25000.00"));

        mockMvc.perform(post("/api/workspaces/" + workspaceId + "/products")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(productReq)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success", is(true)))
                .andExpect(jsonPath("$.data.name", is("Enterprise AI Chip")))
                .andExpect(jsonPath("$.data.totalValue", is(750000.00)))
                .andExpect(jsonPath("$.data.lowStock", is(false)));

        // 3. Create a Receivable payment record
        ReceivablesPayablesRequest rpReq = new ReceivablesPayablesRequest();
        rpReq.setType("RECEIVABLE");
        rpReq.setPartyName("AlphaTech Corp");
        rpReq.setAmount(new BigDecimal("85000.00"));
        rpReq.setDueDate(LocalDate.now().plusDays(10));
        rpReq.setStatus("PENDING");

        mockMvc.perform(post("/api/workspaces/" + workspaceId + "/receivables-payables")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(rpReq)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success", is(true)))
                .andExpect(jsonPath("$.data.amount", is(85000.00)))
                .andExpect(jsonPath("$.data.status", is("PENDING")));

        // 4. Create an Income Transaction
        TransactionRequest txReq = new TransactionRequest();
        txReq.setType("INCOME");
        txReq.setAmount(new BigDecimal("120000.00"));
        txReq.setCategory("Consulting");
        txReq.setDate(LocalDate.now());
        txReq.setDescription("AI OS Deployment Service");

        mockMvc.perform(post("/api/workspaces/" + workspaceId + "/transactions")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(txReq)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success", is(true)))
                .andExpect(jsonPath("$.data.amount", is(120000.00)));

        // 5. Query Dashboard and assert valuation & profit metrics
        mockMvc.perform(get("/api/workspaces/" + workspaceId + "/dashboard/business"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success", is(true)))
                .andExpect(jsonPath("$.data.inventoryValue", is(750000.00)))
                .andExpect(jsonPath("$.data.totalReceivables", is(85000.00)))
                .andExpect(jsonPath("$.data.netProfit", is(120000.00)))
                .andExpect(jsonPath("$.data.recentTransactions", hasSize(1)));
    }
}
