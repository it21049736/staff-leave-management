package com.staffleave.controller;

import com.staffleave.dto.AuthDtos.*;
import com.staffleave.dto.UserDto;
import com.staffleave.dto.UserUpsertDtos.UpdateProfileRequest;
import com.staffleave.security.CurrentUser;
import com.staffleave.service.AuthService;
import com.staffleave.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;
    private final UserService userService;
    private final CurrentUser currentUser;

    @PostMapping("/login/")
    public LoginResponse login(@Valid @RequestBody LoginRequest req) {
        return authService.login(req.getUsername(), req.getPassword());
    }

    @PostMapping("/refresh/")
    public RefreshResponse refresh(@Valid @RequestBody RefreshRequest req) {
        return authService.refresh(req.getRefresh());
    }

    @GetMapping("/me/")
    public UserDto me(Authentication authentication) {
        return UserDto.from(currentUser.get(authentication));
    }

    @PatchMapping("/me/")
    public UserDto updateMe(Authentication authentication, @Valid @RequestBody UpdateProfileRequest req) {
        return UserDto.from(userService.updateProfile(currentUser.get(authentication), req));
    }

    @PostMapping("/change-password/")
    public void changePassword(Authentication authentication, @Valid @RequestBody ChangePasswordRequest req) {
        authService.changePassword(currentUser.get(authentication), req.getOldPassword(), req.getNewPassword());
    }
}
