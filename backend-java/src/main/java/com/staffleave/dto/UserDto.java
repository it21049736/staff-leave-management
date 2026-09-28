package com.staffleave.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.staffleave.entity.Role;
import com.staffleave.entity.User;
import lombok.Data;

@Data
public class UserDto {
    private Long id;
    private String username;
    private String fullName;
    private String email;
    private Role role;
    private Long department;
    private String departmentName;
    private String designation;

    @JsonProperty("is_active")
    private boolean active;

    public static UserDto from(User u) {
        UserDto dto = new UserDto();
        dto.id = u.getId();
        dto.username = u.getUsername();
        dto.fullName = u.getFullName();
        dto.email = u.getEmail();
        dto.role = u.getRole();
        dto.department = u.getDepartment() != null ? u.getDepartment().getId() : null;
        dto.departmentName = u.getDepartment() != null ? u.getDepartment().getName() : null;
        dto.designation = u.getDesignation();
        dto.active = u.isActive();
        return dto;
    }
}
