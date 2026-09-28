package com.staffleave.controller;

import com.staffleave.dto.UserDto;
import com.staffleave.dto.UserUpsertDtos.CreateUserRequest;
import com.staffleave.dto.UserUpsertDtos.UpdateUserRequest;
import com.staffleave.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

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
    public UserDto create(@RequestBody CreateUserRequest req) {
        return UserDto.from(userService.create(req));
    }

    @PatchMapping("/{id}/")
    public UserDto update(@PathVariable Long id, @RequestBody UpdateUserRequest req) {
        return UserDto.from(userService.update(id, req));
    }
}
