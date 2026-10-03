package com.staffleave.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

public class UserUpsertDtos {

    @Data
    public static class CreateUserRequest {
        @NotBlank(message = "Username is required.")
        @Size(max = 150, message = "Username must be 150 characters or fewer.")
        private String username;

        @NotBlank(message = "Password is required.")
        @Size(min = 8, message = "Password must be at least 8 characters.")
        private String password;

        @Size(max = 254, message = "Email must be 254 characters or fewer.")
        @Email(message = "Must be a valid email address.")
        private String email;

        @Size(max = 150, message = "First name must be 150 characters or fewer.")
        private String firstName;

        @Size(max = 150, message = "Last name must be 150 characters or fewer.")
        private String lastName;

        private String role = "employee";
        private Long department;

        @Size(max = 100, message = "Designation must be 100 characters or fewer.")
        private String designation;
    }

    @Data
    public static class UpdateUserRequest {
        @Size(max = 254, message = "Email must be 254 characters or fewer.")
        @Email(message = "Must be a valid email address.")
        private String email;

        @Size(max = 150, message = "First name must be 150 characters or fewer.")
        private String firstName;

        @Size(max = 150, message = "Last name must be 150 characters or fewer.")
        private String lastName;

        private Long department;

        @Size(max = 100, message = "Designation must be 100 characters or fewer.")
        private String designation;

        private Boolean isActive;
    }

    @Data
    public static class UpdateProfileRequest {
        @Size(max = 150, message = "First name must be 150 characters or fewer.")
        private String firstName;

        @Size(max = 150, message = "Last name must be 150 characters or fewer.")
        private String lastName;

        @Size(max = 254, message = "Email must be 254 characters or fewer.")
        @Email(message = "Must be a valid email address.")
        private String email;

        @Size(max = 100, message = "Designation must be 100 characters or fewer.")
        private String designation;
    }
}
