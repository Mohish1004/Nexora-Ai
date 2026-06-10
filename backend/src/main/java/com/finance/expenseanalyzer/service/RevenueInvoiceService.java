package com.finance.expenseanalyzer.service;

import com.finance.expenseanalyzer.dto.RevenueInvoiceDto;
import com.finance.expenseanalyzer.model.RevenueInvoice;
import com.finance.expenseanalyzer.model.User;
import com.finance.expenseanalyzer.repository.RevenueInvoiceRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class RevenueInvoiceService {

    private final RevenueInvoiceRepository invoiceRepository;

    public List<RevenueInvoiceDto> getAll(User user) {
        return invoiceRepository.findByUserIdOrderByDateDesc(user.getId())
                .stream().map(this::toDto).collect(Collectors.toList());
    }

    public RevenueInvoiceDto create(User user, RevenueInvoiceDto dto) {
        RevenueInvoice invoice = RevenueInvoice.builder()
                .user(user)
                .clientName(dto.getClientName())
                .amount(dto.getAmount())
                .date(dto.getDate())
                .status(dto.getStatus() == null || dto.getStatus().isEmpty() ? "PENDING" : dto.getStatus())
                .build();
        return toDto(invoiceRepository.save(invoice));
    }

    public void delete(Long id) {
        invoiceRepository.deleteById(id);
    }

    private RevenueInvoiceDto toDto(RevenueInvoice invoice) {
        return RevenueInvoiceDto.builder()
                .id(invoice.getId())
                .clientName(invoice.getClientName())
                .amount(invoice.getAmount())
                .date(invoice.getDate())
                .status(invoice.getStatus())
                .build();
    }
}
