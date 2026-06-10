package com.nexora.ai.aspect;

import com.nexora.ai.annotation.PremiumLimit;
import com.nexora.ai.entity.User;
import com.nexora.ai.repository.UserRepository;
import org.aspectj.lang.annotation.Aspect;
import org.aspectj.lang.annotation.Before;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Component;

@Aspect
@Component
public class SubscriptionAspect {

    private final UserRepository userRepository;

    public SubscriptionAspect(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @Before("@annotation(premiumLimit)")
    public void checkSubscription(PremiumLimit premiumLimit) {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        if (email == null || "anonymousUser".equals(email)) {
            throw new AccessDeniedException("Authentication is required to access this resource");
        }

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("User not found: " + email));

        int userTier = getTierWeight(user.getPlanType());
        int requiredTier = getTierWeight(premiumLimit.value());

        if (userTier < requiredTier) {
            throw new AccessDeniedException("This feature requires a " + premiumLimit.value() + " subscription plan.");
        }
    }

    private int getTierWeight(String planType) {
        if (planType == null) return 0;
        return switch (planType.toUpperCase()) {
            case "BUSINESS" -> 2;
            case "PRO" -> 1;
            default -> 0; // FREE
        };
    }
}
