package com.finance.expenseanalyzer.service;

import com.finance.expenseanalyzer.dto.VendorExpenseDto;
import com.finance.expenseanalyzer.model.VendorExpense;
import com.finance.expenseanalyzer.model.User;
import com.finance.expenseanalyzer.repository.VendorExpenseRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class VendorExpenseService {

    private final VendorExpenseRepository expenseRepository;

    public List<VendorExpenseDto> getAll(User user) {
        return expenseRepository.findByUserIdOrderByDateDesc(user.getId())
                .stream().map(this::toDto).collect(Collectors.toList());
    }

    public VendorExpenseDto create(User user, VendorExpenseDto dto) {
        VendorExpense ex = VendorExpense.builder()
                .user(user)
                .vendor(dto.getVendor())
                .description(dto.getDescription())
                .amount(dto.getAmount())
                .date(dto.getDate())
                .category(dto.getCategory() == null || dto.getCategory().isEmpty() ? "SaaS & Software" : dto.getCategory())
                .build();
        return toDto(expenseRepository.save(ex));
    }

    public VendorExpenseDto update(Long id, VendorExpenseDto dto) {
        VendorExpense ex = expenseRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Expense record not found"));
        ex.setVendor(dto.getVendor());
        ex.setDescription(dto.getDescription());
        ex.setAmount(dto.getAmount());
        ex.setDate(dto.getDate());
        if (dto.getCategory() != null && !dto.getCategory().isEmpty()) {
            ex.setCategory(dto.getCategory());
        }
        return toDto(expenseRepository.save(ex));
    }

    public void delete(Long id) {
        expenseRepository.deleteById(id);
    }

    private VendorExpenseDto toDto(VendorExpense ex) {
        return VendorExpenseDto.builder()
                .id(ex.getId())
                .vendor(ex.getVendor())
                .description(ex.getDescription())
                .amount(ex.getAmount())
                .date(ex.getDate())
                .category(ex.getCategory())
                .build();
    }
}
