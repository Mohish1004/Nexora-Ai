package com.nexora.ai.service;

import com.nexora.ai.entity.User;
import com.nexora.ai.entity.Workspace;
import com.nexora.ai.repository.UserRepository;
import com.nexora.ai.repository.WorkspaceRepository;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class WorkspaceService {

    private final WorkspaceRepository workspaceRepository;
    private final UserRepository userRepository;

    public WorkspaceService(WorkspaceRepository workspaceRepository, UserRepository userRepository) {
        this.workspaceRepository = workspaceRepository;
        this.userRepository = userRepository;
    }

    public List<Workspace> getUserWorkspaces(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("User not found"));
        return workspaceRepository.findByOwnerId(user.getId());
    }

    @Transactional
    public Workspace createWorkspace(String email, String name, String type) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("User not found"));
        
        Workspace workspace = Workspace.builder()
                .name(name)
                .type(type.toUpperCase())
                .owner(user)
                .build();
                
        return workspaceRepository.save(workspace);
    }

    public Workspace getWorkspaceForUser(String email, Long id) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("User not found"));
                
        return workspaceRepository.findByIdAndOwnerId(id, user.getId())
                .orElseThrow(() -> new IllegalArgumentException("Workspace not found or unauthorized"));
    }
}
