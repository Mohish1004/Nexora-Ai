package com.nexora.ai.repository;

import com.nexora.ai.entity.Customer;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CustomerRepository extends JpaRepository<Customer, Long> {
    List<Customer> findByWorkspaceId(Long workspaceId);
    Optional<Customer> findByIdAndWorkspaceId(Long id, Long workspaceId);
}
