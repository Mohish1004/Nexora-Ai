package com.finance.expenseanalyzer.service;

import com.finance.expenseanalyzer.model.RefreshToken;
import com.finance.expenseanalyzer.repository.RefreshTokenRepository;
import com.finance.expenseanalyzer.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional
public class RefreshTokenService {

    @Value("${app.jwtRefreshExpirationMs:864000000}") // 10 days default
    private Long refreshTokenDurationMs;

    private final RefreshTokenRepository refreshTokenRepository;
    private final UserRepository userRepository;

    @Transactional(readOnly = true)
    public Optional<RefreshToken> findByToken(String token) {
        return refreshTokenRepository.findByToken(token);
    }

    public RefreshToken createRefreshToken(Long userId) {
        var user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found with id: " + userId));

        // Reuse existing token if present and valid, otherwise delete and create new
        var existingTokenOpt = refreshTokenRepository.findByUser(user);
        if (existingTokenOpt.isPresent()) {
            var existing = existingTokenOpt.get();
            if (existing.getExpiryDate().isAfter(Instant.now())) {
                return existing;
            }
            refreshTokenRepository.delete(existing);
        }

        RefreshToken refreshToken = RefreshToken.builder()
                .user(user)
                .token(UUID.randomUUID().toString())
                .expiryDate(Instant.now().plusMillis(refreshTokenDurationMs))
                .build();

        return refreshTokenRepository.save(refreshToken);
    }

    public RefreshToken verifyExpiration(RefreshToken token) {
        if (token.getExpiryDate().compareTo(Instant.now()) < 0) {
            refreshTokenRepository.delete(token);
            throw new RuntimeException("Refresh token was expired. Please make a new signin request");
        }
        return token;
    }

    public int deleteByUserId(Long userId) {
        return userRepository.findById(userId)
                .map(user -> refreshTokenRepository.deleteByUser(user))
                .orElse(0);
    }
}
