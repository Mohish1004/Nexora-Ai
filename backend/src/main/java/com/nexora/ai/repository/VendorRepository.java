package com.nexora.ai.repository;

import com.nexora.ai.entity.Vendor;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface VendorRepository extends JpaRepository<Vendor, Long> {
    List<Vendor> findByWorkspaceId(Long workspaceId);
    Optional<Vendor> findByIdAndWorkspaceId(Long id, Long workspaceId);
}
