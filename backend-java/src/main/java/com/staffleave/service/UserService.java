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

import java.security.SecureRandom;
import java.time.LocalDate;
import java.util.List;

@Service
@RequiredArgsConstructor
public class UserService {

    private static final String TEMP_PASSWORD_ALPHABET =
            "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789"; // no 0/O/1/l/I - avoids misread-by-hand mistakes
    private static final SecureRandom RANDOM = new SecureRandom();

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

    /** Admin-triggered reset: generates a fresh random temporary password, stores its
     *  hash, and returns the plaintext once so the admin can hand it to the employee
     *  out-of-band (this app has no outbound email, so there's no "reset link" flow). */
    public String resetPassword(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new BusinessRuleException("User not found."));
        String tempPassword = generateTempPassword();
        user.setPassword(passwordEncoder.encode(tempPassword));
        userRepository.save(user);
        return tempPassword;
    }

    private String generateTempPassword() {
        StringBuilder sb = new StringBuilder(12);
        for (int i = 0; i < 12; i++) {
            sb.append(TEMP_PASSWORD_ALPHABET.charAt(RANDOM.nextInt(TEMP_PASSWORD_ALPHABET.length())));
        }
        return sb.toString();
    }
}
