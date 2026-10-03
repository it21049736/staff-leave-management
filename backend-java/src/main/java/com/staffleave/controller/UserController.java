package com.staffleave.controller;

import com.staffleave.dto.UserDto;
import com.staffleave.dto.UserUpsertDtos.CreateUserRequest;
import com.staffleave.dto.UserUpsertDtos.UpdateUserRequest;
import com.staffleave.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class UserController {

    private final UserService userService;

    @GetMapping("/")
    public List<UserDto> list() {
        return userService.listAll().stream().map(UserDto::from).toList();
    }

    @PostMapping("/")
    public UserDto create(@Valid @RequestBody CreateUserRequest req) {
        return UserDto.from(userService.create(req));
    }

    @PatchMapping("/{id}/")
    public UserDto update(@PathVariable Long id, @Valid @RequestBody UpdateUserRequest req) {
        return UserDto.from(userService.update(id, req));
    }

    @PostMapping("/{id}/reset-password/")
    public Map<String, String> resetPassword(@PathVariable Long id) {
        return Map.of("temp_password", userService.resetPassword(id));
    }
}
