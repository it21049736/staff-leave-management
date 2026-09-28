package com.staffleave.service;

import com.staffleave.dto.UserUpsertDtos.CreateUserRequest;
import com.staffleave.dto.UserUpsertDtos.UpdateProfileRequest;
import com.staffleave.dto.UserUpsertDtos.UpdateUserRequest;
import com.staffleave.entity.Department;
import com.staffleave.entity.Role;
import com.staffleave.entity.User;
import com.staffleave.exception.BusinessRuleException;
import com.staffleave.repository.DepartmentRepository;
import com.staffleave.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final DepartmentRepository departmentRepository;
    private final PasswordEncoder passwordEncoder;

    public List<User> listAll() {
        return userRepository.findAll();
    }

    public User create(CreateUserRequest req) {
        if (userRepository.existsByUsername(req.getUsername())) {
            throw new BusinessRuleException("A user with that username already exists.");
        }
        User user = new User();
        user.setUsername(req.getUsername());
        user.setPassword(passwordEncoder.encode(req.getPassword()));
        user.setEmail(req.getEmail());
        user.setFirstName(req.getFirstName());
        user.setLastName(req.getLastName());
        user.setRole("admin".equalsIgnoreCase(req.getRole()) ? Role.ADMIN : Role.EMPLOYEE);
        user.setDesignation(req.getDesignation());
        user.setJoinedDate(LocalDate.now());
        user.setActive(true);
        if (req.getDepartment() != null) {
            Department dept = departmentRepository.findById(req.getDepartment())
                    .orElseThrow(() -> new BusinessRuleException("Department not found."));
            user.setDepartment(dept);
        }
        return userRepository.save(user);
    }

    public User update(Long id, UpdateUserRequest req) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new BusinessRuleException("User not found."));

        if (req.getEmail() != null) user.setEmail(req.getEmail());
        if (req.getFirstName() != null) user.setFirstName(req.getFirstName());
        if (req.getLastName() != null) user.setLastName(req.getLastName());
        if (req.getDesignation() != null) user.setDesignation(req.getDesignation());
        if (req.getIsActive() != null) user.setActive(req.getIsActive());
        if (req.getDepartment() != null) {
            Department dept = departmentRepository.findById(req.getDepartment())
                    .orElseThrow(() -> new BusinessRuleException("Department not found."));
            user.setDepartment(dept);
        }
        return userRepository.save(user);
    }

    public User updateProfile(User user, UpdateProfileRequest req) {
        if (req.getFirstName() != null) user.setFirstName(req.getFirstName());
        if (req.getLastName() != null) user.setLastName(req.getLastName());
        if (req.getEmail() != null) user.setEmail(req.getEmail());
        if (req.getDesignation() != null) user.setDesignation(req.getDesignation());
        return userRepository.save(user);
    }
}
