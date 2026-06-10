package com.nexora.ai.service;

import com.nexora.ai.dto.CustomerRequest;
import com.nexora.ai.dto.VendorRequest;
import com.nexora.ai.entity.Customer;
import com.nexora.ai.entity.Vendor;
import com.nexora.ai.entity.Workspace;
import com.nexora.ai.repository.CustomerRepository;
import com.nexora.ai.repository.VendorRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class LedgerService {

    private final CustomerRepository customerRepository;
    private final VendorRepository vendorRepository;
    private final WorkspaceService workspaceService;

    public LedgerService(
            CustomerRepository customerRepository,
            VendorRepository vendorRepository,
            WorkspaceService workspaceService) {
        this.customerRepository = customerRepository;
        this.vendorRepository = vendorRepository;
        this.workspaceService = workspaceService;
    }

    private Workspace verifyAndGetWorkspace(String email, Long workspaceId) {
        return workspaceService.getWorkspaceForUser(email, workspaceId);
    }

    // --- Customer APIs ---

    public List<Customer> getCustomers(String email, Long workspaceId) {
        verifyAndGetWorkspace(email, workspaceId);
        return customerRepository.findByWorkspaceId(workspaceId);
    }

    public Customer getCustomer(String email, Long workspaceId, Long customerId) {
        verifyAndGetWorkspace(email, workspaceId);
        return customerRepository.findByIdAndWorkspaceId(customerId, workspaceId)
                .orElseThrow(() -> new IllegalArgumentException("Customer not found in this workspace"));
    }

    @Transactional
    public Customer createCustomer(String email, Long workspaceId, CustomerRequest request) {
        Workspace workspace = verifyAndGetWorkspace(email, workspaceId);
        
        Customer customer = Customer.builder()
                .workspace(workspace)
                .name(request.getName())
                .email(request.getEmail())
                .phone(request.getPhone())
                .outstandingBalance(request.getOutstandingBalance())
                .build();
                
        return customerRepository.save(customer);
    }

    @Transactional
    public Customer updateCustomer(String email, Long workspaceId, Long customerId, CustomerRequest request) {
        verifyAndGetWorkspace(email, workspaceId);
        Customer customer = customerRepository.findByIdAndWorkspaceId(customerId, workspaceId)
                .orElseThrow(() -> new IllegalArgumentException("Customer not found"));

        customer.setName(request.getName());
        customer.setEmail(request.getEmail());
        customer.setPhone(request.getPhone());
        customer.setOutstandingBalance(request.getOutstandingBalance());

        return customerRepository.save(customer);
    }

    @Transactional
    public void deleteCustomer(String email, Long workspaceId, Long customerId) {
        verifyAndGetWorkspace(email, workspaceId);
        Customer customer = customerRepository.findByIdAndWorkspaceId(customerId, workspaceId)
                .orElseThrow(() -> new IllegalArgumentException("Customer not found"));
        customerRepository.delete(customer);
    }

    // --- Vendor APIs ---

    public List<Vendor> getVendors(String email, Long workspaceId) {
        verifyAndGetWorkspace(email, workspaceId);
        return vendorRepository.findByWorkspaceId(workspaceId);
    }

    public Vendor getVendor(String email, Long workspaceId, Long vendorId) {
        verifyAndGetWorkspace(email, workspaceId);
        return vendorRepository.findByIdAndWorkspaceId(vendorId, workspaceId)
                .orElseThrow(() -> new IllegalArgumentException("Vendor not found in this workspace"));
    }

    @Transactional
    public Vendor createVendor(String email, Long workspaceId, VendorRequest request) {
        Workspace workspace = verifyAndGetWorkspace(email, workspaceId);
        
        Vendor vendor = Vendor.builder()
                .workspace(workspace)
                .name(request.getName())
                .email(request.getEmail())
                .phone(request.getPhone())
                .amountOwed(request.getAmountOwed())
                .build();
                
        return vendorRepository.save(vendor);
    }

    @Transactional
    public Vendor updateVendor(String email, Long workspaceId, Long vendorId, VendorRequest request) {
        verifyAndGetWorkspace(email, workspaceId);
        Vendor vendor = vendorRepository.findByIdAndWorkspaceId(vendorId, workspaceId)
                .orElseThrow(() -> new IllegalArgumentException("Vendor not found"));

        vendor.setName(request.getName());
        vendor.setEmail(request.getEmail());
        vendor.setPhone(request.getPhone());
        vendor.setAmountOwed(request.getAmountOwed());

        return vendorRepository.save(vendor);
    }

    @Transactional
    public void deleteVendor(String email, Long workspaceId, Long vendorId) {
        verifyAndGetWorkspace(email, workspaceId);
        Vendor vendor = vendorRepository.findByIdAndWorkspaceId(vendorId, workspaceId)
                .orElseThrow(() -> new IllegalArgumentException("Vendor not found"));
        vendorRepository.delete(vendor);
    }
}
