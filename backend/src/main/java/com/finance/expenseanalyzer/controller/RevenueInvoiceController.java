package com.finance.expenseanalyzer.controller;

import com.finance.expenseanalyzer.dto.RevenueInvoiceDto;
import com.finance.expenseanalyzer.model.User;
import com.finance.expenseanalyzer.repository.UserRepository;
import com.finance.expenseanalyzer.service.RevenueInvoiceService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/invoices")
@RequiredArgsConstructor
public class RevenueInvoiceController {

    private final RevenueInvoiceService invoiceService;
    private final UserRepository userRepository;

    private User getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String email = authentication.getName();
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Authenticated user not found"));
    }

    @GetMapping
    public ResponseEntity<List<RevenueInvoiceDto>> getAll() {
        return ResponseEntity.ok(invoiceService.getAll(getCurrentUser()));
    }

    @PostMapping
    public ResponseEntity<RevenueInvoiceDto> create(@RequestBody RevenueInvoiceDto dto) {
        return ResponseEntity.ok(invoiceService.create(getCurrentUser(), dto));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, String>> delete(@PathVariable Long id) {
        invoiceService.delete(id);
        return ResponseEntity.ok(Map.of("message", "Invoice deleted successfully"));
    }
}
