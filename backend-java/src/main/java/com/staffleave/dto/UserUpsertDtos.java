package com.staffleave.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

public class UserUpsertDtos {

    @Data
    public static class CreateUserRequest {
        @NotBlank(message = "Username is required.")
        private String username;

        @NotBlank(message = "Password is required.")
        @Size(min = 8, message = "Password must be at least 8 characters.")
        private String password;

        @Email(message = "Must be a valid email address.")
        private String email;

        private String firstName;
        private String lastName;
        private String role = "employee";
        private Long department;
        private String designation;
    }

    @Data
    public static class UpdateUserRequest {
        private String email;
        private String firstName;
        private String lastName;
        private Long department;
        private String designation;
        private Boolean isActive;
    }

    @Data
    public static class UpdateProfileRequest {
        private String firstName;
        private String lastName;
        private String email;
        private String designation;
    }
}
