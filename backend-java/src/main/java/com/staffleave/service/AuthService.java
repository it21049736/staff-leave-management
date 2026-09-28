package com.staffleave.service;

import com.staffleave.dto.AuthDtos;
import com.staffleave.dto.UserDto;
import com.staffleave.entity.User;
import com.staffleave.exception.BusinessRuleException;
import com.staffleave.repository.UserRepository;
import com.staffleave.security.JwtService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final AuthenticationManager authenticationManager;
    private final UserRepository userRepository;
    private final JwtService jwtService;
    private final PasswordEncoder passwordEncoder;

    public AuthDtos.LoginResponse login(String username, String password) {
        authenticationManager.authenticate(new UsernamePasswordAuthenticationToken(username, password));
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new BusinessRuleException("Invalid username or password."));

        String access = jwtService.generateAccessToken(user);
        String refresh = jwtService.generateRefreshToken(user);
        return new AuthDtos.LoginResponse(access, refresh, UserDto.from(user));
    }

    public AuthDtos.RefreshResponse refresh(String refreshToken) {
        if (!jwtService.isValid(refreshToken) || !jwtService.isRefreshToken(refreshToken)) {
            throw new BusinessRuleException("Invalid or expired refresh token.");
        }
        String username = jwtService.extractUsername(refreshToken);
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new BusinessRuleException("User no longer exists."));
        return new AuthDtos.RefreshResponse(jwtService.generateAccessToken(user));
    }

    public void changePassword(User user, String oldPassword, String newPassword) {
        if (!passwordEncoder.matches(oldPassword, user.getPassword())) {
            throw new com.staffleave.exception.FieldValidationException("old_password", "Current password is incorrect.");
        }
        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);
    }
}
