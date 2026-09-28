package com.staffleave.security;

import com.staffleave.entity.User;
import com.staffleave.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Component;

/** Resolves the fully-loaded User entity for the currently authenticated request. */
@Component
@RequiredArgsConstructor
public class CurrentUser {

    private final UserRepository userRepository;

    public User get(Authentication authentication) {
        return userRepository.findByUsername(authentication.getName())
                .orElseThrow(() -> new IllegalStateException("Authenticated user no longer exists"));
    }
}
